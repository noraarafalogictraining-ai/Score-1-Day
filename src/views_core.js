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

/* ---------- Home: Commercial Overview ---------- */
VIEWS.home = function () {
  const E = EMP(), r = rec();
  return pageHead("Home", `Welcome, ${esc(S.session.name)}`, "", `${DIRECTOR.title} · Commercial Department`) + `
  <div class="stack-lg">
    <div class="card pad-lg emp-overview"><div class="emp-hero">${avatar(S.emp, "xl")}<div class="stack-sm grow" style="gap:3px"><div class="eyebrow">Employee overview</div><h2>${esc(E.name)}</h2><div class="t2">${esc(E.title)} · Commercial</div><div class="xs muted">${esc(E.tenure)}</div></div>
      <button class="btn" data-act="modal" data-m="profile" data-emp="${S.emp}">${icon("user", "i-sm")} View profile</button></div></div>
    ${commercialOverview(r)}
  </div>`;
};

/* ---------- My Profile (the participant) ---------- */
VIEWS.profile = function () {
  const n = S.session.name, D = DIRECTOR, tab = ["responsibilities", "objectives"].includes(UI.sub) ? UI.sub : "overview";
  const tabs = [["overview", "Overview", "user"], ["responsibilities", "My Responsibilities", "book"], ["objectives", "My Performance Objectives", "target"]];
  return pageHead("My Profile", "My Profile") + `<div class="stack-lg">
    <div class="profile-hero"><span class="initials xl">${esc(initials(n))}</span><div class="grow"><h2>${esc(n)}</h2><div>${D.title} · ${D.department}</div><div class="ph-meta"><span>${icon("building", "i-xs")} ${D.company}</span><span>${icon("calendar", "i-xs")} Joined ${D.joined}</span><span>${icon("people", "i-xs")} ${D.directReports} direct reports</span></div></div><span class="chip st-approved">${D.status}</span></div>
    <div class="tabs" role="tablist">${tabs.map(([id, l, ic]) => `<button class="tab ${tab === id ? "on" : ""}" role="tab" aria-selected="${tab === id}" data-act="go" data-go="profile/${id}">${icon(ic, "i-sm")} ${l}</button>`).join("")}</div>
    ${tab === "responsibilities" ? profileResponsibilities() : tab === "objectives" ? profileObjectives() : profileOverview()}
  </div>`;
};
function profileOverview() {
  const D = DIRECTOR, n = S.session.name;
  const info = [["user", "Employee name", n], ["clipboard", "Position", D.title], ["layers", "Department", D.department], ["building", "Company", D.company], ["calendar", "Joining date", D.joined], ["arrow", "Reporting line", D.reportsTo], ["check", "Employment status", D.status], ["home", "Work location", D.location], ["people", "Direct reports", `${D.directReports} (plus 1 indirect)`], ["clock", "Performance year", D.year], ["info", "Leave information", D.leave]];
  return `<div class="info-grid">${info.map(([ic, k, v]) => `<div class="info-card"><span class="info-ic">${icon(ic, "i-sm")}</span><span><span class="xs muted">${k}</span><b class="small">${esc(v)}</b></span></div>`).join("")}</div>
    <section class="card"><div class="card-h"><div><h3>My team</h3><div class="xs muted">Commercial Department · select a person for details</div></div></div><div class="card-b">${orgChart()}</div></section>`;
}
function orgPerson(e, extra = "") {
  const E = EMPLOYEES[e];
  return `<button class="org-node" data-act="modal" data-m="profile" data-emp="${e}">${avatar(e, "sm")}<span><b>${esc(E.name)}</b><span class="xs muted">${esc(E.title)}</span>${extra}</span></button>`;
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
  { id: "strategy", t: "Strategy and targets", icon: "target", items: [0, 3, 8] },
  { id: "team", t: "Leading the Commercial team", icon: "people", items: [1, 5, 6] },
  { id: "ops", t: "Commercial operations and collaboration", icon: "layers", items: [2, 4, 7] }
];
function profileResponsibilities() {
  const D = DIRECTOR, open = UI.respOpen || { strategy: true };
  return `<div class="stack">
    <section class="purpose-card">${icon("compass")}<div><div class="eyebrow" style="color:#5ED3E2">Job purpose</div><p>${esc(D.purpose)}</p></div></section>
    ${RESP_GROUPS.map(g => `<section class="acc ${open[g.id] ? "open" : ""}"><button class="acc-h" data-act="respToggle" data-id="${g.id}" aria-expanded="${!!open[g.id]}"><span class="info-ic">${icon(g.icon, "i-sm")}</span><b class="grow">${g.t}</b><span class="tag">${g.items.length}</span>${icon("chevdown", "i-sm")}</button>
      ${open[g.id] ? `<ul class="acc-b">${g.items.map(i => `<li>${icon("check", "i-sm")}<span>${esc(D.responsibilities[i])}</span></li>`).join("")}</ul>` : ""}</section>`).join("")}
  </div>`;
}
const CEO_INDICATOR = { growth: "Commercial revenue growth", conversion: "Proposal win rate", pipeline: "Qualified opportunities", responsiveness: "Competitor developments and market intelligence reporting", team: "Performance management cycle for your direct reports" };
function profileObjectives() {
  return `<div class="stack"><p class="small t2">Your ${APP.cycleYear} objectives, set by the Chief Executive Officer. They are read-only and give the strategic context for the objectives you agree with your team.</p>
    <div class="obj-grid">${CEO_OBJECTIVES.map((o, i) => { const on = UI.ceoOpen === o.id; return `<div class="ceo-card ${on ? "open" : ""}"><button class="ceo-btn" data-act="ceoToggle" data-id="${o.id}" aria-expanded="${on}"><span class="row between nowrap"><span class="goal-n">${i + 1}</span><span class="tag blue">${esc(o.target)}</span></span><b>${esc(o.title)}</b><span class="xs muted">${esc(o.short)}</span><span class="xs ceo-more">${on ? "Hide details" : "View details"} ${icon(on ? "chevdown" : "chev", "i-xs")}</span></button>
      ${on ? `<div class="ceo-detail small"><div><span class="muted">Measure</span>${esc(o.kpi)}</div><div><span class="muted">Target</span>${esc(o.target)}</div><div><span class="muted">Tracked through</span>${esc(CEO_INDICATOR[o.id])}</div><div><span class="muted">Strategic context</span>One of the CEO's ${APP.cycleYear} priorities for the Commercial Department. Read-only.</div></div>` : ""}</div>`; }).join("")}</div></div>`;
}
MODALS.profile = function (m) {
  const e = m.emp || S.emp, E = EMPLOYEES[e], active = PILOT.active.includes(e);
  return modalWrap("Employee profile", `
    <div class="row nowrap" style="gap:14px">${avatar(e, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)} · Commercial</div><div class="xs muted">${esc(E.tenure)}</div></div></div>
    ${active ? `<dl class="kv"><dt>Reports to</dt><dd>${esc(E.role.reportsTo)}</dd><dt>Previous rating</dt><dd>${esc(E.prevRating)}</dd></dl>
    <div class="stack-sm"><h4>Role responsibilities</h4><ul class="list-plain small t2">${E.role.responsibilities.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="stack-sm"><h4>Strengths</h4><div class="row" style="gap:6px">${E.strengths.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div></div>
    <div class="stack-sm"><h4>Previous-year evidence</h4><ul class="list-plain small t2">${E.prevEvidence.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="stack-sm"><h4>Previous stakeholder feedback</h4>${E.prevFeedback.map(([w, t]) => `<div class="small"><b>${esc(w)}:</b> <span class="t2">“${esc(t)}”</span></div>`).join("")}</div>`
    : `<dl class="kv"><dt>Reports to</dt><dd>${esc(E.role.reportsTo)}</dd></dl><div class="stack-sm"><h4>Role purpose</h4><p class="small t2">${esc(E.role.purpose)}</p></div>`}`, `<button class="btn" data-act="closeModal">Close</button>`, true);
};

VIEWS.inbox = function () {
  const ms = mailList(), cur = ms.find(m => m.id === UI.sub) || ms[0];
  if (cur && cur.unread) { markRead(cur.id); cur.unread = false; }
  return pageHead("My Inbox", "My Inbox") + `<div class="card split">
    <div class="list">${chatInboxItem()}<div class="list-h">Email</div>${ms.map(m => `<button class="msg-item ${m === cur ? "on" : ""} ${m.unread ? "unread" : ""}" data-act="go" data-go="inbox/${m.id}">${senderAvatar(m, "sm")}<span class="stack-sm grow" style="gap:1px"><span class="row between nowrap"><span class="xs muted">${esc(senderOf(m).name)}</span><span class="xs muted">${m.date.replace(/^\w+ /, "")}</span></span><span class="subj">${m.attach ? icon("clip", "i-xs") + " " : ""}${esc(m.subject)}</span></span></button>`).join("")}</div>
    <div>${cur ? mailView(cur) : `<div class="empty">No messages.</div>`}</div>
  </div>`;
};
function chatInboxItem() {
  const r = rec(), last = chatThread(r).slice(-1)[0], n = chatUnread(r);
  return `<div class="list-h">Chat</div><button class="msg-item chat-item ${n ? "unread" : ""}" data-act="openChat" id="inbox-chat">${avatar(S.emp, "sm")}<span class="stack-sm grow" style="gap:1px"><span class="row between nowrap"><b class="small">Omar Hassan</b>${n ? `<span class="cb-badge static">${n}</span>` : ""}</span><span class="xs muted ellipsis">${last ? `${last.from === "manager" ? "You: " : ""}${esc(last.text)}` : ""}</span></span></button>`;
}
function mailView(m) {
  const s = senderOf(m), r = rec();
  const body = m.body.map(p => p === "__LIST__" ? `<ul>${m.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const to = (m.to || ["me"]).map(recipient), cc = (m.cc || []).map(recipient);
  const attach = m.attach ? `<div class="attach">${icon("clip", "i-sm")}<span class="grow"><b class="small">Year-End Performance Update — Omar Hassan.pdf</b><span class="xs muted">${r.r3.dataset ? "Performance evidence · December 2027" : r.r3.error ? esc(r.r3.error) : "Preparing…"}</span></span>${r.r3.dataset ? `<button class="btn sm" data-act="go" data-go="yearend">${icon("eye", "i-sm")} Open</button>` : r.r3.error ? `<button class="btn sm" data-act="loadYearEnd">Retry</button>` : ""}</div>` : "";
  return `<article class="mail">
    <h2>${esc(m.subject)}</h2>
    <div class="mail-meta">${senderAvatar(m)}<div class="grow"><div class="row between"><span><b class="small">${esc(s.name)}</b> <span class="xs muted">${esc(s.title)}</span></span><span class="xs muted">${m.date}</span></div><div class="xs t2 mail-rcpt"><span class="muted">To:</span> ${to.map(esc).join("; ")}</div>${cc.length ? `<div class="xs t2 mail-rcpt"><span class="muted">Cc:</span> ${cc.map(esc).join("; ")}</div>` : ""}</div></div>
    ${m.secondhand ? `<div class="notice warn">${icon("info", "i-sm")}<span><b>Secondhand account.</b> Mariam is reporting what she observed and what Omar told her. It has not been verified.</span></div>` : ""}
    <div class="mail-body">${body}</div>
    ${attach}
    ${m.action ? `<div><button class="btn primary" data-act="go" data-go="${m.action.go}">${esc(m.action.l)} ${icon("arrow", "i-sm")}</button></div>` : ""}
  </article>`;
}

/* ---------- Facilitator view ---------- */
VIEWS.facilitator = function () {
  if (!UI.facOK) return pageHead("Facilitator", "Facilitator view") + `<div class="card pad-lg stack" style="max-width:440px">
    <p class="small t2">Enter your code.</p>
    <div class="field"><label for="fac-code">Code</label><input class="inp" id="fac-code" inputmode="numeric" autocomplete="off" maxlength="8"></div>
    ${UI.codeErr === "fac" ? `<div class="err-text">That code is not correct.</div>` : ""}
    <div><button class="btn primary" data-act="facUnlock">Open facilitator view</button></div></div>`;
  const r = rec(), sc = scoreSummary(r), crit = criterionResults(r);
  return pageHead("Facilitator", "Facilitator view", "", "Round control, scenario state and manual controls for this device.") + `<div class="stack-lg">
    <div class="grid2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Rounds</h3><span class="xs muted">AI: <b>${esc(AIS.provider)}</b>${AIS.model ? ` · ${esc(AIS.model)}` : ""}</span></div><div class="card-b stack">
        <div class="row between nowrap"><div><b class="small">Round 1 · Setting Performance Expectations</b><div class="xs muted">Goal plan ${STATUS_LABEL[r.goals.status]}</div></div>${statusChip(r.goals.status)}</div>
        <div class="row between nowrap"><div><b class="small">Round 2 · Valtora event</b><div class="xs muted">Release after announcing the event in the room. Code for participants: ${RELEASE_CODES.r2}</div></div><button class="btn sm ${S.released.r2 ? "" : "primary"}" data-act="release" data-k="r2" ${S.released.r2 ? "disabled" : ""}>${S.released.r2 ? "Released" : "Release Round 2"}</button></div>
        <div class="row between nowrap"><div><b class="small">Round 3 · Year-end evaluation</b><div class="xs muted">Code for participants: ${RELEASE_CODES.r3}</div></div><button class="btn sm ${S.released.r3 ? "" : "primary"}" data-act="release" data-k="r3" ${S.released.r3 ? "disabled" : ""}>${S.released.r3 ? "Released" : "Release Round 3"}</button></div>
        <details class="small"><summary class="t2" style="cursor:pointer">Trainer announcement for Round 2</summary><p class="t2" style="margin-top:8px;white-space:pre-line">${esc(VALTORA_ANNOUNCEMENT)}</p></details>
      </div></div>
      <div class="card"><div class="card-h"><h3>Scenario state</h3></div><div class="card-b stack">
        <dl class="kv"><dt>Alignment</dt><dd>${r.align.confirmed ? `Confirmed${r.align.manual ? " (manual)" : ""} · ${esc((r.align.assessment && r.align.assessment.classification || {}).behaviour || "not assessed")}` : esc(STATUS_LABEL[r.goals.status])}</dd>
        <dt>Round 2 pathway</dt><dd>${r.r2.pathway ? `<b>${r.r2.pathway}</b>${r.r2.manual ? " (manual)" : ""}` : "Not set"}</dd>
        <dt>Year-end dataset</dt><dd>${r.r3.dataset ? esc(r.r3.tag || "Loaded") : "Not loaded"}</dd>
        <dt>Learning Score</dt><dd><b>${sc.total}/${sc.max}</b>${sc.pending ? ` · ${sc.pending} criteria pending` : ""}</dd></dl>
        ${pulseBars(r, true)}
      </div></div>
    </div>
    <div class="card"><div class="card-h"><h3>Manual controls</h3><span class="xs muted">Use when AI is unavailable or an assessment fails</span></div><div class="card-b stack">
      <div class="row between"><span class="small">Confirm the alignment without an AI conversation</span><button class="btn sm" data-act="facAlign" ${r.goals.status !== "pending_alignment" ? "disabled" : ""}>Confirm alignment</button></div>
      <div class="row between"><span class="small">End Omar's mid-year conversation</span><button class="btn sm" data-act="facEnd" data-k="diag" ${r2Status(r) === "locked" || r.r2.diag.ended ? "disabled" : ""}>End conversation</button></div>
      <div class="row between"><span class="small">Set the Round 2 pathway (overrides the AI classification; applies the matching coaching Pulse event if none was applied)</span><div class="seg">${["A", "B", "C"].map(p => `<button class="${r.r2.pathway === p ? "on" : ""}" data-act="facPathway" data-v="${p}" ${!S.released.r2 ? "disabled" : ""}>${p}</button>`).join("")}</div></div>
      <div class="row between"><span class="small">End Omar's appraisal conversation</span><button class="btn sm" data-act="facEnd" data-k="appraisal" ${r.r3.appraisal.status !== "submitted" || r.r3.conv.ended ? "disabled" : ""}>End conversation</button></div>
      <div class="row between"><span class="small">Finalize the appraisal without AI assessment</span><button class="btn sm" data-act="facFinal" ${!r.r3.conv.ended || r.r3.done ? "disabled" : ""}>Finalize</button></div>
    </div></div>
    <div class="card"><div class="card-h"><h3>Criterion scores</h3><span class="xs muted">Enter a score to override the AI assessment; clear it to restore</span></div><div class="card-b" style="overflow-x:auto">
      ${AIS.scoring ? `<table class="tbl" style="min-width:720px"><thead><tr><th>Round</th><th>Criterion</th><th>AI</th><th>Max</th><th>Override</th></tr></thead><tbody>${crit.map(c => `<tr><td>${c.round}</td><td>${esc(c.groupLabel)} · ${esc(c.label)}</td><td class="num">${c.a ? c.a.score : "—"}</td><td class="num">${c.max}</td><td><input class="inp" style="width:80px" type="number" min="0" max="${c.max}" data-fac="${c.id}" value="${r.fac[c.id] != null ? r.fac[c.id] : ""}"></td></tr>`).join("")}</tbody></table>` : `<p class="small muted">Scoring structure unavailable: the SCORE server could not be reached.</p>`}
    </div></div>
    <div class="card"><div class="card-h"><h3>Employee Pulse history</h3></div><div class="card-b">${pulseHistory(r, true)}</div></div>
    <div class="card pad row between"><div><b class="small">SCORE feedback report</b><div class="xs muted">Scores, evidence and feedback by round. Participants see it after the final appraisal.</div></div><button class="btn" data-act="go" data-go="review">Open report</button></div>
    <div class="card pad row between"><div><b class="small">Reset this device</b><div class="xs muted">Deletes this session's saved progress.</div></div><button class="btn danger" data-act="modal" data-m="reset">${icon("reset", "i-sm")} Reset session</button></div>
  </div>`;
};
MODALS.reset = function () {
  return modalWrap("Reset this session?", `<p class="small t2">All plans, conversations, evidence, appraisals, scores and Pulse history saved on this device will be deleted. This cannot be undone.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" style="background:var(--risk);border-color:var(--risk)" data-act="doReset">Delete and reset</button>`);
};
MODALS.newSession = function () {
  return modalWrap("Start a new session?", `<p class="small t2">This device already has a saved session for <b>${esc(S.session.name)}</b>. Starting a new session replaces it. To keep working on it, choose Resume instead.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="signinConfirm">Start new session</button>`);
};
