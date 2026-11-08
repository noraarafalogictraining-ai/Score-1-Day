function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === "object") {
    const out = Array.isArray(base) ? [] : { ...base };
    for (const k of Object.keys(over)) out[k] = (base && typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k])) ? deepMerge(base[k], over[k]) : over[k];
    return out;
  }
  return over;
}
let _saveT = null;
function save(now) {
  const run = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} };
  clearTimeout(_saveT);
  if (now) run(); else _saveT = setTimeout(run, 250);
}
function resetState() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  S = freshState();
  save(true);
}

/* path helpers */
function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, val) {
  const ks = path.split(".");
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) {
    if (o[ks[i]] == null) o[ks[i]] = {};
    o = o[ks[i]];
  }
  o[ks[ks.length - 1]] = val;
}

/* ---------- text helpers ---------- */
const words = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;
const hasNum = (t) => /\d/.test(t || "");
const lc = (t) => (t || "").toLowerCase();
const EVIDENCE_SIGNAL = /\d|%|q[1-4]|h[12]|mid-?year|report|data|pipeline|stakeholder|feedback|calls?|proposal|evidence|qualif|win|loss|target|review|message|said|told|calendar|record|delivered|closed|ai\b|valtora|opportunit|activity|decision|workload|salma|omar|youssef/i;
/* Open text is checked for completion only: 0 blank · 1 superficial · 2 substantive.
   Beyond "substantive", more words earn nothing. Scoring relies on structured decisions. */
function textTier(t) {
  const s = (t || "").trim();
  if (!s) return 0;
  const letters = (s.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
  return words(s) >= 3 && letters >= 10 ? 2 : 1;
}
const substantive = (t) => textTier(t) === 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r012 = (v) => clamp(Math.round(v), 0, 2);

/* ---------- MEASURE CLASSIFIER ---------- */
const RX = {
  people: /coach|delegat|develop(ing|ment)? (salma|team|people|others)|team (capab|member|develop)|1:1|one-to-one|independen|ownership|decision rights|mentor|salma|team's|direct report/i,
  delivery: /realistic|commitment|scope|handover|hand-over|overpromis|over-promis|deliverab|sound|post-sale|rework|revision|turnaround|implementation|delivery/i,
  quality: /qualif|conversion|convert|win rate|win-rate|probabilit|progress(ion|ed)|stage|pipeline quality|forecast|hit rate|close rate|sql|mql/i,
  revenue: /revenue|booking|new business|sales value|egp|usd|\$|contract value|deals? (closed|won)|closed|\bwon\b|acv|arr|quota|% of target|value of new|new customers|customers won/i,
  influence: /stakeholder|adopt|used by|decisions? (informed|influenced|made)|recommendation|satisfaction|influenc|communicat|brief|present|trust|feedback score|nps|relationship/i,
  insight: /report|analys|intelligence|insight|competitor|market|accura|research|trend|win\/loss|segment/i,
  activity: /lead|call|meeting|visit|email|activit|outreach|touchpoint|prospect|demo|linkedin|cold|contacts?|appointments?|number of|# of/i
};
const QUALITY_WORDS = /qualif|quality|conversion|convert|win|value|margin|accura|adopt|used|probabilit|progress|realistic|sound|satisfaction|closed|retain|renewal|revenue/i;
const CATS = ["people", "delivery", "quality", "revenue", "influence", "insight", "activity"];
function classify(text) {
  const t = text || "";
  for (const c of CATS) if (RX[c].test(t)) {
    if (c === "activity" && QUALITY_WORDS.test(t)) continue;
    return c;
  }
  if (RX.activity.test(t)) return "activity";
  return "other";
}
const ROLE_CATS = {
  omar: ["insight", "influence", "activity", "delivery", "other"],
  youssef: ["revenue", "quality", "people", "delivery", "influence"],
  salma: ["quality", "activity", "revenue", "influence", "delivery"],
  mariam: ["delivery", "quality", "activity", "influence", "insight"]
};
const OUT_OF_CONTROL = /company revenue|total revenue|company-wide|18%|retention|on-time delivery|on time delivery|93%|92%|nextwave revenue|whole company|all customers/i;

/* Strategic link is inferred from what the measure is about (no dropdown) */
const CAT_LINK = { revenue: "GROW", quality: "GROW", activity: "GROW", insight: "GROW", influence: "GROW", delivery: "RETAIN", people: "BUILD" };
function linkOf(m) { return m.link || CAT_LINK[classify(`${m.measure} ${m.target}`)] || ""; }

/* ---------- OBJECTIVE / KPI QUALITY CHECKER ---------- */
function checkMeasure(emp, m) {
  const c = S.begins.contracts[emp];
  const full = `${m.measure} ${m.target}`;
  const cat = classify(full);
  const vague = /\b(improve|better|good|enhance|support|help|increase|maximi[sz]e|best|strong|effective|more)\b/i;
  const timeRx = /by |q[1-4]|month|quarter|year|week|dec|jun|2027|annual|h[12]|end of|daily|each|per /i;
  const hasStd = /\d|%|all |every|zero|none|no more than|at least|within|each/i;
  const out = { objective: [], mgmt: [], kpi: [] };
  const push = (arr, key, label, status, q) => arr.push({ key, label, status, q });

  // OBJECTIVE
  const wm = words(m.measure);
  if (wm < 3) push(out.objective, "S", "Specific", "refine", "Could two managers read this measure and track exactly the same thing?");
  else if (vague.test(m.measure) && !hasNum(full)) push(out.objective, "S", "Specific", "refine", "What exactly would be different if this ‘improved’? Name the result, not the direction.");
  else push(out.objective, "S", "Specific", "ok", "");

  if (!m.target.trim()) push(out.objective, "M", "Measurable", "risk", "Without a target or standard, how will you and the employee know if this was met?");
  else if (!hasStd.test(m.target)) push(out.objective, "M", "Measurable", "refine", "What number, threshold or standard would tell you this was met?");
  else push(out.objective, "M", "Measurable", "ok", "");

  if (/100 ?%|\bzero\b|\b0 (errors|issues|complaints)/i.test(m.target) && cat !== "insight") push(out.objective, "A", "Achievable", "refine", "Is this a standard to maintain or a stretch? What did last year's evidence suggest is realistic?");
  else push(out.objective, "A", "Achievable", "ok", "");

  const link = linkOf(m);
  if (!link) push(out.objective, "R", "Relevant", "refine", "Which 2027 priority does this measure move? If none, why is it in the contract?");
  else if (cat === "activity" && !QUALITY_WORDS.test(full)) push(out.objective, "R", "Relevant", "refine", `How directly does this volume connect to ${link === "GROW" ? "revenue growth" : "the 2027 priorities"}? What sits between the activity and the result?`);
  else push(out.objective, "R", "Relevant", "ok", "");

  if (!timeRx.test(full) && !m.freq) push(out.objective, "T", "Time-bound", "refine", "By when, or how often, will this be judged?");
  else push(out.objective, "T", "Time-bound", "ok", "");

  // MANAGEMENT CHECKS
  const control = controllability(emp, cat, full);
  push(out.mgmt, "ctrl", "Controllability", control.status, control.q);

  if (!m.evidence) push(out.mgmt, "ev", "Evidence", "risk", "Where will the evidence for this come from, and who can see it besides you?");
  else if (m.evidence === "Other") push(out.mgmt, "ev", "Evidence", "refine", "‘Other’ is hard to review at year-end. What is the actual source?");
  else if (m.evidence === "Manager observation" && hasNum(m.target)) push(out.mgmt, "ev", "Evidence", "refine", "If a numeric target is judged by observation alone, would the employee trust how it's counted?");
  else push(out.mgmt, "ev", "Evidence", "ok", "");

  const br = behaviorRisk(emp, m, cat, full);
  push(out.mgmt, "br", "Behavior Risk", br.status, br.q);

  const bal = balance(emp);
  push(out.mgmt, "bal", "Balance", bal.status, bal.q);

  // KPI CHECK
  push(out.kpi, "link", "Strategic Link", link ? "ok" : "refine", link ? "" : "Which 2027 priority is this KPI serving?");
  push(out.kpi, "rel", "Role Relevance", ROLE_CATS[emp].includes(cat) ? "ok" : "refine", ROLE_CATS[emp].includes(cat) ? "" : `Is this the result the ${EMPLOYEES[emp].title} role exists to produce? Look back at the role's purpose.`);
  push(out.kpi, "def", "Definition", wm >= 3 ? "ok" : "refine", wm >= 3 ? "" : "Could someone new to the team calculate this without asking you?");
  push(out.kpi, "meas", "Measure", (hasNum(full) || /rate|%|ratio|number|value|score|share/i.test(full)) ? "ok" : "refine", "Is this a count, a rate, a value or a judgment? Say which.");
  push(out.kpi, "tgt", "Target", m.target.trim() ? (hasStd.test(m.target) ? "ok" : "refine") : "risk", m.target.trim() ? "What standard separates ‘met’ from ‘not met’?" : "There is no target yet. What does good look like?");
  push(out.kpi, "src", "Evidence Source", out.mgmt[1].status, out.mgmt[1].q);
  push(out.kpi, "freq", "Frequency", m.freq ? "ok" : "refine", m.freq ? "" : "How often will you look at this together, and is that often enough to act?");
  push(out.kpi, "ctrl", "Controllability", control.status, control.q);
  push(out.kpi, "br", "Behavior Risk", br.status, br.q);

  const all = [...out.objective, ...out.mgmt, ...out.kpi];
  const risks = all.filter(x => x.status === "risk").length;
  const refines = all.filter(x => x.status === "refine").length;
  out.cat = cat;
  out.overall = risks ? "risk" : refines ? "refine" : "ok";
  // nudge: one coaching question, highest severity first
  const order = [...out.mgmt.filter(x => x.status === "risk"), ...out.objective.filter(x => x.status === "risk"), ...out.kpi.filter(x => x.status === "risk"), ...out.mgmt.filter(x => x.status === "refine"), ...out.objective.filter(x => x.status === "refine"), ...out.kpi.filter(x => x.status === "refine")];
  out.nudge = order.length ? order[0].q : "This one looks manageable. What would the employee say it asks of them?";
  return out;
}
function controllability(emp, cat, full) {
  const ownDelivery = emp === "mariam" && /proposal|design|deck|demo/i.test(full) && !/company|total|all customers|whole/i.test(full);
  if (OUT_OF_CONTROL.test(full) && !ownDelivery) return { status: "risk", q: "How much of this result can this person directly influence? What would they do if it moved for reasons outside their role?" };
  if (emp === "omar" && (cat === "revenue" || cat === "quality")) return { status: "risk", q: "This role doesn't own deals. If this number misses, what could the person in it have done differently?" };
  if (emp === "salma" && cat === "people") return { status: "refine", q: "Is this within a Sales Executive's control?" };
  if (emp === "mariam" && cat === "revenue") return { status: "refine", q: "This role supports deals but doesn't own them. If the deal is lost on price, what could the person in this role have done differently?" };
  return { status: "ok", q: "" };
}
function behaviorRisk(emp, m, cat, full) {
  if (cat === "activity" && !QUALITY_WORDS.test(full)) return { status: "risk", q: "If this were the only number that mattered, what could a smart person do to hit it without creating any business value?" };
  if (cat === "revenue" && emp !== "omar" && emp !== "mariam") {
    const hasGuard = S.begins.contracts[emp].measures.some(x => ["delivery", "quality"].includes(classify(`${x.measure} ${x.target}`))) || S.begins.contracts[emp].how.some(h => /realistic|commit|sound|promis|scope/i.test(h.standard || ""));
    if (!hasGuard) return { status: "refine", q: "What might someone promise a customer to hit this number, and does anything else in the contract catch that?" };
  }
  if (emp === "omar" && cat === "insight" && /number|count|#/i.test(full)) return { status: "refine", q: "More reports, or better decisions? Which would you rather this role optimise for?" };
  return { status: "ok", q: "" };
}
function balance(emp) {
  const ms = S.begins.contracts[emp].measures;
  const cats = ms.map(x => classify(`${x.measure} ${x.target}`));
  const w = ms.map(x => Number(x.weight) || 0);
  const actW = ms.reduce((a, x, i) => a + (cats[i] === "activity" && !QUALITY_WORDS.test(`${x.measure} ${x.target}`) ? w[i] : 0), 0);
  if (actW > 40) return { status: "risk", q: "Most of this contract rewards volume. What in it tells the employee that quality matters?" };
  if (ms.length > 1 && new Set(cats).size === 1) return { status: "refine", q: "All the measures pull in the same direction. What could go wrong that none of them would show?" };
  if (Math.max(...w, 0) > 70 && ms.length > 1) return { status: "refine", q: "One measure carries most of the weight. Is the rest of the contract really optional?" };
  return { status: "ok", q: "" };
}
function contractStats(emp) {
  const c = S.begins.contracts[emp];
  const wsum = c.measures.reduce((a, x) => a + (Number(x.weight) || 0), 0);
  return { wsum, n: c.measures.length };
}
function contractComplete(emp) {
  const c = S.begins.contracts[emp];
  const st = contractStats(emp);
  const msOk = c.measures.length >= 3 && c.measures.length <= 5 && c.measures.every(m => m.measure.trim() && m.target.trim() && Number(m.weight) > 0 && m.evidence);
  const howOk = c.how.length >= 2 && c.how.length <= 3 && c.how.every(h => substantive(h.standard));
  return { msOk, howOk, wOk: st.wsum === 100, ok: msOk && howOk && st.wsum === 100 };
}
/* ---------- MANAGEMENT VISIBILITY ----------
   Measures change what the manager can SEE, never what happened. */
function measureVisibility(emp, m) {
  const full = `${m.measure} ${m.target}`;
  const cat = classify(full);
  const notes = [];
  if (cat === "activity" && !QUALITY_WORDS.test(full)) {
    const qualityDim = { salma: "opportunity quality", youssef: "deal quality and soundness", omar: "whether the insight is used", mariam: "on-time delivery and revision rounds" }[emp];
    notes.push(`Strong visibility into activity, limited visibility into ${qualityDim}.`);
  }
  if (cat === "other") notes.push("Not mapped to a tracked data source, so you'll need to judge it from the evidence file.");
  if (!m.evidence && m.status !== "added") notes.push("No evidence source set, so judging this relies on impressions.");
  else if (m.evidence === "Other") notes.push("Evidence source unclear, so judging this relies on impressions.");
  return notes;
}
function contractVisibility(emp, measures) {
  const cats = measures.filter(m => m.status !== "removed").map(m => classify(`${m.measure} ${m.target}`));
  const dims = ROLE_VIEW[emp];
  return { clear: dims.filter(d => d.cats.some(c => cats.includes(c))).map(d => d.label), limited: dims.filter(d => !d.cats.some(c => cats.includes(c))).map(d => d.label) };
}
/* ---------- BLACK MIRROR ---------- */
function movementFor(total) {
  if (total >= 9) return 0.5;
  if (total >= 7) return 0.25;
  if (total >= 5) return 0;
  if (total >= 3) return -0.25;
  return -0.5;
}
function recordStage(stage, crit) {
  const total = Object.values(crit).reduce((a, b) => a + b, 0);
  const delta = movementFor(total);
  const before = S.bm.rating;
  const after = clamp(Math.round((before + delta) * 100) / 100, 1, 5);
  S.bm.rating = after;
  S.bm.history = S.bm.history.filter(h => h.stage !== stage);
  S.bm.history.push({ stage, crit, total, delta, before, after });
}
function scoreBegins() {
  const b = S.begins, emp = focusEmp();
  const traps = b.priorities.filter(id => COMMERCIAL_PRIORITY_OPTIONS.find(p => p.id === id)?._trap).length;
  const nSel = b.priorities.length + (b.ownPriority.trim() ? 1 : 0);
  const ms = b.contracts[emp].measures;
  const linked = ms.filter(m => linkOf(m)).length / Math.max(1, ms.length);
  let align = 0;
  if (nSel >= 2 && nSel <= 3 && traps === 0) align = 2; else if (traps <= 1 && nSel >= 1) align = 1;
  if (linked < 0.75) align -= 1;

  const relevant = ms.filter(m => { const t = `${m.measure} ${m.target}`; const cat = classify(t); return ROLE_CATS[emp].includes(cat) && controllability(emp, cat, t).status === "ok"; }).length / Math.max(1, ms.length);
  const role = relevant >= 0.85 ? 2 : relevant >= 0.6 ? 1 : 0;

  const q = ms.map(m => { const r = checkMeasure(emp, m); return r.overall === "ok" ? 1 : r.overall === "refine" ? 0.6 : 0; });
  const qa = q.reduce((a, v) => a + v, 0) / Math.max(1, q.length);
  const quality = qa >= 0.8 ? 2 : qa >= 0.5 ? 1 : 0;

  // WHAT + HOW: not dominated by volume, and the contract covers more than one side of the role
  let wh = (balance(emp).status !== "risk" && ms.some(m => { const t = `${m.measure} ${m.target}`; return classify(t) !== "activity" || QUALITY_WORDS.test(t); })) ? 1 : 0;
  const vis = contractVisibility(emp, ms);
  const yPeople = emp !== "youssef" || ms.some(m => classify(`${m.measure} ${m.target}`) === "people") || b.contracts.youssef.how.some(h => h.comp === "Coaching");
  wh += vis.clear.length >= 2 && yPeople ? 1 : 0;

  const measurable = ms.filter(m => /\d|%|all |every|zero|at least|within|no more than/i.test(m.target)).length / Math.max(1, ms.length);
  const sourced = ms.filter(m => m.evidence && m.evidence !== "Other" && m.freq).length / Math.max(1, ms.length);
  const clarity = (measurable >= 0.8 ? 1 : measurable >= 0.5 ? 0.5 : 0) + (sourced >= 0.8 ? 1 : sourced >= 0.5 ? 0.5 : 0);

  recordStage("begins", { align: r012(align), role, quality, whathow: r012(wh), clarity: r012(clarity) });
}
const ICONS = {
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.4.2 4.3 1.8 4.8 4.8"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5S9.6 5.9 12 3.5Z"/>',
  layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  heart: '<path d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  doc: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  quote: '<path d="M6 17c-1.5-1.5-2-3-2-5 0-3 2-5 5-6M15 17c-1.5-1.5-2-3-2-5 0-3 2-5 5-6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
  home: '<path d="M4 11 12 4l8 7v9H4v-9Z"/><path d="M10 20v-5h4v5"/>',
  building: '<path d="M5 21V5l7-2v18M12 21h7V9l-7-2"/><path d="M8 8h1M8 12h1M8 16h1M15 12h1M15 16h1"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  metric: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
  obs: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  msg: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
  wave: '<path d="M3 14c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4 2.5 4 3 4"/>'
};
function icon(name, cls = "") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
}

/* Employee photography (embedded data: URIs from IMG); the SVG portraits below remain as a fallback */
const PHOTO_URLS = { omar: IMG.omar, youssef: IMG.youssef, salma: IMG.salma, mariam: IMG.mariam };
const PORTRAIT = {
  omar: { bg1: "#2B4C7E", bg2: "#1A2B4F", skin: "#C89572", skin2: "#B07F5E", hair: "#1E1712", jacket: "#3E4E66", shirt: "#DCE4EE" },
  youssef: { bg1: "#3B3A7A", bg2: "#1D1F4A", skin: "#B98263", skin2: "#9E6B4F", hair: "#15110E", jacket: "#1F2B45", shirt: "#F2F5FA" },
  salma: { bg1: "#1F5A6E", bg2: "#14304A", skin: "#D7A585", skin2: "#C08E6E", hair: "#2A1A14", jacket: "#6E4C7A", shirt: "#F0E6EE" },
  mariam: { bg1: "#5A3F78", bg2: "#241A44", skin: "#CF9C7C", skin2: "#B78466", hair: "#1B1210", jacket: "#2F6A73", shirt: "#EDF3F2" }
};
function portrait(emp, size = 64) {
  if (PHOTO_URLS[emp]) return `<span class="avatar" style="width:${size}px;height:${size}px"><img src="${PHOTO_URLS[emp]}" alt="${EMPLOYEES[emp].name}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block"></span>`;
  const p = PORTRAIT[emp];
  const g = `g-${emp}-${size}`;
  let hairBack = "", hairFront = "", extra = "";
  if (emp === "omar") {
    hairFront = `<path d="M35 43 C33 28 42 23.5 50 23.5 C59 23.5 67 28 65 43 C63 36 58 32.5 50 32.5 C43 32.5 37 36 35 43 Z" fill="${p.hair}"/>`;
    extra = `<path d="M35.5 47 C36.5 60 43 65 50 65 C57 65 63.5 60 64.5 47 C62.5 55 58 58.5 50 58.5 C42 58.5 37.5 55 35.5 47 Z" fill="${p.hair}" opacity=".78"/>
      <path d="M45 58.6 C47.5 60 52.5 60 55 58.6" stroke="${p.hair}" stroke-width="1.6" fill="none" opacity=".7"/>
      <rect x="38.5" y="42.5" width="10" height="7" rx="2.6" fill="none" stroke="#10151F" stroke-width="1.2"/>
      <rect x="51.5" y="42.5" width="10" height="7" rx="2.6" fill="none" stroke="#10151F" stroke-width="1.2"/>
      <path d="M48.5 45.5 H51.5" stroke="#10151F" stroke-width="1.2"/>`;
  }
  if (emp === "youssef") {
    hairFront = `<path d="M34.8 44 C32.5 27 44 22.5 51 22.5 C62 22.5 67.5 30 65.2 44 C64 35 60 31 54.5 30.5 C50 34 42 34.5 34.8 44 Z" fill="${p.hair}"/>`;
    extra = `<path d="M46 76 L50 90 L54 76" fill="#8C2F3A"/>`;
  }
  if (emp === "salma") {
    hairBack = `<path d="M30.5 50 C27.5 25 40 19 50 19 C62 19 73 26 69.5 52 C70.5 64 72 74 68.5 84 L31.5 84 C27.5 73 29.5 62 30.5 50 Z" fill="${p.hair}"/>`;
    hairFront = `<path d="M34.8 43 C35.5 30 43.5 25.5 52 25.5 C60.5 25.5 66.5 32 65.2 43 C60 34.5 52 31.5 45.5 34 C40.5 36 37 39.5 34.8 43 Z" fill="${p.hair}"/>`;
    extra = `<circle cx="35.2" cy="52.5" r="1.3" fill="#E8C66A"/><circle cx="64.8" cy="52.5" r="1.3" fill="#E8C66A"/>`;
  }
  if (emp === "mariam") {
    hairBack = `<path d="M31 48 C29 26 40 20.5 50 20.5 C61 20.5 71.5 26 69 48 L70 78 C64 82 58 80 57 74 L43 74 C42 80 36 82 30 78 Z" fill="${p.hair}"/>`;
    hairFront = `<path d="M34.6 45 C34 30 42 24.5 51 24.5 C60 24.5 66.5 30.5 65.4 44 C62 36 57.5 31.5 50.5 30.8 C46 34.5 40 38.5 34.6 45 Z" fill="${p.hair}"/>`;
    extra = `<rect x="38.5" y="42.8" width="9.6" height="6.6" rx="3.2" fill="none" stroke="#C9A86A" stroke-width="1.1"/><rect x="51.9" y="42.8" width="9.6" height="6.6" rx="3.2" fill="none" stroke="#C9A86A" stroke-width="1.1"/><path d="M48.1 45.6 H51.9" stroke="#C9A86A" stroke-width="1.1"/>`;
  }
  const brows = emp === "salma" || emp === "mariam" ? `<path d="M40.5 41.2 Q44 39.6 47.5 41" stroke="${p.hair}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M52.5 41 Q56 39.6 59.5 41.2" stroke="${p.hair}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`
    : `<path d="M40 41 Q44 39.2 48 40.6" stroke="${p.hair}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M52 40.6 Q56 39.2 60 41" stroke="${p.hair}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<span class="avatar" style="width:${size}px;height:${size}px" role="img" aria-label="${EMPLOYEES[emp].name}">
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="${g}" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/></radialGradient></defs>
    <rect width="100" height="100" fill="url(#${g})"/>
    ${hairBack}
    <path d="M13 101 C15 81 30 72.5 50 72.5 C70 72.5 85 81 87 101 Z" fill="${p.jacket}"/>
    <path d="M42 73 L50 87 L58 73 Z" fill="${p.shirt}"/>
    <path d="M43 59 L57 59 L57 73.5 C54 77 46 77 43 73.5 Z" fill="${p.skin2}"/>
    <ellipse cx="35.5" cy="47" rx="3" ry="4.2" fill="${p.skin2}"/><ellipse cx="64.5" cy="47" rx="3" ry="4.2" fill="${p.skin2}"/>
    <ellipse cx="50" cy="45.5" rx="15" ry="18.5" fill="${p.skin}"/>
    ${hairFront}
    ${brows}
    <ellipse cx="44" cy="46" rx="1.5" ry="1.7" fill="#161616"/><ellipse cx="56" cy="46" rx="1.5" ry="1.7" fill="#161616"/>
    <path d="M50 47 C49 50.5 48.6 52 50.8 52.4" stroke="${p.skin2}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M45.5 56 Q50 58.6 54.5 56" stroke="#7A3F37" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    ${extra}
  </svg></span>`;
}

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nl = (s) => esc(s).replace(/\n/g, "<br>");

function ta(path, ph = "", cls = "", rows = 3) {
  const v = getPath(S, path) || "";
  return `<textarea class="ta ${cls}" id="f-${path.replace(/[^\w-]/g, "-")}" data-bind="${path}" rows="${rows}" placeholder="${esc(ph)}">${esc(v)}</textarea>`;
}
function inp(path, ph = "", extra = "") {
  const v = getPath(S, path);
  return `<input class="inp" id="f-${path.replace(/[^\w-]/g, "-")}" data-bind="${path}" value="${esc(v == null ? "" : v)}" placeholder="${esc(ph)}" ${extra}>`;
}
function selectEl(path, opts, ph = "Select…", rerender = false) {
  const v = getPath(S, path) || "";
  return `<select class="sel" id="f-${path.replace(/[^\w-]/g, "-")}" data-bind="${path}" ${rerender ? 'data-rerender="1"' : ""}><option value="">${esc(ph)}</option>${opts.map(o => { const val = typeof o === "string" ? o : o.v; const l = typeof o === "string" ? o : o.l; return `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select>`;
}
function seg(path, opts, cls = "") {
  const v = getPath(S, path);
  return `<div class="seg ${cls}" role="group">${opts.map(o => `<button type="button" class="${String(v) === String(o.id) ? "on" : ""} ${o.cls || ""}" data-act="set" data-path="${path}" data-val="${esc(o.id)}" ${typeof o.id === "number" ? 'data-num="1"' : ""}>${esc(o.l)}</button>`).join("")}</div>`;
}
function field(label, control, hint = "") {
  return `<div class="field"><label class="lbl">${label}</label>${control}${hint ? `<div class="xs muted">${hint}</div>` : ""}</div>`;
}
/* ---------- Voice notes: written transcript + spoken playback (device speech voices) ---------- */
const VOICE = {
  ok: typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
  playing: null,
  texts: {},
  pick(emp) {
    let vs = [];
    try { vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) {}
    const natural = (v) => /natural|neural|online|premium|enhanced|google/i.test(v.name) ? 0 : 1;
    vs.sort((a, b) => natural(a) - natural(b));
    const fem = /female|samantha|victoria|karen|moira|tessa|zira|susan|aria|jenny|sonia|libby|hazel|serena|fiona|allison|ava|joanna|kendra|salli|natasha|emma|michelle|clara|ana|uk english female|us english/i;
    const mal = /\bmale|daniel|alex|fred|david|mark|george|guy|ryan|arthur|rishi|aaron|oliver|thomas|james|tom|matthew|christopher|eric|brian|william|andrew|roger|steffan|uk english male/i;
    const women = vs.filter(v => fem.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i, "")));
    const men = vs.filter(v => mal.test(v.name) && !/female/i.test(v.name));
    if (emp === "salma") return women[0] || vs[0] || null;
    if (emp === "mariam") return women[1] || women[0] || vs[0] || null;
    if (emp === "youssef") return men[1] || men[0] || vs[0] || null;
    return men[0] || vs[0] || null;
  },
  play(id, emp, text) {
    if (!this.ok) return false;
    try {
      if (this.playing === id) { this.stop(); return true; }
      speechSynthesis.cancel();
      const v = this.pick(emp);
      const parts = text.replace(/[“”]/g, "").split(/(?<=[.!?])\s+/).filter(Boolean);
      const tone = { omar: [0.92, 0.95], youssef: [0.93, 0.97], salma: [0.95, 1.04], mariam: [0.88, 1.0] }[emp] || [0.93, 1];
      this.playing = id; this.mark();
      parts.forEach((p, i) => {
        const u = new SpeechSynthesisUtterance(p);
        if (v) u.voice = v;
        u.lang = (v && v.lang) || "en-US"; u.rate = tone[0]; u.pitch = tone[1];
        if (i === parts.length - 1) u.onend = () => { if (this.playing === id) this.stop(); };
        u.onerror = (ev) => { if (ev.error !== "interrupted" && ev.error !== "canceled" && this.playing === id) this.stop(); };
        speechSynthesis.speak(u);
      });
      return true;
    } catch (e) { this.stop(); return false; }
  },
  stop() { try { speechSynthesis.cancel(); } catch (e) {} this.playing = null; this.mark(); },
  mark() { document.querySelectorAll(".vn").forEach(el => el.classList.toggle("playing", el.dataset.vn === this.playing)); }
};
try { if (VOICE.ok) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } } catch (e) {}
function voiceDuration(text) { const s = Math.max(3, Math.round(words(text) / 2.5)); return `0:${String(s).padStart(2, "0")}`; }
function voiceNote(e, opts = {}) {
  const id = e.id || (e.from + (e.text || "").length);
  VOICE.texts[id] = e.text;
  let seed = 0; for (const ch of e.text) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  const bars = Array.from({ length: 34 }, (_, i) => { seed = (seed * 48271) % 9973; const h = 22 + (seed % 70) * (0.55 + 0.45 * Math.sin(i / 3)); return `<i style="height:${Math.max(14, Math.min(100, Math.round(h)))}%;animation-delay:${(i % 8) * 0.07}s"></i>`; }).join("");
  return `<div class="msg ${opts.cls || ""}" ${opts.attrs || ""}>${portrait(e.from, 38)}<div class="bubble vn-bubble"><div class="who">${esc(EMPLOYEES[e.from].first)} <span>${esc(e.source)}</span></div>
    <div class="vn ${VOICE.playing === id ? "playing" : ""}" data-vn="${esc(id)}">
      <button class="vn-play" data-act="playVoice" data-id="${esc(id)}" data-emp="${e.from}" aria-label="Play voice note from ${esc(EMPLOYEES[e.from].first)}">
        <svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>
        <svg class="i-stop" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>
      </button>
      <div class="vn-wave" aria-hidden="true">${bars}</div>
      <span class="vn-time">${voiceDuration(e.text)}</span>
    </div>
    <div class="vn-transcript"><span class="xs muted">Transcript</span><div>${esc(e.text)}</div></div>
  </div></div>`;
}
function evCard(e, opts = {}) {
  const ic = { metric: "metric", doc: "doc", obs: "eye", quote: "quote", msg: "msg" }[e.type] || "info";
  if (e.type === "msg" && e.from && e.voice) return voiceNote(e, opts);
  if (e.type === "msg" && e.from) {
    return `<div class="msg ${opts.cls || ""}" ${opts.attrs || ""}>${portrait(e.from, 38)}<div class="bubble"><div class="who">${esc(EMPLOYEES[e.from].first)} <span>${esc(e.source)}</span></div><div>${esc(e.text)}</div></div></div>`;
  }
  return `<div class="ev ${e.type === "quote" ? "quote" : ""} ${opts.cls || ""}" ${opts.attrs || ""}><div class="ic">${icon(ic)}</div><div class="min0"><div class="src">${esc(e.source)}</div><div class="tx">${esc(e.text)}</div></div></div>`;
}
/* Role identity (used where expectations are set for the role, not the person) */
const ROLE_ICON = { omar: "📊", youssef: "🤝", salma: "🎯", mariam: "📝" };
function roleBadge(emp, size = 44) {
  return `<span class="role-badge" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px" aria-hidden="true">${ROLE_ICON[emp]}</span>`;
}
function roleLine(emp, size = 44, sub = "") {
  return `<div class="emp-line">${roleBadge(emp, size)}<div class="min0"><div class="nm">${esc(EMPLOYEES[emp].title)}</div>${sub ? `<div class="tt">${esc(sub)}</div>` : ""}</div></div>`;
}
function empLine(emp, size = 44, sub = null) {
  const E = EMPLOYEES[emp];
  return `<div class="emp-line">${portrait(emp, size)}<div class="min0"><div class="nm">${esc(E.name)}</div><div class="tt">${esc(sub == null ? E.title : sub)}</div></div></div>`;
}
function ratingLabel(v) { const r = RATING_SCALE.find(x => x.v === v); return r ? `${r.v} · ${r.label}` : "–"; }
function statusCls(s) { return s === "ON TRACK" ? "status-ok" : s === "WATCH" ? "status-refine" : s === "ACT" ? "status-risk" : ""; }
function sym(status) { return status === "ok" ? "✓" : status === "refine" ? "△" : "⚠"; }
function verdictHTML(status) {
  const t = { ok: "✓ READY TO MANAGE", refine: "△ NEEDS REFINEMENT", risk: "⚠ MANAGEMENT RISK" }[status];
  return `<span class="verdict ${status}">${t}</span>`;
}
function healthDots(v) { return `<span class="hd s${v}"><i></i><i></i><i></i></span>`; }
function callout(html, cls = "", ic = "info") { return `<div class="callout ${cls}"><div class="ci">${icon(ic)}</div><div class="min0">${html}</div></div>`; }