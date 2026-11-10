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
  kpiCap: 120,             /* maximum KPI achievement % (not yet approved) */
  lowerIsBetter: "inverse",/* "inverse" = target ÷ actual × 100 ; "review" = flag for manager review */
  howScale: 5              /* HOW achievement = average rating ÷ howScale × 100 */
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
    const nums = [...seg.matchAll(NUM_RX)].filter(m => !/q$/i.test(seg.slice(0, m.index).trim().slice(-1)));
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
/* Parse an entered actual: blank → null (never zero); invalid → NaN */
function parseActual(v) {
  const s = String(v == null ? "" : v).trim();
  if (!s) return null;
  const m = s.replace(",", ".").match(/^(-?\d+(?:\.\d+)?)\s*(%|\/\s*\d+)?$/);
  return m ? Number(m[1]) : NaN;
}
const round1 = (x) => Math.round(x * 10) / 10;
/* Achievement of one KPI. Returns { pct, status, note } where status ∈ ok | blank | invalid | review */
function kpiAchievement(k, entry) {
  const cap = APPRAISAL_CONFIG.kpiCap, e = entry || {};
  const type = e.type || k.type, dir = e.dir || k.dir;
  if (type === "review") {
    const v = parseActual(e.manual);
    if (v == null) return { pct: null, status: "blank", note: "Enter your assessed achievement %" };
    if (Number.isNaN(v) || v < 0 || v > cap) return { pct: null, status: "invalid", note: `Enter a percentage between 0 and ${cap}` };
    return { pct: round1(v), status: "ok", note: "Manager assessment (flagged for review)" };
  }
  if (k.target == null || k.target === 0) return { pct: null, status: "review", note: "No usable target: switch to manager review" };
  const a = parseActual(e.actual);
  if (a == null) return { pct: null, status: "blank", note: "Enter the actual result" };
  if (Number.isNaN(a) || a < 0) return { pct: null, status: "invalid", note: "Enter a number, e.g. 92" };
  let raw;
  if (dir === "lower") raw = a === 0 ? cap : (k.target / a) * 100;
  else raw = (a / k.target) * 100;
  const pct = round1(Math.min(cap, raw));
  return { pct, status: "ok", note: raw > cap ? `Capped at ${cap}% (calculated ${round1(raw)}%)` : dir === "lower" ? "Lower is better: target ÷ actual" : "Actual ÷ target" };
}
/* Full appraisal calculation from the plan and the participant's entries */
function appraisalCalc(r = rec()) {
  const a = r.r3.appraisal, C = APPRAISAL_CONFIG;
  const objectives = r.goals.objectives.map(o => {
    const kpis = parseKpis(o.kpi), entries = ((a.what[o.id] || {}).kpis) || {};
    const rows = kpis.map((k, i) => ({ k, i, e: entries[i] || {}, share: 100 / kpis.length, res: kpiAchievement(k, entries[i]) }));
    const done = rows.every(x => x.res.status === "ok");
    const ach = done ? round1(rows.reduce((s, x) => s + x.res.pct, 0) / rows.length) : null;
    const weight = num(o.weight);
    return { o, rows, ach, weight, contrib: ach == null ? null : round1(ach * weight / 100), done };
  });
  const doneObjs = objectives.filter(x => x.done);
  const whatPct = objectives.length && doneObjs.length === objectives.length ? round1(objectives.reduce((s, x) => s + x.contrib, 0)) : null;
  const whatPartial = round1(doneObjs.reduce((s, x) => s + x.contrib, 0));
  const comps = r.goals.comps.map(c => ({ c, rating: (a.how[c.id] || {}).rating || null }));
  const rated = comps.filter(x => x.rating);
  const howPct = comps.length && rated.length === comps.length ? round1(rated.reduce((s, x) => s + x.rating, 0) / rated.length / C.howScale * 100) : null;
  const overall = whatPct != null && howPct != null ? round1(whatPct * C.whatWeight / 100 + howPct * C.howWeight / 100) : null;
  return { objectives, whatPct, whatPartial, objDone: doneObjs.length, comps, howPct, rated: rated.length, overall,
    whatContrib: whatPct == null ? null : round1(whatPct * C.whatWeight / 100), howContrib: howPct == null ? null : round1(howPct * C.howWeight / 100) };
}
