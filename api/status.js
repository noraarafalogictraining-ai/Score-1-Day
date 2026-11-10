/* GET /api/status — which AI provider is active, plus the public scoring structure. */
const { handler } = require("./_lib/http");
const AI = require("./_lib/ai");
const RB = require("./_lib/rubrics");
const SC = require("./_lib/scenario_omar");
module.exports = handler(async () => {
  const p = AI.provider();
  return { provider: p, model: p === "live" ? AI.MODEL : null, scoring: RB.summary(), openings: { alignment: SC.ALIGNMENT.opening, diagnostic: SC.DIAGNOSTIC.opening, appraisal: SC.APPRAISAL.opening } };
}, ["GET"]);
