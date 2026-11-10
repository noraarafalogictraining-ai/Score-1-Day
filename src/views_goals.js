/* =========================================================
   PERFORMANCE MANAGEMENT → OBJECTIVES
   Two tabs: Objectives of the Year (HR form) · Competencies. Validation sits under each tab.
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
/* ---------- Objectives of the Year (NextWave HR form) ---------- */
function formHeadTable(rows) {
  return `<table class="hr-head"><tbody>${rows.map(r => `<tr>${r.map(([k, v]) => `<th>${k}</th><td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
const managerName = () => esc((S.session && S.session.name) || "Commercial Director");
function smartChips(sc) {
  return `<span class="smart-chips" aria-label="SMART check">${Object.keys(SMART_LABEL).map(k => `<span class="smk smk-${sc.checks[k].status}" title="${SMART_LABEL[k]}: ${esc(sc.checks[k].msg)}">${k}</span>`).join("")}</span>`;
}
function smartFeedback(sc) {
  return `<div class="smart-fb">${Object.keys(SMART_LABEL).map(k => { const x = sc.checks[k]; return `<div class="smart-row smk-row-${x.status}"><span class="smk smk-${x.status}">${k}</span><span class="xs"><b>${SMART_LABEL[k]}.</b> ${esc(x.msg)}</span></div>`; }).join("")}</div>`;
}
function objTab(r, ed) {
  const g = r.goals, E = EMP(), wt = weightTotal(r), tried = g.tried;
  const rows = g.objectives.map((o, i) => objRow(o, i, ed, tried)).join("");
  return `<div class="stack">
    <section class="hr-form" id="objectives-form">
      <div class="hr-title">Objectives of the Year ${APP.cycleYear}</div>
      ${formHeadTable([[["Employee Name", esc(E.name)], ["Job Title", esc(E.title)]], [["BU / Department", "Commercial"], ["Direct Manager", `${managerName()} · Commercial Director`]], [["Performance Year", String(APP.cycleYear)], ["Rating Period", "1 January – 31 December 2027"]]])}
      <p class="hr-sub"><b>PERFORMANCE STANDARDS AND EXPECTATIONS:</b> Objectives to be accomplished during this rating period.</p>
      <div class="table-wrap"><table class="hr-tbl obj-tbl"><thead><tr><th class="c-no">No.</th><th>Objective / Project</th><th>Measurement</th><th class="c-due shade">Due date</th><th class="c-w">Weight</th><th class="c-act"><span class="sr">Actions</span></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="muted small" style="text-align:center;padding:18px">No objectives yet. Use Add Objective to write the first one.</td></tr>`}</tbody>
        <tfoot><tr><td colspan="4" class="right"><b>Total weight</b></td><td class="c-w"><b class="num" style="color:${wt === 100 ? "var(--good)" : wt > 100 ? "var(--risk)" : "var(--text)"}">${wt}%</b></td><td></td></tr></tfoot></table></div>
      ${ed ? `<div class="row between" style="margin-top:8px">${g.objectives.length < OBJ_RANGE.hardMax ? `<button class="btn primary sm" data-act="addObj" id="add-obj">${icon("plus", "i-sm")} Add Objective</button>` : `<span class="xs muted">Maximum of ${OBJ_RANGE.hardMax} objectives reached.</span>`}<span class="xs muted">${OBJ_RANGE.min}–${OBJ_RANGE.max} objectives recommended · weights must total 100%</span></div>` : ""}
      ${ackBlock(r)}
    </section>
    ${ed ? validationBlock("Objective validation", objectiveValidation(r), "All objectives are complete, SMART checks needing a target or due date are resolved, and the weights total 100%.") : ""}
  </div>`;
}
function objRow(o, i, ed, tried) {
  const base = P("goals", "objectives", i), miss = objMissing(o), editing = ed && UI.edit === o.id, bad = (f) => tried && miss.some(m => m.startsWith(f)) ? "err" : "";
  const filled = String(o.objective || "").trim() || String(o.measure || "").trim(), sc = filled ? smartCheck(o) : null;
  const top = `<tr class="obj-row ${editing ? "editing" : ""} ${miss.length && !editing && tried ? "incomplete" : ""}" id="obj-${o.id}">
      <td class="c-no"><span class="goal-n">${i + 1}</span></td>
      <td><div class="clamp">${o.objective ? esc(o.objective) : `<span class="muted">Not written yet</span>`}</div>${sc ? smartChips(sc) : ""}</td>
      <td><div class="clamp">${o.measure ? esc(o.measure) : `<span class="muted">—</span>`}</div></td>
      <td class="c-due shade">${o.due ? esc(fmtDue(o.due)) : `<span class="muted">—</span>`}</td>
      <td class="c-w"><b class="num">${o.weight !== "" && o.weight != null ? num(o.weight) + "%" : "–"}</b></td>
      <td class="c-act">${ed && !editing ? `<button class="icon-btn" data-act="editObj" data-id="${o.id}" aria-label="Edit objective ${i + 1}">${icon("edit")}</button><button class="icon-btn" data-act="delObj" data-id="${o.id}" aria-label="Remove objective ${i + 1}">${icon("trash")}</button>` : ""}</td>
    </tr>`;
  if (!editing) return top + (miss.length && tried ? `<tr class="obj-note"><td></td><td colspan="5" class="xs" style="color:var(--warn)">Incomplete: ${miss.join(", ")}</td></tr>` : "");
  return top + `<tr class="obj-edit"><td colspan="6"><div class="obj-edit-b">
      <div class="field full"><label class="lbl" for="${base}.objective">Objective / Project <span class="req">*</span></label><textarea class="ta ${bad("Objective")}" rows="3" id="${base}.objective" ${bind(base + ".objective")} placeholder="Write a SMART objective: what Omar should accomplish this year.">${esc(o.objective)}</textarea></div>
      <div class="field full"><label class="lbl" for="${base}.measure">Measurement <span class="req">*</span></label><textarea class="ta ${bad("Measurement")}" rows="2" id="${base}.measure" ${bind(base + ".measure")} placeholder="How will achievement be measured? Include the target level or completion standard.">${esc(o.measure)}</textarea></div>
      <div class="grid2"><div class="field"><label class="lbl" for="${base}.due">Due date <span class="req">*</span></label><input class="inp ${bad("Due")}" type="date" min="${APPRAISAL_CONFIG.ratingPeriod.from}" max="${APPRAISAL_CONFIG.ratingPeriod.to}" id="${base}.due" ${bind(base + ".due")} value="${esc(o.due)}"></div>
      <div class="field"><label class="lbl" for="${base}.weight">Weight (%) <span class="req">*</span></label><div class="inp-suffix"><input class="inp ${bad("Weight")}" type="number" min="1" max="100" step="1" inputmode="numeric" id="${base}.weight" ${bind(base + ".weight", "num")} value="${esc(o.weight)}"><span>%</span></div></div></div>
      ${sc ? `<div class="stack-sm"><span class="lbl">SMART check</span>${smartFeedback(sc)}</div>` : `<p class="xs muted">The SMART check appears once you start writing.</p>`}
      <div class="row" style="justify-content:flex-end"><button class="btn sm danger" data-act="delObj" data-id="${o.id}">${icon("trash", "i-sm")} Remove</button><button class="btn sm primary" data-act="doneObj">${icon("check", "i-sm")} Done</button></div>
    </div></td></tr>`;
}
/* Acknowledgement (wording from the Objectives of the Year form). Never marks Omar as agreeing without the discussion. */
function ackBlock(r) {
  const g = r.goals, confirmed = g.status === "approved" && r.align.confirmed, shared = g.status === "pending_alignment";
  const mgr = confirmed ? `<b>Acknowledged</b> · ${SIM_DATES.approved}` : shared ? `Shared with Omar for discussion · ${SIM_DATES.submitted}` : "Not yet acknowledged";
  const emp = confirmed ? (r.align.manual ? "Confirmed by HR / facilitator · no employee acknowledgement recorded" : `<b>Acknowledged</b> in the expectations discussion · ${SIM_DATES.approved}`) : shared ? (r.align.ready ? "Omar is ready to acknowledge · awaiting confirmation" : "Pending discussion with Omar") : "Pending";
  return `<div class="ack-box" id="ack-box">
      <p class="small"><b>ACKNOWLEDGEMENT:</b> A discussion of duties, responsibilities, performance standards, and expectations for the current period took place on the date below. We acknowledge our understanding of these duties, responsibilities, standards, and expectations, and how they will be used to measure work-related performance during this period.</p>
      <div class="ack-grid"><div><span class="xs muted">Supervisor / Manager</span><div class="small">${managerName()}</div><div class="xs t2" id="ack-manager">${mgr}</div></div>
      <div><span class="xs muted">Employee</span><div class="small">Omar Hassan</div><div class="xs t2" id="ack-employee">${emp}</div></div></div>
      <p class="xs muted">Digital acknowledgement replaces handwritten signatures. It is recorded only after the discussion with Omar.</p>
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
