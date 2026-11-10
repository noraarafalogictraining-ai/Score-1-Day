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
    <div class="row" style="gap:8px">${r2Status(r) !== "locked" ? `<span class="xs muted">Refer back to:</span><button class="btn ghost sm" data-act="go" data-go="home">${icon("bars", "i-sm")} Dashboard</button><button class="btn ghost sm" data-act="go" data-go="inbox">${icon("mail", "i-sm")} Stakeholder emails</button><button class="btn ghost sm" data-act="openChat">${icon("chat", "i-sm")} Chat with Omar</button>` : ""}<button class="btn ghost sm" data-act="go" data-go="goals/submit">${icon("target", "i-sm")} Performance plan</button>${r3Status(r) !== "locked" ? `<button class="btn ghost sm" data-act="go" data-go="yearend">${icon("calendar", "i-sm")} Year-end update</button>` : ""}</div>
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
   COMMERCIAL DASHBOARD (Home) — one source of truth for business figures
   Periods follow the facilitator's releases: Start of Year → Mid-Year → Year-End.
   Only figures defined in the scenario are shown; year-end company figures
   arrive from the server with the year-end update.
   ========================================================= */
const PERIODS_DASH = [
  { id: "start", l: "Start of Year", sub: "January 2027" },
  { id: "mid", l: "Mid-Year", sub: "June / July 2027" },
  { id: "year", l: "Year-End", sub: "December 2027" }
];
const ceo = (id) => CEO_OBJECTIVES.find(o => o.id === id);
function periodAvailable(id, r = rec()) { return id === "start" || (id === "mid" && S.released.r2) || (id === "year" && !!(r.r3.dataset && r.r3.dataset.company && r.r3.dataset.company.metrics)); }
function currentPeriod(r = rec()) {
  if (UI.period && periodAvailable(UI.period, r)) return UI.period;
  return periodAvailable("year", r) ? "year" : periodAvailable("mid", r) ? "mid" : "start";
}
/* The business figures by period (the single data source). null = not defined for that period. */
function bizData(r = rec()) {
  const y = periodAvailable("year", r) ? r.r3.dataset.company.metrics : null;
  return {
    winRate: { start: null, preLaunch: 32, mid: 24, year: y ? y.win : null, target: 35 },
    objections: { start: null, preLaunch: 18, mid: 29, year: y ? y.objections : null },
    opps: { start: null, mid: -12, year: y ? y.opps : null, target: 20 },
    valtora: { mid: 35, year: null },
    growth: { target: 15 },
    months: y ? [...DASHBOARD.months, y.month] : [...DASHBOARD.months],
    win: y ? [...DASHBOARD.win, y.win] : [...DASHBOARD.win],
    objectionSeries: y ? [...DASHBOARD.objections, y.objections] : [...DASHBOARD.objections]
  };
}
const fmtPct = (v, sign) => v == null ? "—" : `${sign && v > 0 ? "+" : ""}${v}%`;
function kpisFor(period, r = rec()) {
  const d = bizData(r);
  const val = (o) => period === "start" ? null : period === "mid" ? o.mid : o.year;
  return [
    { id: "growth", focus: "growth", label: "Commercial revenue growth", icon: "trend", value: null, target: `≥ ${d.growth.target}%`, note: period === "start" ? "First results after Q1" : "Not published in this update", obj: "growth", def: "Annual commercial revenue growth compared with 2026.", source: "Finance revenue reports", series: [] },
    { id: "win", focus: "conversion", label: "Proposal win rate", icon: "target", value: val(d.winRate), target: `≥ ${d.winRate.target}% avg`, note: period === "start" ? "Baseline not yet published" : period === "mid" ? "Pre-launch: 32%" : "June: 24% · pre-launch: 32%", tone: "bad", obj: "conversion", def: DASHBOARD_INFO.win.def, source: DASHBOARD_INFO.win.source, series: [["Pre-launch", 32], ["Mid-Year (June)", 24], ...(d.winRate.year != null ? [["Year-End (Dec)", d.winRate.year]] : [])] },
    { id: "opps", focus: "pipeline", label: "Qualified opportunities", icon: "layers", value: val(d.opps), sign: true, target: `+${d.opps.target}% vs 2026`, note: period === "start" ? "2026 baseline to be confirmed" : "vs pre-launch baseline", tone: "bad", obj: "pipeline", def: DASHBOARD_INFO.opps.def, source: DASHBOARD_INFO.opps.source, series: [["Mid-Year (June)", -12], ...(d.opps.year != null ? [["Year-End (Dec)", d.opps.year]] : [])] },
    { id: "obj", focus: "conversion", label: "Price-related objections", icon: "alert", value: val(d.objections), target: null, sub: "Share of recorded customer objections", note: period === "start" ? "Tracking from Q1" : period === "mid" ? "Pre-launch: 18%" : "June: 29% · pre-launch: 18%", tone: "bad", obj: "conversion", def: DASHBOARD_INFO.obj.def, source: DASHBOARD_INFO.obj.source, series: [["Pre-launch", 18], ["Mid-Year (June)", 29], ...(d.objections.year != null ? [["Year-End (Dec)", d.objections.year]] : [])] },
    { id: "mi", focus: "market", label: "Market intelligence reporting", icon: "log", value: period === "start" ? "12" : null, raw: true, target: null, sub: period === "start" ? "Monthly reports scheduled" : "Reported in Business insights", note: period === "start" ? "January – December 2027" : "Individual work evidence", obj: "responsiveness", def: "Scheduled monthly market intelligence reports for the Commercial Department.", source: "Reporting tracker", series: [] }
  ];
}
const FOCUS = [["all", "All"], ["conversion", "Conversion"], ["pipeline", "Pipeline"], ["market", "Market"], ["growth", "Growth"]];
function kpiCard(k, period) {
  const open = UI.kpiOpen === k.id, o = ceo(k.obj), dim = UI.focus && UI.focus !== "all" && k.focus !== UI.focus;
  const shown = k.value == null ? "—" : k.raw ? k.value : fmtPct(k.value, k.sign);
  return `<div class="kpi ${k.value == null ? "na" : k.tone || "target"} ${open ? "open" : ""} ${dim ? "dim" : ""}"><button class="kpi-btn" data-act="kpi" data-id="${k.id}" aria-expanded="${open}" title="${esc(k.def)}"><span class="row between nowrap"><span class="kpi-l">${icon(k.icon, "i-xs")} ${esc(k.label)}</span><span class="kpi-i">${icon(open ? "chevdown" : "info", "i-xs")}</span></span><b class="kpi-v num">${esc(shown)}</b><span class="xs kpi-t">${k.target ? `Target ${esc(k.target)}` : esc(k.sub || "")}</span><span class="xs kpi-note">${esc(k.note)}</span></button>
    ${open ? `<div class="kpi-more xs"><div><b>What it measures:</b> ${esc(k.def)}</div><div><b>Source:</b> ${esc(k.source)}</div>${o ? `<div><b>CEO objective:</b> ${esc(o.title)} (${esc(o.target)})</div>` : ""}${k.series.length ? `<div class="kpi-series">${k.series.map(([l, v]) => `<span><span class="muted">${l}</span><b class="num">${fmtPct(v, k.sign)}</b></span>`).join("")}</div>` : ""}</div>` : ""}</div>`;
}
function chartWidth(full) { const vw = window.innerWidth || 1200, main = vw > 1100 ? vw - 330 : vw - 60; return Math.round(Math.max(290, Math.min(full ? 1100 : 760, full ? main : (vw > 1100 ? main * 0.6 : main)))); }
function lineChart(d) {
  const show = UI.series || { win: true, obj: true };
  const W = chartWidth(false), small = W < 480, H = small ? 220 : 260, pad = { l: 42, r: 16, t: 22, b: 34 }, max = 40, n = d.months.length;
  const xs = (i) => pad.l + i * ((W - pad.l - pad.r) / Math.max(1, n - 1)), ys = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join("");
  const sel = UI.month != null && UI.month < n ? UI.month : null;
  const pts = (arr, cls, name) => arr.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="${sel === i ? 6 : 4}" class="${cls}"><title>${d.months[i]} · ${name}: ${v}%</title></circle>${small && sel !== i ? "" : `<text x="${xs(i)}" y="${ys(v) - 10}" text-anchor="middle" class="lab ${cls}">${v}%</text>`}`).join("");
  const launch = 2.5;
  return `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly proposal win rate and price-related objections">
    ${[0, 10, 20, 30, 40].map(v => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${ys(v)}" y2="${ys(v)}" class="gl"/><text x="${pad.l - 8}" y="${ys(v) + 4}" text-anchor="end" class="ax">${v}%</text>`).join("")}
    ${d.months.map((mo, i) => `<rect x="${xs(i) - 24}" y="${pad.t}" width="48" height="${H - pad.t - pad.b}" class="hit ${sel === i ? "sel" : ""}" data-act="month" data-i="${i}"><title>${mo}: win rate ${d.win[i]}%, price objections ${d.objectionSeries[i]}%</title></rect><text x="${xs(i)}" y="${H - 12}" text-anchor="${i === n - 1 ? "end" : i === 0 ? "start" : "middle"}" class="ax ${sel === i ? "axsel" : ""}">${mo.slice(0, 3)}</text>`).join("")}
    <line x1="${xs(launch)}" x2="${xs(launch)}" y1="${pad.t}" y2="${H - pad.b}" class="ev"/><text x="${xs(launch) - 4}" y="${H - pad.b - 8}" text-anchor="end" class="ax evl">Valtora launch</text>
    ${show.win ? `<line x1="${pad.l}" x2="${W - pad.r}" y1="${ys(35)}" y2="${ys(35)}" class="tg"/><text x="${((xs(0) + xs(1)) / 2).toFixed(1)}" y="${ys(35) - 6}" text-anchor="middle" class="ax tgl">Win-rate target 35%</text>` : ""}
    ${show.win ? `<path d="${path(d.win)}" class="s1"/>${pts(d.win, "s1", "Proposal win rate")}` : ""}${show.obj ? `<path d="${path(d.objectionSeries)}" class="s2"/>${pts(d.objectionSeries, "s2", "Price-related objections")}` : ""}
  </svg><div class="legend"><button class="lg ${show.win ? "on" : ""}" data-act="series" data-k="win" aria-pressed="${show.win}"><i class="s1"></i>Proposal win rate</button><button class="lg ${show.obj ? "on" : ""}" data-act="series" data-k="obj" aria-pressed="${show.obj}"><i class="s2"></i>Price-related objections</button><span class="muted">Hover for values · select a month</span></div>${monthDetail(d)}`;
}
function monthDetail(d) {
  const i = UI.month; if (i == null || i >= d.months.length) return "";
  const prev = i > 0 ? i - 1 : null, df = (a) => prev == null ? "" : ` <span class="${a[i] - a[prev] < 0 ? "neg" : a[i] - a[prev] > 0 ? "pos" : "muted"}">(${a[i] - a[prev] > 0 ? "+" : ""}${a[i] - a[prev]} pts vs ${d.months[prev]})</span>`;
  return `<div class="month-detail"><b>${d.months[i]}</b><span>Proposal win rate <b class="num">${d.win[i]}%</b>${df(d.win)}</span><span>Price-related objections <b class="num">${d.objectionSeries[i]}%</b>${df(d.objectionSeries)}</span><button class="btn ghost sm" data-act="month" data-i="${i}">Clear</button></div>`;
}
function compareBars(d, period) {
  const rows = [["Proposal win rate", [["Pre-launch", 32], ["June", 24], ...(period === "year" ? [["December", d.winRate.year]] : [])], 35], ["Price-related objections", [["Pre-launch", 18], ["June", 29], ...(period === "year" ? [["December", d.objections.year]] : [])], null]];
  return rows.map(([l, vals, tg]) => `<div class="cmp"><div class="row between small"><b>${l}</b><span class="num">${vals.map(v => `${v[1]}%`).join(" → ")}</span></div>
    ${vals.map(([lb, v], i) => `<div class="cmp-row"><span class="xs muted">${lb}</span><span class="cbar" title="${lb}: ${v}%"><i class="c${i}" style="width:${v * 2.5}%"></i>${tg ? `<b class="cbar-tg" style="left:${tg * 2.5}%" title="Target ${tg}%"></b>` : ""}</span><span class="num xs">${v}%</span></div>`).join("")}</div>`).join("");
}
function donut(value, label, cls, sub) {
  const R = 42, c = 2 * Math.PI * R, off = c * (1 - value / 100);
  return `<div class="donut ${cls}" title="${esc(label)}: ${value}%"><svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="${R}" class="d-bg"/><circle cx="55" cy="55" r="${R}" class="d-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 55 55)"/><text x="55" y="60" text-anchor="middle" class="d-v">${value}%</text></svg><b class="small">${esc(label)}</b><span class="xs muted">${esc(sub)}</span></div>`;
}
function gauge(value, target, label) {
  const pct = Math.min(1, value / target), a = Math.PI * (1 - pct), x = 60 + 46 * Math.cos(a), y = 60 - 46 * Math.sin(a);
  return `<div class="gauge" title="${esc(label)}: ${value}% of a ${target}% target"><svg width="120" height="74" viewBox="0 0 120 74" aria-hidden="true"><path d="M14 60 A46 46 0 0 1 106 60" class="g-bg"/><path d="M14 60 A46 46 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" class="g-fg"/><text x="60" y="58" text-anchor="middle" class="d-v">${value}%</text></svg><b class="small">${esc(label)}</b><span class="xs muted">Target ${target}% · gap ${target - value} pts</span></div>`;
}
function commercialOverview(r) {
  const period = currentPeriod(r), d = bizData(r), kp = kpisFor(period, r);
  if (period === "mid" && !r.r2.seenDashboard) { r.r2.seenDashboard = true; save(); }
  const pinfo = PERIODS_DASH.find(p => p.id === period);
  const filter = `<div class="period-filter" role="tablist" aria-label="Period">${PERIODS_DASH.map(p => { const ok = periodAvailable(p.id, r); return `<button role="tab" class="${period === p.id ? "on" : ""}" data-act="period" data-v="${p.id}" aria-selected="${period === p.id}" ${ok ? "" : `disabled title="Not yet available"`}>${ok ? "" : icon("lock", "i-xs")}${p.l}</button>`; }).join("")}</div>`;
  const focus = `<div class="focus-chips" role="group" aria-label="Focus">${FOCUS.map(([id, l]) => `<button class="${(UI.focus || "all") === id ? "on" : ""}" data-act="focus" data-v="${id}">${l}</button>`).join("")}</div>`;
  const head = `<div class="dash-bar"><div><h2>Commercial Performance</h2><span class="xs">${pinfo.l} · ${pinfo.sub}</span></div>${filter}</div>`;
  const alert = period !== "start" ? `<button class="alert-bar" data-act="kpiAlert" aria-expanded="${!!UI.alertOpen}">${icon("alert")}<span class="grow"><b>Business alert:</b> Valtora has introduced a lower-priced alternative to Customer360 and launched an aggressive campaign targeting NextWave's existing and potential customers.${UI.alertOpen ? `<span class="alert-more">Department indicators changed in June: qualified opportunities −12%, price-related objections 18% → 29%, proposal win rate 32% → 24%. Valtora is mentioned in 35% of active customer discussions.</span>` : ""}</span>${icon(UI.alertOpen ? "chevdown" : "chev", "i-sm")}</button>` : "";
  const kpis = `<div class="kpi-row">${kp.map(k => kpiCard(k, period)).join("")}</div>`;
  if (period === "start") return `<section class="dash">${head}<div class="dash-body stack">${focus}${kpis}
    <div class="dash-grid"><div class="card"><div class="card-h"><div><h3>${APP.cycleYear} commercial targets</h3><div class="xs muted">Set by the CEO for the Commercial Department</div></div><button class="btn ghost sm" data-act="go" data-go="profile/objectives">My objectives</button></div><div class="card-b stack-sm">
      ${CEO_OBJECTIVES.map(o => `<div class="target-row ${UI.focus && UI.focus !== "all" && !kp.some(k => k.obj === o.id && k.focus === UI.focus) ? "dim" : ""}"><span class="grow"><b class="small">${esc(o.title)}</b><span class="xs muted">${esc(o.kpi)}</span></span><span class="tag blue">${esc(o.target)}</span></div>`).join("")}
    </div></div>
    <div class="card"><div class="card-h"><h3>What happens next</h3></div><div class="card-b stack-sm small t2"><p>Results are published through the year. Actual figures appear here when they become available.</p><p class="xs muted">Company and department results describe the business. They are not evidence of any one employee's performance.</p></div></div></div>
  </div></section>`;
  const showConv = !UI.focus || ["all", "conversion"].includes(UI.focus), showMarket = !UI.focus || ["all", "market"].includes(UI.focus);
  const yr = period === "year";
  return `<section class="dash">${head}<div class="dash-body stack">${focus}${alert}${kpis}
    <div class="dash-grid">
      ${showConv ? `<div class="card"><div class="card-h"><h3>${UI.dashView === "compare" ? "Before and after the Valtora launch" : "Monthly trend"}</h3><div class="seg" role="tablist"><button class="${UI.dashView !== "compare" ? "on" : ""}" data-act="dashView" data-v="trend">Trend</button><button class="${UI.dashView === "compare" ? "on" : ""}" data-act="dashView" data-v="compare">Compare periods</button></div></div><div class="card-b stack">${UI.dashView === "compare" ? compareBars(d, period) : lineChart(d)}</div></div>` : ""}
      <div class="card"><div class="card-h"><h3>Against target</h3></div><div class="card-b vis-row">
        ${showConv ? gauge(yr ? d.winRate.year : d.winRate.mid, 35, `Win rate · ${yr ? "December" : "June"}`) : ""}
        ${showConv ? donut(yr ? d.objections.year : d.objections.mid, "Price-related objections", "dn-orange", "Share of recorded objections") : ""}
        ${showMarket && !yr ? donut(d.valtora.mid, "Valtora mentions", "dn-purple", "Share of active discussions") : ""}
        ${(UI.focus === "pipeline" || UI.focus === "all" || !UI.focus) ? `<div class="stat-tile"><span class="xs muted">Qualified opportunities</span><b class="num">${fmtPct(yr ? d.opps.year : d.opps.mid, true)}</b><span class="xs muted">vs pre-launch · target +20% vs 2026</span></div>` : ""}
        ${UI.focus === "growth" ? `<div class="stat-tile"><span class="xs muted">Revenue growth</span><b class="num">—</b><span class="xs muted">Not published in this update · target ≥ 15%</span></div>` : ""}
      </div></div>
    </div>
    <div class="card"><div class="card-h"><h3>Business insights</h3><span class="xs muted">${pinfo.sub}</span></div><div class="card-b insights">
      <div class="insight">${icon("alert", "i-sm")}<span><b>Competitive pressure.</b> Valtora's lower-priced Customer360 alternative coincides with the June drop in win rate and the rise in price-related objections.</span></div>
      ${yr ? `<div class="insight good">${icon("trend", "i-sm")}<span><b>Partial recovery by December.</b> Win rate ${d.winRate.year}% (June 24%), price-related objections ${d.objections.year}% (June 29%), qualified opportunities ${fmtPct(d.opps.year, true)} vs pre-launch (June −12%). ${esc(r.r3.dataset.business ? r.r3.dataset.business.response : "")}</span></div>` : ""}
      ${!yr && showMarket ? `<div class="insight neutral">${icon("log", "i-sm")}<span><b>Market intelligence (individual work evidence · Omar Hassan).</b> ${DASHBOARD.mi.map(x => esc(x.t)).join("; ")}.</span></div>` : ""}
      <div class="insight neutral">${icon("info", "i-sm")}<span>Company and department results reflect many factors. A drop in sales or win rate is not, on its own, evidence of an individual's performance.</span></div>
    </div></div>
  </div></section>`;
}

/* The detailed dashboard now lives on Home; keep the old route working. */
VIEWS.business = function () { setTimeout(() => go("home"), 0); return ""; };

/* ---------- Round 2 checklist & submission ---------- */
VIEWS.round2 = function () {
  const r = rec();
  if (r2Status(r) === "locked") return pageHead("Mid-year review", "Mid-year performance review") + lockedPanel("Not available yet", "The mid-year review opens at the mid-year checkpoint.");
  const items = [["Reviewed the mid-year business results on Home", r.r2.seenDashboard, "home"], ["Wrote your interpretation of the business data (below)", r.r2.interpretation.trim().length >= 15, "round2"], ["Talked with Omar about what has been happening", managerCount(r.r2.diag.log) >= CHAT_LIMITS.diagnosticMin, "chat"], ["Recorded evidence in the Evidence Log", r.evidence.length > 0, "evidence"]];
  const ok = items.every(x => x[1]), a = r.r2.assessment;
  return pageHead("Performance Management / Mid-year review", "Mid-year performance review", statusChip(r2Status(r)), "Omar Hassan · July 2027") + `<div class="stack-lg">
    <div class="card"><div class="card-h"><h3>Checklist</h3></div><div class="card-b checklist">${items.map(([l, done, goTo]) => `<button class="ck-row ${done ? "ok" : ""}" ${goTo === "chat" ? `data-act="openChat"` : `data-act="go" data-go="${goTo}"`}>${icon(done ? "check" : "info", "i-sm")}<span class="grow">${l}</span>${icon("chev", "i-sm")}</button>`).join("")}</div></div>
    <div class="card"><div class="card-h"><div><h3>Your interpretation of the business data</h3><div class="xs muted">What do the mid-year results show, and what do they not tell you?</div></div></div><div class="card-b">
      ${r.r2.submitted ? `<div class="small t2" style="white-space:pre-line">${esc(r.r2.interpretation) || "<span class='muted'>None written</span>"}</div>` : `<textarea class="ta" rows="4" id="${P("r2", "interpretation")}" ${bind(P("r2", "interpretation"))} maxlength="3000" placeholder="Summarise what the mid-year business results show, what may explain them, and what you still need to find out.">${esc(r.r2.interpretation)}</textarea>`}
    </div></div>
    ${r.r2.submitted ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">Mid-year review submitted.</span></div>${r.r2.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r2.error)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="round2">Retry assessment</button>` : ""}</div>` : ""}`
    : `<div class="card pad row between"><span class="small t2">${ok ? "Everything is ready. Submitting records your interpretation, the conversation with Omar and your Evidence Log." : "Complete the checklist to submit the mid-year review."}</span><button class="btn primary" data-act="submitR2" id="submit-r2" ${!ok || UI.busy ? "disabled" : ""}>${UI.busy === "round2" ? "Submitting…" : "Submit mid-year review"}</button></div>`}
  </div>`;
};
