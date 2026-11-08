
/* =========================================================
   ROUND 1 — BEHIND THE PERFORMANCE (not scored)
   ========================================================= */
function storyView(emp) {
  const Em = EMPLOYEES[emp], N = NEEDS[emp], i = EMP_ORDER.indexOf(emp);
  const next = EMP_ORDER[(i + 1) % 4];
  return `<div class="stack fade-in" style="gap:20px">
    <div class="story">
      <div class="stack min0">
        <div class="story-photo"><img src="${PHOTO_URLS[emp]}" alt="${esc(Em.name)}"></div>
        <div><h2>${esc(Em.name)}</h2><div class="muted">${esc(Em.title)}</div></div>
        <div class="kv"><div><div class="k">Experience</div><div class="v small">${esc(Em.tenure)}</div>${Em.total ? `<div class="xs t2">${esc(Em.total)}</div>` : ""}</div><div><div class="k">Last year</div><div class="v small">${esc(Em.prevRating)}</div></div></div>
      </div>
      <div class="stack min0">
        <div class="card stack" style="gap:10px"><div class="eyebrow">In ${esc(Em.first)}'s words</div>
          ${voiceNote({ id: "r1-" + emp, from: emp, source: "Voice note to you", text: N.message })}</div>
        <div class="grid2">
          <div class="panel stack" style="gap:6px"><div class="eyebrow">Their story</div><p class="small t2">${esc(Em.story)}</p></div>
          <div class="panel stack" style="gap:6px"><div class="eyebrow">Last year</div><p class="small t2">${esc(Em.prevPerformance)}</p></div>
        </div>
        <div class="stack" style="gap:8px"><div class="eyebrow">Strengths</div><div class="chips">${Em.strengths.map(s => `<span class="strength">${esc(s)}</span>`).join("")}</div></div>
        <div class="panel small"><b>Role.</b> <span class="t2">${esc(Em.role.purpose)}</span></div>
      </div>
    </div>
    <div class="nav-foot"><button class="btn btn-ghost" data-act="storyBack">← Back to the team</button>${i === EMP_ORDER.length - 1 ? `<button class="btn btn-primary" data-act="next" data-stage="r1">Next: Define the Need ${icon("arrow")}</button>` : `<button class="btn btn-primary" data-act="story" data-emp="${next}">Next story: ${esc(EMPLOYEES[next].first)} ${icon("arrow")}</button>`}</div>
  </div>`;
}
const V_R1 = [
  {
    render() {
      if (UI.story) return storyView(UI.story);
      return `${stageHead("r1", "Behind the Performance", "")}
      <div class="split">
        <div class="stack min0">${teamsChat([
        "Every employee brings different strengths, expectations, and challenges to work.",
        "Before we start setting targets and evaluating results, I want you to understand the people behind our performance.",
        "What does each employee need to perform at their best?"], "8:47 AM", "Before the Performance Year Begins")}</div>
        <div class="stack min0">${callout(`<b>There are no right or wrong answers.</b> <span class="t2">Listen, explore and understand.</span>`, "cy")}</div>
      </div>
      <section class="stack" style="margin-top:34px"><div><div class="eyebrow">Meet the NextWave team</div><h2>Four people in your Commercial team</h2></div>
        <div class="grid4">${EMP_ORDER.map(e => `<button class="team-card" data-act="story" data-emp="${e}">
          ${S.r1.viewed[e] ? `<span class="seen-tick">${icon("check")}</span>` : ""}
          <span class="ph"><img src="${PHOTO_URLS[e]}" alt=""></span>
          <span class="bd"><span class="nm">${esc(EMPLOYEES[e].name)}</span><span class="tt">${esc(EMPLOYEES[e].title)}</span></span>
        </button>`).join("")}</div></section>`;
    },
    validate: () => null
  },
  {
    render() {
      return `${stageHead("r1", "Define the Need", "")}
      <div class="grid2">${EMP_ORDER.map(e => `<div class="card stack">
        <div class="row between"><div class="min0" style="flex:1">${empLine(e, 52)}</div><button class="btn btn-quiet" data-act="storyFrom" data-emp="${e}">Story</button></div>
        ${field(esc(R1_QUESTIONS[0]), ta(`r1.ans.${e}.need`, "", "sm", 3))}
        ${field(esc(R1_QUESTIONS[1]), ta(`r1.ans.${e}.risk`, "", "sm", 3))}
      </div>`).join("")}</div>`;
    },
    validate: () => null
  }
];

/* =========================================================
   ROUND 3 — PERFORMANCE EVALUATION
   ========================================================= */
function refButtons() {
  return `<button class="btn btn-quiet" data-act="openContract">${icon("list")} Your Round 2 contract</button>`;
}
const stdIds = (e) => [].concat(e.std || []);
const V_EVAL = [
  {
    render() {
      const emp = focusEmp(), Em = EMPLOYEES[emp];
      return `${stageHead("evaluate", "Performance Review", "")}
      <div class="split">
        <div class="stack min0">${teamsChat([
        "Year-end reviews are due this week.",
        `Before you rate ${esc(Em.first)}, look at the whole year, not just what you remember from the last few weeks.`,
        "The key evidence documented this year is in the evidence log below. Rate against what was expected, and be ready to show the evidence behind your rating."], "9:30 AM", "Year-end reviews")}</div>
        <div class="stack min0">
          <div class="card stack" style="padding:18px"><div class="eyebrow">Group ${S.group} · Your employee</div>${empLine(emp, 56)}
            <div class="panel small"><div class="xs muted">Last year</div><b>${esc(Em.prevRating)}</b></div></div>
          ${refButtons()}
        </div>
      </div>
      <section class="stack" style="margin-top:30px">
        <div><div class="eyebrow">Performance evidence log</div><h2>${esc(Em.name)} · January to December</h2></div>
        ${logTable(emp, LOG[emp])}
      </section>`;
    },
    validate: () => null
  },
  {
    render() {
      const emp = focusEmp();
      const card = (s) => {
        const evs = LOG[emp].filter(e => stdIds(e).includes(s.id));
        return `<div class="std-card"><div class="stack min0" style="gap:6px"><div class="row" style="gap:8px"><span class="dimtag ${s.dim === "WHAT" ? "what" : "how"}">${s.dim}</span>${s.w ? `<span class="xs muted">${s.w}%</span>` : ""}</div><h4>${esc(s.name)}</h4>
          <div class="xs muted" style="text-transform:uppercase;letter-spacing:.1em">Expected</div><p class="small t2">${esc(s.exp)}</p></div>
          <div class="stack min0" style="gap:4px"><div class="xs muted" style="text-transform:uppercase;letter-spacing:.1em">Actual · related evidence</div>
            ${evs.map(e => `<div class="mini-ev"><span class="min0"><span class="tagline">${esc(e.p)}</span> ${esc(e.text)}</span></div>`).join("")}
            <div class="row" style="margin-top:8px;gap:10px"><span class="xs muted">Your judgment</span>${seg(`ev.judg.${s.id}`, JUDG, "judg")}</div>
            ${inp(`ev.notes.${s.id}`, "Gap in one line (optional): expected … / actual …")}
          </div></div>`;
      };
      return `${stageHead("evaluate", "Identify Performance Gaps", "Compare what was expected with what actually happened, standard by standard. Then separate facts from interpretations.")}
      <div class="row" style="margin:-8px 0 16px;justify-content:flex-end">${refButtons()}</div>
      <section class="stack"><div class="eyebrow">A · Expected vs. actual</div>${STD[emp].map(card).join("")}</section>
      <section class="stack" style="margin-top:30px"><div><div class="eyebrow p">B · Facts vs. interpretation</div><h3>Which of these statements could stand in a review as fact?</h3></div>
        <div class="stack" style="gap:8px">${SORT[emp].map(s => `<div class="sort-row"><span class="min0">“${esc(s.t)}”</span>${seg(`ev.sort.${s.id}`, [{ id: "fact", l: "Fact" }, { id: "interp", l: "Interpretation" }])}</div>`).join("")}</div>
      </section>`;
    },
    validate() {
      const emp = focusEmp();
      if (STD[emp].some(s => !S.ev.judg[s.id])) return "Judge every standard as Below, Met or Above.";
      if (SORT[emp].some(s => !S.ev.sort[s.id])) return "Sort every statement as fact or interpretation.";
      return null;
    }
  },
  {
    render() {
      const emp = focusEmp(), V = S.ev, n = V.picks.length;
      const row = (s) => `<div class="row between small" style="padding:8px 0;border-top:1px solid var(--line)"><span>${esc(s.name)}</span>${judgTag(V.judg[s.id])}</div>`;
      return `${stageHead("evaluate", "Evaluate and Rate", "Bring your judgments together, choose the rating, and show the evidence behind it. You can change anything until you submit.")}
      <section class="grid2">
        <div class="card stack"><div class="eyebrow">WHAT · objectives, KPIs and results</div><div>${STD[emp].filter(s => s.dim === "WHAT").map(row).join("")}</div>
          <div class="stack" style="gap:8px"><b>Overall WHAT</b>${seg("ev.what", WH_OPTS)}</div></div>
        <div class="card stack"><div class="eyebrow p">HOW · competencies and observable behaviour</div><div>${STD[emp].filter(s => s.dim === "HOW").map(row).join("")}</div>
          <div class="stack" style="gap:8px"><b>Overall HOW</b>${seg("ev.how", WH_OPTS)}</div></div>
      </section>
      <section class="stack" style="margin-top:28px"><div class="eyebrow">Performance rating</div>
        <div class="rate-grid">${R3_SCALE.map(r => `<button class="rate r${r.v} ${V.rating === r.v ? "on" : ""}" data-act="set" data-path="ev.rating" data-val="${r.v}" data-num="1"><b>${r.v}</b><span>${r.label}</span></button>`).join("")}</div>
      </section>
      <section class="stack" style="margin-top:28px"><div class="row between"><div class="eyebrow">Select 2–4 evidence entries</div><span class="small ${n >= 2 && n <= 4 ? "status-ok" : "muted"}"><b class="num">${n}</b> / 4 selected</span></div>
        <div class="pick-list">${LOG[emp].map(e => { const on = V.picks.includes(e.id); return `<button class="pick-ev ${on ? "on" : ""}" data-act="pickEv" data-id="${e.id}" ${!on && n >= 4 ? "disabled" : ""}><span class="dd-check">${on ? "✓" : ""}</span><span class="min0"><span class="row" style="gap:6px;margin-bottom:3px"><span class="tagline">${esc(e.p)}</span></span><span class="small">${esc(e.text)}</span></span></button>`; }).join("")}</div>
      </section>
      <section class="stack" style="margin-top:28px"><div class="eyebrow">Justification</div>
        ${ta("ev.just", "In two or three sentences: why this rating, based on the evidence you selected?", "", 4)}</section>`;
    },
    validate() {
      const V = S.ev;
      if (!V.what) return "Choose an overall WHAT judgment.";
      if (!V.how) return "Choose an overall HOW judgment.";
      if (!V.rating) return "Select a performance rating.";
      if (V.picks.length < 2 || V.picks.length > 4) return "Select 2–4 evidence entries.";
      if (!substantive(V.just)) return "Write a short justification.";
      return null;
    },
    onNext() { scoreEval(); }
  }
];

/* =========================================================
   RESULTS · GATES · SUMMARY
   ========================================================= */
function moveCard(stage) {
  const p = bmPath().find(x => x.stage === stage);
  if (!p) return `<div class="move"><div class="xs muted">Simulation leadership rating · game indicator</div><div class="move-n num">★ ${bmRating().toFixed(2)}</div><div class="small muted">Moves once every criterion in this round is assessed.</div></div>`;
  return `<div class="move"><div class="xs muted">Simulation leadership rating · game indicator</div><div class="move-n num">${p.before.toFixed(2)} <span class="muted">→</span> <b>★ ${p.v.toFixed(2)}</b></div><div class="small ${p.delta > 0 ? "status-ok" : p.delta < 0 ? "status-risk" : "muted"}">${p.delta > 0 ? "+" : ""}${p.delta.toFixed(2)} · round score ${p.total}/10</div></div>`;
}
function viewR2Results(readonly) {
  const emp = focusEmp();
  return `<main class="page stack-lg"><section class="stack fade-in"><div class="kicker row" style="gap:10px"><span class="score-tag">ROUND 2</span><span class="month-tag">Setting KPIs Results</span></div><h1>Your performance contract is set.</h1>
    <p class="lead">Review your contract for the ${esc(EMPLOYEES[emp].title)} role against the principles of setting performance expectations.</p></section>
    <section class="row between" style="gap:16px;flex-wrap:wrap">${moveCard("begins")}</section>
    <section class="card stack"><div class="eyebrow">Your contract · Group ${S.group}</div>${contractView(emp)}</section>
    ${assessSection(2)}
    ${facPanel()}
    ${readonly ? "" : `<div class="nav-foot"><span></span><button class="btn btn-primary" data-act="r2seen">Continue ${icon("arrow")}</button></div>`}</main>`;
}
function pauseView(stage) {
  const r2 = stage === "begins";
  return `<main class="page"><div class="pause fade-in">
    ${r2 ? `<div class="closing-quote"><span>${esc(R1_CLOSE[0])}</span> ${esc(R1_CLOSE[1])}</div>` : ""}
    <div class="pulse">${icon("book")}</div>
    <div class="eyebrow">Pause for classroom learning</div>
    <h1>${r2 ? "Round 1 is complete." : "Round 2 is complete."}</h1>
    <div class="code-box"><label class="lbl" for="relcode">Facilitator release code</label>
      <div class="row" style="gap:8px;justify-content:center"><input class="inp code-inp" id="relcode" inputmode="numeric" autocomplete="off" placeholder="••••" data-stage="${stage}"><button class="btn btn-primary" data-act="unlock" data-stage="${stage}">Release ${r2 ? "Round 2" : "Round 3"} ${icon("arrow")}</button></div>
      ${UI.codeErr ? `<div class="hint-err" role="alert">${esc(UI.codeErr)}</div>` : ""}</div>
    <p class="xs muted">Your progress is saved on this device.</p>
  </div></main>`;
}
function viewGate(stage) {
  if (stage === "evaluate" && !S.prog.r2seen) return viewR2Results(false);
  return pauseView(stage);
}
function rangeText(arr) { return arr.length > 1 ? `${arr[0]} to ${arr[arr.length - 1]}` : String(arr[0]); }
function viewR3Results() {
  const emp = focusEmp(), Em = EMPLOYEES[emp], V = S.ev, R = REF[emp], K = R3_KEY[emp];
  const ent = (id) => entry(emp, id);
  const evChip = (e) => `<div class="mini-ev"><span class="min0"><span class="tagline">${esc(e.p)}</span> ${esc(e.text)}</span></div>`;
  return `<main class="page stack-lg"><section class="stack fade-in"><div class="kicker row" style="gap:10px"><span class="score-tag">ROUND 3</span><span class="month-tag">Performance Evaluation Results</span></div><h1>Evaluation submitted.</h1>
    <p class="lead">Your evaluation of ${esc(Em.name)} next to the reference reading. Different ratings inside the defensible range are equally valid.</p></section>
    <section class="compare">
      <div class="card stack"><div class="eyebrow">Your evaluation · Group ${S.group}</div><div class="big-rate r${V.rating}"><b>${V.rating}</b><span>${R3_SCALE.find(r => r.v === V.rating).label}</span></div>
        <div class="small t2">WHAT: <b>${WH_OPTS.find(o => o.id === V.what).l}</b> · HOW: <b>${WH_OPTS.find(o => o.id === V.how).l}</b></div>
        <p class="small t2">“${esc(V.just)}”</p>
        <div class="stack" style="gap:4px"><div class="xs muted">Evidence you selected</div>${V.picks.map(ent).filter(Boolean).map(evChip).join("")}</div></div>
      <div class="card stack focus"><div class="eyebrow p">Reference reading · provisional</div><div class="big-rate"><b>${rangeText(K.def)}</b><span>defensible range</span></div>
        <div class="small"><b>WHAT · </b><span class="t2">${esc(R.whatWhy)}</span></div>
        <div class="small"><b>HOW · </b><span class="t2">${esc(R.howWhy)}</span></div>
        <div class="small"><b>Rating · </b><span class="t2">${esc(R.ratingWhy)}</span></div></div>
    </section>
    <section class="row" style="gap:16px">${moveCard("evaluate")}</section>
    ${assessSection(3)}
    ${facPanel()}
    <div class="nav-foot"><span></span><button class="btn btn-primary" data-act="goStage" data-stage="summary">Final simulation summary ${icon("arrow")}</button></div></main>`;
}
function trajectorySVG() {
  const pts = bmPath();
  const W = 560, H = 170, pl = 40, pr = 30, pt = 18, pb = 34;
  const x = (i) => pl + i * (W - pl - pr) / Math.max(1, pts.length - 1);
  const y = (v) => pt + (5 - v) / 4 * (H - pt - pb);
  const grid = [1, 2, 3, 4, 5].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(150,180,230,.12)"/><text x="${pl - 10}" y="${y(v) + 4}" fill="#8494B2" font-size="11" text-anchor="end">${v}</text>`).join("");
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.v)}`).join(" ");
  return `<div style="overflow-x:auto"><svg class="traj" viewBox="0 0 ${W} ${H}" role="img" aria-label="Leadership rating path" style="min-width:360px">${grid}<path d="${path}" fill="none" stroke="#49CFE0" stroke-width="2.5"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="${i === pts.length - 1 ? 5.5 : 4}" fill="${i === pts.length - 1 ? "#9A8CF2" : "#49CFE0"}"/><text x="${x(i)}" y="${y(p.v) - 10}" fill="#E9EEF7" font-size="11" text-anchor="middle">${p.v.toFixed(2)}</text><text x="${x(i)}" y="${H - 10}" fill="#8494B2" font-size="11" text-anchor="middle">${esc(p.l)}</text>`).join("")}</svg></div>`;
}
function viewSummary() {
  const sc = appScore(), emp = focusEmp(), Em = EMPLOYEES[emp];
  return `<main class="page stack-lg">
    <section class="stack fade-in"><div class="eyebrow">Final simulation summary</div><h1>Your SCORE Performance Debrief</h1><p class="lead">What you applied well, what to strengthen, and how to use it at work.</p></section>
    <section class="card pad-lg stack"><div class="eyebrow p">Simulation Application Score${sc.provisional ? " · provisional" : ""}</div>
      <div class="row between"><h2>How well you applied the course</h2><div class="big-score">${sc.total}<span class="muted" style="font-size:.4em"> / 100</span></div></div>
      ${sc.provisional ? `<p class="small status-refine">${sc.pending} criteri${sc.pending === 1 ? "on is" : "a are"} not yet assessed and count as 0. Complete the self-assessment on the Round 2 and Round 3 results pages for a final score.</p>` : ""}
      <div class="stack" style="gap:14px">${[["Round 2 · Setting Performance Expectations", sc.r2], ["Round 3 · Evaluating Performance Fairly", sc.r3]].map(([l, v]) => `<div class="stack" style="gap:6px"><div class="row between small"><span><b>${l}</b> <span class="muted">· 50%</span></span><b class="num">${v}/10</b></div><div class="bar"><i style="width:${v * 10}%"></i></div></div>`).join("")}</div>
      <div class="row" style="gap:10px;flex-wrap:wrap"><span class="src-tag src-auto">Automated ${sc.auto}</span><span class="src-tag src-self">Self-assessed ${sc.self}</span><span class="src-tag src-facilitator">Facilitator-validated ${sc.fac}</span></div>
      <p class="xs muted">(Round 2 + Round 3) × 5. Automated points come from verifiable decisions; self-assessed points are your own rubric judgments, limited by the automated checks; facilitator-validated points replace either. Round 1 is not scored.</p></section>
    <section class="card pad-lg stack"><div class="eyebrow p">Game indicator</div><div class="row between"><h2>Simulation leadership rating</h2><div class="big-score" style="color:var(--purple)">★ ${bmRating().toFixed(2)}</div></div>
      ${trajectorySVG()}<p class="xs muted">A gamified simulation indicator, not a validated measure of leadership competence. It starts at 3.00 and moves after each scored round: 9–10 points +0.50 · 7–8 +0.25 · 5–6 no change · 3–4 −0.25 · 0–2 −0.50. It is separate from the Application Score.</p></section>
    ${debriefSection(2, "Round 2 · Setting Performance Expectations")}
    ${debriefSection(3, "Round 3 · Evaluating Performance Fairly")}
    ${facPanel()}
    ${practiceCheck()}
    <section class="card pad-lg stack next-up"><div class="eyebrow">Next · in the classroom</div><h2>Your rating is ready. Now you have to deliver it.</h2>
      <p class="t2" style="max-width:66ch">The simulation ends here. In the classroom you'll conduct the appraisal meeting for ${esc(Em.first)}: open with the rating and the evidence, give feedback using SBI (Situation · Behaviour · Impact), and agree the way forward.</p>
      <div class="row" style="gap:10px"><span class="need-chip">${icon("chat")}The Appraisal Meeting</span><span class="tagline">SBI feedback role-play · trainer-led</span></div></section>
    <section class="close-block"><div class="l1">THE YEAR IS OVER.<br><span>PERFORMANCE MANAGEMENT ISN'T.</span></div></section>
  </main>`;
}
function viewDone(stage) {
  return `<main class="page"><div class="stack fade-in" style="max-width:760px">
    <div class="eyebrow">${STAGES.find(s => s.id === stage).short} · completed</div><h1>${stage === "r1" ? "Round 1 is complete." : "This round is complete."}</h1>
    <p class="lead">${stage === "r1" ? "You can reopen the team's stories from the Commercial Hub at any time." : "Completed rounds can't be edited."}</p>
    <div class="row"><button class="btn btn-primary" data-act="goStage" data-stage="${currentStage()}">Go to ${STAGES.find(s => s.id === currentStage()).short} ${icon("arrow")}</button>${stage === "r1" ? `<button class="btn btn-ghost" data-act="nav" data-to="hub">Commercial Hub</button>` : ""}</div>
  </div></main>`;
}

/* =========================================================
   FRAME · HOME · HUB · GROUP · DRAWER · MODALS
   ========================================================= */
const STAGE_VIEWS = { r1: V_R1, begins: V_BEGINS, evaluate: V_EVAL };
const stageIdx = (id) => STAGES.findIndex(s => s.id === id);
function currentStage() { return (STAGES.find(s => !S.prog.done[s.id]) || STAGES[STAGES.length - 1]).id; }
function stageAccessible(id) { return STAGES.slice(0, stageIdx(id)).every(s => S.prog.done[s.id]); }
function parseHash() {
  const h = (location.hash || "#home").slice(1);
  const m = h.match(/^([a-z0-9]+)(?:-([a-z0-9]+))?$/);
  if (!m) return { view: "home" };
  const [, a, b] = m;
  if (STAGE_VIEWS[a] || a === "summary") return { view: "stage", stage: a, step: b != null ? parseInt(b, 10) : null };
  if (a === "profile") return { view: "hub", emp: b };
  if (["home", "company", "hub", "group"].includes(a)) return { view: a };
  return { view: "home" };
}
function go(hash) { if (location.hash === "#" + hash) render(); else location.hash = hash; }
function stageHash(stage) { return S.prog.done[stage] || stage === "summary" ? stage : `${stage}-${S.prog.step[stage] || 0}`; }
function groupLocked() { return !!(S.prog.done.begins || (S.prog.maxStep.begins || 0) >= 1); }

function topbar(route) {
  const cur = route.view === "stage" ? route.stage : null;
  const rail = STAGES.map((s, i) => `${i ? '<span class="rail-sep"></span>' : ""}<button class="rail-item ${S.prog.done[s.id] ? "done" : ""} ${cur === s.id ? "current" : ""}" data-act="goStage" data-stage="${s.id}" ${stageAccessible(s.id) ? "" : "disabled"}><span class="dot"></span>${s.short}${s.id !== "summary" ? ` <span class="rail-l">· ${s.label}</span>` : ""}</button>`).join("");
  const curLabel = cur ? `${STAGES.find(s => s.id === cur).short} · ${STAGES.find(s => s.id === cur).label}` : route.view === "company" ? "Company profile" : route.view === "hub" ? "Commercial Hub" : route.view === "group" ? "Group selection" : "";
  return `<header class="topbar"><div class="topbar-in">
    <button class="brand" data-act="nav" data-to="home" aria-label="SCORE home"><img src="${IMG.logoTop}" alt="NextWave Digital" class="tb-logo"></button>
    <nav class="rail" aria-label="Simulation rounds">${rail}</nav>
    ${S.group ? `<button class="group-chip" data-act="nav" data-to="group" title="Your group"><b>${S.group}</b><span>Group ${S.group}</span></button>` : ""}
    <div class="mobile-stage">${esc(curLabel)}</div>
    <div class="tools">
      ${S.prog.released.begins ? `<button class="bm-chip" data-act="modal" data-m="bm" title="Leadership rating"><span class="star">★</span>${bmRating().toFixed(2)}</button>` : ""}
      <button class="pill-btn" data-act="drawer">${icon("list")}<span class="lbl-t">Year so far</span></button>
      <div class="menu-wrap"><button class="pill-btn" data-act="menu" aria-label="Menu">${icon("menu")}</button>
      ${UI.menu ? `<div class="menu">
        <button data-act="nav" data-to="home">${icon("home")} Home</button>
        <button data-act="nav" data-to="company">${icon("building")} Company profile</button>
        <button data-act="nav" data-to="hub">${icon("people")} Commercial Hub</button>
        ${S.group ? `<button data-act="nav" data-to="group">${icon("flag")} Your group</button>` : ""}
        <button data-act="goStage" data-stage="${currentStage()}">${icon("arrow")} Current round</button>
        <div class="divider"></div>
        <button class="danger" data-act="modal" data-m="reset">${icon("reset")} Reset simulation</button></div>` : ""}</div>
    </div></div></header>`;
}
function viewHome() {
  const started = S.prog.maxStep.r1 || S.prog.done.r1;
  const tl = [["Round 1", "Behind the Performance", "Before the year"], ["Round 2", "Setting KPIs", "Q1"], ["Round 3", "Performance Evaluation", "Year-end"], ["Summary", "Final Results", ""]];
  return `<main class="page"><section class="hero fade-in">
    <div class="row" style="gap:12px"><img src="${IMG.mark}" alt="" class="nw-mark"><span class="eyebrow">NextWave Digital</span></div>
    <div class="stack" style="gap:14px"><img src="${IMG.scoreHero}" alt="SCORE" class="hero-score"><div class="sub">Performance Management Simulation</div></div>
    <div class="tagl">ONE TEAM.<br>ONE PERFORMANCE YEAR.<br><em>YOUR CALLS.</em></div>
    <p class="lead">Step into the role of NextWave Digital's Commercial Director. Get to know the people behind the performance, set expectations for the year, and evaluate performance on the evidence.</p>
    <div class="row"><button class="btn btn-primary" data-act="begin">${started ? "CONTINUE" : "BEGIN"} ${icon("arrow")}</button><button class="btn btn-ghost" data-act="nav" data-to="company">Explore NextWave Digital</button>${started ? `<span class="small muted">Your progress is saved on this device.</span>` : ""}</div>
  </section>
  <section style="margin-top:40px"><div class="eyebrow" style="margin-bottom:6px">The simulation</div>
    <div class="timeline t4">${tl.map(([a, b, c]) => `<div class="tl"><div class="ts">${a}</div><div class="tn">${b}</div><div class="tm">${c}</div></div>`).join("")}</div></section>
  </main>`;
}
function viewHub() {
  return `<main class="page stack-lg">
    <section class="stack fade-in"><div class="row" style="gap:10px"><img src="${IMG.mark}" alt="" class="nw-mark"><div class="eyebrow">NextWave Digital · Commercial Hub</div></div><h1>Commercial</h1>
      <div class="card stack" style="max-width:720px"><div class="eyebrow p">Purpose</div><p style="font-size:1.15rem">${esc(DEPT.purpose)}</p></div></section>
    <section class="stack"><h2>Meet your team</h2>
      <div class="grid4">${EMP_ORDER.map(e => `<button class="emp-card" data-act="profile" data-emp="${e}">${portrait(e, 116)}<div><div class="nm">${esc(EMPLOYEES[e].name)}</div><div class="tt">${esc(EMPLOYEES[e].title)}</div></div></button>`).join("")}</div></section>
  </main>`;
}
function viewGroup() {
  const locked = groupLocked(), g = S.group ? GROUPS.find(x => x.n === S.group) : null;
  return `<main class="page stack-lg">
    <section class="stack fade-in"><div class="kicker row" style="gap:10px"><span class="score-tag">ROUND 2</span><span class="month-tag">Before Setting KPIs</span></div><h1>Which group are you in?</h1>
</section>
    <section class="grid4">${GROUPS.map(x => { const on = S.group === x.n; return `<button class="pick group-card ${on ? "on" : ""}" data-act="chooseGroup" data-n="${x.n}" ${locked && !on ? "disabled" : ""} aria-pressed="${on}">${on ? `<span class="badge">SELECTED</span>` : ""}<div class="group-n">Group</div><div class="group-num">${x.n}</div></button>`; }).join("")}</section>
    <div class="nav-foot"><span></span>${S.group ? `<button class="btn btn-primary" data-act="goStage" data-stage="${currentStage()}">Continue to Round 2 ${icon("arrow")}</button>` : "<span></span>"}</div>
  </main>`;
}
function yearSoFar() {
  const d = S.prog.done, blocks = [], fe = focusEmp();
  const seen = EMP_ORDER.filter(e => S.r1.viewed[e]).map(e => EMPLOYEES[e].first);
  if (seen.length || d.r1) blocks.push(["Round 1 · Behind the Performance", [`Stories explored: ${seen.join(", ") || "none yet"}.`]]);
  if (S.group) blocks.push(["Your group", [`Group ${S.group} · ${esc(EMPLOYEES[fe].name)}`]]);
  if (d.begins) blocks.push(["Round 2 · Setting KPIs", [`Commercial objectives: ${[...S.begins.priorities.map(id => COMMERCIAL_PRIORITY_OPTIONS.find(p => p.id === id).text), S.begins.ownPriority].filter(Boolean).map(esc).join("; ")}.`, `<b>${esc(EMPLOYEES[fe].title)}</b>: ${S.begins.contracts[fe].measures.map(m => esc(m.measure) + " (" + esc(m.weight) + "%)").join(", ")} · HOW: ${S.begins.contracts[fe].how.map(h => esc(h.comp)).join(", ")}`]]);
  if (d.evaluate) blocks.push(["Round 3 · Performance Evaluation", [`${esc(EMPLOYEES[fe].first)}: <b>${S.ev.rating} · ${R3_SCALE.find(r => r.v === S.ev.rating).label}</b>`, `${S.ev.picks.length} evidence entries cited.`]]);
  return `<div class="drawer-scrim" data-act="drawer"></div><aside class="drawer" aria-label="Year so far">
    <div class="row between"><div><div class="eyebrow">Year so far</div><h2>Your decisions</h2></div><button class="x" data-act="drawer" aria-label="Close">${icon("x")}</button></div>
    ${blocks.length ? blocks.map(([h, ls]) => `<div class="ysf-block"><div class="h">${h}</div>${ls.map(l => `<div class="l">${l}</div>`).join("")}</div>`).join("") : `<p class="ysf-empty">Nothing yet. Completed decisions appear here as the simulation unfolds.</p>`}
  </aside>`;
}
function modalHTML() {
  if (!UI.modal) return "";
  const wrap = (title, body, eyebrow = "", wide = false) => `<div class="scrim" data-act="closeModalBg"><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true"><div class="modal-h"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ""}<h3>${title}</h3></div><button class="x" data-act="closeModal" aria-label="Close">${icon("x")}</button></div><div class="modal-b">${body}</div></div></div>`;
  if (UI.modal === "checker") return checkerModal();
  if (UI.modal.startsWith("profile:")) return profileModal(UI.modal.split(":")[1]);
  const fe = focusEmp();
  if (UI.modal === "std") return wrap(`${esc(EMPLOYEES[fe].first)} · Agreed performance standards`, `${stdTable(fe)}<p class="xs muted">Proposed reference standards, drafted for this simulation from the role description.</p>`, "NextWave reference", true);
  if (UI.modal === "contract") return wrap(`Your Round 2 contract · ${esc(EMPLOYEES[fe].title)}`, `${contractView(fe)}`, "Your group's proposal", true);
  if (UI.modal === "role") { const Er = EMPLOYEES[fe]; return wrap(`${esc(Er.title)}`, `<p class="t2">${esc(Er.role.purpose)}</p><div class="eyebrow">Key responsibilities</div><ul class="bullets">${Er.role.responsibilities.map(r => `<li>${esc(r)}</li>`).join("")}</ul><div class="panel small"><b>Expected contribution.</b> <span class="t2">${esc(Er.role.contribution)}</span></div><div class="small muted">Reports to: ${esc(Er.role.reportsToRole)}</div>`, "Role description"); }
  if (UI.modal === "cobj") return wrap("Your Commercial Objectives", `<div class="stack" style="gap:8px">${[...S.begins.priorities.map(id => COMMERCIAL_PRIORITY_OPTIONS.find(p => p.id === id).text), S.begins.ownPriority.trim()].filter(Boolean).map(t => `<div class="panel small">${esc(t)}</div>`).join("") || `<p class="small muted">No objectives chosen yet.</p>`}</div>${S.begins.contribution ? `<p class="small t2"><b>Commercial's contribution:</b> ${esc(S.begins.contribution)}</p>` : ""}`, "Chosen in the first step of Round 2");
  if (UI.modal === "guide") { const t = TOOLKIT.find(x => x.id === UI.tool) || TOOLKIT[0]; return wrap("Guide", `<div class="chips">${TOOLKIT.map(x => `<button class="chip sm ${t.id === x.id ? "on" : ""}" data-act="tool" data-id="${x.id}">${esc(x.t)}</button>`).join("")}</div><div class="fade-in">${t.ph ? placeholderPanel(t.t) : `<div class="panel"><b>${esc(t.t)}</b><p class="t2" style="margin-top:4px">${esc(t.b)}</p></div>`}</div>`, "Quick help"); }
  if (UI.modal === "reset") return wrap("Reset the simulation?", `<p class="t2">This permanently clears every decision on this device and returns to the start.</p><div class="row"><button class="btn btn-danger" data-act="doReset">Reset simulation</button><button class="btn btn-ghost" data-act="closeModal">Cancel</button></div>`, "Reset");
  if (UI.modal === "bm") return wrap(`★ ${bmRating().toFixed(2)} Simulation leadership rating`, `<p class="t2">A game indicator for this simulation, not a validated leadership assessment. It starts at 3.00 and moves after Rounds 2 and 3 based on each round's score out of 10. Round 1 is not scored. The full debrief, with what each criterion looked at, appears on each round's results page.</p>
    <div class="stack" style="gap:8px">${bmPath().slice(1).map(p => `<div class="row between panel small"><span>${p.l} · ${p.total}/10</span><span class="num">${p.before.toFixed(2)} → <b>${p.v.toFixed(2)}</b></span></div>`).join("") || `<div class="small muted">No scored round completed yet.</div>`}</div>`, "Game indicator");
  return "";
}

/* ---------- stage frame ---------- */
function viewStage(route) {
  const stage = route.stage;
  if (!stageAccessible(stage)) return null;
  if (stage === "summary") { if (!S.group) return "GROUP"; return viewSummary(); }
  if (stage !== "r1" && !S.prog.released[stage]) return viewGate(stage);
  if (stage !== "r1" && !S.group) return "GROUP";
  if (S.prog.done[stage]) return stage === "evaluate" ? viewR3Results() : stage === "begins" ? viewR2Results(true) : viewDone(stage);
  const steps = STAGE_VIEWS[stage];
  let step = Math.min(S.prog.step[stage] || 0, steps.length - 1);
  const maxS = Math.min(S.prog.maxStep[stage] || 0, steps.length - 1);
  if (route.step != null && route.step <= maxS && route.step < steps.length) { step = route.step; S.prog.step[stage] = step; }
  const V = steps[step], names = STAGE_STEPS[stage];
  const stepNav = `<div class="steps">${names.map((n, i) => `<button class="step ${i === step ? "on" : i <= maxS ? "ok" : ""}" data-act="toStep" data-stage="${stage}" data-step="${i}" ${i > maxS ? "disabled" : ""}>${n}</button>`).join("")}</div>`;
  const isLast = step === steps.length - 1;
  const nextLabel = isLast ? ({ r1: "Close Round 1", begins: "Submit the contract", evaluate: "Submit final evaluation" })[stage] : "Continue";
  const wide = stage === "evaluate" && step === 0;
  if (stage === "r1" && step === 0 && UI.story) return `<main class="page">${stepNav}${V.render()}</main>`;
  return `<main class="page ${wide ? "wide" : ""}">${stepNav}${V.render()}
    <div class="nav-foot">${step > 0 ? `<button class="btn btn-ghost" data-act="toStep" data-stage="${stage}" data-step="${step - 1}">← Back</button>` : "<span></span>"}
    <div class="row">${UI.err ? `<span class="hint-err" role="alert">${esc(UI.err)}</span>` : ""}<button class="btn btn-primary" data-act="next" data-stage="${stage}">${nextLabel} ${icon("arrow")}</button></div></div></main>`;
}

/* ---------- render ---------- */
function render() {
  const route = parseHash();
  let main;
  if (route.view === "home") main = viewHome();
  else if (route.view === "company") main = viewCompany();
  else if (route.view === "group") { if (!S.prog.released.begins) { location.replace("#" + stageHash(currentStage())); return; } main = viewGroup(); }
  else if (route.view === "hub") { main = viewHub(); if (route.emp && EMPLOYEES[route.emp] && !UI.modal) UI.modal = "profile:" + route.emp; }
  else if (route.view === "stage") {
    main = viewStage(route);
    if (main === "GROUP") { location.replace("#group"); return; }
    if (main == null) { location.replace("#" + stageHash(currentStage())); return; }
  }
  const app = document.getElementById("app");
  const scrollY = window.scrollY;
  app.innerHTML = topbar(route) + main + (UI.drawer ? yearSoFar() : "") + modalHTML();
  if (UI._keepScroll) window.scrollTo(0, scrollY); else window.scrollTo(0, 0);
  UI._keepScroll = true;
  if (UI._focus) { const el = document.getElementById(UI._focus); if (el) { el.focus(); if (el.setSelectionRange && el.value != null) { const c = UI._caret != null ? UI._caret : el.value.length; try { el.setSelectionRange(c, c); } catch (e) {} } UI._caret = null; } UI._focus = null; }
}
function rerender(keepScroll = true) { UI._keepScroll = keepScroll; render(); }

/* ---------- actions ---------- */
function completeStage(stage) {
  S.prog.done[stage] = true;
  if (stage === "evaluate") S.prog.released.summary = true;
  save(true);
  go(stage === "r1" ? "begins" : "evaluate");
}
const ACTIONS = {
  nav(el) { UI.menu = false; UI.modal = null; UI._keepScroll = false; go(el.dataset.to); },
  begin() { UI._keepScroll = false; UI.menu = false; UI.modal = null; go(stageHash(currentStage())); },
  chooseGroup(el) { if (groupLocked()) return; const g = GROUPS.find(x => x.n === +el.dataset.n); S.group = g.n; S.begins.tab = g.emp; save(true); rerender(); },
  goStage(el) { UI.menu = false; UI.modal = null; UI.err = ""; UI.codeErr = ""; UI._keepScroll = false; go(stageHash(el.dataset.stage)); },
  toStep(el) { UI.err = ""; UI.story = null; UI._keepScroll = false; const s = el.dataset.stage, i = +el.dataset.step; S.prog.step[s] = i; save(); go(`${s}-${i}`); },
  next(el) {
    const stage = el.dataset.stage, steps = STAGE_VIEWS[stage], step = Math.min(S.prog.step[stage] || 0, steps.length - 1);
    const err = steps[step].validate(); if (err) { UI.err = err; rerender(); return; }
    UI.err = ""; UI.story = null;
    if (steps[step].onNext) steps[step].onNext();
    UI._keepScroll = false;
    if (step === steps.length - 1) { completeStage(stage); return; }
    S.prog.step[stage] = step + 1; S.prog.maxStep[stage] = Math.max(S.prog.maxStep[stage] || 0, step + 1); save(true);
    go(`${stage}-${step + 1}`);
  },
  unlock(el) {
    const stage = el.dataset.stage, inp = document.getElementById("relcode"), v = (inp && inp.value || "").trim();
    if (v !== RELEASE_CODES[stage]) { UI.codeErr = v ? "That code doesn't match. Ask your facilitator." : "Enter the release code."; rerender(); return; }
    UI.codeErr = ""; S.prog.released[stage] = true; save(true); UI._keepScroll = false;
    go(stage === "begins" && !S.group ? "group" : stageHash(stage));
  },
  facUnlock() { const v = (document.getElementById("faccode") || {}).value || ""; if (v.trim() === FAC_CODE) { UI.facOpen = true; UI.facErr = ""; } else UI.facErr = "That code doesn't match."; rerender(); },
  saLvl(el) { const k = el.dataset.k; S.sa = S.sa || {}; S.sa[k] = S.sa[k] || {}; S.sa[k].lvl = Number(el.dataset.v); save(true); rerender(); },
  facSet(el) { S.fac[el.dataset.k] = el.dataset.v === "" ? null : Number(el.dataset.v); save(true); rerender(); },
  r2seen() { S.prog.r2seen = true; save(true); rerender(false); },
  set(el) {
    let v = el.dataset.val; if (el.dataset.num) v = Number(v);
    const p = el.dataset.path; if (v === "") v = null;
    setPath(S, p, v); save(); rerender();
  },
  menu() { UI.menu = !UI.menu; rerender(); },
  drawer() { UI.drawer = !UI.drawer; UI.menu = false; rerender(); },
  modal(el) { UI.modal = el.dataset.m; UI.menu = false; rerender(); },
  openContract() { UI.modal = "contract"; S.ev.viewed.contract = true; save(); rerender(); },
  closeModal() { VOICE.stop(); if (UI.modal && UI.modal.startsWith("profile:") && location.hash.startsWith("#profile")) { UI.modal = null; history.replaceState(null, "", "#hub"); } UI.modal = null; UI.checker = null; rerender(); },
  closeModalBg(el, ev) { if (ev.target === el) ACTIONS.closeModal(); },
  doReset() { resetState(); UI.modal = null; UI.drawer = false; UI.err = ""; UI.story = null; UI._keepScroll = false; location.hash = "#home"; render(); },
  playVoice(el) {
    const ok = VOICE.play(el.dataset.id, el.dataset.emp, VOICE.texts[el.dataset.id] || "");
    if (!ok) { const vn = el.closest(".vn"); if (vn && !vn.querySelector(".vn-na")) vn.insertAdjacentHTML("beforeend", '<span class="xs muted vn-na">Audio isn\'t available on this device. Read the transcript.</span>'); }
  },
  profile(el) { UI.modal = "profile:" + el.dataset.emp; UI.profileTab = "profile"; rerender(); },
  profileTab(el) { UI.profileTab = el.dataset.tab; rerender(); },
  coPrio(el) { UI.coPrio = el.dataset.id; rerender(); },
  story(el) { VOICE.stop(); const e = el.dataset.emp; UI.story = e; S.r1.viewed[e] = true; save(); rerender(false); },
  storyBack() { VOICE.stop(); UI.story = null; rerender(false); },
  storyFrom(el) { VOICE.stop(); const e = el.dataset.emp; UI.story = e; S.r1.viewed[e] = true; S.prog.step.r1 = 0; save(); go("r1-0"); },
  timer(el) {
    const id = el.dataset.id;
    clearInterval(TIMER.iv);
    if (TIMER.id === id) { TIMER.id = null; rerender(); return; }
    TIMER.id = id; TIMER.end = Date.now() + (+el.dataset.secs) * 1000;
    TIMER.iv = setInterval(() => {
      const left = Math.max(0, Math.round((TIMER.end - Date.now()) / 1000));
      document.querySelectorAll(`[data-timer="${TIMER.id}"]`).forEach(s => { s.textContent = fmtT(left); s.closest(".timer")?.classList.toggle("done", left === 0); });
      if (left === 0) clearInterval(TIMER.iv);
    }, 500);
    rerender();
  },
  tool(el) { UI.tool = el.dataset.id; rerender(); },
  openGuide() { UI.tool = UI.tool || TOOLKIT[0].id; UI.modal = "guide"; rerender(); },
  filt(el) { UI.f[el.dataset.k] = el.dataset.v; rerender(); },
  pickEv(el) { const a = S.ev.picks, id = el.dataset.id, i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else if (a.length < 4) a.push(id); save(); rerender(); },
  toggleFair() { S.ev.fairAck = !S.ev.fairAck; save(); rerender(); },
  togglePrio(el) { const a = S.begins.priorities, id = el.dataset.id; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); save(); rerender(); },
  addMeasure(el) { const c = S.begins.contracts[el.dataset.emp]; if (c.measures.length < 5) c.measures.push(blankMeasure()); UI.optOpen = true; save(); rerender(); },
  toggleOptObj() { const n = S.begins.contracts[focusEmp()].measures.length; UI.optOpen = n > 3 ? true : !UI.optOpen; rerender(); },
  removeMeasure(el) { const c = S.begins.contracts[el.dataset.emp]; const i = c.measures.findIndex(m => m.id === el.dataset.id); if (i >= 3) c.measures.splice(i, 1); save(); rerender(); },
  toggleHow(el) { const c = S.begins.contracts[el.dataset.emp]; const comp = el.dataset.comp; const i = c.how.findIndex(h => h.comp === comp); if (i >= 0) c.how.splice(i, 1); else if (c.how.length < 3) c.how.push({ comp, standard: "" }); save(); rerender(); },
  openChecker(el) { UI.checker = { emp: el.dataset.emp, id: el.dataset.id }; UI.modal = "checker"; UI.checkerTab = "objective"; ACTIONS._logCheck(); rerender(); },
  _logCheck() { const { emp, id } = UI.checker; const m = S.begins.contracts[emp].measures.find(x => x.id === id); if (!m) return; const r = checkMeasure(emp, m); const c = S.begins.checks[id] || { count: 0 }; c.count++; c.last = r.overall; S.begins.checks[id] = c; save(); },
  recheck() { ACTIONS._logCheck(); rerender(); },
  checkerTab(el) { UI.checkerTab = el.dataset.tab; rerender(); },
  nudge(el) { const { emp, id } = UI.checker; const m = S.begins.contracts[emp].measures.find(x => x.id === id); UI.nudge[id] = checkMeasure(emp, m).nudge; S.begins.nudges++; save(); rerender(); }
};

/* ---------- events ---------- */
function bindEvents() {
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-act]");
    if (!el) { if (UI.menu && !ev.target.closest(".menu-wrap")) { UI.menu = false; rerender(); } return; }
    if (el.disabled) return;
    const fn = ACTIONS[el.dataset.act];
    if (fn) { if (el.dataset.act !== "closeModalBg") ev.preventDefault(); fn(el, ev); }
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && (UI.modal || UI.drawer)) { UI.drawer = false; ACTIONS.closeModal(); }
    if (ev.key === "Enter" && ev.target.id === "relcode") { ev.preventDefault(); const b = document.querySelector('[data-act="unlock"]'); if (b) b.click(); }
  });
  document.addEventListener("input", (ev) => {
    const el = ev.target; if (!el.dataset || !el.dataset.bind) return;
    setPath(S, el.dataset.bind, el.value); save();
    if (el.dataset.rerender && el.tagName !== "SELECT") { clearTimeout(UI._rrT); UI._rrT = setTimeout(() => { UI._focus = el.id; UI._caret = el.selectionStart; rerender(); }, 380); }
  });
  document.addEventListener("pointerdown", () => { clearTimeout(UI._rrT); }, true);
  document.addEventListener("change", (ev) => { const el = ev.target; if (!el.dataset || !el.dataset.bind) return; setPath(S, el.dataset.bind, el.value); save(); if (el.tagName === "SELECT") rerender(); });
  window.addEventListener("hashchange", () => { VOICE.stop(); UI.err = ""; UI.codeErr = ""; UI._keepScroll = false; UI.drawer = false; if (UI.modal && !UI.modal.startsWith("profile:")) UI.modal = null; render(); });
}
bindEvents();
render();
