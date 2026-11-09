/* POST /api/assess — structured assessment against the rubric, plus rule-engine outcomes.
   { task: "plan"|"alignment"|"round2"|"bias"|"round3", payload: {...} } */
const H = require("./_lib/http");
const AI = require("./_lib/ai");
const PR = require("./_lib/prompts");
const RB = require("./_lib/rubrics");
const MOCK = require("./_lib/mock");

function input(taskName, p) {
  p = p || {};
  if (taskName === "plan") return { plan: H.cleanPlan(p.plan) };
  if (taskName === "alignment") return { plan: H.cleanPlan(p.plan), history: H.cleanHistory(p.history) };
  if (taskName === "round2") return { plan: H.cleanPlan(p.plan), history: H.cleanHistory(p.history), evidence: H.cleanEvidence(p.evidence), interpretation: H.str(p.interpretation, H.LIMITS.longText) };
  if (taskName === "bias") return { appraisal: H.cleanAppraisal(p.appraisal), history: H.cleanHistory(p.history), pathway: H.pathwayOf(p.pathway) };
  if (taskName === "round3") return { appraisal: H.cleanAppraisal(p.appraisal), history: H.cleanHistory(p.history), pathway: H.pathwayOf(p.pathway), reflection: H.str(p.reflection, H.LIMITS.longText), bias: H.str(p.bias, H.LIMITS.longText) };
  throw new H.BadInput("Unknown assessment.");
}
/* Inputs that cannot earn points regardless of the model's view */
function hardZero(taskName, inp, c) {
  if (taskName === "plan" && !inp.plan.objectives.length && c.group === "r1_kpi") return "No objectives were submitted.";
  if (taskName === "plan" && !inp.plan.comps.length && c.group === "r1_comp") return "No competencies were submitted.";
  if (taskName === "round2" && c.group === "r2_data" && inp.interpretation.trim().length < 15) return "No interpretation of the business data was submitted.";
  if (taskName === "round2" && c.group === "r2_log" && !inp.evidence.length) return "No Evidence Log entries were submitted.";
  if (taskName === "round2" && (c.group === "r2_diag" || c.group === "r2_coach") && !inp.history.some(m => m.from === "manager")) return "No conversation took place.";
  if (taskName === "round3" && c.id === "r3_conv_bias" && inp.reflection.trim().length < 15) return "No bias reflection was written.";
  return null;
}

module.exports = H.handler(async (body) => {
  const taskName = body.task;
  const inp = input(taskName, body.payload);
  if ((taskName === "bias" || taskName === "round3") && !inp.pathway) throw new H.BadInput("Year-end evidence is missing.");
  const provider = AI.provider();
  if (provider === "unavailable") throw Object.assign(new Error("AI assessment is unavailable: no AI provider is configured on the server."), { code: "ai_unavailable", status: 503 });
  const t = PR.task(taskName, inp);
  const raw = provider === "mock" ? MOCK.assess(taskName, inp) : await AI.assessJSON({ system: PR.ASSESSOR, user: t.user, schema: t.schema, effort: "medium" });

  if (taskName === "bias") {
    const flags = (raw.flags || []).slice(0, 6).map(f => ({ bias: f.bias, evidence: String(f.evidence || ""), explanation: String(f.explanation || "") }));
    const [checked] = AI.verifyQuotes([{ evidence: flags.map(f => f.evidence) }], t.corpus);
    const grounded = flags.filter(f => checked.evidence.includes(f.evidence.trim()));
    return { provider, flags: grounded, overlooked: (raw.overlooked || []).slice(0, 5), overemphasized: (raw.overemphasized || []).slice(0, 5), summary: String(raw.summary || ""), ungrounded_removed: flags.length - grounded.length };
  }
  let criteria = AI.normalise(t.defs, raw.criteria);
  criteria = AI.verifyQuotes(criteria, t.corpus);
  for (const c of criteria) { const z = hardZero(taskName, inp, c); if (z) { c.score = 0; c.evidence = []; c.reason = z; c.confidence = "high"; c.missing = z; } }
  const totals = AI.groupTotals(criteria);
  const cls = raw.classification || {};
  const out = { provider, criteria, totals, feedback: raw.feedback || {}, classification: cls, events: [] };
  if (taskName === "alignment") { const e = RB.RULES.alignmentEvent(cls.behaviour); if (e) out.events.push(e); }
  if (taskName === "round2") {
    out.pathway = RB.RULES.pathway(totals, cls);
    const e = RB.RULES.coachingEvent(totals, cls); if (e) out.events.push(e);
  }
  if (taskName === "round3") { const e = RB.RULES.appraisalEvent(cls.appraisal); if (e) out.events.push(e); }
  return out;
});
