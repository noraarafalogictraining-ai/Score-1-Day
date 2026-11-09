/* =========================================================
   LOGIN · HOME · INBOX · PROFILE · FACILITATOR
   ========================================================= */
VIEWS.login = function () {
  const saved = S.session;
  const feats = [["target", "Goal plans & KPIs"], ["layers", "Competency expectations"], ["chat", "Live employee conversations"], ["bars", "Business dashboard"], ["clipboard", "Year-end appraisal"], ["pulse", "Employee Pulse"]];
  return `<div class="login">
    <section class="login-brand">
      <img class="logo" src="${IMG.logo}" alt="NextWave">
      <div class="stack" style="gap:16px">
        <div class="eyebrow" style="color:#5ED3E2">Performance &amp; Goals · Pilot</div>
        <h1>NextWave | SCORE<br>Performance Hub</h1>
        <p>You are NextWave's Commercial Director. Manage Omar Hassan's performance across the year: set expectations, diagnose and coach, and complete a fair year-end evaluation.</p>
        <div class="login-feats">${feats.map(([i, t]) => `<div>${icon(i, "i-sm")}${t}</div>`).join("")}</div>
      </div>
      <img class="score" src="${IMG.scoreTop}" alt="SCORE">
    </section>
    <section class="login-form"><div class="login-card">
      <div><h2>Manager sign in</h2><p class="small muted" style="margin-top:4px">Performance cycle ${APP.cycleLabel}</p></div>
      ${saved ? `<div class="resume stack" style="gap:10px">
        <div class="row nowrap" style="gap:12px"><span class="initials" style="background:var(--navy)">${esc(initials(saved.name))}</span><div class="grow"><b>Resume saved session</b><div class="xs muted">${esc(saved.name)} · Round ${currentRound()}${S.saved ? ` · saved ${new Date(S.saved).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : ""}</div></div></div>
        <button class="btn primary" data-act="resume" id="resume-btn">Resume session ${icon("arrow", "i-sm")}</button>
      </div>
      <div class="row" style="gap:8px"><span style="flex:1;height:1px;background:var(--line)"></span><span class="xs muted">or start a new session</span><span style="flex:1;height:1px;background:var(--line)"></span></div>` : ""}
      <form class="stack" autocomplete="off" onsubmit="return false">
        <div class="field"><label for="login-name">Manager name</label><input class="inp" id="login-name" placeholder="Your name or table name" maxlength="60" autocomplete="off"></div>
        <div class="field"><label for="login-pass">Password</label><input class="inp masked" id="login-pass" type="text" placeholder="Not required in training mode" autocomplete="off" data-lpignore="true" spellcheck="false"><span class="hint">Training environment: no real credentials are needed and nothing typed here is stored or sent.</span></div>
        <button class="btn primary" data-act="signin" id="signin-btn" type="submit">Sign In</button>
      </form>
      <p class="xs muted">NextWave is a fictional company used for training. Your progress is saved in this browser. Conversation messages are sent to the SCORE server for AI processing.</p>
    </div></section>
  </div>`;
};

VIEWS.home = function () {
  const r = rec(), E = EMP(), acts = pendingActions();
  const tiles = [
    { go: "goals", icon: "target", t: "Performance Goals", d: `${plural(r.goals.objectives.length, "objective", "objectives")} · ${plural(r.goals.comps.length, "competency", "competencies")}`, st: r.goals.status },
    { go: "business", icon: "bars", t: "Business Dashboard", d: r2Status(r) === "locked" ? "Commercial indicators" : "Valtora impact · mid-year", st: r2Status(r) === "locked" ? "locked" : r.r2.seenDashboard ? "in_progress" : "action" },
    { go: "conversations", icon: "chat", t: "Employee Conversations", d: "Alignment · mid-year · appraisal", st: conversationsStatus(r) },
    { go: "appraisal", icon: "clipboard", t: "Final Appraisal", d: r3Status(r) === "locked" ? "Opens in December" : "WHAT · HOW · overall", st: appraisalStatus(r) }
  ];
  return pageHead("Home", `Welcome, ${esc(S.session.name)}`, `<button class="btn" data-act="go" data-go="inbox">${icon("mail", "i-sm")} Inbox</button>`, `Commercial Director · Performance cycle ${APP.cycleLabel}`) + `
  <div class="stack-lg">
    ${r2Status(r) !== "locked" && !r.r2.submitted ? `<button class="alert-bar" data-act="go" data-go="business">${icon("alert")}<span class="grow"><b>Business alert</b> · Commercial indicators have changed since Valtora's announcement. Review the latest performance information.</span>${icon("chev", "i-sm")}</button>` : ""}
    ${roundTracker()}
    <div class="grid2" style="align-items:start">
      <div class="card pad-lg"><div class="emp-hero">${avatar(S.emp, "xl")}<div class="stack-sm grow" style="gap:3px"><div class="eyebrow">Your direct report</div><h2>${esc(E.name)}</h2><div class="t2">${esc(E.title)} · Commercial</div><div class="xs muted">${esc(E.tenure)} · Previous year ${esc(E.prevRating)}</div><div><button class="btn sm" data-act="modal" data-m="profile" data-emp="${S.emp}">${icon("user", "i-sm")} Employee profile</button></div></div></div></div>
      <div class="card pad-lg stack" style="gap:10px"><div class="row between"><h3>Employee Pulse</h3><button class="btn ghost sm" data-act="modal" data-m="pulse">History</button></div>${pulseBars(r)}<p class="xs muted">Updated after meaningful decisions and completed conversations.</p></div>
    </div>
    <div class="grid4">${tiles.map(t => `<button class="tile ${t.st === "locked" ? "locked" : ""}" data-act="go" data-go="${t.go}"><span class="ti">${icon(t.icon)}</span><div><h3>${t.t}</h3><div class="small muted">${esc(t.d)}</div></div><div class="meta">${statusChip(t.st)}${icon("chev", "i-sm")}</div></button>`).join("")}</div>
    <div class="grid2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Pending actions</h3><span class="tag">${acts.length}</span></div>${acts.length ? acts.map(a => `<button class="action-row" data-act="go" data-go="${a.go}"><span class="dot ${a.urgent ? "risk" : ""}"></span><span class="grow"><b class="small">${esc(a.t)}</b><div class="xs muted">${esc(a.d)}</div></span>${icon("chev", "i-sm")}</button>`).join("") : `<div class="card-b small muted">No pending actions. ${r.r3.done ? "The performance year is complete." : "Wait for the next instruction from your facilitator."}</div>`}</div>
      ${inboxPreview()}
    </div>
  </div>`;
};
function inboxPreview() {
  const ms = mailList().slice(0, 5);
  return `<div class="card"><div class="card-h"><h3>Inbox</h3><button class="btn ghost sm" data-act="go" data-go="inbox">Open inbox</button></div>${ms.map(m => `<button class="action-row" data-act="go" data-go="inbox/${m.id}"><span class="dot ${m.unread ? "" : "muted"}"></span><span class="grow"><b class="small" style="${m.unread ? "" : "font-weight:550"}">${esc(m.subject)}</b><div class="xs muted">${esc(senderOf(m).name)} · ${m.date}</div></span>${icon("chev", "i-sm")}</button>`).join("")}</div>`;
}
MODALS.profile = function (m) {
  const e = m.emp || S.emp, E = EMPLOYEES[e], active = PILOT.active.includes(e);
  return modalWrap("Employee profile", `
    <div class="row nowrap" style="gap:14px">${avatar(e, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)} · ${esc(E.tenure)}</div></div></div>
    ${active ? `<dl class="kv"><dt>Reports to</dt><dd>${esc(E.role.reportsTo)}</dd><dt>Previous rating</dt><dd>${esc(E.prevRating)}</dd></dl>
    <div class="stack-sm"><h4>Role responsibilities</h4><ul class="list-plain small t2">${E.role.responsibilities.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="stack-sm"><h4>Strengths</h4><div class="row" style="gap:6px">${E.strengths.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div></div>
    <div class="stack-sm"><h4>Previous-year evidence</h4><ul class="list-plain small t2">${E.prevEvidence.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="stack-sm"><h4>Previous stakeholder feedback</h4>${E.prevFeedback.map(([w, t]) => `<div class="small"><b>${esc(w)}:</b> <span class="t2">“${esc(t)}”</span></div>`).join("")}</div>
    <p class="xs muted">The full profile and job description are in your printed handouts.</p>`
    : `<p class="small t2">${esc(E.name)} is part of your Commercial team. In this pilot, ${esc(E.name.split(" ")[0])} appears as a colleague and stakeholder; their own performance journey is not active yet.</p>`}`, `<button class="btn" data-act="closeModal">Close</button>`, true);
};

VIEWS.inbox = function () {
  const ms = mailList(), cur = ms.find(m => m.id === UI.sub) || ms[0];
  if (cur && cur.unread) { markRead(cur.id); cur.unread = false; }
  return pageHead("Home / Inbox", "Inbox") + `<div class="card split">
    <div class="list">${ms.map(m => `<button class="msg-item ${m === cur ? "on" : ""} ${m.unread ? "unread" : ""}" data-act="go" data-go="inbox/${m.id}">${senderAvatar(m, "sm")}<span class="stack-sm grow" style="gap:1px"><span class="row between nowrap"><span class="xs muted">${esc(senderOf(m).name)}</span><span class="xs muted">${m.date.replace(/^\w+ /, "")}</span></span><span class="subj">${esc(m.subject)}</span></span></button>`).join("")}</div>
    <div>${cur ? mailView(cur) : `<div class="empty">No messages.</div>`}</div>
  </div>`;
};
function mailView(m) {
  const s = senderOf(m);
  const body = m.body.map(p => p === "__LIST__" ? `<ul>${m.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(p)}</p>`).join("");
  return `<article class="mail">
    <h2>${esc(m.subject)}</h2>
    <div class="mail-meta">${senderAvatar(m)}<div class="grow"><b class="small">${esc(s.name)}</b> <span class="xs muted">${esc(s.title)}</span><div class="xs muted">To: ${esc(S.session.name)} (Commercial Director) · ${m.date}</div></div></div>
    ${m.secondhand ? `<div class="notice warn">${icon("info", "i-sm")}<span><b>Secondhand account.</b> Mariam is reporting what she observed and what Omar told her. It has not been verified.</span></div>` : ""}
    <div class="mail-body">${body}</div>
    ${m.action ? `<div><button class="btn primary" data-act="go" data-go="${m.action.go}">${esc(m.action.l)} ${icon("arrow", "i-sm")}</button></div>` : ""}
  </article>`;
}

/* ---------- Facilitator view ---------- */
VIEWS.facilitator = function () {
  if (!UI.facOK) return pageHead("Facilitator", "Facilitator view") + `<div class="card pad-lg stack" style="max-width:440px">
    <p class="small t2">Enter the facilitator code to manage rounds, see the scenario state and apply manual controls.</p>
    <div class="field"><label for="fac-code">Facilitator code</label><input class="inp" id="fac-code" inputmode="numeric" autocomplete="off" maxlength="8"></div>
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
    <div class="card"><div class="card-h"><h3>Employee Pulse history</h3></div><div class="card-b">${pulseHistory(r)}</div></div>
    <div class="card pad row between"><div><b class="small">Reset this device</b><div class="xs muted">Deletes this session's saved progress.</div></div><button class="btn danger" data-act="modal" data-m="reset">${icon("reset", "i-sm")} Reset session</button></div>
  </div>`;
};
MODALS.reset = function () {
  return modalWrap("Reset this session?", `<p class="small t2">All plans, conversations, evidence, appraisals, scores and Pulse history saved on this device will be deleted. This cannot be undone.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" style="background:var(--risk);border-color:var(--risk)" data-act="doReset">Delete and reset</button>`);
};
MODALS.newSession = function () {
  return modalWrap("Start a new session?", `<p class="small t2">This device already has a saved session for <b>${esc(S.session.name)}</b>. Starting a new session replaces it. To keep working on it, choose Resume instead.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="signinConfirm">Start new session</button>`);
};
