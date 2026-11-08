
/* =========================================================
   SCORE ONE-DAY — STATE
   ========================================================= */
const STORE_KEY = "score-oneday-nextwave-v3";
let _mid = 0;
const uid = (p = "m") => p + Date.now().toString(36) + (_mid++).toString(36);
function blankMeasure() { return { id: uid(), measure: "", target: "", weight: "", evidence: "", freq: "", link: "" }; }
function blankContract() { return { measures: [blankMeasure(), blankMeasure(), blankMeasure()], how: [] }; }
const perEmp = (fn) => Object.fromEntries(EMP_ORDER.map(e => [e, fn(e)]));
function focusEmp() { return S.group ? GROUPS.find(g => g.n === S.group).emp : null; }
function freshState() {
  return {
    v: 1,
    group: null,
    created: Date.now(),
    prog: { done: {}, released: { r1: true }, step: {}, maxStep: {}, r2seen: false },
    r1: { viewed: {}, ans: perEmp(() => ({ need: "", risk: "" })) },
    begins: { priorities: [], ownPriority: "", contribution: "", contracts: perEmp(() => blankContract()), checks: {}, nudges: 0, tab: "omar" },
    ev: { judg: {}, notes: {}, sort: {}, what: null, how: null, context: null, rating: null, picks: [], just: "", fairAck: false, viewed: {}, result: null },
    fac: {},
    sa: {},
    pc: {}
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return deepMerge(freshState(), s); }
  } catch (e) { /* storage unavailable */ }
  return freshState();
}
