/* =========================================================
   PERFORMANCE MANAGEMENT → OBJECTIVES
   Two tabs: Performance Objectives · Competencies. Validation sits under each tab.
   ========================================================= */
const goalsEditable = (r = rec()) => r.goals.status === "not_started" || r.goals.status === "draft";

VIEWS.goals = function () {
  const r = rec(), g = r.goals, E = EMP(), tab = UI.sub === "competencies" ? "competencies" : "objectives", ed = goalsEditable(r);
  const v = planValidation(r), unread = chatUnread(r);
  const banner = g.status === "pending_alignment"
    ? `<div class="notice" style="margin-bottom:14px">${icon("info", "i-sm")}<span class="grow"><b>Pending Employee Alignment.</b> The plan has been shared with Omar.${r.align.ready ? " Omar is ready to go ahead." : ""}</span>${r.align.ready ? `<button class="btn sm primary" data-act="alignConfirm" id="align-confirm-page">Confirm alignment</button>` : ""}<button class="btn sm" data-act="reopenPlan">Edit the plan</button></div>`
    : g.status === "approved" ? `<div class="notice good" style="margin-bottom:14px">${icon("check", "i-sm")}<span>The performance plan is confirmed for ${APP.cycleYear}. It carries forward into the year-end appraisal.</span></div>` : "";
  const tabs = [["objectives", "Performance Objectives", g.objectives.length], ["competencies", "Competencies", g.comps.length]];
  return pageHead("Performance Management / Objectives", `Objectives · ${esc(E.name)}`, statusChip(g.status)) + `
  <div class="card pad" style="margin-bottom:14px"><div class="plan-head">
    <div class="row nowrap" style="gap:12px">${avatar(S.emp, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)}</div><div class="xs muted">Performance plan ${APP.cycleYear} · ${APP.cycleLabel}</div></div></div>
    <div class="row"><button class="btn sm" data-act="modal" data-m="profile" data-emp="${S.emp}">${icon("user", "i-sm")} Profile</button>${ed ? `<button class="btn primary" data-act="submitGoals" id="submit-goals" ${v.ok ? "" : `disabled title="Complete the objectives and competencies first"`}>${icon("send", "i-sm")} Submit for Employee Alignment</button>` : ""}</div>
  </div>${ed && !v.ok ? `<div class="xs muted" style="margin-top:8px;text-align:right">Complete both tabs to submit: ${[!objectiveValidation(r).ok ? "objectives" : "", !competencyValidation(r).ok ? "competencies" : ""].filter(Boolean).join(" and ")} still need attention.</div>` : ""}</div>
  ${banner}
  <div class="tabs" role="tablist" style="margin-bottom:16px">${tabs.map(([id, l, n]) => `<button class="tab ${tab === id ? "on" : ""}" role="tab" aria-selected="${tab === id}" data-act="go" data-go="goals/${id}">${l}<span class="n">${n}</span></button>`).join("")}</div>
  ${tab === "competencies" ? compTab(r, ed) : objTab(r, ed)}`;
};

function validationBlock(title, v, okText) {
  return `<section class="card validation" aria-live="polite"><div class="card-h"><h3>${title}</h3>${v.ok ? `<span class="chip st-approved">Complete</span>` : `<span class="chip st-action">${plural(v.errors.length, "item", "items")} to complete</span>`}</div><div class="card-b checklist">
    ${v.errors.map(e => `<div class="ck no">${icon("x", "i-sm")}<span>${esc(e)}</span></div>`).join("")}
    ${v.ok ? `<div class="ck ok">${icon("check", "i-sm")}<span>${okText}</span></div>` : ""}
    ${v.tips.map(t => `<div class="ck note">${icon("info", "i-sm")}<span>${esc(t)}</span></div>`).join("")}
  </div></section>`;
}
function weightSummary(r) {
  const wt = weightTotal(r), n = r.goals.objectives.length;
  return `<div class="summary-bar">
    <div class="sb-item"><span class="xs muted">Objectives</span><b class="num">${n}</b><span class="xs muted">Recommended ${OBJ_RANGE.min}–${OBJ_RANGE.max}</span></div>
    <div class="sb-item"><span class="xs muted">Total weight</span><b class="num" style="color:${wt === 100 ? "var(--good)" : wt > 100 ? "var(--risk)" : "var(--text)"}">${wt}%</b><div class="meter ${wt === 100 ? "ok" : wt > 100 ? "over" : ""}"><i style="width:${Math.min(100, wt)}%"></i></div></div>
  </div>`;
}
function objTab(r, ed) {
  const g = r.goals;
  return `<div class="stack">
    <div class="row between"><h2>Performance Objectives</h2>${ed ? (g.objectives.length < OBJ_RANGE.hardMax ? `<button class="btn primary" data-act="addObj" id="add-obj">${icon("plus", "i-sm")} Add Objective</button>` : `<span class="xs muted">Maximum of ${OBJ_RANGE.hardMax} objectives reached.</span>`) : ""}</div>
    ${weightSummary(r)}
    ${g.objectives.length ? g.objectives.map((o, i) => objCard(o, i, ed, g.tried)).join("") : `<div class="card"><div class="empty">${icon("target")}<b>No objectives yet</b><span class="small">Use Add Objective to create the first one.</span></div></div>`}
    ${ed ? validationBlock("Objective validation", objectiveValidation(r), "All objectives are complete and the weights total 100%.") : ""}
  </div>`;
}
function objCard(o, i, ed, tried) {
  const base = P("goals", "objectives", i), miss = objMissing(o), editing = ed && UI.edit === o.id, bad = (f) => tried && miss.some(m => m.startsWith(f)) ? "err" : "";
  const meta = `<div class="goal-meta one"><div><div class="k">KPI / Performance measure</div>${o.kpi ? esc(o.kpi) : `<span class="muted">Not set</span>`}</div></div>`;
  const form = `<div class="goal-form">
      <div class="field full"><label class="lbl" for="${base}.objective">Objective <span class="req">*</span></label><textarea class="ta ${bad("Objective")}" rows="2" id="${base}.objective" ${bind(base + ".objective")} placeholder="What must be achieved this year?">${esc(o.objective)}</textarea></div>
      <div class="field full"><label class="lbl" for="${base}.kpi">KPI / Performance measure <span class="req">*</span></label><textarea class="ta ${bad("KPI")}" rows="2" id="${base}.kpi" ${bind(base + ".kpi")} placeholder="How will performance be measured? Write the target into the measure.">${esc(o.kpi)}</textarea></div>
      <div class="field"><label class="lbl" for="${base}.weight">Weight (%) <span class="req">*</span></label><input class="inp ${bad("Weight")}" type="number" min="1" max="100" step="1" inputmode="numeric" id="${base}.weight" ${bind(base + ".weight", "num")} value="${esc(o.weight)}"></div>
      <div class="field" style="justify-content:flex-end"><span class="row" style="justify-content:flex-end"><button class="btn sm danger" data-act="delObj" data-id="${o.id}">${icon("trash", "i-sm")} Remove</button><button class="btn sm primary" data-act="doneObj">${icon("check", "i-sm")} Done</button></span></div>
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
  const g = r.goals, selIds = g.comps.map(c => c.id), avail = competencyLibrary().filter(c => !selIds.includes(c.id)), full = g.comps.length >= COMP_RANGE.max;
  return `<div class="stack">
    <div class="row between"><div><h2>Competencies</h2><div class="xs muted">Select ${COMP_RANGE.min}–${COMP_RANGE.max}. Use your printed competency dictionary to write the expected behaviors.</div></div>
      ${ed ? `<div class="comp-add"><label class="sr" for="comp-add">Add competency</label><span class="comp-add-ic">${icon("plus", "i-sm")}</span><select class="sel" id="comp-add" data-act-change="compPick" ${full || !avail.length ? "disabled" : ""}><option value="">${full ? `Maximum of ${COMP_RANGE.max} selected` : "Add Competency"}</option>${avail.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>` : ""}</div>
    <div class="summary-bar"><div class="sb-item"><span class="xs muted">Selected competencies</span><b class="num">${g.comps.length} / ${COMP_RANGE.max}</b></div><div class="sb-item"><span class="xs muted">Note</span><span class="xs t2">The expected level is what the role requires. It is not a performance rating.</span></div></div>
    ${g.comps.length ? `<div class="comp-grid">${g.comps.map((c, i) => selectedComp(c, i, ed, g.tried)).join("")}</div>` : `<div class="card"><div class="empty">${icon("layers")}<b>No competencies selected yet</b><span class="small">Use Add Competency to choose ${COMP_RANGE.min}–${COMP_RANGE.max} competencies that matter most for Omar's role.</span></div></div>`}
    ${ed ? validationBlock("Competency validation", competencyValidation(r), "Every competency has an expected level and a written behavioral standard.") : ""}
  </div>`;
}
function selectedComp(c, i, ed, tried) {
  const L = competencyById(S.emp, c.id) || { name: "Competency" }, base = P("goals", "comps", i), noStd = tried && !(c.standard || "").trim();
  return `<div class="card comp-card" id="comp-${c.id}"><div class="card-h"><h3>${esc(L.name)}</h3>${ed ? `<button class="icon-btn" data-act="compDel" data-id="${c.id}" aria-label="Remove ${esc(L.name)}">${icon("trash", "i-sm")}</button>` : ""}</div><div class="card-b stack" style="gap:12px">
    <div class="field"><span class="lbl">Expected proficiency level <span class="req">*</span></span>
      ${ed ? `<div class="seg ${tried && !c.level ? "err" : ""}" role="radiogroup">${LEVELS.map(l => `<button role="radio" aria-checked="${c.level === l.id}" class="${c.level === l.id ? "on" : ""}" data-act="compLevel" data-i="${i}" data-v="${l.id}">${l.l}</button>`).join("")}</div>` : `<div><span class="tag blue">${levelLabel(c.level)}</span></div>`}
    </div>
    <div class="field"><label class="lbl" for="${base}.standard">Expected Behavioral Standard <span class="req">*</span></label>${ed ? `<textarea class="ta ${noStd ? "err" : ""}" rows="3" id="${base}.standard" ${bind(base + ".standard")} placeholder="Describe the observable behaviors expected at the selected proficiency level.">${esc(c.standard || "")}</textarea>` : `<div class="small t2">${c.standard ? esc(c.standard) : `<span class="muted">None</span>`}</div>`}</div>
  </div></div>`;
}
