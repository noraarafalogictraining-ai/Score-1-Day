/* =========================================================
   SCORE PILOT — STATE, PERSISTENCE, WORKFLOW STATUS, PULSE ENGINE
   Saved in the browser (localStorage) on every change; survives refresh.
   ========================================================= */
let _uid = 0;
const uid = (p = "x") => p + Date.now().toString(36) + (_uid++).toString(36);

function blankObjective() { return { id: uid("o"), objective: "", kpi: "", weight: "", evidence: "", evidenceOther: "", freq: "" }; }
function freshRecord() {
  return {
    goals: { status: "not_started", objectives: [], comps: [], tried: false, submits: 0 },
    align: { log: [], ready: false, confirmed: false, assessment: null, error: null, manual: false },
    plan: { assessment: null, error: null },
    evidence: [],
    r2: { seenDashboard: false, interpretation: "", diag: { log: [], ended: false }, submitted: false, assessment: null, error: null, pathway: null, manual: false },
    r3: {
      dataset: null, error: null,
      appraisal: { status: "not_started", what: {}, how: {}, overall: { what: null, how: null, final: null, just: "", strengths: "", dev: "" }, tried: false, revisions: 0 },
      conv: { log: [], ended: false },
      bias: { result: null, error: null, reflection: "", tried: false },
      final: { assessment: null, error: null }, done: false
    },
    pulse: { values: { ...PULSE.baseline }, history: [], slots: {} },
    fac: {}, pc: {}
  };
}
function freshState() {
  return { v: 2, session: null, emp: PILOT.employee, released: { r2: false, r3: false }, read: {}, recs: Object.fromEntries(PILOT.active.map(e => [e, freshRecord()])), saved: null };
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
  if (raw) { try { const s = JSON.parse(raw); if (s && s.v === 2) return deepMerge(freshState(), s); } catch (e) { /* unreadable: start fresh */ } }
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

function startSession(name) {
  S = freshState();
  S.session = { name: (name || "").trim() || "Commercial Director", started: Date.now() };
  save(true);
}
const rec = (emp = S.emp) => S.recs[emp];
const EMP = (emp = S.emp) => EMPLOYEES[emp];

/* ---------- Employee Pulse: deterministic rules engine ---------- */
function applyPulse(r, key, reason) {
  const ev = PULSE.events[key];
  if (!ev || r.pulse.slots[ev.slot]) return false;          /* each slot counts once */
  const before = { ...r.pulse.values }, delta = {};
  for (const d of PULSE.dims) {
    const v = Math.max(0, Math.min(100, before[d.id] + (ev.d[d.id] || 0)));
    delta[d.id] = v - before[d.id]; r.pulse.values[d.id] = v;
  }
  r.pulse.slots[ev.slot] = key;
  r.pulse.history.push({ key, label: ev.label, round: ev.round, delta, after: { ...r.pulse.values }, reason: reason || "", at: Date.now() });
  return true;
}
function pulseNote(r, slot, label, reason, round) { /* records a "no change" decision transparently */
  if (r.pulse.slots[slot]) return;
  r.pulse.slots[slot] = "none";
  r.pulse.history.push({ key: "none", label, round, delta: { performance: 0, trust: 0, development: 0 }, after: { ...r.pulse.values }, reason, at: Date.now() });
}

/* ---------- Workflow status ---------- */
const STATUS_LABEL = { not_started: "Not Started", draft: "Draft", pending_alignment: "Pending Employee Alignment", approved: "Approved", in_progress: "In Progress", completed: "Completed", locked: "Not Yet Open", submitted: "Submitted", action: "Action Required" };
const goalsApproved = (r = rec()) => r.goals.status === "approved";
function currentRound() { return S.released.r3 ? 3 : S.released.r2 ? 2 : 1; }
function r2Status(r = rec()) { if (!S.released.r2 || !goalsApproved(r)) return "locked"; if (r.r2.submitted) return "completed"; return r.r2.diag.log.length > 1 || r.r2.interpretation ? "in_progress" : "action"; }
function r3Status(r = rec()) { if (!S.released.r3 || !r.r2.submitted) return "locked"; if (r.r3.done) return "completed"; return r.r3.appraisal.status === "not_started" ? "action" : "in_progress"; }
function appraisalStatus(r = rec()) { if (r3Status(r) === "locked" || !r.r3.dataset) return "locked"; if (r.r3.done) return "completed"; return r.r3.appraisal.status; }
function evidenceStatus(r = rec()) { if (!goalsApproved(r)) return "locked"; return r.evidence.length ? "in_progress" : "not_started"; }
function conversationsStatus(r = rec()) {
  if (r.goals.status === "pending_alignment") return "action";
  if (r2Status(r) !== "locked" && !r.r2.diag.ended) return "action";
  if (r.r3.appraisal.status === "submitted" && !r.r3.conv.ended) return "action";
  return r.align.log.length ? "in_progress" : "not_started";
}

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
  const g = r.goals, errors = [], notes = [], n = g.objectives.length;
  if (!n) errors.push("Add at least one performance objective.");
  g.objectives.forEach((o, i) => { const m = objMissing(o); if (m.length) errors.push(`Objective ${i + 1}: ${m.join(", ")}.`); });
  const wt = weightTotal(r);
  if (n && wt !== 100) errors.push(`Objective weights total ${wt}%. They must total 100%.`);
  if (n && (n < OBJ_RANGE.min || n > OBJ_RANGE.max)) notes.push(`You have ${n} objective${n === 1 ? "" : "s"}. ${OBJ_RANGE.min}–${OBJ_RANGE.max} is the recommended range.`);
  const c = g.comps.length;
  if (c < COMP_RANGE.min || c > COMP_RANGE.max) errors.push(`Select ${COMP_RANGE.min}–${COMP_RANGE.max} competencies (currently ${c}).`);
  g.comps.forEach(k => { if (!k.level) errors.push(`${compName(k.id)}: choose the expected proficiency level.`); });
  return { errors, notes, ok: errors.length === 0 };
}
function compName(id) { return (competencyById(S.emp, id) || {}).name || "Competency"; }
function planItems(r = rec()) {
  return [
    ...r.goals.objectives.map((o, i) => ({ id: o.id, kind: "obj", l: `Objective ${i + 1}: ${o.objective || "Untitled"}`, short: o.objective || `Objective ${i + 1}` })),
    ...r.goals.comps.map(c => ({ id: c.id, kind: "comp", l: `Competency: ${compName(c.id)}`, short: compName(c.id) }))
  ];
}
function linkLabel(id, r = rec()) { if (id === "general") return "General / other"; const it = planItems(r).find(x => x.id === id); return it ? it.short : "Removed item"; }
const levelLabel = (id) => (LEVELS.find(l => l.id === id) || {}).l || "Not set";

/* ---------- Payloads for the server ---------- */
function planPayload(r = rec()) {
  return {
    objectives: r.goals.objectives.map(o => ({ objective: o.objective, kpi: o.kpi, weight: num(o.weight), evidence: evidenceLabel(o), freq: o.freq })),
    comps: r.goals.comps.map(c => ({ name: compName(c.id), level: levelLabel(c.level), standard: c.standard || "" }))
  };
}
function evidencePayload(r = rec()) { return r.evidence.map(e => ({ period: e.period, link: linkLabel(e.link, r), text: e.text, source: e.source === "Other" ? e.sourceOther : e.source, impact: e.impact, action: e.action, status: e.status })); }
function appraisalPayload(r = rec()) {
  const a = r.r3.appraisal;
  return {
    what: r.goals.objectives.map(o => ({ objective: o.objective, kpi: o.kpi, weight: num(o.weight), actual: (a.what[o.id] || {}).actual || "", rating: (a.what[o.id] || {}).rating || null, just: (a.what[o.id] || {}).just || "" })),
    how: r.goals.comps.map(c => ({ name: compName(c.id), level: levelLabel(c.level), standard: c.standard || "", observed: (a.how[c.id] || {}).observed || "", rating: (a.how[c.id] || {}).rating || null, just: (a.how[c.id] || {}).just || "" })),
    overall: { ...a.overall }
  };
}
const managerWords = (log, max) => { const t = log.filter(m => m.from === "manager").map(m => m.text).join(" / "); return t.length > max ? "…" + t.slice(-max) : t; };
function priorPayload(r = rec()) {
  const al = r.align.assessment, a2 = r.r2.assessment;
  return {
    alignment: al && al.classification ? al.classification.behaviour : null,
    alignmentSummary: managerWords(r.align.log, 1400),
    coaching: a2 ? (r.pulse.slots.coaching === "constructive" ? "constructive" : r.pulse.slots.coaching === "punitive" ? "punitive" : "neutral") : null,
    coachingSummary: managerWords(r.r2.diag.log, 2400)
  };
}
function appraisalValidation(r = rec()) {
  const a = r.r3.appraisal, errors = [];
  r.goals.objectives.forEach((o, i) => { const x = a.what[o.id] || {}, miss = []; if (!(x.actual || "").trim()) miss.push("actual result / evidence"); if (!x.rating) miss.push("rating"); if (!(x.just || "").trim()) miss.push("justification"); if (miss.length) errors.push(`Objective ${i + 1}: ${miss.join(", ")}.`); });
  r.goals.comps.forEach(c => { const x = a.how[c.id] || {}, miss = []; if (!(x.observed || "").trim()) miss.push("observed behaviour"); if (!x.rating) miss.push("rating"); if (!(x.just || "").trim()) miss.push("justification"); if (miss.length) errors.push(`${compName(c.id)}: ${miss.join(", ")}.`); });
  const o = a.overall, miss = [];
  if (!o.what) miss.push("overall WHAT rating"); if (!o.how) miss.push("overall HOW rating"); if (!o.final) miss.push("overall performance rating");
  if (!o.just.trim()) miss.push("evidence-based justification"); if (!o.strengths.trim()) miss.push("key strengths"); if (!o.dev.trim()) miss.push("development priorities");
  if (miss.length) errors.push(`Overall appraisal: ${miss.join(", ")}.`);
  return { errors, ok: errors.length === 0 };
}
const ratingLabel = (v) => { const r = RATING_SCALE.find(x => x.v === v); return r ? `${r.v} · ${r.l}` : "Not rated"; };
