/* =========================================================
   MONITORING: EVIDENCE LOG · MID-YEAR CHECK-IN · NEXT-EVENT CODE
   The app never generates evidence: managers record what they receive offline.
   ========================================================= */
/* Next stage: the "End-year" button in the Evidence Log (no facilitator code). Available at any time;
   it releases the mid-year business update, the stakeholder emails and Omar's message. */
function pendingRelease(r = rec()) {
  if (!S.released.r2) return "r2";   /* available at any time: no sequential restrictions */
  return null;
}
function waitCard(r = rec()) {
  const k = pendingRelease(r); if (!k) return "";
  return `<section class="card wait-card" id="wait-card"><div class="wait-b">${icon("calendar")}<div class="grow stack-sm">
      <h3>Move to the next stage</h3>
      <p class="small t2">When your facilitator asks, click <b>End-year</b> to continue. You will receive the latest business update, new emails and a message from Omar.</p>
      <div class="row nowrap wait-row"><button class="btn primary" data-act="startMidyear" id="end-year">${icon("arrow", "i-sm")} End-year</button></div>
    </div></div></section>`;
}

VIEWS.evidence = function () {
  const r = rec(), E = EMP();
  const items = planItems(r), f = UI.evFilter;
  const rows = r.evidence.filter(e => f === "all" || e.link === f);
  return pageHead("", "Evidence Log", `${empChip()}<button class="btn primary" data-act="evNew" id="ev-add">${icon("plus", "i-sm")} Add evidence entry</button>`, "Record evidence and observations in your own words: facts, sources, impact and your follow-up.") + `
  <div class="stack">
    ${waitCard(r)}
    <div class="row" style="gap:8px">${r2Status(r) !== "locked" ? `<span class="xs muted">Refer back to:</span><button class="btn ghost sm" data-act="go" data-go="home">${icon("bars", "i-sm")} Dashboard</button><button class="btn ghost sm" data-act="go" data-go="inbox">${icon("mail", "i-sm")} Stakeholder emails</button><button class="btn ghost sm" data-act="openChat">${icon("chat", "i-sm")} Chat with Omar</button>` : ""}<button class="btn ghost sm" data-act="go" data-go="goals">${icon("target", "i-sm")} Performance plan</button><button class="btn ghost sm" data-act="go" data-go="history">${icon("clipboard", "i-sm")} 2026 evidence</button>${""}</div>
    <div class="row between">
      <div class="row nowrap" style="gap:8px;min-width:0;max-width:100%">${icon("filter", "i-sm")}<label class="sr" for="ev-filter">Filter by objective or competency</label><select class="sel" id="ev-filter" data-act-change="evFilter" style="width:auto;min-width:min(260px, 100%);max-width:100%"><option value="all">All objectives and competencies (${r.evidence.length})</option>${items.map(it => `<option value="${it.id}" ${f === it.id ? "selected" : ""}>${esc(it.l)} (${r.evidence.filter(e => e.link === it.id).length})</option>`).join("")}<option value="general" ${f === "general" ? "selected" : ""}>General / other (${r.evidence.filter(e => e.link === "general").length})</option></select></div>
      <span class="xs muted">${plural(rows.length, "entry", "entries")} shown</span>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th style="width:110px">Date / Period</th><th style="width:170px">Objective / Competency</th><th>Evidence / Observation</th><th style="width:130px">Source</th><th style="width:160px">Impact</th><th style="width:170px">Manager action / Follow-up</th><th style="width:96px">Status</th><th style="width:84px"><span class="sr">Actions</span></th></tr></thead><tbody>
      ${rows.length ? rows.map(e => `<tr id="ev-${e.id}"><td>${esc(e.period)}</td><td>${esc(linkLabel(e.link))}</td><td>${esc(e.text)}</td><td>${esc(e.source === "Other" ? e.sourceOther || "Other" : e.source)}</td><td>${esc(e.impact) || "<span class='muted'>—</span>"}</td><td>${esc(e.action) || "<span class='muted'>—</span>"}</td><td><span class="chip ${e.status === "Completed" ? "st-completed" : e.status === "Ongoing" ? "st-in_progress" : "st-draft"}">${esc(e.status)}</span></td><td><span class="row nowrap" style="gap:0"><button class="icon-btn" data-act="evEdit" data-id="${e.id}" aria-label="Edit entry">${icon("edit", "i-sm")}</button><button class="icon-btn" data-act="evDel" data-id="${e.id}" aria-label="Delete entry">${icon("trash", "i-sm")}</button></span></td></tr>`).join("")
        : `<tr><td colspan="8"><div class="empty">${icon("log")}<b>${r.evidence.length ? "No entries for this filter" : "No evidence recorded yet"}</b><span class="small">Use <b>Add evidence entry</b> to document each item from your handouts.</span></div></td></tr>`}
    </tbody></table></div>
    ${finalAppraisal(r)}
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
  { id: "mid", l: "End of Year", sub: "" }
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
  const head = `<div class="dash-bar"><div><h2>Dashboard</h2><span class="xs">${pinfo.sub ? `${pinfo.l} · ${pinfo.sub}` : pinfo.l}</span></div>${filter}</div>`;
  const note = `<div class="insight neutral">${icon("info", "i-sm")}<span>Company and department results reflect many factors. They are not, on their own, evidence of any one employee's performance.</span></div>`;
  if (period === "start") return `<section class="dash" id="dash">${head}<div class="dash-body stack">
    <div class="card"><div class="card-b insights"><div class="insight neutral">${icon("info", "i-sm")}<span>No business updates have been published yet. They appear here after you click End-year in the Evidence Log.</span></div></div></div>
  </div></section>`;
  const alert = `<button class="alert-bar" data-act="kpiAlert" aria-expanded="${!!UI.alertOpen}">${icon("alert")}<span class="grow"><b>Business event: the AI Acceleration.</b> Valtora Technologies has announced a major AI-enabled solution enhancement. NextWave Digital is accelerating its NextWave Insights enhancement in response.${UI.alertOpen ? `<span class="alert-more">${DASHBOARD.event.map(esc).join(" ")}</span>` : ""}</span>${icon(UI.alertOpen ? "chevdown" : "chev", "i-sm")}</button>`;
  return `<section class="dash" id="dash">${head}<div class="dash-body stack">${alert}
    <div class="card" id="omar-midyear"><div class="card-h"><div><h3>Omar's mid-year evidence</h3><div class="xs muted">Individual work evidence · Omar Hassan · before the business event</div></div></div><div class="card-b insights">
      ${DASHBOARD.mi.map(x => `<div class="insight ${x.st === "ok" ? "good" : x.st === "late" ? "" : "neutral"}">${icon(x.st === "ok" ? "check" : x.st === "late" ? "alert" : "info", "i-sm")}<span>${esc(x.t)}.</span></div>`).join("")}
      ${note}
    </div></div>
  </div></section>`;
}

/* The detailed dashboard now lives on Home; keep the old route working. */
VIEWS.business = function () { setTimeout(() => go("home"), 0); return ""; };

/* ---------- Final Appraisal (part of the Evidence Log; not a separate round) ----------
   Two overall ratings on a 1–5 scale and one overall evaluation. Nothing is mandatory, no score is calculated.
   "Complete Final Appraisal" saves the entries and delivers HR's closing email once. */
const FA_SCALE = [[1, "Significantly Below Expectations"], [2, "Below Expectations"], [3, "Meets Expectations"], [4, "Exceeds Expectations"], [5, "Outstanding"]];
function faScale(key, label, hint, val) {
  const path = P("fa", key);
  return `<div class="field fa-q"><span class="lbl">${label}</span><span class="xs muted">${hint}</span>
    <div class="fa-scale" role="radiogroup" aria-label="${label}">${FA_SCALE.map(([v, l]) => `<button role="radio" aria-checked="${val === v}" class="${val === v ? "on" : ""}" data-act="rate" data-path="${path}" data-v="${v}" id="fa-${key}-${v}"><b class="num">${v}</b><span>${l}</span></button>`).join("")}</div></div>`;
}
function finalAppraisal(r) {
  const f = r.fa;
  return `<section class="card" id="final-appraisal"><div class="card-h"><div><h3>Final Appraisal</h3><div class="xs muted">Omar Hassan · 2027 · rate on the 1–5 scale</div></div>${f.completed ? `<span class="chip st-approved">Completed</span>` : ""}</div><div class="card-b stack">
    ${faScale("obj", "A. Overall Objectives Rating", "Omar's overall achievement against the objective you set.", f.obj)}
    ${faScale("comp", "B. Overall Competency Rating", "Omar's overall competency performance, based on the evidence available.", f.comp)}
    <div class="field"><label class="lbl" for="${P("fa", "text")}">C. Overall Performance Evaluation</label><textarea class="ta" rows="5" id="${P("fa", "text")}" ${bind(P("fa", "text"))} maxlength="4000" placeholder="Explain your overall evaluation of Omar's performance in 2027, covering both objective achievement and competencies.">${esc(f.text || "")}</textarea></div>
    ${f.completed ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Final appraisal completed. HR has sent you a message. Your entries stay editable and are saved automatically.</span><button class="btn sm" data-act="go" data-go="inbox/closed">Open message</button></div>`
      : `<div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="completeFA" id="complete-fa">${icon("check", "i-sm")} Complete Final Appraisal</button></div>`}
  </div></section>`;
}

/* The Mid-year Review page was removed: old links open the Evidence Log. */
VIEWS.round2 = function () { setTimeout(() => go("evidence"), 0); return ""; };
