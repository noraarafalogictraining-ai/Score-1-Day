/* =========================================================
   SCORE PERFORMANCE HUB — UI CORE
   Helpers, icons, routing, shell (header + sidebar), rendering.
   ========================================================= */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ICONS = {
  home: '<path d="M4 11 12 4l8 7v9H4v-9Z"/><path d="M10 20v-5h4v5"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
  log: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.4.2 4.3 1.8 4.8 4.8"/>',
  logout: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="m4 20 1-4L16 5l3 3L8 19l-4 1Z"/><path d="m14 7 3 3"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4.5M12 17h.01"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6L12 4Z"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>'
};
const icon = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* Employee photos are attached once as CSS classes so re-renders stay light */
(function injectImages() {
  const css = EMP_ORDER.map(e => `.av-${e}{background-image:url(${IMG[e]})}`).join("");
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
const avatar = (emp, size = "") => `<span class="av ${size} av-${emp}" role="img" aria-label="${esc(EMPLOYEES[emp].name)}"></span>`;
const initials = (n) => String(n || "M").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const statusChip = (st) => `<span class="chip st-${st}">${STATUS_LABEL[st] || st}</span>`;
const phText = (o) => o && o.ph ? `<span class="ph"><b>${PENDING_TAG}.</b> ${esc(o.text)}</span>` : esc(o && o.text != null ? o.text : o);
const phBlock = (o) => o && o.pending ? `<span class="ph"><b>${PENDING_TAG}.</b> ${esc(o.text)}</span>` : esc(o);
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

/* ---------- binding ---------- */
function getPath(o, p) { return p.split(".").reduce((x, k) => x == null ? undefined : x[k], o); }
function setPath(o, p, v) { const ks = p.split("."); let x = o; for (let i = 0; i < ks.length - 1; i++) { if (x[ks[i]] == null) x[ks[i]] = {}; x = x[ks[i]]; } x[ks[ks.length - 1]] = v; }
const bind = (path, type = "") => `data-bind="${path}"${type ? ` data-type="${type}"` : ""}`;
const val = (path) => { const v = getPath(S, path); return v == null ? "" : v; };
const P = (...parts) => ["recs", S.emp, ...parts].join(".");

/* ---------- UI state (not saved) ---------- */
const UI = { signedIn: (() => { try { return sessionStorage.getItem("hub-signed-in") === "1"; } catch (e) { return false; } })(), route: "login", sub: null, modal: null, toast: null, dd: null, side: false, edit: null, evFilter: "all", drawer: null, facOK: false, codeErr: null, flash: null };
function parseHash() {
  const h = (location.hash || "").replace(/^#\/?/, "");
  const [route, sub] = h.split("/");
  return { route: route || "home", sub: sub || null };
}
function setSignedIn(v) { UI.signedIn = v; try { v ? sessionStorage.setItem("hub-signed-in", "1") : sessionStorage.removeItem("hub-signed-in"); } catch (e) {} }
function go(route, sub) { const h = "#" + route + (sub ? "/" + sub : ""); if (location.hash === h) { onRoute(); } else location.hash = h; }
function onRoute() {
  const { route, sub } = parseHash();
  UI.route = route === "login" ? "home" : route; UI.sub = sub; UI.dd = null; UI.side = false; UI.drawer = null;
  render(); window.scrollTo(0, 0);
}
window.addEventListener("hashchange", onRoute);

let _toastT = null;
function toast(text, undo) { UI.toast = { text, undo }; clearTimeout(_toastT); _toastT = setTimeout(() => { UI.toast = null; render(); }, undo ? 7000 : 3800); }

/* ---------- messages & notifications ---------- */
function mailList() {
  if (!S.session) return [];
  const r = rec(), M = hrMessages(S.emp), out = [{ id: "start", ...M.start }];
  if (r && goalsApproved(r)) out.unshift({ id: "approved", ...M.approved });
  if (r && midyearStatus(r) !== "locked") out.unshift({ id: "midyear", ...M.midyear });
  if (r && appraisalStatus(r) !== "locked") out.unshift({ id: "yearend", ...M.yearend });
  if (r && r.reflection.done) out.unshift({ id: "closed", ...M.closed });
  return out.map(m => ({ ...m, unread: !S.read[(S.emp || "none") + ":" + m.id] }));
}
function markRead(id) { S.read[(S.emp || "none") + ":" + id] = true; save(); }
function pendingActions() {
  const r = rec(), out = [];
  if (!S.emp) return [{ t: "Select the team member you are managing", d: "Your facilitator assigns one employee to your table.", go: "home", icon: "people", urgent: true }];
  const g = r.goals.status, F = EMP().first;
  if (g === "not_started" || g === "draft") out.push({ t: g === "draft" ? "Complete and submit the performance goal plan" : "Create the performance goal plan", d: `Due ${SIM_DATES.deadline} · HR request`, go: "goals", icon: "target", urgent: true });
  if (g === "pending_alignment") out.push({ t: `Align the performance contract with ${F}`, d: "Employee alignment is required before the contract is final.", go: "conversations/alignment", icon: "chat", urgent: true });
  if (goalsApproved(r) && !r.evidence.length) out.push({ t: "Start documenting evidence", d: "Record evidence from your printed handouts in the Evidence Log.", go: "evidence", icon: "log" });
  const ms = midyearStatus(r);
  if (ms === "action" || ms === "in_progress") out.push({ t: `Hold the mid-year check-in with ${F}`, d: "Mid-Year Performance Check-In Required.", go: "conversations/midyear", icon: "chat", urgent: true });
  const as = appraisalStatus(r);
  if (as === "not_started" || as === "draft") out.push({ t: r.appraisal.revising ? "Revise and resubmit the final appraisal" : "Complete the year-end appraisal", d: "Evaluate WHAT and HOW against the agreed expectations.", go: "appraisal", icon: "clipboard", urgent: true });
  if (as === "submitted") out.push({ t: `Respond to ${F}'s message about the appraisal`, d: "Review the concern and record your decision.", go: "conversations/appraisal", icon: "chat", urgent: true });
  if (roundOneDone(r) && roundResult(1) && roundResult(1).pending) out.push({ t: "Complete the SCORE Round 1 review", d: "Self-assess the goal plan against the SCORE criteria.", go: "review/1", icon: "chart" });
  if (roundTwoDone(r) && roundResult(2) && roundResult(2).pending) out.push({ t: "Complete the SCORE Round 2 review", d: "Self-assess the appraisal against the SCORE criteria.", go: "review/2", icon: "chart" });
  return out;
}
function notifications() {
  const out = [];
  mailList().forEach(m => out.push({ id: "mail:" + m.id, t: m.subject, d: `${HR_SENDER.name} · ${m.date}`, go: "inbox/" + m.id, unread: m.unread, icon: "mail" }));
  const r = rec();
  if (r && r.goals.status === "pending_alignment") out.unshift({ id: "n:align", t: "Your performance goals have been submitted.", d: "Employee alignment is required before the performance contract can be finalized.", go: "conversations/alignment", unread: true, icon: "bell" });
  if (r && (midyearStatus(r) === "action" || midyearStatus(r) === "in_progress")) out.unshift({ id: "n:mid", t: "Mid-Year Performance Check-In Required", d: `Open a conversation with ${EMP().first} to investigate the performance gap.`, go: "conversations/midyear", unread: true, icon: "bell" });
  if (r && r.appraisal.status === "submitted" && !r.reflection.done) out.unshift({ id: "n:react", t: `${EMP().first} sent you a message about the appraisal`, d: "Review the concern and record your decision.", go: "conversations/appraisal", unread: true, icon: "chat" });
  return out;
}

/* ---------- shell ---------- */
function navItems() {
  const r = rec(), unreadMail = mailList().filter(m => m.unread).length, convAction = r && conversationsStatus(r) === "action";
  return [
    { id: "home", l: "Home", icon: "home" },
    { id: "inbox", l: "HR Inbox", icon: "mail", cnt: unreadMail },
    { id: "goals", l: "Performance Goals", icon: "target", need: true },
    { id: "evidence", l: "Evidence Log", icon: "log", need: true, locked: !goalsApproved(r) },
    { id: "conversations", l: "Employee Conversations", icon: "chat", need: true, cnt: convAction ? 1 : 0 },
    { id: "appraisal", l: "Final Appraisal", icon: "clipboard", need: true, locked: appraisalStatus(r) === "locked" },
    { id: "review", l: "SCORE Review", icon: "chart", need: true, locked: !roundOneDone(r) }
  ];
}
function header() {
  const notes = notifications(), unread = notes.filter(n => n.unread).length;
  return `<header class="head">
    <button class="icon-btn menu-btn" data-act="side" aria-label="Open navigation">${icon("menu")}</button>
    <button class="row nowrap" data-act="go" data-go="home" style="background:none;border:0;padding:0;gap:12px" aria-label="Home"><img class="logo" src="${IMG.logoTop}" alt="NextWave Digital"></button>
    <span class="sep"></span><span class="app">SCORE <span class="app-full">Performance Hub</span></span>
    <span class="grow"></span>
    <span class="cycle">${icon("calendar", "i-sm")} Performance cycle · ${APP.cycleLabel}</span>
    <span style="position:relative"><button class="icon-btn" data-act="dd" data-dd="notif" aria-label="Notifications">${icon("bell")}${unread ? `<span class="badge">${unread}</span>` : ""}</button>${UI.dd === "notif" ? notifDropdown(notes) : ""}</span>
    <button class="icon-btn" data-act="go" data-go="inbox" aria-label="HR Inbox">${icon("mail")}${mailList().filter(m => m.unread).length ? `<span class="badge">${mailList().filter(m => m.unread).length}</span>` : ""}</button>
    <span style="position:relative"><button class="user-btn" data-act="dd" data-dd="user"><span class="initials">${esc(initials(S.session.name))}</span><span class="uname small">${esc(S.session.name)}</span></button>${UI.dd === "user" ? userDropdown() : ""}</span>
  </header>`;
}
function notifDropdown(notes) {
  return `<div class="dropdown wide" role="menu"><div class="dd-head">Notifications</div>${notes.length ? notes.slice(0, 8).map(n => `<button class="dd-item ${n.unread ? "unread" : ""}" data-act="go" data-go="${n.go}">${icon(n.icon, "i-sm")}<span class="stack-sm" style="gap:1px"><b class="small">${esc(n.t)}</b><span class="xs muted">${esc(n.d)}</span></span></button>`).join("") : `<div class="dd-item muted">No notifications.</div>`}</div>`;
}
function userDropdown() {
  return `<div class="dropdown" role="menu"><div class="dd-head">${esc(S.session.name)} · Manager</div>
    <button class="dd-item" data-act="go" data-go="facilitator">${icon("shield", "i-sm")} Facilitator view</button>
    <button class="dd-item" data-act="signout">${icon("logout", "i-sm")} Sign out (progress is saved)</button></div>`;
}
function sidebar() {
  const r = rec();
  return `<div class="scrim-side ${UI.side ? "open" : ""}" data-act="side"></div><aside class="side ${UI.side ? "open" : ""}" aria-label="Navigation">
    <nav class="nav">${navItems().map(n => {
      const dis = n.need && !S.emp;
      return `<button class="nav-item ${UI.route === n.id ? "on" : ""}" data-act="go" data-go="${n.id}" ${dis ? "disabled style=\"opacity:.5\"" : ""}>${icon(n.icon)}<span>${n.l}</span>${n.cnt ? `<span class="cnt">${n.cnt}</span>` : n.locked && S.emp ? `<span class="lock">${icon("lock", "i-sm")}</span>` : ""}</button>`;
    }).join("")}</nav>
    <div class="stack-sm"><div class="eyebrow side-h">My team</div><div class="team">${EMP_ORDER.map(e => {
      const E = EMPLOYEES[e];
      return `<button class="team-item ${S.emp === e ? "on" : ""}" data-act="pick" data-emp="${e}">${avatar(e, "sm")}<span class="stack-sm" style="gap:0;min-width:0"><span class="nm">${esc(E.name)}</span><span class="rl">${esc(E.title)}</span></span></button>`;
    }).join("")}</div></div>
    <div class="side-foot">Training environment · NextWave Digital is a fictional company.${r ? "" : ""}</div>
  </aside>`;
}
function pageHead(crumb, title, right = "", sub = "") {
  return `<div class="page-head"><div><div class="crumb">${crumb}</div><h1>${title}</h1>${sub ? `<p class="t2 small" style="margin-top:4px">${sub}</p>` : ""}</div><div class="row">${right}</div></div>`;
}
function empChip() { if (!S.emp) return ""; const E = EMP(); return `<span class="row nowrap" style="gap:8px">${avatar(S.emp, "sm")}<span class="small"><b>${esc(E.name)}</b> · <span class="muted">${esc(E.title)}</span></span></span>`; }
function needEmp() {
  return `<div class="card"><div class="empty">${icon("people")}<h3>Select the team member you are managing</h3><p class="small">Your facilitator assigns one employee to your table. Choose them on the Home page or under My team.</p><button class="btn primary" data-act="go" data-go="home">Go to Home</button></div></div>`;
}
function lockedPanel(title, text) {
  return `<div class="card"><div class="empty">${icon("lock")}<h3>${title}</h3><p class="small" style="max-width:56ch">${text}</p></div></div>`;
}

/* ---------- render ---------- */
const VIEWS = {};
function render() {
  const app = document.getElementById("app");
  const ae = document.activeElement, key = ae && (ae.getAttribute("data-bind") || ae.id), selS = ae && ae.selectionStart, selE = ae && ae.selectionEnd;
  let html;
  if (!S.session || !UI.signedIn) html = VIEWS.login();
  else {
    const v = VIEWS[UI.route] || VIEWS.home;
    html = header() + `<div class="shell">${sidebar()}<main class="main" id="main">${v()}</main></div>`;
  }
  html += modalHTML() + drawerHTML() + (UI.toast ? `<div class="toast" role="status">${esc(UI.toast.text)}${UI.toast.undo ? `<button data-act="undo">Undo</button>` : ""}</div>` : "");
  app.innerHTML = html;
  if (key) {
    const el = app.querySelector(`[data-bind="${CSS.escape(key)}"]`) || document.getElementById(key);
    if (el) { el.focus({ preventScroll: true }); try { if (selS != null && el.setSelectionRange) el.setSelectionRange(selS, selE); } catch (e) {} }
  }
  if (UI.flash) { const el = document.getElementById(UI.flash); UI.flash = null; if (el) el.scrollIntoView({ block: "center" }); }
}
function modalHTML() { return UI.modal && MODALS[UI.modal.type] ? MODALS[UI.modal.type](UI.modal) : ""; }
function drawerHTML() { return UI.drawer && DRAWERS[UI.drawer.type] ? DRAWERS[UI.drawer.type](UI.drawer) : ""; }
const MODALS = {}, DRAWERS = {};
function modalWrap(title, body, foot = "", wide = false, sub = "") {
  return `<div class="scrim" data-act="closeModalBg"><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><div class="row nowrap" style="gap:10px">${sub}<h3>${title}</h3></div><button class="icon-btn" data-act="closeModal" aria-label="Close">${icon("x")}</button></div><div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ""}</div></div>`;
}
