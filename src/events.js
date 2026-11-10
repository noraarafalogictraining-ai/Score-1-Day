/* =========================================================
   EVENTS & WORKFLOW ACTIONS
   ========================================================= */
let _undo = null;
function afterBind(path) {
  const r = rec();
  if (path.includes(".goals.") && r.goals.status === "not_started") r.goals.status = "draft";
  if (path.includes(".r3.appraisal.") && r.r3.appraisal.status === "not_started") r.r3.appraisal.status = "draft";
}
const wire = (log) => log.filter(m => m.from === "manager" || m.from === "employee").map(m => ({ from: m.from, text: m.text }));
function convContext(kind, r = rec()) {
  const ctx = { plan: planPayload(r), pulse: { ...r.pulse.values } };
  if (kind !== "alignment") ctx.prior = priorPayload(r);
  if (kind === "appraisal") { ctx.appraisal = appraisalPayload(r); ctx.pathway = r.r2.pathway; ctx.priorLogs = priorLogs(r); ctx.evidence = evidencePayload(r); }
  return ctx;
}
const priorLogs = (r = rec()) => ({ alignment: wire(r.align.log), diagnostic: wire(r.r2.diag.log) });
const convLog = (kind, r = rec()) => kind === "alignment" ? r.align.log : kind === "diagnostic" ? r.r2.diag.log : r.r3.conv.log;
function applyEvents(r, events, reason) { (events || []).forEach(e => applyPulse(r, e, reason)); }
const clsReason = (a, fallback) => (a && a.feedback && a.feedback.summary) ? a.feedback.summary.slice(0, 220) : fallback;

/* ---------- assessments (server) ---------- */
async function assessRound1() {
  const r = rec(); r.plan.error = null; r.align.error = null;
  const [p, a] = await Promise.allSettled([
    api("/api/assess", { task: "plan", payload: { plan: planPayload(r) } }),
    r.align.manual ? Promise.resolve(null) : api("/api/assess", { task: "alignment", payload: { plan: planPayload(r), history: wire(r.align.log) } })
  ]);
  if (p.status === "fulfilled") r.plan.assessment = p.value; else r.plan.error = `Plan assessment unavailable: ${p.reason.message}`;
  if (a.status === "fulfilled" && a.value) {
    r.align.assessment = a.value;
    const beh = (a.value.classification || {}).behaviour;
    if (a.value.events.length) applyEvents(r, a.value.events, `Alignment conversation assessed as ${beh}.`);
    else pulseNote(r, "alignment", "Alignment: mixed approach", "Concern addressed only partly or inconsistently: no Pulse change.", 1);
  } else if (a.status === "rejected") r.align.error = `Alignment assessment failed: ${a.reason.message}`;
  save(); render();
}
async function assessRound2() {
  const r = rec(); UI.busy = "round2"; r.r2.error = null; render();
  try {
    const res = await api("/api/assess", { task: "round2", payload: { plan: planPayload(r), history: wire(r.r2.diag.log), evidence: evidencePayload(r), interpretation: r.r2.interpretation } });
    r.r2.assessment = res;
    if (!r.r2.manual) r.r2.pathway = res.pathway;
    if (res.events.length) applyEvents(r, res.events, clsReason(res, "Mid-year conversation assessed."));
    else pulseNote(r, "coaching", "Mid-year conversation: no clear pattern", "Neither clearly constructive nor punitive: no Pulse change.", 2);
  } catch (e) { r.r2.error = `The mid-year review could not be processed: ${e.message}`; }
  UI.busy = null; save(); render();
}
async function assessRound3() {
  const r = rec(); UI.busy = "round3"; r.r3.final.error = null; render();
  try {
    const b = r.r3.bias.result;
    if (!r.r3.sbii.result) await runSbii();
    const sb = r.r3.sbii.result;
    const res = await api("/api/assess", { task: "round3", payload: { sbii: sb ? sb.scores : null, appraisal: appraisalPayload(r), history: wire(r.r3.conv.log), pathway: r.r2.pathway, reflection: r.r3.bias.reflection, bias: b ? [b.summary, ...b.flags.map(f => `${f.bias}: ${f.explanation}`)].join("\n") : "" } });
    r.r3.final.assessment = res;
    if (res.events.length) applyEvents(r, res.events, clsReason(res, "Final appraisal assessed."));
    else pulseNote(r, "appraisal", "Final appraisal: mixed", "Appraisal partly evidence-based: no Pulse change.", 3);
    r.r3.done = true;
    UI.busy = null; save(); toast("Appraisal finalised."); go("inbox", "closed"); return;
  } catch (e) { r.r3.final.error = `The appraisal could not be finalised: ${e.message}`; }
  UI.busy = null; save(); render();
}
/* Behind-the-scenes assessment of the appraisal discussion (never shown in the chat) */
async function runSbii() {
  const r = rec(); r.r3.sbii.error = null;
  try {
    const res = await api("/api/assess", { task: "sbii", payload: { appraisal: appraisalPayload(r), history: wire(r.r3.conv.log), pathway: r.r2.pathway, priorLogs: priorLogs(r), completed: !!r.r3.conv.completed } });
    r.r3.sbii.result = res;
    if (res.events.length) applyEvents(r, res.events, r.r3.conv.completed ? "Appraisal discussion completed." : "Appraisal discussion closed before an agreement was reached.");
    else pulseNote(r, "feedback", "Appraisal discussion: no clear pattern", "Neither clearly fair and listening nor blaming: no Pulse change.", 3);
  } catch (e) { r.r3.sbii.error = `The appraisal discussion could not be assessed: ${e.message}`; }
  save(); render();
}
async function runBias() {
  const r = rec(); UI.busy = "bias"; r.r3.bias.error = null; render();
  try { r.r3.bias.result = await api("/api/assess", { task: "bias", payload: { appraisal: appraisalPayload(r), history: wire(r.r3.conv.log), pathway: r.r2.pathway } }); }
  catch (e) { r.r3.bias.error = `Bias check failed: ${e.message}`; }
  UI.busy = null; save(); render();
}
/* Adds Omar's scripted opening to a context once (idempotent: safe on refresh and repeat events) */
function ensureChatOpenings(r = rec()) {
  if (!AIS.openings) return false;
  let changed = false;
  if (r.goals.status === "pending_alignment" && !r.align.log.some(m => m.from === "employee")) { r.align.log.push({ from: "employee", text: AIS.openings.alignment }); changed = true; }
  if (r2Status(r) !== "locked" && !r.r2.diag.log.some(m => m.from === "employee")) { r.r2.diag.log.push({ from: "employee", text: AIS.openings.diagnostic }); changed = true; }
  if (r.r3.appraisal.status === "submitted" && !r.r3.appraisal.revisions && AIS.openings.appraisal && !r.r3.conv.log.some(m => m.from === "employee")) { r.r3.conv.log.push({ from: "employee", text: AIS.openings.appraisal }); changed = true; }
  return changed;
}
function releaseRound(k) {
  if (S.released[k]) return;
  S.released[k] = true; UI.period = null;
  const r = rec();
  if (k === "r2") applyPulse(r, "midyear_disruption", "Valtora's lower-priced Customer360 alternative put the Commercial Department under pressure.");
  ensureChatOpenings(r);
  save();
  if (k === "r3") loadYearEnd();
}
async function loadYearEnd() {
  const r = rec();
  if (r.r3.dataset && r.r3.dataset.registers) return;   /* older saves held a per-pathway dataset: reload the canonical record */
  if (UI.busy === "yearend") return;
  UI.busy = "yearend"; r.r3.error = null;
  try {
    const res = await api("/api/yearend", {});
    r.r3.dataset = res.dataset; r.r3.tag = res.tag; UI.period = null;   /* show the newest period when results arrive */
    if (r.r2.pathway === "A") applyPulse(r, "intervention_followthrough", "Constructive mid-year development plan (assessed in July).");
    else pulseNote(r, "intervention", "No development intervention with follow-through", r.r2.pathway === "B" ? "Limited coaching and follow-up after mid-year: no Pulse change." : "No constructive development support after mid-year: no Pulse change.", 3);
  } catch (e) { r.r3.error = `The year-end update could not be loaded: ${e.message}`; }
  UI.busy = null; save(); render();
}
function afterRoute() {
  const r = rec();
  if (S.session && UI.signedIn && ["yearend", "inbox", "appraisal"].includes(UI.route) && r3Status(r) !== "locked" && !(r.r3.dataset && r.r3.dataset.registers) && !r.r3.error) loadYearEnd();
}

/* ---------- conversation ---------- */
async function sendChat(kind, text) {
  const r = rec(), log = convLog(kind, r);
  if (UI.busy) return;
  if (text) log.push({ from: "manager", text });
  UI.busy = kind; UI.chatErr = null; save(); render();
  try {
    const res = await api("/api/converse", { kind, history: wire(log), context: convContext(kind, r) });
    log.push({ from: "employee", text: res.reply });
    if (kind === "alignment") r.align.ready = !!res.ready;
    if (kind === "appraisal" && res.complete && !r.r3.conv.completed) { r.r3.conv.completed = true; log.push({ from: "sys", text: "Appraisal Discussion Completed" }); }
  } catch (e) {
    if (text) { log.pop(); setPath(S, P("drafts", kind), text); }
    UI.chatErr = { kind, message: text ? `Your message was not sent: ${e.message}` : `Omar's message could not be loaded: ${e.message}`, retry: !text };
    if (!UI.chatOpen && !text) toast("A chat message could not be loaded. Open the chat to retry.");
  }
  UI.busy = null; save(); render();
}

const ACTIONS = {
  /* --- session --- */
  signin() {
    const name = document.getElementById("login-name").value.trim();
    if (!name) { UI.loginErr = "Enter your username."; render(); const f = document.getElementById("login-name"); if (f) f.focus(); return; }
    UI.loginErr = null;
    if (S.session) { UI.modal = { type: "newSession", name }; return render(); }
    ACTIONS._start(name);
  },
  signinConfirm() { const m = UI.modal; UI.modal = null; ACTIONS._start(m.name); },
  _start(name) { const p = document.getElementById("login-pass"); if (p) p.value = ""; startSession(name); setSignedIn(true); UI.facOK = false; go("inbox", "start"); },
  resume() { setSignedIn(true); go("home"); },
  signout() { save(true); setSignedIn(false); UI.dd = null; UI.facOK = false; location.hash = ""; render(); },
  doReset() { const n = S.session ? S.session.name : ""; startSession(n); UI.modal = null; toast("Session reset."); go("home"); },

  /* --- navigation --- */
  go(el) { const [route, sub] = el.dataset.go.split("/"); UI.modal = null; go(route, sub); },
  side() { UI.side = !UI.side; render(); },
  dd(el) { UI.dd = UI.dd === el.dataset.dd ? null : el.dataset.dd; render(); },
  modal(el) { UI.modal = { type: el.dataset.m, emp: el.dataset.emp, k: el.dataset.k }; UI.dd = null; UI.side = false; render(); },
  closeModal() { UI.modal = null; render(); },
  closeModalBg(el, ev) { if (ev.target === el) { UI.modal = null; render(); } },
  closeDrawer() { UI.drawer = null; render(); },
  undo() { if (_undo) { _undo(); _undo = null; UI.toast = null; save(); render(); } },
  libOpen(el) { UI.libOpen = UI.libOpen === el.dataset.id ? null : el.dataset.id; render(); },
  orgToggle() { UI.orgOpen = UI.orgOpen === false; render(); },
  respToggle(el) { UI.respOpen = UI.respOpen || { strategy: true }; UI.respOpen[el.dataset.id] = !UI.respOpen[el.dataset.id]; render(); },
  ceoToggle(el) { UI.ceoOpen = UI.ceoOpen === el.dataset.id ? null : el.dataset.id; render(); },
  apTab(el) { UI.apTab = el.dataset.v; render(); },
  apOpen(el) { const cur = UI.apOpen === undefined ? (rec().goals.objectives[0] || {}).id : UI.apOpen; UI.apOpen = cur === el.dataset.id ? null : el.dataset.id; render(); },
  compOpen(el) { const cur = UI.compOpen === undefined ? (rec().goals.comps[0] || {}).id : UI.compOpen; UI.compOpen = cur === el.dataset.id ? null : el.dataset.id; render(); },
  pmToggle() { UI.pmOpen = !(UI.pmOpen !== false || PM_ROUTES.includes(UI.route)); if (!UI.pmOpen && PM_ROUTES.includes(UI.route)) UI.pmOpen = true; render(); },
  kpi(el) { UI.kpiOpen = UI.kpiOpen === el.dataset.id ? null : el.dataset.id; render(); },
  period(el) { if (!periodAvailable(el.dataset.v)) return; UI.period = el.dataset.v; UI.month = null; UI.kpiOpen = null; render(); },
  focus(el) { UI.focus = el.dataset.v; render(); },
  series(el) { UI.series = UI.series || { win: true, obj: true }; const k = el.dataset.k, other = k === "win" ? "obj" : "win"; if (UI.series[k] && !UI.series[other]) return; UI.series[k] = !UI.series[k]; render(); },
  kpiAlert() { UI.alertOpen = !UI.alertOpen; render(); },
  month(el) { const i = +el.dataset.i; UI.month = UI.month === i ? null : i; render(); },
  dashView(el) { UI.dashView = el.dataset.v; render(); },

  /* --- goal plan --- */
  addObj() { const r = rec(), o = blankObjective(); r.goals.objectives.push(o); if (r.goals.status === "not_started") r.goals.status = "draft"; UI.edit = o.id; UI.flash = "obj-" + o.id; save(); render(); const f = document.querySelector(`#obj-${o.id} textarea`); if (f) f.focus(); },
  editObj(el) { UI.edit = el.dataset.id; UI.flash = "obj-" + el.dataset.id; render(); },
  doneObj() { UI.edit = null; rec().goals.tried = true; save(); render(); },
  delObj(el) {
    const r = rec(), i = r.goals.objectives.findIndex(o => o.id === el.dataset.id); if (i < 0) return;
    const [o] = r.goals.objectives.splice(i, 1); _undo = () => rec().goals.objectives.splice(i, 0, o);
    if (UI.edit === o.id) UI.edit = null; save(); toast(`Objective ${i + 1} removed.`, true); render();
  },
  compAdd(el) { const r = rec(); if (r.goals.comps.length >= COMP_RANGE.max || r.goals.comps.some(c => c.id === el.dataset.id)) return; r.goals.comps.push({ id: el.dataset.id, level: "", standard: "" }); if (r.goals.status === "not_started") r.goals.status = "draft"; save(); render(); },
  compDel(el) { const r = rec(), i = r.goals.comps.findIndex(c => c.id === el.dataset.id); if (i < 0) return; const [c] = r.goals.comps.splice(i, 1); _undo = () => rec().goals.comps.splice(i, 0, c); save(); toast(`${compName(c.id)} removed.`, true); render(); },
  compLevel(el) { rec().goals.comps[+el.dataset.i].level = el.dataset.v; save(); render(); },
  submitGoals() {
    const r = rec(), v = planValidation(r);
    if (r.goals.status !== "not_started" && r.goals.status !== "draft") return;   /* repeated clicks */
    r.goals.tried = true;
    if (!v.ok) { save(); toast(`${plural(v.errors.length, "item needs", "items need")} attention before submitting.`); UI.edit = null; render(); return; }
    r.goals.status = "pending_alignment"; r.goals.submits++; r.goals.tried = false; UI.edit = null; r.align.ready = false;
    r.align.log.push({ from: "sys", text: r.goals.submits === 1 ? `Performance plan shared with Omar · ${SIM_DATES.submitted}` : "Revised performance plan shared with Omar" });
    ensureChatOpenings(r);
    save(); toast("Plan submitted for employee alignment.");
    render();
  },
  reopenPlan() { const r = rec(); if (r.goals.status !== "pending_alignment") return; r.goals.status = "draft"; r.align.ready = false; r.align.log.push({ from: "sys", text: "Plan reopened for editing" }); UI.chatOpen = false; save(); go("goals"); },
  async alignConfirm() {
    const r = rec(); if (r.goals.status !== "pending_alignment" || !r.align.ready || UI.busy) return;
    r.goals.status = "approved"; r.align.confirmed = true; r.align.log.push({ from: "sys", text: `Performance contract confirmed · ${SIM_DATES.approved}` });
    UI.chatOpen = false; save(); toast("Performance contract confirmed."); go("inbox", "approved");
    await assessRound1();
  },

  /* --- email notifications --- */
  openMailPop(el) { const id = el.dataset.id; clearTimeout(UI.mailHide); UI.mailPop = null; markRead(id); go("inbox", id); pumpMailQueue(); },
  closeMailPop() { dismissMailPop(); },

  /* --- chat --- */
  openChat() { UI.chatOpen = true; UI.dd = null; UI.side = false; markChatSeen(); render(); const t = document.querySelector(".chat-win textarea"); if (t) t.focus({ preventScroll: true }); },
  closeChat() { UI.chatOpen = false; render(); },
  chatSend() {
    const r = rec(), kind = activeChatContext(r), path = P("drafts", "chat"), text = String(val(path)).trim();
    if (!kind || !text || UI.busy) return;
    if (text.length > CHAT_LIMITS.message) { UI.chatErr = { kind, message: `Please keep messages under ${CHAT_LIMITS.message} characters.` }; return render(); }
    setPath(S, path, ""); sendChat(kind, text);
  },
  chatRetry(el) { sendChat(el.dataset.k, null); },
  endCancel() { UI.endConfirm = false; render(); },
  sbiiRetry() { runSbii(); },
  appraisalContinue() {
    const r = rec(); if (r.r3.conv.ended || managerCount(r.r3.conv.log) < CHAT_LIMITS.appraisalMin) return;
    if (!r.r3.conv.completed && !UI.endConfirm) { UI.endConfirm = true; return render(); }   /* second click confirms ending early */
    UI.endConfirm = false;
    r.r3.conv.ended = true; r.r3.conv.outcome = r.r3.conv.completed ? "completed" : "incomplete";
    r.r3.conv.log.push({ from: "sys", text: r.r3.conv.completed ? "Conversation closed" : "Conversation closed before an agreement was reached" });
    UI.chatOpen = false; save(); go("reflection"); if (aiReady()) { runSbii(); runBias(); }
  },

  /* --- evidence --- */
  evNew() { UI.modal = { type: "evidence", d: evDraft(null) }; if (UI.evFilter !== "all") UI.modal.d.link = UI.evFilter; render(); const f = document.getElementById("ev-period"); if (f) f.focus(); },
  evEdit(el) { UI.modal = { type: "evidence", d: evDraft(rec().evidence.find(e => e.id === el.dataset.id)) }; render(); },
  evSave() {
    const d = UI.modal.d; if (evMissing(d).length) { UI.modal.tried = true; return render(); }
    const r = rec(); if (d.source !== "Other") d.sourceOther = "";
    if (d.id) { r.evidence[r.evidence.findIndex(e => e.id === d.id)] = d; toast("Evidence entry updated."); } else { d.id = uid("e"); r.evidence.push(d); toast("Evidence entry added."); }
    UI.modal = null; save(); render();
  },
  evDel(el) { const r = rec(), i = r.evidence.findIndex(e => e.id === el.dataset.id); if (i < 0) return; const [e] = r.evidence.splice(i, 1); _undo = () => rec().evidence.splice(i, 0, e); save(); toast("Evidence entry deleted.", true); render(); },
  evRef(el) { const sec = evSectionOf(el.dataset.ref); UI.drawer = { type: "evidence", id: "all", sec }; render(); setTimeout(() => { const n = document.getElementById("ev-" + sec); if (n) n.scrollIntoView({ block: "start" }); }, 30); },
  evDrawer(el) { UI.drawer = { type: "evidence", id: el.dataset.id }; render(); },

  /* --- rounds --- */
  releaseCode(el) {
    const k = el.dataset.k, v = ((document.getElementById("code-" + k) || {}).value || "").trim();
    if (v === RELEASE_CODES[k] || v === FAC_CODE) { UI.codeErr = null; releaseRound(k); toast(k === "r2" ? "Mid-year business update released." : "Year-end update released."); go(k === "r2" ? "home" : "yearend"); }
    else { UI.codeErr = k; render(); }
  },
  submitR2() { const r = rec(); if (r.r2.submitted || UI.busy) return; r.r2.submitted = true; if (!r.r2.diag.ended) { r.r2.diag.ended = true; r.r2.diag.log.push({ from: "sys", text: "Conversation closed" }); } save(); assessRound2(); },
  loadYearEnd() { rec().r3.error = null; loadYearEnd(); },
  rate(el) { setPath(S, el.dataset.path, +el.dataset.v); afterBind(el.dataset.path); save(); render(); },
  submitAppraisal() {
    const r = rec(), v = appraisalValidation(r), a = r.r3.appraisal;
    a.tried = true; if (a.status === "not_started") a.status = "draft";
    if (!v.ok) { save(); render(); const err = document.querySelector(".ta.err, .rate.err"); if (err) err.scrollIntoView({ block: "center" }); toast(`${plural(v.errors.length, "section needs", "sections need")} attention before submitting.`); return; }
    a.status = "submitted"; a.tried = false;
    if (a.revisions) { r.r3.conv.log.push({ from: "sys", text: "Revised appraisal recorded" }); r.r3.bias.result = null; save(); go("reflection"); if (aiReady()) runBias(); return; }
    r.r3.conv.log.push({ from: "sys", text: `Appraisal shared with Omar · ${SIM_DATES.yearend}` });
    ensureChatOpenings(r);   /* Omar's neutral opening: once, in the same thread; the chat is not opened automatically */
    save(); toast("Appraisal shared with Omar."); render();
  },
  reconsider() { const r = rec(); if (r.r3.done) return; r.r3.appraisal.status = "draft"; r.r3.appraisal.revisions++; save(); go("appraisal"); },
  runBias() { runBias(); },
  finalize() {
    const r = rec(); if (r.r3.done || UI.busy) return;
    if (r.r3.bias.reflection.trim().length < 15) { r.r3.bias.tried = true; toast("Write a short reflection before finalising."); return render(); }
    if (!aiReady()) { toast("AI assessment is unavailable. Your facilitator can finalise the appraisal."); return; }
    assessRound3();
  },
  assessRetry(el) { const k = el.dataset.k; if (k === "round1") assessRound1(); else if (k === "round2") assessRound2(); else assessRound3(); },

  /* --- facilitator --- */
  facUnlock() {
    const v = ((document.getElementById("fac-code") || {}).value || "").trim();
    const k = Object.keys(RELEASE_CODES).find(x => RELEASE_CODES[x] === v);
    if (v === FAC_CODE) { UI.facOK = true; UI.codeErr = null; return render(); }
    if (k) { UI.codeErr = null; releaseRound(k); toast(k === "r2" ? "Mid-year business update released." : "Year-end update released."); go(k === "r2" ? "home" : "inbox", k === "r2" ? null : "yearend"); return; }
    UI.codeErr = "fac"; render();
  },
  release(el) { releaseRound(el.dataset.k); toast("Released on this device."); render(); },
  facAlign() { const r = rec(); if (r.goals.status !== "pending_alignment") return; r.goals.status = "approved"; r.align.confirmed = true; r.align.manual = true; r.align.log.push({ from: "sys", text: "Contract confirmed by the facilitator" }); pulseNote(r, "alignment", "Alignment confirmed manually", "Confirmed by the facilitator without an assessed conversation: no Pulse change.", 1); save(); toast("Alignment confirmed."); render(); assessRound1(); },
  facEnd(el) { const r = rec(); if (el.dataset.k === "diag") { r.r2.diag.ended = true; r.r2.diag.log.push({ from: "sys", text: "Conversation ended by the facilitator" }); } else { r.r3.conv.ended = true; r.r3.conv.log.push({ from: "sys", text: "Conversation ended by the facilitator" }); } save(); render(); },
  facPathway(el) {
    const r = rec(), p = el.dataset.v; r.r2.pathway = p; r.r2.manual = true; r.r2.submitted = true;
    if (!r.pulse.slots.coaching) { if (p === "A") applyPulse(r, "constructive", "Pathway A set by the facilitator."); else if (p === "C") applyPulse(r, "punitive", "Pathway C set by the facilitator."); else pulseNote(r, "coaching", "Pathway B set by the facilitator", "Partially effective management: no Pulse change.", 2); }
    save(); toast(`Pathway ${p} set.`); render();
  },
  facFinal() { const r = rec(); if (r.r3.done) return; r.r3.done = true; pulseNote(r, "appraisal", "Appraisal finalised by the facilitator", "No assessed appraisal: no Pulse change.", 3); save(); toast("Appraisal finalised."); render(); },
  pc(el) { rec().pc[el.dataset.i] = el.dataset.v; save(); render(); }
};

document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-act]");
  if (!el) { if (UI.dd) { UI.dd = null; render(); } return; }
  if (el.disabled) return;
  const fn = ACTIONS[el.dataset.act]; if (!fn) return;
  if (el.tagName === "BUTTON" && el.type === "submit") ev.preventDefault();
  if (UI.dd && el.dataset.act !== "dd") UI.dd = null;
  fn(el, ev);
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") { if (UI.modal) { UI.modal = null; render(); } else if (UI.drawer) { UI.drawer = null; render(); } else if (UI.dd) { UI.dd = null; render(); } }
  if (ev.key === "Enter" && ev.target.id === "fac-code") ACTIONS.facUnlock();
  if (ev.key === "Enter" && ev.target.id && ev.target.id.startsWith("code-")) ACTIONS.releaseCode({ dataset: { k: ev.target.id.slice(5) } });
  if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey) && ev.target.dataset && /\.drafts\./.test(ev.target.dataset.bind || "")) { const k = ev.target.dataset.bind.split(".").pop(); ev.preventDefault(); ACTIONS.chatSend({ dataset: { k } }); }
});
function handleBind(el) { const path = el.dataset.bind; let v = el.value; if (el.dataset.type === "num") v = v === "" ? "" : Number(v); setPath(S, path, v); afterBind(path); save(); }
let _liveT = null;
function liveUpdate() { clearTimeout(_liveT); _liveT = setTimeout(render, 350); }
document.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.dataset.bind) { handleBind(el); if (el.tagName !== "SELECT" && !/\.drafts\./.test(el.dataset.bind)) liveUpdate(); return; }
  if (el.dataset.ev && UI.modal && UI.modal.d) UI.modal.d[el.dataset.ev] = el.value;
});
document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.bind && el.tagName === "SELECT") { handleBind(el); render(); return; }
  if (el.dataset.ev && UI.modal && UI.modal.d) { UI.modal.d[el.dataset.ev] = el.value; if (el.tagName === "SELECT") render(); return; }
  if (el.dataset.actChange === "evFilter") { UI.evFilter = el.value; render(); return; }
  if (el.dataset.kpiMode) { const v = el.value, base = el.dataset.kpiMode; setPath(S, base + ".type", v === "review" ? "review" : "numeric"); if (v !== "review") setPath(S, base + ".dir", v); afterBind(base); save(); render(); return; }
  if (el.dataset.actChange === "compPick") { if (el.value) ACTIONS.compAdd({ dataset: { id: el.value } }); return; }
  if (el.dataset.fac) { const r = rec(), id = el.dataset.fac, max = +el.max; if (el.value === "") delete r.fac[id]; else r.fac[id] = Math.max(0, Math.min(max, Math.round(+el.value))); save(); render(); }
});

let _rzT = null;
window.addEventListener("resize", () => { clearTimeout(_rzT); _rzT = setTimeout(() => { if (document.querySelector(".chart")) render(); }, 200); });

/* ---------- boot ---------- */
(async function boot() {
  const h = parseHash(); UI.route = h.route === "login" ? "home" : h.route; UI.sub = h.sub;
  render();
  await loadStatus();
  if (S.session && ensureChatOpenings()) save();
  render(); afterRoute();
})();
