/* =========================================================
   OBJECTIVE MEASUREMENT → EVIDENCE MATCHING (deterministic, auditable)
   Maps each measurement (from the January objective and measurement) to the kind of record that
   will exist at year-end. Holds measure DEFINITIONS and record IDs only:
   no year-end values (those stay on the server until December).
   Order matters: the first matching rule wins.
   ========================================================= */
const EVIDENCE_MEASURES = [
  { id: "rep_escalate", label: "Deadline conflicts escalated in advance", rx: /(escalat|flag(s|ged)?|raise[ds]?)\b.{0,40}(deadline|conflict|risk|priorit)|(deadline|conflict)s?.{0,40}(escalat|flag)/, refs: ["EV-REP-05", "Register 1"], units: ["count", "pct"] },
  { id: "rep_late", label: "Reporting deadlines missed", rx: /(late|missed|overdue|delayed)\b.{0,30}(report|deadline|deliver)|(report|deadline|deliver)\w*.{0,30}\b(late|missed|overdue)/, refs: ["EV-REP-03", "Register 1"], units: ["count", "pct"], dir: "lower" },
  { id: "rep_quality", label: "Reports passing quality review", rx: /(quality|\bqa\b|pass(ing|ed|es)?\b.{0,20}review|without (major )?correction|error[- ]free)/, refs: ["EV-REP-04", "Register 1"], units: ["count", "pct"], max: 12 },
  { id: "rep_ontime", label: "Reports submitted on time", rx: /(on[- ]time|timel|(by|before|within|meet(ing)?) (the |their |its |agreed )?deadlines?)/, refs: ["EV-REP-02", "Register 1"], units: ["count", "pct"], max: 12 },
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
const EVIDENCE_VERSION = "2027.3";   /* the year-end record version this build expects (older saves reload it) */
/* Measure families, used to spot one measurement that combines two separate measures under a single target */
const MEASURE_FAMILY = { rep_escalate: "escalation", rep_late: "timeliness", rep_ontime: "timeliness", rep_quality: "quality", rec_adopt: "adoption", rec_action: "recommendations", feedback: "feedback", development: "development", consult: "consultations", intelligence: "intelligence", business: "business" };
const FAMILY_LABEL = { escalation: "escalation", timeliness: "timeliness", quality: "quality review", adoption: "adoption", recommendations: "recommendations", feedback: "stakeholder feedback", development: "development activity", consultations: "consultations", intelligence: "competitive intelligence", business: "business results" };
function measureFamilies(t) {
  const fams = new Set(EVIDENCE_MEASURES.filter(m => MEASURE_FAMILY[m.id] && (m.id === "feedback" ? /(feedback|satisfaction|survey)/.test(t) : m.rx.test(t))).map(m => MEASURE_FAMILY[m.id]));
  if (fams.has("escalation")) fams.delete("timeliness");     /* escalation measures are about deadlines by nature */
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

/* Match one parsed measurement. Returns an auditable record: which rule matched, why, and the coverage status. */
function matchKpi(k) {
  const t = String(k.name || "").toLowerCase();
  const m = EVIDENCE_MEASURES.find(x => x.rx.test(t)) || null;
  const unit = kpiUnitKind(k), period = kpiPeriod(t);
  const fams = measureFamilies(t);
  const out = { measure: m ? m.id : null, label: m ? m.label : "No matching record", refs: m ? m.refs : [], unit, period, dir: m && m.dir ? m.dir : k.dir, business: m ? (m.business || "") : "", status: "supported", reason: "", notes: [], families: fams, compound: fams.length > 1, numericAllowed: true };
  const unavailable = (why) => Object.assign(out, { status: "unavailable", reason: why, numericAllowed: false });
  const clarify = (why, numeric = false) => Object.assign(out, { status: "clarify", reason: why, numericAllowed: numeric });
  if (out.compound) return clarify(`This measurement combines ${fams.length} separate measures (${fams.map(f => FAMILY_LABEL[f]).join(", ")}) under one target. Consider splitting it into ${fams.length} objectives, each with its own target.`);
  if (!m) return unavailable(k.target != null ? "The measure is clear, but the available records may not support this result." : "The available records may not support this measure.");
  if (m.id === "business") return unavailable(m.business);
  if (m.uncounted && k.target != null) return unavailable("Records won't count analyses or findings; consider a measurement that will be recorded.");
  if (k.type === "review") {
    const r = k.reason || "";
    if (/No numeric target/.test(r)) return clarify("This objective needs a measurable target.");
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
  if (m.standard && unit === "count") out.notes.push("The measurement sets a standard each recommendation must meet: decide which records qualify.");
  if (m.id === "consult" && /(action|follow)/.test(t)) out.notes.push("The measurement sets a standard (documented actions): decide which consultations qualify.");
  if (period !== "year") out.notes.push(`Your target is ${period === "quarter" ? "per quarter" : period === "month" ? "per month" : "for half a year"}: enter the actual for the same period.`);
  else if (m.periods === "quarter") out.notes.push("Feedback is recorded by quarter: decide which period your target refers to (e.g. the year or H2).");
  if (m.periods === "h2") out.notes.push("Consultation records cover July – December only.");
  return out;
}
const COVERAGE_LABEL = { supported: "Supported", clarify: "Needs clarification", unavailable: "Evidence unavailable" };

/* =========================================================
   SMART CHECK (January) — objective, measurement and due date read together.
   Gives feedback only; never rewrites the participant's wording. Never mentions year-end results.
   status: ok | warn | fail | info. "fail" on M or T blocks finalising the objective.
   ========================================================= */
const VAGUE_START = /^(improve|enhance|support|help|work on|focus on|continue|try to|assist|contribute|be |do |ensure good|maintain good|develop)\b/i;
const OUTCOME_WORDS = /\b(deliver|submit|achieve|reach|complete|launch|produce|present|publish|reduce|increase|run|hold|provide|prepare|identify|establish|introduce|secure)\w*/i;
const ROLE_WORDS = /(report|analys|intelligence|market|competitor|recommend|stakeholder|insight|customer|commercial|sales|research|pricing|segment|briefing|consult|feedback|operations|deadline|escalat)/i;
const inPeriod = (d) => d >= APPRAISAL_CONFIG.ratingPeriod.from && d <= APPRAISAL_CONFIG.ratingPeriod.to;
function smartCheck(o) {
  const oT = String(o.objective || "").trim(), mT = String(o.measure || "").trim(), due = String(o.due || "").trim();
  const def = deriveDefinition(o), both = `${oT} ${mT}`;
  const match = def.type === "numeric" ? matchKpi({ name: def.text, target: def.target, unit: def.unit, dir: def.dir, type: "numeric", reason: "" }) : matchKpi({ name: both, target: null, unit: "", dir: "higher", type: "review", reason: "No numeric target" });
  const c = {};
  /* S — Specific */
  if (!oT) c.S = { status: "fail", msg: "Write the objective: what should Omar accomplish this year?" };
  else if (VAGUE_START.test(oT) && !OUTCOME_WORDS.test(oT) && def.type !== "numeric") c.S = { status: "warn", msg: "Your objective describes the activity, but the expected result is not yet clear. What specific outcome should Omar achieve?" };
  else if (words(oT) < 5) c.S = { status: "warn", msg: "The objective is very short. Describe the result Omar should achieve, not just the topic." };
  else c.S = { status: "ok", msg: "States what Omar should accomplish." };
  /* M — Measurable (blocking when no reliable target or completion rule) */
  if (!mT) c.M = { status: "fail", msg: "Add the measurement: how will you and Omar know the objective has been achieved?" };
  else if (def.type === "review") c.M = { status: "fail", msg: def.compound ? "The measurement contains more than one target. Keep one target per objective, or split it into separate objectives." : /change/.test(def.reason) ? "The measurement states a change without the level to reach. State the target level (or the starting point) so the result can be calculated." : /ambiguous/.test(def.reason) ? "The measurement contains more than one figure, so the target isn't clear. Which number is the target?" : /zero/i.test(def.reason) ? "A target of zero can't be turned into a % achieved. State the rule you'll use to assess it." : "A target isn't clear yet. Add a number, percentage or completion standard so the result can be assessed at year-end." };
  else if (def.type === "milestone") c.M = { status: "ok", msg: "Completion-based: it will be assessed as completed by the due date (100%) or not completed (0%); late or partial completion needs a documented assessment." };
  else if (match.status === "clarify" && /1–5 scale/.test(match.reason)) c.M = { status: "warn", msg: "Stakeholder feedback is recorded on a 1–5 scale: state the target on that scale." };
  else c.M = { status: "ok", msg: `Target identified: ${fmtDefinitionTarget(def)}${def.source === "objective" ? " (from the objective statement)" : ""}.` };
  /* A — Achievable (only obvious problems are flagged; realism is for you and Omar to agree) */
  if (def.type === "numeric" && def.unit === "%" && def.target > 100 && def.dir !== "lower") c.A = { status: "warn", msg: "A percentage target above 100% can't be reached. Check the target." };
  else if (def.type === "numeric" && /^\/(\d+)/.test(def.unit) && def.target > Number(def.unit.slice(1))) c.A = { status: "warn", msg: "The target is higher than the scale allows. Check the target." };
  else if (match.status === "clarify" && /monthly reports are scheduled/.test(match.reason)) c.A = { status: "warn", msg: match.reason };
  else c.A = { status: "info", msg: "Agree with Omar that the target is challenging but realistic for his role." };
  /* R — Relevant */
  if (match.measure === "business") c.R = { status: "warn", msg: "This is a department result. Omar's own contribution to it may be hard to show; consider what he directly controls." };
  else if (match.status === "unavailable" && !ROLE_WORDS.test(both)) c.R = { status: "warn", msg: "Check how this objective links to Omar's role and the Commercial priorities. The measure is clear, but the available records may not support this result." };
  else if (match.status === "unavailable") c.R = { status: "info", msg: "Relevant to Omar's role. The measure is clear, but the available records may not support this result." };
  else c.R = { status: "ok", msg: "Linked to Omar's role and responsibilities." };
  /* T — Time-bound (blocking) */
  if (!due) c.T = { status: "fail", msg: "Add a due date." };
  else if (!inPeriod(due)) c.T = { status: "fail", msg: "The due date must fall within the 2027 rating period (1 January – 31 December 2027)." };
  else c.T = { status: "ok", msg: `Due ${fmtDue(due)}.` };
  return { checks: c, def, blocking: ["M", "T"].filter(k => c[k].status === "fail"), notes: Object.keys(c).filter(k => c[k].status === "warn").length };
}
const SMART_LABEL = { S: "Specific", M: "Measurable", A: "Achievable", R: "Relevant", T: "Time-bound" };
function fmtDue(iso) { if (!iso) return "—"; const d = new Date(iso + "T00:00:00Z"); if (isNaN(d)) return iso; return `${d.getUTCDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()]} ${d.getUTCFullYear()}`; }

/* =========================================================
   YEAR-END SUMMARY — results against the participant's own agreed objectives.
   One consistent underlying outcome (dataset.measures) is expressed in the unit of
   the agreed measurement. Nothing is invented: if no record matches, it says so.
   ========================================================= */
const fmtNum = (x) => String(Math.round(x * 10) / 10);
function objectiveEvidence(o, d, r = rec()) {
  const def = objectiveDefinition(o), M = (d && d.measures) || {};
  const text = `${o.objective || ""} ${o.measure || ""}`.toLowerCase();
  const k = { name: def.type === "numeric" ? def.text : `${o.objective} ${o.measure}`, target: def.target, unit: def.unit || "", dir: def.dir, type: def.type === "numeric" ? "numeric" : "review", reason: def.reason || "" };
  let match = matchKpi(k); if (!match.measure) match = matchKpi({ ...k, name: text });
  const id = match.measure, m = id ? M[id] : null, target = fmtDefinitionTarget(def);
  const out = { def, target, measure: m ? m.label : null, evidence: m ? m.evidence : "No matching record is available for this objective.", actual: null, actualInput: null, achievement: null, status: "insufficient", note: "" };
  const insufficient = (note) => Object.assign(out, { status: "insufficient", note });
  if (!m) return insufficient("Not verifiable from the current record.");
  if (m.business) return insufficient("Department or management outcome: not verifiable as Omar's individual result.");
  if (m.qualitative) return Object.assign(out, { status: "evidence", note: "Qualitative evidence: assess against the agreed objective." });
  if (def.type === "milestone") return insufficient("No completion record is available for this milestone.");
  if (def.type !== "numeric") return Object.assign(out, { status: "evidence", note: "No single agreed target: assess using the evidence." });
  const period = kpiPeriod(text);
  let value = null, unit = def.unit || "";
  if (id === "consult") {
    const withActions = /(documented|follow[- ]up|action)/.test(text);
    if (period !== "year") return insufficient("Consultations are recorded for July–December only, not per quarter.");
    value = withActions ? 0 : m.count;
    return Object.assign(out, { status: "partial", actual: `${value} documented${withActions ? " with follow-up actions" : ""}`, actualInput: null, achievement: null, note: "Not verifiable for the full year: no records for January–June." });
  }
  if (/^\/(\d+)/.test(unit) || (m.scale != null && unit === "" && def.target <= 5)) {
    if (m.scale == null || (unit && unit !== "/5")) return insufficient("This record isn't kept on that scale.");
    const v = /(\bh2\b|second half)/.test(text) ? m.h2 : /(\bh1\b|first half)/.test(text) ? m.h1 : period === "year" ? Math.round(m.scale * 10) / 10 : null;
    if (v == null) return insufficient("Feedback is recorded by quarter; the agreed period can't be matched exactly.");
    const sv = String(Math.round(v * 100) / 100);   /* scores keep two decimals (e.g. 3.25) */
    value = v; out.actual = `${sv}/5`; out.actualInput = `${sv}/5`;
  } else if (unit === "%") {
    if (m.pct == null) return insufficient("This record isn't kept as a percentage.");
    if (period !== "year") return insufficient("Recorded for the year, not for the agreed period.");
    value = m.pct; out.actual = `${fmtNum(value)}%`; out.actualInput = `${fmtNum(value)}%`;
  } else {
    if (m.count == null) return insufficient(m.scale != null ? "Recorded on a 1–5 scale, not as a count." : "This record isn't kept as a count.");
    if (period !== "year") return insufficient("Recorded for the year, not for the agreed period.");
    value = m.count; out.actual = `${value}${m.pct != null && id !== "rep_count" ? ` (${fmtNum(m.pct)}%)` : ""}`; out.actualInput = String(value);
  }
  const res = objectiveResult({ ...o, agreed: def }, { actual: out.actualInput });
  return Object.assign(out, { status: res.status === "ok" ? "calculated" : "partial", achievement: res.status === "ok" ? res.pct : null, note: res.status === "ok" ? "" : res.note });
}
