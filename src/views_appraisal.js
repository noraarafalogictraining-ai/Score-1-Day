/* =========================================================
   ROUND 3 — YEAR-END UPDATE · FINAL APPRAISAL · BIAS REFLECTION
   ========================================================= */
function kvTable(rows) { return `<div class="table-wrap"><table class="tbl" style="min-width:0"><tbody>${rows.map(([k, v]) => `<tr><td style="width:38%"><b class="small">${esc(k)}</b></td><td class="small">${esc(v)}</td></tr>`).join("")}</tbody></table></div>`; }
/* ---------- Year-end performance record (canonical evidence + the participant's own management records) ---------- */
const EV_SECTIONS = [["results", "Performance Results"], ["feedback", "Stakeholder Feedback"], ["contrib", "Business Contributions"], ["dev", "Development & Follow-Up"]];
function evSectionOf(ref) { return /REP|REC|Register [12]$/.test(ref) ? "results" : /FB|ENG|Register [34]$/.test(ref) ? "feedback" : /CI|BIZ|Register 5$/.test(ref) ? "contrib" : "dev"; }
function regTable(head, rows, cls = "") { return `<div class="table-wrap"><table class="tbl reg ${cls}"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }
const sumRows = (d, cats) => d.summary.filter(x => cats.includes(x.category)).map(x => [`<span class="ev-id">${esc(x.id)}</span>`, esc(x.measure), `<b class="num">${esc(x.actual)}</b>`, esc(x.period), `<span class="xs t2">${esc(x.source)}</span>`, x.scope === "business" ? `<span class="tag">Business outcome</span> <span class="xs t2">${esc(x.narrative)}</span>` : `<span class="xs t2">${esc(x.narrative)}</span>`]);
const SUM_HEAD = ["ID", "Measure", "Result", "Period", "Source", "Note"];
function managerRecords(r) {
  const mgr = (log) => log.filter(m => m.from === "manager").length, acts = r.evidence.filter(e => (e.action || "").trim());
  return [
    ["January 2027", "Performance plan and expectations", r.align.confirmed ? "Plan agreed with Omar" : goalsApproved(r) ? "Plan approved" : "Not agreed", "Your performance plan; chat with Omar (January)"],
    ["June 2027", "Mid-year diagnosis and coaching conversation", mgr(r.r2.diag.log) ? `Held (${plural(mgr(r.r2.diag.log), "message", "messages")} from you)` : "Not held", "Chat with Omar (June)"],
    ...(acts.length ? acts.map(e => [esc(e.period), "Follow-up action you logged", esc(e.action), "Your Evidence Log"]) : [["2027", "Follow-up actions you logged", "None logged", "Your Evidence Log"]])
  ];
}
function yearEndBody(d, r = rec(), openSec = null) {
  if (!d || !d.registers) return `<p class="small muted">The year-end record needs to be reloaded.</p>`;
  const R = d.registers, open = (id) => (openSec ? openSec === id : id === "results") ? "open" : "";
  const sec = (id, title, sub, body) => `<details class="ev-sec" id="ev-${id}" ${open(id)}><summary><span class="grow"><b>${title}</b><span class="xs muted">${sub}</span></span>${icon("chevdown", "i-sm")}</summary><div class="ev-sec-b">${body}</div></details>`;
  return `<div class="ev-record stack">
    <div class="ev-head"><div><div class="eyebrow">NextWave · Human Resources</div><b>${esc(d.title)}</b></div><span class="xs muted">As of ${esc(d.asOf)} · Record v${esc(d.version)}</span></div>
    ${sec("results", "1. Performance Results", "Reporting and recommendations", `
      ${regTable(SUM_HEAD, sumRows(d, ["Reporting", "Recommendations"]))}
      <h4>Register 1 · Monthly reporting</h4><p class="xs muted">${d.calendar ? `Business calendar: ${esc(d.calendar.workingDays)} working days; holiday Fri 1 Jan 2027. ${esc(d.calendar.deadlineRule)}.` : ""}</p>
      ${regTable(["Report for", "Report ID", "Deadline", "Submitted", "Timeliness", "Quality review", "Revision", "Advance escalation", "Source"], R.reporting.map(x => [esc(x.month), `<span class="ev-id">${esc(x.id)}</span>`, esc(x.due), esc(x.submitted), x.timeliness === "On time" ? esc(x.timeliness) : `<b class="neg">${esc(x.timeliness)}</b>`, x.quality.startsWith("Passed") ? esc(x.quality) : `<b class="neg">${esc(x.quality)}</b>`, esc(x.revision), esc(x.escalation), `<span class="xs t2">${esc(x.source)}</span>`]))}
      <h4>Register 2 · Commercial recommendations</h4>
      ${regTable(["ID", "Date", "Topic", "Finding", "Proposed action", "Decision status", "Decision owner", "Evidence"], R.recommendations.map(x => [`<span class="ev-id">${esc(x.id)}</span>`, esc(x.date), esc(x.topic), esc(x.finding), esc(x.action), esc(x.status), esc(x.owner), `<span class="xs t2">${esc(x.ref)}</span>`]))}
      <p class="xs muted">Decision status records management's decision on each recommendation.</p>`)}
    ${sec("feedback", "2. Stakeholder Feedback", "Feedback scores, comments and engagement", `
      ${regTable(SUM_HEAD, sumRows(d, ["Stakeholder feedback", "Collaboration"]))}
      <h4>Register 3 · Stakeholder feedback</h4>
      ${regTable(["Period", "Score", "Scale", "Source"], R.feedback.map(x => [esc(x.period), `<b class="num">${x.score}</b>`, esc(x.scale), `<span class="xs t2">${esc(x.source)}</span>`]))}
      <div class="stack-sm"><h4>Stakeholder comments · H2 2027</h4>${R.comments.map(c => `<div class="small"><b>${esc(c.who)}:</b> <span class="t2">“${esc(c.text)}”</span></div>`).join("")}</div>
      <h4>Register 4 · Stakeholder engagement</h4>
      ${regTable(["ID", "When", "Meeting or consultation", "Participants", "Purpose", "Observed behaviour", "Outcome", "Follow-up actions"], R.engagement.map(x => [`<span class="ev-id">${esc(x.id)}</span>`, esc(x.when), esc(x.meeting), esc(x.participants), esc(x.purpose), esc(x.behaviour), esc(x.outcome), esc(x.followup)]))}
      <p class="xs muted">"None documented" means no record exists; it does not show whether informal follow-up happened.</p>`)}
    ${sec("contrib", "3. Business Contributions", "Competitive intelligence, observed behaviours, department context", `
      <h4>Register 5 · Competitive intelligence</h4>
      ${regTable(["ID", "When", "Item", "Finding", "Business relevance", "Communicated via", "Organisational response", "Source"], R.intelligence.map(x => [`<span class="ev-id">${esc(x.id)}</span>`, esc(x.when), esc(x.item), esc(x.finding), esc(x.relevance), esc(x.channel), esc(x.response), `<span class="xs t2">${esc(x.source)}</span>`]))}
      <h4>Observed behaviours</h4>${kvTable(R.behaviours)}
      <h4>Department results <span class="tag">Context, not individual performance</span></h4>
      ${regTable(["Business measure", "Pre-Valtora", "June", "December"], d.business.rows.map(x => [esc(x.measure), esc(x.pre), esc(x.june), `<b>${esc(x.dec)}</b>`]))}
      <p class="xs t2">${esc(d.business.response)}</p>`)}
    ${sec("dev", "4. Development & Follow-Up", "HR records and your own management actions", `
      <h4>Register 6 · HR development records</h4>
      ${regTable(["ID", "Period", "Record", "Status", "Source"], R.development.map(x => [`<span class="ev-id">${esc(x.id)}</span>`, esc(x.period), esc(x.record), esc(x.status) + (x.note ? `<div class="xs muted">${esc(x.note)}</div>` : ""), `<span class="xs t2">${esc(x.source)}</span>`]))}
      <h4>Your management actions <span class="xs muted">(from your own records this year)</span></h4>
      ${regTable(["When", "Record", "Status", "Source"], managerRecords(r))}`)}
  </div>`;
}
VIEWS.yearend = function () {
  const r = rec();
  if (r3Status(r) === "locked") return pageHead("My Inbox / Year-end update", "Year-End Performance Update") + lockedPanel("Not available yet", "The year-end update is published in December.");
  if (!r.r3.dataset) return pageHead("My Inbox / Year-end update", "Year-End Performance Update") + `<div class="card pad stack">${r.r3.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span>${esc(r.r3.error)}</span></div>` : `<p class="small t2">Loading the year-end update…</p>`}<div><button class="btn primary" data-act="loadYearEnd" id="load-yearend">Load year-end update</button></div></div>`;
  return pageHead("My Inbox / Year-end update", "Year-End Performance Update — Omar Hassan", `<button class="btn" data-act="go" data-go="inbox/yearend">${icon("back", "i-sm")} Back to email</button><button class="btn primary" data-act="go" data-go="appraisal">${icon("clipboard", "i-sm")} Open appraisal</button>`, `${APP.cycleLabel} · Compare these results with the objectives and competencies agreed in January.`) + yearEndBody(r.r3.dataset, r, UI.evOpen);
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
      ${partErrs.length && (ed || part === "III") ? `<div class="notice warn ap-errs">${icon("alert", "i-sm")}<div class="stack-sm"><b>To complete ${AP_PARTS.find(x => x[0] === part)[1]}:</b><ul class="list-plain small">${partErrs.slice(0, 10).map(e => `<li>${esc(e)}</li>`).join("")}${partErrs.length > 10 ? `<li>…and ${partErrs.length - 10} more</li>` : ""}</ul></div></div>` : ""}
      <div class="ap-actions">
        <button class="btn" data-act="saveDraft" id="save-draft">${icon("check", "i-sm")} Save draft</button>
        <span class="grow xs muted">Entries save automatically as you type.</span>
        ${ed ? `<button class="btn primary" data-act="submitAppraisal" id="submit-appraisal" ${v.shareOK && !UI.busy ? "" : "disabled"} title="${v.shareOK ? "" : "Complete Parts I and II first"}">${icon("send", "i-sm")} ${a.revisions ? "Submit revised appraisal" : "Share Parts I–II with Omar"}</button>` : ""}
        ${!ed && !r.r3.done && r.r3.conv.ended ? `<button class="btn primary" data-act="go" data-go="reflection" id="go-review">${icon("clipboard", "i-sm")} Review & finalize</button>` : ""}
        ${r.r3.done ? `<button class="btn" data-act="go" data-go="reflection">${icon("eye", "i-sm")} View final appraisal</button>` : ""}
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
function objMethodSelect(x, base, ed) {
  if (x.def.type !== "numeric") return `<span class="tag">${x.def.type === "milestone" ? "Completion rule" : "Manager assessment"}</span>`;
  const cur = x.method;
  return ed ? `<select class="sel sm" data-obj-mode="${base}" aria-label="How achievement is calculated">${[["higher", "Actual ÷ target × 100"], ["lower", "Lower is better (target ÷ actual)"], ["review", "Manager assessment (documented basis)"]].map(([v, l]) => `<option value="${v}" ${cur === v ? "selected" : ""}>${l}</option>`).join("")}</select>` : `<span class="tag">${METHOD_LABEL[cur]}</span>`;
}
function manualBox(x, base, ed) {
  const e = x.e;
  return `<div class="review-box">
      ${x.def.type === "review" ? `<div class="kpi-flag ${x.res.status === "ok" ? "resolved" : ""}">${icon(x.res.status === "ok" ? "check" : "alert", "i-xs")} <span><b>${x.res.status === "ok" ? "Assessed with a documented basis" : "Needs clarification: not yet in the score"}</b> · ${esc(x.def.reason || "")}</span></div>` : ""}
      <div class="grid2"><div class="field"><label class="lbl" for="${base}.manual">% achieved (your assessment) <span class="req">*</span></label>${ed ? `<input class="inp" inputmode="decimal" id="${base}.manual" ${bind(base + ".manual")} value="${esc(e.manual || "")}" placeholder="0–${APPRAISAL_CONFIG.manualMax}">` : `<b>${esc(e.manual ? e.manual + "%" : "—")}</b>`}</div>
      <label class="check" style="align-self:end"><input type="checkbox" id="${base}.reviewed" ${bind(base + ".reviewed")} ${e.reviewed ? "checked" : ""} ${ed ? "" : "disabled"}> I have reviewed the relevant year-end evidence <span class="req">*</span></label></div>
      <div class="field"><label class="lbl" for="${base}.basis">Measurement basis <span class="req">*</span></label>${ed ? `<textarea class="ta" rows="2" id="${base}.basis" ${bind(base + ".basis")} placeholder="How did you reach this %? What did you compare with what, and why is it a fair reading of the agreed objective? Note any limitation in the evidence.">${esc(e.basis || "")}</textarea>` : `<div class="small t2">${esc(e.basis || "—")}</div>`}</div>
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
      : `<div class="field"><label class="lbl" for="${base}.actual">Actual achievement <span class="req">*</span></label>${ed ? `<input class="inp ${res.status === "invalid" ? "err" : ""}" inputmode="decimal" id="${base}.actual" ${bind(base + ".actual")} value="${esc(e.actual || "")}" placeholder="${x.def.unit === "%" ? "Percentage, e.g. 80%" : x.def.unit ? `Score, e.g. 3.5${x.def.unit}` : "Number, e.g. 9"}">` : `<b>${esc(e.actual || "—")}</b>`}${res.status === "invalid" ? `<span class="err-text">${esc(res.note)}</span>` : ""}</div>`;
    return `<tr class="ap-row ${isOpen ? "open" : ""}" data-act="apOpen" data-id="${o.id}" id="apobj-${o.id}">
        <td class="c-no">${x.i + 1}</td><td><div class="clamp">${esc(o.objective)}</div></td><td><div class="clamp xs">${esc(o.measure || "")}</div></td><td class="num">${esc(fmtDefinitionTarget(x.def))}</td><td class="xs">${esc(fmtDue(o.due))}</td>
        <td class="xs">${actualCell}</td><td class="num shade c-pct">${pctTxt(res.pct)}</td><td class="num shade">${x.weight}%</td><td class="num calc c-ws">${pctTxt(x.weighted)}</td><td><div class="clamp xs">${e.comments ? esc(e.comments) : `<span class="muted">—</span>`}</div></td></tr>
      ${isOpen ? `<tr class="ap-edit"><td colspan="10"><div class="ap-edit-b">
        <div class="agreed-grid">
          <div class="full"><span class="kg-l">Objective (as agreed in January)</span><div class="small">${esc(o.objective)}</div></div>
          <div class="full"><span class="kg-l">Measurement</span><div class="small">${esc(o.measure || "—")}</div></div>
          <div><span class="kg-l">Target</span><b class="kg-target">${esc(fmtDefinitionTarget(x.def))}</b></div><div><span class="kg-l">Due date</span><div class="small">${esc(fmtDue(o.due))}</div></div><div><span class="kg-l">Weight</span><div class="small"><b>${x.weight}%</b></div></div><div><span class="kg-l">Calculation</span>${objMethodSelect(x, base, ed)}</div>
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
    ${r.r3.appraisal.status !== "submitted" && !signed ? `<p class="xs muted">Complete Part III after your appraisal discussion with Omar, so the plan reflects what you agree together. You can draft it at any time.</p>` : ""}
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
      <td><span class="kg-l">Manager / supervisor signature</span><div class="small">${done ? `${managerName()} · finalized digitally` : "Not yet signed"}</div><div class="xs muted">Date: ${done ? SIM_DATES.closed : "—"}</div></td>
      <td><span class="kg-l">Department manager signature</span><div class="small">Pending</div><div class="xs muted">Date: —</div></td>
    </tr></tbody></table>`;
}
function appraisalStatusNotice(r) {
  if (r.r3.done) return `<div class="notice good">${icon("check", "i-sm")}<span>The appraisal is final and recorded.</span></div>`;
  if (r.r3.conv.ended) return `<div class="notice">${icon("info", "i-sm")}<span class="grow">Appraisal discussion held${r.r3.conv.outcome === "incomplete" ? " (closed before next steps were agreed)" : ""}. Complete Part III, then review and finalize.</span><button class="btn sm primary" data-act="go" data-go="reflection">Review & finalize</button></div>`;
  const c = r.r3.conv, answered = managerCount(c.log) >= CHAT_LIMITS.appraisalMin;
  if (UI.endConfirm && !c.completed) return `<div class="notice warn">${icon("alert", "i-sm")}<span class="grow">You and Omar haven't agreed next steps yet. End the discussion anyway? It will be recorded as not completed.</span><button class="btn sm" data-act="endCancel">Keep talking</button><button class="btn sm primary" data-act="appraisalContinue" id="appraisal-end-confirm">End discussion</button></div>`;
  return `<div class="notice ${c.completed ? "good" : ""}">${icon(c.completed ? "check" : "chat", "i-sm")}<span class="grow">${c.completed ? "Appraisal Discussion Completed. Complete Part III, then review and finalize." : answered ? "Parts I–II shared with Omar. Continue the discussion in the chat." : "Parts I–II shared with Omar."}</span>${c.completed ? "" : `<button class="btn sm" data-act="openChat">Open chat</button>`}${answered ? `<button class="btn sm primary" data-act="appraisalContinue" id="appraisal-continue">${c.completed ? "Close the discussion" : "End discussion"}</button>` : ""}</div>`;
}
DRAWERS.evidence = function (d) {
  const r = rec(), list = r.evidence.filter(e => d.id === "all" || e.link === d.id);
  return `<div class="drawer-scrim" data-act="closeDrawer"></div><aside class="drawer wide" role="dialog" aria-label="Evidence"><div class="drawer-h"><h3>Evidence</h3><button class="icon-btn" data-act="closeDrawer" aria-label="Close">${icon("x")}</button></div>
    <div class="drawer-b"><h4>Your Evidence Log (${list.length})</h4>${list.length ? list.map(e => `<div class="ev-card"><div class="row between"><span class="tag">${esc(e.period)}</span><span class="xs muted">${esc(e.source === "Other" ? e.sourceOther : e.source)} · ${esc(e.status)}</span></div><div class="xs muted">${esc(linkLabel(e.link))}</div><div>${esc(e.text)}</div>${e.impact ? `<div class="xs"><span class="muted">Impact:</span> ${esc(e.impact)}</div>` : ""}${e.action ? `<div class="xs"><span class="muted">Action:</span> ${esc(e.action)}</div>` : ""}</div>`).join("") : `<p class="small muted">No entries.</p>`}
    ${r.r3.dataset ? `<h4 style="margin-top:10px">Year-end performance record</h4>${yearEndBody(r.r3.dataset, r, d.sec)}` : ""}</div></aside>`;
};

/* ---------- Bias reflection ---------- */
/* ---------- Review & finalize: summary of the whole form + bias reflection ---------- */
function appraisalSummary(r) {
  const c = appraisalCalc(r), v = appraisalValidation(r), p = r.r3.appraisal.pdp || blankPdp(), E = EMP();
  const ck = (ok, t) => `<div class="ck ${ok ? "ok" : "no"}">${icon(ok ? "check" : "x", "i-sm")}<span>${t}</span></div>`;
  return `<section class="hr-form" id="appraisal-summary">
    <div class="hr-title">Performance Appraisal Form · Review</div>
    ${formHeadTable([[["Employee Name", esc(E.name)], ["Position", esc(E.title)]], [["Department", "Commercial"], ["Rating Period", "1 January – 31 December 2027 · Annual"]], [["Supervisor / Manager", `${managerName()} · Commercial Director`], ["Status", r.r3.done ? "<b>Finalized</b>" : v.ok ? "Ready to finalize" : "In progress"]]])}
    <div class="sum-scores">
      <div><span class="xs muted">Competencies score</span><b class="num">${pctTxt(c.competenciesScore)}</b><span class="xs muted">Contribution (40%): ${pctTxt(c.competenciesContrib)}</span></div>
      <div><span class="xs muted">Objectives score</span><b class="num">${pctTxt(c.objectivesScore)}</b><span class="xs muted">Contribution (60%): ${pctTxt(c.objectivesContrib)}</span></div>
      <div><span class="xs muted">Overall performance score</span><b class="num" id="sum-overall">${pctTxt(c.overall)}</b></div>
      <div class="band"><span class="xs muted">Performance rating</span><b id="sum-rating">${c.band ? esc(c.band.label) : "—"}</b><span class="xs muted">${c.band ? esc(c.band.range) : ""}</span></div>
    </div>
    <h4>Part I · Competencies evaluation</h4>
    <div class="table-wrap"><table class="hr-tbl"><thead><tr><th>Competency</th><th>Expected proficiency</th><th>Rating</th><th>Comments</th></tr></thead><tbody>${c.comps.map(x => `<tr><td><b>${esc(compName(x.c.id))}</b></td><td>${levelLabel(x.c.level)}</td><td>${x.rating ? esc(ratingLabel(x.rating)) : "—"}</td><td class="xs">${esc(x.h.comments || "—")}</td></tr>`).join("")}</tbody></table></div>
    <h4>Part II · Objectives evaluation</h4>
    <div class="table-wrap"><table class="hr-tbl"><thead><tr><th>No.</th><th>Objective</th><th>Target</th><th>Actual</th><th class="shade">% Achieved</th><th class="shade">Weight</th><th class="calc">Weighted score</th></tr></thead><tbody>${c.objectives.map(x => `<tr><td>${x.i + 1}</td><td class="xs">${esc(x.o.objective)}</td><td class="num">${esc(fmtDefinitionTarget(x.def))}</td><td class="xs">${esc(x.method === "milestone" ? ((MILESTONE_OPTIONS.find(m => m[0] === x.e.milestone) || [, "—"])[1]) : x.method === "review" ? (x.e.manual ? `Assessed ${x.e.manual}%` : "—") : (x.e.actual || "—"))}</td><td class="num shade">${pctTxt(x.res.pct)}</td><td class="num shade">${x.weight}%</td><td class="num calc">${pctTxt(x.weighted)}</td></tr>`).join("")}</tbody></table></div>
    <h4>Part III · Development plan</h4>
    <div class="grid2"><div><span class="kg-l">Career planning · short term</span><div class="small t2" style="white-space:pre-line">${esc(p.short || "—")}</div></div><div><span class="kg-l">Career planning · long term</span><div class="small t2" style="white-space:pre-line">${esc(p.long || "—")}</div></div></div>
    <div><span class="kg-l">Learning & development actions</span>${(p.ld || []).filter(x => x.area || x.action).length ? `<ul class="list-plain small">${p.ld.filter(x => x.area || x.action).map(x => `<li><b>${esc(x.area)}</b> · ${esc(x.action)}</li>`).join("")}</ul>` : `<div class="small muted">—</div>`}</div>
    <div><span class="kg-l">Training & development</span>${(p.training || []).filter(x => x.course).length ? `<ul class="list-plain small">${p.training.filter(x => x.course).map(x => `<li>${esc(x.course)}${x.source ? ` · ${esc(x.source)}` : ""}${x.date ? ` · ${esc(fmtDue(x.date))}` : ""}</li>`).join("")}</ul>` : `<div class="small muted">None listed</div>`}</div>
    <div class="grid2"><div><span class="kg-l">Employee comments</span><div class="small t2" style="white-space:pre-line">${esc(p.employee || "None recorded")}</div></div><div><span class="kg-l">Direct manager comments</span><div class="small t2" style="white-space:pre-line">${esc(p.manager || "—")}</div></div></div>
    <div class="checklist">${ck(!v.I.length, "Part I complete: every competency rated with comments")}${ck(!v.II.length, "Part II complete: every objective result entered and calculated, with comments")}${ck(!v.III.length, "Part III complete: career planning, development actions and manager comments")}${ck(r.r3.conv.ended, `Appraisal discussion held with Omar${r.r3.conv.outcome === "incomplete" ? " (closed before next steps were agreed)" : ""}`)}${ck(c.overall != null, "Final score calculated")}</div>
    ${!v.ok && !r.r3.done ? `<div class="row"><button class="btn sm" data-act="apGoto" data-v="${v.I.length ? "I" : v.II.length ? "II" : "III"}">${icon("edit", "i-sm")} Complete the form</button></div>` : ""}
    ${signatureBlock(r)}
  </section>`;
}
VIEWS.reflection = function () {
  const r = rec(), b = r.r3.bias;
  if (!r.r3.conv.ended) return pageHead("Final Appraisal / Review", "Review & finalize") + lockedPanel("Not yet", "The review follows your appraisal discussion with Omar.");
  const res = b.result, busy = UI.busy === "bias" || UI.busy === "round3";
  return pageHead("Final Appraisal / Review", "Review & finalize", `${empChip()}<button class="btn sm" data-act="apGoto" data-v="III">${icon("clipboard", "i-sm")} Open the form</button>`, "Check the complete appraisal and reflect on possible rating biases before it is final.") + `<div class="stack-lg">
    ${appraisalSummary(r)}
    <div class="card"><div class="card-h"><h3>Bias check · what your reasoning suggests</h3>${res && aiReady() && !r.r3.done ? `<button class="btn ghost sm" data-act="runBias">Check again</button>` : ""}</div><div class="card-b stack">
      ${busy && !res ? `<p class="small t2">Reviewing your appraisal…</p>` : ""}
      ${b.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(b.error)}</span>${aiReady() ? `<button class="btn sm" data-act="runBias">Retry</button>` : ""}</div>` : ""}
      ${res ? `${res.flags.length ? res.flags.map(f => `<div class="bias"><b>${esc(BIAS_LABEL[f.bias] || f.bias)}</b><div class="small">Your reasoning: <q>${esc(f.evidence)}</q></div><div class="small t2">${esc(f.explanation)}</div></div>`).join("") : `<div class="notice good">${icon("check", "i-sm")}<span>Your reasoning does not show clear signs of a rating bias.</span></div>`}
        ${res.overlooked.length ? `<div class="stack-sm"><h4>Evidence that may have been overlooked</h4><ul class="list-plain small t2">${res.overlooked.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${res.overemphasized.length ? `<div class="stack-sm"><h4>Evidence that may have been overemphasised</h4><ul class="list-plain small t2">${res.overemphasized.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${res.summary ? `<p class="small t2">${esc(res.summary)}</p>` : ""}` : !busy && !b.error ? `<p class="small muted">${aiReady() ? "Not checked yet." : "The AI bias check is unavailable without an AI provider. Write your own reflection below."}</p>${aiReady() ? `<div><button class="btn" data-act="runBias">Run bias check</button></div>` : ""}` : ""}
      <p class="xs muted">Biases considered: recency, halo, horn, confirmation, leniency or severity, and anchoring on the previous-year rating. A bias is flagged only when your own reasoning points to it.</p>
    </div></div>
    <div class="card"><div class="card-h"><h3>Your reflection</h3></div><div class="card-b stack">
      ${r.r3.done ? `<div class="small t2" style="white-space:pre-line">${esc(b.reflection)}</div>` : `<textarea class="ta ${b.tried && b.reflection.trim().length < 15 ? "err" : ""}" rows="4" id="${P("r3", "bias", "reflection")}" ${bind(P("r3", "bias", "reflection"))} placeholder="Which biases could have influenced your ratings? What did you check, and what, if anything, would you change?">${esc(b.reflection)}</textarea>`}
      ${r.r3.sbii.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r3.sbii.error)}</span>${aiReady() ? `<button class="btn sm" data-act="sbiiRetry">Retry</button>` : ""}</div>` : ""}
      ${r.r3.final.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r3.final.error)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="round3">Retry assessment</button>` : ""}</div>` : ""}
      ${r.r3.done ? `<div class="row between"><span class="small t2">${icon("check", "i-sm")} Appraisal final.</span><button class="btn primary sm" data-act="go" data-go="review">View feedback report</button></div>` : `<div class="row between"><button class="btn" data-act="reconsider" id="reconsider">${icon("edit", "i-sm")} Reconsider the appraisal</button><button class="btn primary" data-act="finalize" id="finalize" ${busy ? "disabled" : ""}>${UI.busy === "round3" ? "Assessing…" : "Finalize appraisal"}</button></div>`}
    </div></div>
  </div>`;
};
