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
  const a = r.r3.appraisal, ed = apEditable(r), t = a.tried, g = r.goals;
  const wE = (o, k) => t && !String((a.what[o.id] || {})[k] || "").trim();
  const hE = (c, k) => t && !String((a.how[c.id] || {})[k] || "").trim();
  const ta = (path, v, ph, err, rows = 2) => ed ? `<textarea class="ta ${err ? "err" : ""}" rows="${rows}" id="${path}" ${bind(path)} placeholder="${ph}">${esc(v || "")}</textarea>` : `<div class="small t2">${v ? esc(v) : "<span class='muted'>—</span>"}</div>`;
  const v = appraisalValidation(r);
  return pageHead(`Final Appraisal / ${esc(E.name)}`, "Year-End Performance Appraisal", `${statusChip(st)}<button class="btn" data-act="evDrawer" data-id="all">${icon("log", "i-sm")} Evidence</button>`, `${APP.cycleLabel} · Evaluate against the plan agreed in January.`) + `
  <div class="stack-lg">
    ${a.revisions && ed ? `<div class="notice warn">${icon("edit", "i-sm")}<span>You are reconsidering the appraisal. Update it, then submit the revision.</span></div>` : ""}
    ${!ed ? appraisalStatusNotice(r) : ""}
    <section class="stack ap-sec" id="sec-a"><div class="row between"><h2>WHAT · Results</h2><span class="xs muted">${plural(g.objectives.length, "objective", "objectives")} from the agreed plan</span></div>
      ${g.objectives.map((o, i) => { const x = a.what[o.id] || {}, base = P("r3", "appraisal", "what", o.id); return `<div class="ap-item">
        <div class="ap-item-h"><div class="grow"><div class="xs muted">Objective ${i + 1} · Weight ${num(o.weight)}%</div><b>${esc(o.objective)}</b><div class="small t2" style="margin-top:3px"><span class="muted">KPI:</span> ${esc(o.kpi)}</div></div></div>
        <div class="ap-item-b">
          <div class="field full"><label class="lbl" for="${base}.actual">Actual result / relevant evidence <span class="req">*</span></label>${ta(base + ".actual", x.actual, "What the year-end evidence shows for this KPI. Note any limitation or missing information.", wE(o, "actual"))}</div>
          <div class="field full"><span class="lbl">Manager rating (1–5) <span class="req">*</span></span>${ed ? rateSeg(base + ".rating", x.rating, t && !x.rating) : rateRO(x.rating)}</div>
          <div class="field full"><label class="lbl" for="${base}.just">Justification <span class="req">*</span></label>${ta(base + ".just", x.just, "Why this rating, based on the evidence?", wE(o, "just"))}</div>
        </div></div>`; }).join("")}
    </section>
    <section class="stack ap-sec" id="sec-b"><div class="row between"><h2>HOW · Competencies</h2><span class="xs muted">${plural(g.comps.length, "competency", "competencies")} from the agreed plan</span></div>
      ${g.comps.map(c => { const L = competencyById(S.emp, c.id) || { name: "Competency", levels: {} }, x = a.how[c.id] || {}, base = P("r3", "appraisal", "how", c.id); return `<div class="ap-item">
        <div class="ap-item-h"><div class="grow stack-sm" style="gap:4px"><div class="row" style="gap:8px"><b>${esc(L.name)}</b><span class="tag blue">Expected level: ${levelLabel(c.level)}</span></div>
          <div class="small t2"><span class="muted">Expected behavioral standard:</span> ${c.standard ? esc(c.standard) : "<span class='muted'>None</span>"}</div></div></div>
        <div class="ap-item-b">
          <div class="field full"><label class="lbl" for="${base}.observed">Observed behaviour <span class="req">*</span></label>${ta(base + ".observed", x.observed, "What did Omar do that you or others observed?", hE(c, "observed"))}</div>
          <div class="field full"><span class="lbl">Manager rating (1–5) <span class="req">*</span></span>${ed ? rateSeg(base + ".rating", x.rating, t && !x.rating) : rateRO(x.rating)}<span class="hint">The rating is how well Omar performed against the expected level, not the level itself.</span></div>
          <div class="field full"><label class="lbl" for="${base}.just">Justification <span class="req">*</span></label>${ta(base + ".just", x.just, "How does the observed behaviour compare with the expected standard?", hE(c, "just"))}</div>
        </div></div>`; }).join("")}
    </section>
    <section class="stack ap-sec" id="sec-c"><h2>Overall appraisal</h2>
      <div class="card"><div class="card-b stack">
        <div class="grid2">
          <div class="field"><span class="lbl">Overall WHAT rating <span class="req">*</span></span>${ed ? rateSeg(P("r3", "appraisal", "overall", "what"), a.overall.what, t && !a.overall.what) : rateRO(a.overall.what)}</div>
          <div class="field"><span class="lbl">Overall HOW rating <span class="req">*</span></span>${ed ? rateSeg(P("r3", "appraisal", "overall", "how"), a.overall.how, t && !a.overall.how) : rateRO(a.overall.how)}</div>
        </div>
        <div class="field"><span class="lbl">Overall performance rating <span class="req">*</span></span>${ed ? rateSeg(P("r3", "appraisal", "overall", "final"), a.overall.final, t && !a.overall.final) : rateRO(a.overall.final)}</div>
        <div class="grid2">
          <div class="field"><label class="lbl" for="${P("r3", "appraisal", "overall", "strengths")}">Key strengths <span class="req">*</span></label>${ta(P("r3", "appraisal", "overall", "strengths"), a.overall.strengths, "", t && !a.overall.strengths.trim())}</div>
          <div class="field"><label class="lbl" for="${P("r3", "appraisal", "overall", "dev")}">Development priorities <span class="req">*</span></label>${ta(P("r3", "appraisal", "overall", "dev"), a.overall.dev, "", t && !a.overall.dev.trim())}</div>
        </div>
        <div class="field"><label class="lbl" for="${P("r3", "appraisal", "overall", "just")}">Evidence-based justification <span class="req">*</span></label>${ta(P("r3", "appraisal", "overall", "just"), a.overall.just, "Why is this the right overall rating? Cite the evidence that decided it.", t && !a.overall.just.trim(), 3)}</div>
      </div></div>
    </section>
    ${ed ? `<div class="card"><div class="card-b stack">
      ${t && !v.ok ? `<div class="notice risk">${icon("alert", "i-sm")}<div class="stack-sm"><b>Complete the following before submitting:</b><ul class="list-plain">${v.errors.map(e => `<li>${esc(e)}</li>`).join("")}</ul></div></div>` : ""}
      <div class="row between"><span class="xs muted">Your draft saves automatically. ${a.revisions ? "Submitting records the revised appraisal." : "Submitting shares the appraisal with Omar."}</span><button class="btn primary" data-act="submitAppraisal" id="submit-appraisal" ${UI.busy ? "disabled" : ""}>${icon("send", "i-sm")} ${a.revisions ? "Submit revised appraisal" : "Submit appraisal"}</button></div>
    </div></div>` : ""}
  </div>`;
};
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
