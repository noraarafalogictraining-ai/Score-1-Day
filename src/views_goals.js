/* =========================================================
   PERFORMANCE GOALS (SCORE Round 1)
   Objectives & KPIs · Competencies & Behavioral Expectations · Review & Submit
   ========================================================= */
const goalsEditable = (r = rec()) => r.goals.status === "not_started" || r.goals.status === "draft";

VIEWS.goals = function () {
  if (!S.emp) return pageHead("Performance Goals", "Performance Goals") + needEmp();
  const r = rec(), g = r.goals, E = EMP(), tab = UI.sub || "objectives", ed = goalsEditable(r);
  const banner = g.status === "pending_alignment"
    ? `<div class="notice" style="margin-bottom:14px">${icon("info", "i-sm")}<span class="grow"><b>Your performance goals have been submitted.</b> Employee alignment is required before the performance contract can be finalized.</span><button class="btn sm primary" data-act="go" data-go="conversations/alignment">Open conversation</button></div>`
    : g.status === "approved" ? `<div class="notice good" style="margin-bottom:14px">${icon("check", "i-sm")}<span>The performance contract is approved and locked for the year. It will appear in the year-end appraisal.</span></div>`
    : g.revisions && g.status === "draft" ? `<div class="notice warn" style="margin-bottom:14px">${icon("edit", "i-sm")}<span>Revising after your conversation with ${esc(E.first)}. Update the plan, then submit it again for alignment.</span></div>` : "";
  const tabs = [["objectives", "Performance Objectives", g.objectives.length], ["competencies", "Competencies & Behavioral Expectations", g.comps.length], ["submit", ed ? "Review & Submit" : "Summary", null]];
  return pageHead(`Performance Goals / ${esc(E.name)}`, "Performance Goal Plan", statusChip(g.status === "pending_alignment" ? "pending_alignment" : g.status)) + `
  <div class="card pad" style="margin-bottom:14px"><div class="plan-head">
    <div class="row nowrap" style="gap:12px">${avatar(S.emp, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)}</div><div class="xs muted">Goal plan ${APP.cycleYear} · ${APP.cycleLabel} · <span class="round-tag">SCORE Round 1</span></div></div></div>
    <div class="row">${ed ? `<button class="btn sm" data-act="modal" data-m="profile">${icon("user", "i-sm")} Profile</button><button class="btn primary" data-act="go" data-go="goals/submit">${icon("send", "i-sm")} Submit for Employee Alignment</button>` : `<button class="btn sm" data-act="modal" data-m="profile">${icon("user", "i-sm")} Profile</button>`}</div>
  </div></div>
  ${banner}
  <div class="tabs" role="tablist" style="margin-bottom:16px">${tabs.map(([id, l, n]) => `<button class="tab ${tab === id ? "on" : ""}" role="tab" data-act="go" data-go="goals/${id}">${l}${n != null ? `<span class="n">${n}</span>` : ""}</button>`).join("")}</div>
  ${tab === "competencies" ? compTab(r, ed) : tab === "submit" ? submitTab(r, ed) : objTab(r, ed)}`;
};

function weightSummary(r) {
  const wt = weightTotal(r), n = r.goals.objectives.length, inRange = n >= OBJ_RANGE.min && n <= OBJ_RANGE.max;
  return `<div class="summary-bar">
    <div class="sb-item"><span class="xs muted">Objectives</span><b class="num">${n}</b><span class="xs ${inRange || !n ? "muted" : ""}" style="${!inRange && n ? "color:var(--warn)" : ""}">Recommended ${OBJ_RANGE.min}–${OBJ_RANGE.max}</span></div>
    <div class="sb-item"><span class="xs muted">Total weight</span><b class="num" style="color:${wt === 100 ? "var(--good)" : wt > 100 ? "var(--risk)" : "var(--text)"}">${wt}%</b><div class="meter ${wt === 100 ? "ok" : wt > 100 ? "over" : ""}"><i style="width:${Math.min(100, wt)}%"></i></div></div>
    <div class="sb-item"><span class="xs muted">Status</span><span class="small">${wt === 100 ? `${icon("check", "i-sm")} Weights total 100%` : n ? `Weights must total 100% (${wt > 100 ? `${wt - 100}% over` : `${100 - wt}% left`})` : "Add your first objective"}</span></div>
  </div>`;
}
function objTab(r, ed) {
  const g = r.goals;
  return `<div class="stack">
    ${weightSummary(r)}
    ${g.objectives.map((o, i) => objCard(o, i, ed, g.tried)).join("")}
    ${ed ? (g.objectives.length < OBJ_RANGE.hardMax ? `<button class="add-row" data-act="addObj">${icon("plus")} Add objective</button>` : `<p class="xs muted">You have reached the maximum of ${OBJ_RANGE.hardMax} objectives.</p>`) : ""}
    ${!g.objectives.length && !ed ? `<div class="card"><div class="empty">No objectives.</div></div>` : ""}
    <p class="xs muted">Write the target into the KPI where it helps, for example “… at least 85% delivered on the agreed date”. KPI wording is not judged automatically.</p>
  </div>`;
}
function objCard(o, i, ed, tried) {
  const base = P("goals", "objectives", i), miss = objMissing(o), editing = ed && UI.edit === o.id, bad = (f) => tried && miss.some(m => m.startsWith(f)) ? "err" : "";
  const meta = `<div class="goal-meta">
      <div><div class="k">KPI / Performance measure</div>${o.kpi ? esc(o.kpi) : `<span class="muted">Not set</span>`}</div>
      <div><div class="k">Evidence source</div>${o.evidence ? esc(evidenceLabel(o)) : `<span class="muted">Not set</span>`}</div>
      <div><div class="k">Review frequency</div>${o.freq ? esc(o.freq) : `<span class="muted">Not set</span>`}</div>
    </div>`;
  const form = `<div class="goal-form">
      <div class="field full"><label class="lbl" for="${base}.objective">Objective <span class="req">*</span></label><textarea class="ta ${bad("Objective")}" rows="2" id="${base}.objective" ${bind(base + ".objective")} placeholder="What must be achieved this year?">${esc(o.objective)}</textarea></div>
      <div class="field full"><label class="lbl" for="${base}.kpi">KPI / Performance measure <span class="req">*</span></label><textarea class="ta ${bad("KPI")}" rows="2" id="${base}.kpi" ${bind(base + ".kpi")} placeholder="How will performance be measured? Include the target where it helps.">${esc(o.kpi)}</textarea></div>
      <div class="field"><label class="lbl" for="${base}.weight">Weight (%) <span class="req">*</span></label><input class="inp ${bad("Weight")}" type="number" min="1" max="100" step="1" inputmode="numeric" id="${base}.weight" ${bind(base + ".weight", "num")} value="${esc(o.weight)}"></div>
      <div class="field"><label class="lbl" for="${base}.freq">Review frequency <span class="req">*</span></label><select class="sel ${bad("Review")}" id="${base}.freq" ${bind(base + ".freq")}><option value="">Select…</option>${FREQUENCIES.map(f => `<option ${o.freq === f ? "selected" : ""}>${f}</option>`).join("")}</select></div>
      <div class="field"><label class="lbl" for="${base}.evidence">Evidence source <span class="req">*</span></label><select class="sel ${bad("Evidence")}" id="${base}.evidence" ${bind(base + ".evidence")}><option value="">Select…</option>${EVIDENCE_SOURCES.map(f => `<option ${o.evidence === f ? "selected" : ""}>${f}</option>`).join("")}</select></div>
      ${o.evidence === "Other" ? `<div class="field"><label class="lbl" for="${base}.evidenceOther">Other evidence source <span class="req">*</span></label><input class="inp ${bad("Name the other")}" id="${base}.evidenceOther" ${bind(base + ".evidenceOther")} value="${esc(o.evidenceOther)}" placeholder="Name the source"></div>` : `<div></div>`}
      <div class="full row between"><span class="xs ${miss.length ? "" : "muted"}" style="${miss.length ? "color:var(--warn)" : ""}">${miss.length ? `Still needed: ${miss.join(", ")}` : "All fields complete."}</span><span class="row"><button class="btn sm danger" data-act="delObj" data-id="${o.id}">${icon("trash", "i-sm")} Remove</button><button class="btn sm primary" data-act="doneObj">${icon("check", "i-sm")} Done</button></span></div>
    </div>`;
  return `<div class="goal ${editing ? "editing" : ""} ${miss.length && !editing ? "incomplete" : ""}" id="obj-${o.id}">
    <div class="goal-top"><span class="goal-n">${i + 1}</span><div class="grow"><div class="goal-title">${o.objective ? esc(o.objective) : `<span class="muted">Untitled objective</span>`}</div>${miss.length && !editing ? `<div class="xs" style="color:var(--warn);margin-top:2px">Incomplete: ${miss.join(", ")}</div>` : ""}</div>
      <span class="weight-badge num">${o.weight !== "" ? num(o.weight) : "–"}%</span>
      ${ed && !editing ? `<button class="icon-btn" data-act="editObj" data-id="${o.id}" aria-label="Edit objective ${i + 1}">${icon("edit")}</button><button class="icon-btn" data-act="delObj" data-id="${o.id}" aria-label="Remove objective ${i + 1}">${icon("trash")}</button>` : ""}
    </div>
    ${editing ? form : meta}
  </div>`;
}

function compTab(r, ed) {
  const g = r.goals, lib = competencyLibrary(S.emp), selIds = g.comps.map(c => c.id), full = g.comps.length >= COMP_RANGE.max;
  const slots = (ROLE_COMPETENCIES[S.emp] || []).length ? 0 : ROLE_COMPETENCY_SLOTS;
  return `<div class="comp-layout">
    <div class="card"><div class="card-h"><div><h3>Competency library</h3><div class="xs muted">${esc(EMP().title)} · ${lib.length} available</div></div></div><div class="card-b stack" style="gap:10px">
      ${lib.map(c => { const on = selIds.includes(c.id), open = UI.libOpen === c.id; return `<div class="lib-item ${on ? "sel" : ""}">
        <div class="row between nowrap"><b class="small">${esc(c.name)}</b><span class="row nowrap" style="gap:4px"><button class="btn ghost sm" data-act="libOpen" data-id="${c.id}">${open ? "Hide levels" : "View levels"}</button>${ed ? (on ? `<button class="btn sm" data-act="compDel" data-id="${c.id}">Remove</button>` : `<button class="btn sm ${full ? "disabled" : "primary"}" data-act="compAdd" data-id="${c.id}" ${full ? "disabled" : ""}>${icon("plus", "i-sm")} Add</button>`) : on ? `<span class="chip st-approved">Selected</span>` : ""}</span></div>
        <div class="small">${phBlock(c.description)}</div>
        ${open ? `<div class="levels stacked">${LEVELS.map(l => `<div class="level"><h4>${l.l}</h4>${c.levels[l.id].map(phBlock).join("")}</div>`).join("")}</div>` : ""}
      </div>`; }).join("")}
      ${Array.from({ length: slots }, (_, i) => `<div class="lib-item slot"><div class="row between nowrap"><b class="small muted">Role-specific competency ${i + 1}</b><span class="ph-inline">${PENDING_TAG}</span></div><div class="xs muted">Competencies aligned with the ${esc(EMP().title)} job description will be added here once approved.</div></div>`).join("")}
    </div></div>
    <div class="stack">
      <div class="summary-bar"><div class="sb-item"><span class="xs muted">Selected competencies</span><b class="num">${g.comps.length} / ${COMP_RANGE.max}</b><span class="xs muted">Select ${COMP_RANGE.min}–${COMP_RANGE.max}</span></div><div class="sb-item"><span class="xs muted">Expected levels set</span><b class="num">${g.comps.filter(c => c.level).length}</b></div></div>
      ${g.comps.length ? g.comps.map((c, i) => selectedComp(c, i, ed, g.tried)).join("") : `<div class="card"><div class="empty">${icon("layers")}<b>No competencies selected yet</b><span class="small">Choose ${COMP_RANGE.min}–${COMP_RANGE.max} competencies from the library that matter most for this role.</span></div></div>`}
    </div>
  </div>`;
}
function selectedComp(c, i, ed, tried) {
  const L = competencyById(S.emp, c.id) || { name: "Removed competency", description: "", levels: { basic: [], intermediate: [], advanced: [] } };
  const base = P("goals", "comps", i);
  return `<div class="card" id="comp-${c.id}"><div class="card-h"><div><h3>${esc(L.name)}</h3></div>${ed ? `<button class="btn ghost sm" data-act="compDel" data-id="${c.id}">Remove</button>` : ""}</div><div class="card-b stack" style="gap:12px">
    <div class="small">${phBlock(L.description)}</div>
    <div class="field"><span class="lbl">Expected proficiency level <span class="req">*</span></span>
      ${ed ? `<div class="seg ${tried && !c.level ? "err" : ""}" role="radiogroup">${LEVELS.map(l => `<button role="radio" aria-checked="${c.level === l.id}" class="${c.level === l.id ? "on" : ""}" data-act="compLevel" data-i="${i}" data-v="${l.id}">${l.l}</button>`).join("")}</div>` : `<div><span class="tag blue">${(LEVELS.find(l => l.id === c.level) || {}).l || "Not set"}</span></div>`}
    </div>
    ${c.level ? `<div class="stack-sm"><span class="lbl">Observable behaviours at ${(LEVELS.find(l => l.id === c.level) || {}).l} level</span>${(L.levels[c.level] || []).map(phBlock).join("")}</div>` : ""}
    <div class="field"><label class="lbl" for="${base}.standard">Expected behavioral standard (optional)</label>${ed ? `<textarea class="ta" rows="2" id="${base}.standard" ${bind(base + ".standard")} placeholder="Add or clarify what you expect to see or hear, e.g. what the person does in a meeting.">${esc(c.standard || "")}</textarea>` : `<div class="small t2">${c.standard ? esc(c.standard) : `<span class="muted">None added</span>`}</div>`}</div>
  </div></div>`;
}

function submitTab(r, ed) {
  const g = r.goals, v = planValidation(r);
  const checklist = `<div class="checklist">${v.errors.map(e => `<div class="ck no">${icon("x", "i-sm")}<span>${esc(e)}</span></div>`).join("")}${v.notes.map(e => `<div class="ck note">${icon("info", "i-sm")}<span>${esc(e)} This will not block submission.</span></div>`).join("")}${v.ok ? `<div class="ck ok">${icon("check", "i-sm")}<span>All required information is complete and the weights total 100%.</span></div>` : ""}</div>`;
  return `<div class="stack-lg">
    ${ed ? `<div class="card"><div class="card-h"><h3>Validation</h3>${v.ok ? `<span class="chip st-approved">Ready to submit</span>` : `<span class="chip st-action">${plural(v.errors.length, "item", "items")} to fix</span>`}</div><div class="card-b stack">${checklist}
      <div class="row between"><span class="xs muted">Submitting sends the plan to ${esc(EMP().first)} for alignment. The contract is only confirmed after you both agree.</span><button class="btn primary" data-act="submitGoals" id="submit-goals">${icon("send", "i-sm")} Submit for Employee Alignment</button></div></div></div>` : ""}
    <div class="card"><div class="card-h"><h3>Performance objectives</h3><span class="small num">Total weight ${weightTotal(r)}%</span></div>
      <div class="table-wrap" style="border:0;border-radius:0"><table class="tbl" style="min-width:760px"><thead><tr><th>#</th><th>Objective</th><th>KPI / Performance measure</th><th>Weight</th><th>Evidence source</th><th>Review</th></tr></thead><tbody>
      ${g.objectives.length ? g.objectives.map((o, i) => `<tr><td>${i + 1}</td><td>${esc(o.objective) || "<span class='muted'>—</span>"}</td><td>${esc(o.kpi) || "<span class='muted'>—</span>"}</td><td class="num">${o.weight !== "" ? num(o.weight) + "%" : "—"}</td><td>${esc(evidenceLabel(o)) || "—"}</td><td>${esc(o.freq) || "—"}</td></tr>`).join("") : `<tr><td colspan="6" class="muted">No objectives yet.</td></tr>`}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><h3>Competencies &amp; behavioral expectations</h3></div><div class="card-b stack" style="gap:8px">
      ${g.comps.length ? g.comps.map(c => `<div class="row between nowrap" style="border-bottom:1px solid var(--line);padding-bottom:8px"><div class="grow"><b class="small">${esc(compName(c.id))}</b><div class="xs muted">${c.standard ? esc(c.standard) : "No additional standard"}</div></div><span class="tag blue">${(LEVELS.find(l => l.id === c.level) || {}).l || "Level not set"}</span></div>`).join("") : `<span class="small muted">No competencies selected.</span>`}
    </div></div>
  </div>`;
}

/* ---------- Employee conversations ---------- */
VIEWS.conversations = function () {
  if (!S.emp) return pageHead("Employee Conversations", "Employee Conversations") + needEmp();
  const r = rec(), E = EMP(), ms = midyearStatus(r);
  const threads = [
    { id: "alignment", t: "Performance contract alignment", d: r.goals.status === "pending_alignment" ? "Your response is needed" : r.align.outcome === "align" ? "Contract confirmed" : r.align.log.length ? "Goal plan in revision" : "Starts when you submit the goal plan", st: r.goals.status === "pending_alignment" ? "action" : r.align.outcome === "align" ? "completed" : r.align.log.length ? "draft" : "not_started" },
    { id: "midyear", t: "Mid-Year Performance Check-In", d: ms === "locked" ? "Opens at the mid-year checkpoint" : ms === "completed" ? "Check-in closed" : "Check-in required", st: ms },
    { id: "appraisal", t: "Year-end appraisal feedback", d: r.appraisal.status === "submitted" || r.reflection.done ? (r.reflection.done ? "Reflection recorded" : "Your response is needed") : "Opens after you submit the appraisal", st: r.reflection.done ? "completed" : r.appraisal.status === "submitted" ? "action" : "locked" }
  ];
  const cur = threads.find(t => t.id === UI.sub) || threads.find(t => t.st === "action") || threads[0];
  return pageHead(`Employee Conversations / ${esc(E.name)}`, "Employee Conversations", empChip()) + `<div class="card split">
    <div class="list">${threads.map(t => `<button class="msg-item ${t === cur ? "on" : ""}" data-act="go" data-go="conversations/${t.id}">${avatar(S.emp, "sm")}<span class="stack-sm grow" style="gap:2px"><span class="subj">${t.t}</span><span class="xs muted">${t.d}</span></span>${statusChip(t.st)}</button>`).join("")}</div>
    <div>${cur.id === "alignment" ? alignmentChat(false) : cur.id === "midyear" ? midyearChat() : reactionChat(false)}</div>
  </div>`;
};
function chatHead(title, sub) { return `<div class="chat-head">${avatar(S.emp)}<div class="grow"><b>${esc(EMP().name)}</b><div class="xs muted">${title}${sub ? ` · ${sub}` : ""}</div></div></div>`; }
function bubbles(log) {
  return log.map(m => m.from === "sys" ? `<div class="bubble sys">${esc(m.text)}</div>` :
    `<div class="bubble-row ${m.from === "manager" ? "me" : ""}">${m.from === "manager" ? `<span class="initials" style="background:var(--navy);width:28px;height:28px;font-size:.7rem">${esc(initials(S.session.name))}</span>` : avatar(S.emp, "sm")}<div class="bubble"><div class="who">${m.from === "manager" ? "You" : esc(EMP().first)}</div>${m.ph ? phText(m) : esc(m.text)}</div></div>`).join("");
}
function alignmentChat(inModal) {
  const r = rec(), a = r.align, sc = alignmentScript(S.emp), node = a.node ? sc.nodes[a.node] : null;
  if (!a.log.length) return `<div class="empty">${icon("chat")}<b>No conversation yet</b><span class="small">${esc(EMP().first)} will respond when you submit the goal plan for alignment.</span>${goalsEditable(r) ? `<button class="btn primary" data-act="go" data-go="goals/submit">Open Review &amp; Submit</button>` : ""}</div>`;
  let foot = "";
  if (r.goals.status === "pending_alignment" && node) {
    foot = node.outcome === "align"
      ? `<div class="notice good">${icon("check", "i-sm")}<span class="grow">${esc(EMP().first)} has agreed the expectations. Confirm alignment to finalize the performance contract.</span></div><div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="alignConfirm" id="align-confirm">${icon("check", "i-sm")} Confirm alignment</button></div>`
      : `<div class="xs muted">Choose your response</div>${node.options.map((o, i) => `<button class="reply-opt" data-act="alignOpt" data-i="${i}">${icon("send", "i-sm")}<span>${esc(o.l)}</span>${o.outcome === "revise" ? `<span class="pp">Returns plan to Draft</span>` : ""}</button>`).join("")}`;
  } else if (r.goals.status === "draft") foot = `<div class="row between"><span class="small t2">The goal plan is back in Draft for revision.</span><button class="btn primary sm" data-act="go" data-go="goals">Revise goal plan</button></div>`;
  else if (r.goals.status === "approved") foot = `<div class="small t2">${icon("check", "i-sm")} Performance contract confirmed on ${SIM_DATES.approved}.</div>`;
  return `<div class="chat">${inModal ? "" : chatHead("Performance contract alignment", APP.cycleYear)}<div class="chat-log" id="chat-log">${bubbles(a.log)}</div>${foot ? `<div class="chat-foot">${foot}</div>` : ""}</div>`;
}
MODALS.align = function () {
  return modalWrap(`Message from ${esc(EMP().name)}`, alignmentChat(true), `<button class="btn" data-act="closeModal">Reply later</button>`, true, avatar(S.emp, "sm"));
};
