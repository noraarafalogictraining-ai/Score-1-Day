/* =========================================================
   FINAL PERFORMANCE APPRAISAL (SCORE Round 2) + POST-APPRAISAL REFLECTION
   ========================================================= */
function rateSeg(path, cur, err) {
  return `<div class="rate ${err ? "err" : ""}" role="radiogroup">${[...RATING_SCALE].reverse().map(x => `<button role="radio" aria-checked="${cur === x.v}" class="${cur === x.v ? "on" : ""}" data-act="rate" data-path="${path}" data-v="${x.v}"><b>${x.v}</b>${x.l}</button>`).join("")}</div>`;
}
function rateRO(v) { return v ? `<div><span class="tag blue">${esc(ratingLabel(v))}</span></div>` : `<span class="muted small">Not rated</span>`; }
const apEditable = (r = rec()) => r.appraisal.status === "not_started" || r.appraisal.status === "draft";

VIEWS.appraisal = function () {
  if (!S.emp) return pageHead("Final Appraisal", "Final Appraisal") + needEmp();
  const r = rec(), E = EMP(), st = appraisalStatus(r);
  if (!goalsApproved(r)) return pageHead(`Final Appraisal / ${esc(E.name)}`, "Year-End Performance Appraisal", empChip()) + lockedPanel("Not yet open", "The appraisal is built from the approved performance contract.");
  if (st === "locked") return pageHead(`Final Appraisal / ${esc(E.name)}`, "Year-End Performance Appraisal", empChip()) + releaseGate("yearend", "The year-end appraisal opens after the intervention activity", "Your facilitator will run the intervention discussion and hand out the year-end evidence in the room, then open the appraisal.");
  const a = r.appraisal, ed = apEditable(r), t = a.tried, g = r.goals;
  const wE = (o, k) => t && !((a.what[o.id] || {})[k] || "").toString().trim();
  const hE = (c, k) => t && !((a.how[c.id] || {})[k] || "").toString().trim();
  const ta = (path, v, ph, err, rows = 2) => ed ? `<textarea class="ta ${err ? "err" : ""}" rows="${rows}" id="${path}" ${bind(path)} placeholder="${ph}">${esc(v || "")}</textarea>` : `<div class="small t2">${v ? esc(v) : "<span class='muted'>—</span>"}</div>`;
  const evBtn = (id) => { const n = r.evidence.filter(e => e.link === id).length; return `<button class="btn ghost sm" data-act="evDrawer" data-id="${id}">${icon("log", "i-sm")} Evidence (${n})</button>`; };
  const v = appraisalValidation(r);
  return pageHead(`Final Appraisal / ${esc(E.name)}`, "Year-End Performance Appraisal", `${statusChip(st)}<button class="btn" data-act="evDrawer" data-id="all">${icon("log", "i-sm")} Evidence Log (${r.evidence.length})</button>`, `${APP.cycleLabel} · <span class="round-tag">SCORE Round 2</span> · Evaluate against the expectations agreed at the start of the year.`) + `
  <div class="stack-lg">
    ${a.revising && ed ? `<div class="notice warn">${icon("edit", "i-sm")}<span>You chose to revise the evaluation after ${esc(E.first)}'s feedback. Update it, then submit again.</span></div>` : ""}
    ${!ed ? `<div class="notice ${r.reflection.done ? "good" : ""}">${icon(r.reflection.done ? "check" : "info", "i-sm")}<span>${r.reflection.done ? "The appraisal is complete and recorded." : `Appraisal submitted. ${esc(E.first)} has responded: <button class="btn ghost sm" data-act="go" data-go="conversations/appraisal">open the conversation</button>`}</span></div>` : ""}
    <div class="tabs">${[["sec-a", "A · WHAT: Performance Results"], ["sec-b", "B · HOW: Competencies"], ["sec-c", "C · Overall Evaluation"]].map(([id, l]) => `<button class="tab" data-act="jump" data-id="${id}">${l}</button>`).join("")}</div>
    <section class="stack ap-sec" id="sec-a"><div class="row between"><h2>Section A · WHAT: Performance Results</h2><span class="xs muted">${plural(g.objectives.length, "objective", "objectives")} from the approved plan</span></div>
      ${g.objectives.map((o, i) => { const x = a.what[o.id] || {}, base = P("appraisal", "what", o.id); return `<div class="ap-item" id="ap-${o.id}">
        <div class="ap-item-h"><div class="grow"><div class="xs muted">Objective ${i + 1} · Weight ${num(o.weight)}%</div><b>${esc(o.objective)}</b><div class="small t2" style="margin-top:3px"><span class="muted">KPI:</span> ${esc(o.kpi)}</div></div>${evBtn(o.id)}</div>
        <div class="ap-item-b">
          <div class="field full"><label class="lbl" for="${base}.actual">Actual performance <span class="req">*</span></label>${ta(base + ".actual", x.actual, "What was actually achieved against the KPI, from your evidence.", wE(o, "actual"))}</div>
          <div class="field full"><span class="lbl">Performance rating <span class="req">*</span></span>${ed ? rateSeg(base + ".rating", x.rating, t && !x.rating) : rateRO(x.rating)}</div>
          <div class="field full"><label class="lbl" for="${base}.just">Supporting evidence / justification <span class="req">*</span></label>${ta(base + ".just", x.just, "Which documented evidence supports this rating?", wE(o, "just"))}</div>
        </div></div>`; }).join("")}
    </section>
    <section class="stack ap-sec" id="sec-b"><div class="row between"><h2>Section B · HOW: Competency Evaluation</h2><span class="xs muted">${plural(g.comps.length, "competency", "competencies")} from the approved plan</span></div>
      ${g.comps.map(c => { const L = competencyById(S.emp, c.id) || { name: "Competency", description: "", levels: {} }, x = a.how[c.id] || {}, base = P("appraisal", "how", c.id), lv = LEVELS.find(l => l.id === c.level); return `<div class="ap-item" id="ap-${c.id}">
        <div class="ap-item-h"><div class="grow stack-sm" style="gap:4px"><div class="row" style="gap:8px"><b>${esc(L.name)}</b><span class="tag blue">Expected: ${lv ? lv.l : "—"}</span></div><div class="small">${phBlock(L.description)}</div>
          <div class="small"><span class="muted">Expected behaviours:</span> ${(L.levels[c.level] || []).map(phBlock).join("")}</div>
          <div class="small t2"><span class="muted">Agreed standard:</span> ${c.standard ? esc(c.standard) : "<span class='muted'>None added</span>"}</div></div>${evBtn(c.id)}</div>
        <div class="ap-item-b">
          <div class="field full"><label class="lbl" for="${base}.observed">Observed behaviours <span class="req">*</span></label>${ta(base + ".observed", x.observed, "What did you see or hear during the year?", hE(c, "observed"))}</div>
          <div class="field full"><span class="lbl">Performance rating <span class="req">*</span></span>${ed ? rateSeg(base + ".rating", x.rating, t && !x.rating) : rateRO(x.rating)}</div>
          <div class="field full"><label class="lbl" for="${base}.just">Supporting justification <span class="req">*</span></label>${ta(base + ".just", x.just, "How do the observed behaviours compare with the expected level and standard?", hE(c, "just"))}</div>
        </div></div>`; }).join("")}
    </section>
    <section class="stack ap-sec" id="sec-c"><h2>Section C · Overall Performance Evaluation</h2>
      <div class="card"><div class="card-b stack">
        <div class="grid2">
          <div class="field"><span class="lbl">Overall WHAT rating <span class="req">*</span></span>${ed ? rateSeg(P("appraisal", "overall", "what"), a.overall.what, t && !a.overall.what) : rateRO(a.overall.what)}</div>
          <div class="field"><span class="lbl">Overall HOW rating <span class="req">*</span></span>${ed ? rateSeg(P("appraisal", "overall", "how"), a.overall.how, t && !a.overall.how) : rateRO(a.overall.how)}</div>
        </div>
        <div class="field"><span class="lbl">Final overall performance rating <span class="req">*</span></span>${ed ? rateSeg(P("appraisal", "overall", "final"), a.overall.final, t && !a.overall.final) : rateRO(a.overall.final)}<span class="hint">Use your professional judgment based on the evidence. No fixed WHAT/HOW formula is applied.</span></div>
        <div class="field"><label class="lbl" for="${P("appraisal", "overall", "just")}">Manager's final justification <span class="req">*</span></label>${ta(P("appraisal", "overall", "just"), a.overall.just, "Why is this the right overall rating?", t && !a.overall.just.trim(), 3)}</div>
        <div class="grid2">
          <div class="field"><label class="lbl" for="${P("appraisal", "overall", "strengths")}">Key strengths <span class="req">*</span></label>${ta(P("appraisal", "overall", "strengths"), a.overall.strengths, "", t && !a.overall.strengths.trim())}</div>
          <div class="field"><label class="lbl" for="${P("appraisal", "overall", "dev")}">Development priorities <span class="req">*</span></label>${ta(P("appraisal", "overall", "dev"), a.overall.dev, "", t && !a.overall.dev.trim())}</div>
        </div>
      </div></div>
    </section>
    ${ed ? `<div class="card"><div class="card-b stack">
      ${t && !v.ok ? `<div class="notice risk">${icon("alert", "i-sm")}<div class="stack-sm"><b>Complete the following before submitting:</b><ul class="list-plain">${v.errors.map(e => `<li>${esc(e)}</li>`).join("")}</ul></div></div>` : ""}
      <div class="row between"><span class="xs muted">Your draft saves automatically. Submitting sends the appraisal to ${esc(E.first)}.</span><button class="btn primary" data-act="submitAppraisal" id="submit-appraisal">${icon("send", "i-sm")} Submit final appraisal</button></div>
    </div></div>` : ""}
  </div>`;
};
DRAWERS.evidence = function (d) {
  const r = rec(), list = r.evidence.filter(e => d.id === "all" || e.link === d.id);
  return `<div class="drawer-scrim" data-act="closeDrawer"></div><aside class="drawer" role="dialog" aria-label="Evidence Log"><div class="drawer-h"><div><h3>Evidence Log</h3><div class="xs muted">${d.id === "all" ? "All entries" : esc(linkLabel(d.id))} · ${plural(list.length, "entry", "entries")}</div></div><button class="icon-btn" data-act="closeDrawer" aria-label="Close">${icon("x")}</button></div>
    <div class="drawer-b">${list.length ? list.map(e => `<div class="ev-card"><div class="row between"><span class="tag">${esc(e.period)}</span><span class="xs muted">${esc(e.source === "Other" ? e.sourceOther : e.source)} · ${esc(e.status)}</span></div>${d.id === "all" ? `<div class="xs muted">${esc(linkLabel(e.link))}</div>` : ""}<div>${esc(e.text)}</div>${e.impact ? `<div class="xs"><span class="muted">Impact:</span> ${esc(e.impact)}</div>` : ""}${e.action ? `<div class="xs"><span class="muted">Action:</span> ${esc(e.action)}</div>` : ""}</div>`).join("") : `<div class="empty">${icon("log")}<span class="small">No entries linked here. You can add evidence in the Evidence Log.</span></div>`}
    <button class="btn" data-act="go" data-go="evidence">Open Evidence Log</button></div></aside>`;
};

/* ---------- Employee reaction & bias reflection ---------- */
function reactionChat(inModal) {
  const r = rec(), rf = r.reflection, sc = reactionScript(S.emp);
  if (r.appraisal.status !== "submitted" && !rf.done && !rf.log.length) return `<div class="empty">${icon("chat")}<b>No conversation yet</b><span class="small">${esc(EMP().first)} will respond after you submit the final appraisal.</span></div>`;
  let foot = "";
  if (rf.done) foot = `<div class="small t2">${icon("check", "i-sm")} Reflection recorded: you chose to <b>${rf.decision === "revise" ? "revise" : "keep"}</b> the evaluation.${rf.just ? ` “${esc(rf.just)}”` : ""}</div>`;
  else if (r.appraisal.status === "draft" && rf.decision === "revise") foot = `<div class="row between"><span class="small t2">You are revising the appraisal.</span><button class="btn primary sm" data-act="go" data-go="appraisal">Open appraisal</button></div>`;
  else if (!rf.choice) foot = `<div class="xs muted">Choose your response</div>${sc.options.map(o => `<button class="reply-opt" data-act="reactOpt" data-id="${o.id}">${icon("send", "i-sm")}<span>${esc(o.l)}</span></button>`).join("")}`;
  else foot = reflectionForm(r);
  return `<div class="chat">${inModal ? "" : chatHead("Year-end appraisal feedback", SIM_DATES.yearend)}<div class="chat-log" id="chat-log">${bubbles(rf.log)}</div><div class="chat-foot">${foot}</div></div>`;
}
function reflectionForm(r) {
  const rf = r.reflection, a = r.appraisal.overall, t = rf.tried;
  return `<div class="stack" style="gap:12px">
    <div class="row between"><b class="small">Reflect before you decide</b><button class="btn ghost sm" data-act="evDrawer" data-id="all">${icon("log", "i-sm")} Reconsider the evidence</button></div>
    <div class="small t2">Your submitted ratings: WHAT ${a.what || "–"} · HOW ${a.how || "–"} · Final <b>${esc(ratingLabel(a.final))}</b></div>
    <div class="field"><span class="lbl">Could any of these have shaped your evaluation? (optional, private)</span><div class="grid2" style="gap:6px">${BIASES.map(b => `<label class="row nowrap small" style="gap:8px;align-items:flex-start"><input type="checkbox" data-act-change="bias" value="${b.id}" ${rf.biases.includes(b.id) ? "checked" : ""} style="margin-top:3px"><span><b>${b.l}</b> <span class="muted">· ${b.d}</span></span></label>`).join("")}</div></div>
    <div class="field"><span class="lbl">Decision <span class="req">*</span></span><div class="seg ${t && !rf.decision ? "err" : ""}"><button class="${rf.decision === "keep" ? "on" : ""}" data-act="reflDecision" data-v="keep">Keep the evaluation</button><button class="${rf.decision === "revise" ? "on" : ""}" data-act="reflDecision" data-v="revise">Revise the evaluation</button></div></div>
    <div class="field"><label class="lbl" for="${P("reflection", "just")}">Short justification <span class="req">*</span></label><textarea class="ta ${t && !rf.just.trim() ? "err" : ""}" rows="2" id="${P("reflection", "just")}" ${bind(P("reflection", "just"))} placeholder="Why are you keeping or revising the evaluation?">${esc(rf.just)}</textarea></div>
    <div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="reflSave" id="refl-save">${rf.decision === "revise" ? "Record and reopen appraisal" : "Record decision"}</button></div>
  </div>`;
}
MODALS.reaction = function () {
  return modalWrap(`Message from ${esc(EMP().name)}`, reactionChat(true), `<button class="btn" data-act="closeModal">Reply later</button>`, true, avatar(S.emp, "sm"));
};
