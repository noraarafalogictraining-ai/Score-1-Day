/* Local server for running and testing the pilot (no dependencies beyond the SDK).
   Serves public/ and runs the same /api functions Vercel runs.
   Usage:  ANTHROPIC_API_KEY=... node server/dev.js        (live AI)
           SCORE_AI_PROVIDER=mock node server/dev.js        (scripted test mode)
           node server/dev.js                               (no AI: conversations unavailable)
   Port: PORT (default 3000). */
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const PUB = path.join(ROOT, "public");
const API = { "/api/status": "status", "/api/converse": "converse", "/api/assess": "assess", "/api/yearend": "yearend" };
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (API[url.pathname]) {
    const fn = require(path.join(ROOT, "api", API[url.pathname] + ".js"));
    return fn(req, res);
  }
  let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  let file = path.join(PUB, path.normalize(p).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(PUB)) { res.statusCode = 403; return res.end("Forbidden"); }
  if (!path.extname(file) && fs.existsSync(file + ".html")) file += ".html";
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
    res.end(data);
  });
});
const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`SCORE Performance Hub on http://localhost:${port}  (AI: ${require("../api/_lib/ai").provider()})`));
