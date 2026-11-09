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
    ${r2Status(r) !== "locked" && !r.r2.submitted ? `<div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="go" data-go="round2">Mid-year review ${icon("arrow", "i-sm")}</button></div>` : ""}
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


/* ---------- Commercial dashboard (shared by Home and Business Dashboard) ---------- */
function dashStage(r = rec()) { return r.r3.dataset && r.r3.dataset.company && r.r3.dataset.company.metrics ? "yearend" : S.released.r2 ? "disruption" : "baseline"; }
function dashSeries(r = rec()) {
  const m = { months: [...DASHBOARD.months], win: [...DASHBOARD.win], objections: [...DASHBOARD.objections] };
  if (dashStage(r) === "yearend") { const y = r.r3.dataset.company.metrics; m.months.push(y.month); m.win.push(y.win); m.objections.push(y.objections); }
  return m;
}
const ceo = (id) => CEO_OBJECTIVES.find(o => o.id === id);
function dashKpis(r = rec()) {
  const st = dashStage(r), y = st === "yearend" ? r.r3.dataset.company.metrics : null;
  if (st === "baseline") return [
    { id: "growth", label: "Commercial revenue growth", value: ceo("growth").target, sub: "2027 target vs 2026", note: "First results after Q1", tone: "target", obj: "growth", def: "Annual commercial revenue growth compared with 2026.", source: "Finance revenue reports" },
    { id: "win", label: "Proposal win rate", value: ceo("conversion").target, sub: "2027 average target", note: "Baseline not yet published", tone: "target", obj: "conversion", def: DASHBOARD_INFO.win.def, source: DASHBOARD_INFO.win.source },
    { id: "opps", label: "Qualified opportunities", value: ceo("pipeline").target, sub: "2027 target vs 2026 baseline", note: "2026 baseline to be confirmed", tone: "target", obj: "pipeline", def: DASHBOARD_INFO.opps.def, source: DASHBOARD_INFO.opps.source },
    { id: "mi", label: "Market intelligence reporting", value: "12", sub: "monthly reports scheduled in 2027", note: "Reporting starts in January", tone: "target", obj: "responsiveness", def: "Scheduled monthly market intelligence reports for the Commercial Department.", source: "Reporting tracker" }
  ];
  const K = Object.fromEntries(DASHBOARD.kpis.map(k => [k.id, k]));
  return [
    { id: "opps", label: K.opps.label, value: y ? `${y.opps}%` : K.opps.value, sub: y ? "vs pre-launch baseline · December" : K.opps.sub, note: y ? "June: −12%" : `Target ${ceo("pipeline").target} vs 2026`, tone: "bad", obj: "pipeline", ...DASHBOARD_INFO.opps },
    { id: "obj", label: K.obj.label, value: `${y ? y.objections : 29}%`, sub: y ? "of recorded objections · December" : K.obj.sub, note: y ? "June: 29% · pre-launch: 18%" : "Pre-launch: 18%", tone: "bad", obj: "conversion", ...DASHBOARD_INFO.obj },
    { id: "win", label: K.win.label, value: `${y ? y.win : 24}%`, sub: y ? "December" : K.win.sub, note: `Target ${ceo("conversion").target} average`, tone: "bad", obj: "conversion", ...DASHBOARD_INFO.win },
    { id: "val", label: K.val.label, value: K.val.value, sub: K.val.sub, note: y ? "No year-end update reported" : "New competitor pressure", tone: "warn", obj: "responsiveness", ...DASHBOARD_INFO.val }
  ];
}
function kpiCard(k) {
  const open = UI.kpiOpen === k.id, o = ceo(k.obj);
  return `<div class="kpi ${k.tone} ${open ? "open" : ""}"><button class="kpi-btn" data-act="kpi" data-id="${k.id}" aria-expanded="${open}"><span class="row between nowrap"><span class="xs muted">${esc(k.label)}</span><span class="kpi-i" title="${esc(k.def)}">${icon(open ? "chevdown" : "info", "i-xs")}</span></span><b class="kpi-v num">${esc(k.value)}</b><span class="xs t2">${esc(k.sub)}</span><span class="xs kpi-note">${esc(k.note)}</span></button>
    ${open ? `<div class="kpi-more xs"><div><b>What it measures:</b> ${esc(k.def)}</div><div><b>Source:</b> ${esc(k.source)}</div>${o ? `<div><b>Linked CEO objective:</b> ${esc(o.title)} (${esc(o.target)})</div>` : ""}</div>` : ""}</div>`;
}
function lineChart(m) {
  const vw = window.innerWidth || 1200, W = Math.round(Math.max(300, Math.min(860, vw > 1100 ? vw - 400 : vw - 80))), H = W < 480 ? 220 : 260, pad = { l: 44, r: 16, t: 22, b: 34 }, small = W < 480, max = 40, n = m.months.length, xs = (i) => pad.l + i * ((W - pad.l - pad.r) / (n - 1)), ys = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join("");
  const grid = [0, 10, 20, 30, 40].map(v => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${ys(v)}" y2="${ys(v)}" class="gl"/><text x="${pad.l - 8}" y="${ys(v) + 4}" text-anchor="end" class="ax">${v}%</text>`).join("");
  const sel = UI.month;
  const pts = (arr, cls) => arr.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="${sel === i ? 6 : 4}" class="${cls}"/>${small && sel !== i ? "" : `<text x="${xs(i)}" y="${ys(v) - 10}" text-anchor="middle" class="lab ${cls}">${v}%</text>`}`).join("");
  const hits = m.months.map((mo, i) => `<rect x="${xs(i) - 24}" y="${pad.t}" width="48" height="${H - pad.t - pad.b}" class="hit ${sel === i ? "sel" : ""}" data-act="month" data-i="${i}"><title>${mo}: win rate ${m.win[i]}%, price objections ${m.objections[i]}%</title></rect>`).join("");
  const launch = Math.min(3, n - 1) - 0.5;
  return `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Proposal win rate and price-related objections by month">
    ${grid}${hits}${m.months.map((mo, i) => `<text x="${xs(i)}" y="${H - 12}" text-anchor="middle" class="ax ${sel === i ? "axsel" : ""}">${mo}</text>`).join("")}
    <line x1="${xs(launch)}" x2="${xs(launch)}" y1="${pad.t}" y2="${H - pad.b}" class="ev"/><text x="${xs(launch) - 4}" y="${H - pad.b - 8}" text-anchor="end" class="ax evl">Valtora launch</text>
    <line x1="${pad.l}" x2="${W - pad.r}" y1="${ys(35)}" y2="${ys(35)}" class="tg"/><text x="${((xs(0) + xs(1)) / 2).toFixed(1)}" y="${ys(35) - 6}" text-anchor="middle" class="ax tgl">Win-rate target 35%</text>
    <path d="${path(m.win)}" class="s1"/><path d="${path(m.objections)}" class="s2"/>${pts(m.win, "s1")}${pts(m.objections, "s2")}
  </svg><div class="legend"><span><i class="s1"></i>Proposal win rate</span><span><i class="s2"></i>Price-related objections</span><span class="muted">Select a month for details</span></div>`;
}
function monthDetail(m) {
  const i = UI.month; if (i == null || i >= m.months.length) return "";
  const prev = i > 0 ? i - 1 : null, d = (a) => prev == null ? "" : ` <span class="${a[i] - a[prev] < 0 ? "neg" : a[i] - a[prev] > 0 ? "pos" : "muted"}">(${a[i] - a[prev] > 0 ? "+" : ""}${a[i] - a[prev]} pts vs ${m.months[prev]})</span>`;
  return `<div class="month-detail"><b>${m.months[i]}</b><span>Proposal win rate <b class="num">${m.win[i]}%</b>${d(m.win)}</span><span>Price-related objections <b class="num">${m.objections[i]}%</b>${d(m.objections)}</span><button class="btn ghost sm" data-act="month" data-i="${i}">Clear</button></div>`;
}
function compareBars(m) {
  const last = m.months.length - 1, rows = [["Proposal win rate", 32, 24, m.win[last]], ["Price-related objections", 18, 29, m.objections[last]]];
  const yr = dashStage() === "yearend";
  return rows.map(([l, a, b, c]) => `<div class="cmp"><div class="row between small"><b>${l}</b><span class="num">${a}% → ${b}%${yr ? ` → <b>${c}%</b>` : ""}</span></div>
    ${[["Pre-launch", a, "c0"], ["June", b, "c1"], ...(yr ? [["December", c, "c2"]] : [])].map(([lb, v, cls]) => `<div class="cmp-row"><span class="xs muted">${lb}</span><span class="cbar"><i class="${cls}" style="width:${v * 2.5}%"></i></span><span class="num xs">${v}%</span></div>`).join("")}</div>`).join("");
}
function commercialOverview(r, compact) {
  const st = dashStage(r), kp = dashKpis(r);
  const stamp = st === "baseline" ? `Start of year · ${APP.cycleYear} targets` : st === "yearend" ? "Updated December 2027" : `Updated ${SIM_DATES.alert}`;
  const head = `<div class="row between"><div><h2>Commercial overview</h2><div class="xs muted">${stamp}</div></div>${compact ? `<button class="btn" data-act="go" data-go="business">${icon("bars", "i-sm")} Detailed analysis</button>` : ""}</div>`;
  const alert = st !== "baseline" ? `<button class="alert-bar" data-act="kpiAlert" aria-expanded="${!!UI.alertOpen}">${icon("alert")}<span class="grow"><b>Business alert:</b> Valtora has introduced a lower-priced alternative to Customer360 and launched an aggressive campaign targeting NextWave's existing and potential customers.${UI.alertOpen ? `<span class="alert-more">Department indicators changed in June: qualified opportunities −12%, price-related objections 18% → 29%, proposal win rate 32% → 24%. Valtora is mentioned in 35% of active customer discussions.</span>` : ""}</span>${icon(UI.alertOpen ? "chevdown" : "chev", "i-sm")}</button>` : "";
  if (st === "baseline") return `<section class="stack">${head}
    <div class="grid4 kpi-grid">${kp.map(kpiCard).join("")}</div>
    <div class="card"><div class="card-h"><div><h3>${APP.cycleYear} commercial objectives</h3><div class="xs muted">Set by the CEO for the Commercial Department</div></div><button class="btn ghost sm" data-act="go" data-go="profile">My objectives</button></div><div class="card-b stack-sm">
      ${CEO_OBJECTIVES.map(o => `<div class="target-row"><span class="grow"><b class="small">${esc(o.title)}</b><span class="xs muted">${esc(o.kpi)}</span></span><span class="tag blue">${esc(o.target)}</span><span class="xs muted">Tracking from Q1</span></div>`).join("")}
    </div></div></section>`;
  const m = dashSeries(r), view = UI.dashView;
  return `<section class="stack">${head}${alert}
    <div><div class="eyebrow" style="margin-bottom:8px">Department indicators</div><div class="grid4 kpi-grid">${kp.map(kpiCard).join("")}</div></div>
    <div class="card"><div class="card-h"><h3>${view === "compare" ? "Before and after the launch" : "Monthly trend"}</h3><div class="seg" role="tablist"><button class="${view !== "compare" ? "on" : ""}" data-act="dashView" data-v="trend">Monthly trend</button><button class="${view === "compare" ? "on" : ""}" data-act="dashView" data-v="compare">Period comparison</button></div></div><div class="card-b stack">
      ${view === "compare" ? compareBars(m) : lineChart(m) + monthDetail(m)}
    </div></div></section>`;
}

VIEWS.business = function () {
  const r = rec(), st = dashStage(r);
  if (st !== "baseline" && !r.r2.seenDashboard) { r.r2.seenDashboard = true; save(); }
  const m = dashSeries(r);
  return pageHead("Business Dashboard", "Business Dashboard", "", "Company and department results. Business outcomes are not the same as individual performance evidence.") + `
  <div class="stack-lg">
    ${commercialOverview(r, false)}
    ${st !== "baseline" ? `<div class="card"><div class="card-h"><h3>Monthly figures</h3></div><div class="card-b"><div class="table-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Month</th><th>Proposal win rate</th><th>Price-related objections</th></tr></thead><tbody>${m.months.map((mo, i) => `<tr><td>${mo}</td><td class="num">${m.win[i]}%</td><td class="num">${m.objections[i]}%</td></tr>`).join("")}</tbody></table></div></div></div>
    <div class="card"><div class="card-h"><div><h3>Market intelligence indicators</h3><div class="xs muted">Individual work evidence · Omar Hassan</div></div></div><div class="card-b checklist">
      ${DASHBOARD.mi.map(x => `<div class="ck ${x.st === "ok" ? "ok" : x.st === "late" ? "no" : "info"}">${icon(x.st === "ok" ? "check" : x.st === "late" ? "clock" : "info", "i-sm")}<span>${esc(x.t)}</span></div>`).join("")}
    </div></div>
    <div class="card"><div class="card-h"><div><h3>Your interpretation of the business data</h3><div class="xs muted">Included in your mid-year performance review</div></div></div><div class="card-b stack">
      ${r.r2.submitted ? `<div class="small t2" style="white-space:pre-line">${esc(r.r2.interpretation) || "<span class='muted'>None written</span>"}</div>` : `<textarea class="ta" rows="4" id="${P("r2", "interpretation")}" ${bind(P("r2", "interpretation"))} maxlength="3000" placeholder="What does the data show? What does it suggest, and what does it not tell you?">${esc(r.r2.interpretation)}</textarea>`}
    </div></div>` : ""}
  </div>`;
};

/* ---------- Round 2 checklist & submission ---------- */
VIEWS.round2 = function () {
  const r = rec();
  if (r2Status(r) === "locked") return pageHead("Mid-year review", "Mid-year performance review") + lockedPanel("Not available yet", "The mid-year review opens at the mid-year checkpoint.");
  const items = [["Reviewed the business dashboard", r.r2.seenDashboard, "business"], ["Wrote your interpretation of the business data", r.r2.interpretation.trim().length >= 15, "business"], ["Held and ended the conversation with Omar", r.r2.diag.ended, "conversations/midyear"], ["Recorded evidence in the Evidence Log", r.evidence.length > 0, "evidence"]];
  const ok = items.every(x => x[1]), a = r.r2.assessment;
  return pageHead("Performance Management / Mid-year review", "Mid-year performance review", statusChip(r2Status(r)), "Omar Hassan · July 2027") + `<div class="stack-lg">
    <div class="card"><div class="card-h"><h3>Checklist</h3></div><div class="card-b checklist">${items.map(([l, done, goTo]) => `<button class="ck-row ${done ? "ok" : ""}" data-act="go" data-go="${goTo}">${icon(done ? "check" : "info", "i-sm")}<span class="grow">${l}</span>${icon("chev", "i-sm")}</button>`).join("")}</div></div>
    ${r.r2.submitted ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Mid-year review submitted.</span></div>${r.r2.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r2.error)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="round2">Retry assessment</button>` : ""}</div>` : ""}`
    : `<div class="card pad row between"><span class="small t2">${ok ? "Everything is ready. Submitting records your interpretation, the conversation with Omar and your Evidence Log." : "Complete the checklist to submit the mid-year review."}</span><button class="btn primary" data-act="submitR2" id="submit-r2" ${!ok || UI.busy ? "disabled" : ""}>${UI.busy === "round2" ? "Submitting…" : "Submit mid-year review"}</button></div>`}
  </div>`;
};
