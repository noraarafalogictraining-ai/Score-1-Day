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
    ${commercialOverview(r, true)}
  </div>`;
};

/* ---------- My Profile (the participant) ---------- */
VIEWS.profile = function () {
  const n = S.session.name, D = DIRECTOR;
  const info = [["Employee name", n], ["Job title", D.title], ["Department", D.department], ["Company", D.company], ["Joining date", D.joined], ["Reporting line", D.reportsTo], ["Employment status", D.status], ["Work location", D.location], ["Direct reports", String(D.directReports)], ["Performance year", D.year]];
  return pageHead("My Profile", "My Profile") + `<div class="stack-lg">
    <div class="card pad-lg"><div class="emp-hero"><span class="initials xl">${esc(initials(n))}</span><div class="stack-sm grow" style="gap:3px"><h2>${esc(n)}</h2><div class="t2">${D.title} · ${D.department}</div><div class="xs muted">${D.company} · Joined ${D.joined}</div></div><span class="chip st-approved">${D.status}</span></div></div>
    <div class="grid2" style="align-items:start">
      <section class="card"><div class="card-h"><h3>Personal &amp; employment information</h3></div><div class="card-b"><dl class="kv">${info.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}<dt>Leave information</dt><dd class="muted">${esc(D.leave)}</dd></dl></div></section>
      <section class="card"><div class="card-h"><h3>My team</h3></div><div class="card-b">
        <div class="org"><div class="org-node top">${icon("building", "i-sm")}<span><b>Chief Executive Officer</b><span class="xs muted">CEO</span></span></div><div class="org-line"></div>
          <div class="org-node me"><span class="initials sm">${esc(initials(n))}</span><span><b>${esc(n)}</b><span class="xs muted">${D.title}</span></span></div><div class="org-line"></div>
          <div class="xs muted" style="text-align:center;margin-bottom:8px">Commercial Department</div>
          <div class="org-team">${D.team.map(e => `<button class="org-node" data-act="modal" data-m="profile" data-emp="${e}">${avatar(e, "sm")}<span><b>${esc(EMPLOYEES[e].name)}</b><span class="xs muted">${esc(EMPLOYEES[e].title)}</span></span></button>`).join("")}</div></div>
      </div></section>
    </div>
    <section class="card"><div class="card-h"><h3>My job description</h3><span class="xs muted">${D.title}</span></div><div class="card-b stack">
      <div class="stack-sm"><h4>Job purpose</h4><p class="small t2">${esc(D.purpose)}</p></div>
      <div class="stack-sm"><h4>Key responsibilities</h4><ol class="list-plain small t2">${D.responsibilities.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
    </div></section>
    <section class="card"><div class="card-h"><div><h3>My performance objectives ${APP.cycleYear}</h3><div class="xs muted">Set by the Chief Executive Officer · not editable</div></div><span class="tag">${CEO_OBJECTIVES.length} objectives</span></div><div class="card-b stack">
      <p class="small t2">These are your own objectives, assigned by the CEO. They set the strategic context for the objectives you agree with your team. They are separate from your employees' individual objectives.</p>
      ${CEO_OBJECTIVES.map((o, i) => `<div class="ceo-obj"><span class="goal-n">${i + 1}</span><div class="grow"><b>${esc(o.title)}</b><div class="small t2"><span class="muted">KPI:</span> ${esc(o.kpi)}</div></div><span class="tag blue">${esc(o.target)}</span></div>`).join("")}
    </div></section>
  </div>`;
};
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
  const body = m.body.map(p => p === "__LIST__" ? `<ul>${m.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(p)}</p>`).join("");
  const attach = m.attach ? `<div class="attach">${icon("clip", "i-sm")}<span class="grow"><b class="small">Year-End Performance Update — Omar Hassan.pdf</b><span class="xs muted">${r.r3.dataset ? "Performance evidence · December 2027" : r.r3.error ? esc(r.r3.error) : "Preparing…"}</span></span>${r.r3.dataset ? `<button class="btn sm" data-act="go" data-go="yearend">${icon("eye", "i-sm")} Open</button>` : r.r3.error ? `<button class="btn sm" data-act="loadYearEnd">Retry</button>` : ""}</div>` : "";
  return `<article class="mail">
    <h2>${esc(m.subject)}</h2>
    <div class="mail-meta">${senderAvatar(m)}<div class="grow"><b class="small">${esc(s.name)}</b> <span class="xs muted">${esc(s.title)}</span><div class="xs muted">To: ${esc(S.session.name)} (${DIRECTOR.title}) · ${m.date}</div></div></div>
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
      <div class="row between"><span class="small">Finalise the appraisal without AI assessment</span><button class="btn sm" data-act="facFinal" ${!r.r3.conv.ended || r.r3.done ? "disabled" : ""}>Finalise</button></div>
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
