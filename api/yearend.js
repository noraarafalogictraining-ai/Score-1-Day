/* POST /api/yearend { pathway } — the fixed year-end evidence dataset for the pathway (fictional pilot data). */
const { handler, pathwayOf, BadInput } = require("./_lib/http");
const SC = require("./_lib/scenario_omar");
module.exports = handler(async (body) => {
  const p = pathwayOf(body.pathway);
  if (!p) throw new BadInput("Unknown pathway.");
  const d = SC.YEAR_END[p];
  return { dataset: { title: d.title, reporting: d.reporting, recommendations: d.recommendations, stakeholder: d.stakeholder, comments: d.comments, behaviours: d.behaviours, development: d.development, own: d.own, company: SC.COMPANY_YEAR_END }, tag: d.tag };
});
