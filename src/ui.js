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
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  bars: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
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
const UI = { signedIn: (() => { try { return sessionStorage.getItem("hub-signed-in") === "1"; } catch (e) { return false; } })(), route: "login", sub: null, modal: null, toast: null, dd: null, side: false, edit: null, evFilter: "all", drawer: null, facOK: false, codeErr: null, flash: null, busy: null, chatErr: null, libOpen: null };
function parseHash() {
  const h = (location.hash || "").replace(/^#\/?/, "");
  const [route, sub] = h.split("/");
  return { route: route || "home", sub: sub || null };
}
function setSignedIn(v) { UI.signedIn = v; try { v ? sessionStorage.setItem("hub-signed-in", "1") : sessionStorage.removeItem("hub-signed-in"); } catch (e) {} }
function go(route, sub) { const h = "#" + route + (sub ? "/" + sub : ""); if (location.hash === h) { onRoute(); } else location.hash = h; }
function onRoute() {
  const { route, sub } = parseHash(); UI.chatErr = null;
  UI.route = route === "login" ? "home" : route; UI.sub = sub; UI.dd = null; UI.side = false; UI.drawer = null;
  render(); window.scrollTo(0, 0);
  if (typeof afterRoute === "function") setTimeout(afterRoute, 0);
}
window.addEventListener("hashchange", onRoute);

let _toastT = null;
function toast(text, undo) { UI.toast = { text, undo }; clearTimeout(_toastT); _toastT = setTimeout(() => { UI.toast = null; render(); }, undo ? 7000 : 3800); }

const VIEWS = {}, MODALS = {}, DRAWERS = {};

/* ---------- messages & notifications ---------- */
function mailList() {
  if (!S.session) return [];
  const r = rec(), M = hrMessages(), out = [{ id: "start", kind: "hr", ...M.start }];
  if (goalsApproved(r)) out.unshift({ id: "approved", kind: "hr", ...M.approved });
  if (r2Status(r) !== "locked") STAKEHOLDER_EMAILS.forEach(e => out.unshift({ id: "sh-" + e.id, kind: "stakeholder", ...e }));
  if (r3Status(r) !== "locked") out.unshift({ id: "yearend", kind: "hr", ...M.yearend });
  if (r.r3.done) out.unshift({ id: "closed", kind: "hr", ...M.closed });
  return out.map(m => ({ ...m, unread: !S.read[m.id] }));
}
function markRead(id) { S.read[id] = true; save(); }
const senderOf = (m) => m.kind === "stakeholder" ? STAKEHOLDERS[m.from] : { name: HR_SENDER.name, title: "Human Resources", initials: "HR" };
function senderAvatar(m, size = "") { const s = senderOf(m); return s.emp ? avatar(s.emp, size) : `<span class="hr-av ${size}">${esc(s.initials)}</span>`; }

function pendingActions() {
  const r = rec(), out = [], g = r.goals.status;
  if (g === "not_started" || g === "draft") out.push({ t: g === "draft" ? "Complete and submit Omar's performance goal plan" : "Create Omar's performance goal plan", d: `HR request · due ${SIM_DATES.deadline}`, go: "goals", urgent: true });
  if (g === "pending_alignment") out.push({ t: "Align the performance plan with Omar", d: "Omar has replied to your plan.", go: "conversations/alignment", urgent: true });
  if (r2Status(r) !== "locked" && !r.r2.submitted) {
    if (!r.r2.seenDashboard) out.push({ t: "Business alert: review the latest performance data", d: "Commercial indicators changed after Valtora's announcement.", go: "business", urgent: true });
    if (!r.r2.diag.ended) out.push({ t: "Omar has asked to talk", d: "“Hi, do you have a few minutes?”", go: "conversations/midyear", urgent: true });
    out.push({ t: "Complete and submit Round 2", d: "Interpretation of the data, conversation and Evidence Log.", go: "round2" });
  }
  if (r3Status(r) !== "locked" && !r.r3.done) {
    if (!r.r3.dataset) out.push({ t: "Open the year-end performance update", d: "December", go: "yearend", urgent: true });
    else if (["not_started", "draft"].includes(r.r3.appraisal.status)) out.push({ t: "Complete Omar's year-end appraisal", d: "WHAT · HOW · overall rating", go: "appraisal", urgent: true });
    else if (!r.r3.conv.ended) out.push({ t: "Omar responded to your appraisal", d: "Continue the appraisal conversation.", go: "conversations/appraisal", urgent: true });
    else out.push({ t: "Reflect on possible rating biases and finalise", d: "Bias reflection", go: "reflection", urgent: true });
  }
  return out;
}
function notifications() {
  const out = [], r = rec();
  if (r.goals.status === "pending_alignment") out.push({ t: "Omar replied to your performance plan", d: "Employee alignment is required before the contract is finalised.", go: "conversations/alignment", icon: "chat" });
  if (r2Status(r) !== "locked" && !r.r2.seenDashboard) out.push({ t: "Business alert: commercial indicators changed", d: "Valtora launched a lower-priced alternative to Customer360.", go: "business", icon: "alert" });
  if (r2Status(r) !== "locked" && !r.r2.diag.ended) out.push({ t: "Omar Hassan: “Hi, do you have a few minutes?”", d: "Chat request", go: "conversations/midyear", icon: "chat" });
  if (r.r3.appraisal.status === "submitted" && !r.r3.conv.ended) out.push({ t: "Omar responded to your appraisal", d: "Appraisal conversation", go: "conversations/appraisal", icon: "chat" });
  mailList().filter(m => m.unread).forEach(m => out.push({ t: m.subject, d: `${senderOf(m).name} · ${m.date}`, go: "inbox/" + m.id, icon: "mail" }));
  return out.map(n => ({ ...n, unread: true }));
}

/* ---------- Pulse ---------- */
function pulseBars(r = rec(), compact = false) {
  return PULSE.dims.map(d => { const v = r.pulse.values[d.id]; return `<div class="pulse-row ${compact ? "compact" : ""}" title="${esc(d.d)}"><span class="pl">${d.l}</span><span class="pbar"><i class="p-${d.id}" style="width:${v}%"></i></span><b class="num">${v}</b></div>`; }).join("");
}
function pulseWidget() {
  const r = rec();
  return `<button class="pulse-chip" data-act="modal" data-m="pulse" aria-label="Employee Pulse">${icon("pulse", "i-sm")}<span class="pc-l">Omar's Pulse</span>${PULSE.dims.map(d => `<span class="pc-v"><span class="xs">${d.l[0]}</span> <b class="num">${r.pulse.values[d.id]}</b></span>`).join("")}</button>`;
}
MODALS.pulse = function () {
  const r = rec();
  return modalWrap("Employee Pulse · Omar Hassan", `${pulseBars(r)}
    <p class="xs muted">Pulse reflects how Omar is experiencing the year (0–100). It changes only after meaningful decisions or completed conversations, using fixed pilot rules. It is separate from your SCORE Learning Score.</p>
    <div class="stack-sm"><h4>Event history</h4>${pulseHistory(r)}</div>`, `<button class="btn" data-act="closeModal">Close</button>`, true);
};
function pulseHistory(r) {
  const dl = (v) => v > 0 ? `<span class="pos">+${v}</span>` : v < 0 ? `<span class="neg">${v}</span>` : `<span class="muted">0</span>`;
  return `<div class="table-wrap"><table class="tbl" style="min-width:640px"><thead><tr><th>Round</th><th>Event</th><th>Performance</th><th>Trust</th><th>Development</th><th>Why</th></tr></thead><tbody>
    <tr><td>—</td><td>Starting values (fictional baseline)</td><td class="num">${PULSE.baseline.performance}</td><td class="num">${PULSE.baseline.trust}</td><td class="num">${PULSE.baseline.development}</td><td class="xs muted">Pilot baseline</td></tr>
    ${r.pulse.history.map(h => `<tr><td>${h.round}</td><td>${esc(h.label)}</td><td class="num">${dl(h.delta.performance)}</td><td class="num">${dl(h.delta.trust)}</td><td class="num">${dl(h.delta.development)}</td><td class="xs">${esc(h.reason)}</td></tr>`).join("")}
  </tbody></table></div>`;
}

/* ---------- Round progress ---------- */
function roundSteps() {
  const r = rec(), a = r.r3.appraisal.status;
  return [
    { n: 1, l: "Setting Performance Expectations", steps: [["Goal plan", r.goals.objectives.length > 0], ["Competencies", r.goals.comps.length >= COMP_RANGE.min], ["Alignment", goalsApproved(r)]], done: goalsApproved(r) },
    { n: 2, l: "Performance Gaps, Diagnosis & Coaching", steps: [["Dashboard", r.r2.seenDashboard], ["Conversation", r.r2.diag.ended], ["Evidence Log", r.evidence.length > 0], ["Submitted", r.r2.submitted]], done: r.r2.submitted, locked: r2Status(r) === "locked" },
    { n: 3, l: "Final-Year Performance Evaluation", steps: [["Year-end update", !!r.r3.dataset], ["Appraisal", a === "submitted" || r.r3.done], ["Conversation", r.r3.conv.ended], ["Final", r.r3.done]], done: r.r3.done, locked: r3Status(r) === "locked" }
  ];
}
function roundTracker() {
  const cur = currentRound();
  return `<div class="rounds">${roundSteps().map(x => `<div class="round ${x.done ? "done" : ""} ${x.n === cur && !x.done ? "cur" : ""} ${x.locked ? "locked" : ""}"><div class="row between nowrap"><span class="round-tag">Round ${x.n}</span>${x.done ? `<span class="chip st-completed">Completed</span>` : x.locked ? `<span class="chip st-locked">Not yet open</span>` : `<span class="chip st-in_progress">Current</span>`}</div><b class="small">${x.l}</b><div class="steps">${x.steps.map(([l, ok]) => `<span class="step ${ok ? "ok" : ""}">${ok ? icon("check", "i-sm") : `<i></i>`}${l}</span>`).join("")}</div></div>`).join("")}</div>`;
}

/* ---------- shell ---------- */
function navItems() {
  const r = rec(), unreadMail = mailList().filter(m => m.unread).length;
  return [
    { id: "home", l: "Home", icon: "home" },
    { id: "inbox", l: "Inbox", icon: "mail", cnt: unreadMail },
    { id: "goals", l: "Performance Goals", icon: "target" },
    { id: "business", l: "Business Dashboard", icon: "bars", locked: r2Status(r) === "locked" },
    { id: "evidence", l: "Evidence Log", icon: "log", locked: !goalsApproved(r) },
    { id: "conversations", l: "Employee Conversations", icon: "chat", cnt: conversationsStatus(r) === "action" ? 1 : 0 },
    { id: "yearend", l: "Year-End Update", icon: "calendar", locked: r3Status(r) === "locked" },
    { id: "appraisal", l: "Final Appraisal", icon: "clipboard", locked: r3Status(r) === "locked" },
    { id: "review", l: "SCORE Review", icon: "chart", locked: !goalsApproved(r) }
  ];
}
function header() {
  const notes = notifications(), cur = currentRound();
  return `<header class="head">
    <button class="icon-btn menu-btn" data-act="side" aria-label="Open navigation">${icon("menu")}</button>
    <button class="row nowrap" data-act="go" data-go="home" style="background:none;border:0;padding:0;gap:12px" aria-label="Home"><img class="logo" src="${IMG.logoTop}" alt="NextWave"></button>
    <span class="sep"></span><span class="app">SCORE <span class="app-full">Performance Hub</span></span>
    <span class="round-pill">Round ${cur} of 3</span>
    <span class="grow"></span>
    ${pulseWidget()}
    <span style="position:relative"><button class="icon-btn" data-act="dd" data-dd="notif" aria-label="Notifications">${icon("bell")}${notes.length ? `<span class="badge">${notes.length}</span>` : ""}</button>${UI.dd === "notif" ? notifDropdown(notes) : ""}</span>
    <span style="position:relative"><button class="user-btn" data-act="dd" data-dd="user"><span class="initials">${esc(initials(S.session.name))}</span><span class="uname small">${esc(S.session.name)}</span></button>${UI.dd === "user" ? userDropdown() : ""}</span>
  </header>`;
}
function notifDropdown(notes) {
  return `<div class="dropdown wide" role="menu"><div class="dd-head">Notifications</div>${notes.length ? notes.slice(0, 10).map(n => `<button class="dd-item unread" data-act="go" data-go="${n.go}">${icon(n.icon, "i-sm")}<span class="stack-sm" style="gap:1px"><b class="small">${esc(n.t)}</b><span class="xs muted">${esc(n.d)}</span></span></button>`).join("") : `<div class="dd-item muted">No new notifications.</div>`}</div>`;
}
function userDropdown() {
  return `<div class="dropdown" role="menu"><div class="dd-head">${esc(S.session.name)} · Commercial Director</div>
    <button class="dd-item" data-act="go" data-go="facilitator">${icon("shield", "i-sm")} Facilitator view</button>
    <button class="dd-item" data-act="signout">${icon("logout", "i-sm")} Sign out (progress is saved)</button></div>`;
}
function sidebar() {
  return `<div class="scrim-side ${UI.side ? "open" : ""}" data-act="side"></div><aside class="side ${UI.side ? "open" : ""}" aria-label="Navigation">
    <nav class="nav">${navItems().map(n => `<button class="nav-item ${UI.route === n.id ? "on" : ""}" data-act="go" data-go="${n.id}">${icon(n.icon)}<span>${n.l}</span>${n.cnt ? `<span class="cnt">${n.cnt}</span>` : n.locked ? `<span class="lock">${icon("lock", "i-sm")}</span>` : ""}</button>`).join("")}</nav>
    <div class="stack-sm"><div class="eyebrow side-h">Commercial team</div><div class="team">${EMP_ORDER.map(e => {
      const E = EMPLOYEES[e], active = PILOT.active.includes(e);
      return `<button class="team-item ${active ? "on" : ""}" data-act="modal" data-m="profile" data-emp="${e}">${avatar(e, "sm")}<span class="stack-sm" style="gap:0;min-width:0"><span class="nm">${esc(E.name)}</span><span class="rl">${esc(E.title)}${active ? "" : " · stakeholder"}</span></span></button>`;
    }).join("")}</div></div>
    <div class="side-foot">Pilot: Omar Hassan's journey. Youssef, Salma and Mariam appear as colleagues and stakeholders. NextWave is a fictional company.</div>
  </aside>`;
}
function pageHead(crumb, title, right = "", sub = "") {
  return `<div class="page-head"><div><div class="crumb">${crumb}</div><h1>${title}</h1>${sub ? `<p class="t2 small" style="margin-top:4px">${sub}</p>` : ""}</div><div class="row">${right}</div></div>`;
}
function empChip() { const E = EMP(); return `<span class="row nowrap" style="gap:8px">${avatar(S.emp, "sm")}<span class="small"><b>${esc(E.name)}</b> · <span class="muted">${esc(E.title)}</span></span></span>`; }
function lockedPanel(title, text) { return `<div class="card"><div class="empty">${icon("lock")}<h3>${title}</h3><p class="small" style="max-width:58ch">${text}</p></div></div>`; }

/* ---------- render ---------- */
function render() {
  const app = document.getElementById("app");
  const ae = document.activeElement, key = ae && (ae.getAttribute("data-bind") || ae.id), selS = ae && ae.selectionStart, selE = ae && ae.selectionEnd;
  const chat = document.getElementById("chat-log"), chatScroll = chat ? chat.scrollTop : null, chatBottom = chat ? chat.scrollHeight - chat.scrollTop - chat.clientHeight < 40 : true;
  let html;
  if (!S.session || !UI.signedIn) html = VIEWS.login();
  else {
    const v = VIEWS[UI.route] || VIEWS.home;
    html = header() + `<div class="shell">${sidebar()}<main class="main" id="main">${aiNotice()}${v()}</main></div>`;
  }
  html += modalHTML() + drawerHTML() + (UI.toast ? `<div class="toast" role="status">${esc(UI.toast.text)}${UI.toast.undo ? `<button data-act="undo">Undo</button>` : ""}</div>` : "");
  app.innerHTML = html;
  if (key) {
    const el = app.querySelector(`[data-bind="${CSS.escape(key)}"]`) || document.getElementById(key);
    if (el) { el.focus({ preventScroll: true }); try { if (selS != null && el.setSelectionRange) el.setSelectionRange(selS, selE); } catch (e) {} }
  }
  const nc = document.getElementById("chat-log"); if (nc) nc.scrollTop = chatBottom ? nc.scrollHeight : chatScroll;
  if (UI.flash) { const el = document.getElementById(UI.flash); UI.flash = null; if (el) el.scrollIntoView({ block: "center" }); }
}
function modalHTML() { return UI.modal && MODALS[UI.modal.type] ? MODALS[UI.modal.type](UI.modal) : ""; }
function drawerHTML() { return UI.drawer && DRAWERS[UI.drawer.type] ? DRAWERS[UI.drawer.type](UI.drawer) : ""; }
function modalWrap(title, body, foot = "", wide = false, sub = "") {
  return `<div class="scrim" data-act="closeModalBg"><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><div class="row nowrap" style="gap:10px">${sub}<h3>${title}</h3></div><button class="icon-btn" data-act="closeModal" aria-label="Close">${icon("x")}</button></div><div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ""}</div></div>`;
}
