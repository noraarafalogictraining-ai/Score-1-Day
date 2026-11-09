/* =========================================================
   EMPLOYEE CONVERSATIONS — open-text conversations with Omar
   Round 1 alignment · Round 2 diagnostic & coaching · Round 3 appraisal
   ========================================================= */
function threads(r = rec()) {
  return [
    { id: "alignment", t: "Performance plan alignment", round: 1, d: r.goals.status === "pending_alignment" ? (r.align.ready ? "Omar is ready to confirm" : "Your reply is needed") : r.align.confirmed ? "Contract confirmed" : "Starts when you submit the goal plan", st: r.goals.status === "pending_alignment" ? "action" : r.align.confirmed ? "completed" : "locked" },
    { id: "midyear", t: "Omar: “Do you have a few minutes?”", round: 2, d: r2Status(r) === "locked" ? "Not yet" : r.r2.diag.ended ? "Conversation ended" : "Chat request", st: r2Status(r) === "locked" ? "locked" : r.r2.diag.ended ? "completed" : "action" },
    { id: "appraisal", t: "Year-end appraisal conversation", round: 3, d: r.r3.appraisal.status === "submitted" || r.r3.done ? (r.r3.conv.ended ? "Conversation ended" : "Omar responded") : "After you submit the appraisal", st: r.r3.conv.ended ? "completed" : r.r3.appraisal.status === "submitted" ? "action" : "locked" }
  ];
}
VIEWS.conversations = function () {
  const r = rec(), ts = threads(r), cur = ts.find(t => t.id === UI.sub) || ts.find(t => t.st === "action") || ts[0];
  if (cur.id === "midyear") ensureDiagnosticOpening(r);
  return pageHead(`Employee Conversations / ${esc(EMP().name)}`, "Employee Conversations", empChip()) + `<div class="card split">
    <div class="list">${ts.map(t => `<button class="msg-item ${t === cur ? "on" : ""}" data-act="go" data-go="conversations/${t.id}">${avatar(S.emp, "sm")}<span class="stack-sm grow" style="gap:2px"><span class="xs muted">${PERIOD[t.round]} 2027</span><span class="subj">${t.t}</span><span class="xs muted">${t.d}</span></span>${statusChip(t.st)}</button>`).join("")}</div>
    <div>${cur.id === "alignment" ? alignmentThread(r) : cur.id === "midyear" ? diagnosticThread(r) : appraisalThread(r)}</div>
  </div>`;
};
function ensureDiagnosticOpening(r) {
  if (r2Status(r) === "locked" || r.r2.diag.log.length || !AIS.openings) return;
  r.r2.diag.log.push({ from: "sys", text: `Chat request from Omar Hassan · ${SIM_DATES.midyear}` }, { from: "employee", text: AIS.openings.diagnostic });
  save();
}
function bubbles(log) {
  return log.map(m => m.from === "sys" ? `<div class="bubble sys">${esc(m.text)}</div>` :
    `<div class="bubble-row ${m.from === "manager" ? "me" : ""}">${m.from === "manager" ? `<span class="initials" style="background:var(--navy);width:28px;height:28px;font-size:.7rem">${esc(initials(S.session.name))}</span>` : avatar(S.emp, "sm")}<div class="bubble"><div class="who">${m.from === "manager" ? "You" : "Omar"}</div>${esc(m.text).replace(/\n/g, "<br>")}</div></div>`).join("");
}
function chatPanel(kind, opts) {
  const busy = UI.busy === kind, err = UI.chatErr && UI.chatErr.kind === kind ? UI.chatErr : null;
  const draftPath = P("drafts", kind), draft = val(draftPath);
  const composer = opts.closed ? "" : !aiReady()
    ? `<div class="notice risk">${icon("alert", "i-sm")}<span>Live AI conversations are unavailable${AIS.provider === "offline" ? ": the SCORE server could not be reached" : ": no AI provider is configured on the server"}. Your facilitator can continue the session manually.</span></div>`
    : `<div class="composer"><label class="sr" for="${draftPath}">Your message to Omar</label><textarea class="ta" id="${draftPath}" ${bind(draftPath)} rows="3" maxlength="${CHAT_LIMITS.message}" placeholder="Write your message to Omar…" ${busy ? "disabled" : ""}>${esc(draft)}</textarea>
        <div class="row between"><span class="xs muted">${busy ? "Omar is typing…" : "Write in your own words. Ctrl+Enter to send."}</span><span class="row">${opts.extra || ""}<button class="btn primary" data-act="chatSend" data-k="${kind}" id="send-${kind}" ${busy ? "disabled" : ""}>${icon("send", "i-sm")} Send</button></span></div></div>`;
  return `<div class="chat">
    <div class="chat-head">${avatar(S.emp)}<div class="grow"><b>Omar Hassan</b><div class="xs muted">${opts.title}</div></div>${opts.headRight || ""}</div>
    <div class="chat-log" id="chat-log" aria-live="polite">${bubbles(opts.log)}${busy ? `<div class="bubble-row">${avatar(S.emp, "sm")}<div class="bubble typing"><span></span><span></span><span></span></div></div>` : ""}</div>
    <div class="chat-foot">${err ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(err.message)}</span>${err.retry ? `<button class="btn sm" data-act="chatRetry" data-k="${kind}">Retry</button>` : ""}</div>` : ""}${opts.top || ""}${composer}${opts.bottom || ""}</div>
  </div>`;
}
function alignmentThread(r) {
  if (!r.align.log.length) return `<div class="empty">${icon("chat")}<b>No conversation yet</b><span class="small">Omar will reply when you submit the goal plan for alignment.</span>${goalsEditable(r) ? `<button class="btn primary" data-act="go" data-go="goals/submit">Open Review &amp; Submit</button>` : ""}</div>`;
  const pending = r.goals.status === "pending_alignment";
  return chatPanel("alignment", {
    title: "Performance plan alignment · January 2027", log: r.align.log, closed: !pending,
    top: pending && r.align.ready ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Omar is ready to confirm the plan.</span><button class="btn primary sm" data-act="alignConfirm" id="align-confirm" ${UI.busy ? "disabled" : ""}>Confirm alignment</button></div>` : "",
    extra: pending ? `<button class="btn sm" data-act="reopenPlan">Edit the plan</button>` : "",
    bottom: !pending ? `<div class="small t2">${icon("check", "i-sm")} Performance contract confirmed${r.align.manual ? " by the facilitator" : ""}.</div>` : ""
  });
}
function diagnosticThread(r) {
  if (r2Status(r) === "locked") return `<div class="empty">${icon("lock")}<b>Not yet</b><span class="small">Nothing here yet.</span></div>`;
  const n = r.r2.diag.log.filter(m => m.from === "manager").length;
  return chatPanel("diagnostic", {
    title: `Mid-year conversation · ${SIM_DATES.midyear}`, log: r.r2.diag.log, closed: r.r2.diag.ended,
    headRight: `<span class="row nowrap" style="gap:6px"><button class="btn ghost sm" data-act="go" data-go="business">${icon("bars", "i-sm")} Dashboard</button><button class="btn ghost sm" data-act="go" data-go="inbox">${icon("mail", "i-sm")} Inbox</button></span>`,
    extra: `<button class="btn sm" data-act="modal" data-m="endChat" data-k="diagnostic" ${n < CHAT_LIMITS.diagnosticMin ? `disabled title="Exchange at least ${CHAT_LIMITS.diagnosticMin} messages first"` : ""}>End conversation</button>`,
    bottom: r.r2.diag.ended ? `<div class="row between"><span class="small t2">${icon("check", "i-sm")} Conversation ended. Record what you learned in the Evidence Log.</span><button class="btn sm primary" data-act="go" data-go="round2">Mid-year review</button></div>` : ""
  });
}
function appraisalThread(r) {
  if (r.r3.appraisal.status !== "submitted" && !r.r3.done) return `<div class="empty">${icon("chat")}<b>No conversation yet</b><span class="small">Omar will respond after you submit the year-end appraisal.</span></div>`;
  const n = r.r3.conv.log.filter(m => m.from === "manager").length;
  return chatPanel("appraisal", {
    title: `Year-end appraisal · ${SIM_DATES.yearend}`, log: r.r3.conv.log, closed: r.r3.conv.ended,
    headRight: `<button class="btn ghost sm" data-act="drawerAppraisal">${icon("clipboard", "i-sm")} Your appraisal</button>`,
    top: !r.r3.conv.log.some(m => m.from === "employee") && !UI.busy && aiReady() && !r.r3.conv.ended ? `<div class="row between"><span class="small t2">Omar has not replied yet.</span><button class="btn sm primary" data-act="appraisalOpen">Fetch Omar's response</button></div>` : "",
    extra: `<button class="btn sm" data-act="modal" data-m="endChat" data-k="appraisal" ${n < CHAT_LIMITS.appraisalMin ? "disabled" : ""}>End conversation</button>`,
    bottom: r.r3.conv.ended ? `<div class="row between"><span class="small t2">${icon("check", "i-sm")} Conversation ended.</span><button class="btn sm primary" data-act="go" data-go="reflection">Bias reflection</button></div>` : ""
  });
}
MODALS.endChat = function (m) {
  const diag = m.k === "diagnostic";
  return modalWrap("End the conversation?", `<p class="small t2">${diag ? "Once you end the conversation with Omar you cannot add more messages. Make sure you have agreed what happens next." : "Once you end the appraisal conversation, you will move on to the bias reflection."}</p>`, `<button class="btn" data-act="closeModal">Keep talking</button><button class="btn primary" data-act="chatEnd" data-k="${m.k}" id="confirm-end">End conversation</button>`);
};
DRAWERS.appraisal = function () {
  const a = appraisalPayload();
  return `<div class="drawer-scrim" data-act="closeDrawer"></div><aside class="drawer" role="dialog" aria-label="Your appraisal"><div class="drawer-h"><h3>Your appraisal</h3><button class="icon-btn" data-act="closeDrawer" aria-label="Close">${icon("x")}</button></div><div class="drawer-b">
    ${a.what.map((x, i) => `<div class="ev-card"><b class="small">Objective ${i + 1}: ${esc(x.objective)}</b><span class="xs">${esc(ratingLabel(x.rating))}</span><span class="xs t2">${esc(x.just)}</span></div>`).join("")}
    ${a.how.map(x => `<div class="ev-card"><b class="small">${esc(x.name)} (expected ${esc(x.level)})</b><span class="xs">${esc(ratingLabel(x.rating))}</span><span class="xs t2">${esc(x.just)}</span></div>`).join("")}
    <div class="ev-card"><b class="small">Overall: ${esc(ratingLabel(a.overall.final))}</b><span class="xs">WHAT ${a.overall.what || "–"} · HOW ${a.overall.how || "–"}</span><span class="xs t2">${esc(a.overall.just)}</span></div>
  </div></aside>`;
};
