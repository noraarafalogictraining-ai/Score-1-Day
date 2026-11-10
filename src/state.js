/* =========================================================
   SCORE PILOT — STATE, PERSISTENCE, WORKFLOW STATUS, PULSE ENGINE
   Saved in the browser (localStorage) on every change; survives refresh.
   ========================================================= */
let _uid = 0;
const uid = (p = "x") => p + Date.now().toString(36) + (_uid++).toString(36);

function blankObjective() { return { id: uid("o"), objective: "", measure: "", due: "", weight: "" }; }
function blankPdp() { return { short: "", long: "", ld: [{ area: "", action: "" }], training: [], employee: "", manager: "" }; }
function freshRecord() {
  return {
    goals: { status: "not_started", objectives: [], comps: [], tried: false, submits: 0 },
    align: { log: [], ready: false, confirmed: false, assessment: null, error: null, manual: false },
    plan: { assessment: null, error: null },
    evidence: [],
    r2: { seenDashboard: false, interpretation: "", diag: { log: [], ended: false }, submitted: false, assessment: null, error: null, pathway: null, manual: false },
    r3: {
      dataset: null, error: null,
      appraisal: { v: 2, status: "not_started", what: {}, how: {}, pdp: blankPdp(), tried: false, revisions: 0, flags: [] },
      conv: { log: [], ended: false, completed: false, outcome: null },
      sbii: { result: null, error: null },
      bias: { result: null, error: null, reflection: "", tried: false },
      final: { assessment: null, error: null }, done: false
    },
    pulse: { values: { ...PULSE.baseline }, history: [], slots: {} },
    chat: { seen: 0 },
    fac: {}, pc: {}
  };
}
function freshState() {
  return { v: 2, session: null, emp: PILOT.employee, released: { r2: false, r3: false }, read: {}, notified: {}, recs: Object.fromEntries(PILOT.active.map(e => [e, freshRecord()])), saved: null };
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
  if (raw) { try { const s = JSON.parse(raw); if (s && s.v === 2) { Object.values(s.recs || {}).forEach(migrateRecord); return deepMerge(freshState(), s); } } catch (e) { /* unreadable: start fresh */ } }
  return freshState();
}
/* ---------- Migration of sessions saved before the Objectives / Performance Appraisal forms ----------
   Keeps every participant-written text. Never converts old 1–5 ratings to the 1–4 scale: they are cleared
   and flagged for re-rating. Several year-end results for one objective are kept for review, not merged. */
function migrateRecord(r) {
  if (!r || !r.goals) return;
  (r.goals.objectives || []).forEach(o => {
    if (o.measure == null) o.measure = o.kpi || "";
    if (o.due == null) o.due = "";
    delete o.kpi;
  });
  const a = r.r3 && r.r3.appraisal;
  if (!a || a.v === 2) return;
  a.flags = a.flags || [];
  Object.keys(a.what || {}).forEach(id => {
    const w = a.what[id] || {}, ks = w.kpis ? Object.values(w.kpis) : null;
    if (!ks) return;
    if (ks.length === 1) { const k = ks[0]; a.what[id] = { actual: k.actual || "", comments: k.evidence || "", manual: k.manual || "", basis: k.basis || "", reviewed: !!k.reviewed, mode: k.type === "review" ? "review" : "", dir: k.dir || "" }; }
    else { a.what[id] = { actual: "", comments: ks.map(k => k.evidence).filter(Boolean).join("\n"), legacy: ks }; a.flags.push(`Objective results entered before the form change were kept for review (objective ${id}).`); }
  });
  Object.keys(a.how || {}).forEach(id => {
    const h = a.how[id] || {}, comments = [h.observed, h.just].filter(x => String(x || "").trim()).join("\n");
    a.how[id] = { rating: null, comments: h.comments || comments, legacyRating: h.rating || null };
    if (h.rating) a.flags.push(`${compName(id)}: the earlier rating (${h.rating} on the former 1–5 scale) was not converted. Please rate again on the 1–4 scale.`);
  });
  const o = a.overall || {};
  a.pdp = a.pdp || blankPdp();
  if (!a.pdp.manager) a.pdp.manager = [o.strengths && `Strengths: ${o.strengths}`, o.dev && `Development priorities: ${o.dev}`, o.just && o.just].filter(Boolean).join("\n");
  delete a.overall;
  if (a.flags.length && a.status === "submitted" && !r.r3.done) { a.status = "draft"; a.flags.push("The appraisal was returned to draft because it needs re-rating."); }
  a.v = 2;
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
  if (!String(o.objective || "").trim()) m.push("Objective / Project");
  if (!String(o.measure || "").trim()) m.push("Measurement");
  if (!String(o.due || "").trim()) m.push("Due date");
  if (o.weight === "" || o.weight == null) m.push("Weight");
  else if (!(num(o.weight) > 0) || num(o.weight) > 100) m.push("Weight between 1 and 100");
  return m;
}
const words = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length;
/* Objectives: completeness and SMART blocking checks (target/completion rule; due date in the rating period) */
function objectiveValidation(r = rec()) {
  const g = r.goals, errors = [], tips = [], n = g.objectives.length, wt = weightTotal(r);
  if (!n) errors.push("Add at least one objective.");
  g.objectives.forEach((o, i) => {
    const m = objMissing(o);
    if (m.length) { errors.push(`Objective ${i + 1}: complete ${m.join(", ")}.`); return; }
    const sc = smartCheck(o);
    sc.blocking.forEach(k => errors.push(`Objective ${i + 1} · ${SMART_LABEL[k]}: ${sc.checks[k].msg}`));
  });
  if (n && wt !== 100) errors.push(`Objective weights total ${wt}%. They must total 100%.`);
  if (n && (n < OBJ_RANGE.min || n > OBJ_RANGE.max)) tips.push(`${n} objective${n === 1 ? "" : "s"}: ${OBJ_RANGE.min}–${OBJ_RANGE.max} is the recommended range.`);
  g.objectives.forEach((o, i) => { if (num(o.weight) > 0 && num(o.weight) < 10) tips.push(`Objective ${i + 1}: a weight under 10% suggests it may not be a priority for the year.`); });
  return { errors, tips, ok: errors.length === 0 };
}
/* Competencies tab */
function competencyValidation(r = rec()) {
  const g = r.goals, errors = [], tips = [], c = g.comps.length;
  if (c < COMP_RANGE.min || c > COMP_RANGE.max) errors.push(`Select ${COMP_RANGE.min}–${COMP_RANGE.max} competencies (currently ${c}).`);
  g.comps.forEach(k => {
    const n = compName(k.id), miss = [];
    if (!k.level) miss.push("expected proficiency level");
    if (!(k.standard || "").trim()) miss.push("expected behavioral standard");
    if (miss.length) errors.push(`${n}: ${miss.join(" and ")}.`);
    else if (words(k.standard) < 6) tips.push(`${n}: describe the behavior in more detail: what would Omar do or say?`);
    else if (/\b(good|great|strong|excellent|positive attitude|team player)\b/i.test(k.standard) && words(k.standard) < 12) tips.push(`${n}: the standard reads like a trait. Describe what you would observe Omar doing.`);
  });
  return { errors, tips, ok: errors.length === 0 };
}
function planValidation(r = rec()) {
  const a = objectiveValidation(r), b = competencyValidation(r);
  return { errors: [...a.errors, ...b.errors], notes: [...a.tips, ...b.tips], ok: a.ok && b.ok };
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
    objectives: r.goals.objectives.map(o => ({ objective: o.objective, measure: o.measure, due: o.due, weight: num(o.weight) })),
    comps: r.goals.comps.map(c => ({ name: compName(c.id), level: levelLabel(c.level), standard: c.standard || "" }))
  };
}
function evidencePayload(r = rec()) { return r.evidence.map(e => ({ period: e.period, link: linkLabel(e.link, r), text: e.text, source: e.source === "Other" ? e.sourceOther : e.source, impact: e.impact, action: e.action, status: e.status })); }
function appraisalPayload(r = rec()) {
  const a = r.r3.appraisal, c = appraisalCalc(r), p = a.pdp || blankPdp();
  const actualText = (x) => x.method === "review" || (x.method === "milestone" && ["late", "partial"].includes(x.e.milestone))
    ? `${x.method === "milestone" ? (MILESTONE_OPTIONS.find(m => m[0] === x.e.milestone) || [, ""])[1] + "; " : ""}manager-assessed ${x.e.manual || "—"}%${x.e.basis ? `; basis: ${String(x.e.basis).slice(0, 400)}` : ""}${x.res.status === "unresolved" ? " (needs clarification)" : ""}`
    : x.method === "milestone" ? (MILESTONE_OPTIONS.find(m => m[0] === x.e.milestone) || [, ""])[1] : (x.e.actual || "");
  return {
    what: c.objectives.map(x => ({ objective: x.o.objective, measure: x.o.measure || "", target: fmtDefinitionTarget(x.def), due: fmtDue(x.o.due), weight: x.weight, method: METHOD_LABEL[x.method], actual: actualText(x), achievement: x.res.pct, weighted: x.weighted, comments: x.e.comments || "", matched: `${x.match.label}` })),
    how: r.goals.comps.map(k => { const h = a.how[k.id] || {}; return { name: compName(k.id), level: levelLabel(k.level), standard: k.standard || "", rating: COMPETENCY_SCALE.some(s => s.v === h.rating) ? h.rating : null, comments: h.comments || "" }; }),
    overall: { objectivesScore: c.objectivesScore, competenciesScore: c.competenciesScore, score: c.overall, rating: c.band ? c.band.label : "", managerComments: p.manager || "", employeeComments: p.employee || "" },
    pdp: { short: p.short || "", long: p.long || "", ld: (p.ld || []).filter(x => (x.area || "").trim() || (x.action || "").trim()).map(x => ({ area: x.area || "", action: x.action || "" })), training: (p.training || []).filter(x => (x.course || "").trim()).map(x => ({ course: x.course || "", source: x.source || "", date: x.date || "" })) }
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
/* Validation by part. Parts I–II must be complete to share the appraisal with Omar; all three to finalise. */
function appraisalValidation(r = rec()) {
  const a = r.r3.appraisal, c = appraisalCalc(r), p = a.pdp || blankPdp(), I = [], II = [], III = [];
  c.comps.forEach(x => { const miss = []; if (!x.rating) miss.push("rating (1–4)"); if (!String(x.h.comments || "").trim()) miss.push("comments supporting the rating"); if (miss.length) I.push(`${compName(x.c.id)}: add the ${miss.join(" and ")}.`); });
  c.objectives.forEach(x => {
    const tag = `Objective ${x.i + 1}`;
    if (["blank", "invalid", "unresolved"].includes(x.res.status)) II.push(`${tag}: ${x.res.note.charAt(0).toLowerCase() + x.res.note.slice(1)}.`);
    if (!String(x.e.comments || "").trim()) II.push(`${tag}: add comments or supporting evidence for the result.`);
  });
  if (c.objectives.length && !c.weightOK) II.push(`Objective weights total ${c.totalWeight}%, not 100%, so the objectives score can't be calculated. Weights were agreed in January and can't be changed here; contact HR.`);
  if (!String(p.short || "").trim()) III.push("Career planning: add the short-term plan.");
  if (!String(p.long || "").trim()) III.push("Career planning: add the long-term plan.");
  const ld = (p.ld || []).filter(x => (x.area || "").trim() || (x.action || "").trim());
  if (!ld.length) III.push("Learning & development plan: add at least one improvement area with an action.");
  ld.forEach((x, i) => { if (!(x.area || "").trim() || !(x.action || "").trim()) III.push(`Learning & development plan, row ${i + 1}: complete both the improvement area and the action.`); });
  (p.training || []).forEach((x, i) => { if (((x.source || "").trim() || x.date) && !(x.course || "").trim()) III.push(`Training & development, row ${i + 1}: add the training course.`); });
  if (!String(p.manager || "").trim()) III.push("Additional comments: add the direct manager's comments.");
  const scoreOK = c.overall != null;
  return { I, II, III, errors: [...I, ...II, ...III], shareOK: !I.length && !II.length && scoreOK, ok: !I.length && !II.length && !III.length && scoreOK };
}
const ratingLabel = (v) => { const r = COMPETENCY_SCALE.find(x => x.v === v); return r ? `${r.v} · ${r.l}` : "Not rated"; };

/* ---------- Omar chat: one visible thread built from the internal contexts ---------- */
function chatThread(r = rec()) {
  const out = CHAT.history.map((m, i) => ({ ...m, ctx: "history", key: "h" + i }));
  [["alignment", r.align.log], ["diagnostic", r.r2.diag.log], ["appraisal", r.r3.conv.log]].forEach(([ctx, log]) =>
    log.forEach((m, i) => { if (m.from === "manager" || m.from === "employee") out.push({ ...m, ctx, key: ctx + i }); }));
  return out;
}
const incoming = (r = rec()) => chatThread(r).filter(m => m.ctx !== "history" && m.from === "employee").length;
function chatUnread(r = rec()) { return Math.max(0, incoming(r) - (r.chat.seen || 0)); }
function markChatSeen(r = rec()) { const n = incoming(r); if (r.chat.seen !== n) { r.chat.seen = n; save(); } }
/* Which internal context a new manager message belongs to (null = no open topic) */
function activeChatContext(r = rec()) {
  if (r.goals.status === "pending_alignment") return "alignment";
  if (r2Status(r) !== "locked" && !r.r2.diag.ended && !r.r2.submitted) return "diagnostic";
  if (r.r3.appraisal.status === "submitted" && !r.r3.conv.ended && !r.r3.done) return "appraisal";
  return null;
}
const managerCount = (log) => log.filter(m => m.from === "manager").length;
