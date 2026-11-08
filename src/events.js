/* =========================================================
   EVENTS & WORKFLOW ACTIONS
   ========================================================= */
let _undo = null;
function afterBind(path) {
  if (!S.emp) return;
  const r = rec();
  if (path.includes(".goals.") && r.goals.status === "not_started") r.goals.status = "draft";
  if (path.includes(".appraisal.") && r.appraisal.status === "not_started") r.appraisal.status = "draft";
}
function scrollChat() { const el = document.getElementById("chat-log"); if (el) el.scrollTop = el.scrollHeight; }
function pushLog(log, from, node) { log.push({ from, text: node.text, ph: !!node.ph }); }

const ACTIONS = {
  /* --- session --- */
  signin() {
    if (S.session) { UI.modal = { type: "newSession", name: document.getElementById("login-name").value, legacy: !!(document.getElementById("login-legacy") || {}).checked }; return render(); }
    ACTIONS._start(document.getElementById("login-name").value, !!(document.getElementById("login-legacy") || {}).checked);
  },
  signinConfirm() { const m = UI.modal; UI.modal = null; ACTIONS._start(m.name, m.legacy); },
  _start(name, legacy) {
    const p = document.getElementById("login-pass"); if (p) p.value = "";
    startSession(name, legacy); setSignedIn(true); UI.facOK = false;
    go("inbox", "start");
  },
  resume() { setSignedIn(true); go("home"); },
  signout() { save(true); setSignedIn(false); UI.dd = null; UI.facOK = false; location.hash = ""; render(); },
  doReset() { const n = S.session ? S.session.name : ""; startSession(n, false); UI.modal = null; toast("Session reset."); go("home"); },

  /* --- navigation --- */
  go(el) { const [route, sub] = el.dataset.go.split("/"); UI.modal = null; go(route, sub); },
  side() { UI.side = !UI.side; render(); },
  dd(el) { UI.dd = UI.dd === el.dataset.dd ? null : el.dataset.dd; render(); },
  modal(el) { UI.modal = { type: el.dataset.m }; UI.dd = null; render(); },
  closeModal() { UI.modal = null; render(); },
  closeModalBg(el, ev) { if (ev.target === el) { UI.modal = null; render(); } },
  closeDrawer() { UI.drawer = null; render(); },
  jump(el) { const t = document.getElementById(el.dataset.id); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); },
  undo() { if (_undo) { _undo(); _undo = null; UI.toast = null; save(); render(); } },
  pick(el) {
    const e = el.dataset.emp; if (S.emp === e) { go("home"); return; }
    S.emp = e; save(); toast(`Now managing ${EMPLOYEES[e].name}.`); UI.side = false;
    go("home");
  },

  /* --- goal plan --- */
  addObj() {
    const r = rec(), o = blankObjective(); r.goals.objectives.push(o); if (r.goals.status === "not_started") r.goals.status = "draft";
    UI.edit = o.id; UI.flash = "obj-" + o.id; save(); render();
    const f = document.querySelector(`#obj-${o.id} textarea`); if (f) f.focus();
  },
  editObj(el) { UI.edit = el.dataset.id; UI.flash = "obj-" + el.dataset.id; render(); },
  doneObj() { UI.edit = null; save(); render(); },
  delObj(el) {
    const r = rec(), i = r.goals.objectives.findIndex(o => o.id === el.dataset.id); if (i < 0) return;
    const [o] = r.goals.objectives.splice(i, 1), emp = S.emp;
    _undo = () => S.recs[emp].goals.objectives.splice(i, 0, o);
    if (UI.edit === o.id) UI.edit = null;
    save(); toast(`Objective ${i + 1} removed.`, true); render();
  },
  libOpen(el) { UI.libOpen = UI.libOpen === el.dataset.id ? null : el.dataset.id; render(); },
  compAdd(el) { const r = rec(); if (r.goals.comps.length >= COMP_RANGE.max || r.goals.comps.some(c => c.id === el.dataset.id)) return; r.goals.comps.push({ id: el.dataset.id, level: "", standard: "" }); if (r.goals.status === "not_started") r.goals.status = "draft"; save(); render(); },
  compDel(el) {
    const r = rec(), i = r.goals.comps.findIndex(c => c.id === el.dataset.id); if (i < 0) return;
    const [c] = r.goals.comps.splice(i, 1), emp = S.emp; _undo = () => S.recs[emp].goals.comps.splice(i, 0, c);
    save(); toast(`${compName(c.id)} removed.`, true); render();
  },
  compLevel(el) { const c = rec().goals.comps[+el.dataset.i]; c.level = el.dataset.v; save(); render(); },
  submitGoals() {
    const r = rec(), v = planValidation(r);
    r.goals.tried = true;
    if (!v.ok) { save(); toast(`${plural(v.errors.length, "item needs", "items need")} attention before submitting.`); UI.edit = null; go("goals", "submit"); return; }
    const sc = alignmentScript(S.emp), first = r.goals.submits === 0 || !sc.afterRevision ? sc.start : sc.afterRevision;
    r.goals.status = "pending_alignment"; r.goals.submits++; r.goals.tried = false; UI.edit = null;
    r.align.log.push({ from: "sys", text: r.goals.submits === 1 ? `Goal plan submitted · ${SIM_DATES.submitted}` : "Revised goal plan submitted" });
    r.align.node = first; pushLog(r.align.log, "employee", sc.nodes[first]); r.align.popup = true;
    save(); toast("Your performance goals have been submitted. Employee alignment is required before the performance contract can be finalized.");
    UI.modal = { type: "align" }; go("goals");
  },
  alignOpt(el) {
    const r = rec(), sc = alignmentScript(S.emp), node = sc.nodes[r.align.node], o = node && node.options[+el.dataset.i]; if (!o) return;
    r.align.log.push({ from: "manager", text: o.l });
    if (o.outcome === "revise") {
      if (o.reply) r.align.log.push({ from: "employee", text: o.reply, ph: true });
      r.align.log.push({ from: "sys", text: "Goal plan returned to Draft for revision" });
      r.goals.status = "draft"; r.goals.revisions++; r.align.node = null; UI.modal = null;
      save(); toast("Goal plan returned to Draft. Revise it, then submit again."); go("goals"); return;
    }
    r.align.node = o.next; pushLog(r.align.log, "employee", sc.nodes[o.next]); save(); render(); scrollChat();
  },
  alignConfirm() {
    const r = rec(), node = alignmentScript(S.emp).nodes[r.align.node];
    if (r.goals.status !== "pending_alignment" || !node || node.outcome !== "align") return;
    r.goals.status = "approved"; r.align.outcome = "align"; r.align.node = null;
    r.align.log.push({ from: "sys", text: `Performance contract confirmed · ${SIM_DATES.approved}` });
    UI.modal = null; save(); toast("Performance contract confirmed."); go("inbox", "approved");
  },

  /* --- evidence --- */
  evNew() { UI.modal = { type: "evidence", d: evDraft(UI.evFilter !== "all" ? null : null) }; if (UI.evFilter !== "all") UI.modal.d.link = UI.evFilter; render(); const f = document.getElementById("ev-period"); if (f) f.focus(); },
  evEdit(el) { UI.modal = { type: "evidence", d: evDraft(rec().evidence.find(e => e.id === el.dataset.id)) }; render(); },
  evSave() {
    const d = UI.modal.d;
    if (evMissing(d).length) { UI.modal.tried = true; return render(); }
    const r = rec();
    if (d.source !== "Other") d.sourceOther = "";
    if (d.id) { const i = r.evidence.findIndex(e => e.id === d.id); r.evidence[i] = d; toast("Evidence entry updated."); }
    else { d.id = uid("e"); r.evidence.push(d); toast("Evidence entry added."); }
    UI.modal = null; save(); render();
  },
  evDel(el) {
    const r = rec(), i = r.evidence.findIndex(e => e.id === el.dataset.id); if (i < 0) return;
    const [e] = r.evidence.splice(i, 1), emp = S.emp; _undo = () => S.recs[emp].evidence.splice(i, 0, e);
    save(); toast("Evidence entry deleted.", true); render();
  },
  evDrawer(el) { UI.drawer = { type: "evidence", id: el.dataset.id }; render(); },

  /* --- facilitator gates --- */
  releaseCode(el) {
    const k = el.dataset.k, v = (document.getElementById("code-" + k) || {}).value || "";
    if (v.trim() === RELEASE_CODES[k] || v.trim() === FAC_CODE) { S.released[k] = true; UI.codeErr = null; save(); toast(k === "midyear" ? "Mid-year check-in opened." : "Year-end appraisal opened."); render(); }
    else { UI.codeErr = k; render(); }
  },
  facUnlock() { const v = (document.getElementById("fac-code") || {}).value || ""; if (v.trim() === FAC_CODE) { UI.facOK = true; UI.codeErr = null; } else UI.codeErr = "fac"; render(); },
  release(el) { const k = el.dataset.k; S.released[k] = !S.released[k]; save(); toast(S.released[k] ? "Released on this device." : "Release undone on this device."); render(); },
  facSet(el) { const r = rec(), v = el.dataset.v; if (v === "—") delete r.fac[el.dataset.k]; else r.fac[el.dataset.k] = +v; save(); render(); },

  /* --- mid-year --- */
  midStart() { const m = rec().midyear, sc = diagnosticScript(S.emp); m.started = true; m.log.push({ from: "sys", text: `Mid-year check-in · ${SIM_DATES.midyear}` }); pushLog(m.log, "employee", sc.opening); save(); render(); scrollChat(); },
  midAsk(el) {
    const m = rec().midyear, q = diagnosticScript(S.emp).questions.find(x => x.id === el.dataset.q);
    if (!q || m.asked.includes(q.id) || m.asked.length >= DIAGNOSTIC_LIMITS.max) return;
    m.asked.push(q.id); m.log.push({ from: "manager", text: q.q }); pushLog(m.log, "employee", q.a); save(); render(); scrollChat();
  },
  midClose() { const m = rec().midyear; if (m.asked.length < DIAGNOSTIC_LIMITS.min) return; m.closed = true; m.log.push({ from: "sys", text: "Check-in closed. The intervention will be discussed in the training room." }); save(); toast("Mid-year check-in closed."); render(); },

  /* --- appraisal --- */
  rate(el) { setPath(S, el.dataset.path, +el.dataset.v); afterBind(el.dataset.path); save(); render(); },
  submitAppraisal() {
    const r = rec(), v = appraisalValidation(r);
    r.appraisal.tried = true; if (r.appraisal.status === "not_started") r.appraisal.status = "draft";
    if (!v.ok) { save(); render(); const err = document.querySelector(".ta.err, .rate.err"); if (err) err.scrollIntoView({ block: "center" }); toast(`${plural(v.errors.length, "section needs", "sections need")} attention before submitting.`); return; }
    const a = r.appraisal, rf = r.reflection, sc = reactionScript(S.emp);
    a.status = "submitted"; a.tried = false; a.history.push({ at: Date.now(), overall: { ...a.overall } });
    const again = a.revising; a.revising = false;
    if (again) { rf.log.push({ from: "sys", text: "Revised appraisal submitted" }); rf.done = true; rf.log.push({ from: "sys", text: `Appraisal completed · ${SIM_DATES.closed}` }); save(); toast("Revised appraisal submitted and recorded."); go("inbox", "closed"); return; }
    rf.log = [{ from: "sys", text: `Final appraisal shared with ${EMP().first} · ${SIM_DATES.yearend}` }]; pushLog(rf.log, "employee", sc.message); rf.choice = null; rf.popup = true;
    save(); UI.modal = { type: "reaction" }; go("appraisal");
  },
  reactOpt(el) {
    const rf = rec().reflection, sc = reactionScript(S.emp), o = sc.options.find(x => x.id === el.dataset.id); if (!o) return;
    rf.choice = o.id; rf.log.push({ from: "manager", text: o.l }); if (sc.reply[o.id]) pushLog(rf.log, "employee", sc.reply[o.id]); save(); render(); scrollChat();
  },
  reflDecision(el) { rec().reflection.decision = el.dataset.v; save(); render(); },
  reflSave() {
    const r = rec(), rf = r.reflection;
    if (!rf.decision || !rf.just.trim()) { rf.tried = true; render(); return; }
    rf.tried = false; rf.log.push({ from: "manager", text: `${rf.decision === "revise" ? "I will revise the evaluation" : "I am keeping the evaluation"}: ${rf.just.trim()}` });
    if (rf.decision === "revise") { r.appraisal.status = "draft"; r.appraisal.revising = true; rf.log.push({ from: "sys", text: "Appraisal reopened for revision" }); UI.modal = null; save(); toast("Appraisal reopened. Revise it and submit again."); go("appraisal"); return; }
    rf.done = true; rf.log.push({ from: "sys", text: `Appraisal completed · ${SIM_DATES.closed}` }); UI.modal = null; save(); toast("Decision recorded. The appraisal is complete."); go("inbox", "closed");
  },

  /* --- SCORE review --- */
  saLevel(el) { const r = rec(); r.sa[el.dataset.k] = r.sa[el.dataset.k] || {}; r.sa[el.dataset.k].lvl = +el.dataset.v; save(); render(); },
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
});
function handleBind(el) {
  const path = el.dataset.bind; let v = el.value;
  if (el.dataset.type === "num") v = v === "" ? "" : Number(v);
  setPath(S, path, v); afterBind(path); save();
}
document.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.dataset.bind) { handleBind(el); if (el.tagName !== "SELECT") { liveUpdate(); } return; }
  if (el.dataset.ev && UI.modal && UI.modal.d) { UI.modal.d[el.dataset.ev] = el.value; }
});
document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.bind && el.tagName === "SELECT") { handleBind(el); render(); return; }
  if (el.dataset.ev && UI.modal && UI.modal.d) { UI.modal.d[el.dataset.ev] = el.value; if (el.tagName === "SELECT") render(); return; }
  if (el.dataset.actChange === "evFilter") { UI.evFilter = el.value; render(); return; }
  if (el.dataset.actChange === "bias") { const rf = rec().reflection; rf.biases = el.checked ? [...new Set([...rf.biases, el.value])] : rf.biases.filter(b => b !== el.value); save(); return; }
});
/* Text typing re-renders lightly: only the parts that summarise the form */
let _liveT = null;
function liveUpdate() { clearTimeout(_liveT); _liveT = setTimeout(render, 350); }

/* ---------- boot ---------- */
(function boot() {
  const h = parseHash(); UI.route = h.route === "login" ? "home" : h.route; UI.sub = h.sub;
  render();
})();
