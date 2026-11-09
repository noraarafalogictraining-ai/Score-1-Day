/* =========================================================
   OMAR CHAT — one continuous workplace chat thread
   Visible: a single conversation with date dividers.
   Internal: messages belong to the alignment, diagnostic or appraisal context
   (see chatThread / activeChatContext in state.js); each context is sent to the
   AI and assessed separately.
   ========================================================= */
const CHAT_PAGES = ["inbox", "home", "goals", "evidence", "appraisal", "business", "round2", "reflection", "yearend", "profile"];
function chatBubbleVisible(r = rec()) {
  if (!S.session || !UI.signedIn || UI.chatOpen) return false;
  return UI.route === "inbox" || chatUnread(r) > 0 || (activeChatContext(r) && CHAT_PAGES.includes(UI.route));
}
function chatBubble() {
  const r = rec(), n = chatUnread(r);
  if (!chatBubbleVisible(r)) return "";
  return `<button class="chat-bubble ${n ? "has-unread" : ""}" data-act="openChat" id="chat-bubble" aria-label="Chat with Omar Hassan${n ? `, ${n} unread` : ""}">${avatar(S.emp)}${n ? `<span class="cb-badge" aria-hidden="true">${n}</span>` : ""}</button>`;
}
function chatBubbles(thread) {
  let lastCtx = null;
  return thread.map(m => {
    const sep = m.ctx !== lastCtx ? `<div class="chat-sep"><span>${CHAT.dates[m.ctx]}</span></div>` : ""; lastCtx = m.ctx;
    const me = m.from === "manager";
    return sep + `<div class="bubble-row ${me ? "me" : ""}">${me ? "" : avatar(S.emp, "sm")}<div class="bubble">${esc(m.text).replace(/\n/g, "<br>")}${m.at ? `<span class="b-time">${esc(m.at.split(" · ")[1] || "")}</span>` : ""}</div></div>`;
  }).join("");
}
function chatPanel() {
  if (!UI.chatOpen || !S.session || !UI.signedIn) return "";
  const r = rec(), ctx = activeChatContext(r), busy = !!UI.busy && ["alignment", "diagnostic", "appraisal"].includes(UI.busy), err = UI.chatErr;
  const draftPath = P("drafts", "chat"), draft = val(draftPath);
  let foot;
  if (!ctx) foot = `<div class="chat-off">${icon("clock", "i-sm")} Omar is away right now.</div>`;
  else if (!aiReady()) foot = `<div class="notice risk">${icon("alert", "i-sm")}<span>Chat is unavailable${AIS.provider === "offline" ? ": the server could not be reached" : ": no AI provider is configured on the server"}.</span></div>`;
  else foot = `<div class="composer"><label class="sr" for="${draftPath}">Message Omar</label><textarea class="ta" id="${draftPath}" ${bind(draftPath)} rows="2" maxlength="${CHAT_LIMITS.message}" placeholder="Message Omar…" ${busy ? "disabled" : ""}>${esc(draft)}</textarea><button class="btn primary send-btn" data-act="chatSend" id="send-chat" aria-label="Send" ${busy ? "disabled" : ""}>${icon("send", "i-sm")}</button></div>`;
  return `<section class="chat-win" role="dialog" aria-label="Chat with Omar Hassan">
    <div class="chat-head">${avatar(S.emp)}<div class="grow"><b>Omar Hassan</b><div class="xs muted">Market Intelligence Analyst</div></div><button class="icon-btn" data-act="closeChat" aria-label="Close chat">${icon("x")}</button></div>
    <div class="chat-log" id="chat-log" aria-live="polite">${chatBubbles(chatThread(r))}${busy ? `<div class="bubble-row">${avatar(S.emp, "sm")}<div class="bubble typing" aria-label="Omar is typing"><span></span><span></span><span></span></div></div>` : ""}</div>
    <div class="chat-foot">
      ${err ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(err.message)}</span>${err.retry ? `<button class="btn sm" data-act="chatRetry" data-k="${err.kind}">Retry</button>` : ""}</div>` : ""}
      ${r.goals.status === "pending_alignment" && r.align.ready ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Omar is ready to go ahead with the plan.</span><button class="btn primary sm" data-act="alignConfirm" id="align-confirm">Confirm alignment</button></div>` : ""}
      ${foot}
    </div>
  </section>`;
}
/* The former conversations page now opens the chat over the inbox (no dead route). */
VIEWS.conversations = function () { setTimeout(() => { UI.chatOpen = true; go("inbox"); }, 0); return ""; };
