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
  if (!S.emp) return pageHead("Evidence Log", "Evidence Log") + needEmp();
  const r = rec(), E = EMP();
  if (!goalsApproved(r)) return pageHead(`Evidence Log / ${esc(E.name)}`, "Evidence Log", empChip()) + lockedPanel("Available once the performance contract is approved", "Monitoring begins after you and your employee have aligned on the goal plan.");
  const items = planItems(r), f = UI.evFilter;
  const rows = r.evidence.filter(e => f === "all" || e.link === f);
  return pageHead(`Evidence Log / ${esc(E.name)}`, "Evidence Log", `${empChip()}<button class="btn primary" data-act="evNew" id="ev-add">${icon("plus", "i-sm")} Add evidence entry</button>`, "Record the evidence and observations from your printed handouts. The system does not generate evidence.") + `
  <div class="stack">
    <div class="row between">
      <div class="row nowrap" style="gap:8px">${icon("filter", "i-sm")}<label class="sr" for="ev-filter">Filter by KPI or competency</label><select class="sel" id="ev-filter" data-act-change="evFilter" style="width:auto;min-width:260px"><option value="all">All objectives and competencies (${r.evidence.length})</option>${items.map(it => `<option value="${it.id}" ${f === it.id ? "selected" : ""}>${esc(it.l)} (${r.evidence.filter(e => e.link === it.id).length})</option>`).join("")}<option value="general" ${f === "general" ? "selected" : ""}>General / other (${r.evidence.filter(e => e.link === "general").length})</option></select></div>
      <span class="xs muted">${plural(rows.length, "entry", "entries")} shown</span>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th style="width:110px">Date / Period</th><th style="width:170px">KPI / Competency</th><th>Evidence / Observation</th><th style="width:130px">Source</th><th style="width:160px">Impact</th><th style="width:170px">Manager action / Follow-up</th><th style="width:96px">Status</th><th style="width:84px"><span class="sr">Actions</span></th></tr></thead><tbody>
      ${rows.length ? rows.map(e => `<tr id="ev-${e.id}"><td>${esc(e.period)}</td><td>${esc(linkLabel(e.link))}</td><td>${esc(e.text)}</td><td>${esc(e.source === "Other" ? e.sourceOther || "Other" : e.source)}</td><td>${esc(e.impact) || "<span class='muted'>—</span>"}</td><td>${esc(e.action) || "<span class='muted'>—</span>"}</td><td><span class="chip ${e.status === "Completed" ? "st-completed" : e.status === "Ongoing" ? "st-in_progress" : "st-draft"}">${esc(e.status)}</span></td><td><span class="row nowrap" style="gap:0"><button class="icon-btn" data-act="evEdit" data-id="${e.id}" aria-label="Edit entry">${icon("edit", "i-sm")}</button><button class="icon-btn" data-act="evDel" data-id="${e.id}" aria-label="Delete entry">${icon("trash", "i-sm")}</button></span></td></tr>`).join("")
        : `<tr><td colspan="8"><div class="empty">${icon("log")}<b>${r.evidence.length ? "No entries for this filter" : "No evidence recorded yet"}</b><span class="small">Use <b>Add evidence entry</b> to document each item from your handouts.</span></div></td></tr>`}
    </tbody></table></div>
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

/* ---------- Mid-year diagnostic check-in ---------- */
function midyearChat() {
  const r = rec(), m = r.midyear, st = midyearStatus(r), sc = diagnosticScript(S.emp);
  if (!goalsApproved(r)) return `<div class="empty">${icon("lock")}<b>Not yet open</b><span class="small">The mid-year check-in follows the approved performance contract.</span></div>`;
  if (st === "locked") return `<div style="padding:18px">${releaseGate("midyear", "Mid-year checkpoint not reached", "Your facilitator will reveal the mid-year business event in the room, then open the check-in.")}</div>`;
  const asked = m.asked, left = sc.questions.filter(q => !asked.includes(q.id)), atMax = asked.length >= DIAGNOSTIC_LIMITS.max;
  let foot;
  if (m.closed) foot = `<div class="stack-sm"><div class="small t2">${icon("check", "i-sm")} Check-in closed. The intervention will be discussed in the training room.</div>${m.note ? `<div class="small"><b>Your notes:</b> ${esc(m.note)}</div>` : ""}</div>`;
  else if (!m.started) foot = `<div class="row between"><span class="small t2">Open the conversation to investigate the performance gap.</span><button class="btn primary" data-act="midStart" id="mid-start">${icon("chat", "i-sm")} Start check-in</button></div>`;
  else foot = `<div class="row between"><span class="xs muted">Choose up to ${DIAGNOSTIC_LIMITS.max} questions, in any order (${asked.length} asked).</span></div>
    ${atMax ? "" : left.map(q => `<button class="reply-opt" data-act="midAsk" data-q="${q.id}">${icon("send", "i-sm")}<span>${esc(q.q)}</span><span class="pp">${esc(q.purpose)}</span></button>`).join("")}
    <div class="field"><label class="lbl" for="${P("midyear", "note")}">What did you learn? (optional, for the intervention discussion)</label><textarea class="ta" rows="2" id="${P("midyear", "note")}" ${bind(P("midyear", "note"))}>${esc(m.note)}</textarea></div>
    <div class="row between"><span class="xs muted">${asked.length < DIAGNOSTIC_LIMITS.min ? `Ask at least ${DIAGNOSTIC_LIMITS.min} questions before closing.` : "You can close the check-in when you have what you need."}</span><button class="btn primary sm" data-act="midClose" id="mid-close" ${asked.length < DIAGNOSTIC_LIMITS.min ? "disabled" : ""}>Close check-in</button></div>`;
  return `<div class="chat">${chatHead("Mid-Year Performance Check-In", SIM_DATES.midyear)}<div class="chat-log" id="chat-log">${m.log.length ? bubbles(m.log) : `<div class="bubble sys">Mid-Year Performance Check-In Required</div>`}</div><div class="chat-foot">${foot}</div></div>`;
}
