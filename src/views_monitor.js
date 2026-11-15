/* =========================================================
   MONITORING: EVIDENCE LOG · MID-YEAR CHECK-IN · NEXT-EVENT CODE
   The app never generates evidence: managers record what they receive offline.
   ========================================================= */
/* Next event: "Wait for the facilitator message", then the participant enters the code announced in the room. */
function pendingRelease(r = rec()) {
  if (!S.released.r2 && goalsApproved(r)) return "r2";
  return null;
}
function waitCard(r = rec()) {
  const k = pendingRelease(r); if (!k) return "";
  const what = "the mid-year business update";
  return `<section class="card wait-card" id="wait-card"><div class="wait-b">${icon("clock")}<div class="grow stack-sm">
      <h3>Wait for the facilitator message</h3>
      <p class="small t2">Your facilitator will announce when ${what} is available and give you a code. Enter it here to continue.</p>
      <div class="row nowrap wait-row"><label class="sr" for="code-${k}">Code</label><input class="inp" id="code-${k}" placeholder="Enter the code" inputmode="numeric" autocomplete="off" maxlength="8"><button class="btn primary" data-act="releaseCode" data-k="${k}" id="code-go">Continue</button></div>
      ${UI.codeErr === k ? `<div class="err-text" id="code-err">That code isn't valid. Check the code your facilitator gave you.</div>` : ""}
    </div></div></section>`;
}

VIEWS.evidence = function () {
  const r = rec(), E = EMP();
  const items = planItems(r), f = UI.evFilter;
  const rows = r.evidence.filter(e => f === "all" || e.link === f);
  return pageHead(`Evidence Log / ${esc(E.name)}`, "Evidence Log", `${empChip()}<button class="btn primary" data-act="evNew" id="ev-add">${icon("plus", "i-sm")} Add evidence entry</button>`, "Record evidence and observations in your own words: facts, sources, impact and your follow-up. The system does not fill the log for you.") + `
  <div class="stack">
    <div class="row" style="gap:8px">${r2Status(r) !== "locked" ? `<span class="xs muted">Refer back to:</span><button class="btn ghost sm" data-act="go" data-go="home">${icon("bars", "i-sm")} Dashboard</button><button class="btn ghost sm" data-act="go" data-go="inbox">${icon("mail", "i-sm")} Stakeholder emails</button><button class="btn ghost sm" data-act="openChat">${icon("chat", "i-sm")} Chat with Omar</button>` : ""}<button class="btn ghost sm" data-act="go" data-go="goals/submit">${icon("target", "i-sm")} Performance plan</button>${""}</div>
    <div class="row between">
      <div class="row nowrap" style="gap:8px">${icon("filter", "i-sm")}<label class="sr" for="ev-filter">Filter by objective or competency</label><select class="sel" id="ev-filter" data-act-change="evFilter" style="width:auto;min-width:260px"><option value="all">All objectives and competencies (${r.evidence.length})</option>${items.map(it => `<option value="${it.id}" ${f === it.id ? "selected" : ""}>${esc(it.l)} (${r.evidence.filter(e => e.link === it.id).length})</option>`).join("")}<option value="general" ${f === "general" ? "selected" : ""}>General / other (${r.evidence.filter(e => e.link === "general").length})</option></select></div>
      <span class="xs muted">${plural(rows.length, "entry", "entries")} shown</span>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th style="width:110px">Date / Period</th><th style="width:170px">Objective / Competency</th><th>Evidence / Observation</th><th style="width:130px">Source</th><th style="width:160px">Impact</th><th style="width:170px">Manager action / Follow-up</th><th style="width:96px">Status</th><th style="width:84px"><span class="sr">Actions</span></th></tr></thead><tbody>
      ${rows.length ? rows.map(e => `<tr id="ev-${e.id}"><td>${esc(e.period)}</td><td>${esc(linkLabel(e.link))}</td><td>${esc(e.text)}</td><td>${esc(e.source === "Other" ? e.sourceOther || "Other" : e.source)}</td><td>${esc(e.impact) || "<span class='muted'>—</span>"}</td><td>${esc(e.action) || "<span class='muted'>—</span>"}</td><td><span class="chip ${e.status === "Completed" ? "st-completed" : e.status === "Ongoing" ? "st-in_progress" : "st-draft"}">${esc(e.status)}</span></td><td><span class="row nowrap" style="gap:0"><button class="icon-btn" data-act="evEdit" data-id="${e.id}" aria-label="Edit entry">${icon("edit", "i-sm")}</button><button class="icon-btn" data-act="evDel" data-id="${e.id}" aria-label="Delete entry">${icon("trash", "i-sm")}</button></span></td></tr>`).join("")
        : `<tr><td colspan="8"><div class="empty">${icon("log")}<b>${r.evidence.length ? "No entries for this filter" : "No evidence recorded yet"}</b><span class="small">Use <b>Add evidence entry</b> to document each item from your handouts.</span></div></td></tr>`}
    </tbody></table></div>
    ${r2Status(r) !== "locked" && !r.r2.submitted ? `<div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="go" data-go="round2">Mid-year review ${icon("arrow", "i-sm")}</button></div>` : ""}
  </div>`;
};
function evDraft(e) { return e ? JSON.parse(JSON.stringify(e)) : { id: null, period: "", link: "", text: "", source: "", sourceOther: "", impact: "", action: "", status: "Open" }; }
MODALS.evidence = function (m) {
  const d = m.d, items = planItems(), t = m.tried, bad = (c) => t && c ? "err" : "";
  return modalWrap(d.id ? "Edit evidence entry" : "Add evidence entry", `
    <div class="grid2">
      <div class="field"><label class="lbl" for="ev-period">Date / Period <span class="req">*</span></label><input class="inp ${bad(!d.period.trim())}" id="ev-period" list="periods" data-ev="period" value="${esc(d.period)}" placeholder="e.g. March, Q2, H1"><datalist id="periods">${PERIODS.map(p => `<option value="${p}">`).join("")}</datalist></div>
      <div class="field"><label class="lbl" for="ev-link">Objective / Competency <span class="req">*</span></label><select class="sel ${bad(!d.link)}" id="ev-link" data-ev="link"><option value="">Select…</option><optgroup label="Objectives">${items.filter(i => i.kind === "obj").map(i => `<option value="${i.id}" ${d.link === i.id ? "selected" : ""}>${esc(i.l)}</option>`).join("")}</optgroup><optgroup label="Competencies">${items.filter(i => i.kind === "comp").map(i => `<option value="${i.id}" ${d.link === i.id ? "selected" : ""}>${esc(i.short)}</option>`).join("")}</optgroup><option value="general" ${d.link === "general" ? "selected" : ""}>General / other</option></select></div>
    </div>
    <div class="field"><label class="lbl" for="ev-text">Evidence / Observation <span class="req">*</span></label><textarea class="ta ${bad(!d.text.trim())}" id="ev-text" data-ev="text" rows="3" placeholder="What happened or was measured, as stated in the handout.">${esc(d.text)}</textarea></div>
    <div class="grid2">
      <div class="field"><label class="lbl" for="ev-source">Source <span class="req">*</span></label><select class="sel ${bad(!d.source)}" id="ev-source" data-ev="source"><option value="">Select…</option>${EVIDENCE_SOURCES.map(s => `<option ${d.source === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
      ${d.source === "Other" ? `<div class="field"><label class="lbl" for="ev-sourceOther">Other source <span class="req">*</span></label><input class="inp ${bad(!d.sourceOther.trim())}" id="ev-sourceOther" data-ev="sourceOther" value="${esc(d.sourceOther)}"></div>` : `<div class="field"><label class="lbl" for="ev-status">Status</label><select class="sel" id="ev-status" data-ev="status">${EVIDENCE_STATUS.map(s => `<option ${d.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>`}
    </div>
    <div class="field"><label class="lbl" for="ev-impact">Impact</label><textarea class="ta" id="ev-impact" data-ev="impact" rows="2" placeholder="Effect on results, customers, colleagues or the business.">${esc(d.impact)}</textarea></div>
    <div class="field"><label class="lbl" for="ev-action">Manager action / Follow-up</label><textarea class="ta" id="ev-action" data-ev="action" rows="2" placeholder="What you did or will do about it.">${esc(d.action)}</textarea></div>
    ${d.source === "Other" ? `<div class="field"><label class="lbl" for="ev-status">Status</label><select class="sel" id="ev-status" data-ev="status">${EVIDENCE_STATUS.map(s => `<option ${d.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>` : ""}
    ${t && evMissing(d).length ? `<div class="notice risk">${icon("alert", "i-sm")}<span>Complete: ${evMissing(d).join(", ")}.</span></div>` : ""}`,
    `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="evSave" id="ev-save">${icon("check", "i-sm")} Save entry</button>`, true);
};
function evMissing(d) { const m = []; if (!d.period.trim()) m.push("Date / Period"); if (!d.link) m.push("Objective / Competency"); if (!d.text.trim()) m.push("Evidence / Observation"); if (!d.source) m.push("Source"); else if (d.source === "Other" && !d.sourceOther.trim()) m.push("Other source"); return m; }


/* =========================================================
   COMMERCIAL DASHBOARD (Home)
   Only figures stated in the participant documents are shown: the company-wide
   2027 targets and baselines. The documents give no mid-year business results,
   so no results are shown (no invented numbers).
   ========================================================= */
const PERIODS_DASH = [
  { id: "start", l: "Start of Year", sub: "January 2027" },
  { id: "mid", l: "Mid-Year", sub: "July 2027" }
];
function periodAvailable(id) { return id === "start" || (id === "mid" && S.released.r2); }
function currentPeriod() {
  if (UI.period && periodAvailable(UI.period)) return UI.period;
  return periodAvailable("mid") ? "mid" : "start";
}
function commercialOverview(r) {
  const period = currentPeriod();
  if (period === "mid" && !r.r2.seenDashboard) { r.r2.seenDashboard = true; save(); }
  const pinfo = PERIODS_DASH.find(p => p.id === period);
  const filter = `<div class="period-filter" role="tablist" aria-label="Period">${PERIODS_DASH.map(p => { const ok = periodAvailable(p.id); return `<button role="tab" class="${period === p.id ? "on" : ""}" data-act="period" data-v="${p.id}" aria-selected="${period === p.id}" ${ok ? "" : `disabled title="Not yet available"`}>${ok ? "" : icon("lock", "i-xs")}${p.l}</button>`; }).join("")}</div>`;
  const head = `<div class="dash-bar"><div><h2>Dashboard</h2><span class="xs">${pinfo.l} · ${pinfo.sub}</span></div>${filter}</div>`;
  const note = `<div class="insight neutral">${icon("info", "i-sm")}<span>Company and department results reflect many factors. They are not, on their own, evidence of any one employee's performance.</span></div>`;
  if (period === "start") return `<section class="dash" id="dash">${head}<div class="dash-body stack">
    <div class="card"><div class="card-b insights"><div class="insight neutral">${icon("info", "i-sm")}<span>No business updates have been published yet. Updates appear here when your facilitator releases them.</span></div></div></div>
  </div></section>`;
  const alert = `<button class="alert-bar" data-act="kpiAlert" aria-expanded="${!!UI.alertOpen}">${icon("alert")}<span class="grow"><b>Business event: the AI Acceleration.</b> Valtora Technologies has announced a major AI-enabled solution enhancement. NextWave Digital is accelerating its NextWave Insights enhancement in response.${UI.alertOpen ? `<span class="alert-more">${DASHBOARD.event.map(esc).join(" ")}</span>` : ""}</span>${icon(UI.alertOpen ? "chevdown" : "chev", "i-sm")}</button>`;
  return `<section class="dash" id="dash">${head}<div class="dash-body stack">${alert}
    <div class="card"><div class="card-h"><h3>Business update</h3><span class="xs muted">${pinfo.sub}</span></div><div class="card-b insights">
      ${DASHBOARD.event.map(t => `<div class="insight">${icon("spark", "i-sm")}<span>${esc(t)}</span></div>`).join("")}
      <div class="insight neutral">${icon("info", "i-sm")}<span>No mid-year business results have been published in this update.</span></div>
    </div></div>
    <div class="card" id="omar-midyear"><div class="card-h"><div><h3>Omar's mid-year evidence</h3><div class="xs muted">Individual work evidence · Omar Hassan · before the business event</div></div></div><div class="card-b insights">
      ${DASHBOARD.mi.map(x => `<div class="insight ${x.st === "ok" ? "good" : x.st === "late" ? "" : "neutral"}">${icon(x.st === "ok" ? "check" : x.st === "late" ? "alert" : "info", "i-sm")}<span>${esc(x.t)}.</span></div>`).join("")}
      ${note}
    </div></div>
  </div></section>`;
}

/* The detailed dashboard now lives on Home; keep the old route working. */
VIEWS.business = function () { setTimeout(() => go("home"), 0); return ""; };

/* ---------- Round 2 checklist & submission ---------- */
VIEWS.round2 = function () {
  const r = rec();
  if (r2Status(r) === "locked") return pageHead("Mid-year review", "Mid-year performance review") + lockedPanel("Not available yet", "The mid-year review opens at the mid-year checkpoint.");
  const items = [["Reviewed the mid-year business update and Omar's evidence on Home", r.r2.seenDashboard, "home"], ["Wrote your interpretation of the mid-year information (below)", r.r2.interpretation.trim().length >= 15, "round2"], ["Talked with Omar about what has been happening", managerCount(r.r2.diag.log) >= CHAT_LIMITS.diagnosticMin, "chat"], ["Recorded evidence in the Evidence Log", r.evidence.length > 0, "evidence"]];
  const ok = items.every(x => x[1]), a = r.r2.assessment;
  return pageHead("Performance Management / Mid-year review", "Mid-year performance review", statusChip(r2Status(r)), "Omar Hassan · July 2027") + `<div class="stack-lg">
    <div class="card"><div class="card-h"><h3>Checklist</h3></div><div class="card-b checklist">${items.map(([l, done, goTo]) => `<button class="ck-row ${done ? "ok" : ""}" ${goTo === "chat" ? `data-act="openChat"` : `data-act="go" data-go="${goTo}"`}>${icon(done ? "check" : "info", "i-sm")}<span class="grow">${l}</span>${icon("chev", "i-sm")}</button>`).join("")}</div></div>
    <div class="card"><div class="card-h"><div><h3>Your interpretation of the mid-year information</h3><div class="xs muted">What does the business event mean for your team, what does Omar's evidence show, and what does it not tell you?</div></div></div><div class="card-b">
      ${r.r2.submitted ? `<div class="small t2" style="white-space:pre-line">${esc(r.r2.interpretation) || "<span class='muted'>None written</span>"}</div>` : `<textarea class="ta" rows="4" id="${P("r2", "interpretation")}" ${bind(P("r2", "interpretation"))} maxlength="3000" placeholder="Summarise what the business event means, what Omar's evidence shows, and what you still need to find out.">${esc(r.r2.interpretation)}</textarea>`}
    </div></div>
    ${r.r2.submitted ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Mid-year review submitted. HR has sent you a message.</span><button class="btn sm" data-act="go" data-go="inbox/closed">Open message</button></div>${r.r2.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r2.error)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="round2">Retry assessment</button>` : ""}</div>` : ""}`
    : `<div class="card pad row between"><span class="small t2">${ok ? "Everything is ready. Submitting records your interpretation, the conversation with Omar and your Evidence Log." : "Complete the checklist to submit the mid-year review."}</span><button class="btn primary" data-act="submitR2" id="submit-r2" ${!ok || UI.busy ? "disabled" : ""}>${UI.busy === "round2" ? "Submitting…" : "Submit mid-year review"}</button></div>`}
  </div>`;
};
