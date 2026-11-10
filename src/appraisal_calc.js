/* =========================================================
   FINAL APPRAISAL — PROTOTYPE CALCULATIONS (configurable, not yet approved)
   The January plan has one free-text KPI per objective with the target written
   into it. For this prototype the KPI text is split into separate KPIs and a
   numeric target is detected; anything unclear is flagged for review instead of
   producing a misleading percentage. Nothing in the January plan is changed.
   ========================================================= */
const APPRAISAL_CONFIG = {
  whatWeight: 60,          /* % of the overall score from WHAT */
  howWeight: 40,           /* % of the overall score from HOW */
  kpiCap: null,            /* null = no cap: overachievement stays visible (approved) */
  manualMax: 200,          /* highest manager-assessed % accepted for a KPI under review */
  basisMin: 20,            /* minimum length of the written measurement basis for a reviewed KPI */
  lowerIsBetter: "inverse",/* "inverse" = target ÷ actual × 100 when both > 0 (otherwise review); "review" = always manager review */
  howScale: 5              /* HOW achievement = average rating ÷ 5 × 100 (1 = 20% … 5 = 100%) */
};
const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const NUM_RX = /(?<![a-z0-9])(?:(\d+(?:[.,]\d+)?)\s*(%|\s*\/\s*\d+)?|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve))(?![a-z0-9])/gi;
const LOWER_RX = /\b(at most|no more than|maximum of|max\.?|under|below|less than|fewer than|reduce[ds]?|reduction|decrease|lower|within)\b/i;
const MILESTONE_RX = /\b(launch|implement(ed)?|complete[ds]?|completion|roll(ed)? out|by (q[1-4]|end of|january|february|march|april|may|june|july|august|september|october|november|december))\b/i;
const SPLIT_RX = /\n|;|\s+(?:and|&)\s+(?=(?:(?:at least|at most|no more than|a minimum of|minimum of|maximum of|over|under|below|above|less than|more than)\s+)?(?:\d|one\b|two\b|three\b|four\b|five\b|six\b|seven\b|eight\b|nine\b|ten\b|eleven\b|twelve\b))/i;

/* Split a January KPI text into KPIs and detect each target. */
function parseKpis(text) {
  const segs = String(text || "").split(SPLIT_RX).map(s => s.trim().replace(/^[,.\-–—]+|[,.]+$/g, "").trim()).filter(Boolean);
  return (segs.length ? segs : [String(text || "").trim()]).map(seg => {
    const numText = seg.replace(/(\d+(?:[.,]\d+)?)\s*out of\s*(\d+)/gi, "$1/$2");   /* read "4 out of 5" as 4/5; the KPI wording itself is never changed */
    const nums = [...numText.matchAll(NUM_RX)].filter(m => !/q$/i.test(numText.slice(0, m.index).trim().slice(-1)));
    const k = { name: seg, target: null, unit: "", dir: "higher", type: "numeric", reason: "" };
    if (!nums.length) { k.type = "review"; k.reason = MILESTONE_RX.test(seg) ? "Milestone-based KPI (done / not done), so assess it manually." : "No numeric target found in the January KPI."; return k; }
    const distinct = [...new Set(nums.map(m => m[0].replace(/\s+/g, "").toLowerCase()))];
    if (distinct.length > 1) { k.type = "review"; k.reason = "More than one figure in this KPI, so the target is ambiguous."; return k; }
    const m = nums[0];
    k.target = m[3] ? NUM_WORDS[m[3].toLowerCase()] : Number(m[1].replace(",", "."));
    k.unit = m[2] ? m[2].replace(/\s+/g, "") : "";
    if (LOWER_RX.test(seg)) k.dir = "lower";
    if (MILESTONE_RX.test(seg) && !/\d/.test(seg.replace(/\bq[1-4]\b/gi, ""))) { k.type = "review"; k.reason = "Milestone-based KPI."; }
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
/* Achievement of one KPI. Returns { raw, pct, status, note }; status ∈ ok | blank | invalid | review. No cap unless configured. */
function kpiAchievement(k, entry) {
  const C = APPRAISAL_CONFIG, e = entry || {};
  const type = e.type || k.type, dir = e.dir || k.dir;
  const done = (raw, note) => { const capped = C.kpiCap != null && raw > C.kpiCap; const v = capped ? C.kpiCap : raw; return { raw: v, pct: round1(v), status: "ok", note: capped ? `Capped at ${C.kpiCap}% (calculated ${round1(raw)}%)` : note }; };
  if (type === "review") {
    /* Manager review: included in the score only when RESOLVED = evidence reviewed + documented measurement basis + assessed % */
    const v = parseActual(e.manual), miss = [];
    if (e.manual != null && String(e.manual).trim() && (Number.isNaN(v) || v < 0 || v > C.manualMax)) return { raw: null, pct: null, status: "invalid", note: `Enter a percentage between 0 and ${C.manualMax}` };
    if (!e.reviewed) miss.push("confirm the evidence review");
    if (String(e.basis || "").trim().length < C.basisMin) miss.push("document the measurement basis");
    if (v == null) miss.push("enter the assessed achievement %");
    if (miss.length) return { raw: null, pct: null, status: "unresolved", note: `Unresolved: ${miss.join(", ")}` };
    return done(v, "Manager review: resolved with a documented basis");
  }
  if (k.target == null || k.target === 0) return { raw: null, pct: null, status: "review", note: "No usable target: switch to manager review" };
  const a = parseActualU(e.actual);
  if (a.n == null) return { raw: null, pct: null, status: "blank", note: "Enter the actual result" };
  if (Number.isNaN(a.n) || a.n < 0) return { raw: null, pct: null, status: "invalid", note: "Enter a number, e.g. 9 or 75%" };
  const up = unitProblem(k, a); if (up) return { raw: null, pct: null, status: "invalid", note: up };
  if (dir === "lower") {
    if (C.lowerIsBetter === "review") return { raw: null, pct: null, status: "review", note: "Lower-is-better measure: switch to manager review" };
    if (a.n === 0) return { raw: null, pct: null, status: "review", note: "Actual is 0, so a ratio can't be calculated: switch to manager review and state your rule" };
    return done(k.target / a.n * 100, "Lower is better: target ÷ actual × 100");
  }
  return done(a.n / k.target * 100, "Actual ÷ target × 100");
}
/* Full appraisal calculation from the plan and the participant's entries.
   Raw values are kept until display, so rounding never compounds. */
function appraisalCalc(r = rec()) {
  const a = r.r3.appraisal, C = APPRAISAL_CONFIG;
  const objectives = r.goals.objectives.map(o => {
    const kpis = parseKpis(o.kpi), entries = ((a.what[o.id] || {}).kpis) || {};
    const rows = kpis.map((k, i) => {
      const match = matchKpi(k), base = match.status === "supported" ? k : { ...k, type: "review", reason: match.reason || k.reason };
      if (match.dir !== base.dir) base.dir = match.dir;
      const raw = entries[i] || {}, e = match.numericAllowed ? raw : { ...raw, type: "review" };   /* unsupported KPIs can't be switched to a formula */
      return { k: base, i, e, share: 100 / kpis.length, match, res: kpiAchievement(base, e) };
    });
    const done = rows.every(x => x.res.status === "ok");
    const achRaw = done ? rows.reduce((s, x) => s + x.res.raw, 0) / rows.length : null;
    const weight = num(o.weight);
    return { o, rows, achRaw, ach: achRaw == null ? null : round1(achRaw), weight, contribRaw: achRaw == null ? null : achRaw * weight / 100, contrib: achRaw == null ? null : round1(achRaw * weight / 100), done };
  });
  const totalWeight = objectives.reduce((s, x) => s + x.weight, 0), weightOK = Math.abs(totalWeight - 100) < 0.01;
  const doneObjs = objectives.filter(x => x.done);
  const whatRaw = objectives.length && weightOK && doneObjs.length === objectives.length ? objectives.reduce((s, x) => s + x.contribRaw, 0) : null;
  const whatPartial = round1(doneObjs.reduce((s, x) => s + x.contribRaw, 0));
  const comps = r.goals.comps.map(c => ({ c, rating: (a.how[c.id] || {}).rating || null }));
  const rated = comps.filter(x => x.rating);
  const howRaw = comps.length && rated.length === comps.length ? rated.reduce((s, x) => s + x.rating, 0) / rated.length / C.howScale * 100 : null;
  const overallRaw = whatRaw != null && howRaw != null ? whatRaw * C.whatWeight / 100 + howRaw * C.howWeight / 100 : null;
  const r1 = (x) => x == null ? null : round1(x);
  const unresolved = objectives.reduce((n, x) => n + x.rows.filter(y => y.res.status === "unresolved").length, 0);
  return { objectives, unresolved, totalWeight, weightOK, whatPct: r1(whatRaw), whatPartial, objDone: doneObjs.length, comps, howPct: r1(howRaw), rated: rated.length, overall: r1(overallRaw),
    whatContrib: whatRaw == null ? null : round1(whatRaw * C.whatWeight / 100), howContrib: howRaw == null ? null : round1(howRaw * C.howWeight / 100) };
}
