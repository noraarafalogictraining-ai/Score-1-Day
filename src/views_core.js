/* =========================================================
   LOGIN · HOME · INBOX · PROFILE · FACILITATOR
   ========================================================= */
VIEWS.login = function () {
  const saved = S.session;
  return `<div class="login">
    <div class="login-card">
      <img class="login-logo" src="${IMG.logo}" alt="NextWave">
      <h1>Welcome to NextWave</h1>
      <form class="stack" autocomplete="off" onsubmit="return false" novalidate>
        <div class="field"><label for="login-name">Username</label><input class="inp" id="login-name" maxlength="60" autocomplete="off" spellcheck="false" aria-describedby="login-err">${UI.loginErr ? `<span class="err-text" id="login-err" role="alert">${esc(UI.loginErr)}</span>` : ""}</div>
        <div class="field"><label for="login-pass">Password</label><input class="inp masked" id="login-pass" type="text" autocomplete="off" data-lpignore="true" spellcheck="false"></div>
        <button class="btn primary login-btn" data-act="signin" id="signin-btn" type="submit">Sign In</button>
      </form>
      ${saved ? `<button class="resume-link" data-act="resume" id="resume-btn"><span class="initials sm">${esc(initials(saved.name))}</span><span class="grow"><b>Continue as ${esc(saved.name)}</b><span class="xs">Last active ${S.saved ? new Date(S.saved).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "recently"}</span></span>${icon("arrow", "i-sm")}</button>` : ""}
    </div>
  </div>`;
};

/* ---------- Home: the dashboard only ---------- */
VIEWS.home = function () {
  const r = rec();
  return pageHead("Home", `Welcome, ${esc(S.session.name)}`, "", DIRECTOR.title) + `
  <div class="stack-lg">
    ${commercialOverview(r)}
  </div>`;
};

/* ---------- Omar Hassan – Employee Profile (dedicated sidebar section) ---------- */
VIEWS.employee = function () {
  const E = EMP(), open = !!UI.prevOpen;
  return pageHead("", "Employee Profile") + `<div class="stack-lg">
    <div class="card pad-lg emp-overview"><div class="emp-hero">${avatar(S.emp, "xl")}<div class="stack-sm grow" style="gap:3px"><div class="eyebrow">Employee profile</div><h2>${esc(E.name)}</h2><div class="t2">${esc(E.title)} · Commercial</div><div class="xs muted">${esc(E.tenure)}</div></div></div></div>
    <section class="purpose-card">${icon("compass")}<div><div class="eyebrow" style="color:#5ED3E2">Role purpose</div><p>${esc(E.role.purpose)}</p></div></section>
    <section class="card"><div class="card-h"><h3>Core responsibilities</h3></div><ul class="acc-b" id="emp-resp">${E.role.responsibilities.map(x => `<li>${icon("check", "i-sm")}<span>${esc(x)}</span></li>`).join("")}</ul></section>
    <section class="card"><div class="card-h"><h3>What Omar brings to the team</h3></div><div class="card-b stack-sm"><div class="row" style="gap:6px">${E.strengths.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div><p class="small t2">${esc(E.prevPerformance)}</p></div></section>
    <section class="card prev-card ${open ? "open" : ""}">
      <button class="prev-btn" id="prev-btn" data-act="prevToggle" aria-expanded="${open}" aria-controls="prev-2026">${icon("clipboard")}<span class="grow"><b>Last Year's Performance Evidence</b><span class="xs muted">2026 appraisal: objectives, results, competency ratings and comments</span></span>${icon(open ? "x" : "chevdown", "i-sm")}</button>
      ${open && E.prev2026 ? `<div class="card-b">${prev2026(E.prev2026)}<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-act="prevToggle" id="prev-close">${icon("x", "i-sm")} Close</button></div></div>` : ""}
    </section>
  </div>`;
};

/* ---------- My Profile (the participant) ---------- */
VIEWS.profile = function () {
  const n = S.session.name, D = DIRECTOR, tab = ["responsibilities", "objectives"].includes(UI.sub) ? UI.sub : "overview";
  const tabs = [["overview", "Overview", "user"], ["responsibilities", "My Responsibilities", "book"], ["objectives", "My Performance Objectives", "target"]];
  return pageHead("", "My Profile") + `<div class="stack-lg">
    <div class="profile-hero"><span class="initials xl">${esc(initials(n))}</span><div class="grow"><h2>${esc(n)}</h2><div>${D.title} · ${D.department}</div><div class="ph-meta"><span>${icon("building", "i-xs")} ${D.company}</span><span>${icon("calendar", "i-xs")} Joined ${D.joined}</span><span>${icon("people", "i-xs")} ${D.directReports} direct reports</span></div></div><span class="chip st-approved">${D.status}</span></div>
    <div class="tabs" role="tablist">${tabs.map(([id, l, ic]) => `<button class="tab ${tab === id ? "on" : ""}" role="tab" aria-selected="${tab === id}" data-act="go" data-go="profile/${id}">${icon(ic, "i-sm")} ${l}</button>`).join("")}</div>
    ${tab === "responsibilities" ? profileResponsibilities() : tab === "objectives" ? profileObjectives() : profileOverview()}
  </div>`;
};
function profileOverview() {
  return `<section class="card"><div class="card-h"><div><h3>My team</h3><div class="xs muted">Commercial Department · select a person for details</div></div></div><div class="card-b">${orgChart()}</div></section>`;
}
function orgPerson(e, extra = "") {
  const E = EMPLOYEES[e];
  return `<button class="org-node" ${PILOT.active.includes(e) ? `data-act="go" data-go="employee"` : `data-act="modal" data-m="profile" data-emp="${e}"`}>${avatar(e, "sm")}<span><b>${esc(E.name)}</b><span class="xs muted">${esc(E.title)}</span>${extra}</span></button>`;
}
function orgChart() {
  const D = DIRECTOR, n = S.session.name, open = UI.orgOpen !== false;
  return `<div class="org">
    <div class="org-node top">${icon("building", "i-sm")}<span><b>Chief Executive Officer</b><span class="xs muted">CEO</span></span></div><div class="org-line"></div>
    <div class="org-node me"><span class="initials sm">${esc(initials(n))}</span><span><b>${esc(n)}</b><span class="xs muted">${D.title} · you</span></span></div><div class="org-line"></div>
    <div class="org-branches">${D.directs.map(e => { const sub = (D.indirect[e] || []); return `<div class="org-branch"><div class="org-stem"></div>${orgPerson(e, sub.length ? `<span class="xs org-mgr">Manages ${sub.length}</span>` : "")}
      ${sub.length ? `<button class="btn ghost sm org-toggle" data-act="orgToggle" aria-expanded="${open}">${icon(open ? "chevdown" : "chev", "i-xs")} ${open ? "Hide" : "Show"} team</button>${open ? `<div class="org-sub">${sub.map(x => `<div class="org-subline"></div>${orgPerson(x, `<span class="xs muted">Reports to ${esc(EMPLOYEES[e].name)}</span>`)}`).join("")}</div>` : ""}` : ""}</div>`; }).join("")}</div>
  </div>`;
}
const RESP_GROUPS = [
  { id: "strategy", t: "Objectives, growth and market intelligence", icon: "target", items: [0, 1, 2] },
  { id: "ops", t: "Coordination and monitoring", icon: "layers", items: [3, 4] },
  { id: "team", t: "Leading and developing the team", icon: "people", items: [5] }
];
function profileResponsibilities() {
  const D = DIRECTOR, open = UI.respOpen || { strategy: true };
  return `<div class="stack">
    <section class="purpose-card">${icon("compass")}<div><div class="eyebrow" style="color:#5ED3E2">Job purpose</div><p>${esc(D.purpose)}</p></div></section>
    ${RESP_GROUPS.map(g => `<section class="acc ${open[g.id] ? "open" : ""}"><button class="acc-h" data-act="respToggle" data-id="${g.id}" aria-expanded="${!!open[g.id]}"><span class="info-ic">${icon(g.icon, "i-sm")}</span><b class="grow">${g.t}</b><span class="tag">${g.items.length}</span>${icon("chevdown", "i-sm")}</button>
      ${open[g.id] ? `<ul class="acc-b">${g.items.map(i => `<li>${icon("check", "i-sm")}<span>${esc(D.responsibilities[i])}</span></li>`).join("")}</ul>` : ""}</section>`).join("")}
  </div>`;
}
function profileObjectives() {
  return `<div class="stack"><p class="small t2">NextWave Digital's ${APP.cycleYear} strategic targets are company-wide. As Commercial Director you contribute to them, but you do not own every result on your own.</p>
    <div class="obj-row">${CEO_OBJECTIVES.map((o, i) => `<div class="ceo-card fixed"><div class="ceo-top"><span class="row between nowrap"><span class="goal-n">${i + 1}</span><span class="tag blue">${esc(o.target)}</span></span><b>${esc(o.title)}</b><span class="xs muted">${esc(o.short)}</span></div>
      <div class="ceo-detail small"><div><span class="muted">Company objective</span>${esc(o.kpi)}</div><div><span class="muted">Your contribution</span>${esc(o.contribution)}</div></div></div>`).join("")}</div></div>`;
}
function prev2026(P) {
  return `<div class="stack-sm" id="prev-2026"><h4>Last year's appraisal (2026)</h4>
    <div class="xs muted">Part I · Competencies (40%) · Rating scale: ${esc(P.scale)}</div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Competency</th><th style="width:60px">Rating</th><th>Performance evidence</th></tr></thead><tbody>${P.competencies.map(([c, n, r, e]) => `<tr><td><span class="xs muted">${esc(c)}</span><br>${esc(n)}</td><td class="num">${r}</td><td class="small">${esc(e)}</td></tr>`).join("")}</tbody></table></div>
    <div class="xs">Competency score: <b>${esc(P.competencyScore)}</b> · Average rating: ${esc(P.average)}</div>
    <div class="xs muted">Part II · Objectives (60%)</div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Objective</th><th>Measure</th><th>Target</th><th>Actual</th><th>Achieved</th><th>Weight</th><th>Score</th></tr></thead><tbody>${P.objectives.map(o => `<tr><td>${esc(o[0])}</td><td class="small">${esc(o[1])}</td>${o.slice(2, 7).map(x => `<td class="num">${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="xs">Objectives score: <b>${esc(P.objectivesScore)}</b></div>
    <div class="obj-comments" id="obj-comments"><h4>Objective-Level Comments</h4><ol class="small t2">${P.objectives.map(o => `<li>${esc(o[7])}</li>`).join("")}</ol></div>
    <div class="xs">Overall: ${P.overall.map(([c, w, sc, wc]) => `${esc(c)} ${esc(w)} × ${esc(sc)} = ${esc(wc)}`).join(" · ")} → <b>${esc(P.overallScore)}</b></div>
  </div>`;
}
MODALS.profile = function (m) {
  const e = m.emp || S.emp, E = EMPLOYEES[e], active = PILOT.active.includes(e);
  return modalWrap("Employee profile", `
    <div class="row nowrap" style="gap:14px">${avatar(e, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)} · Commercial</div><div class="xs muted">${esc(E.tenure)}</div></div></div>
    ${active ? `<dl class="kv"><dt>Reports to</dt><dd>${esc(E.role.reportsTo)}</dd><dt>Previous overall rating</dt><dd>${esc(E.prevRating)}</dd></dl>
    <div class="stack-sm"><h4>Role purpose</h4><p class="small t2">${esc(E.role.purpose)}</p></div>
    <div class="stack-sm"><h4>Core responsibilities</h4><ul class="list-plain small t2">${E.role.responsibilities.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="stack-sm"><h4>What Omar brings to the team</h4><div class="row" style="gap:6px">${E.strengths.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div><p class="small t2">${esc(E.prevPerformance)}</p></div>
    ${E.prev2026 ? prev2026(E.prev2026) : ""}`
    : `<dl class="kv"><dt>Reports to</dt><dd>${esc(E.role.reportsTo)}</dd></dl><div class="stack-sm"><h4>Role purpose</h4><p class="small t2">${esc(E.role.purpose)}</p></div>`}`, `<button class="btn" data-act="closeModal">Close</button>`, true);
};

VIEWS.inbox = function () {
  const ms = mailList(), cur = ms.find(m => m.id === UI.sub) || ms[0];
  if (cur && cur.unread) { markRead(cur.id); cur.unread = false; }
  return pageHead("", "My Inbox") + `<div class="card split">
    <div class="list"><div class="list-h">Email</div>${ms.map(m => `<button class="msg-item ${m === cur ? "on" : ""} ${m.unread ? "unread" : ""}" data-act="go" data-go="inbox/${m.id}">${senderAvatar(m, "sm")}<span class="stack-sm grow" style="gap:1px"><span class="row between nowrap"><span class="xs muted">${esc(senderOf(m).name)}</span><span class="xs muted">${m.date.replace(/^\w+ /, "")}</span></span><span class="subj">${m.attach ? icon("clip", "i-xs") + " " : ""}${esc(m.subject)}</span></span></button>`).join("")}</div>
    <div>${cur ? mailView(cur) : `<div class="empty">No messages.</div>`}</div>
  </div>`;
};
function mailView(m) {
  const s = senderOf(m), r = rec();
  const body = m.body.map(p => p === "__LIST__" ? `<ul>${m.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>")}</p>`).join("");
  const to = (m.to || ["me"]).map(recipient), cc = (m.cc || []).map(recipient);
  const attach = m.attach ? `<div class="attach">${icon("clip", "i-sm")}<span class="grow"><b class="small">Year-End Performance Summary — Omar Hassan.pdf</b><span class="xs muted">${r.r3.dataset ? "Performance evidence · December 2027" : r.r3.error ? esc(r.r3.error) : "Preparing…"}</span></span>${r.r3.dataset ? `<button class="btn sm" data-act="go" data-go="yearend">${icon("eye", "i-sm")} Open</button>` : r.r3.error ? `<button class="btn sm" data-act="loadYearEnd">Retry</button>` : ""}</div>` : "";
  return `<article class="mail">
    <h2>${esc(m.subject)}</h2>
    <div class="mail-meta">${senderAvatar(m)}<div class="grow"><div class="row between"><span><b class="small">${esc(s.name)}</b> <span class="xs muted">${esc(s.title)}</span></span><span class="xs muted">${m.date}</span></div><div class="xs t2 mail-rcpt"><span class="muted">To:</span> ${to.map(esc).join("; ")}</div>${cc.length ? `<div class="xs t2 mail-rcpt"><span class="muted">Cc:</span> ${cc.map(esc).join("; ")}</div>` : ""}</div></div>
    ${m.secondhand ? `<div class="notice warn">${icon("info", "i-sm")}<span><b>Secondhand account.</b> Mariam is reporting what she observed and what Omar told her. It has not been verified.</span></div>` : ""}
    <div class="mail-body">${body}</div>
    ${m.closing ? `<section class="cycle-close" id="cycle-close">
      <div class="cc-title">${APP.cycleYear} PERFORMANCE CYCLE COMPLETED</div>
      <p class="cc-quote">Great performance is not managed once a year. It is built through everyday leadership.</p>
      <ol class="score-journey" aria-label="The SCORE journey">${["SET", "CHECK", "OPTIMIZE", "REVIEW", "EVOLVE"].map((w, i) => `${i ? `<li class="sj-arrow" aria-hidden="true">→</li>` : ""}<li class="sj-step"><b>${w[0]}</b>${w.slice(1)}</li>`).join("")}</ol>
    </section>` : ""}
    ${attach}
    ${m.action ? `<div><button class="btn primary" data-act="go" data-go="${m.action.go}">${esc(m.action.l)} ${icon("arrow", "i-sm")}</button></div>` : ""}
  </article>`;
}

/* Removed routes (year-end round, Learning Score report): old links open Home */
["appraisal", "yearend", "reflection", "review"].forEach(k => { VIEWS[k] = function () { setTimeout(() => go("home"), 0); return ""; }; });
/* The facilitator view was removed: the next stage starts with the "End-year" button in the Evidence Log (waitCard). */
MODALS.reset = function () {
  return modalWrap("Reset this session?", `<p class="small t2">All plans, conversations, evidence and Pulse history saved on this device will be deleted. This cannot be undone.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" style="background:var(--risk);border-color:var(--risk)" data-act="doReset">Delete and reset</button>`);
};
MODALS.newSession = function () {
  return modalWrap("Start a new session?", `<p class="small t2">This device already has a saved session for <b>${esc(S.session.name)}</b>. Starting a new session replaces it. To keep working on it, choose Resume instead.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="signinConfirm">Start new session</button>`);
};
