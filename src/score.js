/* =========================================================
   SCORE ASSESSMENT LAYER (separate from the platform workflow)
   Round 1 · Setting Performance Expectations   (5 criteria × 0–2)
   Round 2 · Final Performance Appraisal         (5 criteria × 0–2)
   Application Score = (Round 1 /10 + Round 2 /10) × 5 → /100.

   Three sources, always labelled:
     A · Automated checks  — verifiable structure only. They set the HIGHEST level
         a group can self-assess; they never read the meaning of free text and
         never treat a number in a KPI as proof of quality.
     B · Guided self-assessment — the group picks a rubric level + a one-line reason.
     C · Facilitator validation — overrides A/B for any criterion.
   Reference answers (expected ratings, rating ranges) are NOT configured until the
   employee scenarios are approved; criteria that would need them say so.
   ========================================================= */
const ANCHOR = { 2: "Applied effectively", 1: "Partially applied", 0: "Not demonstrated" };
const SRC_LABEL = { self: "Self-assessed", facilitator: "Facilitator-validated", pending: "Not yet assessed" };
const substantive = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length >= 3;
const H1_RX = /\b(jan|feb|mar|apr|may|jun|q1|q2|h1)/i, H2_RX = /\b(jul|aug|sep|oct|nov|dec|q3|q4|h2)/i, FY_RX = /full\s*year/i;

function r1Data(emp) {
  const r = S.recs[emp], g = r.goals;
  return { emp, r, E: EMPLOYEES[emp], objs: g.objectives, comps: g.comps, wt: weightTotal(r) };
}
function r2Data(emp) {
  const r = S.recs[emp], items = planItems(r, emp);
  const linked = (id) => r.evidence.filter(e => e.link === id);
  const covered = items.filter(it => linked(it.id).length);
  const a = r.appraisal;
  return { emp, r, E: EMPLOYEES[emp], items, covered, linked, a, objs: r.goals.objectives, comps: r.goals.comps,
    hasH1: r.evidence.some(e => H1_RX.test(e.period) || FY_RX.test(e.period)), hasH2: r.evidence.some(e => H2_RX.test(e.period) || FY_RX.test(e.period)) };
}

const CRITERIA = [
  /* ===== ROUND 1 · SETTING PERFORMANCE EXPECTATIONS ===== */
  { k: "align", r: 1, n: "Strategic Alignment", principle: "Strategy cascading · vertical and horizontal alignment",
    question: "Does each objective genuinely contribute to NextWave's priorities and Commercial's purpose, without stepping into another department's responsibilities?",
    rubric: { 2: "Every objective clearly advances NextWave's priorities through Commercial's purpose, without stepping into another department's responsibilities.", 1: "Most objectives contribute, but at least one is only loosely connected to the strategy or stretches into another department's responsibilities.", 0: "Several objectives are disconnected from the strategy or contradict it." },
    why: "Strategy cascading turns company priorities into departmental objectives, and those into individual objectives. Vertical alignment keeps each objective pointed at the strategy; horizontal alignment stops it colliding with what other departments own.",
    apply: "Before agreeing an objective, trace it upward: which departmental goal and which company priority does it serve? If you can't name one, question the objective.",
    checks(d) { return [
      { info: true, t: "No automated check: the plan no longer links objectives to a business objective, so alignment is judged by your group and your facilitator." },
      { info: true, t: `NextWave priorities: ${COMPANY.priorities.map(p => `${p.title} (${p.line})`).join(" · ")}` }
    ]; },
    cap() { return 2; } },
  { k: "role", r: 1, n: "Role Relevance", principle: "Role accountability · job responsibilities",
    question: "Is each objective within this person's accountability and influence, and does it reflect the main purpose of the role?",
    rubric: { 2: "Each objective sits within the employee's responsibilities and is something they can materially influence; together the objectives reflect the role's main purpose.", 1: "Most objectives are relevant, but at least one depends heavily on other people's decisions or the role's main purpose is underweighted.", 0: "Objectives are largely outside the role or outside the employee's control." },
    why: "An objective is only fair if the person can materially influence it. Anchoring objectives in the job description makes accountability clear.",
    apply: "Hold the job description next to the objectives. For each one ask: is this theirs to deliver, and what could they do differently if it misses?",
    checks(d) { return [
      { info: true, t: `Role purpose: ${d.E.role.purpose}` },
      { info: true, t: "No automated check: relevance to the role is judged, not computed." }
    ]; },
    cap() { return 2; } },
  { k: "kpi", r: 1, n: "KPI Quality", principle: "SMART objectives · KPIs · outcomes vs activity",
    question: "Does each KPI measure meaningful performance in a way both of you could verify, and does it suit the role?",
    rubric: { 2: "Each KPI measures meaningful performance (an outcome, or a genuine driver of one) in a way that can be tracked and verified, and suits the role.", 1: "The KPIs are trackable, but at least one tracks a task rather than performance, or what counts as success is vague.", 0: "The KPIs are mostly tasks or vague statements that would not show whether performance was achieved." },
    why: "A KPI can be measurable without being meaningful. What matters is whether the plan as a whole shows that value was created.",
    apply: "Before approving a KPI, ask: “What does this indicator tell us about actual performance, and how will we verify it?”",
    checks(d) { return [
      { ok: d.objs.every(o => o.kpi.trim()), t: `${d.objs.filter(o => o.kpi.trim()).length} of ${d.objs.length} objectives have a KPI / performance measure.` },
      { info: true, t: "KPI wording is not scored automatically, and a number in a KPI is not treated as proof of quality." }
    ]; },
    cap(d) { return d.objs.length && d.objs.every(o => o.kpi.trim()) ? 2 : 1; } },
  { k: "whathow", r: 1, n: "WHAT & HOW Balance", principle: "WHAT vs HOW · competencies and observable behaviours",
    question: "Do the competencies and expected levels reflect what matters most in this role, and could you observe the expected behaviour?",
    rubric: { 2: "Results and behaviours are both covered; the competencies and expected levels are the ones that matter most for this role, and the expected behaviour is observable.", 1: "Both are present, but a competency is only weakly related to the role, or an expected level or standard is unclear.", 0: "A dimension is missing, or the behavioural expectations could not be observed at all." },
    why: "Performance is what is delivered (WHAT) and how it is delivered (HOW). Competencies only guide behaviour when they fit the role and are expressed as something observable.",
    apply: "Describe each behavioural standard so a colleague could recognise it in a meeting: what the person does, not what they are.",
    checks(d) { const withStd = d.comps.filter(c => (c.standard || "").trim()).length; return [
      { ok: d.objs.length > 0 && d.comps.length >= COMP_RANGE.min, t: `WHAT: ${d.objs.length} objective${d.objs.length === 1 ? "" : "s"}. HOW: ${d.comps.length} competenc${d.comps.length === 1 ? "y" : "ies"}${d.comps.length ? ` (${d.comps.map(c => `${compName(c.id, d.emp)}: ${(LEVELS.find(l => l.id === c.level) || {}).l || "no level"}`).join(", ")})` : ""}.` },
      { info: true, t: `${withStd} of ${d.comps.length} competencies have your own behavioural standard added (optional). Which competencies you chose is not scored automatically.` }
    ]; },
    cap(d) { return d.objs.length > 0 && d.comps.length >= COMP_RANGE.min && d.comps.every(c => c.level) ? 2 : 1; } },
  { k: "clarity", r: 1, n: "Performance Clarity", principle: "Weights · evidence sources · review frequency",
    question: "Would the employee know what good looks like, what matters most, where the evidence comes from and when it will be reviewed?",
    rubric: { 2: "Expectations are clear, the weights reflect real priorities, every evidence source is identifiable and usable, and each review frequency suits how quickly that KPI moves.", 1: "Mostly clear, but one important element is vague or inconsistent, such as an unclear source or a review rhythm that doesn't suit the KPI.", 0: "The employee could not tell what is expected or how it will be judged." },
    why: "Employees can only meet expectations they understand. Weights show priorities, a trusted source makes the evidence credible, and the review rhythm should match the KPI.",
    apply: "For every objective, tell the employee where the evidence will come from and when you'll review it together.",
    checks(d) { const n = d.objs.length; return [
      { ok: d.wt === 100, t: `Weights total ${d.wt}%${n ? ` (from ${Math.min(...d.objs.map(o => num(o.weight)))}% to ${Math.max(...d.objs.map(o => num(o.weight)))}%)` : ""}.` },
      { ok: d.objs.every(o => o.evidence && (o.evidence !== "Other" || o.evidenceOther.trim())), t: "Every objective has a named evidence source." },
      { ok: d.objs.every(o => o.freq), t: `Review frequencies: ${d.objs.map(o => o.freq || "missing").join(", ")}.` },
      { info: true, t: n >= OBJ_RANGE.min && n <= OBJ_RANGE.max ? `${n} objectives: within the recommended ${OBJ_RANGE.min}–${OBJ_RANGE.max}.` : `${n} objectives: outside the recommended ${OBJ_RANGE.min}–${OBJ_RANGE.max}. This is not penalised automatically.` }
    ]; },
    cap(d) { const ok = d.wt === 100 && d.objs.every(o => o.evidence && o.freq && (o.evidence !== "Other" || o.evidenceOther.trim())); return ok ? 2 : 1; } },

  /* ===== ROUND 2 · FINAL PERFORMANCE APPRAISAL ===== */
  { k: "coverage", r: 2, n: "Evidence Coverage", principle: "Evidence Log · the whole review period",
    question: "Does your Evidence Log cover the whole year and the full set of expectations, results and behaviours?",
    rubric: { 2: "The documented evidence is relevant to the agreed expectations, represents the whole period, and covers both objectives and competencies.", 1: "Relevant, but it leans on one part of the year or one dimension, or leaves important expectations without evidence.", 0: "Little evidence was documented, or it is narrow and unrepresentative." },
    why: "A fair evaluation looks at the whole review period and the full set of expectations, not the most recent or most memorable events.",
    apply: "Before rating, check that your evidence covers the whole period and both results and behaviours.",
    checks(d) { const nObj = d.objs.filter(o => d.linked(o.id).length).length, nComp = d.comps.filter(c => d.linked(c.id).length).length; return [
      { ok: d.r.evidence.length > 0, t: `${d.r.evidence.length} evidence entr${d.r.evidence.length === 1 ? "y" : "ies"} documented.` },
      { ok: d.covered.length === d.items.length, t: `${d.covered.length} of ${d.items.length} objectives and competencies have at least one linked entry (objectives ${nObj}/${d.objs.length}, competencies ${nComp}/${d.comps.length}).` },
      { ok: d.hasH1 && d.hasH2, t: d.hasH1 && d.hasH2 ? "Entries span both halves of the year." : "Based on the Date / Period field, entries do not clearly span both halves of the year." }
    ]; },
    cap(d) { if (!d.r.evidence.length || !d.items.length) return 0; const share = d.covered.length / d.items.length; return share === 1 ? 2 : share >= 0.5 ? 1 : 0; } },
  { k: "facts", r: 2, n: "Facts vs. Interpretation", principle: "Facts vs interpretations · evidence quality",
    question: "Are your evidence entries and justifications written as verifiable facts and observations rather than labels or opinions?",
    rubric: { 2: "Entries and justifications describe what happened, when, and with what result; interpretations are clearly separated from facts.", 1: "Mostly factual, but some entries or justifications rely on labels or opinions (for example “careless”, “a natural leader”).", 0: "The record is mostly opinion or judgment about the person." },
    why: "Facts can be verified; interpretations are opinions about facts. Ratings built on interpretations are hard to defend and easy to dispute.",
    apply: "Rewrite any judgment word as what was observed: what happened, when, and with what result.",
    checks(d) { return [
      { info: true, t: "Free text is not evaluated automatically. Read your entries and justifications back and judge them against the rubric." },
      { ok: d.r.evidence.length > 0, t: `${d.r.evidence.length} entr${d.r.evidence.length === 1 ? "y" : "ies"} to review.` }
    ]; },
    cap(d) { return d.r.evidence.length ? 2 : 0; } },
  { k: "standards", r: 2, n: "Standards-Based Evaluation", principle: "Expected vs actual · WHAT and HOW",
    question: "Did you evaluate each objective and competency against what was agreed at the start of the year before forming the overall view?",
    rubric: { 2: "Each objective and competency is evaluated as expected versus actual against the agreed standard, and the overall WHAT and HOW follow from those judgments.", 1: "Most items compare expected with actual, but some ratings are not clearly tied to the agreed standard.", 0: "Ratings are general impressions rather than comparisons with the agreed standards." },
    why: "Evaluate against the agreed standards: expected versus actual for each objective and competency, before forming an overall view.",
    apply: "Write expected versus actual for every objective and competency before you decide the rating.",
    checks(d) { const okW = d.objs.filter(o => (d.a.what[o.id] || {}).rating && ((d.a.what[o.id] || {}).actual || "").trim()).length, okH = d.comps.filter(c => (d.a.how[c.id] || {}).rating && ((d.a.how[c.id] || {}).observed || "").trim()).length; return [
      { ok: okW === d.objs.length, t: `${okW} of ${d.objs.length} objectives have actual performance and a rating.` },
      { ok: okH === d.comps.length, t: `${okH} of ${d.comps.length} competencies have observed behaviours and a rating.` },
      { info: true, t: "Reference ratings are not configured yet (pending approved scenarios), so ratings are not compared with an answer key." }
    ]; },
    cap(d) { const okW = d.objs.every(o => (d.a.what[o.id] || {}).rating), okH = d.comps.every(c => (d.a.how[c.id] || {}).rating); return okW && okH ? 2 : 1; } },
  { k: "justify", r: 2, n: "Evidence-Based Justification", principle: "Evidence Log: from memory to facts",
    question: "Is each rating supported by documented evidence, including evidence that points the other way?",
    rubric: { 2: "Each rating is supported by documented evidence, and the evaluation accounts for significant evidence that points the other way.", 1: "Relevant, but selective: some ratings lack documented support, or contrary evidence is left out.", 0: "Ratings are largely unsupported by the documented evidence." },
    why: "The evidence you cite should be the evidence that actually decides the rating, including the facts that don't fit your first impression.",
    apply: "Name the two or three facts that most shaped each rating, and the evidence that points the other way.",
    checks(d) { const sup = d.items.filter(it => d.linked(it.id).length); return [
      { ok: sup.length === d.items.length, t: `${sup.length} of ${d.items.length} rated items have at least one Evidence Log entry linked to them.` },
      { info: true, t: "Whether the justification text uses the evidence well is judged, not computed." }
    ]; },
    cap(d) { if (!d.items.length) return 0; const share = d.items.filter(it => d.linked(it.id).length).length / d.items.length; return share === 1 ? 2 : share >= 0.5 ? 1 : 0; } },
  { k: "fair", r: 2, n: "Fair Evaluation", principle: "Rating calibration · evaluation biases",
    question: "Would your final rating hold up in calibration: consistent with your WHAT and HOW, the whole year's evidence, and checked for bias?",
    rubric: { 2: "The final rating is consistent with the standards, your WHAT and HOW judgments and the whole year's evidence, and you reflected honestly on possible bias.", 1: "Plausible, but one element is weak: it drifts from your own WHAT/HOW, leans on part of the year, or a bias may have shaped it.", 0: "The rating is inconsistent with the documented performance or the standards." },
    why: "A defensible rating applies the same standards to everyone and would survive calibration. Halo, horn, recency and similarity effects pull ratings away from the record.",
    apply: "Before finalising, ask: would I give this rating to someone else with exactly this record?",
    checks(d) { const o = d.a.overall, contra = o.what && o.how && o.final && ((o.what <= 2 && o.how <= 2 && o.final >= 4) || (o.what >= 4 && o.how >= 4 && o.final <= 2)); const rf = d.r.reflection; return [
      { ok: !contra, t: o.final ? (contra ? `Your final rating (${o.final}) points a different way from your overall WHAT (${o.what}) and HOW (${o.how}).` : `Your final rating (${o.final}) is consistent in direction with your overall WHAT (${o.what}) and HOW (${o.how}).`) : "No final rating yet." },
      { ok: rf.done, t: rf.done ? `Post-appraisal reflection completed: you chose to ${rf.decision === "revise" ? "revise" : "keep"} the evaluation and recorded why.` : "Post-appraisal reflection not completed." },
      { info: true, t: "Reference rating ranges are not configured yet (pending approved scenarios)." }
    ]; },
    cap(d) { const o = d.a.overall, contra = o.what && o.how && o.final && ((o.what <= 2 && o.how <= 2 && o.final >= 4) || (o.what >= 4 && o.how >= 4 && o.final <= 2)); return d.r.reflection.done && !contra ? 2 : 1; } }
];

function roundDone(n, emp = S.emp) { const r = S.recs[emp]; return n === 1 ? roundOneDone(r) : roundTwoDone(r); }
function evalCrit(c, emp = S.emp) {
  if (!emp || !roundDone(c.r, emp)) return null;
  const r = S.recs[emp], d = c.r === 1 ? r1Data(emp) : r2Data(emp);
  const cap = c.cap(d), sa = r.sa[c.k] || {}, fac = r.fac[c.k] != null ? r.fac[c.k] : null;
  const assessed = sa.lvl != null && substantive(sa.refl);
  const self = assessed ? Math.min(sa.lvl, cap) : null;
  const s = fac != null ? fac : self;
  return { c, d, cap, sa, assessed, self, fac, s, src: fac != null ? "facilitator" : assessed ? "self" : "pending" };
}
function roundResult(n, emp = S.emp) {
  if (!emp || !roundDone(n, emp)) return null;
  const rows = CRITERIA.filter(c => c.r === n).map(c => evalCrit(c, emp));
  const pend = rows.filter(x => x.s == null).length;
  return { rows, total: rows.reduce((a, x) => a + (x.s || 0), 0), pending: pend, complete: pend === 0 };
}
function appScore(emp = S.emp) {
  const a = roundResult(1, emp), b = roundResult(2, emp), rows = [...(a ? a.rows : []), ...(b ? b.rows : [])];
  const by = (src) => rows.filter(x => x.src === src).reduce((t, x) => t + x.s, 0) * 5;
  const pend = rows.filter(x => x.s == null).length + (a ? 0 : 5) + (b ? 0 : 5);
  return { r1: a ? a.total : 0, r2: b ? b.total : 0, total: ((a ? a.total : 0) + (b ? b.total : 0)) * 5, pending: pend, provisional: pend > 0, self: by("self"), fac: by("facilitator") };
}
/* Game indicator (internally "Black Mirror"): starts at 3.00, moves after each fully assessed round. */
function movementFor(total) { return total >= 9 ? 0.5 : total >= 7 ? 0.25 : total >= 5 ? 0 : total >= 3 ? -0.25 : -0.5; }
function starPath(emp = S.emp) {
  const pts = [{ l: "Start", v: 3 }]; let v = 3;
  [1, 2].forEach(n => { const r = roundResult(n, emp); if (r && r.complete) { const before = v; v = Math.min(5, Math.max(1, Math.round((v + movementFor(r.total)) * 100) / 100)); pts.push({ l: `Round ${n}`, v, before, total: r.total }); } });
  return pts;
}
const starRating = (emp = S.emp) => { const p = starPath(emp); return p[p.length - 1].v; };
const PRACTICE = [
  "Did I align objectives with business priorities?",
  "Did I define measurable expectations?",
  "Did I establish appropriate evidence sources?",
  "Did I assess both WHAT and HOW?",
  "Did I consider the complete performance period?",
  "Did I separate facts from interpretations?",
  "Did I check my evaluation for potential bias?"
];
