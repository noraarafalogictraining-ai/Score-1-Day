/* =========================================================
   OMAR CHAT — one continuous workplace chat thread
   Visible: a single conversation with date dividers.
   Internal: messages belong to the alignment, diagnostic or appraisal context
   (see chatThread / activeChatContext in state.js); each context is sent to the
   AI and assessed separately.
   ========================================================= */
const CHAT_PAGES = ["inbox", "home", "employee", "history", "goals", "evidence", "business", "round2", "profile"];
function chatBubbleVisible(r = rec()) {
  if (!S.session || !UI.signedIn || UI.chatOpen || UI.route === "chat") return false;
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
/* Conversation body shared by the Chat page and the floating chat window */
function chatBody(r, closeBtn) {
  const ctx = activeChatContext(r), busy = !!UI.busy && ["alignment", "diagnostic"].includes(UI.busy), err = UI.chatErr;
  const draftPath = P("drafts", "chat"), draft = val(draftPath);
  let foot;
  if (!ctx) foot = r.r2.diag.completed ? `<div class="chat-off" id="chat-done">${icon("check", "i-sm")} Conversation completed. Next: the Final Appraisal in the Evidence Log.</div>` : `<div class="chat-off">${icon("clock", "i-sm")} Omar is away right now.</div>`;
  else if (!aiReady()) foot = `<div class="notice risk">${icon("alert", "i-sm")}<span>Chat is unavailable${AIS.provider === "offline" ? ": the server could not be reached" : ": no AI provider is configured on the server"}.</span></div>`;
  else foot = `<div class="composer"><label class="sr" for="${draftPath}">Message Omar</label><textarea class="ta" id="${draftPath}" ${bind(draftPath)} rows="2" maxlength="${CHAT_LIMITS.message}" placeholder="Message Omar…" ${busy ? "disabled" : ""}>${esc(draft)}</textarea><span class="composer-btns">${DICTATION.supported() ? `<button class="mic-btn ${DICTATION.on ? "on" : ""}" data-act="dictate" id="mic-btn" aria-pressed="${DICTATION.on}" aria-label="${DICTATION.on ? "Stop dictation" : "Speak instead of typing"}" title="${DICTATION.on ? "Listening… click to stop" : "Speak instead of typing"}" ${busy ? "disabled" : ""}>${icon(DICTATION.on ? "stop" : "mic", "i-sm")}</button>` : ""}<button class="btn primary send-btn" data-act="chatSend" id="send-chat" aria-label="Send" ${busy ? "disabled" : ""}>${icon("send", "i-sm")}</button></span></div>${DICTATION.on ? `<div class="xs mic-hint" id="mic-hint" role="status"><span class="mic-dot"></span> Listening… speak now. Check the text, then press Send.</div>` : ""}`;
  return `<div class="chat-head">${avatar(S.emp)}<div class="grow"><b>Omar Hassan</b><div class="xs muted">Market Intelligence Analyst</div></div>${closeBtn ? `<button class="icon-btn" data-act="closeChat" aria-label="Close chat">${icon("x")}</button>` : ""}</div>
    <div class="chat-log" id="chat-log" aria-live="polite">${chatBubbles(chatThread(r))}${busy ? `<div class="bubble-row">${avatar(S.emp, "sm")}<div class="bubble typing" aria-label="Omar is typing"><span></span><span></span><span></span></div></div>` : ""}</div>
    <div class="chat-foot">
      ${err ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(err.message)}</span>${err.retry ? `<button class="btn sm" data-act="chatRetry" data-k="${err.kind}">Retry</button>` : ""}</div>` : ""}
      ${r.goals.status === "pending_alignment" && r.align.ready ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Omar is ready to go ahead with the plan.</span><button class="btn primary sm" data-act="alignConfirm" id="align-confirm">Confirm alignment</button></div>` : ""}
      ${foot}
    </div>`;
}
function chatPanel() {
  if (!UI.chatOpen || !S.session || !UI.signedIn || UI.route === "chat") return "";
  return `<section class="chat-win" role="dialog" aria-label="Chat with Omar Hassan">${chatBody(rec(), true)}</section>`;
}
/* ---------- Chat page (separate from the Inbox) ---------- */
VIEWS.chat = function () {
  const r = rec(), last = chatThread(r).slice(-1)[0];
  markChatSeen(r);
  return pageHead("", "Chat") + `<div class="card split chat-page">
    <div class="list"><div class="list-h">Conversations</div><button class="msg-item chat-item on" id="chat-omar">${avatar(S.emp, "sm")}<span class="stack-sm grow" style="gap:1px"><b class="small">Omar Hassan</b><span class="xs muted ellipsis">${last ? `${last.from === "manager" ? "You: " : ""}${esc(last.text)}` : "Market Intelligence Analyst"}</span></span></button></div>
    <section class="chat-pane" aria-label="Chat with Omar Hassan">${chatBody(r, false)}</section>
  </div>`;
};
/* The former conversations page now opens the Chat page (no dead route). */
VIEWS.conversations = function () { setTimeout(() => go("chat"), 0); return ""; };

/* ---------- Dictation: speak instead of typing (browser speech recognition) ----------
   The spoken words appear in the message box; the participant checks them and presses Send as usual,
   so Omar and the assessments still work on text. Chrome, Edge and Safari support it; elsewhere the
   microphone button is not shown. In Chrome the audio is converted to text by Google's speech service. */
const DICTATION = {
  on: false, rec: null, base: "", finals: "",
  supported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
  path() { return P("drafts", "chat"); },
  write(text) {
    const t = text.slice(0, CHAT_LIMITS.message);
    setPath(S, DICTATION.path(), t);
    const el = document.querySelector(`[data-bind="${CSS.escape(DICTATION.path())}"]`);
    if (el) { el.value = t; el.scrollTop = el.scrollHeight; }
  },
  start() {
    if (DICTATION.on || !DICTATION.supported()) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = new SR();
    const lang = (navigator.language || "en-US"); rec.lang = /^en\b/i.test(lang) ? lang : "en-US";
    rec.continuous = true; rec.interimResults = true;
    const cur = String(val(DICTATION.path()) || "");
    DICTATION.base = cur && !/\s$/.test(cur) ? cur + " " : cur; DICTATION.finals = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) DICTATION.finals += (DICTATION.finals && !/\s$/.test(DICTATION.finals) ? " " : "") + t.trim();
        else interim += t;
      }
      const joined = (DICTATION.finals + (interim ? " " + interim.trim() : "")).trim();
      DICTATION.write(DICTATION.base + (joined ? joined.charAt(0).toUpperCase() + joined.slice(1) : ""));
    };
    rec.onerror = (e) => {
      const msg = e.error === "not-allowed" || e.error === "service-not-allowed" ? "Microphone access is blocked. Allow the microphone in your browser, or type your message."
        : e.error === "no-speech" ? "No speech was heard. Click the microphone and try again."
        : e.error === "audio-capture" ? "No microphone was found. You can type your message instead."
        : e.error === "network" ? "Speech recognition needs an internet connection. You can type your message instead." : null;
      if (msg) toast(msg);
    };
    rec.onend = () => { DICTATION.on = false; DICTATION.rec = null; save(); render(); };
    try { rec.start(); DICTATION.rec = rec; DICTATION.on = true; render(); } catch (e) { toast("Dictation could not start. You can type your message instead."); }
  },
  stop() { if (DICTATION.rec) { try { DICTATION.rec.stop(); } catch (e) {} } else { DICTATION.on = false; render(); } }
};
