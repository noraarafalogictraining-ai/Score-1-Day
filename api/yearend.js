/* POST /api/yearend — Omar's canonical 2027 year-end evidence record (the same for every participant; fictional pilot data).
   Called by the browser only after the December event is released. */
const { handler } = require("./_lib/http");
const EV = require("./_lib/evidence_omar");
module.exports = handler(async () => ({ dataset: EV.DATASET, tag: `Evidence record v${EV.VERSION}` }));
