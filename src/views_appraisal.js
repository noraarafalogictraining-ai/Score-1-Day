/* =========================================================
   ROUND 3 — YEAR-END UPDATE · FINAL APPRAISAL · BIAS REFLECTION
   ========================================================= */
function kvTable(rows) { return `<div class="table-wrap"><table class="tbl" style="min-width:0"><tbody>${rows.map(([k, v]) => `<tr><td style="width:38%"><b class="small">${esc(k)}</b></td><td class="small">${esc(v)}</td></tr>`).join("")}</tbody></table></div>`; }
/* ---------- Year-end performance record (canonical evidence + the participant's own management records) ---------- */
/* ---------- Year-End Performance Summary (concise; built from the participant's own plan + the canonical record) ---------- */
const EV_SECTIONS = [["results", "A. Results against agreed objectives"], ["comp", "B. Competency evidence"], ["feedback", "C. Stakeholder feedback"], ["dev", "D. Development & manager follow-up"]];
function evSectionOf(ref) { return /FB|ENG|Register [34]$/.test(ref) ? "feedback" : /DEV|Register 6$/.test(ref) ? "dev" : "results"; }
const EV_STATUS = { calculated: ["good", "Calculated"], partial: ["warn", "Partly verifiable"], evidence: ["", "Evidence only"], insufficient: ["risk", "Insufficient record"] };
function summaryResults(d, r) {
  const objs = r.goals.objectives;
  if (!objs.length) return `<p class="small muted">No objectives were agreed in January.</p>`;
  return `<div class="ev-cards">${objs.map((o, i) => {
    const x = objectiveEvidence(o, d, r), st = EV_STATUS[x.status];
    return `<article class="ev-obj" id="ev-obj-${o.id}">
      <div class="ev-obj-h"><span class="goal-n">${i + 1}</span><div class="grow"><details class="ev-wording"><summary><b class="small">${esc(o.objective)}</b></summary><div class="xs t2"><b>Measurement:</b> ${esc(o.measure || "—")}<br><b>Due:</b> ${esc(fmtDue(o.due))}</div></details></div><span class="tag">Weight ${num(o.weight)}%</span></div>
      <div class="ev-grid">
        <div><span class="kg-l">Target</span><b class="num">${esc(x.target)}</b></div>
        <div><span class="kg-l">Actual result</span><b class="num">${x.actual ? esc(x.actual) : "—"}</b></div>
        <div><span class="kg-l">Achievement</span><b class="num ${x.achievement == null ? "muted" : ""}">${x.achievement != null ? `${x.achievement}%` : x.status === "evidence" ? "Requires your assessment" : "Not verifiable"}</b></div>
        <div><span class="kg-l">Record</span><span class="chip ev-st ${st[0]}">${st[1]}</span></div>
      </div>
      <p class="small t2 ev-key">${esc(x.evidence)}${x.note ? ` <span class="xs muted">${esc(x.note)}</span>` : ""}</p>
    </article>`; }).join("")}</div>
    <p class="xs muted">Results are taken from one HR record and expressed in the unit of each agreed measurement. Where no record matches, nothing is estimated. Enter your own figures in the Final Appraisal.</p>`;
}
function summaryCompetencies(d, r) {
  const C = (d && d.competencies) || {};
  if (!r.goals.comps.length) return `<p class="small muted">No competencies were agreed in January.</p>`;
  return `<div class="ev-cards two">${r.goals.comps.map(k => { const e = C[k.id] || {}; return `<article class="ev-comp"><div class="row between nowrap"><b class="small">${esc(compName(k.id))}</b><span class="tag">Expected: ${levelLabel(k.level)}</span></div>
      <div class="xs"><span class="ev-plus">${icon("check", "i-xs")}</span> ${esc(e.strength || "No specific observation recorded.")}</div>
      ${e.development ? `<div class="xs"><span class="ev-minus">${icon("alert", "i-xs")}</span> ${esc(e.development)}</div>` : ""}</article>`; }).join("")}</div>
    <p class="xs muted">Observations only. Rate each competency yourself against the behavioral standard you agreed in January.</p>`;
}
function summaryFeedback(d) {
  const R = d.registers, q = R.feedback;
  return `<div class="stack-sm">
      <div class="ev-trend">${q.map(x => `<div><span class="xs muted">${esc(x.period.slice(0, 2))}</span><b class="num">${x.score}</b></div>`).join(`<span class="xs muted">→</span>`)}<span class="xs t2">Average stakeholder feedback (1–5) declined through the year; H2 average ${d.measures ? d.measures.feedback.h2 : "3.25"}.</span></div>
      <div class="ev-cards">${R.comments.map(c => `<blockquote class="ev-quote"><span class="small">“${esc(c.text)}”</span><cite class="xs muted">${esc(c.who)}</cite></blockquote>`).join("")}</div>
      <div class="grid2 ev-pg"><div><span class="kg-l">Positive contributions</span><ul class="list-plain small"><li>The 12-month-contract finding on Valtora's pricing.</li><li>Accurate analysis: 11 of 12 reports passed quality review.</li></ul></div>
      <div><span class="kg-l">Documented gaps</span><ul class="list-plain small"><li>Findings rarely turned into practical options.</li><li>One documented consultation (July) with no recorded follow-up actions.</li><li>September meeting with Operations ended without agreed next steps.</li></ul></div></div>
    </div>`;
}
function summaryTimeline(d, r) {
  const mgr = (log) => log.filter(m => m.from === "manager").length, acts = r.evidence.filter(e => (e.action || "").trim());
  const self = (d.registers.development.find(x => /self-assessment/i.test(x.record)) || {}).status || "";
  const item = (when, title, text, cls = "") => `<li class="${cls}"><span class="xs muted">${when}</span><b class="small">${title}</b><span class="xs t2">${text}</span></li>`;
  return `<ol class="ev-timeline">
      ${item("January", "Performance plan", r.align.confirmed ? `Agreed with Omar · ${SIM_DATES.approved}` : goalsApproved(r) ? "Plan approved" : "Not agreed", r.align.confirmed ? "done" : "")}
      ${item("Mid-year", "Diagnosis and coaching conversation", mgr(r.r2.diag.log) ? `Held · ${plural(mgr(r.r2.diag.log), "message", "messages")} from you` : "No conversation recorded", mgr(r.r2.diag.log) ? "done" : "")}
      ${acts.length ? acts.map(e => item(esc(e.period), "Action you recorded", esc(e.action), "done")).join("") : item("After mid-year", "Manager actions", "None recorded in your Evidence Log.")}
      ${item("Aug – Dec", "HR development record", "No formal coaching or development activity on HR record. This does not show whether informal support took place.")}
      ${item("December", "Omar's self-assessment", esc(self))}
    </ol>`;
}
function yearEndBody(d, r = rec(), openSec = null) {
  if (!d || !d.measures) return `<p class="small muted">The year-end summary needs to be reloaded.</p>`;
  const open = (id) => (openSec ? openSec === id : id === "results") ? "open" : "";
  const sec = (id, title, sub, body) => `<details class="ev-sec" id="ev-${id}" ${open(id)}><summary><span class="grow"><b>${title}</b><span class="xs muted">${sub}</span></span>${icon("chevdown", "i-sm")}</summary><div class="ev-sec-b">${body}</div></details>`;
  return `<div class="ev-record stack">
    <div class="ev-head"><div><div class="eyebrow">NextWave · Human Resources</div><b>Year-End Performance Summary — Omar Hassan</b></div><span class="xs muted">As of ${esc(d.asOf)}</span></div>
    ${sec("results", EV_SECTIONS[0][1], "Your agreed objectives, targets and the recorded results", summaryResults(d, r))}
    ${sec("comp", EV_SECTIONS[1][1], "Observations for the competencies agreed in January", summaryCompetencies(d, r))}
    ${sec("feedback", EV_SECTIONS[2][1], "Trend, comments, contributions and gaps", summaryFeedback(d))}
    ${sec("dev", EV_SECTIONS[3][1], "From the January plan to the year-end self-assessment", summaryTimeline(d, r))}
    <details class="ev-src xs muted"><summary>Record sources</summary><p>Reporting tracker and QA review log · Recommendation register · Structured stakeholder feedback form · Consultation records · HR learning and coaching records · Year-end self-assessment · Your Evidence Log and conversations.</p></details>
  </div>`;
}
VIEWS.yearend = function () {
  const r = rec();
  if (r3Status(r) === "locked") return pageHead("My Inbox / Year-end update", "Year-End Performance Update") + lockedPanel("Not available yet", "The year-end update is published in December.");
  if (!r.r3.dataset) return pageHead("My Inbox / Year-end update", "Year-End Performance Update") + `<div class="card pad stack">${r.r3.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span>${esc(r.r3.error)}</span></div>` : `<p class="small t2">Loading the year-end update…</p>`}<div><button class="btn primary" data-act="loadYearEnd" id="load-yearend">Load year-end update</button></div></div>`;
  return pageHead("My Inbox / Year-end update", "Year-End Performance Summary — Omar Hassan", `<button class="btn" data-act="go" data-go="inbox/yearend">${icon("back", "i-sm")} Back to email</button>`, `${APP.cycleLabel} · A short summary for preparing the appraisal and your conversation with Omar.`) + yearEndBody(r.r3.dataset, r, UI.evOpen) + `<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" data-act="go" data-go="appraisal" id="open-appraisal">${icon("clipboard", "i-sm")} Open Final Appraisal</button></div>`;
};

function rateSeg(path, cur, err) {
  return `<div class="rate ${err ? "err" : ""}" role="radiogroup">${[...RATING_SCALE].reverse().map(x => `<button role="radio" aria-checked="${cur === x.v}" class="${cur === x.v ? "on" : ""}" data-act="rate" data-path="${path}" data-v="${x.v}"><b>${x.v}</b>${x.l}</button>`).join("")}</div>`;
}
function rateRO(v) { return v ? `<div><span class="tag blue">${esc(ratingLabel(v))}</span></div>` : `<span class="muted small">Not rated</span>`; }
const apEditable = (r = rec()) => ["not_started", "draft"].includes(r.r3.appraisal.status) && !r.r3.done;

/* ---------- PERFORMANCE APPRAISAL FORM (one activity: Parts I, II and III) ---------- */
const AP_PARTS = [["I", "Part I · Competencies", "40%"], ["II", "Part II · Objectives", "60%"], ["III", "Part III · Development Plan", ""]];
const pdpEditable = (r = rec()) => !r.r3.done;
const pctTxt = (v) => v == null ? "—" : `${v}%`;
function apPartStatus(r, c, v) {
  return {
    I: { done: !v.I.length, label: `${c.rated}/${c.comps.length} rated` },
    II: { done: !v.II.length, label: `${c.objDone}/${c.objectives.length} assessed` },
    III: { done: !v.III.length, label: v.III.length ? `${plural(v.III.length, "item", "items")} open` : "Complete" }
  };
}
function apHeader(r) {
  const E = EMP();
  return `<div class="hr-title">Performance Appraisal Form</div>
    ${formHeadTable([[["Employee Name", esc(E.name)], ["Time in Present Position", "Not recorded · 4 years at NextWave"]], [["Position", esc(E.title)], ["Type of Rating", `<span class="rt-type"><span class="on">☑ Annual</span><span>☐ Probationary</span><span>☐ Interim</span></span>`]], [["Department", "Commercial"], ["Rating Period", "From 1 January 2027 to 31 December 2027"]], [["Supervisor / Manager Name", managerName()], ["Supervisor / Manager Title", "Commercial Director"]]])}
    <details class="hr-instr"><summary>Instructions</summary><div class="xs t2 stack-sm">
      <p>This form is to be used for annual evaluations, and at other times during the year when formal feedback is needed.</p>
      <p><b>Part I – Competencies (represent 40% of the overall score).</b> These include competencies common to the employee's position job standards. Rate each competency based on performance during the period identified above.</p>
      <p><b>Part II – Goals from last year or last evaluation period (represent 60% of the overall score).</b> Rate the progress made on each of the goals established at the beginning of the period. Also include any new goals established during the evaluation period and note any modifications to the original goals.</p>
      <p><b>Part III – Professional Development Plan.</b> Enter any actions that will be taken by the employee or his manager/supervisor to support the employee's development. The plan may include career growth, job mastery, or actions to correct performance.</p>
      <p><i>*Remember that these are behavioral elements and that your judgment in each case must be supported by fact.</i></p>
    </div></details>`;
}
VIEWS.appraisal = function () {
  const r = rec(), E = EMP(), st = appraisalStatus(r);
  if (r3Status(r) === "locked") return pageHead(`Final Appraisal / ${esc(E.name)}`, "Performance Appraisal Form", empChip()) + lockedPanel("Not yet open", "The year-end appraisal opens in December, together with the year-end performance record.");
  if (!r.r3.dataset) return pageHead(`Final Appraisal / ${esc(E.name)}`, "Performance Appraisal Form", empChip()) + lockedPanel("Year-end record not received", "The appraisal opens with the year-end performance record from HR.") + `<div style="margin-top:12px"><button class="btn primary" data-act="go" data-go="inbox/yearend">Open HR email</button></div>`;
  const ed = apEditable(r), c = appraisalCalc(r), v = appraisalValidation(r), ps = apPartStatus(r, c, v), a = r.r3.appraisal;
  const part = ["I", "II", "III"].includes(UI.apPart) ? UI.apPart : a.status === "submitted" ? "III" : "I";
  const nav = `<div class="ap-parts" role="tablist">${AP_PARTS.map(([id, l, w]) => `<button class="ap-part ${part === id ? "on" : ""} ${ps[id].done ? "done" : ""}" role="tab" aria-selected="${part === id}" data-act="apPart" data-v="${id}">${icon(ps[id].done ? "check" : "clock", "i-xs")}<span class="grow"><b>${l}</b>${w ? ` <span class="xs muted">(${w})</span>` : ""}<span class="xs muted ap-part-s">${ps[id].label}</span></span></button>`).join("")}</div>`;
  const strip = `<div class="ap-strip">
      <div><span class="xs muted">Competencies score</span><b class="num">${pctTxt(c.competenciesScore)}</b></div>
      <div><span class="xs muted">Objectives score</span><b class="num">${pctTxt(c.objectivesScore)}</b></div>
      <div><span class="xs muted">Overall score</span><b class="num">${pctTxt(c.overall)}</b></div>
      <div><span class="xs muted">Performance rating</span><b>${c.band ? esc(c.band.label) : "—"}</b></div></div>`;
  const flags = (a.flags || []).length ? `<div class="notice warn">${icon("alert", "i-sm")}<div class="stack-sm"><b>Saved entries that need your review</b><ul class="list-plain small">${a.flags.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div></div>` : "";
  const body = part === "I" ? apPartI(r, c, ed) : part === "II" ? apPartII(r, c, ed) : apPartIII(r, c, pdpEditable(r));
  const partErrs = v[part];
  return pageHead(`Performance Management / Final Appraisal`, `Final Appraisal · ${esc(E.name)}`, `${statusChip(st)}<button class="btn" data-act="evDrawer" data-id="all">${icon("log", "i-sm")} Year-end evidence</button>`, `${APP.cycleLabel} · Evaluated against the objectives and competencies agreed in January.`) + `
  <div class="stack">
    ${a.revisions && ed ? `<div class="notice warn">${icon("edit", "i-sm")}<span>You are reconsidering the appraisal. Update it, then submit the revision.</span></div>` : ""}
    ${!ed ? appraisalStatusNotice(r) : ""}
    ${flags}
    <section class="hr-form" id="appraisal-form">
      ${apHeader(r)}
      ${nav}${strip}
      <div class="ap-body">${body}</div>
      ${partErrs.length && (ed || (part === "III" && !r.r3.done)) ? `<div class="notice ${part === "III" ? "" : "warn"} ap-errs">${icon(part === "III" ? "info" : "alert", "i-sm")}<div class="stack-sm"><b>${part === "III" ? "Recommended to complete the development plan:" : `To complete ${AP_PARTS.find(x => x[0] === part)[1]}:`}</b><ul class="list-plain small">${partErrs.slice(0, 10).map(e => `<li>${esc(e)}</li>`).join("")}${partErrs.length > 10 ? `<li>…and ${partErrs.length - 10} more</li>` : ""}</ul></div></div>` : ""}
      <div class="ap-actions">
        <button class="btn" data-act="saveDraft" id="save-draft">${icon("check", "i-sm")} Save draft</button>
        <span class="grow xs muted">Entries save automatically as you type.</span>
        ${ed ? `<button class="btn primary" data-act="submitAppraisal" id="submit-appraisal" ${v.shareOK && !UI.busy ? "" : "disabled"} title="${v.shareOK ? "" : "Complete Parts I and II first"}">${icon("send", "i-sm")} Submit appraisal</button>` : ""}
      </div>
    </section>
  </div>`;
};
function partBand(t) { return `<div class="part-band">${t}</div>`; }
function apPartI(r, c, ed) {
  const a = r.r3.appraisal, open = UI.compOpen === undefined ? (r.goals.comps[0] && r.goals.comps[0].id) : UI.compOpen;
  const rows = c.comps.map((x, i) => {
    const k = x.c, h = x.h, isOpen = open === k.id, base = P("r3", "appraisal", "how", k.id), tried = a.tried;
    return `<tr class="ap-row ${isOpen ? "open" : ""}" data-act="compOpen" data-id="${k.id}" id="comp-row-${k.id}"><td><b>${esc(compName(k.id))}</b></td><td>${levelLabel(k.level)}</td><td class="c-rate">${x.rating ? `<b class="num">${x.rating}</b> <span class="xs muted">${esc(ratingLabel(x.rating).split(" · ")[1])}</span>` : `<span class="muted">—</span>`}</td><td><div class="clamp xs">${h.comments ? esc(h.comments) : `<span class="muted">—</span>`}</div></td><td class="c-exp">${icon("chevdown", "i-sm")}</td></tr>
      ${isOpen ? `<tr class="ap-edit"><td colspan="5"><div class="ap-edit-b">
        <div class="grid2"><div><span class="kg-l">Competency</span><div class="small"><b>${esc(compName(k.id))}</b></div></div><div><span class="kg-l">Expected proficiency</span><div class="small">${levelLabel(k.level)}</div></div></div>
        <div class="std-box"><span class="kg-l">Agreed behavioral standard (January)</span><div class="small">${k.standard ? esc(k.standard) : "<span class='muted'>None written</span>"}</div></div>
        ${h.legacyRating && !x.rating ? `<div class="notice warn xs">${icon("alert", "i-xs")}<span>Earlier rating ${h.legacyRating} on the former 1–5 scale was not converted. Rate again on the 1–4 scale.</span></div>` : ""}
        <div class="field"><span class="lbl">Rating <span class="req">*</span></span>${ed ? rateSeg(base + ".rating", x.rating, tried && !x.rating) : rateRO(x.rating)}</div>
        <div class="field"><label class="lbl" for="${base}.comments">Comments / supporting evidence <span class="req">*</span></label>${ed ? `<textarea class="ta" rows="3" id="${base}.comments" ${bind(base + ".comments")} placeholder="What did Omar do that supports this rating? Refer to the agreed standard and the evidence.">${esc(h.comments || "")}</textarea>` : `<div class="small t2" style="white-space:pre-line">${esc(h.comments || "—")}</div>`}</div>
      </div></td></tr>` : ""}`;
  }).join("");
  const ratings = c.comps.map(x => x.rating == null ? "__" : x.rating);
  return `${partBand("PART I. COMPETENCIES EVALUATION")}
    <table class="hr-tbl scale-tbl"><thead><tr><th colspan="3">Performance Rating</th></tr></thead><tbody>${RATING_SCALE.map(x => `<tr><td><b>${x.l}</b></td><td class="num c-no"><b>${x.v}</b></td><td class="xs">${esc(x.d)}</td></tr>`).join("")}</tbody></table>
    <p class="xs t2">Rate the appraisee's competencies in the following areas in terms of their current role requirements. If appropriate provide evidence to support your assessment.</p>
    <div class="table-wrap"><table class="hr-tbl ap-tbl"><thead><tr><th>Competencies</th><th>Expected proficiency</th><th>Rating</th><th>Comments</th><th class="c-exp"></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="formula-box"><div class="xs"><b>Your score is 100% at 3.</b> To identify the overall competencies score, divide the average of the competency ratings by 3, then multiply by 100.<div class="formula num">{[(${ratings.join(" + ")}) / ${c.comps.length}] / 3} × 100</div></div><b class="num formula-res" id="comp-score">${pctTxt(c.competenciesScore)}</b></div>`;
}
function objMethodSelect(x) { return `<span class="tag">${METHOD_LABEL[x.method]}</span>`; }
function manualBox(x, base, ed) {
  const e = x.e;
  return `<div class="review-box">
      ${x.def.type === "review" ? `<div class="kpi-flag resolved">${icon("info", "i-xs")} <span>No formula applies to this objective: ${esc(x.def.reason || "")}</span></div>` : ""}
      <div class="field"><label class="lbl" for="${base}.manual">% achieved (your assessment) <span class="req">*</span></label>${ed ? `<input class="inp ${x.res.status === "invalid" ? "err" : ""}" inputmode="decimal" id="${base}.manual" ${bind(base + ".manual")} value="${esc(e.manual || "")}" placeholder="0–${APPRAISAL_CONFIG.manualMax}" style="max-width:220px">` : `<b>${esc(e.manual ? e.manual + "%" : "—")}</b>`}<span class="hint">Explain how you reached this in the comments below.</span></div>
    </div>`;
}
function apPartII(r, c, ed) {
  const open = UI.apOpen === undefined ? (c.objectives[0] && c.objectives[0].o.id) : UI.apOpen;
  const rows = c.objectives.map(x => {
    const o = x.o, e = x.e, isOpen = open === o.id, base = P("r3", "appraisal", "what", o.id), res = x.res;
    const actualCell = x.method === "milestone" ? (e.milestone ? esc((MILESTONE_OPTIONS.find(m => m[0] === e.milestone) || [, ""])[1].replace(/ \(.*\)$/, "")) : "—") : x.method === "review" ? (e.manual ? `Assessed ${esc(e.manual)}%` : "—") : (e.actual ? esc(e.actual) : "—");
    const input = x.method === "milestone"
      ? `<div class="field"><label class="lbl" for="${base}.milestone">Actual achievement: completion status <span class="req">*</span></label>${ed ? `<select class="sel" id="${base}.milestone" ${bind(base + ".milestone")}><option value="">Select…</option>${MILESTONE_OPTIONS.map(([v, l]) => `<option value="${v}" ${e.milestone === v ? "selected" : ""}>${l}</option>`).join("")}</select>` : `<b>${actualCell}</b>`}</div>${["late", "partial"].includes(e.milestone) ? manualBox(x, base, ed) : ""}`
      : x.method === "review" ? manualBox(x, base, ed)
      : `<div class="field"><label class="lbl" for="${base}.actual">Actual achievement <span class="req">*</span></label>${ed ? `<input class="inp ${res.status === "invalid" ? "err" : ""}" inputmode="decimal" id="${base}.actual" ${bind(base + ".actual")} value="${esc(e.actual || "")}" placeholder="${x.def.unit === "%" ? "Percentage, e.g. 80%" : x.def.unit ? `Score, e.g. 3.5${x.def.unit}` : "Number, e.g. 9"}">` : `<b>${esc(e.actual || "—")}</b>`}${res.status === "invalid" ? `<span class="err-text">${esc(res.note)}</span>` : ""}</div>${res.zeroLower ? manualBox(x, base, ed) : ""}`;
    return `<tr class="ap-row ${isOpen ? "open" : ""}" data-act="apOpen" data-id="${o.id}" id="apobj-${o.id}">
        <td class="c-no">${x.i + 1}</td><td><div class="clamp">${esc(o.objective)}</div></td><td><div class="clamp xs">${esc(o.measure || "")}</div></td><td class="num">${esc(fmtDefinitionTarget(x.def))}</td><td class="xs">${esc(fmtDue(o.due))}</td>
        <td class="xs">${actualCell}</td><td class="num shade c-pct">${pctTxt(res.pct)}</td><td class="num shade">${x.weight}%</td><td class="num calc c-ws">${pctTxt(x.weighted)}</td><td><div class="clamp xs">${e.comments ? esc(e.comments) : `<span class="muted">—</span>`}</div></td></tr>
      ${isOpen ? `<tr class="ap-edit"><td colspan="10"><div class="ap-edit-b">
        <div class="agreed-grid">
          <div class="full"><span class="kg-l">Objective (as agreed in January)</span><div class="small">${esc(o.objective)}</div></div>
          <div class="full"><span class="kg-l">Measurement</span><div class="small">${esc(o.measure || "—")}</div></div>
          <div><span class="kg-l">Target</span><b class="kg-target">${esc(fmtDefinitionTarget(x.def))}</b></div><div><span class="kg-l">Due date</span><div class="small">${esc(fmtDue(o.due))}</div></div><div><span class="kg-l">Weight</span><div class="small"><b>${x.weight}%</b></div></div><div><span class="kg-l">Calculation</span>${objMethodSelect(x)}</div>
        </div>
        <div class="xs t2">Relevant year-end evidence: ${x.match.refs.length ? x.match.refs.map(ref => `<button class="ev-ref" data-act="evRef" data-ref="${ref}">${esc(ref)} · ${esc(REF_LABEL[ref] || "")}</button>`).join(" ") : "none identified: explain how you assessed the result"}</div>
        ${x.match.notes.map(n => `<div class="xs t2">${icon("info", "i-xs")} ${esc(n.replace(/Your target/, "The target"))}</div>`).join("")}
        <div class="res-grid">
          <div>${input}</div>
          <div class="calc-cell"><span class="kg-l">% achieved</span><b class="kg-ach num ${res.pct == null ? "na" : res.pct >= 100 ? "good" : "low"}">${pctTxt(res.pct)}</b><span class="xs muted">${res.status === "ok" ? esc(res.note) : ""}</span></div>
          <div class="calc-cell ws"><span class="kg-l">Weighted score</span><b class="kg-ach num">${pctTxt(x.weighted)}</b><span class="xs muted">% achieved × ${x.weight}%</span></div>
        </div>
        <div class="field"><label class="lbl" for="${base}.comments">Comments / supporting evidence <span class="req">*</span></label>${ed ? `<textarea class="ta" rows="2" id="${base}.comments" ${bind(base + ".comments")} placeholder="Which evidence supports the actual achievement? Note any limitation or modification to the original goal.">${esc(e.comments || "")}</textarea>` : `<div class="small t2" style="white-space:pre-line">${esc(e.comments || "—")}</div>`}</div>
      </div></td></tr>` : ""}`;
  }).join("");
  const ws = c.objectives.map(x => x.weighted == null ? "__" : x.weighted);
  const C = APPRAISAL_CONFIG;
  return `${partBand("PART II. OBJECTIVES EVALUATION")}
    <p class="xs t2">Rate the progress made on each of the goals established at the beginning of the period and any new goals. Note any modifications to the original goals.</p>
    <div class="table-wrap"><table class="hr-tbl ap-tbl obj-eval"><thead><tr><th class="c-no">No.</th><th>Objective(s)</th><th>Measure</th><th>Target</th><th>Due date</th><th>Actual achievement</th><th class="shade">% Achieved</th><th class="shade">Weight</th><th class="calc">Weighted score</th><th>Comments</th></tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><td colspan="7" class="right"><b>Total</b></td><td class="num shade"><b>${c.totalWeight}%</b></td><td class="num calc"><b>${pctTxt(c.objectivesScore)}</b></td><td></td></tr></tfoot></table></div>
    <div class="formula-box"><div class="xs"><b>Your overall objectives score is equal to the total of your weighted scores.</b><div class="formula num">${ws.join(" + ")} =</div></div><b class="num formula-res" id="obj-score">${pctTxt(c.objectivesScore)}</b></div>
    <div class="formula-box"><div class="xs"><b>OVERALL RATING (based on Parts I and II)</b> · Relative weights of competencies and performance objectives are considered.<div class="formula num">${pctTxt(c.objectivesScore)} × (${C.objectivesWeight}/100) + ${pctTxt(c.competenciesScore)} × (${C.competenciesWeight}/100) =</div></div><b class="num formula-res" id="overall-score">${pctTxt(c.overall)}</b></div>
    ${bandTable(c)}`;
}
function bandTable(c) {
  return `<table class="hr-tbl band-tbl" id="band-table"><thead><tr><th colspan="3">Employee Performance Profile <span class="xs muted" style="font-weight:500;text-transform:none;letter-spacing:0">· the overall score, rounded to a whole %, falls in one band</span></th></tr></thead><tbody>${PERFORMANCE_BANDS.map(b => { const on = c.band && c.band.label === b.label; return `<tr class="${on ? "on" : ""}"><td class="c-tick">${on ? "✓" : ""}</td><td><b>${b.label}</b></td><td class="num">${b.range}</td></tr>`; }).join("")}</tbody></table>`;
}
function pdpRows(list, cols, path, ed, addLabel) {
  const rows = list.map((x, i) => `<tr>${cols.map(([k, l, type]) => `<td>${ed ? (type === "date" ? `<input class="inp sm" type="date" aria-label="${l} ${i + 1}" ${bind(`${path}.${i}.${k}`)} value="${esc(x[k] || "")}">` : `<textarea class="ta sm" rows="2" aria-label="${l} ${i + 1}" ${bind(`${path}.${i}.${k}`)}>${esc(x[k] || "")}</textarea>`) : `<span class="small">${esc(x[k] || "—")}</span>`}</td>`).join("")}${ed ? `<td class="c-act"><button class="icon-btn" data-act="pdpDel" data-k="${path.split(".").pop()}" data-i="${i}" aria-label="Remove row ${i + 1}">${icon("trash", "i-sm")}</button></td>` : ""}</tr>`).join("");
  return `${rows || `<tr><td colspan="${cols.length + 1}" class="xs muted">No entries.</td></tr>`}${ed ? `<tr><td colspan="${cols.length + 1}"><button class="btn sm" data-act="pdpAdd" data-k="${path.split(".").pop()}">${icon("plus", "i-sm")} ${addLabel}</button></td></tr>` : ""}`;
}
function apPartIII(r, c, ed) {
  const p = r.r3.appraisal.pdp, base = P("r3", "appraisal", "pdp");
  const ta = (k, ph, rows = 4) => ed ? `<textarea class="ta" rows="${rows}" id="${base}.${k}" ${bind(`${base}.${k}`)} placeholder="${ph}">${esc(p[k] || "")}</textarea>` : `<div class="small t2" style="white-space:pre-line">${esc(p[k] || "—")}</div>`;
  const signed = r.r3.done;
  return `${partBand("PART III. DEVELOPMENT PLAN")}
    ${!signed ? `<p class="xs muted">Record the development plan you agree with Omar. You can update it until the performance conversation is completed.</p>` : ""}
    <table class="hr-tbl pdp-tbl"><thead><tr><th colspan="2" class="grey">Career planning</th></tr><tr><th>Short term <span class="req">*</span></th><th>Long term <span class="req">*</span></th></tr></thead><tbody><tr><td>${ta("short", "Career goals for the next 12 months")}</td><td>${ta("long", "Longer-term career direction")}</td></tr></tbody></table>
    <table class="hr-tbl pdp-tbl"><thead><tr><th colspan="3" class="grey">Learning & development plan</th></tr><tr><th>Improvement area(s) <i>(if any)</i></th><th>Action</th>${ed ? "<th></th>" : ""}</tr></thead><tbody>${pdpRows(p.ld || [], [["area", "Improvement area"], ["action", "Action"]], `${base}.ld`, ed, "Add development action")}</tbody></table>
    <p class="xs muted">Actions can include coaching, mentoring, stretch assignments, on-the-job learning, stakeholder exposure, structured feedback or formal training. Be specific: what, who supports it, and by when.</p>
    <table class="hr-tbl pdp-tbl"><thead><tr><th colspan="4" class="grey">Training & development section</th></tr><tr><th>Training course</th><th>Institute or source</th><th>Preferred date</th>${ed ? "<th></th>" : ""}</tr></thead><tbody>${pdpRows(p.training || [], [["course", "Training course"], ["source", "Institute or source"], ["date", "Preferred date", "date"]], `${base}.training`, ed, "Add training")}</tbody></table>
    <table class="hr-tbl pdp-tbl"><thead><tr><th colspan="2" class="grey">Additional comments</th></tr><tr><th>Employee</th><th>Direct manager <span class="req">*</span></th></tr></thead><tbody><tr><td>${ta("employee", "Omar's own comments, if he shared any in the discussion (optional)", 5)}</td><td>${ta("manager", "Your overall comments on Omar's performance and development", 5)}</td></tr></tbody></table>
    ${signatureBlock(r)}`;
}
function signatureBlock(r) {
  const done = r.r3.done;
  return `<table class="hr-tbl sig-tbl"><tbody><tr>
      <td><span class="kg-l">Employee signature</span><div class="small">Pending employee acknowledgement</div><div class="xs muted">Date: —</div></td>
      <td><span class="kg-l">Manager / supervisor signature</span><div class="small">${done ? `${managerName()} · completed digitally` : "Not yet signed"}</div><div class="xs muted">Date: ${done ? SIM_DATES.closed : "—"}</div></td>
      <td><span class="kg-l">Department manager signature</span><div class="small">Pending</div><div class="xs muted">Date: —</div></td>
    </tr></tbody></table>`;
}
function appraisalStatusNotice(r) {
  if (r.r3.done) return `<div class="notice good">${icon("check", "i-sm")}<span class="grow">The 2027 appraisal and performance conversation are complete. HR has sent you a message.</span><button class="btn sm" data-act="go" data-go="inbox/closed">Open message</button></div>`;
  const c = r.r3.conv, answered = managerCount(c.log) >= CHAT_LIMITS.appraisalMin;
  if (UI.endConfirm && !c.completed) return `<div class="notice warn">${icon("alert", "i-sm")}<span class="grow">You and Omar haven't agreed next steps yet. Complete the conversation anyway? It will be recorded as closed before an agreement.</span><button class="btn sm" data-act="endCancel">Keep talking</button><button class="btn sm primary" data-act="appraisalContinue" id="appraisal-end-confirm">Complete anyway</button></div>`;
  return `<div class="notice ${c.completed ? "good" : ""}">${icon(c.completed ? "check" : "chat", "i-sm")}<span class="grow">${c.completed ? "Appraisal Discussion Completed." : "Appraisal submitted. Discuss it with Omar in the chat."}</span><button class="btn sm" data-act="openChat">Open chat</button>${answered ? `<button class="btn sm primary" data-act="appraisalContinue" id="appraisal-continue">Complete Performance Conversation</button>` : ""}</div>`;
}
DRAWERS.evidence = function (d) {
  const r = rec(), list = r.evidence.filter(e => d.id === "all" || e.link === d.id);
  return `<div class="drawer-scrim" data-act="closeDrawer"></div><aside class="drawer wide" role="dialog" aria-label="Evidence"><div class="drawer-h"><h3>Evidence</h3><button class="icon-btn" data-act="closeDrawer" aria-label="Close">${icon("x")}</button></div>
    <div class="drawer-b"><h4>Your Evidence Log (${list.length})</h4>${list.length ? list.map(e => `<div class="ev-card"><div class="row between"><span class="tag">${esc(e.period)}</span><span class="xs muted">${esc(e.source === "Other" ? e.sourceOther : e.source)} · ${esc(e.status)}</span></div><div class="xs muted">${esc(linkLabel(e.link))}</div><div>${esc(e.text)}</div>${e.impact ? `<div class="xs"><span class="muted">Impact:</span> ${esc(e.impact)}</div>` : ""}${e.action ? `<div class="xs"><span class="muted">Action:</span> ${esc(e.action)}</div>` : ""}</div>`).join("") : `<p class="small muted">No entries.</p>`}
    ${r.r3.dataset ? `<h4 style="margin-top:10px">Year-end performance record</h4>${yearEndBody(r.r3.dataset, r, d.sec)}` : ""}</div></aside>`;
};

/* The former review / bias-reflection page was removed; old links open the appraisal form. */
VIEWS.reflection = function () { setTimeout(() => go("appraisal"), 0); return ""; };
