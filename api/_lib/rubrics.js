/* =========================================================
   SCORE PILOT — ASSESSMENT RUBRICS & RULES (server only)
   Provisional pilot weights: Round 1 = 35, Round 2 = 40, Round 3 = 25 (total 100).
   Change the `max` values here; the totals are computed from them.
   ========================================================= */

const GROUPS = [
  /* ROUND 1 */
  { id: "r1_kpi", round: 1, label: "Objectives and KPI quality", task: "plan", criteria: [
    { id: "r1_kpi_relevance", max: 3, label: "Relevance to Omar's responsibilities", desc: "Objectives reflect the Market Intelligence Analyst role and its main purpose." },
    { id: "r1_kpi_clarity", max: 2, label: "Clarity of objectives", desc: "Each objective states clearly what must be achieved." },
    { id: "r1_kpi_measurable", max: 3, label: "Measurability and specificity", desc: "KPIs can be measured unambiguously; what counts as success is specific." },
    { id: "r1_kpi_target", max: 2, label: "Reasonableness of targets", desc: "Targets are realistic given Omar's track record (e.g. 11/12 on time, 95% quality, 6 recommendations) yet meaningful." },
    { id: "r1_kpi_control", max: 3, label: "Controllability / influence", desc: "Omar can materially influence each KPI. KPIs that make him solely accountable for senior-management decisions (e.g. % of recommendations adopted) are NOT rewarded." },
    { id: "r1_kpi_evidence", max: 2, label: "Verifiable evidence", desc: "Each evidence source is credible and would actually show the KPI result." },
    { id: "r1_kpi_review", max: 2, label: "Appropriate review frequency", desc: "Review rhythm suits how fast each KPI moves (monthly reporting, quarterly recommendations/feedback)." },
    { id: "r1_kpi_balance", max: 3, label: "Logical weighting and overall balance", desc: "Weights total 100%, reflect priorities, and the plan balances reliable delivery, actionable recommendations and stakeholder communication/collaboration." }
  ] },
  { id: "r1_comp", round: 1, label: "Competency selection and expectations", task: "plan", criteria: [
    { id: "r1_comp_relevance", max: 3, label: "Role relevance", desc: "Selected competencies matter for the role (reference set: Analytical Thinking, Business Acumen, Communication, Stakeholder Management; other relevant choices accepted)." },
    { id: "r1_comp_level", max: 3, label: "Appropriateness of expected levels", desc: "Expected proficiency levels fit the role and Omar's tenure (reference: Analytical Thinking Advanced; others Intermediate). Selecting Advanced everywhere is not automatically better." },
    { id: "r1_comp_clarity", max: 2, label: "Clarity of behavioural expectations", desc: "Any behavioural standards added are observable; levels are used as expectations, not as performance ratings." },
    { id: "r1_comp_alignment", max: 2, label: "Alignment with responsibilities and development needs", desc: "The plan covers Omar's development needs (business-friendly communication, stakeholder concerns, influence without defensiveness, prioritisation and escalation)." }
  ] },
  { id: "r1_align", round: 1, label: "Employee alignment conversation", task: "alignment", criteria: [
    { id: "r1_align_ack", max: 1, label: "Acknowledges Omar's concern", desc: "Recognises the fairness concern without dismissing it." },
    { id: "r1_align_clarify", max: 2, label: "Clarifies the evaluation basis", desc: "Explains that recommendations are evaluated on quality, relevance, communication and actionability, and that adoption decisions are not fully in Omar's control (or adjusts the plan accordingly)." },
    { id: "r1_align_realistic", max: 1, label: "Honest and realistic", desc: "Avoids empty reassurance or promises the manager cannot keep; is specific about how it will work." },
    { id: "r1_align_shared", max: 1, label: "Reaches shared understanding", desc: "Checks understanding and agrees next steps professionally and concisely." }
  ] },
  /* ROUND 2 */
  { id: "r2_data", round: 2, label: "Business data interpretation", task: "round2", criteria: [
    { id: "r2_data_accuracy", max: 2, label: "Accurate reading of the data", desc: "Interpretation uses the dashboard figures correctly (opportunities −12%, objections 18%→29%, win rate 32%→24%, Valtora in 35% of discussions, June drop)." },
    { id: "r2_data_separate", max: 2, label: "Separates business outcomes from individual performance", desc: "Does not attribute the market decline to Omar; distinguishes company/department results from Omar's own evidence (analysis delivered and passed QA; June report 2 days late)." },
    { id: "r2_data_caution", max: 1, label: "Evidence-based caution", desc: "Notes what the data does not show and what needs investigating." }
  ] },
  { id: "r2_diag", round: 2, label: "Performance gap diagnosis", task: "round2", criteria: [
    { id: "r2_diag_expect", max: 3, label: "Clear expectations explored", desc: "Investigates whether Omar knew there was a problem, whether expectations/priorities were clear after Valtora, and whether he understood them." },
    { id: "r2_diag_situ", max: 3, label: "Situational constraints explored", desc: "Investigates time, competing deadlines, authority to reprioritise, conflicting directives, tools and support." },
    { id: "r2_diag_conseq", max: 3, label: "Consequences and recognition explored", desc: "Explores whether good work is discouraged or unrecognised (Omar's fairness perception) and whether the manager's own practices contributed, without simply accepting or dismissing it." },
    { id: "r2_diag_skills", max: 3, label: "Skills and abilities considered fairly", desc: "Recognises strong analytical skills and track record; identifies specific development areas (communication, influence, prioritisation/escalation) without assuming a general skill deficit." },
    { id: "r2_diag_conclude", max: 3, label: "Evidence-based conclusions", desc: "Distinguishes facts, stakeholder perceptions (incl. Mariam's secondhand account), Omar's account and own assumptions; reaches conclusions supported by what was learned; does not blame Omar or Nadine." }
  ] },
  { id: "r2_coach", round: 2, label: "Coaching and intervention", task: "round2", criteria: [
    { id: "r2_coach_involve", max: 3, label: "Employee involvement", desc: "Asks Omar what he could do differently and builds the plan with him rather than dictating." },
    { id: "r2_coach_priorities", max: 3, label: "Expectations, priorities and escalation", desc: "Reconfirms deadlines, agrees how urgent requests are prioritised and how deadline conflicts will be escalated." },
    { id: "r2_coach_comm", max: 3, label: "Coaching on stakeholder communication", desc: "Helps Omar present concise, actionable options and explore stakeholder concerns; may arrange a constructive follow-up with Nadine and Sales. Does not ask him to stop challenging leadership." },
    { id: "r2_coach_support", max: 3, label: "Manager support and recognition", desc: "Recognises the value of Omar's analysis and commits to specific support (not vague reassurance or generic training)." },
    { id: "r2_coach_followup", max: 3, label: "Concrete actions and follow-up", desc: "Agrees specific actions, owners and review checkpoints." }
  ] },
  { id: "r2_log", round: 2, label: "Evidence Log", task: "round2", criteria: [
    { id: "r2_log_factual", max: 2, label: "Factual and specific", desc: "Entries describe observable facts (what, when, result) rather than personality judgements; perceptions are labelled as such (e.g. Mariam's account)." },
    { id: "r2_log_relevance", max: 1, label: "Relevant with sources", desc: "Entries relate to the plan's objectives/competencies and name credible sources." },
    { id: "r2_log_balance", max: 1, label: "Balanced", desc: "Records positive and negative evidence (e.g. analysis passed QA AND June report late)." },
    { id: "r2_log_followup", max: 1, label: "Clear follow-up", desc: "Manager actions/follow-ups are specific." }
  ] },
  /* ROUND 3 */
  { id: "r3_what", round: 3, label: "WHAT evaluation", task: "round3", criteria: [
    { id: "r3_what_grounded", max: 4, label: "Ratings grounded in available evidence", desc: "Each objective rating is supported by the year-end evidence actually available." },
    { id: "r3_what_limits", max: 2, label: "Limitations identified", desc: "Where the KPI does not match the available evidence, the manager notes the limitation instead of inventing results." },
    { id: "r3_what_balance", max: 2, label: "Recognises results and gaps", desc: "Acknowledges positive results and documented gaps; does not penalise non-adoption of sound recommendations." },
    { id: "r3_what_overall", max: 2, label: "Defensible overall WHAT", desc: "Overall WHAT rating follows from the objective ratings and weights." }
  ] },
  { id: "r3_how", round: 3, label: "HOW evaluation", task: "round3", criteria: [
    { id: "r3_how_behaviour", max: 2, label: "Uses behavioural evidence", desc: "Competency ratings cite observed behaviours, not traits." },
    { id: "r3_how_levels", max: 2, label: "Expected level vs rating", desc: "Distinguishes the expected proficiency level from the 1–5 performance rating against it." },
    { id: "r3_how_balance", max: 1, label: "Balanced", desc: "Recognises strengths (analysis) and gaps (communication/stakeholder) fairly." }
  ] },
  { id: "r3_overall", round: 3, label: "Overall rating and justification", task: "round3", criteria: [
    { id: "r3_overall_defensible", max: 2, label: "Defensible overall rating", desc: "The overall rating is consistent with WHAT, HOW and the evidence; not anchored on the previous 4/5." },
    { id: "r3_overall_justify", max: 2, label: "Evidence-based justification", desc: "The justification cites specific evidence from the whole year." },
    { id: "r3_overall_specific", max: 1, label: "Specific strengths and development priorities", desc: "Strengths and priorities are specific and actionable." }
  ] },
  { id: "r3_conv", round: 3, label: "Appraisal conversation and bias reflection", task: "round3", criteria: [
    { id: "r3_conv_explain", max: 2, label: "Explains the rating with evidence", desc: "In the conversation, explains ratings using evidence." },
    { id: "r3_conv_listen", max: 1, label: "Listens and responds to concerns", desc: "Engages with Omar's reaction and concerns." },
    { id: "r3_conv_forward", max: 1, label: "Development focus", desc: "Discusses development and next steps." },
    { id: "r3_conv_bias", max: 1, label: "Honest bias reflection", desc: "The participant's reflection engages honestly with possible biases grounded in their own reasoning." }
  ] }
];

const ALL = GROUPS.flatMap(g => g.criteria.map(c => ({ ...c, group: g.id, round: g.round, task: g.task })));
const byTask = (task) => ALL.filter(c => c.task === task);
function summary() {
  return GROUPS.map(g => ({ id: g.id, round: g.round, label: g.label, max: g.criteria.reduce((a, c) => a + c.max, 0), criteria: g.criteria.map(c => ({ id: c.id, label: c.label, max: c.max })) }));
}
function rubricText(task) {
  return GROUPS.filter(g => g.task === task).map(g => `## ${g.label}\n` + g.criteria.map(c => `- ${c.id} (0-${c.max}): ${c.label}. ${c.desc}`).join("\n")).join("\n\n");
}

/* Deterministic rules (pilot values) */
const RULES = {
  /* Round 2 pathway from diagnosis (max 15) + coaching (max 15) and behaviour flags */
  pathway(scores, flags) {
    const d = scores.r2_diag || 0, c = scores.r2_coach || 0;
    if (flags.blaming || d + c < 12) return "C";
    if (d >= 10 && c >= 10) return "A";
    return "B";
  },
  coachingEvent(scores, flags) {
    if (flags.blaming) return "punitive";
    if (flags.constructive && (scores.r2_coach || 0) >= 9) return "constructive";
    return null;
  },
  alignmentEvent(cls) { return cls === "fair" ? "fair_alignment" : cls === "dismissive" ? "dismissive_alignment" : null; },
  appraisalEvent(cls) { return cls === "fair" ? "fair_appraisal" : cls === "unfair" ? "unfair_appraisal" : null; }
};

module.exports = { GROUPS, ALL, byTask, summary, rubricText, RULES };
