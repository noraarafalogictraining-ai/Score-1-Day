/* =========================================================
   OMAR HASSAN — CANONICAL 2027 YEAR-END EVIDENCE REPOSITORY (server only)
   One fixed dataset for every participant. Participant-dependent records
   (January plan, mid-year conversation, manager actions) are NOT stored here:
   the browser adds them from the participant's own session.
   Released to the browser only through /api/yearend (December event).

   Provenance of each fact:
   - [E] established scenario fact (Phase 4 brief / former Pathway C dataset / mid-year emails)
   - [A] NEW scenario detail added for the registers — needs approval (see README)
   ========================================================= */
const VERSION = "2027.1";

/* ---------- Register 1: monthly reporting (reconciles to 12 scheduled, 9 on time, 3 late, 11/12 QA) ---------- */
/* [A] deadline rule: first working day of each month; on-time reports submitted on the deadline day.
   [E] late months and delays: June 2, August 3, October 2 working days; October needed a major correction. */
const MONTHS = [
  ["01", "January", "Mon 4 Jan 2027"], ["02", "February", "Mon 1 Feb 2027"], ["03", "March", "Mon 1 Mar 2027"], ["04", "April", "Thu 1 Apr 2027"],
  ["05", "May", "Mon 3 May 2027"], ["06", "June", "Tue 1 Jun 2027"], ["07", "July", "Thu 1 Jul 2027"], ["08", "August", "Mon 2 Aug 2027"],
  ["09", "September", "Wed 1 Sep 2027"], ["10", "October", "Fri 1 Oct 2027"], ["11", "November", "Mon 1 Nov 2027"], ["12", "December", "Wed 1 Dec 2027"]
];
const LATE = { "06": ["Thu 3 Jun 2027", 2], "08": ["Thu 5 Aug 2027", 3], "10": ["Tue 5 Oct 2027", 2] };
const REPORTING = MONTHS.map(([n, month, due]) => {
  const late = LATE[n], failed = n === "10";
  return {
    id: `MIR-2027-${n}`, month, due, submitted: late ? late[0] : due,
    timeliness: late ? `Late (${late[1]} working days)` : "On time",
    quality: failed ? "Major correction required" : "Passed without major corrections",
    revision: failed ? "Major correction after a rushed final check" : "None documented",
    escalation: late ? "No advance escalation documented" : "Not applicable",
    source: "Reporting tracker; QA review log"
  };
});

/* ---------- Register 2: commercial recommendations (5; 3 with action; 1 adopted, 1 under review, 3 not adopted) ---------- */
/* [E] totals and statuses; REC-03 = the Valtora pricing recommendation that was under review at mid-year.
   [A] dates, topics and findings of REC-01, 02, 04, 05; which record holds which status. Decision owners are not documented. */
const RECOMMENDATIONS = [
  { id: "REC-01", date: "15 Feb 2027", topic: "InsightIQ for existing FlowOps customers", finding: "Several FlowOps accounts show analytics needs that InsightIQ addresses.", action: "Yes: trial a bundled InsightIQ offer with selected FlowOps accounts.", status: "Not adopted", owner: "Not documented", ref: "Recommendation register" },
  { id: "REC-02", date: "19 Apr 2027", topic: "Customer360 renewals in the SME segment", finding: "SME renewal discussions increasingly raise price.", action: "No clearly defined next step.", status: "Not adopted", owner: "Not documented", ref: "Recommendation register" },
  { id: "REC-03", date: "11 Jun 2027", topic: "Response to Valtora's pricing", finding: "Matching Valtora's price across the board would put margin at risk.", action: "Yes: respond with value-based materials rather than a general price cut.", status: "Adopted (value-based response approved in September)", owner: "Not documented", ref: "Recommendation register; competitor analysis (QA passed)" },
  { id: "REC-04", date: "20 Sep 2027", topic: "Valtora contract terms", finding: "Valtora's customer terms vary by contract length and segment.", action: "No clearly defined next step.", status: "Not adopted", owner: "Not documented", ref: "Recommendation register" },
  { id: "REC-05", date: "15 Nov 2027", topic: "FlowOps pricing tiers for 2028", finding: "Mid-market customers compare FlowOps on total cost over the contract.", action: "Yes: test a two-tier FlowOps price structure for 2028.", status: "Under review", owner: "Not documented", ref: "Recommendation register" }
];

/* ---------- Register 3: stakeholder feedback [E] ---------- */
const FEEDBACK = [
  { period: "Q1 2027", score: 3.6 }, { period: "Q2 2027", score: 3.4 }, { period: "Q3 2027", score: 3.2 }, { period: "Q4 2027", score: 3.3 }
].map(x => ({ ...x, scale: "1–5", source: "Structured stakeholder feedback form (clarity, relevance, actionability)" }));
const COMMENTS = [  /* [E] year-end comments, H2 2027 */
  { who: "Nadine Farouk, Operations Director", text: "We still struggle to get practical options out of the analysis." },
  { who: "Youssef Ali, Business Development Manager", text: "Requests to Market Intelligence often stalled when deadlines clashed, and nobody knew which came first." },
  { who: "Salma Tarek, Sales Executive", text: "The contract-length finding would have helped earlier. We only heard about it in December." }
];

/* ---------- Register 4: stakeholder engagement ---------- */
const ENGAGEMENT = [
  { id: "ENG-01", when: "June 2027", meeting: "Valtora response discussion (cross-functional)", participants: "Omar Hassan, Nadine Farouk (others not documented)", purpose: "How NextWave could respond quickly to Valtora", behaviour: "When asked how to respond quickly, Omar mainly explained the data rather than practical options (Nadine Farouk, email).", outcome: "No agreed response recorded from the discussion.", followup: "None documented" },
  { id: "ENG-02", when: "July 2027", meeting: "Structured stakeholder consultation (called by Youssef Ali)", participants: "Youssef Ali, Omar Hassan (others not documented)", purpose: "Practical options for customer questions on Valtora pricing (per Youssef's request)", behaviour: "Not documented", outcome: "Consultation held.", followup: "No follow-up actions documented" },
  { id: "ENG-03", when: "September 2027", meeting: "Meeting with Nadine Farouk (Operations)", participants: "Omar Hassan, Nadine Farouk", purpose: "Not documented", behaviour: "Not documented", outcome: "Ended without agreed next steps.", followup: "None documented" }
];

/* ---------- Register 5: competitive intelligence [E] ---------- */
const INTELLIGENCE = [
  { id: "CI-01", when: "June 2027", item: "Requested Valtora competitor analysis", finding: "Risks of matching Valtora's lower price.", relevance: "Input to NextWave's response to Valtora.", channel: "Analysis report and cross-functional discussion", response: "Passed internal quality review. Related recommendation (REC-03) under review at mid-year; value-based response approved in September.", source: "QA review log; recommendation register" },
  { id: "CI-02", when: "July 2027", item: "Valtora discount condition", finding: "Valtora's advertised discount applies only to customers committing to 12-month contracts.", relevance: "Lets Sales compare offers like for like in customer conversations.", channel: "Email", response: "Not incorporated into Sales' customer response until December.", source: "Email record; Sales team feedback" }
];

/* ---------- Register 6: development (fixed records only) [E] ---------- */
const DEVELOPMENT = [
  { id: "DEV-F1", period: "August – December 2027", record: "Formal coaching or development activity", status: "None recorded after July", source: "HR learning and coaching records", note: "Absence of a record, not evidence of refusal." },
  { id: "DEV-F2", period: "December 2027", record: "Omar's self-assessment", status: "“I kept delivering the analysis. I don't think the year reflects the work I put in.”", source: "Year-end self-assessment", note: "" }
];

/* ---------- Observed behaviours [E] ---------- */
const BEHAVIOURS = [
  ["Analytical Thinking", "Reconciled conflicting Valtora pricing sources and identified the contract-length condition behind the discount (July)."],
  ["Business Acumen", "Recommendations focused on the analysis; business implications and proposed actions were often missing."],
  ["Communication", "Leadership briefings remained detailed and technical; findings were increasingly shared by email rather than discussed."],
  ["Stakeholder Management", "Fewer interactions with Operations after July; one meeting with Nadine ended without agreed next steps (September)."]
];

/* ---------- Business context (department results, not Omar's individual results) [E] ---------- */
const BUSINESS = {
  rows: [
    { measure: "Commercial win rate", pre: "32%", june: "24%", dec: "28%" },
    { measure: "Price-related objections", pre: "18%", june: "29%", dec: "24%" },
    { measure: "Qualified opportunities vs baseline", pre: "Baseline", june: "−12%", dec: "−6%" }
  ],
  response: "Value-based response approved in September: Customer360 onboarding bundle and value comparison materials; no general price cut.",
  metrics: { month: "December", win: 28, objections: 24, opps: -6 }
};

/* ---------- Summary repository: one record per measure, all traceable to a register ---------- */
const pct1 = (a, b) => Math.round(a / b * 1000) / 10;
const avg = (xs) => Math.round(xs.reduce((s, x) => s + x, 0) / xs.length * 1000) / 1000;
const onTime = REPORTING.filter(x => x.timeliness === "On time").length, passed = REPORTING.filter(x => x.quality.startsWith("Passed")).length;
const withAction = RECOMMENDATIONS.filter(x => x.action.startsWith("Yes")).length, adopted = RECOMMENDATIONS.filter(x => x.status.startsWith("Adopted")).length;
const q = FEEDBACK.map(x => x.score);
const R = (id, category, period, measure, actual, unit, source, relates, narrative, scope = "individual") => ({ id, category, period, dates: period, measure, actual, unit, source, relates, narrative, scope });
const SUMMARY = [
  R("EV-REP-01", "Reporting", "Jan – Dec 2027", "Monthly reports scheduled", "12", "reports", "Reporting tracker", "Reliable market intelligence", "All 12 reports were submitted (3 after the deadline)."),
  R("EV-REP-02", "Reporting", "Jan – Dec 2027", "Reports submitted on time", `${onTime} of 12 (${pct1(onTime, 12)}%)`, "reports / %", "Reporting tracker (Register 1)", "Reliable market intelligence · time management", "Deadline: first working day of each month."),
  R("EV-REP-03", "Reporting", "Jan – Dec 2027", "Reporting deadlines missed", `${12 - onTime} of 12 (${pct1(12 - onTime, 12)}%)`, "reports / %", "Reporting tracker (Register 1)", "Time management", "June (2 working days), August (3), October (2)."),
  R("EV-REP-04", "Reporting", "Jan – Dec 2027", "Reports passing quality review without major corrections", `${passed} of 12 (${pct1(passed, 12)}%)`, "reports / %", "QA review log (Register 1)", "Analysis quality", "October report needed a major correction after a rushed final check."),
  R("EV-REP-05", "Reporting", "Jan – Dec 2027", "Deadline conflicts escalated in advance", "0 of 3", "conflicts", "Reporting tracker; manager records", "Prioritisation and escalation", "No advance escalation documented for the three missed deadlines."),
  R("EV-REC-01", "Recommendations", "Jan – Dec 2027", "Evidence-based commercial recommendations submitted", String(RECOMMENDATIONS.length), "recommendations", "Recommendation register (Register 2)", "Actionable recommendations", ""),
  R("EV-REC-02", "Recommendations", "Jan – Dec 2027", "Recommendations including a proposed action", `${withAction} of ${RECOMMENDATIONS.length} (${pct1(withAction, RECOMMENDATIONS.length)}%)`, "recommendations / %", "Recommendation register (Register 2)", "Actionable recommendations · business acumen", "Two lacked clearly defined next steps."),
  R("EV-REC-03", "Recommendations", "Jan – Dec 2027", "Management decisions on recommendations", `${adopted} adopted, 1 under review, 3 not adopted (adoption ${pct1(adopted, RECOMMENDATIONS.length)}%)`, "recommendations / %", "Recommendation register (Register 2)", "Business outcome", "Adoption decisions are made by management.", "business"),
  R("EV-FB-01", "Stakeholder feedback", "Q1 – Q4 2027", "Stakeholder feedback by quarter", FEEDBACK.map(x => `${x.period.slice(0, 2)} ${x.score}`).join(" · "), "score (1–5)", "Structured stakeholder feedback (Register 3)", "Communication · stakeholder management", ""),
  R("EV-FB-02", "Stakeholder feedback", "2027", "Calculated averages (quarters weighted equally)", `H1 ${avg(q.slice(0, 2))} · H2 ${avg(q.slice(2))} · Year ${avg(q)}`, "score (1–5)", "Calculated from EV-FB-01", "Communication · stakeholder management", "No respondent counts are recorded."),
  R("EV-ENG-01", "Collaboration", "Jul – Dec 2027", "Structured stakeholder consultations documented in H2", "1 (July, called by Youssef Ali)", "consultations", "Consultation records (Register 4)", "Cross-functional collaboration", "No H1 consultation records. Informal communication is not recorded."),
  R("EV-ENG-02", "Collaboration", "Jul – Dec 2027", "Consultations with documented follow-up actions", "0 of 1", "consultations", "Action tracker (Register 4)", "Cross-functional collaboration", "Absence of documented actions, not proof that none occurred."),
  R("EV-CI-01", "Analytical contribution", "July 2027", "Valtora discount condition identified", "Qualitative", "—", "Competitive intelligence (Register 5)", "Analytical thinking", "Shared by email; used by Sales only in December."),
  R("EV-DEV-01", "Development", "Aug – Dec 2027", "Formal coaching or development activity after July", "None recorded", "—", "HR learning and coaching records (Register 6)", "Development", "Absence of a record."),
  R("EV-BIZ-01", "Business context", "Pre-launch → Dec 2027", "Commercial win rate", "32% → 24% → 28%", "%", "Commercial dashboard", "Department result", "Not an individual result.", "business"),
  R("EV-BIZ-02", "Business context", "Pre-launch → Dec 2027", "Price-related objections", "18% → 29% → 24%", "%", "Commercial dashboard", "Department result", "Lower is better. Not an individual result.", "business"),
  R("EV-BIZ-03", "Business context", "June → Dec 2027", "Qualified opportunities vs baseline", "−12% → −6%", "%", "Commercial dashboard", "Department result", "Not an individual result.", "business")
];

/* Reconciliation guard: the detailed registers must match the approved totals. */
(function reconcile() {
  const fail = (m) => { throw new Error("Evidence repository does not reconcile: " + m); };
  if (REPORTING.length !== 12 || onTime !== 9 || passed !== 11) fail("reporting");
  if (RECOMMENDATIONS.length !== 5 || withAction !== 3 || adopted !== 1 || RECOMMENDATIONS.filter(x => x.status === "Under review").length !== 1 || RECOMMENDATIONS.filter(x => x.status === "Not adopted").length !== 3) fail("recommendations");
  if (avg(q.slice(2)) !== 3.25) fail("feedback");
})();

const DATASET = {
  version: VERSION, title: "Year-End Performance Record 2027 — Omar Hassan", asOf: "Wed 1 Dec 2027",
  summary: SUMMARY, registers: { reporting: REPORTING, recommendations: RECOMMENDATIONS, feedback: FEEDBACK, comments: COMMENTS, engagement: ENGAGEMENT, intelligence: INTELLIGENCE, development: DEVELOPMENT, behaviours: BEHAVIOURS },
  business: BUSINESS,
  company: { label: "Department results — context, not individual performance", metrics: BUSINESS.metrics }   /* used by the dashboard */
};

/* Plain-text version for the AI prompts (Omar, assessors) */
function evidenceText() {
  const L = [];
  L.push("Summary (fixed, same for every manager):"); SUMMARY.forEach(x => L.push(`- ${x.id} ${x.measure}: ${x.actual}${x.narrative ? ` — ${x.narrative}` : ""}${x.scope === "business" ? " [business result]" : ""}`));
  L.push("Monthly reports:"); REPORTING.forEach(x => L.push(`- ${x.month}: due ${x.due}, submitted ${x.submitted}, ${x.timeliness}; ${x.quality}${x.escalation !== "Not applicable" ? `; ${x.escalation}` : ""}`));
  L.push("Recommendations:"); RECOMMENDATIONS.forEach(x => L.push(`- ${x.id} (${x.date}) ${x.topic}: ${x.finding} Action: ${x.action} Status: ${x.status}.`));
  L.push("Stakeholder comments (H2):"); COMMENTS.forEach(x => L.push(`- ${x.who}: "${x.text}"`));
  L.push("Engagement:"); ENGAGEMENT.forEach(x => L.push(`- ${x.when} ${x.meeting}: ${x.behaviour !== "Not documented" ? x.behaviour + " " : ""}${x.outcome} Follow-up: ${x.followup}.`));
  L.push("Competitive intelligence:"); INTELLIGENCE.forEach(x => L.push(`- ${x.when} ${x.item}: ${x.finding} Shared via ${x.channel}. ${x.response}`));
  L.push("Observed behaviours:"); BEHAVIOURS.forEach(([k, v]) => L.push(`- ${k}: ${v}`));
  L.push("Development:"); DEVELOPMENT.forEach(x => L.push(`- ${x.record}: ${x.status}`));
  L.push(`Department results (context only, not individual evidence): ${BUSINESS.rows.map(r => `${r.measure} ${r.pre} → ${r.june} (June) → ${r.dec} (December)`).join("; ")}. ${BUSINESS.response}`);
  return L.join("\n");
}

module.exports = { VERSION, DATASET, evidenceText };
