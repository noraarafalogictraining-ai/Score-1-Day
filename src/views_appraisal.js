/* =========================================================
   ROUND 3 — YEAR-END UPDATE · FINAL APPRAISAL · BIAS REFLECTION
   ========================================================= */
function kvTable(rows) { return `<div class="table-wrap"><table class="tbl" style="min-width:0"><tbody>${rows.map(([k, v]) => `<tr><td style="width:38%"><b class="small">${esc(k)}</b></td><td class="small">${esc(v)}</td></tr>`).join("")}</tbody></table></div>`; }
function yearEndBody(d) {
  return `<div class="stack-lg">
    
    <div class="card"><div class="card-h"><h3>Market intelligence reporting</h3></div><div class="card-b">${kvTable(d.reporting)}</div></div>
    <div class="card"><div class="card-h"><h3>Commercial recommendations</h3></div><div class="card-b">${kvTable(d.recommendations)}</div></div>
    <div class="card"><div class="card-h"><h3>Stakeholder communication and collaboration</h3></div><div class="card-b stack">${kvTable(d.stakeholder)}
      <div class="stack-sm"><h4>Stakeholder comments</h4>${d.comments.map(([w, t]) => `<div class="small"><b>${esc(w)}:</b> <span class="t2">“${esc(t)}”</span></div>`).join("")}</div></div></div>
    <div class="card"><div class="card-h"><h3>Observed behaviours</h3></div><div class="card-b">${kvTable(d.behaviours)}</div></div>
    <div class="card"><div class="card-h"><h3>Development and Omar's view</h3></div><div class="card-b stack-sm"><p class="small t2">${esc(d.development)}</p><p class="small t2">${esc(d.own)}</p></div></div>
    <div class="card"><div class="card-h"><div><h3>Company-level results</h3><div class="xs muted">${esc(d.company.label)}</div></div></div><div class="card-b">${kvTable(d.company.rows)}</div></div>
  </div>`;
}
VIEWS.yearend = function () {
  const r = rec();
  if (r3Status(r) === "locked") return pageHead("My Inbox / Year-end update", "Year-End Performance Update") + lockedPanel("Not available yet", "The year-end update is published in December.");
  if (!r.r3.dataset) return pageHead("My Inbox / Year-end update", "Year-End Performance Update") + `<div class="card pad stack">${r.r3.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span>${esc(r.r3.error)}</span></div>` : `<p class="small t2">Loading the year-end update…</p>`}<div><button class="btn primary" data-act="loadYearEnd" id="load-yearend">Load year-end update</button></div></div>`;
  return pageHead("My Inbox / Year-end update", "Year-End Performance Update — Omar Hassan", `<button class="btn" data-act="go" data-go="inbox/yearend">${icon("back", "i-sm")} Back to email</button><button class="btn primary" data-act="go" data-go="appraisal">${icon("clipboard", "i-sm")} Open appraisal</button>`, `${APP.cycleLabel} · Compare these results with the objectives and competencies agreed in January.`) + yearEndBody(r.r3.dataset);
};

function rateSeg(path, cur, err) {
  return `<div class="rate ${err ? "err" : ""}" role="radiogroup">${[...RATING_SCALE].reverse().map(x => `<button role="radio" aria-checked="${cur === x.v}" class="${cur === x.v ? "on" : ""}" data-act="rate" data-path="${path}" data-v="${x.v}"><b>${x.v}</b>${x.l}</button>`).join("")}</div>`;
}
function rateRO(v) { return v ? `<div><span class="tag blue">${esc(ratingLabel(v))}</span></div>` : `<span class="muted small">Not rated</span>`; }
const apEditable = (r = rec()) => ["not_started", "draft"].includes(r.r3.appraisal.status) && !r.r3.done;

VIEWS.appraisal = function () {
  const r = rec(), E = EMP(), st = appraisalStatus(r);
  if (r3Status(r) === "locked") return pageHead(`Final Appraisal / ${esc(E.name)}`, "Year-End Performance Appraisal", empChip()) + lockedPanel("Not yet open", "The year-end appraisal opens in December, together with the year-end performance update.");
  if (!r.r3.dataset) return pageHead(`Final Appraisal / ${esc(E.name)}`, "Year-End Performance Appraisal", empChip()) + lockedPanel("Year-end update not received", "The appraisal opens with the year-end performance update from HR.") + `<div style="margin-top:12px"><button class="btn primary" data-act="go" data-go="inbox/yearend">Open HR email</button></div>`;
  const ed = apEditable(r), c = appraisalCalc(r), C = APPRAISAL_CONFIG, tab = ["how", "summary"].includes(UI.apTab) ? UI.apTab : "what";
  const pct = (v) => v == null ? "—" : `${v}%`;
  const cards = `<div class="ap-summary">
    <div class="ap-sc what"><span class="xs">WHAT Achievement</span><b class="num">${c.whatPct != null ? c.whatPct + "%" : c.objDone ? c.whatPartial + "%" : "—"}</b><span class="xs">${c.whatPct != null ? `Contributes ${c.whatContrib} of ${C.whatWeight} points` : `${c.objDone} of ${c.objectives.length} objectives assessed`}</span></div>
    <div class="ap-sc how"><span class="xs">HOW Achievement</span><b class="num">${pct(c.howPct)}</b><span class="xs">${c.howPct != null ? `Contributes ${c.howContrib} of ${C.howWeight} points` : `${c.rated} of ${c.comps.length} competencies rated`}</span></div>
    <div class="ap-sc overall"><span class="xs">Overall Performance Score</span><b class="num">${c.overall != null ? c.overall : "—"}<small>/100</small></b><span class="xs">WHAT ${C.whatWeight}% · HOW ${C.howWeight}%</span></div>
  </div>`;
  const tabs = [["what", `WHAT — Performance Objectives (${C.whatWeight}%)`], ["how", `HOW — Competencies (${C.howWeight}%)`], ["summary", "Final Performance Summary"]];
  return pageHead(`Performance Management / Final Appraisal`, `Final Appraisal · ${esc(E.name)}`, `${statusChip(st)}<button class="btn" data-act="evDrawer" data-id="all">${icon("log", "i-sm")} Evidence</button>`, `${APP.cycleLabel} · Results against the plan agreed in January.`) + `
  <div class="stack">
    ${r.r3.appraisal.revisions && ed ? `<div class="notice warn">${icon("edit", "i-sm")}<span>You are reconsidering the appraisal. Update it, then submit the revision.</span></div>` : ""}
    ${!ed ? appraisalStatusNotice(r) : ""}
    ${cards}
    <div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button class="tab ${tab === id ? "on" : ""}" role="tab" aria-selected="${tab === id}" data-act="apTab" data-v="${id}">${l}</button>`).join("")}</div>
    ${tab === "how" ? apHow(r, c, ed) : tab === "summary" ? apSummary(r, c, ed) : apWhat(r, c, ed)}
  </div>`;
};
function apWhat(r, c, ed) {
  const open = UI.apOpen === undefined ? (c.objectives[0] && c.objectives[0].o.id) : UI.apOpen;
  return `<div class="stack-sm">${c.objectives.map((x, oi) => {
    const isOpen = open === x.o.id, base = P("r3", "appraisal", "what", x.o.id, "kpis");
    return `<section class="ap-obj ${isOpen ? "open" : ""}" id="apobj-${x.o.id}">
      <button class="ap-obj-h" data-act="apOpen" data-id="${x.o.id}" aria-expanded="${isOpen}"><span class="goal-n">${oi + 1}</span><span class="grow"><b>${esc(x.o.objective)}</b><span class="xs muted">${plural(x.rows.length, "KPI", "KPIs")}${x.rows.length > 1 ? ` · ${Math.round(100 / x.rows.length * 10) / 10}% each` : ""}</span></span><span class="tag">Weight ${x.weight}%</span><span class="ap-ach ${x.ach == null ? "na" : ""}">${x.ach == null ? "—" : x.ach + "%"}</span>${icon("chevdown", "i-sm")}</button>
      ${isOpen ? `<div class="ap-obj-b">
        <div class="xs muted">January KPI: <span class="t2">“${esc(x.o.kpi)}”</span></div>
        ${x.rows.map(y => kpiRow(y, base, ed)).join("")}
        <div class="ap-obj-f"><span>Objective achievement <b class="num">${x.ach == null ? "—" : x.ach + "%"}</b></span><span>× weight ${x.weight}% = <b class="num">${x.contrib == null ? "—" : x.contrib + " pts"}</b> towards WHAT</span></div>
      </div>` : ""}
    </section>`; }).join("")}
    <p class="xs muted">KPIs are taken from the January KPI text. Several measurable targets in one KPI are treated as separate KPIs with equal shares. KPI achievement is capped at ${APPRAISAL_CONFIG.kpiCap}%.</p></div>`;
}
function kpiRow(y, base, ed) {
  const k = y.k, e = y.e, p = `${base}.${y.i}`, type = e.type || k.type, dir = e.dir || k.dir, res = y.res;
  const mode = type === "review" ? "review" : dir;
  const sel = ed ? `<select class="sel sm" data-kpi-mode="${p}" aria-label="How this KPI is measured">${[["higher", "Higher is better"], ["lower", "Lower is better"], ["review", "Manager review"]].map(([v, l]) => `<option value="${v}" ${mode === v ? "selected" : ""} ${v !== "review" && k.target == null ? "disabled" : ""}>${l}</option>`).join("")}</select>` : `<span class="tag">${mode === "review" ? "Manager review" : mode === "lower" ? "Lower is better" : "Higher is better"}</span>`;
  const inputErr = res.status === "invalid" ? "err" : "";
  return `<div class="kpi-item ${type === "review" ? "flagged" : ""}">
    <div class="kpi-item-h"><span class="kpi-num">KPI ${y.i + 1}</span><span class="grow small">${esc(k.name)}</span>${y.share < 100 ? `<span class="xs muted">${Math.round(y.share * 10) / 10}% of objective</span>` : ""}</div>
    ${type === "review" ? `<div class="kpi-flag">${icon("alert", "i-xs")} Flagged for review: ${esc(k.reason || "measured by manager judgment")}</div>` : ""}
    <div class="kpi-grid">
      <div class="kg"><span class="kg-l">Target</span><b class="kg-target">${esc(fmtTarget(k))}</b><span class="xs muted">From January · locked</span></div>
      <div class="kg"><span class="kg-l">${type === "review" ? "Assessed achievement %" : "Actual result"}</span>${ed ? (type === "review" ? `<input class="inp ${inputErr}" inputmode="decimal" id="${p}.manual" ${bind(p + ".manual")} value="${esc(e.manual || "")}" placeholder="0–${APPRAISAL_CONFIG.kpiCap}">` : `<input class="inp ${inputErr}" inputmode="decimal" id="${p}.actual" ${bind(p + ".actual")} value="${esc(e.actual || "")}" placeholder="${k.unit === "%" ? "e.g. 92%" : k.unit ? `e.g. 4.1${k.unit}` : "e.g. 7"}">`) : `<b>${esc(type === "review" ? (e.manual ? e.manual + "%" : "—") : (e.actual || "—"))}</b>`}${res.status === "invalid" ? `<span class="err-text">${esc(res.note)}</span>` : ""}</div>
      <div class="kg"><span class="kg-l">Achievement</span><b class="kg-ach ${res.pct == null ? "na" : res.pct >= 100 ? "good" : "low"}">${res.pct == null ? "—" : res.pct + "%"}</b><span class="xs muted">${res.status === "ok" ? esc(res.note) : ""}</span></div>
      <div class="kg"><span class="kg-l">Measure</span>${sel}</div>
    </div>
    <div class="field"><label class="lbl" for="${p}.evidence">Supporting evidence <span class="req">*</span></label>${ed ? `<textarea class="ta" rows="2" id="${p}.evidence" ${bind(p + ".evidence")} placeholder="Which year-end evidence or Evidence Log entries support this result?">${esc(e.evidence || "")}</textarea>` : `<div class="small t2">${esc(e.evidence || "—")}</div>`}</div>
  </div>`;
}
function apHow(r, c, ed) {
  const a = r.r3.appraisal, open = UI.compOpen === undefined ? (r.goals.comps[0] && r.goals.comps[0].id) : UI.compOpen;
  return `<div class="stack-sm">${r.goals.comps.map(k => {
    const x = a.how[k.id] || {}, isOpen = open === k.id, base = P("r3", "appraisal", "how", k.id), t = a.tried;
    return `<section class="ap-obj ${isOpen ? "open" : ""}"><button class="ap-obj-h" data-act="compOpen" data-id="${k.id}" aria-expanded="${isOpen}"><span class="goal-n">${icon("layers", "i-xs")}</span><span class="grow"><b>${esc(compName(k.id))}</b><span class="xs muted">Expected level: ${levelLabel(k.level)}</span></span><span class="ap-ach ${x.rating ? "" : "na"}">${x.rating ? `${x.rating}/5` : "—"}</span>${icon("chevdown", "i-sm")}</button>
      ${isOpen ? `<div class="ap-obj-b">
        <div class="std-box"><span class="kg-l">Expected behavioral standard (January)</span><div class="small">${k.standard ? esc(k.standard) : "<span class='muted'>None written</span>"}</div></div>
        <div class="field"><label class="lbl" for="${base}.observed">Observed behavior <span class="req">*</span></label>${ed ? `<textarea class="ta" rows="2" id="${base}.observed" ${bind(base + ".observed")} placeholder="What did Omar actually do? Use the year-end evidence and your Evidence Log.">${esc(x.observed || "")}</textarea>` : `<div class="small t2">${esc(x.observed || "—")}</div>`}</div>
        <div class="field"><span class="lbl">Performance rating (1–5) <span class="req">*</span></span>${ed ? rateSeg(base + ".rating", x.rating, t && !x.rating) : rateRO(x.rating)}<span class="hint">Rate the behavior against the agreed standard and the expected ${levelLabel(k.level)} level.</span></div>
        <div class="field"><label class="lbl" for="${base}.just">Supporting evidence and justification <span class="req">*</span></label>${ed ? `<textarea class="ta" rows="2" id="${base}.just" ${bind(base + ".just")}>${esc(x.just || "")}</textarea>` : `<div class="small t2">${esc(x.just || "—")}</div>`}</div>
      </div>` : ""}</section>`; }).join("")}
    <p class="xs muted">HOW Achievement = average rating ÷ ${APPRAISAL_CONFIG.howScale} × 100.</p></div>`;
}
function apSummary(r, c, ed) {
  const a = r.r3.appraisal, C = APPRAISAL_CONFIG, v = appraisalValidation(r), ta = (path, val, ph, rows = 2) => ed ? `<textarea class="ta" rows="${rows}" id="${path}" ${bind(path)} placeholder="${ph}">${esc(val || "")}</textarea>` : `<div class="small t2">${esc(val || "—")}</div>`;
  const row = (l, ach, w, contrib) => `<tr><td>${l}</td><td class="num">${ach == null ? "—" : ach + "%"}</td><td class="num">${w}%</td><td class="num"><b>${contrib == null ? "—" : contrib}</b></td></tr>`;
  return `<div class="stack">
    <div class="card"><div class="card-h"><h3>Score calculation</h3></div><div class="card-b"><div class="table-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Component</th><th>Achievement</th><th>Weight</th><th>Contribution</th></tr></thead><tbody>
      ${row("WHAT — Performance Objectives", c.whatPct, C.whatWeight, c.whatContrib)}${row("HOW — Competencies", c.howPct, C.howWeight, c.howContrib)}
      <tr class="total"><td><b>Overall Performance Score</b></td><td></td><td class="num">100%</td><td class="num"><b>${c.overall == null ? "—" : c.overall + " / 100"}</b></td></tr>
    </tbody></table></div>
    <details class="xs muted" style="margin-top:8px"><summary style="cursor:pointer">How it is calculated</summary><p style="margin-top:6px">KPI achievement = actual ÷ target × 100 (lower-is-better: target ÷ actual × 100), capped at ${C.kpiCap}%. Objective achievement = average of its KPIs (equal shares). WHAT = Σ objective achievement × objective weight. HOW = average competency rating ÷ ${C.howScale} × 100. Overall = WHAT × ${C.whatWeight}% + HOW × ${C.howWeight}%. Blank results are never treated as zero.</p></details></div></div>
    <div class="card"><div class="card-b stack">
      <div class="grid2"><div class="field"><label class="lbl" for="${P("r3", "appraisal", "overall", "strengths")}">Key strengths <span class="req">*</span></label>${ta(P("r3", "appraisal", "overall", "strengths"), a.overall.strengths, "")}</div>
      <div class="field"><label class="lbl" for="${P("r3", "appraisal", "overall", "dev")}">Development priorities <span class="req">*</span></label>${ta(P("r3", "appraisal", "overall", "dev"), a.overall.dev, "")}</div></div>
      <div class="field"><label class="lbl" for="${P("r3", "appraisal", "overall", "just")}">Evidence-based overall justification <span class="req">*</span></label>${ta(P("r3", "appraisal", "overall", "just"), a.overall.just, "What does the score reflect? Cite the evidence that matters most.", 3)}</div>
    </div></div>
    ${ed ? `<div class="card"><div class="card-b stack">
      ${v.ok ? `<div class="notice good">${icon("check", "i-sm")}<span>Everything required is complete.</span></div>` : `<div class="notice warn">${icon("alert", "i-sm")}<div class="stack-sm"><b>Complete before submitting (${v.errors.length}):</b><ul class="list-plain">${v.errors.slice(0, 12).map(e => `<li>${esc(e)}</li>`).join("")}${v.errors.length > 12 ? `<li>…and ${v.errors.length - 12} more</li>` : ""}</ul></div></div>`}
      <div class="row between"><span class="xs muted">Your progress saves automatically. ${r.r3.appraisal.revisions ? "Submitting records the revised appraisal." : "Submitting shares the appraisal with Omar."}</span><button class="btn primary" data-act="submitAppraisal" id="submit-appraisal" ${v.ok && !UI.busy ? "" : "disabled"}>${icon("send", "i-sm")} ${r.r3.appraisal.revisions ? "Submit revised appraisal" : "Submit appraisal"}</button></div>
    </div></div>` : ""}
  </div>`;
}
function appraisalStatusNotice(r) {
  if (r.r3.done) return `<div class="notice good">${icon("check", "i-sm")}<span>The appraisal is final and recorded.</span></div>`;
  if (r.r3.conv.ended) return `<div class="notice">${icon("info", "i-sm")}<span class="grow">Appraisal shared with Omar.</span><button class="btn sm primary" data-act="go" data-go="reflection">Bias reflection</button></div>`;
  const replied = r.r3.conv.log.some(m => m.from === "employee"), answered = managerCount(r.r3.conv.log) >= CHAT_LIMITS.appraisalMin;
  return `<div class="notice">${icon("chat", "i-sm")}<span class="grow">${replied ? "Omar has replied about the appraisal. Discuss it with him in the chat." : "Appraisal shared with Omar. Waiting for his reply…"}</span>${replied ? `<button class="btn sm" data-act="openChat">Open chat</button>` : ""}${answered ? `<button class="btn sm primary" data-act="appraisalContinue" id="appraisal-continue">Continue to bias reflection</button>` : ""}</div>`;
}
DRAWERS.evidence = function (d) {
  const r = rec(), list = r.evidence.filter(e => d.id === "all" || e.link === d.id);
  return `<div class="drawer-scrim" data-act="closeDrawer"></div><aside class="drawer wide" role="dialog" aria-label="Evidence"><div class="drawer-h"><h3>Evidence</h3><button class="icon-btn" data-act="closeDrawer" aria-label="Close">${icon("x")}</button></div>
    <div class="drawer-b"><h4>Your Evidence Log (${list.length})</h4>${list.length ? list.map(e => `<div class="ev-card"><div class="row between"><span class="tag">${esc(e.period)}</span><span class="xs muted">${esc(e.source === "Other" ? e.sourceOther : e.source)} · ${esc(e.status)}</span></div><div class="xs muted">${esc(linkLabel(e.link))}</div><div>${esc(e.text)}</div>${e.impact ? `<div class="xs"><span class="muted">Impact:</span> ${esc(e.impact)}</div>` : ""}${e.action ? `<div class="xs"><span class="muted">Action:</span> ${esc(e.action)}</div>` : ""}</div>`).join("") : `<p class="small muted">No entries.</p>`}
    ${r.r3.dataset ? `<h4 style="margin-top:10px">Year-end performance update</h4>${yearEndBody(r.r3.dataset)}` : ""}</div></aside>`;
};

/* ---------- Bias reflection ---------- */
VIEWS.reflection = function () {
  const r = rec(), b = r.r3.bias;
  if (!r.r3.conv.ended) return pageHead("Final Appraisal", "Bias reflection") + lockedPanel("Not yet", "The bias reflection follows the appraisal conversation with Omar.");
  const res = b.result, busy = UI.busy === "bias" || UI.busy === "round3";
  return pageHead("Final Appraisal / Bias reflection", "Appraisal bias reflection", empChip(), "A short check on possible rating biases before your appraisal is final.") + `<div class="stack-lg">
    <div class="card"><div class="card-h"><h3>What your reasoning suggests</h3>${res && aiReady() && !r.r3.done ? `<button class="btn ghost sm" data-act="runBias">Check again</button>` : ""}</div><div class="card-b stack">
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
      ${r.r3.final.error ? `<div class="notice risk">${icon("alert", "i-sm")}<span class="grow">${esc(r.r3.final.error)}</span>${aiReady() ? `<button class="btn sm" data-act="assessRetry" data-k="round3">Retry assessment</button>` : ""}</div>` : ""}
      ${r.r3.done ? `<div class="row between"><span class="small t2">${icon("check", "i-sm")} Appraisal final.</span><button class="btn primary sm" data-act="go" data-go="review">View feedback report</button></div>` : `<div class="row between"><button class="btn" data-act="reconsider" id="reconsider">${icon("edit", "i-sm")} Reconsider the appraisal</button><button class="btn primary" data-act="finalize" id="finalize" ${busy ? "disabled" : ""}>${UI.busy === "round3" ? "Assessing…" : "Finalise appraisal"}</button></div>`}
    </div></div>
  </div>`;
};
