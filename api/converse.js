/* POST /api/converse — Omar's next message.
   { kind: "alignment"|"diagnostic"|"appraisal", history: [{from, text}], context: { plan, pulse, prior, appraisal, pathway } } */
const H = require("./_lib/http");
const AI = require("./_lib/ai");
const PR = require("./_lib/prompts");
const SC = require("./_lib/scenario_omar");
const MOCK = require("./_lib/mock");

/* Deterministic: completion and Omar's stance from the structured reading of the manager's messages */
function appraisalStance(v) {
  const f = v.so_far || {}, l = v.latest || {}, S = SC.APPRAISAL.stance;
  const complete = !!(f.appraisal_discussed && f.evidence_based_feedback && f.strengths_and_gaps && f.perspective_explored && f.development_agreement === "specific") && !l.unsupported_blame && !l.personality_label;
  const stance = l.personality_label ? S.label : l.unsupported_blame ? S.blame : l.ignored_explanation ? S.ignored : complete ? S.complete
    : l.wrapping_up ? S.closing_early : l.vague_development ? S.vague_plan : l.vague_feedback ? S.vague : l.praise_only ? S.praise : null;
  return { complete, stance };
}
module.exports = H.handler(async (body) => {
  const kind = body.kind;
  if (!["alignment", "diagnostic", "appraisal"].includes(kind)) throw new H.BadInput("Unknown conversation.");
  const history = H.cleanHistory(body.history);
  const c = body.context || {};
  const ctx = {
    plan: H.cleanPlan(c.plan),
    pulse: { performance: H.int((c.pulse || {}).performance, 0, 100), trust: H.int((c.pulse || {}).trust, 0, 100), development: H.int((c.pulse || {}).development, 0, 100) },
    prior: { alignment: ["fair", "mixed", "dismissive"].includes((c.prior || {}).alignment) ? c.prior.alignment : null, coaching: ["constructive", "punitive", "neutral"].includes((c.prior || {}).coaching) ? c.prior.coaching : null, alignmentSummary: H.str((c.prior || {}).alignmentSummary, 1500), coachingSummary: H.str((c.prior || {}).coachingSummary, 2500) },
    appraisal: kind === "appraisal" ? H.cleanAppraisal(c.appraisal) : null,
    pathway: H.pathwayOf(c.pathway),
    priorLogs: kind === "appraisal" ? H.cleanPriorLogs(c.priorLogs) : null,
    evidence: kind === "appraisal" ? H.cleanEvidence(c.evidence) : []
  };
  const last = history[history.length - 1];
  if (kind !== "appraisal" && (!last || last.from !== "manager")) throw new H.BadInput("The last message must be the manager's.");
  if (kind === "appraisal" && !history.length) return { provider: AI.provider(), reply: SC.APPRAISAL.opening, complete: false };   /* fixed, neutral opening */
  if (kind === "appraisal" && last.from !== "manager") throw new H.BadInput("The last message must be the manager's.");
  if (kind === "appraisal" && !ctx.pathway) throw new H.BadInput("Year-end evidence is missing.");
  if (history[0] && history[0].from === "employee") {
    const expected = kind === "alignment" ? SC.ALIGNMENT.opening : kind === "diagnostic" ? SC.DIAGNOSTIC.opening : SC.APPRAISAL.opening;
    if (history[0].text.trim() !== expected.trim()) throw new H.BadInput("The conversation history does not match the scenario.");
  }

  const provider = AI.provider();
  if (provider === "unavailable") throw Object.assign(new Error("Live AI conversations are unavailable: no AI provider is configured on the server."), { code: "ai_unavailable", status: 503 });
  if (provider === "mock") return { provider, ...MOCK.converse(kind, history, ctx) };

  let ready = false, dismissive = false, stance = null;
  if (kind === "alignment") {
    const t = PR.task("alignment_turn", { plan: ctx.plan, history });
    const v = await AI.assessJSON({ system: PR.ASSESSOR, user: t.user, schema: t.schema, effort: "low" });
    ready = !!v.concern_addressed; dismissive = !!v.dismissive && !ready;
    stance = ready ? SC.ALIGNMENT.stance.ready : dismissive ? SC.ALIGNMENT.stance.guarded : SC.ALIGNMENT.stance.open;
  }
  let complete = false;
  if (kind === "appraisal") {
    const t = PR.task("appraisal_turn", { appraisal: ctx.appraisal, pathway: ctx.pathway, history });
    const v = await AI.assessJSON({ system: PR.ASSESSOR, user: t.user, schema: t.schema, effort: "low" });
    ({ complete, stance } = appraisalStance(v));
  }
  const reply = await AI.employeeReply({ system: PR.omarSystem(kind, ctx), history, stance });
  return { provider, reply, ready, dismissive, complete };
});
