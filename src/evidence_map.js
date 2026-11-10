/* =========================================================
   KPI → EVIDENCE MATCHING (deterministic, auditable)
   Maps each KPI (parsed from the January text) to the kind of record that
   will exist at year-end. Holds measure DEFINITIONS and record IDs only:
   no year-end values (those stay on the server until December).
   Order matters: the first matching rule wins.
   ========================================================= */
const EVIDENCE_MEASURES = [
  { id: "rep_escalate", label: "Deadline conflicts escalated in advance", rx: /(escalat|flag(s|ged)?|raise[ds]?)\b.{0,40}(deadline|conflict|risk|priorit)|(deadline|conflict)s?.{0,40}(escalat|flag)/, refs: ["EV-REP-05", "Register 1"], units: ["count", "pct"] },
  { id: "rep_late", label: "Reporting deadlines missed", rx: /(late|missed|overdue|delayed)\b.{0,30}(report|deadline|deliver)|(report|deadline|deliver)\w*.{0,30}\b(late|missed|overdue)/, refs: ["EV-REP-03", "Register 1"], units: ["count", "pct"], dir: "lower" },
  { id: "rep_quality", label: "Reports passing quality review", rx: /(quality|\bqa\b|pass(ing|ed|es)?\b.{0,20}review|without (major )?correction|error[- ]free)/, refs: ["EV-REP-04", "Register 1"], units: ["count", "pct"], max: 12 },
  { id: "rep_ontime", label: "Reports submitted on time", rx: /(on[- ]time|timel|by the deadline|before the deadline|within the deadline)/, refs: ["EV-REP-02", "Register 1"], units: ["count", "pct"], max: 12 },
  { id: "rep_count", label: "Monthly reports submitted", rx: /\breports?\b/, refs: ["EV-REP-01", "Register 1"], units: ["count", "pct"], max: 12 },
  { id: "rec_adopt", label: "Management decisions on recommendations", rx: /recommend.{0,60}(adopt|accept|approv|implement)|(adopt|accept|approv|implement)\w*.{0,40}recommend/, refs: ["EV-REC-03", "Register 2"], units: ["count", "pct"], business: "Adoption is decided by management." },
  { id: "rec_action", label: "Recommendations with a proposed action", rx: /recommend.{0,80}(action|next step)|actionab.{0,30}recommend|(action|next step)s?.{0,40}recommend/, refs: ["EV-REC-01", "EV-REC-02", "Register 2"], units: ["pct", "count"], standard: true },
  { id: "rec_count", label: "Commercial recommendations submitted", rx: /recommend/, refs: ["EV-REC-01", "Register 2"], units: ["count"] },
  { id: "feedback", label: "Stakeholder feedback score", rx: /(feedback|satisfaction|survey|rating|score)/, refs: ["EV-FB-01", "EV-FB-02", "Register 3"], units: ["scale"], periods: "quarter" },
  { id: "development", label: "Formal development activity", rx: /(training|course|certif|coaching|learning|development (plan|activit|program))/, refs: ["EV-DEV-01", "Register 6"], units: ["count"] },
  { id: "consult", label: "Structured stakeholder consultations", rx: /(consult|stakeholder (meeting|session|workshop|review)|joint session|workshop|cross[- ]functional (meeting|session))/, refs: ["EV-ENG-01", "EV-ENG-02", "Register 4"], units: ["count", "pct"], periods: "h2" },
  { id: "intelligence", label: "Competitive intelligence findings", rx: /(competitor|competitive|market) (analys|intelligence|insight|brief|update|study|finding)/, refs: ["EV-CI-01", "Register 5"], units: [], uncounted: true },
  { id: "business", label: "Department business results", rx: /(win rate|revenue|sales (growth|target|volume|result)|pipeline|opportunit|objection|market share|retention|new customers|conversion|profit|margin)/, refs: ["EV-BIZ-01", "EV-BIZ-02", "EV-BIZ-03"], units: [], business: "This is a department result; the records won't isolate Omar's individual contribution." }
];
const EVIDENCE_VERSION = "2027.2";   /* the year-end record version this build expects (older saves reload it) */
/* Measure families, used to spot one KPI that combines two separate measures under a single target */
const MEASURE_FAMILY = { rep_escalate: "escalation", rep_late: "timeliness", rep_ontime: "timeliness", rep_quality: "quality", rec_adopt: "adoption", rec_action: "recommendations", feedback: "feedback", development: "development", consult: "consultations", intelligence: "intelligence", business: "business" };
const FAMILY_LABEL = { escalation: "escalation", timeliness: "timeliness", quality: "quality review", adoption: "adoption", recommendations: "recommendations", feedback: "stakeholder feedback", development: "development activity", consultations: "consultations", intelligence: "competitive intelligence", business: "business results" };
function measureFamilies(t) {
  const fams = new Set(EVIDENCE_MEASURES.filter(m => MEASURE_FAMILY[m.id] && (m.id === "feedback" ? /(feedback|satisfaction|survey)/.test(t) : m.rx.test(t))).map(m => MEASURE_FAMILY[m.id]));
  if (fams.has("escalation")) fams.delete("timeliness");     /* escalation KPIs are about deadlines by nature */
  return [...fams];
}
const REF_LABEL = {
  "EV-REP-01": "Monthly reports scheduled", "EV-REP-02": "Reports submitted on time", "EV-REP-03": "Reporting deadlines missed", "EV-REP-04": "Quality review results", "EV-REP-05": "Escalation of deadline conflicts",
  "EV-REC-01": "Recommendations submitted", "EV-REC-02": "Recommendations with a proposed action", "EV-REC-03": "Management decisions on recommendations",
  "EV-FB-01": "Stakeholder feedback by quarter", "EV-FB-02": "Stakeholder feedback averages", "EV-ENG-01": "Structured consultations", "EV-ENG-02": "Consultation follow-up actions",
  "EV-CI-01": "Competitive intelligence", "EV-DEV-01": "Development records", "EV-BIZ-01": "Win rate (department)", "EV-BIZ-02": "Price objections (department)", "EV-BIZ-03": "Qualified opportunities (department)",
  "Register 1": "Monthly reporting register", "Register 2": "Recommendations register", "Register 3": "Stakeholder feedback register", "Register 4": "Stakeholder engagement register", "Register 5": "Competitive intelligence register", "Register 6": "Development register"
};
const PERIOD_RX = { quarter: /(per|each|every|a) quarter|quarterly|\bq[1-4]\b/, month: /(per|each|every|a) month\b/, half: /\bh[12]\b|(first|second) half|half[- ]year/ };
const kpiUnitKind = (k) => k.unit === "%" ? "pct" : /^\/\d/.test(k.unit) ? "scale" : "count";
function kpiPeriod(text) { const t = String(text).toLowerCase(); return Object.keys(PERIOD_RX).find(p => PERIOD_RX[p].test(t)) || "year"; }

/* Match one parsed KPI. Returns an auditable record: which rule matched, why, and the coverage status. */
function matchKpi(k) {
  const t = String(k.name || "").toLowerCase();
  const m = EVIDENCE_MEASURES.find(x => x.rx.test(t)) || null;
  const unit = kpiUnitKind(k), period = kpiPeriod(t);
  const fams = measureFamilies(t);
  const out = { measure: m ? m.id : null, label: m ? m.label : "No matching record", refs: m ? m.refs : [], unit, period, dir: m && m.dir ? m.dir : k.dir, business: m ? (m.business || "") : "", status: "supported", reason: "", notes: [], families: fams, compound: fams.length > 1, numericAllowed: true };
  const unavailable = (why) => Object.assign(out, { status: "unavailable", reason: why, numericAllowed: false });
  const clarify = (why, numeric = false) => Object.assign(out, { status: "clarify", reason: why, numericAllowed: numeric });
  if (out.compound) return clarify(`This KPI combines ${fams.length} separate measures (${fams.map(f => FAMILY_LABEL[f]).join(", ")}) under one target. Consider splitting it into ${fams.length} KPIs, each with its own target.`);
  if (!m) return unavailable(k.target != null ? "The measure is clear, but the available records may not support this result." : "The available records may not support this measure.");
  if (m.id === "business") return unavailable(m.business);
  if (m.uncounted && k.target != null) return unavailable("Records won't count analyses or findings; consider a measure that will be recorded.");
  if (k.type === "review") {
    const r = k.reason || "";
    if (/No numeric target/.test(r)) return clarify("This KPI needs a measurable target.");
    if (/Milestone/.test(r)) return clarify("Define how completion will be judged (for example a date or a yes/no rule).");
    if (/More than one figure/.test(r)) return clarify("More than one figure: make clear which one is the target.");
    if (/zero/i.test(r)) return clarify("A target of zero can't be turned into an achievement %; state a different rule.");
    return clarify("Make the target and how it is calculated clear.");
  }
  if (m.units.length && !m.units.includes(unit)) {
    if (m.id === "feedback") return clarify("Stakeholder feedback is recorded on a 1–5 scale: state the target on that scale.");
    return clarify("Check the unit of the target (count or percentage).");
  }
  if (m.id === "feedback" && unit === "scale" && !/\/5$/.test(k.unit)) return clarify("Stakeholder feedback is recorded on a 1–5 scale: state the target on that scale.");
  if (m.max && unit === "count" && k.target > m.max) return clarify(`Only ${m.max} monthly reports are scheduled in the year: check the target.`, true);
  if (m.business) out.notes.push(m.business);
  if (m.standard && unit === "count") out.notes.push("Your KPI sets a standard each recommendation must meet: decide which records qualify.");
  if (m.id === "consult" && /(action|follow)/.test(t)) out.notes.push("Your KPI sets a standard (documented actions): decide which consultations qualify.");
  if (period !== "year") out.notes.push(`Your target is ${period === "quarter" ? "per quarter" : period === "month" ? "per month" : "for half a year"}: enter the actual for the same period.`);
  else if (m.periods === "quarter") out.notes.push("Feedback is recorded by quarter: decide which period your target refers to (e.g. the year or H2).");
  if (m.periods === "h2") out.notes.push("Consultation records cover July – December only.");
  return out;
}
/* January wording: never mentions results, incidents or values */
const COVERAGE_LABEL = { supported: "Supported", clarify: "Needs clarification", unavailable: "Evidence unavailable" };
function kpiCoverageJanuary(k) {
  const c = matchKpi(k);
  return { status: c.status, label: COVERAGE_LABEL[c.status], message: c.status === "supported" ? "Measurable, and records for this measure will be available." : c.reason };
}
function objectiveCoverage(o) {
  const ks = parseKpis(o.kpi).map(k => ({ k, c: kpiCoverageJanuary(k) }));
  const rank = { unavailable: 2, clarify: 1, supported: 0 };
  const worst = ks.reduce((w, x) => rank[x.c.status] > rank[w] ? x.c.status : w, "supported");
  /* Two measurable targets in one KPI text: suggest splitting (the wording is never rewritten) */
  const split = ks.length > 1 ? `This KPI contains ${ks.length} separate measures. Consider writing them as ${ks.length} KPIs so each has its own target and is clear to assess. It will be kept exactly as you wrote it.` : "";
  return { status: worst, label: COVERAGE_LABEL[worst], kpis: ks, split };
}
