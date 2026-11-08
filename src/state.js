/* =========================================================
   SCORE PERFORMANCE HUB — STATE, PERSISTENCE, WORKFLOW STATUS
   Saved in the browser (localStorage) on every change.
   ========================================================= */
let _uid = 0;
const uid = (p = "x") => p + Date.now().toString(36) + (_uid++).toString(36);

function blankObjective() { return { id: uid("o"), objective: "", kpi: "", weight: "", evidence: "", evidenceOther: "", freq: "" }; }
function freshRecord() {
  return {
    goals: { status: "not_started", objectives: [], comps: [], submits: 0, revisions: 0, tried: false },
    align: { log: [], node: null, outcome: null, popup: false },
    evidence: [],
    midyear: { log: [], asked: [], closed: false, note: "", started: false },
    appraisal: { status: "not_started", what: {}, how: {}, overall: { what: null, how: null, final: null, just: "", strengths: "", dev: "" }, tried: false, revising: false, history: [] },
    reflection: { log: [], choice: null, biases: [], decision: null, just: "", done: false, popup: false },
    sa: {}, fac: {}, read: {}, pc: {}
  };
}
function freshState() {
  return {
    v: 1,
    session: null, /* { name, started, legacyImported } */
    emp: null,
    released: { midyear: false, yearend: false },
    read: {},
    recs: Object.fromEntries(EMP_ORDER.map(e => [e, freshRecord()])),
    saved: null
  };
}
function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === "object") {
    const out = Array.isArray(base) ? [] : { ...base };
    for (const k of Object.keys(over)) out[k] = (base && typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k])) ? deepMerge(base[k], over[k]) : over[k];
    return out;
  }
  return over;
}
function storageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function storageSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function loadState() {
  const raw = storageGet(APP.storeKey);
  if (raw) { try { const s = JSON.parse(raw); if (s && s.v === 1) return deepMerge(freshState(), s); } catch (e) { /* corrupted: start fresh */ } }
  return freshState();
}
let S = loadState();
let _saveT = null;
function save(now) {
  const run = () => { S.saved = Date.now(); storageSet(APP.storeKey, JSON.stringify(S)); };
  clearTimeout(_saveT);
  if (now) run(); else _saveT = setTimeout(run, 200);
}
window.addEventListener("beforeunload", () => save(true));
window.addEventListener("pagehide", () => save(true));

/* ---------- Classic version data (never deleted) ---------- */
function legacyData() {
  const raw = storageGet(APP.legacyKey);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw), g = s.group ? GROUPS.find(x => x.n === s.group) : null;
    if (!g) return { emp: null, objectives: [] };
    const c = s.begins && s.begins.contracts && s.begins.contracts[g.emp];
    const ms = (c && c.measures || []).filter(m => (m.measure || "").trim());
    return { emp: g.emp, objectives: ms.map(m => ({ id: uid("o"), objective: m.measure || "", kpi: m.target || "", weight: m.weight === "" || m.weight == null ? "" : Number(m.weight), evidence: m.evidence || "", evidenceOther: "", freq: m.freq || "" })) };
  } catch (e) { return null; }
}
function importLegacy() {
  const L = legacyData();
  if (!L || !L.emp) return false;
  S.emp = L.emp;
  const g = S.recs[L.emp].goals;
  if (L.objectives.length) { g.objectives = L.objectives; g.status = "draft"; }
  S.session.legacyImported = true;
  return true;
}

/* ---------- Session ---------- */
function startSession(name, withLegacy) {
  S = freshState();
  S.session = { name: (name || "").trim() || "Manager", started: Date.now(), legacyImported: false };
  if (withLegacy) importLegacy();
  save(true);
}
const rec = (emp = S.emp) => emp ? S.recs[emp] : null;
const EMP = (emp = S.emp) => emp ? EMPLOYEES[emp] : null;

/* ---------- Derived workflow status ---------- */
const STATUS_LABEL = {
  not_started: "Not Started", draft: "Draft", pending_alignment: "Pending Employee Alignment", approved: "Approved",
  in_progress: "In Progress", completed: "Completed", locked: "Not Yet Open", submitted: "Submitted", action: "Action Required"
};
const goalsApproved = (r = rec()) => !!r && r.goals.status === "approved";
function evidenceStatus(r = rec()) { if (!r || !goalsApproved(r)) return "locked"; return r.evidence.length ? "in_progress" : "not_started"; }
function midyearStatus(r = rec()) {
  if (!r || !goalsApproved(r) || !S.released.midyear) return "locked";
  if (r.midyear.closed) return "completed";
  return r.midyear.log.length > 1 ? "in_progress" : "action";
}
function appraisalStatus(r = rec()) {
  if (!r || !goalsApproved(r) || !S.released.yearend) return "locked";
  if (r.reflection.done) return "completed";
  if (r.appraisal.status === "submitted") return "submitted";
  return r.appraisal.status; /* not_started | draft */
}
function conversationsStatus(r = rec()) {
  if (!r) return "locked";
  const g = r.goals.status;
  if (g === "pending_alignment") return "action";
  if (midyearStatus(r) === "action" || midyearStatus(r) === "in_progress") return "action";
  if (r.appraisal.status === "submitted" && !r.reflection.done) return "action";
  if (r.align.log.length || r.midyear.log.length) return "in_progress";
  return "not_started";
}
function roundOneDone(r = rec()) { return goalsApproved(r); }
function roundTwoDone(r = rec()) { return !!r && r.reflection.done; }

/* ---------- Plan helpers ---------- */
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
function weightTotal(r = rec()) { return r.goals.objectives.reduce((a, o) => a + num(o.weight), 0); }
function objMissing(o) {
  const m = [];
  if (!o.objective.trim()) m.push("Objective");
  if (!o.kpi.trim()) m.push("KPI / Performance measure");
  if (o.weight === "" || o.weight == null) m.push("Weight");
  else if (!(num(o.weight) > 0) || num(o.weight) > 100) m.push("Weight between 1 and 100");
  if (!o.evidence) m.push("Evidence source");
  else if (o.evidence === "Other" && !o.evidenceOther.trim()) m.push("Name the other evidence source");
  if (!o.freq) m.push("Review frequency");
  return m;
}
const evidenceLabel = (o) => o.evidence === "Other" ? (o.evidenceOther.trim() || "Other") : o.evidence;
function planValidation(r = rec()) {
  const g = r.goals, errors = [], notes = [];
  const n = g.objectives.length;
  if (!n) errors.push("Add at least one performance objective.");
  g.objectives.forEach((o, i) => { const m = objMissing(o); if (m.length) errors.push(`Objective ${i + 1}: ${m.join(", ")}.`); });
  const wt = weightTotal(r);
  if (n && wt !== 100) errors.push(`Objective weights total ${wt}%. They must total 100%.`);
  if (n && (n < OBJ_RANGE.min || n > OBJ_RANGE.max)) notes.push(`You have ${n} objective${n === 1 ? "" : "s"}. ${OBJ_RANGE.min}–${OBJ_RANGE.max} is the recommended range.`);
  const c = g.comps.length;
  if (c < COMP_RANGE.min || c > COMP_RANGE.max) errors.push(`Select ${COMP_RANGE.min}–${COMP_RANGE.max} competencies (currently ${c}).`);
  g.comps.forEach(k => { if (!k.level) errors.push(`${(competencyById(S.emp, k.id) || {}).name || "Competency"}: choose the expected proficiency level.`); });
  return { errors, notes, ok: errors.length === 0 };
}
function compName(id, emp = S.emp) { return (competencyById(emp, id) || {}).name || "Competency"; }
function planItems(r = rec(), emp = S.emp) {
  return [
    ...r.goals.objectives.map((o, i) => ({ id: o.id, kind: "obj", l: `Objective ${i + 1}: ${o.objective || "Untitled"}`, short: o.objective || `Objective ${i + 1}` })),
    ...r.goals.comps.map(c => ({ id: c.id, kind: "comp", l: `Competency: ${compName(c.id, emp)}`, short: compName(c.id, emp) }))
  ];
}
function linkLabel(id, r = rec()) { if (id === "general") return "General / other"; const it = planItems(r).find(x => x.id === id); return it ? it.short : "Removed item"; }

/* ---------- Appraisal helpers ---------- */
function appraisalValidation(r = rec()) {
  const a = r.appraisal, errors = [];
  r.goals.objectives.forEach((o, i) => {
    const x = a.what[o.id] || {}, miss = [];
    if (!(x.actual || "").trim()) miss.push("actual performance");
    if (!x.rating) miss.push("rating");
    if (!(x.just || "").trim()) miss.push("evidence / justification");
    if (miss.length) errors.push(`Objective ${i + 1}: ${miss.join(", ")}.`);
  });
  r.goals.comps.forEach(c => {
    const x = a.how[c.id] || {}, miss = [];
    if (!(x.observed || "").trim()) miss.push("observed behaviours");
    if (!x.rating) miss.push("rating");
    if (!(x.just || "").trim()) miss.push("justification");
    if (miss.length) errors.push(`${compName(c.id)}: ${miss.join(", ")}.`);
  });
  const o = a.overall, miss = [];
  if (!o.what) miss.push("overall WHAT rating");
  if (!o.how) miss.push("overall HOW rating");
  if (!o.final) miss.push("final overall rating");
  if (!o.just.trim()) miss.push("final justification");
  if (!o.strengths.trim()) miss.push("key strengths");
  if (!o.dev.trim()) miss.push("development priorities");
  if (miss.length) errors.push(`Overall evaluation: ${miss.join(", ")}.`);
  return { errors, ok: errors.length === 0 };
}
const ratingLabel = (v) => { const r = RATING_SCALE.find(x => x.v === v); return r ? `${r.v} · ${r.l}` : "Not rated"; };
