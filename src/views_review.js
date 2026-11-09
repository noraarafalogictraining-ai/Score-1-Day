/* =========================================================
   SCORE REVIEW — Learning Score (separate from the Employee Pulse)
   ========================================================= */
const ROUND_TITLE = { 1: "Setting performance expectations", 2: "Diagnosis and coaching", 3: "Year-end evaluation" };
const STAGE_TAB = { 1: "Expectations", 2: "Mid-year", 3: "Year-end" };
function roundAvailable(n, r = rec()) { return n === 1 ? goalsApproved(r) : n === 2 ? r.r2.submitted : r.r3.done; }
VIEWS.review = function () {
  const r = rec();
  if (!r.r3.done && !UI.facOK) return pageHead("Feedback report", "Feedback report") + lockedPanel("Not available yet", "Your feedback report is available once the year-end appraisal is complete.");
  if (!AIS.scoring) return pageHead("Feedback report", "Feedback report", empChip()) + lockedPanel("Scoring unavailable", "The SCORE server could not be reached.");
  const sum = scoreSummary(r), tab = UI.sub || "summary";
  const tabs = [["summary", "Overview"], ...[1, 2, 3].map(n => [String(n), STAGE_TAB[n]])];
  return pageHead("Feedback report", "SCORE feedback report", empChip(), "Your Learning Score is criterion-based and separate from Omar's Employee Pulse.") + `
    <div class="tabs" style="margin-bottom:16px">${tabs.map(([id, l]) => { const rr = sum.rounds.find(x => String(x.n) === id); return `<button class="tab ${tab === id ? "on" : ""}" data-act="go" data-go="review/${id}">${l}${rr && roundAvailable(rr.n, r) ? `<span class="n">${rr.score}/${rr.max}</span>` : ""}</button>`; }).join("")}</div>
    ${tab === "summary" ? reviewSummary(r, sum) : roundAvailable(+tab, r) ? reviewRound(r, sum, +tab) : lockedPanel("Not completed yet", "Results appear when this stage is submitted.")}`;
};
function reviewSummary(r, sum) {
  return `<div class="stack-lg">
    <div class="card pad-lg stack"><div class="row between"><div><div class="eyebrow">SCORE Learning Score</div><h2 style="margin-top:4px">How well you applied performance management</h2></div><span class="score-big num">${sum.total}<span class="small muted"> / ${sum.max}</span></span></div>
      ${sum.rounds.map(x => `<div class="stack-sm"><div class="row between small"><b>${ROUND_TITLE[x.n]}</b><b class="num">${roundAvailable(x.n, r) ? `${x.score}/${x.max}` : "Not completed"}</b></div><div class="bar"><i style="width:${x.max ? x.score / x.max * 100 : 0}%"></i></div></div>`).join("")}
      ${sum.pending && r.r3.done ? `<p class="xs" style="color:var(--warn)">${sum.pending} criteria were not assessed and count as 0. Your facilitator can enter them.</p>` : ""}
      <p class="xs muted">Criteria are assessed against a rubric from what you wrote and said. Facilitator-entered scores replace the AI assessment for that criterion.</p>
    </div>
    <div class="card"><div class="card-h"><h3>Employee Pulse ${r.r3.done ? "outcome" : "so far"}</h3><span class="xs muted">Omar Hassan</span></div><div class="card-b stack">${pulseBars(r)}${pulseHistory(r)}</div></div>
    <div class="card"><div class="card-h"><h3>SCORE Practice Check</h3><span class="xs muted">Not scored · take it back to work</span></div><div class="card-b stack" style="gap:8px">
      ${PRACTICE.map((q, i) => `<div class="row between nowrap" style="border-bottom:1px solid var(--line);padding-bottom:8px"><span class="small">${esc(q)}</span><div class="seg">${["Yes", "Partly", "No"].map(o => `<button class="${r.pc[i] === o ? "on" : ""}" data-act="pc" data-i="${i}" data-v="${o}">${o}</button>`).join("")}</div></div>`).join("")}
    </div></div>
  </div>`;
}
function retryFor(n, r) {
  const err = n === 1 ? (r.plan.error || r.align.error) : n === 2 ? r.r2.error : r.r3.final.error;
  if (!err) return "";
  return `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(err)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="${n === 1 ? "round1" : n === 2 ? "round2" : "round3"}">Retry assessment</button>` : ""}</div>`;
}
function reviewRound(r, sum, n) {
  const rr = sum.rounds.find(x => x.n === n);
  const fb = n === 1 ? r.plan.assessment && r.plan.assessment.feedback : n === 2 ? r.r2.assessment && r.r2.assessment.feedback : r.r3.final.assessment && r.r3.final.assessment.feedback;
  return `<div class="stack-lg">
    <div class="card pad row between"><div><div class="eyebrow">${STAGE_TAB[n]}</div><h3 style="margin-top:4px">${ROUND_TITLE[n]}</h3></div><span class="score-big num">${rr.score}<span class="small muted">/${rr.max}</span></span></div>
    ${retryFor(n, r)}
    ${n === 1 && fb ? planFeedback(r, fb) : ""}
    ${n !== 1 && fb && fb.summary ? `<div class="card pad stack-sm"><h4>Summary</h4><p class="small t2">${esc(fb.summary)}</p>${fb.overlooked ? `<p class="small t2"><b>Overlooked:</b> ${esc(fb.overlooked)}</p>` : ""}</div>` : ""}
    ${rr.groups.map(g => `<div class="card"><div class="card-h"><h3>${esc(g.label)}</h3><b class="num">${g.score}/${g.max}</b></div><div class="card-b stack">${g.crit.map(critRow).join("")}</div></div>`).join("")}
  </div>`;
}
function critRow(c) {
  const a = c.a;
  return `<div class="crit-row"><div class="row between nowrap"><b class="small">${esc(c.label)}</b><span class="row nowrap" style="gap:6px"><span class="src src-${c.src === "ai" ? "self" : c.src}">${c.src === "ai" ? "AI-assessed" : c.src === "facilitator" ? "Facilitator" : "Not assessed"}</span><b class="num">${c.score != null ? c.score : "–"}/${c.max}</b></span></div>
    ${a ? `<p class="small t2">${esc(a.reason)}</p>${a.evidence.length ? `<div class="quotes">${a.evidence.map(q => `<q>${esc(q)}</q>`).join("")}</div>` : ""}<div class="xs muted">Confidence: ${esc(a.confidence)}${a.missing ? ` · Missing: ${esc(a.missing)}` : ""}</div>` : ""}</div>`;
}
function planFeedback(r, fb) {
  const V = { strong: ["st-approved", "Strong"], adequate: ["st-in_progress", "Adequate"], needs_improvement: ["st-draft", "Needs improvement"] };
  return `<div class="card"><div class="card-h"><h3>Feedback on your plan</h3></div><div class="card-b stack">
    ${(fb.objectives || []).map(o => { const ob = r.goals.objectives[o.index - 1]; const v = V[o.verdict] || V.adequate; return ob ? `<div class="crit-row"><div class="row between nowrap"><b class="small">Objective ${o.index}: ${esc(ob.objective)}</b><span class="chip ${v[0]}">${v[1]}</span></div><div class="xs muted">KPI: ${esc(ob.kpi)}</div><p class="small t2">${esc(o.comment)}</p></div>` : ""; }).join("")}
    ${(fb.competencies || []).length ? `<div class="stack-sm"><h4>Competencies</h4>${fb.competencies.map(c => `<p class="small t2"><b>${esc(c.name)}:</b> ${esc(c.comment)}</p>`).join("")}</div>` : ""}
    ${fb.overall ? `<p class="small t2">${esc(fb.overall)}</p>` : ""}
  </div></div>`;
}
