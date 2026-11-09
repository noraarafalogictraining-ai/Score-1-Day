/* =========================================================
   PERFORMANCE GOALS (SCORE Round 1)
   Objectives & KPIs · Competencies & Behavioral Expectations · Review & Submit
   ========================================================= */
const goalsEditable = (r = rec()) => r.goals.status === "not_started" || r.goals.status === "draft";

VIEWS.goals = function () {
  const r = rec(), g = r.goals, E = EMP(), tab = UI.sub || "objectives", ed = goalsEditable(r);
  const banner = g.status === "pending_alignment"
    ? `<div class="notice" style="margin-bottom:14px">${icon("info", "i-sm")}<span class="grow"><b>Pending Employee Alignment.</b> Omar has replied to your plan. The contract is finalised once you have aligned with him.</span><button class="btn sm primary" data-act="go" data-go="conversations/alignment">Open conversation</button></div>`
    : g.status === "approved" ? `<div class="notice good" style="margin-bottom:14px">${icon("check", "i-sm")}<span>The performance contract is confirmed and locked for the year. It will carry forward into the year-end appraisal.</span></div>` : "";
  const tabs = [["objectives", "Performance Objectives", g.objectives.length], ["competencies", "Competencies & Proficiency Levels", g.comps.length], ["submit", ed ? "Review & Submit" : "Summary", null]];
  return pageHead(`Performance Goals / ${esc(E.name)}`, "Performance Goal Plan", statusChip(g.status)) + `
  <div class="card pad" style="margin-bottom:14px"><div class="plan-head">
    <div class="row nowrap" style="gap:12px">${avatar(S.emp, "lg")}<div><h3>${esc(E.name)}</h3><div class="small t2">${esc(E.title)}</div><div class="xs muted">Goal plan ${APP.cycleYear} · ${APP.cycleLabel} · <span class="round-tag">Round 1</span></div></div></div>
    <div class="row"><button class="btn sm" data-act="modal" data-m="profile" data-emp="${S.emp}">${icon("user", "i-sm")} Profile</button>${ed ? `<button class="btn primary" data-act="go" data-go="goals/submit">${icon("send", "i-sm")} Submit for Employee Alignment</button>` : ""}</div>
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
  const g = r.goals, lib = competencyLibrary(), selIds = g.comps.map(c => c.id), full = g.comps.length >= COMP_RANGE.max;
  return `<div class="comp-layout">
    <div class="card"><div class="card-h"><div><h3>Competency library</h3><div class="xs muted">${lib.length} NextWave competencies · each with three observable proficiency levels</div></div></div><div class="card-b stack" style="gap:10px">
      ${lib.map(c => { const on = selIds.includes(c.id), open = UI.libOpen === c.id; return `<div class="lib-item ${on ? "sel" : ""}">
        <div class="row between nowrap"><b class="small">${esc(c.name)}</b><span class="row nowrap" style="gap:4px"><button class="btn ghost sm" data-act="libOpen" data-id="${c.id}">${open ? "Hide levels" : "View levels"}</button>${ed ? (on ? `<button class="btn sm" data-act="compDel" data-id="${c.id}">Remove</button>` : `<button class="btn sm ${full ? "disabled" : "primary"}" data-act="compAdd" data-id="${c.id}" ${full ? "disabled" : ""}>${icon("plus", "i-sm")} Add</button>`) : on ? `<span class="chip st-approved">Selected</span>` : ""}</span></div>
        ${open ? `<div class="levels stacked">${LEVELS.map(l => `<div class="level"><h4>${l.l}</h4>${esc(c.levels[l.id])}</div>`).join("")}</div>` : ""}
      </div>`; }).join("")}
    </div></div>
    <div class="stack">
      <div class="summary-bar"><div class="sb-item"><span class="xs muted">Selected competencies</span><b class="num">${g.comps.length} / ${COMP_RANGE.max}</b><span class="xs muted">Select ${COMP_RANGE.min}–${COMP_RANGE.max}</span></div><div class="sb-item"><span class="xs muted">Expected levels set</span><b class="num">${g.comps.filter(c => c.level).length}</b></div><div class="sb-item"><span class="xs muted">Note</span><span class="xs t2">The expected level is what the role requires. It is not a performance rating.</span></div></div>
      ${g.comps.length ? g.comps.map((c, i) => selectedComp(c, i, ed, g.tried)).join("") : `<div class="card"><div class="empty">${icon("layers")}<b>No competencies selected yet</b><span class="small">Choose ${COMP_RANGE.min}–${COMP_RANGE.max} competencies that matter most for Omar's role.</span></div></div>`}
    </div>
  </div>`;
}
function selectedComp(c, i, ed, tried) {
  const L = competencyById(S.emp, c.id) || { name: "Competency", levels: {} }, base = P("goals", "comps", i);
  return `<div class="card" id="comp-${c.id}"><div class="card-h"><h3>${esc(L.name)}</h3>${ed ? `<button class="btn ghost sm" data-act="compDel" data-id="${c.id}">Remove</button>` : ""}</div><div class="card-b stack" style="gap:12px">
    <div class="field"><span class="lbl">Expected proficiency level <span class="req">*</span></span>
      ${ed ? `<div class="seg ${tried && !c.level ? "err" : ""}" role="radiogroup">${LEVELS.map(l => `<button role="radio" aria-checked="${c.level === l.id}" class="${c.level === l.id ? "on" : ""}" data-act="compLevel" data-i="${i}" data-v="${l.id}">${l.l}</button>`).join("")}</div>` : `<div><span class="tag blue">${levelLabel(c.level)}</span></div>`}
    </div>
    ${c.level ? `<div class="level on"><h4>${levelLabel(c.level)} level: observable behaviour</h4>${esc(L.levels[c.level])}</div>` : ""}
    <div class="field"><label class="lbl" for="${base}.standard">Expected behavioural standard (optional)</label>${ed ? `<textarea class="ta" rows="2" id="${base}.standard" ${bind(base + ".standard")} placeholder="Add or clarify what you expect to see or hear.">${esc(c.standard || "")}</textarea>` : `<div class="small t2">${c.standard ? esc(c.standard) : `<span class="muted">None added</span>`}</div>`}</div>
  </div></div>`;
}
function submitTab(r, ed) {
  const g = r.goals, v = planValidation(r);
  const checklist = `<div class="checklist">${v.errors.map(e => `<div class="ck no">${icon("x", "i-sm")}<span>${esc(e)}</span></div>`).join("")}${v.notes.map(e => `<div class="ck note">${icon("info", "i-sm")}<span>${esc(e)} This will not block submission.</span></div>`).join("")}${v.ok ? `<div class="ck ok">${icon("check", "i-sm")}<span>All required information is complete and the weights total 100%.</span></div>` : ""}</div>`;
  return `<div class="stack-lg">
    ${ed ? `<div class="card"><div class="card-h"><h3>Validation</h3>${v.ok ? `<span class="chip st-approved">Ready to submit</span>` : `<span class="chip st-action">${plural(v.errors.length, "item", "items")} to fix</span>`}</div><div class="card-b stack">${checklist}
      <div class="row between"><span class="xs muted">Submitting sends the plan to Omar for alignment. The contract is only confirmed after you have aligned with him.</span><button class="btn primary" data-act="submitGoals" id="submit-goals">${icon("send", "i-sm")} Submit for Employee Alignment</button></div></div></div>` : ""}
    <div class="card"><div class="card-h"><h3>Performance objectives</h3><span class="small num">Total weight ${weightTotal(r)}%</span></div>
      <div class="table-wrap" style="border:0;border-radius:0"><table class="tbl" style="min-width:760px"><thead><tr><th>#</th><th>Objective</th><th>KPI / Performance measure</th><th>Weight</th><th>Evidence source</th><th>Review</th></tr></thead><tbody>
      ${g.objectives.length ? g.objectives.map((o, i) => `<tr><td>${i + 1}</td><td>${esc(o.objective) || "<span class='muted'>—</span>"}</td><td>${esc(o.kpi) || "<span class='muted'>—</span>"}</td><td class="num">${o.weight !== "" ? num(o.weight) + "%" : "—"}</td><td>${esc(evidenceLabel(o)) || "—"}</td><td>${esc(o.freq) || "—"}</td></tr>`).join("") : `<tr><td colspan="6" class="muted">No objectives yet.</td></tr>`}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><h3>Competencies &amp; behavioral expectations</h3></div><div class="card-b stack" style="gap:8px">
      ${g.comps.length ? g.comps.map(c => `<div class="row between nowrap" style="border-bottom:1px solid var(--line);padding-bottom:8px"><div class="grow"><b class="small">${esc(compName(c.id))}</b><div class="xs muted">${c.standard ? esc(c.standard) : "No additional standard"}</div></div><span class="tag blue">${(LEVELS.find(l => l.id === c.level) || {}).l || "Level not set"}</span></div>`).join("") : `<span class="small muted">No competencies selected.</span>`}
    </div></div>
  </div>`;
}

