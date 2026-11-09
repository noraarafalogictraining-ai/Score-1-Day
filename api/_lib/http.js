/* Request helpers and input validation shared by the API functions. */
const LIMITS = { text: 2000, longText: 6000, history: 60, objectives: 8, comps: 6, evidence: 40 };

async function readJSON(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return null; } }
  const chunks = []; let size = 0;
  for await (const ch of req) { size += ch.length; if (size > 200000) return null; chunks.push(ch); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch (e) { return null; }
}
function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}
class BadInput extends Error {}
const str = (v, max = LIMITS.text) => { if (v == null) return ""; if (typeof v !== "string" && typeof v !== "number") throw new BadInput("Invalid text field."); const s = String(v); if (s.length > max) throw new BadInput(`A text field is longer than ${max} characters.`); return s; };
const int = (v, lo, hi) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };
const arr = (v, max) => { if (v == null) return []; if (!Array.isArray(v)) throw new BadInput("Invalid list."); if (v.length > max) throw new BadInput("Too many items."); return v; };

function cleanHistory(h) {
  return arr(h, LIMITS.history).map(m => {
    if (!m || (m.from !== "manager" && m.from !== "employee")) throw new BadInput("Invalid conversation entry.");
    const text = str(m.text).trim(); if (!text) throw new BadInput("Empty message.");
    return { from: m.from, text };
  });
}
function cleanPlan(p) {
  p = p || {};
  return {
    objectives: arr(p.objectives, LIMITS.objectives).map(o => ({ objective: str(o.objective), kpi: str(o.kpi), weight: int(o.weight, 0, 100), evidence: str(o.evidence, 200), freq: str(o.freq, 60) })),
    comps: arr(p.comps, LIMITS.comps).map(c => ({ name: str(c.name, 120), level: str(c.level, 40), standard: str(c.standard) }))
  };
}
function cleanEvidence(e) {
  return arr(e, LIMITS.evidence).map(x => ({ period: str(x.period, 80), link: str(x.link, 200), text: str(x.text), source: str(x.source, 200), impact: str(x.impact), action: str(x.action), status: str(x.status, 40) }));
}
function cleanAppraisal(a) {
  a = a || {};
  return {
    what: arr(a.what, LIMITS.objectives).map(x => ({ objective: str(x.objective), kpi: str(x.kpi), weight: int(x.weight, 0, 100), actual: str(x.actual), rating: int(x.rating, 1, 5), just: str(x.just) })),
    how: arr(a.how, LIMITS.comps).map(x => ({ name: str(x.name, 120), level: str(x.level, 40), standard: str(x.standard), observed: str(x.observed), rating: int(x.rating, 1, 5), just: str(x.just) })),
    overall: { what: int((a.overall || {}).what, 1, 5), how: int((a.overall || {}).how, 1, 5), final: int((a.overall || {}).final, 1, 5), just: str((a.overall || {}).just, LIMITS.longText), strengths: str((a.overall || {}).strengths), dev: str((a.overall || {}).dev) }
  };
}
const pathwayOf = (v) => ["A", "B", "C"].includes(v) ? v : null;

function handler(fn, methods = ["POST"]) {
  return async (req, res) => {
    if (!methods.includes(req.method)) return send(res, 405, { ok: false, error: "method_not_allowed" });
    try {
      const body = req.method === "POST" ? await readJSON(req) : {};
      if (body == null) return send(res, 400, { ok: false, error: "bad_json", message: "Request body is not valid JSON." });
      const out = await fn(body, req);
      send(res, 200, { ok: true, ...out });
    } catch (e) {
      if (e instanceof BadInput) return send(res, 400, { ok: false, error: "bad_input", message: e.message });
      if (e && e.code && e.status) return send(res, e.status, { ok: false, error: e.code, message: e.message });
      console.error("[score-api]", e);
      send(res, 500, { ok: false, error: "server_error", message: "Something went wrong on the server." });
    }
  };
}
module.exports = { LIMITS, BadInput, str, int, arr, cleanHistory, cleanPlan, cleanEvidence, cleanAppraisal, pathwayOf, handler, send };
