/* POST /api/assess — structured assessment against the rubric, plus rule-engine outcomes.
   { task: "plan"|"alignment"|"round2"|"bias"|"round3", payload: {...} } */
const H = require("./_lib/http");
const AI = require("./_lib/ai");
const PR = require("./_lib/prompts");
const RB = require("./_lib/rubrics");
const MOCK = require("./_lib/mock");
const SC = require("./_lib/scenario_omar");

function input(taskName, p) {
  p = p || {};
  if (taskName === "plan") return { plan: H.cleanPlan(p.plan) };
  if (taskName === "alignment") return { plan: H.cleanPlan(p.plan), history: H.cleanHistory(p.history) };
  if (taskName === "round2") return { plan: H.cleanPlan(p.plan), history: H.cleanHistory(p.history), evidence: H.cleanEvidence(p.evidence), interpretation: H.str(p.interpretation, H.LIMITS.longText) };
  if (taskName === "bias") return { appraisal: H.cleanAppraisal(p.appraisal), history: H.cleanHistory(p.history), pathway: H.pathwayOf(p.pathway) };
  if (taskName === "sbii") return { appraisal: H.cleanAppraisal(p.appraisal), history: H.cleanHistory(p.history), pathway: H.pathwayOf(p.pathway), priorLogs: H.cleanPriorLogs(p.priorLogs), prior: null, completed: !!p.completed };
  if (taskName === "round3") return { sbii: sbiiIn(p.sbii), appraisal: H.cleanAppraisal(p.appraisal), history: H.cleanHistory(p.history), pathway: H.pathwayOf(p.pathway), reflection: H.str(p.reflection, H.LIMITS.longText), bias: H.str(p.bias, H.LIMITS.longText) };
  throw new H.BadInput("Unknown assessment.");
}
/* SBII scores carried into the final assessment (0–2 each, clamped) */
function sbiiIn(x) {
  if (!x || typeof x !== "object") return null;
  const out = {}; for (const c of SC.SBII) out[c.id] = H.int(x[c.id], 0, 2) || 0;
  return out;
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

/* Deterministic SBII scoring from the structured AI output */
function sbiiResult(raw, inp, corpus) {
  const got = new Map((raw.criteria || []).map(c => [c.id, c])), hay = corpus;
  const noTalk = !inp.history.some(m => m.from === "manager");
  const criteria = SC.SBII.map(d => {
    const c = got.get(d.id) || {};
    let score = Math.max(0, Math.min(2, Math.round(Number(c.score) || 0)));
    const [v] = AI.verifyQuotes([{ evidence: Array.isArray(c.evidence) ? c.evidence.slice(0, 3) : [] }], hay);
    let reason = String(c.reason || "").slice(0, 600);
    if (score === 2 && !v.evidence.length) { score = 1; reason += " (Reduced to 1: no verifiable quote from your messages.)"; }
    if (noTalk) { score = 0; reason = "No conversation took place."; }
    return { id: d.id, label: d.label, max: 2, score, evidence: v.evidence, reason: reason || (got.has(d.id) ? "" : "Not assessed.") };
  });
  const scores = Object.fromEntries(criteria.map(c => [c.id, c.score]));
  const total = criteria.reduce((a, c) => a + c.score, 0);
  const k = raw.classification || {}, cls = { personality_labels: !!k.personality_labels, unsupported_blame: !!k.unsupported_blame, praise_only: !!k.praise_only, ignored_explanation: !!k.ignored_explanation };
  const fb = raw.feedback || {};
  return { criteria, scores, total, max: 12, points: RB.RULES.sbiiPoints(total), completed: inp.completed, classification: cls,
    events: noTalk ? [] : RB.RULES.feedbackEvents(scores, cls, inp.completed),
    feedback: { summary: String(fb.summary || ""), strengths: String(fb.strengths || ""), improve: String(fb.improve || "") } };
}
function sbiiCriterion(s) {
  const d = RB.ALL.find(c => c.id === "r3_conv_feedback");
  if (!s) return { id: d.id, group: d.group, label: d.label, max: d.max, score: 0, evidence: [], reason: "The appraisal conversation was not assessed.", confidence: "high", missing: "Conversation assessment missing." };
  const total = SC.SBII.reduce((a, c) => a + s[c.id], 0);
  return { id: d.id, group: d.group, label: d.label, max: d.max, score: RB.RULES.sbiiPoints(total), evidence: [],
    reason: `Conversation assessment ${total}/12 (${SC.SBII.map(c => `${c.label} ${s[c.id]}/2`).join(", ")}) → ${RB.RULES.sbiiPoints(total)}/${d.max} points.`, confidence: "high", missing: "" };
}
module.exports = H.handler(async (body) => {
  const taskName = body.task;
  const inp = input(taskName, body.payload);
  if (["bias", "round3", "sbii"].includes(taskName) && !inp.pathway) throw new H.BadInput("Year-end evidence is missing.");
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
  if (taskName === "sbii") return { provider, ...sbiiResult(raw, inp, t.corpus) };
  let criteria = AI.normalise(t.defs, raw.criteria);
  criteria = AI.verifyQuotes(criteria, t.corpus);
  for (const c of criteria) { const z = hardZero(taskName, inp, c); if (z) { c.score = 0; c.evidence = []; c.reason = z; c.confidence = "high"; c.missing = z; } }
  if (taskName === "round3") criteria.push(sbiiCriterion(inp.sbii));
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
