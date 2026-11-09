/* =========================================================
   MONITORING: EVIDENCE LOG · MID-YEAR CHECK-IN · FACILITATOR GATES
   The app never generates evidence: managers record what they receive offline.
   ========================================================= */
function releaseGate(k, title, text) {
  return `<div class="card"><div class="empty">${icon("lock")}<h3>${title}</h3><p class="small" style="max-width:58ch">${text}</p>
    <div class="row nowrap" style="gap:8px;margin-top:6px"><label class="sr" for="code-${k}">Release code</label><input class="inp" id="code-${k}" placeholder="Facilitator release code" inputmode="numeric" autocomplete="off" maxlength="8" style="width:220px"><button class="btn" data-act="releaseCode" data-k="${k}">Unlock</button></div>
    ${UI.codeErr === k ? `<div class="err-text">That code is not correct.</div>` : ""}</div></div>`;
}

VIEWS.evidence = function () {
  const r = rec(), E = EMP();
  if (!goalsApproved(r)) return pageHead(`Evidence Log / ${esc(E.name)}`, "Evidence Log", empChip()) + lockedPanel("Available once the performance contract is approved", "Monitoring begins after you and your employee have aligned on the goal plan.");
  const items = planItems(r), f = UI.evFilter;
  const rows = r.evidence.filter(e => f === "all" || e.link === f);
  return pageHead(`Evidence Log / ${esc(E.name)}`, "Evidence Log", `${empChip()}<button class="btn primary" data-act="evNew" id="ev-add">${icon("plus", "i-sm")} Add evidence entry</button>`, "Record evidence and observations in your own words: facts, sources, impact and your follow-up. The system does not fill the log for you.") + `
  <div class="stack">
    <div class="row" style="gap:8px">${r2Status(r) !== "locked" ? `<span class="xs muted">Refer back to:</span><button class="btn ghost sm" data-act="go" data-go="business">${icon("bars", "i-sm")} Dashboard</button><button class="btn ghost sm" data-act="go" data-go="inbox">${icon("mail", "i-sm")} Stakeholder emails</button><button class="btn ghost sm" data-act="go" data-go="conversations/midyear">${icon("chat", "i-sm")} Omar conversation</button>` : ""}<button class="btn ghost sm" data-act="go" data-go="goals/submit">${icon("target", "i-sm")} Performance plan</button>${r3Status(r) !== "locked" ? `<button class="btn ghost sm" data-act="go" data-go="yearend">${icon("calendar", "i-sm")} Year-end update</button>` : ""}</div>
    <div class="row between">
      <div class="row nowrap" style="gap:8px">${icon("filter", "i-sm")}<label class="sr" for="ev-filter">Filter by KPI or competency</label><select class="sel" id="ev-filter" data-act-change="evFilter" style="width:auto;min-width:260px"><option value="all">All objectives and competencies (${r.evidence.length})</option>${items.map(it => `<option value="${it.id}" ${f === it.id ? "selected" : ""}>${esc(it.l)} (${r.evidence.filter(e => e.link === it.id).length})</option>`).join("")}<option value="general" ${f === "general" ? "selected" : ""}>General / other (${r.evidence.filter(e => e.link === "general").length})</option></select></div>
      <span class="xs muted">${plural(rows.length, "entry", "entries")} shown</span>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th style="width:110px">Date / Period</th><th style="width:170px">KPI / Competency</th><th>Evidence / Observation</th><th style="width:130px">Source</th><th style="width:160px">Impact</th><th style="width:170px">Manager action / Follow-up</th><th style="width:96px">Status</th><th style="width:84px"><span class="sr">Actions</span></th></tr></thead><tbody>
      ${rows.length ? rows.map(e => `<tr id="ev-${e.id}"><td>${esc(e.period)}</td><td>${esc(linkLabel(e.link))}</td><td>${esc(e.text)}</td><td>${esc(e.source === "Other" ? e.sourceOther || "Other" : e.source)}</td><td>${esc(e.impact) || "<span class='muted'>—</span>"}</td><td>${esc(e.action) || "<span class='muted'>—</span>"}</td><td><span class="chip ${e.status === "Completed" ? "st-completed" : e.status === "Ongoing" ? "st-in_progress" : "st-draft"}">${esc(e.status)}</span></td><td><span class="row nowrap" style="gap:0"><button class="icon-btn" data-act="evEdit" data-id="${e.id}" aria-label="Edit entry">${icon("edit", "i-sm")}</button><button class="icon-btn" data-act="evDel" data-id="${e.id}" aria-label="Delete entry">${icon("trash", "i-sm")}</button></span></td></tr>`).join("")
        : `<tr><td colspan="8"><div class="empty">${icon("log")}<b>${r.evidence.length ? "No entries for this filter" : "No evidence recorded yet"}</b><span class="small">Use <b>Add evidence entry</b> to document each item from your handouts.</span></div></td></tr>`}
    </tbody></table></div>
    ${r2Status(r) !== "locked" && !r.r2.submitted ? `<div class="row" style="justify-content:flex-end"><button class="btn" data-act="go" data-go="round2">Round 2 checklist ${icon("arrow", "i-sm")}</button></div>` : ""}
  </div>`;
};
function evDraft(e) { return e ? JSON.parse(JSON.stringify(e)) : { id: null, period: "", link: "", text: "", source: "", sourceOther: "", impact: "", action: "", status: "Open" }; }
MODALS.evidence = function (m) {
  const d = m.d, items = planItems(), t = m.tried, bad = (c) => t && c ? "err" : "";
  return modalWrap(d.id ? "Edit evidence entry" : "Add evidence entry", `
    <div class="grid2">
      <div class="field"><label class="lbl" for="ev-period">Date / Period <span class="req">*</span></label><input class="inp ${bad(!d.period.trim())}" id="ev-period" list="periods" data-ev="period" value="${esc(d.period)}" placeholder="e.g. March, Q2, H1"><datalist id="periods">${PERIODS.map(p => `<option value="${p}">`).join("")}</datalist></div>
      <div class="field"><label class="lbl" for="ev-link">KPI / Competency <span class="req">*</span></label><select class="sel ${bad(!d.link)}" id="ev-link" data-ev="link"><option value="">Select…</option><optgroup label="Objectives">${items.filter(i => i.kind === "obj").map(i => `<option value="${i.id}" ${d.link === i.id ? "selected" : ""}>${esc(i.l)}</option>`).join("")}</optgroup><optgroup label="Competencies">${items.filter(i => i.kind === "comp").map(i => `<option value="${i.id}" ${d.link === i.id ? "selected" : ""}>${esc(i.short)}</option>`).join("")}</optgroup><option value="general" ${d.link === "general" ? "selected" : ""}>General / other</option></select></div>
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
function evMissing(d) { const m = []; if (!d.period.trim()) m.push("Date / Period"); if (!d.link) m.push("KPI / Competency"); if (!d.text.trim()) m.push("Evidence / Observation"); if (!d.source) m.push("Source"); else if (d.source === "Other" && !d.sourceOther.trim()) m.push("Other source"); return m; }


/* ---------- Round 2: business dashboard ---------- */
function lineChart() {
  const W = 560, H = 220, pad = { l: 58, r: 16, t: 16, b: 34 }, max = 40, xs = (i) => pad.l + i * ((W - pad.l - pad.r) / (DASHBOARD.months.length - 1)), ys = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join("");
  const grid = [0, 10, 20, 30, 40].map(v => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${ys(v)}" y2="${ys(v)}" class="gl"/><text x="${pad.l - 8}" y="${ys(v) + 4}" text-anchor="end" class="ax">${v}%</text>`).join("");
  const pts = (arr, cls) => arr.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="4" class="${cls}"/><text x="${xs(i)}" y="${ys(v) - 9}" text-anchor="middle" class="lab ${cls}">${v}%</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Proposal win rate and price-related objections, March to June">
    ${grid}${DASHBOARD.months.map((m, i) => `<text x="${xs(i)}" y="${H - 12}" text-anchor="middle" class="ax">${m}</text>`).join("")}
    <line x1="${xs(2.5)}" x2="${xs(2.5)}" y1="${pad.t}" y2="${H - pad.b}" class="ev"/><text x="${xs(2.5) + 4}" y="${pad.t + 10}" class="ax">Valtora launch</text>
    <path d="${path(DASHBOARD.win)}" class="s1"/><path d="${path(DASHBOARD.objections)}" class="s2"/>${pts(DASHBOARD.win, "s1")}${pts(DASHBOARD.objections, "s2")}
  </svg><div class="legend"><span><i class="s1"></i>Proposal win rate</span><span><i class="s2"></i>Price-related objections (share of recorded objections)</span></div>`;
}
function compareBars() {
  const rows = [["Proposal win rate", 32, 24, "pre-launch", "June"], ["Price-related objections", 18, 29, "pre-launch", "June"]];
  return rows.map(([l, a, b, la, lb]) => `<div class="cmp"><div class="row between small"><b>${l}</b><span class="num">${a}% → <b>${b}%</b></span></div>
    <div class="cmp-row"><span class="xs muted">${la}</span><span class="cbar"><i class="c0" style="width:${a * 2.5}%"></i></span><span class="num xs">${a}%</span></div>
    <div class="cmp-row"><span class="xs muted">${lb}</span><span class="cbar"><i class="c1" style="width:${b * 2.5}%"></i></span><span class="num xs">${b}%</span></div></div>`).join("");
}
VIEWS.business = function () {
  const r = rec();
  if (r2Status(r) === "locked") return pageHead("Business Dashboard", "Business Dashboard") + lockedPanel("No new business data", S.released.r2 ? "The dashboard follows the approved performance contract." : "Commercial indicators are stable. Your facilitator will tell you when to look again.") + (goalsApproved(r) && !S.released.r2 ? releaseGate("r2", "Facilitator release", "Enter the release code your facilitator gives you.") : "");
  if (!r.r2.seenDashboard) { r.r2.seenDashboard = true; save(); }
  return pageHead("Business Dashboard", "Commercial Performance Dashboard", `<span class="tag">${SIM_DATES.alert}</span>`, "Company and department results. Business outcomes are not the same as individual performance evidence.") + `
  <div class="stack-lg">
    <div class="alert-bar static">${icon("alert")}<span class="grow"><b>Business alert:</b> Valtora has introduced a lower-priced alternative to Customer360 and launched an aggressive campaign targeting NextWave's existing and potential customers.</span></div>
    <div><div class="eyebrow" style="margin-bottom:8px">Commercial indicators · Department level</div>
    <div class="grid4">${DASHBOARD.kpis.map(k => `<div class="kpi"><span class="xs muted">${k.label}</span><b class="kpi-v num ${k.dir}">${k.value}</b><span class="xs t2">${k.sub}</span></div>`).join("")}</div></div>
    <div class="grid2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Monthly trend</h3><span class="xs muted">March – June</span></div><div class="card-b">${lineChart()}</div></div>
      <div class="card"><div class="card-h"><h3>Before and after the launch</h3></div><div class="card-b stack">${compareBars()}
        <div class="table-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Month</th><th>Proposal win rate</th><th>Price-related objections</th></tr></thead><tbody>${DASHBOARD.months.map((m, i) => `<tr><td>${m}</td><td class="num">${DASHBOARD.win[i]}%</td><td class="num">${DASHBOARD.objections[i]}%</td></tr>`).join("")}</tbody></table></div></div></div>
    </div>
    <div class="card"><div class="card-h"><div><h3>Market intelligence indicators</h3><div class="xs muted">Individual work evidence · Omar Hassan</div></div></div><div class="card-b checklist">
      ${DASHBOARD.mi.map(x => `<div class="ck ${x.st === "ok" ? "ok" : x.st === "late" ? "no" : "info"}">${icon(x.st === "ok" ? "check" : x.st === "late" ? "clock" : "info", "i-sm")}<span>${esc(x.t)}</span></div>`).join("")}
    </div></div>
    <div class="card"><div class="card-h"><div><h3>Your interpretation of the business data</h3><div class="xs muted">Submitted with Round 2</div></div></div><div class="card-b stack">
      ${r.r2.submitted ? `<div class="small t2" style="white-space:pre-line">${esc(r.r2.interpretation)}</div>` : `<textarea class="ta" rows="4" id="${P("r2", "interpretation")}" ${bind(P("r2", "interpretation"))} maxlength="3000" placeholder="What does the data show? What does it suggest, and what does it not tell you?">${esc(r.r2.interpretation)}</textarea>`}
    </div></div>
  </div>`;
};

/* ---------- Round 2 checklist & submission ---------- */
VIEWS.round2 = function () {
  const r = rec();
  if (r2Status(r) === "locked") return pageHead("Round 2", "Round 2") + lockedPanel("Round 2 has not started", "Your facilitator will start Round 2.");
  const items = [["Reviewed the business dashboard", r.r2.seenDashboard, "business"], ["Wrote your interpretation of the business data", r.r2.interpretation.trim().length >= 15, "business"], ["Held and ended the conversation with Omar", r.r2.diag.ended, "conversations/midyear"], ["Recorded evidence in the Evidence Log", r.evidence.length > 0, "evidence"]];
  const ok = items.every(x => x[1]), a = r.r2.assessment;
  return pageHead("Round 2", "Round 2 · Performance Gaps, Diagnosis & Coaching", statusChip(r2Status(r))) + `<div class="stack-lg">
    <div class="card"><div class="card-h"><h3>Checklist</h3></div><div class="card-b checklist">${items.map(([l, done, goTo]) => `<button class="ck-row ${done ? "ok" : ""}" data-act="go" data-go="${goTo}">${icon(done ? "check" : "info", "i-sm")}<span class="grow">${l}</span>${icon("chev", "i-sm")}</button>`).join("")}</div></div>
    ${r.r2.submitted ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Round 2 submitted.${a ? " The assessment is ready in SCORE Review." : r.r2.error ? "" : ""}</span>${a ? `<button class="btn sm" data-act="go" data-go="review/2">View results</button>` : ""}</div>${r.r2.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r2.error)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="round2">Retry assessment</button>` : ""}</div>` : ""}`
    : `<div class="card pad row between"><span class="small t2">${ok ? "Everything is ready. Submitting sends your interpretation, the conversation and your Evidence Log for assessment." : "Complete the checklist to submit Round 2."}</span><button class="btn primary" data-act="submitR2" id="submit-r2" ${!ok || UI.busy ? "disabled" : ""}>${UI.busy === "round2" ? "Assessing…" : "Submit Round 2"}</button></div>`}
  </div>`;
};
