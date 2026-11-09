/* =========================================================
   AI ENGINE (server only)
   - Employee simulation model: Omar's replies (plain text)
   - Assessment model: structured JSON against the rubric
   Provider is chosen from environment variables:
     ANTHROPIC_API_KEY set           → live Claude (model: SCORE_MODEL or claude-opus-5-5)
     SCORE_AI_PROVIDER=mock          → scripted TEST provider (automated tests only; the UI labels it)
     neither                         → AI unavailable (endpoints answer 503)
   ========================================================= */
const MODEL = process.env.SCORE_MODEL || "claude-opus-5-5";

function provider() {
  if (process.env.SCORE_AI_PROVIDER === "mock") return "mock";
  if (process.env.ANTHROPIC_API_KEY) return "live";
  return "unavailable";
}

let _client = null;
function client() {
  if (!_client) {
    const { Anthropic } = require("@anthropic-ai/sdk");
    _client = new Anthropic({ maxRetries: 2, timeout: 55000 });
  }
  return _client;
}

class AIError extends Error { constructor(code, message, status = 502) { super(message); this.code = code; this.status = status; } }

/* Shared request options: refusal fallback enabled by default (server-side, Anthropic picks the fallback model). */
function baseRequest(extra) {
  return {
    model: MODEL,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    cache_control: { type: "ephemeral" },
    ...extra
  };
}
async function send(req) {
  const { Anthropic } = require("@anthropic-ai/sdk");
  let res;
  try {
    res = await client().beta.messages.create(baseRequest(req));
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new AIError("ai_auth", "The AI provider rejected the server's API key.", 503);
    if (e instanceof Anthropic.RateLimitError) throw new AIError("ai_busy", "The AI service is busy. Please try again in a moment.", 503);
    if (e instanceof Anthropic.APIConnectionError) throw new AIError("ai_network", "The server could not reach the AI service.", 503);
    if (e instanceof Anthropic.APIError) throw new AIError("ai_error", `AI service error (${e.status}).`, 502);
    throw e;
  }
  if (res.stop_reason === "refusal") throw new AIError("ai_refusal", "The AI declined to respond to this message. Please rephrase.", 422);
  const text = res.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
  if (!text) throw new AIError("ai_empty", "The AI returned an empty response.", 502);
  return { text, stop: res.stop_reason };
}

/* Employee simulation: history = [{from: "employee"|"manager", text}], opening = Omar's first message (or null) */
async function employeeReply({ system, history, stance }) {
  const messages = [{ role: "user", content: "(The conversation starts.)" }];
  for (const m of history) messages.push({ role: m.from === "manager" ? "user" : "assistant", content: m.text });
  if (messages[messages.length - 1].role === "assistant") messages.push({ role: "user", content: "(The manager is waiting for you to continue.)" });
  if (stance) messages.push({ role: "system", content: stance });
  const out = await send({ system, messages, max_tokens: 2000, output_config: { effort: "low" } });
  return out.text.replace(/^Omar:\s*/i, "").trim();
}

/* Assessment: returns parsed JSON matching schema */
async function assessJSON({ system, user, schema, effort = "medium" }) {
  const out = await send({ system, messages: [{ role: "user", content: user }], max_tokens: 16000, output_config: { effort, format: { type: "json_schema", schema } } });
  try { return JSON.parse(out.text); } catch (e) { throw new AIError("ai_format", "The AI returned an unreadable assessment.", 502); }
}

/* ---------- Guards ---------- */
const norm = (s) => String(s || "").toLowerCase().replace(/[“”"‘’'`]/g, "").replace(/\s+/g, " ").trim();
/* Keep only evidence quotes that really appear in what the participant wrote. */
function verifyQuotes(criteria, corpus) {
  const hay = norm(corpus);
  for (const c of criteria) {
    const before = c.evidence.length;
    c.evidence = c.evidence.map(q => String(q).trim()).filter(q => { const n = norm(q).replace(/^\.\.\.|\.\.\.$/g, "").trim(); return n.length >= 4 && hay.includes(n); });
    if (c.evidence.length < before) c.quotes_removed = before - c.evidence.length;
  }
  return criteria;
}
/* Clamp scores to each criterion's max; fill criteria the model omitted. */
function normalise(defs, raw) {
  const got = new Map((raw || []).map(c => [c.id, c]));
  return defs.map(d => {
    const c = got.get(d.id);
    if (!c) return { id: d.id, group: d.group, label: d.label, max: d.max, score: 0, evidence: [], reason: "Not assessed: the assessment did not return this criterion.", confidence: "low", missing: "Assessment incomplete." };
    const s = Math.max(0, Math.min(d.max, Math.round(Number(c.score) || 0)));
    return { id: d.id, group: d.group, label: d.label, max: d.max, score: s, evidence: Array.isArray(c.evidence) ? c.evidence.slice(0, 4) : [], reason: String(c.reason || "").slice(0, 900), confidence: ["high", "medium", "low"].includes(c.confidence) ? c.confidence : "low", missing: String(c.missing || "").slice(0, 400) };
  });
}
const groupTotals = (crit) => crit.reduce((a, c) => { a[c.group] = (a[c.group] || 0) + c.score; return a; }, {});

module.exports = { MODEL, provider, AIError, employeeReply, assessJSON, verifyQuotes, normalise, groupTotals };
