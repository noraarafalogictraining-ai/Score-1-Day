const CHECK_DEF = {
  S: "Is the result named precisely?", M: "Is there a target or standard?", A: "Is it stretching but realistic?", R: "Does it connect to a 2027 priority?", T: "Is there a timeframe?",
  ctrl: "Can this role materially influence it?", ev: "Is there a trusted evidence source?", br: "Could it be hit without creating value?", bal: "Does the whole contract pull in a sensible direction?",
  link: "Linked to strategy?", rel: "Fits the role's purpose?", def: "Clearly defined?", meas: "Count, rate, value or judgment?", tgt: "Standard for ‘met’?", src: "Evidence source?", freq: "Review rhythm?"
};

function contractEditor(emp) {
  const c = S.begins.contracts[emp];
  const st = contractStats(emp);
  const E = EMPLOYEES[emp];
  const base = `begins.contracts.${emp}`;
  const mBlock = (m, i) => {
    const chk = S.begins.checks[m.id];
    const optional = i >= 3;
    return `<div class="measure">
      <div class="row between"><div class="eyebrow">Objective ${i + 1}${optional ? ` <span class="muted" style="letter-spacing:0;text-transform:none">· optional</span>` : ""}</div>
        <div class="row" style="gap:8px">${chk ? verdictHTML(chk.last) : ""}
          <button class="btn btn-purple btn-quiet" data-act="openChecker" data-emp="${emp}" data-id="${m.id}">✦ Check quality</button>
          ${optional ? `<button class="btn btn-quiet" data-act="removeMeasure" data-emp="${emp}" data-id="${m.id}" aria-label="Remove objective">${icon("x")}</button>` : ""}
        </div></div>
      <div class="measure-grid">
        ${field("Objective", inp(`${base}.measures.${i}.measure`, "What result must this role achieve?"))}
        ${field("Measure / Standard", inp(`${base}.measures.${i}.target`, "What does ‘met’ look like?"))}
        ${field("Weight %", inp(`${base}.measures.${i}.weight`, "%", 'inputmode="numeric" data-rerender="1"'))}
      </div>
      <div class="measure-grid3">
        ${field("Supports which Commercial objective?", selectEl(`${base}.measures.${i}.link`, linkOpts()))}
        ${field("Role responsibility", selectEl(`${base}.measures.${i}.resp`, respOpts(emp)))}
        ${field("Indicator type", selectEl(`${base}.measures.${i}.kind`, KIND_OPTS))}
      </div>
      <div class="measure-grid2">
        ${field("Evidence source", selectEl(`${base}.measures.${i}.evidence`, EVIDENCE_SOURCES))}
        ${field("Review frequency", selectEl(`${base}.measures.${i}.freq`, FREQUENCIES))}
      </div>
    </div>`;
  };
  const req = c.measures.slice(0, 3).map((m, i) => mBlock(m, i)).join("");
  const opt = c.measures.slice(3).map((m, i) => mBlock(m, i + 3)).join("");
  const optOpen = UI.optOpen || c.measures.length > 3;
  const measures = req + `<div class="opt-fold ${optOpen ? "open" : ""}">
    <button class="opt-fold-h" data-act="toggleOptObj" aria-expanded="${optOpen}"><span><b>Optional objectives</b> <span class="xs muted">Up to 2 more · ${c.measures.length - 3} added</span></span><span class="dd-caret">${optOpen ? "▴" : "▾"}</span></button>
    ${optOpen ? `<div class="stack">${opt}${c.measures.length < 5 ? `<button class="btn btn-quiet" data-act="addMeasure" data-emp="${emp}" style="align-self:flex-start">+ Add optional objective</button>` : `<span class="xs muted">Maximum of 5 objectives.</span>`}</div>` : ""}
  </div>`;
  const how = COMPANY.competencies.map(cp => {
    const on = c.how.find(h => h.comp === cp);
    return `<button class="chip p ${on ? "on" : ""}" data-act="toggleHow" data-emp="${emp}" data-comp="${esc(cp)}" ${!on && c.how.length >= 3 ? "disabled" : ""}>${esc(cp)}</button>`;
  }).join("");
  const howFields = c.how.map((h, i) => field(`${esc(h.comp)}: observable behaviour standard`, ta(`${base}.how.${i}.standard`, "What would you see or hear when this is done well in this role?", "sm", 2))).join("");
  return `<div class="split">
    <div class="stack min0">
      <div class="card stack">
        <div class="row between"><div><div class="eyebrow">WHAT</div><h3>Results this role must deliver</h3></div><span class="xs muted">3 required objectives, up to 2 optional · weights total 100%</span></div>
        ${measures}
        <div class="row between">
          <span></span>
          <div style="min-width:180px;flex:0 1 240px"><div class="row between xs"><span class="muted">Total weight</span><b class="num ${st.wsum === 100 ? "status-ok" : "status-refine"}">${st.wsum}%</b></div><div class="weight-bar ${st.wsum > 100 ? "over" : ""}"><i style="width:${Math.min(100, st.wsum)}%"></i></div></div>
        </div>
      </div>
      <div class="card stack">
        <div><div class="eyebrow p">HOW</div><h3>Critical competencies for this role</h3><p class="small muted">Choose 2–3 NextWave competencies and define what good behaviour looks like.</p></div>
        <div class="chips">${how}</div>
        ${howFields}
      </div>
    </div>
    <div class="stack min0 side-col">
      <button class="side-btn" data-act="modal" data-m="role">${roleBadge(emp, 42)}<span class="min0"><b>Role description</b><span>${esc(E.title)} · purpose, responsibilities, reporting line</span></span><i>${icon("arrow")}</i></button>
      <button class="side-btn" data-act="modal" data-m="cobj"><span class="side-ic">${icon("target")}</span><span class="min0"><b>Your Commercial Objectives</b><span>The ${S.begins.priorities.length + (S.begins.ownPriority.trim() ? 1 : 0)} objectives you chose for Commercial</span></span><i>${icon("arrow")}</i></button>
      <button class="side-btn guide" data-act="openGuide"><span class="side-ic">${icon("info")}</span><span class="min0"><b>Guide</b><span>Quick help from the classroom, when you need it</span></span><i>${icon("arrow")}</i></button>
    </div>
  </div>`;
}

function checkerModal() {
  const { emp, id } = UI.checker;
  const c = S.begins.contracts[emp];
  const i = c.measures.findIndex(m => m.id === id);
  if (i < 0) return "";
  const m = c.measures[i];
  const r = checkMeasure(emp, m);
  const base = `begins.contracts.${emp}.measures.${i}`;
  const tabs = [{ id: "objective", l: "Objective check" }, { id: "kpi", l: "KPI check" }];
  const list = UI.checkerTab === "objective" ? [...r.objective.map(x => ({ ...x, grp: "SMART" })), ...r.mgmt.map(x => ({ ...x, grp: "Management" }))] : r.kpi;
  const nudge = UI.nudge[id];
  return `<div class="scrim" data-act="closeModalBg"><div class="modal" role="dialog" aria-modal="true" aria-label="Quality checker">
    <div class="modal-h"><div><div class="eyebrow p">✦ Check quality</div><h3>${esc(EMPLOYEES[emp].title)} · Objective ${i + 1}</h3></div><button class="x" data-act="closeModal" aria-label="Close">${icon("x")}</button></div>
    <div class="modal-b">
            <div class="grid2">
        ${field("Objective", inp(`${base}.measure`, "What result must this role achieve?"))}
        ${field("Measure / Standard", inp(`${base}.target`, "What does ‘met’ look like?"))}
      </div>
      <div class="row between">${verdictHTML(r.overall)}<button class="btn btn-quiet" data-act="recheck">↻ Recheck</button></div>
      <div class="seg">${tabs.map(t => `<button class="${UI.checkerTab === t.id ? "on" : ""}" data-act="checkerTab" data-tab="${t.id}">${t.l}</button>`).join("")}</div>
      <div class="checks">${list.map(x => `<div class="chk"><span class="sym status-${x.status}">${sym(x.status)}</span><div><div><b>${esc(x.label)}</b></div><div class="q">${esc(CHECK_DEF[x.key] || "")}</div></div></div>`).join("")}</div>
      <div class="panel stack" style="gap:10px">
        <div class="row between"><b>Need a nudge?</b><button class="btn btn-quiet" data-act="nudge" data-id="${id}">Give me one question</button></div>
        ${nudge ? `<p class="t2">${esc(nudge)}</p>` : `<p class="small muted">The checker won't write the measure for you. A nudge is one coaching question.</p>`}
      </div>
    </div></div></div>`;
}

const V_BEGINS = [
  {
    render() {
      const b = S.begins;
      const total = b.priorities.length + (b.ownPriority.trim() ? 1 : 0);
      return `${stageHead("begins", "The Year Begins", "")}
      <div class="stack-lg">
        <section class="card pad-lg stack">
          <div class="row between"><div><div class="eyebrow">2027 Strategy</div><h2>${esc(COMPANY.challenge)}</h2></div><span class="row small t2" style="gap:8px"><img src="${IMG.mark}" alt="" class="nw-mark">NextWave Digital</span></div>
          <div class="grid4">${COMPANY.priorities.map(p => `<div class="panel stack" style="gap:6px"><div class="rule" style="color:var(--cyan);letter-spacing:.14em">${p.id}</div><div class="small t2">${esc(p.line)}</div></div>`).join("")}</div>
        </section>
        <section class="card stack">
          <div class="eyebrow p">What Commercial Does</div>
          <h3>${esc(DEPT.purpose)}</h3>
          <p class="t2">${esc(DEPT.description)}</p>
        </section>
        <section class="stack">
          <div><h3>Choose 2–3 Commercial objectives for 2027</h3><p class="small muted">What must Commercial focus on for NextWave to deliver this strategy? Selected: <b class="num">${total}</b> / 3</p></div>
          <div class="chips">${COMMERCIAL_PRIORITY_OPTIONS.map(p => { const on = b.priorities.includes(p.id); return `<button class="chip ${on ? "on" : ""}" data-act="togglePrio" data-id="${p.id}" ${!on && total >= 3 ? "disabled" : ""}>${esc(p.text)}</button>`; }).join("")}</div>
          ${field("Or write your own objective (optional)", inp("begins.ownPriority", "A Commercial objective in your own words", 'data-rerender="1"'))}
          ${field("In one sentence: how does Commercial contribute to the 2027 strategy?", ta("begins.contribution", "Commercial contributes by…", "sm", 2))}
        </section>
      </div>`;
    },
    validate() {
      const b = S.begins; const n = b.priorities.length + (b.ownPriority.trim() ? 1 : 0);
      if (n < 2) return "Choose at least two Commercial objectives.";
      if (n > 3) return "Keep it to three objectives at most.";
      if (!substantive(b.contribution)) return "Write one sentence on how Commercial contributes.";
      return null;
    }
  },
  {
    render() {
      const emp = focusEmp();
      return `${stageHead("begins", "Performance Contract", "Write the contract for the role your group manages: what the role must deliver, and how it must be done.")}
      <div class="row" style="gap:12px;margin:-6px 0 20px">${roleBadge(emp, 40)}<div><div class="eyebrow">Group ${S.group} · Role in focus</div><h3>${esc(EMPLOYEES[emp].title)}</h3></div></div>
      ${contractEditor(emp)}`;
    },
    validate() {
      const e = focusEmp(), c = contractComplete(e);
      if (!c.msOk) return "Complete every field for each objective: objective, measure, weight, Commercial objective, role responsibility, indicator type, evidence source and review frequency.";
      if (!c.wOk) return `Weights must total 100% (currently ${contractStats(e).wsum}%).`;
      if (!c.howOk) return "Choose 2–3 competencies and describe an observable standard for each.";
      return null;
    },
    onNext() { scoreBegins(); }
  }
];