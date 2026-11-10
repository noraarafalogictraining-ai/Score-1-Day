/* =========================================================
   PERFORMANCE APPRAISAL FORM — CALCULATIONS (deterministic)
   Follows the NextWave Performance Appraisal Form:
   Part I  Competencies (40%): rating 1–4; score = (average rating ÷ 3) × 100 (3 = 100%).
   Part II Objectives (60%): % achieved = actual ÷ target × 100 (no cap);
           weighted score = % achieved × weight ÷ 100; objectives score = Σ weighted scores.
   Overall = objectives × 60/100 + competencies × 40/100, classified on the form's rating bands.
   ========================================================= */
const APPRAISAL_CONFIG = {
  objectivesWeight: 60, competenciesWeight: 40,
  ratingMax: 4, meetsRating: 3,     /* 3 = Meets Expectations = 100% */
  kpiCap: null,                     /* no cap: the form allows results above 100% */
  manualMax: 200, basisMin: 20,
  lowerIsBetter: "inverse",         /* target ÷ actual × 100, only when both are above 0 */
  ratingPeriod: { from: "2027-01-01", to: "2027-12-31" }
};
/* The form's Employee Performance Profile (classified on the overall % rounded to a whole number, half up) */
const PERFORMANCE_BANDS = [
  { min: 101, label: "Exceptional", range: "101% or more" },
  { min: 86, label: "Very Good", range: "86% – 100%" },
  { min: 76, label: "Good", range: "76% – 85%" },
  { min: 60, label: "Needs Improvement", range: "60% – 75%" },
  { min: -Infinity, label: "Unacceptable", range: "Less than 60%" }
];
const COMPETENCY_SCALE = RATING_SCALE;   /* defined in content.js */
function performanceBand(overall) { if (overall == null) return null; const w = Math.round(overall); return PERFORMANCE_BANDS.find(b => w >= b.min); }
const MONTH_RX = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
function stripDates(t) {
  return String(t || "")
    .replace(new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH_RX}(?:,?\\s+\\d{4})?`, "gi"), " ")
    .replace(new RegExp(`\\b${MONTH_RX}\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?`, "gi"), " ")
    .replace(/\b\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}\b/g, " ").replace(/\b(?:19|20)\d{2}\b/g, " ").replace(/\b[qh][1-4]\b/gi, " ");
}
const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const NUM_RX = /(?<![a-z0-9])(?:(\d+(?:[.,]\d+)?)\s*(%|\s*\/\s*\d+)?|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve))(?![a-z0-9])/gi;
const LOWER_RX = /\b(at most|no more than|maximum of|max\.?|under|below|less than|fewer than|reduce[ds]?|reduction|decrease|lower|within)\b/i;
const MILESTONE_RX = /\b(launch|implement(ed)?|complete[ds]?|completion|roll(ed)? out|by (q[1-4]|end of|january|february|march|april|may|june|july|august|september|october|november|december))\b/i;
const SPLIT_RX = /\n|;|\s+(?:and|&)\s+(?=(?:(?:at least|at most|no more than|a minimum of|minimum of|maximum of|over|under|below|above|less than|more than)\s+)?(?:\d|one\b|two\b|three\b|four\b|five\b|six\b|seven\b|eight\b|nine\b|ten\b|eleven\b|twelve\b))/i;

/* Split a measurement text into measures and detect each target (internal helper). */
function parseKpis(text) {
  const segs = String(text || "").split(SPLIT_RX).map(s => s.trim().replace(/^[,.\-–—]+|[,.]+$/g, "").trim()).filter(Boolean);
  return (segs.length ? segs : [String(text || "").trim()]).map(seg => {
    /* "4 out of 5" on a feedback/rating scale = 4/5; "11 of 12 reports" = a count of 11 (12 is the total). Dates are not targets. */
    const scaleCtx = /(feedback|satisfaction|survey|rating|score|scale)/i.test(seg);
    const numText = stripDates(seg).replace(/(\d+(?:[.,]\d+)?)\s*(out\s+)?of\s+(?:the\s+)?(\d+)\b/gi, (m0, x, out, y) => scaleCtx && out ? `${x}/${y}` : x);   /* read "4 out of 5" as 4/5; dates are not targets; the wording itself is never changed */
    const nums = [...numText.matchAll(NUM_RX)].filter(m => !/q$/i.test(numText.slice(0, m.index).trim().slice(-1)));
    const k = { name: seg, target: null, unit: "", dir: "higher", type: "numeric", reason: "" };
    if (!nums.length) { k.type = "review"; k.reason = MILESTONE_RX.test(seg) ? "Milestone or completion-based measurement." : "No numeric target found in the measurement."; return k; }
    const distinct = [...new Set(nums.map(m => m[0].replace(/\s+/g, "").toLowerCase()))];
    if (distinct.length > 1) { k.type = "review"; k.reason = "More than one figure, so the target is ambiguous."; return k; }
    const m = nums[0];
    k.target = m[3] ? NUM_WORDS[m[3].toLowerCase()] : Number(m[1].replace(",", "."));
    k.unit = m[2] ? m[2].replace(/\s+/g, "") : "";
    if (LOWER_RX.test(seg)) k.dir = "lower";
    if (MILESTONE_RX.test(seg) && !/\d/.test(seg.replace(/\bq[1-4]\b/gi, ""))) { k.type = "review"; k.reason = "Milestone or completion-based measurement."; }
    if (k.target === 0) { k.type = "review"; k.reason = "Target is zero, so a percentage cannot be calculated."; }
    if (k.dir === "lower" && APPRAISAL_CONFIG.lowerIsBetter === "review") { k.type = "review"; k.reason = "Lower-is-better measure: assess manually."; }
    return k;
  });
}
const fmtTarget = (k) => k.target == null ? "Not stated" : `${k.dir === "lower" ? "≤ " : "≥ "}${k.target}${k.unit}`;
/* Parse an entered actual: blank → null (never zero); invalid → NaN. parseActualU also returns the unit typed. */
function parseActualU(v) {
  const s = String(v == null ? "" : v).trim();
  if (!s) return { n: null, unit: "" };
  const m = s.replace(",", ".").match(/^(-?\d+(?:\.\d+)?)\s*(%|\/\s*\d+)?$/);
  return m ? { n: Number(m[1]), unit: (m[2] || "").replace(/\s+/g, "") } : { n: NaN, unit: "" };
}
const parseActual = (v) => parseActualU(v).n;
const round1 = (x) => Math.round(x * 10) / 10;
/* Unit check: the actual must be in the same unit as the January target */
function unitProblem(k, a) {
  if (k.unit === "%") return a.unit === "%" ? "" : "The target is a percentage: enter the result with a % sign (e.g. 75%).";
  const scale = /^\/(\d+)/.exec(k.unit || "");
  if (scale) { if (a.unit === "%") return `Enter a score on the 1–${scale[1]} scale, not a percentage.`; if (a.n > Number(scale[1])) return `The score can't exceed ${scale[1]}.`; return ""; }
  if (a.unit === "%") return `The target is a number (${k.target}), so enter a number, not a percentage.`;
  if (/^\//.test(a.unit)) return "Enter a number in the same unit as the target.";
  return "";
}
/* ---------- Agreed target / calculation definition (from the objective and measurement) ---------- */
const RELATIVE_RX = /\b(reduc|increas|improv|grow|rais|cut|lower|decreas|boost)\w*\b.{0,50}\bby\s+(?:at least\s+|a minimum of\s+)?\d/i;
function deriveDefinition(o) {
  const mText = String(o.measure != null ? o.measure : (o.kpi || "")).trim(), oText = String(o.objective || "").trim();
  let source = "measurement", ks = parseKpis(mText);
  if (!ks.some(k => k.target != null) && oText) { const ko = parseKpis(oText); if (ko.some(k => k.target != null)) { ks = ko; source = "objective"; } }
  const numeric = ks.filter(k => k.target != null), text = source === "objective" ? oText : mText;
  const base = { source, text, target: null, unit: "", dir: "higher" };
  const milestone = MILESTONE_RX.test(`${mText} ${oText}`) || /\b(deliver(ed)?|complete|finali[sz]e|publish|launch|set up|establish|introduce|roll out)\b/i.test(`${mText} ${oText}`);
  if (numeric.length > 1) return { ...base, type: "review", compound: true, reason: "The measurement contains more than one target. Use one target per objective (or split it into separate objectives)." };
  if (numeric.length === 1) {
    const k = numeric[0], d = { ...base, target: k.target, unit: k.unit, dir: k.dir };
    if (RELATIVE_RX.test(text)) return { ...d, type: "review", reason: "It states a change (\"by …\") without the starting level. State the level Omar should reach, or the baseline." };
    if (k.type === "review") return { ...d, type: "review", reason: k.reason };
    return { ...d, type: "numeric" };
  }
  const unclear = ks.find(k => /More than one figure|zero/i.test(k.reason || ""));
  if (unclear) return { ...base, type: "review", reason: unclear.reason };
  if (milestone && o.due) return { ...base, type: "milestone", reason: "" };
  return { ...base, type: "review", reason: "No target or completion rule could be identified." };
}
/* At plan submission the definition is stored with the objective (o.agreed), so year-end uses what was agreed. */
const objectiveDefinition = (o) => o.agreed || deriveDefinition(o);
function fmtDefinitionTarget(def) {
  if (def.type === "milestone") return "Completed by the due date";
  if (def.target == null) return "Not established";
  return `${def.dir === "lower" ? "≤ " : ""}${def.target}${def.unit}`;
}
const MILESTONE_OPTIONS = [["done", "Completed by the due date (100%)"], ["late", "Completed after the due date"], ["partial", "Partly completed"], ["not", "Not completed (0%)"]];
const METHOD_LABEL = { higher: "Actual ÷ target × 100", lower: "Lower is better: target ÷ actual × 100", milestone: "Completion rule", review: "Manager assessment with documented basis" };

/* ---------- Year-end result for one objective ---------- */
function manualResult(e, C) {
  const v = parseActual(e.manual), miss = [];
  if (e.manual != null && String(e.manual).trim() && (Number.isNaN(v) || v < 0 || v > C.manualMax)) return { raw: null, pct: null, status: "invalid", note: `Enter a percentage between 0 and ${C.manualMax}` };
  if (!e.reviewed) miss.push("confirm the evidence review");
  if (String(e.basis || "").trim().length < C.basisMin) miss.push("document the measurement basis");
  if (v == null) miss.push("enter the % achieved");
  if (miss.length) return { raw: null, pct: null, status: "unresolved", note: `Needs clarification: ${miss.join(", ")}` };
  return { raw: v, pct: round1(v), status: "ok", note: "Manager assessment with a documented basis" };
}
function objectiveMethod(def, e) {
  if (def.type === "numeric") return e.mode === "review" ? "review" : (e.dir || def.dir) === "lower" ? "lower" : "higher";
  return def.type;                                   /* milestone | review */
}
function objectiveResult(o, entry) {
  const C = APPRAISAL_CONFIG, e = entry || {}, def = objectiveDefinition(o), method = objectiveMethod(def, e);
  const ok = (raw, note) => ({ raw, pct: round1(raw), status: "ok", note });
  if (method === "review") return manualResult(e, C);
  if (method === "milestone") {
    if (!e.milestone) return { raw: null, pct: null, status: "blank", note: "Select the completion status" };
    if (e.milestone === "done") return ok(100, "Completed by the due date = 100%");
    if (e.milestone === "not") return ok(0, "Not completed = 0%");
    return manualResult(e, C);                       /* late or partial: manager assessment with a basis */
  }
  const k = { target: def.target, unit: def.unit }, a = parseActualU(e.actual);
  if (a.n == null) return { raw: null, pct: null, status: "blank", note: "Enter the actual achievement" };
  if (Number.isNaN(a.n) || a.n < 0) return { raw: null, pct: null, status: "invalid", note: "Enter a number, e.g. 9 or 75%" };
  const up = unitProblem(k, a); if (up) return { raw: null, pct: null, status: "invalid", note: up };
  if (method === "lower") {
    if (a.n === 0) return { raw: null, pct: null, status: "unresolved", note: "The actual is 0, so a ratio can't be calculated: use a manager assessment with a documented basis" };
    return ok(def.target / a.n * 100, METHOD_LABEL.lower);
  }
  return ok(a.n / def.target * 100, METHOD_LABEL.higher);
}

/* ---------- The whole form ---------- */
function appraisalCalc(r = rec()) {
  const a = r.r3.appraisal, C = APPRAISAL_CONFIG;
  const objectives = r.goals.objectives.map((o, i) => {
    const def = objectiveDefinition(o), e = a.what[o.id] || {}, res = objectiveResult(o, e), weight = num(o.weight);
    const match = matchKpi({ name: `${def.text || ""}`, target: def.target, unit: def.unit || "", dir: def.dir, type: def.type === "numeric" ? "numeric" : "review", reason: def.reason || "" });
    return { o, i, def, e, res, match, method: objectiveMethod(def, e), weight, weightedRaw: res.raw == null ? null : res.raw * weight / 100, weighted: res.raw == null ? null : round1(res.raw * weight / 100), done: res.status === "ok" };
  });
  const totalWeight = objectives.reduce((s, x) => s + x.weight, 0), weightOK = Math.abs(totalWeight - 100) < 0.01;
  const objDone = objectives.filter(x => x.done).length;
  const objRaw = objectives.length && weightOK && objDone === objectives.length ? objectives.reduce((s, x) => s + x.weightedRaw, 0) : null;
  const comps = r.goals.comps.map(c => { const h = a.how[c.id] || {}; return { c, rating: COMPETENCY_SCALE.some(x => x.v === h.rating) ? h.rating : null, h }; });
  const rated = comps.filter(x => x.rating);
  const avgRating = comps.length && rated.length === comps.length ? rated.reduce((s, x) => s + x.rating, 0) / rated.length : null;
  const compRaw = avgRating == null ? null : avgRating / C.meetsRating * 100;
  const overallRaw = objRaw != null && compRaw != null ? objRaw * C.objectivesWeight / 100 + compRaw * C.competenciesWeight / 100 : null;
  const r1 = (x) => x == null ? null : round1(x);
  const unresolved = objectives.filter(x => x.res.status === "unresolved").length;
  return { objectives, totalWeight, weightOK, objDone, unresolved, objectivesScore: r1(objRaw), objectivesContrib: objRaw == null ? null : round1(objRaw * C.objectivesWeight / 100),
    comps, rated: rated.length, avgRating: avgRating == null ? null : Math.round(avgRating * 100) / 100, competenciesScore: r1(compRaw), competenciesContrib: compRaw == null ? null : round1(compRaw * C.competenciesWeight / 100),
    overall: r1(overallRaw), overallRaw, band: performanceBand(overallRaw) };
}
