
/* =========================================================
   SCORE — HYBRID ASSESSMENT ENGINE (v3)
   A · Automated checks: structured, verifiable decisions only.
   B · Guided judgment: the group selects a rubric level after submitting,
       with a short reflection. Automated checks set the highest level available.
   C · Optional facilitator validation: overrides any judgment-based criterion.
   Application Score = (Round 2 /10 + Round 3 /10) × 5. Provisional until every
   criterion is assessed. Free text is never scored.
   ========================================================= */
const ANCHOR = { 2: "Applied effectively", 1: "Partially applied", 0: "Not demonstrated" };
const FAC_CODE = "5050";
const KIND_OPTS = [{ v: "result", l: "Result (outcome)" }, { v: "driver", l: "Driver (key activity or input)" }];
const TRAP_WHY = {
  p6: "“Maximise prospecting activity across all segments” rewards volume rather than the value of the pipeline.",
  p7: "“Match Valtora on price” competes on price, which the 2027 strategy does not ask for and which erodes margin.",
  p8: "“Own the company's on-time delivery improvement” belongs to the delivery teams. Commercial contributes but cannot own it (horizontal alignment)."
};
const SORT_WHY = {
  fact: "It states something that happened or was measured, and someone else could check it.",
  interp: "It is a judgment or label about the person. It may be true, but it cannot be verified as written."
};
const PRACTICE = [
  "Did I align objectives with business priorities?",
  "Did I define measurable expectations?",
  "Did I establish appropriate evidence sources?",
  "Did I assess both WHAT and HOW?",
  "Did I consider the complete performance period?",
  "Did I separate facts from interpretations?",
  "Did I check my evaluation for potential bias?"
];

/* ---------- Reference guidance (provisional, pending SME validation) ---------- */
const ROLE_GUIDE = {
  omar: {
    competencies: "Communication and Problem Solving: his role turns analysis into decisions, and his profile shows stakeholder communication as the development area.",
    examples: [
      ["Leadership decides on his major recommendations in the review where they are presented: at least 3 of 4 per half", "Result", "Use market insight to decide where to compete", "Present findings and recommendations"],
      ["Scheduled competitor reports: all delivered on schedule, accuracy confirmed each quarter in the win/loss review", "Result", "Use market insight to decide where to compete", "Produce scheduled market and competitor reports"]
    ],
    behaviour: "Communication: “Opens each briefing with the decision needed and one recommendation, and answers the question asked when challenged.”"
  },
  youssef: {
    competencies: "Coaching is essential: he is in his first management role and responsible for developing Salma. Accountability & Ownership or Time Management also fit his results and prioritisation responsibilities.",
    examples: [
      ["New business for his area: 100% of annual target", "Result", "Win new customers in target segments", "Own new-business results for his area"],
      ["Salma leads at least 4 opportunities end to end within agreed decision limits by Q4", "Result", "Build commercial capability and reduce dependency on individuals", "Manage, coach and develop the Sales Executive"]
    ],
    behaviour: "Coaching: “Reviews Salma's opportunities at a weekly checkpoint with questions, and steps in only when an agreed limit is crossed.”"
  },
  salma: {
    competencies: "Time Management (where her follow-up time goes), Problem Solving (qualifying opportunities) or Adaptability & Flexibility (acting on feedback) all reflect her role and profile.",
    examples: [
      ["At least 50% of her opportunities meet qualification criteria by H2", "Result", "Build a pipeline of opportunities that can realistically convert", "Qualify opportunities and progress promising ones"],
      ["Prospecting in target segments at 100% of the activity plan each month", "Driver", "Win new customers in target segments", "Prospect into target segments"]
    ],
    behaviour: "Time Management: “Reviews her open opportunities every month and pauses any without a need, budget owner and timeline.”"
  },
  mariam: {
    competencies: "Time Management (prioritising requests and agreeing dates) and Communication (agreeing direction with stakeholders before designing) reflect her role and profile.",
    examples: [
      ["At least 85% of proposals delivered on the date agreed with the deal owner", "Result", "Make only customer commitments NextWave can deliver well", "Agree delivery dates with the deal owner and meet them"],
      ["Customer feedback on proposals averages at least 4 of 5", "Result", "Win new customers in target segments", "Maintain professional quality and consistency"]
    ],
    behaviour: "Time Management: “Ranks incoming requests by deal stage each Monday and agrees a delivery date before starting.”"
  }
};
/* Round 3 provisional reference readings, with documented rationale per standard */
const R3_KEY = {
  omar: {
    std: { w1: [2, 3], w2: [2, 3], w3: [1, 2], h1: [1], h2: [2, 3] }, what: [2, 3], how: [1, 2], def: [3, 4], pla: [2],
    why: { w1: "12 of 12 reports on time with accuracy confirmed: the standard is met, and independent confirmation of accuracy makes Above reasonable.", w2: "His Q2 analysis linked several data sources and spotted the AI pattern in recent losses early.", w3: "His recommendation was adopted, but only after a second review, and one Q2 review ended without a decision.", h1: "Stakeholders describe difficult discussions in Q2 and again in H2: the pattern lasted the whole year.", h2: "He combined win/loss, pipeline and CRM data into one analysis." },
    context: "The stakeholder comments are interpretations; weigh them alongside the decision delays they describe."
  },
  youssef: {
    std: { w1: [2, 3], w2: [1, 2], w3: [1, 2], h1: [1], h2: [2, 3] }, what: [2], how: [1, 2], def: [3, 4], pla: [2],
    why: { w1: "104% of the annual new-business target.", w2: "One proposal needed scope clarification after signature; no other issue is recorded.", w3: "In H1 he joined 11 of 15 of Salma's calls and rewrote three of her proposals; in H2 she worked more independently, but he still joined many important calls.", h1: "The opportunities he led personally rose from 5 to 9: he did the work rather than coaching.", h2: "He owned his area's results; one customer commitment needed clarification." },
    context: "This is his first management role; strong commercial results can make the people side easy to overlook."
  },
  salma: {
    std: { w1: [1, 2], w2: [2, 3], w3: [2, 3], h1: [1, 2], h2: [2, 3] }, what: [2], how: [2], def: [3], pla: [2, 4],
    why: { w1: "Qualification rose from 29% to 52% but stayed uneven month to month.", w2: "3 new customers, with her largest wins coming from early qualification. No numeric target is recorded.", w3: "126% of the activity plan for the year.", h1: "Five low-probability opportunities had been open for more than 60 days at mid-year; there is no H2 record either way.", h2: "She rewrote her discovery questions after one round of feedback." },
    context: "Her second year; Youssef's involvement in her calls and the 9-day proposal waits limited her independence and pace."
  },
  mariam: {
    std: { w1: [1], w2: [2, 3], w3: [2, 3], h1: [1], h2: [1, 2] }, what: [1, 2], how: [1], def: [2, 3], pla: [1],
    why: { w1: "45% on time in H1 and 55% in H2; two of Salma's opportunities waited 9 days.", w2: "The strongest customer feedback in the team.", w3: "The highest proposal volume in Commercial (26 in H1 against a plan of 18).", h1: "She accepts requests the day they arrive without ranking them, recorded in both halves.", h2: "On the two largest proposals the direction changed after design, partly because stakeholders had not agreed the approach." },
    context: "Late changes from stakeholders contributed to the revision rounds; delivering on the agreed date is still the core of her role."
  }
};

/* ---------- Round 2 structured fields ---------- */
function chosenObjectives() {
  const ids = S.begins.priorities.map(id => ({ v: id, l: COMMERCIAL_PRIORITY_OPTIONS.find(p => p.id === id).text }));
  if (S.begins.ownPriority.trim()) ids.push({ v: "own", l: "Your own: " + S.begins.ownPriority.trim() });
  return ids;
}
function linkOpts() { return [...chosenObjectives(), { v: "none", l: "None of these" }]; }
function respOpts(emp) { return [...EMPLOYEES[emp].role.responsibilities.map((r, i) => ({ v: String(i), l: r })), { v: "none", l: "Not in the role description" }]; }
const isTrap = (id) => !!COMMERCIAL_PRIORITY_OPTIONS.find(p => p.id === id)?._trap;
const hasFigure = (m) => /\d/.test(m.target || "");
const objText = (id) => id === "own" ? S.begins.ownPriority.trim() : (COMMERCIAL_PRIORITY_OPTIONS.find(p => p.id === id) || {}).text || "None";

function contractComplete(emp) {
  const c = S.begins.contracts[emp];
  const wsum = c.measures.reduce((a, x) => a + (Number(x.weight) || 0), 0);
  const msOk = c.measures.length >= 3 && c.measures.length <= 5 && c.measures.every(m => m.measure.trim() && m.target.trim() && Number(m.weight) > 0 && m.evidence && m.freq && m.link && m.resp && m.kind);
  const howOk = c.how.length >= 2 && c.how.length <= 3 && c.how.every(h => substantive(h.standard));
  return { msOk, howOk, wOk: wsum === 100, ok: msOk && howOk && wsum === 100 };
}
/* Quality checker: structured checks plus SMART reflection. Guidance only, never scored. */
function checkMeasure(emp, m) {
  const chk = [
    { l: "Linked to a Commercial objective", ok: !!m.link && m.link !== "none" && !isTrap(m.link), q: "Which Commercial objective does this objective genuinely serve?" },
    { l: "Linked to a role responsibility", ok: !!m.resp && m.resp !== "none", q: "Which responsibility in the role description does this objective belong to?" },
    { l: "Target or standard defined", ok: !!(m.target || "").trim(), q: "What does ‘met’ look like, so you and the employee would judge it the same way?" },
    { l: "Indicator type chosen", ok: !!m.kind, q: "Is this a result (outcome) or a driver (key activity behind a result)?" },
    { l: "Evidence source chosen", ok: !!m.evidence, q: "Where will the evidence come from, and can the employee see it too?" },
    { l: "Review frequency chosen", ok: !!m.freq, q: "How often will you review this together? Match the rhythm to how quickly this KPI moves." }
  ];
  const fails = chk.filter(x => !x.ok);
  return { checks: chk, overall: fails.length === 0 ? "ok" : fails.length <= 2 ? "refine" : "risk", nudge: fails.length ? fails[0].q : (!hasFigure(m) ? "No figure in this target. If the standard is qualitative, would two managers judge it the same way?" : "Read it as the employee would: is it Specific, Achievable and Time-bound? Does it measure meaningful performance, or a task?") };
}
function checkerModal() {
  const { emp, id } = UI.checker;
  const c = S.begins.contracts[emp], i = c.measures.findIndex(m => m.id === id);
  if (i < 0) return "";
  const m = c.measures[i], r = checkMeasure(emp, m), base = `begins.contracts.${emp}.measures.${i}`, nudge = UI.nudge[id];
  return `<div class="scrim" data-act="closeModalBg"><div class="modal" role="dialog" aria-modal="true" aria-label="Quality checker">
    <div class="modal-h"><div><div class="eyebrow p">✦ Check quality</div><h3>${esc(EMPLOYEES[emp].title)} · Objective ${i + 1}</h3></div><button class="x" data-act="closeModal" aria-label="Close">${icon("x")}</button></div>
    <div class="modal-b">
      <div class="grid2">${field("Objective", inp(`${base}.measure`, "What result must this role achieve?"))}${field("Measure / Standard", inp(`${base}.target`, "What does ‘met’ look like?"))}</div>
      <div class="row between">${verdictHTML(r.overall)}<button class="btn btn-quiet" data-act="recheck">↻ Recheck</button></div>
      <div class="checks">${r.checks.map(x => `<div class="chk"><span class="sym status-${x.ok ? "ok" : "refine"}">${x.ok ? "✓" : "△"}</span><div><b>${esc(x.l)}</b></div></div>`).join("")}</div>
      <div class="panel stack" style="gap:6px"><b>SMART reflection</b><p class="small t2">The checker can't judge the meaning of your wording. Ask yourselves: is it <b>Specific</b> (two managers would track the same thing)? <b>Measurable</b>? <b>Achievable</b> for this person this year? <b>Relevant</b> to the role and the strategy? <b>Time-bound</b>? Does it measure meaningful performance, or just a task?</p></div>
      <div class="panel stack" style="gap:10px"><div class="row between"><b>Need a nudge?</b><button class="btn btn-quiet" data-act="nudge" data-id="${id}">Give me one question</button></div>
        ${nudge ? `<p class="t2">${esc(nudge)}</p>` : `<p class="small muted">The checker won't write the objective for you. A nudge is one coaching question.</p>`}</div>
    </div></div></div>`;
}

/* ---------- context builders ---------- */
function r2Data() {
  const emp = focusEmp(), b = S.begins, ms = b.contracts[emp].measures, E = EMPLOYEES[emp];
  const W = (m) => Number(m.weight) || 0;
  return {
    emp, E, ms, W,
    traps: b.priorities.filter(isTrap),
    linked: ms.filter(m => m.link && m.link !== "none" && !isTrap(m.link)),
    mapped: ms.filter(m => m.resp && m.resp !== "none"),
    comps: b.contracts[emp].how,
    people: emp !== "youssef" || b.contracts[emp].how.some(h => h.comp === "Coaching") || ms.some(m => m.resp === "3"),
    wsum: ms.reduce((a, m) => a + W(m), 0)
  };
}
function r3Data() {
  const emp = focusEmp(), V = S.ev, K = R3_KEY[emp];
  const picks = V.picks.map(id => LOG[emp].find(x => x.id === id)).filter(Boolean);
  const ids = picks.flatMap(p => [].concat(p.std || []));
  const lean = V.rating >= 4 ? "up" : V.rating <= 2 ? "down" : "mid";
  const supports = (p) => lean === "mid" || p.pol === "mix" || (lean === "up" ? p.pol === "pos" : p.pol === "neg");
  return { emp, V, K, picks, ids, lean, supports, hasH1: picks.some(p => p.h === "H1"), hasLater: picks.some(p => p.h !== "H1"), hasW: ids.some(i => i[0] === "w"), hasH: ids.some(i => i[0] === "h") };
}
const jl = (v) => (JUDG.find(j => j.id === v) || {}).l || "–";
const stdName = (emp, id) => (STD[emp].find(s => s.id === id) || {}).name || id;
const quoteList = (arr) => arr.map(m => `“${m.measure}”`).join(", ");
const bare = (t) => String(t || "").replace(/^[“"]+|[”"]+$/g, "");

/* ---------- the ten criteria ----------
   mode "auto": score(d) is the result.  mode "judged": cap(d) limits the self-assessed level.
   checks(d): [{ok, t}] shown to the group as evidence of their decisions (true = no issue). */
const CRITERIA = [
  /* ===== ROUND 2 ===== */
  {
    k: "align", r: 2, mode: "judged", n: "Strategic Alignment", principle: "Strategy cascading · vertical and horizontal alignment",
    question: "Does each objective genuinely contribute to the business priority it is linked to, or is it only linked on the form?",
    rubric: { 2: "Every objective clearly advances the Commercial objective it is linked to, and together they serve NextWave's 2027 priorities without stepping into another department's responsibilities.", 1: "Most objectives contribute, but at least one is linked on the form only, or one stretches into another department's responsibilities.", 0: "Several objectives are disconnected from the strategy or contradict it." },
    why: "Strategy cascading turns NextWave's 2027 priorities into Commercial objectives, and those into individual objectives. Vertical alignment keeps each objective pointed at the strategy; horizontal alignment stops it colliding with what other departments own.",
    apply: "Before agreeing an objective, trace it upward: which departmental objective and which company priority does it serve? If you can't name one, question the objective.",
    checks(d) { return [
      { ok: d.traps.length === 0, t: d.traps.length ? `${d.traps.length} Commercial objective${d.traps.length > 1 ? "s" : ""} outside Commercial's role: ${d.traps.map(t => TRAP_WHY[t]).join(" ")}` : "All Commercial objectives you chose sit within Commercial's responsibilities." },
      { ok: d.linked.length === d.ms.length, t: `${d.linked.length} of ${d.ms.length} objectives are linked to a valid Commercial objective.${d.linked.length < d.ms.length ? ` Not linked: ${quoteList(d.ms.filter(m => !d.linked.includes(m)))}.` : ""}` }
    ]; },
    cap(d) { const share = d.linked.length / d.ms.length; return d.traps.length === 0 && share === 1 ? 2 : d.traps.length <= 1 && share >= 0.5 ? 1 : 0; },
    guide(emp) { return `<div class="small t2">Trace one of your objectives the way this example does:</div>${exampleRows(emp)}`; }
  },
  {
    k: "role", r: 2, mode: "judged", n: "Role Relevance", principle: "Role accountability · job responsibilities",
    question: "Is each objective within this person's accountability and influence, and does it reflect the main purpose of the role?",
    rubric: { 2: "Each objective sits within the employee's responsibilities and is something they can materially influence; together the objectives reflect the role's main purpose.", 1: "Most objectives are relevant, but at least one depends heavily on other people's decisions or the role's main purpose is underweighted.", 0: "Objectives are largely outside the role or outside the employee's control." },
    why: "An objective is only fair if the person can materially influence it. Anchoring objectives in the job description makes accountability clear and shows the employee how their work contributes to the department.",
    apply: "Hold the job description next to the objectives. For each one ask: is this theirs to deliver, and what could they do differently if it misses?",
    checks(d) { const out = d.ms.filter(m => !d.mapped.includes(m)); return [
      { ok: out.length === 0, t: `${d.mapped.length} of ${d.ms.length} objectives are mapped to a responsibility in the ${d.E.title} role description.${out.length ? ` Marked outside the role: ${quoteList(out)}.` : ""}` },
      { ok: true, t: `Role purpose: ${d.E.role.purpose}` }
    ]; },
    cap(d) { const share = d.mapped.length / d.ms.length; return share === 1 ? 2 : share >= 0.5 ? 1 : 0; },
    guide(emp) { return `<div class="small t2">Ask three questions of each objective: is it in the role description (accountability)? Can ${esc(EMPLOYEES[emp].first)} move it through their own work (influence)? Does it contribute to Commercial's results (contribution)?</div>${exampleRows(emp)}`; }
  },
  {
    k: "kpi", r: 2, mode: "judged", n: "KPI Quality", principle: "SMART objectives · KPIs, targets and weights · outcomes vs activity",
    question: "Does each KPI measure meaningful performance with a realistic, trackable target that suits the role?",
    rubric: { 2: "Each KPI measures meaningful performance (an outcome, or a genuine driver of one) with a realistic, trackable target, and suits the role.", 1: "The KPIs are measurable, but at least one tracks a task rather than performance, or a target is vague or unrealistic.", 0: "The KPIs are mostly tasks or vague statements that would not show whether performance was achieved." },
    why: "SMART objectives and KPIs turn expectations into something both of you can verify. Activity KPIs are fine when they drive an outcome that matters in the role; what matters is that the contract as a whole shows whether value was created.",
    apply: "Before approving a KPI, ask: “What does this indicator tell us about actual performance, and how will we verify it?”",
    checks(d) { const nf = d.ms.filter(m => !hasFigure(m)); const nr = d.ms.filter(m => m.kind === "result").length; return [
      { ok: true, t: `Every objective has a measure, a target or standard, an evidence source and a review frequency, and the weights total ${d.wsum}%.` },
      { ok: nf.length === 0, t: nf.length ? `No figure in the target of ${quoteList(nf)}. That can be fine for a qualitative standard: check that both of you would judge it the same way.` : "Every target includes a figure." },
      { ok: true, t: `You classified ${nr} objective${nr === 1 ? "" : "s"} as results and ${d.ms.length - nr} as drivers. Drivers are appropriate when they lead to an outcome that matters in the role.` }
    ]; },
    cap() { return 2; },
    guide(emp) { return `<div class="small t2">Compare the indicator types and targets in this example with yours:</div>${exampleRows(emp)}`; }
  },
  {
    k: "whathow", r: 2, mode: "judged", n: "WHAT & HOW Balance", principle: "WHAT vs HOW · competencies and observable behaviours",
    question: "Do the competencies reflect what matters most in this role, and could you observe each behaviour standard as written?",
    rubric: { 2: "Results and behaviours are both covered; the competencies are the ones that matter most for this role, and each standard describes behaviour you could see or hear.", 1: "Both are present, but a competency is only weakly related to the role or a standard is vague (for example “be a good communicator”).", 0: "A dimension is missing, or the behaviour standards could not be observed at all." },
    why: "Performance is what is delivered (WHAT) and how it is delivered (HOW). Competencies only guide behaviour when they fit the role and are written as something observable.",
    apply: "Write each behaviour standard so a colleague could recognise it in a meeting: what the person does, not what they are.",
    checks(d) { return [
      { ok: true, t: `WHAT: ${d.ms.length} objectives. HOW: ${d.comps.map(h => h.comp).join(", ")}.` },
      ...(d.emp === "youssef" ? [{ ok: d.people, t: d.people ? "The people side of Youssef's manager role (developing Salma) is in the contract." : "The people side of Youssef's manager role is missing: no Coaching competency and no objective on “Manage, coach and develop the Sales Executive”. This limits the criterion to Partially applied." }] : [])
    ]; },
    cap(d) { return d.people ? 2 : 1; },
    guide(emp) { const g = ROLE_GUIDE[emp]; return `<p class="small t2"><b>Competencies that fit this role:</b> ${esc(g.competencies)}</p><p class="small t2"><b>An observable standard:</b> ${esc(g.behaviour)}</p>`; }
  },
  {
    k: "clarity", r: 2, mode: "judged", n: "Performance Clarity", principle: "Objective-setting guidelines · weights · evidence sources · review",
    question: "Would the employee know what good looks like, where the evidence comes from and when it will be reviewed?",
    rubric: { 2: "Expectations are clearly defined, the weights reflect real priorities, every evidence source is identifiable and usable, and each review frequency suits how quickly that KPI moves.", 1: "Mostly clear, but one important element is vague or inconsistent, such as an unclear source or a review rhythm that doesn't suit the KPI.", 0: "The employee could not tell what is expected or how it will be judged." },
    why: "Employees can only meet expectations they understand. Weights show priorities, a trusted source makes the evidence credible, and the review rhythm should match the KPI: monthly for fast-moving activity, quarterly or half-yearly for slower outcomes.",
    apply: "For every objective, tell the employee where the evidence will come from and when you'll review it together, and explain why that rhythm suits the KPI.",
    checks(d) { const other = d.ms.filter(m => m.evidence === "Other"); return [
      { ok: d.wsum === 100, t: `Weights total ${d.wsum}% (from ${Math.min(...d.ms.map(d.W))}% to ${Math.max(...d.ms.map(d.W))}%).` },
      { ok: other.length === 0, t: other.length ? `Evidence source “Other” for ${quoteList(other)}: make sure you can name it.` : "Every objective has a named evidence source." },
      { ok: true, t: `Review frequencies: ${d.ms.map(m => `${m.freq}`).join(", ")}.` }
    ]; },
    cap() { return 2; },
    guide() { return `<p class="small t2">Read your contract as the employee would. Can you say, for each objective, what “met” looks like, where the number comes from, and when you'll look at it together?</p>`; }
  },
  /* ===== ROUND 3 ===== */
  {
    k: "coverage", r: 3, mode: "judged", n: "Evidence Coverage", principle: "Evidence Log · the whole review period",
    question: "Is the evidence you cited relevant, representative of the whole year, and sufficient to support the rating?",
    rubric: { 2: "The cited evidence is relevant to the standards, represents the whole period and covers both results and behaviour.", 1: "Relevant, but it leans on one part of the year or one dimension, or leaves out something important.", 0: "Narrow, unrepresentative or largely irrelevant." },
    why: "A fair evaluation looks at the whole review period and the full set of expectations, not the most recent or most memorable events.",
    apply: "Before rating, check that your evidence covers the whole period and both results and behaviours.",
    checks(d) { return [
      { ok: d.hasH1 && d.hasLater, t: d.hasH1 && d.hasLater ? "Your evidence covers the first half and the rest of the year." : d.hasH1 ? "Your evidence covers the first half only." : "Your evidence covers the second half or full year only." },
      { ok: d.hasW && d.hasH, t: d.hasW && d.hasH ? "Your evidence relates to both WHAT and HOW standards." : d.hasW ? "Your evidence relates to WHAT standards only." : "Your evidence relates to HOW standards only." }
    ]; },
    cap(d) { const p = d.hasH1 && d.hasLater, w = d.hasW && d.hasH; return p && w ? 2 : p || w ? 1 : 0; },
    guide(emp) { return `<p class="small t2">Each evidence entry relates to these standards: ${LOG[emp].map(e => `<br>${esc(e.p)}: ${[].concat(e.std).map(s => esc(stdName(emp, s))).join(", ")}`).join("")}</p>`; }
  },
  {
    k: "facts", r: 3, mode: "auto", n: "Facts vs. Interpretation", principle: "Facts vs interpretations · evidence quality",
    why: "Facts can be verified; interpretations are opinions about facts. Ratings and feedback built on interpretations are hard to defend and easy to dispute.",
    apply: "Rewrite any judgment word (“difficult”, “careless”, “natural leader”) as what was observed: what happened, when, and with what result.",
    score(d) { const ok = SORT[d.emp].filter(x => d.V.sort[x.id] === x.a).length; return ok >= 5 ? 2 : ok >= 3 ? 1 : 0; },
    detail(d) {
      const items = SORT[d.emp], ok = items.filter(x => d.V.sort[x.id] === x.a), wrong = items.filter(x => d.V.sort[x.id] !== x.a);
      return { demo: `You classified ${ok.length} of 6 statements correctly.`, improve: wrong.length ? wrong.map(x => `“${x.t}” is ${x.a === "fact" ? "a fact" : "an interpretation"}: ${SORT_WHY[x.a]}`).join(" ") : "All six were correct. Apply the same test to your own review notes before they reach the employee." };
    }
  },
  {
    k: "standards", r: 3, mode: "auto", ref: true, n: "Standards-Based Evaluation", principle: "Expected vs actual · performance gaps · WHAT and HOW",
    why: "Evaluate against the agreed standards: expected versus actual for each objective and competency, before forming an overall view of WHAT and HOW.",
    apply: "Write expected versus actual for every objective and competency before you decide the rating.",
    score(d) { const okS = STD[d.emp].filter(x => d.K.std[x.id].includes(d.V.judg[x.id])).length, okO = d.K.what.includes(d.V.what) && d.K.how.includes(d.V.how); return okS >= 4 && okO ? 2 : (okS >= 3 || okO) ? 1 : 0; },
    detail(d) {
      const st = STD[d.emp], okS = st.filter(x => d.K.std[x.id].includes(d.V.judg[x.id]));
      const okO = d.K.what.includes(d.V.what) && d.K.how.includes(d.V.how);
      const imp = st.filter(x => !d.K.std[x.id].includes(d.V.judg[x.id])).map(x => `${x.name}: you judged ${jl(d.V.judg[x.id])}; the reference reading is ${d.K.std[x.id].map(jl).join(" or ")}, because ${d.K.why[x.id].charAt(0).toLowerCase() + d.K.why[x.id].slice(1)}`);
      if (!d.K.what.includes(d.V.what)) imp.push(`Overall WHAT: the reference reading is ${d.K.what.map(jl).join(" or ")}.`);
      if (!d.K.how.includes(d.V.how)) imp.push(`Overall HOW: the reference reading is ${d.K.how.map(jl).join(" or ")}.`);
      return { demo: `${okS.length} of ${st.length} standard judgments match the provisional reference reading, and your overall WHAT (${jl(d.V.what)}) and HOW (${jl(d.V.how)}) ${okO ? "both match it" : "do not both match it"}. Context: ${d.K.context}`, improve: imp.length ? imp.join(" ") : "Your judgments followed the standards and the evidence. Keep separating the standard-by-standard view from the overall rating." };
    }
  },
  {
    k: "justify", r: 3, mode: "judged", n: "Evidence-Based Justification", principle: "Evidence Log: from memory to facts",
    question: "Does the evidence you cited relate to the standards, represent the record, support your rating, and account for significant evidence that points the other way?",
    rubric: { 2: "The cited evidence relates directly to the standards, supports the rating, and the evaluation accounts for significant contradictory evidence.", 1: "Relevant, but selective: it supports the rating while leaving out significant evidence that points the other way.", 0: "Largely irrelevant, or it does not support the rating." },
    why: "The evidence you cite should be the evidence that actually decides the rating, including the facts that don't fit your first impression.",
    apply: "Cite the two or three facts that most shaped your rating, and name the evidence that points the other way and why it didn't change your conclusion.",
    checks(d) {
      const sup = d.picks.filter(d.supports), ch = d.picks.filter(p => !d.supports(p));
      const other = d.lean === "mid" ? [] : LOG[d.emp].filter(e => !d.V.picks.includes(e.id) && e.pol === (d.lean === "up" ? "neg" : "pos"));
      return [
        { ok: true, t: `${d.picks.length === 2 ? "Both" : `All ${d.picks.length}`} cited entries relate to agreed standards: ${d.picks.map(p => [].concat(p.std).map(s => stdName(d.emp, s)).join(" / ")).join("; ")}.` },
        { ok: sup.length > 0, t: `${sup.length} of ${d.picks.length} cited entries point the same way as your rating of ${d.V.rating}.${ch.length ? ` ${ch.length} point the other way.` : ""}` },
        { ok: other.length === 0, t: other.length ? `Significant evidence pointing the other way that you did not cite: ${other.map(e => `${e.p}: “${bare(e.text)}”`).join(" ")} This limits the criterion to Partially applied; if your written justification addressed it, your facilitator can validate a higher level.` : d.lean === "mid" ? "A Meets rating weighs strengths and gaps together." : "No significant evidence pointing the other way was left uncited." }
      ];
    },
    cap(d) { if (d.picks.length && d.picks.every(p => !d.supports(p))) return 0; const other = d.lean === "mid" ? [] : LOG[d.emp].filter(e => !d.V.picks.includes(e.id) && e.pol === (d.lean === "up" ? "neg" : "pos")); return other.length ? 1 : 2; },
    guide() { return `<p class="small t2">Strong justification names the evidence that decides the rating and acknowledges what points the other way. It doesn't have to balance positives and negatives: it should reflect the actual record.</p>`; }
  },
  {
    k: "fair", r: 3, mode: "judged", ref: true, n: "Fair Evaluation", principle: "Fair Evaluation Test · rating calibration · evaluation biases",
    question: "Would your rating hold up in calibration: consistent with the standards, your WHAT and HOW, the whole year and the evidence, and free of bias?",
    rubric: { 2: "The rating is consistent with the standards, your own WHAT and HOW judgments and the whole year's evidence, and you checked it for bias (halo, recency, similarity).", 1: "Plausible, but one element is weak: it leans on part of the year, drifts from your own WHAT/HOW, or a bias may have shaped it.", 0: "The rating is inconsistent with the documented performance or the standards." },
    why: "A defensible rating applies the same standards to everyone and would survive calibration: another manager looking at the same record should land in a similar range. Halo, recency and similarity effects pull ratings away from the record.",
    apply: "Before finalising, ask: would I give this rating to someone else with exactly this record? Then run it through the Fair Evaluation Test from the course.",
    checks(d) {
      const r = d.V.rating, w = d.V.what, h = d.V.how;
      const contra = (w === 1 && h === 1 && r >= 3) || (w === 3 && h === 3 && r <= 3) || (w >= 2 && h >= 2 && r === 1);
      const rng = d.K.def.length > 1 ? `${d.K.def[0]} to ${d.K.def[d.K.def.length - 1]}` : String(d.K.def[0]);
      return [
        { ok: d.K.def.includes(r), t: d.K.def.includes(r) ? `Your rating of ${r} is inside the provisional reference range (${rng}).` : `Your rating of ${r} is ${d.K.pla.includes(r) ? "plausible but outside the provisional reference range" : "outside the provisional reference range"}. ${REF[d.emp].ratingWhy}` },
        { ok: !contra, t: contra ? `Your overall WHAT (${jl(w)}) and HOW (${jl(h)}) point a different way from your rating of ${r}.` : `Your rating is consistent in direction with your own WHAT (${jl(w)}) and HOW (${jl(h)}).` }
      ];
    },
    cap(d) {
      const r = d.V.rating, w = d.V.what, h = d.V.how;
      const contra = (w === 1 && h === 1 && r >= 3) || (w === 3 && h === 3 && r <= 3) || (w >= 2 && h >= 2 && r === 1);
      const base = d.K.def.includes(r) ? 2 : d.K.pla.includes(r) ? 1 : 0;
      return Math.max(0, base - (contra ? 1 : 0));
    },
    guide(emp) { return `<p class="small t2"><b>Reference reading (provisional):</b> ${esc(REF[emp].ratingWhy)}</p><p class="small t2"><b>Bias check:</b> halo (one strength colouring everything), recency (the latest events outweighing the year), similarity (rating people like us higher).</p>`; }
  }
];
function exampleRows(emp) {
  return `<div class="ex-list">${ROLE_GUIDE[emp].examples.map(([o, t, c, r]) => `<div class="ex-row"><b>${esc(o)}</b><span class="xs muted">${esc(t)} · supports “${esc(c)}” · ${esc(r)}</span></div>`).join("")}<div class="xs muted">Illustrative examples, not the only right answers.</div></div>`;
}

/* ---------- evaluation ---------- */
function critCtx(c) { return c.r === 2 ? r2Data() : r3Data(); }
function roundDone(r) { return r === 2 ? !!(S.prog.done.begins && focusEmp()) : !!(S.prog.done.evaluate && focusEmp()); }
function evalCrit(c) {
  if (!roundDone(c.r)) return null;
  const d = critCtx(c), fac = S.fac && S.fac[c.k] != null ? S.fac[c.k] : null;
  if (c.mode === "auto") { const auto = c.score(d); return { c, d, auto, s: fac != null ? fac : auto, src: fac != null ? "facilitator" : "auto" }; }
  const cap = c.cap(d), sa = (S.sa || {})[c.k] || {}, assessed = sa.lvl != null && substantive(sa.refl);
  const self = assessed ? Math.min(sa.lvl, cap) : null;
  const s = fac != null ? fac : self;
  return { c, d, cap, self, sa, assessed, s, src: fac != null ? "facilitator" : assessed ? "self" : "pending" };
}
function roundResult(r) {
  const stage = r === "begins" ? 2 : r === "evaluate" ? 3 : r;
  if (!roundDone(stage)) return null;
  const rows = CRITERIA.filter(c => c.r === stage).map(evalCrit);
  const pending = rows.filter(x => x.s == null).length;
  return { rows, total: rows.reduce((a, x) => a + (x.s || 0), 0), pending, complete: pending === 0 };
}
function movementFor(total) { return total >= 9 ? 0.5 : total >= 7 ? 0.25 : total >= 5 ? 0 : total >= 3 ? -0.25 : -0.5; }
function bmPath() {
  const pts = [{ l: "Start", v: 3 }]; let v = 3;
  [[2, "Round 2", "begins"], [3, "Round 3", "evaluate"]].forEach(([n, l, s]) => { const r = roundResult(n); if (r && r.complete) { const before = v; v = clamp(Math.round((v + movementFor(r.total)) * 100) / 100, 1, 5); pts.push({ l, v, before, delta: movementFor(r.total), total: r.total, stage: s }); } });
  return pts;
}
function bmRating() { const p = bmPath(); return p[p.length - 1].v; }
function appScore() {
  const a = roundResult(2), b = roundResult(3), rows = [...(a ? a.rows : []), ...(b ? b.rows : [])];
  const by = (src) => rows.filter(x => x.src === src).reduce((t, x) => t + x.s, 0) * 5;
  const pending = rows.filter(x => x.s == null).length + (a ? 0 : 5) + (b ? 0 : 5);
  return { r2: a ? a.total : 0, r3: b ? b.total : 0, total: ((a ? a.total : 0) + (b ? b.total : 0)) * 5, pending, provisional: pending > 0, auto: by("auto"), self: by("self"), fac: by("facilitator") };
}
/* legacy hooks: scores are computed from locked decisions */
function scoreBegins() {} function scoreEval() {} function recordStage() {}

/* ---------- rendering ---------- */
const SRC_LABEL = { auto: "Automated", self: "Self-assessed", facilitator: "Facilitator-validated", pending: "Not yet assessed" };
function srcTag(x) { return `<span class="src-tag src-${x.src}">${SRC_LABEL[x.src]}${x.src === "auto" && x.c.ref ? " · provisional reference" : ""}</span>`; }
function checkList(items) { return `<div class="stack" style="gap:6px">${items.map(i => `<div class="small"><span class="${i.ok ? "status-ok" : "status-refine"}">${i.ok ? "✓" : "△"}</span> <span class="t2">${esc(i.t)}</span></div>`).join("")}</div>`; }
function assessCard(x) {
  const c = x.c, emp = focusEmp(), sa = x.sa || {};
  return `<div class="db-card sa-card" id="sa-${c.k}">
    <div class="db-head"><div class="min0"><b>${esc(c.n)}</b><div class="xs muted">${esc(c.principle)}</div></div>${x.s != null ? `<div class="db-score s${x.s}"><span class="num">${x.s}/2</span><span>${ANCHOR[x.s]}</span></div>` : `<span class="src-tag src-pending">Not yet assessed</span>`}</div>
    <div><div class="db-l">Your decisions · automated checks</div>${checkList(c.checks(x.d))}${x.cap < 2 ? `<div class="xs status-refine" style="margin-top:6px">These checks limit this criterion to ${ANCHOR[x.cap]} (${x.cap}/2).</div>` : ""}</div>
    <details class="panel"><summary class="small" style="cursor:pointer"><b>Model guidance</b></summary><div style="margin-top:8px">${c.guide(emp)}</div></details>
    <div><div class="db-l">Assess your decision</div><p class="small" style="margin:4px 0 8px"><b>${esc(c.question)}</b></p>
      <div class="rubric">${[2, 1, 0].map(l => `<button class="rub ${sa.lvl === l ? "on" : ""}" data-act="saLvl" data-k="${c.k}" data-v="${l}" ${l > x.cap ? "disabled" : ""}><b>${l} · ${ANCHOR[l]}</b><span>${esc(c.rubric[l])}</span>${l > x.cap ? `<span class="xs status-refine">Limited by the automated checks</span>` : ""}</button>`).join("")}</div>
      ${field("Why this level? (one line, required)", inp(`sa.${c.k}.refl`, "What in your decisions makes this the right level?", 'data-rerender="1"'))}</div>
    ${x.src === "facilitator" ? `<div class="xs" style="color:var(--purple)">Facilitator-validated: ${x.s}/2${x.self != null ? ` (your self-assessment: ${x.self}/2)` : ""}</div>` : ""}
  </div>`;
}
function debriefCard(x) {
  const c = x.c;
  let demo, improve;
  if (c.mode === "auto") { const dt = c.detail(x.d); demo = dt.demo; improve = dt.improve; }
  else {
    const issues = c.checks(x.d).filter(i => !i.ok).map(i => i.t);
    demo = c.checks(x.d).map(i => i.t).join(" ") + (x.assessed ? ` You assessed this as ${ANCHOR[x.self]}: “${x.sa.refl.trim()}”` : "");
    const parts = [...issues];
    if (x.s != null && x.s < 2) parts.push(`To reach Applied effectively: ${c.rubric[2]}`);
    if (x.s == null) parts.push("Complete the self-assessment for this criterion to see your result.");
    improve = parts.length ? parts.join(" ") : `You assessed this at the top level. Test it against the model guidance: ${c.rubric[2]}`;
  }
  return `<div class="db-card">
    <div class="db-head"><div class="min0"><b>${esc(c.n)}</b><div class="xs muted">${esc(c.principle)}</div></div>
      ${x.s != null ? `<div class="db-score s${x.s}"><span class="num">${x.s}/2</span><span>${ANCHOR[x.s]}</span></div>` : `<div class="db-score"><span class="num muted">–/2</span><span>Not yet assessed</span></div>`}</div>
    <div>${srcTag(x)}${x.src === "self" && x.cap < 2 ? ` <span class="xs muted">limited to ${x.cap}/2 by automated checks</span>` : ""}${x.src === "facilitator" ? ` <span class="xs muted">${c.mode === "auto" ? `automated score ${x.auto}/2` : x.self != null ? `self-assessed ${x.self}/2` : "no self-assessment"}</span>` : ""}</div>
    <div class="db-grid">
      <div><div class="db-l">What you demonstrated</div><p>${esc(demo)}</p></div>
      <div><div class="db-l">Why it matters</div><p>${esc(c.why)}</p></div>
      <div><div class="db-l">What to improve</div><p>${esc(improve)}</p></div>
      <div><div class="db-l">Apply at work</div><p>${esc(c.apply)}</p></div>
    </div></div>`;
}
function roundTotalTag(r) { return r ? `<span class="db-total num">${r.total}/10${r.complete ? "" : ` <span class="xs muted">provisional · ${r.pending} not assessed</span>`}</span>` : ""; }
function assessSection(stage) {
  const r = roundResult(stage); if (!r) return "";
  const judged = r.rows.filter(x => x.c.mode === "judged"), auto = r.rows.filter(x => x.c.mode === "auto");
  return `${auto.length ? `<section class="stack"><div><div class="eyebrow">Automated results</div><h2>Scored from your decisions</h2></div>${auto.map(debriefCard).join("")}</section>` : ""}
    <section class="stack"><div class="row between"><div><div class="eyebrow p">Guided self-assessment</div><h2>Assess your ${stage === 2 ? "contract" : "evaluation"}</h2><p class="small muted" style="max-width:70ch">The simulation can check your structured choices, but not the meaning of what you wrote. For each criterion, review the automated checks, compare with the model guidance, choose the level that fits, and say why in one line. Automated checks set the highest level available. Your facilitator may validate these results.</p></div>${roundTotalTag(r)}</div>
    ${judged.map(assessCard).join("")}</section>`;
}
function debriefSection(stage, title) {
  const r = roundResult(stage); if (!r) return "";
  return `<section class="stack"><div class="row between"><h2>${title}</h2>${roundTotalTag(r)}</div>${r.rows.map(debriefCard).join("")}</section>`;
}
function facPanel() {
  const rows = [roundResult(2), roundResult(3)].filter(Boolean).flatMap(r => r.rows).filter(x => x.c.k !== "facts");
  if (!rows.length) return "";
  if (!UI.facOpen) return `<details class="panel fac" ${UI.facErr ? "open" : ""}><summary class="small"><b>Facilitator validation</b> <span class="muted">· optional</span></summary>
    <div class="row" style="gap:8px;margin-top:10px"><input class="inp code-inp" id="faccode" placeholder="••••" inputmode="numeric" autocomplete="off"><button class="btn btn-quiet" data-act="facUnlock">Unlock</button>${UI.facErr ? `<span class="hint-err">${esc(UI.facErr)}</span>` : ""}</div></details>`;
  const row = (x) => { const cur = S.fac[x.c.k]; const base = x.c.mode === "auto" ? `automated ${x.auto}/2` : x.self != null ? `self-assessed ${x.self}/2` : "not self-assessed"; return `<div class="row between" style="gap:10px;flex-wrap:wrap"><span><b>${esc(x.c.n)}</b> <span class="xs muted">${base}</span></span><div class="seg">${[["", "Keep"], [0, "0"], [1, "1"], [2, "2"]].map(([v, l]) => `<button class="${(cur == null && v === "") || cur === v ? "on" : ""}" data-act="facSet" data-k="${x.c.k}" data-v="${v}">${l}</button>`).join("")}</div></div>`; };
  return `<div class="panel fac stack" style="gap:10px"><b>Facilitator validation</b><p class="xs muted">Review the group's decisions against the same rubric (2 Applied effectively · 1 Partially applied · 0 Not demonstrated). A validated score replaces the self-assessed or automated score and updates the totals. Facts vs. Interpretation is fully automated.</p>${rows.map(row).join("")}</div>`;
}
function practiceCheck() {
  return `<section class="card pad-lg stack"><div><div class="eyebrow p">SCORE Practice Check · not scored</div><h2>Take this checklist back to work</h2><p class="small muted">Answer for this simulation, then use the same seven questions before your next objective-setting or review conversation.</p></div>
    <div class="stack" style="gap:8px">${PRACTICE.map((q, i) => `<div class="sort-row"><span class="min0">${esc(q)}</span>${seg(`pc.q${i}`, [{ id: "yes", l: "Yes" }, { id: "partly", l: "Partly" }, { id: "no", l: "No" }])}</div>`).join("")}</div></section>`;
}
