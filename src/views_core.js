/* =========================================================
   LOGIN · DASHBOARD · HR INBOX · FACILITATOR
   ========================================================= */
VIEWS.login = function () {
  const saved = S.session, L = legacyData();
  const feats = [["target", "Goal plans & KPIs"], ["layers", "Competency expectations"], ["log", "Evidence Log"], ["chat", "Employee conversations"], ["clipboard", "Year-end appraisal"], ["shield", "Fair, evidence-based reviews"]];
  return `<div class="login">
    <section class="login-brand">
      <img class="logo" src="${IMG.logo}" alt="NextWave Digital">
      <div class="stack" style="gap:16px">
        <div class="eyebrow" style="color:#5ED3E2">Performance &amp; Goals</div>
        <h1>NextWave | SCORE<br>Performance Hub</h1>
        <p>Set expectations, track evidence, hold the right conversations and complete a fair year-end appraisal for your team.</p>
        <div class="login-feats">${feats.map(([i, t]) => `<div>${icon(i, "i-sm")}${t}</div>`).join("")}</div>
      </div>
      <img class="score" src="${IMG.scoreTop}" alt="SCORE">
    </section>
    <section class="login-form"><div class="login-card">
      <div><h2>Manager sign in</h2><p class="small muted" style="margin-top:4px">Performance cycle ${APP.cycleLabel}</p></div>
      ${saved ? `<div class="resume stack" style="gap:10px">
        <div class="row nowrap" style="gap:12px">${S.emp ? avatar(S.emp) : `<span class="initials" style="background:var(--navy)">${esc(initials(saved.name))}</span>`}<div class="grow"><b>Resume saved session</b><div class="xs muted">${esc(saved.name)}${S.emp ? ` · managing ${esc(EMPLOYEES[S.emp].name)}` : ""}${S.saved ? ` · saved ${new Date(S.saved).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : ""}</div></div></div>
        <button class="btn primary" data-act="resume" id="resume-btn">Resume session ${icon("arrow", "i-sm")}</button>
      </div>
      <div class="row" style="gap:8px"><span style="flex:1;height:1px;background:var(--line)"></span><span class="xs muted">or start a new session</span><span style="flex:1;height:1px;background:var(--line)"></span></div>` : ""}
      <form class="stack" data-form="login" autocomplete="off" onsubmit="return false">
        <div class="field"><label for="login-name">Manager name</label><input class="inp" id="login-name" placeholder="Your name or table name" maxlength="60" autocomplete="off"></div>
        <div class="field"><label for="login-pass">Password</label><input class="inp masked" id="login-pass" type="text" placeholder="Not required in training mode" autocomplete="off" data-lpignore="true" spellcheck="false"><span class="hint">Training environment: no real credentials are needed and nothing typed here is stored or sent.</span></div>
        ${L && L.emp ? `<label class="row nowrap small" style="gap:8px;align-items:flex-start"><input type="checkbox" id="login-legacy" checked style="margin-top:3px"><span>Bring in the goals saved on this device by the previous SCORE version (${esc(EMPLOYEES[L.emp].name)}, ${plural(L.objectives.length, "objective", "objectives")}). The previous data stays untouched.</span></label>` : ""}
        <button class="btn primary" data-act="signin" id="signin-btn" type="submit">Sign In</button>
      </form>
      <p class="xs muted">NextWave Digital is a fictional company used for training. Your progress is saved in this browser only.</p>
    </div></section>
  </div>`;
};

VIEWS.home = function () {
  const name = S.session.name;
  if (!S.emp) return pageHead("Home", `Welcome, ${esc(name)}`, "", `Performance cycle ${APP.cycleLabel}`) + `
    <div class="stack-lg">
      <div class="notice">${icon("info", "i-sm")}<span>Select the team member your table is managing. Your facilitator will tell you which one. You can switch later from <b>My team</b>; each employee keeps their own records.</span></div>
      <div class="grid4">${EMP_ORDER.map(e => { const E = EMPLOYEES[e]; return `<button class="tile" data-act="pick" data-emp="${e}" style="align-items:flex-start">${avatar(e, "xl")}<div><h3>${esc(E.name)}</h3><div class="small muted">${esc(E.title)}</div></div><div class="meta"><span class="xs muted">${esc(E.tenure)}</span><span class="btn sm primary">Select</span></div></button>`; }).join("")}</div>
      ${inboxPreview()}
    </div>`;
  const r = rec(), E = EMP(), acts = pendingActions();
  const ms = midyearStatus(r), as = appraisalStatus(r);
  const convSt = conversationsStatus(r);
  const tiles = [
    { go: "goals", icon: "target", t: "Performance Goals", d: `${plural(r.goals.objectives.length, "objective", "objectives")} · ${plural(r.goals.comps.length, "competency", "competencies")}`, st: r.goals.status, round: "SCORE Round 1" },
    { go: "evidence", icon: "log", t: "Evidence Log", d: goalsApproved(r) ? plural(r.evidence.length, "entry", "entries") : "Opens when the contract is approved", st: evidenceStatus(r) },
    { go: "conversations", icon: "chat", t: "Employee Conversations", d: ms === "locked" ? (r.goals.status === "pending_alignment" ? "Contract alignment waiting" : "Contract alignment · mid-year check-in") : `Mid-year check-in: ${STATUS_LABEL[ms]}`, st: convSt },
    { go: "appraisal", icon: "clipboard", t: "Final Appraisal", d: as === "locked" ? "Opens at year-end" : "WHAT · HOW · Overall", st: as, round: "SCORE Round 2" }
  ];
  return pageHead("Home", `Welcome, ${esc(name)}`, `<button class="btn" data-act="go" data-go="inbox">${icon("mail", "i-sm")} HR Inbox</button>`, `Performance cycle ${APP.cycleLabel}`) + `
  <div class="stack-lg">
    <div class="card pad-lg"><div class="row between" style="gap:18px">
      <div class="emp-hero">${avatar(S.emp, "xl")}<div class="stack-sm" style="gap:3px"><div class="eyebrow">Your direct report</div><h2>${esc(E.name)}</h2><div class="t2">${esc(E.title)} · Commercial</div><div class="xs muted">${esc(E.tenure)} · Reports to ${esc(E.role.reportsToRole)}</div></div></div>
      <div class="stack-sm" style="min-width:220px"><div class="xs muted">Previous year rating</div><div class="b">${esc(E.prevRating)}</div><button class="btn sm" data-act="modal" data-m="profile">${icon("user", "i-sm")} View employee profile</button></div>
    </div></div>
    <div class="grid4">${tiles.map(t => `<button class="tile ${t.st === "locked" ? "locked" : ""}" data-act="go" data-go="${t.go}"><div class="row between"><span class="ti">${icon(t.icon)}</span>${t.round ? `<span class="round-tag">${t.round}</span>` : ""}</div><div><h3>${t.t}</h3><div class="small muted">${esc(t.d)}</div></div><div class="meta">${statusChip(t.st)}${icon("chev", "i-sm")}</div></button>`).join("")}</div>
    <div class="grid2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Pending actions</h3><span class="tag">${acts.length}</span></div>${acts.length ? acts.map(a => `<button class="action-row" data-act="go" data-go="${a.go}"><span class="dot ${a.urgent ? "risk" : ""}"></span><span class="grow"><b class="small">${esc(a.t)}</b><div class="xs muted">${esc(a.d)}</div></span>${icon("chev", "i-sm")}</button>`).join("") : `<div class="card-b small muted">No pending actions. ${roundTwoDone(r) ? "The performance cycle is complete." : "Wait for the next instruction from your facilitator."}</div>`}</div>
      ${inboxPreview()}
    </div>
    ${S.session.legacyImported ? `<div class="notice good">${icon("check", "i-sm")}<span>Goals from the previous SCORE version were brought into this session as a draft. The previous version's data on this device was not changed.</span></div>` : ""}
  </div>`;
};
function inboxPreview() {
  const ms = mailList().slice(0, 4);
  return `<div class="card"><div class="card-h"><h3>HR Inbox</h3><button class="btn ghost sm" data-act="go" data-go="inbox">Open inbox</button></div>${ms.map(m => `<button class="action-row" data-act="go" data-go="inbox/${m.id}"><span class="dot ${m.unread ? "" : "muted"}"></span><span class="grow"><b class="small" style="${m.unread ? "" : "font-weight:550"}">${esc(m.subject)}</b><div class="xs muted">${HR_SENDER.name} · ${m.date}</div></span>${icon("chev", "i-sm")}</button>`).join("")}</div>`;
}
MODALS.profile = function () {
  const E = EMP();
  return modalWrap("Employee profile", `
    <div class="row nowrap" style="gap:14px">${avatar(S.emp, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)} · ${esc(E.tenure)}</div></div></div>
    <dl class="kv"><dt>Reports to</dt><dd>${esc(E.role.reportsTo)}</dd><dt>Previous rating</dt><dd>${esc(E.prevRating)}</dd></dl>
    <div class="stack-sm"><h4>Role purpose</h4><p class="small t2">${esc(E.role.purpose)}</p></div>
    <div class="stack-sm"><h4>Key responsibilities</h4><ul class="list-plain small t2">${E.role.responsibilities.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="stack-sm"><h4>Previous-year performance</h4><p class="small t2">${esc(E.prevPerformance)}</p></div>
    <div class="stack-sm"><h4>Strengths</h4><div class="row" style="gap:6px">${E.strengths.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div></div>
    <p class="xs muted">The full job description and the employee's story are in your printed materials.</p>`, `<button class="btn" data-act="closeModal">Close</button>`, true);
};

VIEWS.inbox = function () {
  const ms = mailList(), cur = ms.find(m => m.id === UI.sub) || ms[0];
  if (cur && cur.unread) { markRead(cur.id); cur.unread = false; }
  return pageHead("Home / HR Inbox", "HR Inbox", empChip()) + `<div class="card split">
    <div class="list">${ms.map(m => `<button class="msg-item ${m === cur ? "on" : ""} ${m.unread ? "unread" : ""}" data-act="go" data-go="inbox/${m.id}"><span class="hr-av">HR</span><span class="stack-sm grow" style="gap:1px"><span class="row between nowrap"><span class="xs muted">${HR_SENDER.name}</span><span class="xs muted">${m.date.replace(/^\w+ /, "")}</span></span><span class="subj">${esc(m.subject)}</span></span></button>`).join("")}</div>
    <div>${cur ? mailView(cur) : `<div class="empty">No messages.</div>`}</div>
  </div>`;
};
function mailView(m) {
  const body = m.body.map(p => p === "__LIST__" ? `<ul>${m.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(p)}</p>`).join("");
  const needEmpAct = m.action && !S.emp;
  return `<article class="mail">
    <h2>${esc(m.subject)}</h2>
    <div class="mail-meta"><span class="hr-av">HR</span><div class="grow"><b class="small">${HR_SENDER.name}</b> <span class="xs muted">&lt;${HR_SENDER.addr}&gt;</span><div class="xs muted">To: ${esc(S.session.name)} · ${m.date}</div></div></div>
    <div class="mail-body">${body}</div>
    ${m.action ? `<div>${needEmpAct ? `<div class="notice" style="margin-bottom:10px">${icon("info", "i-sm")}<span>Select the team member you are managing first.</span></div>` : ""}<button class="btn primary" data-act="go" data-go="${needEmpAct ? "home" : m.action.go}">${esc(needEmpAct ? "Select team member" : m.action.l)} ${icon("arrow", "i-sm")}</button></div>` : ""}
    <p class="xs muted">Simulated date. Deadlines in this training environment never block your progress.</p>
  </article>`;
}

/* ---------- Facilitator view ---------- */
VIEWS.facilitator = function () {
  if (!UI.facOK) return pageHead("Facilitator", "Facilitator view") + `<div class="card pad-lg stack" style="max-width:440px">
    <p class="small t2">Enter the facilitator code to manage stage transitions and validate SCORE criteria.</p>
    <div class="field"><label for="fac-code">Facilitator code</label><input class="inp" id="fac-code" inputmode="numeric" autocomplete="off" maxlength="8"></div>
    ${UI.codeErr === "fac" ? `<div class="err-text">That code is not correct.</div>` : ""}
    <div><button class="btn primary" data-act="facUnlock">Open facilitator view</button></div></div>`;
  const r = rec();
  const r1 = S.emp ? roundResult(1) : null, r2 = S.emp ? roundResult(2) : null, sc = S.emp ? appScore() : null;
  const pendingCount = EMP_ORDER.reduce((a, e) => a + Object.values(EMP_CONTENT[e]).filter(x => x.status !== "approved").length, 0);
  return pageHead("Facilitator", "Facilitator view", empChip(), "Stage control, SCORE round structure and validation. Codes are a local gate on this device.") + `<div class="stack-lg">
    <div class="grid2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Simulation structure</h3></div><div class="card-b stack">
        ${[["SCORE Round 1 · Setting Performance Expectations", "Goal plan, competencies and employee alignment", S.emp ? r.goals.status : "not_started"],
           ["Monitoring (not scored)", "Evidence Log, mid-year check-in, offline intervention", S.emp ? midyearStatus(r) : "locked"],
           ["SCORE Round 2 · Final Performance Appraisal", "Appraisal and post-appraisal reflection", S.emp ? appraisalStatus(r) : "locked"]].map(([t, d, st]) => `<div class="row between nowrap"><div><b class="small">${t}</b><div class="xs muted">${d}</div></div>${statusChip(st)}</div>`).join("")}
      </div></div>
      <div class="card"><div class="card-h"><h3>Stage transitions</h3><span class="xs muted">Apply to this device</span></div><div class="card-b stack">
        <div class="row between nowrap"><div><b class="small">Mid-Year Check-In</b><div class="xs muted">Release after revealing the business event offline.</div></div><button class="btn sm ${S.released.midyear ? "" : "primary"}" data-act="release" data-k="midyear">${S.released.midyear ? "Released · undo" : "Release"}</button></div>
        <div class="row between nowrap"><div><b class="small">Year-End Appraisal</b><div class="xs muted">Release after the offline intervention and year-end evidence.</div></div><button class="btn sm ${S.released.yearend ? "" : "primary"}" data-act="release" data-k="yearend">${S.released.yearend ? "Released · undo" : "Release"}</button></div>
        <p class="xs muted">Release codes for participants: mid-year ${RELEASE_CODES.midyear} · year-end ${RELEASE_CODES.yearend}.</p>
      </div></div>
    </div>
    ${S.emp ? `<div class="card"><div class="card-h"><h3>SCORE results · ${esc(EMP().name)}</h3><span class="b num">${sc.total}/100${sc.provisional ? ` <span class="xs muted">provisional</span>` : ""}</span></div><div class="card-b stack">
      <p class="small t2">Validate (override) any criterion. Leave “—” to keep the group's self-assessment.</p>
      ${[[1, r1], [2, r2]].map(([n, rr]) => `<div class="stack-sm"><h4>Round ${n} ${rr ? `· ${rr.total}/10` : ""}</h4>${rr ? rr.rows.map(x => `<div class="row between nowrap" style="border-top:1px solid var(--line);padding-top:8px"><div class="grow"><b class="small">${x.c.n}</b> <span class="src src-${x.src}">${SRC_LABEL[x.src]}${x.s != null ? ` · ${x.s}` : ""}</span><div class="xs muted">Automated limit ${x.cap} · group level ${x.sa.lvl != null ? x.sa.lvl : "—"}</div></div><div class="seg">${["—", 0, 1, 2].map(v => `<button class="${(v === "—" ? x.fac == null : x.fac === v) ? "on" : ""}" data-act="facSet" data-k="${x.c.k}" data-v="${v}">${v}</button>`).join("")}</div></div>`).join("") : `<div class="xs muted">Not available until the round is completed.</div>`}</div>`).join("")}
      <div class="row between"><span class="small t2">Game indicator (star rating): <b>★ ${starRating().toFixed(2)}</b></span><span class="xs muted">Facilitator-only gamification feature.</span></div>
    </div></div>` : ""}
    <div class="card"><div class="card-h"><h3>Employee content status</h3><span class="tag">${pendingCount} items not yet approved</span></div><div class="card-b" style="overflow-x:auto">
      <table class="tbl" style="min-width:720px"><thead><tr><th>Content</th>${EMP_ORDER.map(e => `<th>${esc(EMPLOYEES[e].first)}</th>`).join("")}<th>Channel</th></tr></thead><tbody>
      ${Object.keys(EMP_CONTENT.omar).map(k => `<tr><td>${esc(EMP_CONTENT.omar[k].label)}</td>${EMP_ORDER.map(e => { const st = EMP_CONTENT[e][k].status; return `<td><span class="chip ${st === "approved" ? "st-approved" : st === "provisional" ? "st-draft" : "st-not_started"}">${st === "approved" ? "Approved" : st === "provisional" ? "Provisional" : "Pending"}</span></td>`; }).join("")}<td class="xs muted">${EMP_CONTENT.omar[k].channel}</td></tr>`).join("")}
      </tbody></table></div></div>
    <div class="card pad row between"><div><b class="small">Reset this device</b><div class="xs muted">Deletes this session's saved progress. The classic version's data is not touched.</div></div><button class="btn danger" data-act="modal" data-m="reset">${icon("reset", "i-sm")} Reset session</button></div>
  </div>`;
};
MODALS.reset = function () {
  return modalWrap("Reset this session?", `<p class="small t2">All goal plans, evidence, conversations and appraisals saved on this device for this session will be deleted. This cannot be undone.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" style="background:var(--risk);border-color:var(--risk)" data-act="doReset">Delete and reset</button>`);
};
MODALS.newSession = function () {
  return modalWrap("Start a new session?", `<p class="small t2">This device already has a saved session for <b>${esc(S.session.name)}</b>. Starting a new session replaces it. To keep working on it, choose Resume instead.</p>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="signinConfirm">Start new session</button>`);
};
