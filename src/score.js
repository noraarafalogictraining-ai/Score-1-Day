/* =========================================================
   SERVER CONNECTION + SCORE AGGREGATION (browser side)
   The server assesses; the browser stores results, applies facilitator
   overrides and adds up the totals. Learning Score ≠ Employee Pulse.
   ========================================================= */
const AIS = { loaded: false, provider: "unknown", model: null, scoring: null, openings: null, error: null };
async function loadStatus() {
  try {
    const r = await fetch("/api/status", { cache: "no-store" });
    const j = await r.json();
    if (!j.ok) throw new Error(j.message || "status");
    Object.assign(AIS, { loaded: true, provider: j.provider, model: j.model, scoring: j.scoring, openings: j.openings, error: null });
  } catch (e) {
    Object.assign(AIS, { loaded: true, provider: "offline", error: "The SCORE server could not be reached. Conversations and assessments need the server (see README)." });
  }
}
class ApiError extends Error { constructor(code, message) { super(message); this.code = code; } }
async function api(path, body) {
  let r;
  try { r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
  catch (e) { throw new ApiError("network", "The SCORE server could not be reached. Check the connection and try again."); }
  let j = null; try { j = await r.json(); } catch (e) { /* not JSON */ }
  if (!j || !j.ok) throw new ApiError((j && j.error) || "http_" + r.status, (j && j.message) || `The server returned an error (${r.status}).`);
  return j;
}
const aiReady = () => AIS.provider === "live" || AIS.provider === "mock";
function aiNotice() {
  if (!AIS.loaded) return "";
  if (AIS.provider === "mock") return `<div class="notice warn ai-banner">${icon("alert", "i-sm")}<span><b>Test mode:</b> scripted test responses, not live AI. Use only for automated testing.</span></div>`;
  if (AIS.provider === "unavailable") return `<div class="notice risk ai-banner">${icon("alert", "i-sm")}<span><b>Live AI conversations are unavailable:</b> no AI provider is configured on the server. Your facilitator can continue the session manually.</span></div>`;
  if (AIS.provider === "offline") return `<div class="notice risk ai-banner">${icon("alert", "i-sm")}<span>${esc(AIS.error)}</span></div>`;
  return "";
}

/* ---------- Score aggregation ---------- */
function assessments(r = rec()) { return [r.plan.assessment, r.align.assessment, r.r2.assessment, r.r3.final.assessment].filter(Boolean); }
function criterionResults(r = rec()) {
  const got = new Map(); assessments(r).forEach(a => (a.criteria || []).forEach(c => got.set(c.id, c)));
  if (!AIS.scoring) return [];
  return AIS.scoring.flatMap(g => g.criteria.map(c => {
    const a = got.get(c.id), fac = r.fac[c.id];
    const base = a ? a.score : null, score = fac != null ? fac : base;
    return { ...c, group: g.id, round: g.round, groupLabel: g.label, a, score, src: fac != null ? "facilitator" : a ? "ai" : "pending" };
  }));
}
function scoreSummary(r = rec()) {
  const crit = criterionResults(r);
  const groups = (AIS.scoring || []).map(g => { const cs = crit.filter(c => c.group === g.id); return { ...g, score: cs.reduce((s, c) => s + (c.score || 0), 0), pending: cs.filter(c => c.score == null).length, crit: cs }; });
  const rounds = [1, 2, 3].map(n => { const gs = groups.filter(g => g.round === n); return { n, max: gs.reduce((s, g) => s + g.max, 0), score: gs.reduce((s, g) => s + g.score, 0), pending: gs.reduce((s, g) => s + g.pending, 0), groups: gs }; });
  return { groups, rounds, total: rounds.reduce((s, x) => s + x.score, 0), max: rounds.reduce((s, x) => s + x.max, 0), pending: rounds.reduce((s, x) => s + x.pending, 0) };
}
const PRACTICE = [
  "Did I align objectives with business priorities?", "Did I define measurable expectations?", "Did I establish appropriate evidence sources?",
  "Did I assess both WHAT and HOW?", "Did I investigate the causes of the performance gap before acting?", "Did I separate facts from interpretations?", "Did I check my evaluation for potential bias?"
];
