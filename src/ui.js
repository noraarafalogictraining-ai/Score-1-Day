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
  building: '<path d="M5 21V5l7-2v18M12 21h7V9l-7-2"/><path d="M8 8h1M8 12h1M8 16h1M15 12h1M15 16h1"/>',
  clip: '<path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>',
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  trend: '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
  sprout: '<path d="M12 20v-8"/><path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6Z"/><path d="M12 14c0-3-2-5-6-5 0 3 2 5 6 5Z"/>',
  chevdown: '<path d="m6 9 6 6 6-6"/>',
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
const UI = { signedIn: (() => { try { return sessionStorage.getItem("hub-signed-in") === "1"; } catch (e) { return false; } })(), route: "login", sub: null, modal: null, toast: null, dd: null, side: false, edit: null, evFilter: "all", drawer: null, facOK: false, codeErr: null, flash: null, busy: null, chatErr: null, libOpen: null, pmOpen: true, kpiOpen: null, month: null, dashView: "trend" };
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
  if (r3Status(r) !== "locked") out.unshift({ id: "yearend", kind: "hr", attach: true, ...M.yearend });
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
    out.push({ t: "Complete the mid-year review", d: "Interpretation of the data, conversation and Evidence Log.", go: "round2" });
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

/* ---------- Pulse (visual only; values come from the rules engine in state.js) ---------- */
const PULSE_LOOK = { performance: { icon: "trend", cls: "pp-perf" }, trust: { icon: "shield", cls: "pp-trust" }, development: { icon: "sprout", cls: "pp-dev" } };
const PERIOD = { 1: "January", 2: "July", 3: "December" };
function pulseRing(v, cls, size = 30) {
  const r = size / 2 - 3, c = 2 * Math.PI * r, off = c * (1 - v / 100);
  return `<svg class="ring ${cls}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}
function pulseBars(r = rec(), compact = false) {
  return PULSE.dims.map(d => { const v = r.pulse.values[d.id], L = PULSE_LOOK[d.id]; return `<div class="pulse-row ${compact ? "compact" : ""} ${L.cls}" title="${esc(d.d)}"><span class="pl">${icon(L.icon, "i-sm")}${d.l}</span><span class="pbar"><i style="width:${v}%"></i></span><b class="num">${v}</b></div>`; }).join("");
}
function pulseWidget() {
  const r = rec();
  return `<div class="pulse-top" role="group" aria-label="Employee Pulse: Omar Hassan"><span class="pt-label">Employee Pulse</span>${PULSE.dims.map(d => {
    const v = r.pulse.values[d.id], L = PULSE_LOOK[d.id];
    return `<button class="pt-item ${L.cls}" data-act="modal" data-m="pulse" data-k="${d.id}" aria-label="${d.l} ${v} out of 100. ${esc(d.d)}"><span class="pt-ring">${pulseRing(v, L.cls)}<span class="pt-ic">${icon(L.icon, "i-xs")}</span></span><span class="pt-txt"><span class="pt-n">${d.l}</span><b class="num">${v}</b></span><span class="pt-tip" role="tooltip"><b>${d.l} · ${v}/100</b>${esc(d.d)}</span></button>`;
  }).join("")}</div>`;
}
MODALS.pulse = function (m) {
  const r = rec(), focus = PULSE.dims.find(d => d.id === m.k);
  return modalWrap("Employee Pulse · Omar Hassan", `
    <div class="pulse-cards">${PULSE.dims.map(d => { const L = PULSE_LOOK[d.id], v = r.pulse.values[d.id]; return `<div class="pulse-card ${L.cls} ${focus && focus.id === d.id ? "focus" : ""}"><span class="pt-ring">${pulseRing(v, L.cls, 56)}<span class="pt-ic">${icon(L.icon, "i-sm")}</span></span><div><b>${d.l}</b> <span class="num b">${v}</span><span class="xs muted">/100</span><div class="xs t2">${esc(d.d)}</div></div></div>`; }).join("")}</div>
    <p class="xs muted">The Pulse reflects how Omar is experiencing the year (0–100). It changes after meaningful decisions and completed conversations, not after every message.</p>
    <div class="stack-sm"><h4>What changed and why</h4>${pulseHistory(r)}</div>`, `<button class="btn" data-act="closeModal">Close</button>`, true);
};
function pulseHistory(r, showRound = false) {
  const dl = (v) => v > 0 ? `<span class="pos">+${v}</span>` : v < 0 ? `<span class="neg">${v}</span>` : `<span class="muted">0</span>`;
  return `<div class="table-wrap"><table class="tbl" style="min-width:600px"><thead><tr><th>${showRound ? "Round" : "When"}</th><th>Event</th><th>Performance</th><th>Trust</th><th>Development</th><th>Why</th></tr></thead><tbody>
    <tr><td>${showRound ? "—" : "Start of year"}</td><td>Starting values</td><td class="num">${PULSE.baseline.performance}</td><td class="num">${PULSE.baseline.trust}</td><td class="num">${PULSE.baseline.development}</td><td class="xs muted">${showRound ? "Fictional pilot baseline" : ""}</td></tr>
    ${r.pulse.history.map(h => `<tr><td>${showRound ? h.round : PERIOD[h.round] || ""}</td><td>${esc(h.label)}</td><td class="num">${dl(h.delta.performance)}</td><td class="num">${dl(h.delta.trust)}</td><td class="num">${dl(h.delta.development)}</td><td class="xs">${esc(h.reason)}</td></tr>`).join("")}
  </tbody></table></div>`;
}

/* ---------- shell ---------- */
const PM_ROUTES = ["goals", "evidence", "appraisal"];
function navItems() {
  const r = rec(), unreadMail = mailList().filter(m => m.unread).length;
  return [
    { id: "home", l: "Home", icon: "home" },
    { id: "inbox", l: "My Inbox", icon: "mail", cnt: unreadMail },
    { id: "business", l: "Business Dashboard", icon: "bars", dot: r2Status(r) !== "locked" && !r.r2.seenDashboard },
    { id: "pm", l: "Performance Management", icon: "layers", children: [
      { id: "goals", l: "Objectives", icon: "target" },
      { id: "evidence", l: "Evidence Log", icon: "log", locked: !goalsApproved(r) },
      { id: "appraisal", l: "Final Appraisal", icon: "clipboard", locked: appraisalStatus(r) === "locked" }
    ] },
    { id: "conversations", l: "Employee Conversations", icon: "chat", cnt: conversationsStatus(r) === "action" ? 1 : 0 }
  ];
}
function header() {
  const notes = notifications();
  return `<header class="head">
    <button class="icon-btn menu-btn" data-act="side" aria-label="Open navigation">${icon("menu")}</button>
    <button class="brand-btn" data-act="go" data-go="home" aria-label="NextWave home"><img class="logo" src="${IMG.logoTop}" alt="NextWave"></button>
    <span class="grow"></span>
    ${pulseWidget()}
    <span class="head-tools">
      <span style="position:relative"><button class="icon-btn" data-act="dd" data-dd="notif" aria-label="Notifications">${icon("bell")}${notes.length ? `<span class="badge">${notes.length}</span>` : ""}</button>${UI.dd === "notif" ? notifDropdown(notes) : ""}</span>
      <span style="position:relative"><button class="user-btn" data-act="dd" data-dd="user" aria-label="Account menu"><span class="initials">${esc(initials(S.session.name))}</span><span class="uname small">${esc(S.session.name)}</span>${icon("chevdown", "i-xs")}</button>${UI.dd === "user" ? userDropdown() : ""}</span>
    </span>
  </header>`;
}
function notifDropdown(notes) {
  return `<div class="dropdown wide" role="menu"><div class="dd-head">Notifications</div>${notes.length ? notes.slice(0, 10).map(n => `<button class="dd-item unread" data-act="go" data-go="${n.go}">${icon(n.icon, "i-sm")}<span class="stack-sm" style="gap:1px"><b class="small">${esc(n.t)}</b><span class="xs muted">${esc(n.d)}</span></span></button>`).join("") : `<div class="dd-item muted">No new notifications.</div>`}</div>`;
}
function userDropdown() {
  return `<div class="dropdown" role="menu"><div class="dd-head">${esc(S.session.name)}<div class="xs muted" style="text-transform:none;letter-spacing:0;font-weight:500">${DIRECTOR.title}</div></div>
    <button class="dd-item" data-act="go" data-go="profile">${icon("user", "i-sm")} My Profile</button>
    <button class="dd-item" data-act="go" data-go="facilitator">${icon("shield", "i-sm")} Facilitator View</button>
    <button class="dd-item" data-act="signout">${icon("logout", "i-sm")} Sign Out</button></div>`;
}
function navButton(n, child) {
  return `<button class="nav-item ${child ? "child" : ""} ${UI.route === n.id ? "on" : ""}" data-act="go" data-go="${n.id}">${icon(n.icon)}<span>${n.l}</span>${n.cnt ? `<span class="cnt">${n.cnt}</span>` : n.dot ? `<span class="ndot" aria-label="New"></span>` : n.locked ? `<span class="lock">${icon("lock", "i-sm")}</span>` : ""}</button>`;
}
function sidebar() {
  const open = UI.pmOpen !== false || PM_ROUTES.includes(UI.route);
  return `<div class="scrim-side ${UI.side ? "open" : ""}" data-act="side"></div><aside class="side ${UI.side ? "open" : ""}" aria-label="Navigation">
    <nav class="nav">${navItems().map(n => n.children ? `<div class="nav-group ${open ? "open" : ""}">
        <button class="nav-item parent ${PM_ROUTES.includes(UI.route) ? "in" : ""}" data-act="pmToggle" aria-expanded="${open}">${icon(n.icon)}<span>${n.l}</span><span class="caret">${icon("chevdown", "i-sm")}</span></button>
        ${open ? `<div class="nav-children">${n.children.map(c => navButton(c, true)).join("")}</div>` : ""}
      </div>` : navButton(n)).join("")}</nav>
    <div class="side-foot">NextWave · ${APP.cycleYear}</div>
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
