
let S = loadState();

const entry = (emp, id) => LOG[emp].find(x => x.id === id);

/* =========================================================
   VIEW HELPERS
   ========================================================= */
const UI = { menu: false, drawer: false, modal: null, checker: null, checkerTab: "objective", nudge: {}, err: "", story: null, tool: null, f: { period: "all", dim: "all", pol: "all" }, codeErr: "" };
function stageHead(stageId, title, lead) {
  const st = STAGES.find(s => s.id === stageId);
  return `<div class="stage-head fade-in">
    <div class="kicker"><span class="score-tag">${esc(st.short.toUpperCase())}</span></div>
    <h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}</div>`;
}
function teamsChat(msgs, time = "9:02 AM", subject = "") {
  return `<div class="tm-window" role="group" aria-label="Message from the Chief Executive Officer">
    <div class="tm-head"><div class="tm-av">CEO</div><div class="min0"><div class="tm-title">Chief Executive Officer</div><div class="tm-sub"><span class="tm-dot"></span>Available · NextWave Digital</div></div><div class="tm-tabs"><span class="on">Chat</span><span>Files</span></div></div>
    <div class="tm-body"><div class="tm-day"><span>Today</span></div>
      <div class="tm-msg"><div class="tm-av sm">CEO</div><div class="tm-stack"><div class="tm-meta"><b>Chief Executive Officer</b><span>${time}</span></div>
        ${subject ? `<div class="tm-subject">${esc(subject)}</div>` : ""}${msgs.map(m => `<div class="tm-bubble">${m}</div>`).join("")}</div></div></div>
    <div class="tm-compose"><span>Type a reply</span>${icon("arrow")}</div></div>`;
}
function needChip(emp) { const N = NEEDS[emp]; return `<span class="need-chip">${icon(N.icon)}${esc(N.theme)}</span>`; }
const fmtT = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const TIMER = { id: null, end: 0, iv: null };
function timerBtn(id, mins) {
  const running = TIMER.id === id;
  const left = running ? Math.max(0, Math.round((TIMER.end - Date.now()) / 1000)) : mins * 60;
  return `<button class="timer ${running ? "on" : ""}" data-act="timer" data-id="${id}" data-secs="${mins * 60}" aria-label="${running ? "Stop" : "Start"} ${mins}-minute timer">${icon("clock")}<span data-timer="${id}" class="num">${fmtT(left)}</span><span class="xs">${running ? "Stop" : "Start"}</span></button>`;
}
function kindTag(e) { return `<span class="kindtag k-${e.kind}">${esc(KIND_LABEL[e.kind])}</span>`; }
function dimTag(e, emp) {
  const s = e.std ? STD[emp].find(x => x.id === [].concat(e.std)[0]) : null;
  const cls = e.dim === "WHAT" ? "what" : e.dim === "HOW" ? "how" : "ctx";
  const lab = e.dim === "CTX" ? "CONTEXT" : e.dim;
  return `<span class="dimtag ${cls}">${lab}</span><div class="kpi-n">${esc(s ? s.name : e.kpi || "")}</div>`;
}
const POL_LABEL = { pos: "Positive", neg: "Development area", mix: "Mixed", ctx: "Context" };
function statusTag(s) { const c = /complete/i.test(s) ? "done" : /ongoing/i.test(s) ? "ongoing" : /open/i.test(s) ? "open" : "rec"; return `<span class="st st-${c}">${esc(s)}</span>`; }
function nrCell(v) { return v === NR ? `<span class="nr">${NR}</span>` : esc(v); }
function miniPlay(e) {
  if (!e.voice) return "";
  VOICE.texts[e.id] = e.text.replace(/[“”]/g, "");
  return `<span class="vn mini" data-vn="${e.id}"><button class="vn-play sm" data-act="playVoice" data-id="${e.id}" data-emp="${e.voice}" aria-label="Play voice note"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg><svg class="i-stop" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg></button><span class="xs muted">Voice note</span></span>`;
}
function logTable(emp, rows) {
  return `<div class="log-wrap"><table class="elog plain"><thead><tr><th>Date / Period</th><th>Evidence / Observation</th><th>Source</th><th>Impact</th><th>Manager action / Follow-up</th><th>Status</th></tr></thead><tbody>
  ${rows.map(e => `<tr>
    <td data-l="Date / Period" class="nowrap"><b class="t-p">${esc(e.p)}</b></td>
    <td data-l="Evidence / Observation" class="ev-c"><div>${esc(e.text)}</div>${e.note ? `<div class="xs muted" style="margin-top:4px">${esc(e.note)}</div>` : ""}${miniPlay(e)}</td>
    <td data-l="Source">${esc(e.src)}</td>
    <td data-l="Impact">${nrCell(e.impact)}</td>
    <td data-l="Manager action / Follow-up">${nrCell(e.action)}</td>
    <td data-l="Status">${statusTag(e.status)}</td></tr>`).join("")}
  </tbody></table></div>`;
}
function filteredLog(emp) {
  const f = UI.f;
  return LOG[emp].filter(e => (f.period === "all" || e.h === f.period) && (f.dim === "all" || e.dim === f.dim) && (f.pol === "all" || (f.pol === "pos" ? ["pos", "mix"].includes(e.pol) : f.pol === "neg" ? ["neg", "mix"].includes(e.pol) : e.pol === "ctx")));
}
function filterBar() {
  const grp = (k, label, opts) => `<div class="fgroup"><span class="fl">${label}</span>${opts.map(([v, l]) => `<button class="chip sm ${UI.f[k] === v ? "on" : ""}" data-act="filt" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
  return `<div class="filters">${grp("period", "Period", [["all", "All"], ["H1", "H1 · Jan–Jun"], ["H2", "H2 · Jul–Dec"], ["FY", "Full year"]])}${grp("dim", "Type", [["all", "All"], ["WHAT", "WHAT"], ["HOW", "HOW"], ["CTX", "Context"]])}${grp("pol", "Evidence", [["all", "All"], ["pos", "Positive"], ["neg", "Negative"], ["ctx", "Context"]])}</div>`;
}
function stdTable(emp, showRef = false) {
  return `<div class="log-wrap"><table class="elog std"><thead><tr><th>Type</th><th>Agreed standard</th><th>Expected performance</th><th>Weight</th><th>Basis</th>${showRef ? "<th>Reference reading</th>" : ""}</tr></thead><tbody>
  ${STD[emp].map(s => `<tr><td data-l="Type"><span class="dimtag ${s.dim === "WHAT" ? "what" : "how"}">${s.dim}</span></td><td data-l="Agreed standard"><b>${esc(s.name)}</b></td><td data-l="Expected performance">${esc(s.exp)}</td><td data-l="Weight" class="num">${s.w ? s.w + "%" : "–"}</td><td data-l="Basis"><span class="xs muted">${esc(s.basis)}</span><div><span class="tagline">Proposed reference standard</span></div></td>${showRef ? `<td data-l="Reference reading">${judgTag(REF[emp].std[s.id])}</td>` : ""}</tr>`).join("")}
  </tbody></table></div>`;
}
function judgTag(v) { const o = JUDG.find(j => j.id === v); return o ? `<span class="jt jt-${v}">${o.l}</span>` : `<span class="nr">Not judged</span>`; }
function contractView(emp) {
  const c = S.begins.contracts[emp];
  return `<div class="log-wrap"><table class="elog std"><thead><tr><th>#</th><th>Objective</th><th>Measure / Standard</th><th>Weight</th><th>Evidence source</th><th>Review</th></tr></thead><tbody>
    ${c.measures.map((m, i) => `<tr><td data-l="#">${i + 1}</td><td data-l="Objective"><b>${esc(m.measure)}</b></td><td data-l="Measure / Standard">${esc(m.target)}</td><td data-l="Weight" class="num">${esc(m.weight)}%</td><td data-l="Evidence source">${esc(m.evidence)}</td><td data-l="Review">${esc(m.freq || "–")}</td></tr>`).join("")}
  </tbody></table></div>
  <div class="stack" style="gap:8px"><div class="eyebrow p">HOW · Competencies</div>${c.how.map(h => `<div class="small"><span class="tagline">${esc(h.comp)}</span> <span class="t2">${esc(h.standard)}</span></div>`).join("") || `<span class="small muted">None set.</span>`}</div>`;
}
function cascadeStrip() {
  return `<section class="stack" style="gap:10px"><div class="eyebrow">Strategy cascading</div><div class="cascade">${CASCADE.map(([a, b], i) => `<div class="cs"><b>${a}</b><span>${b}</span>${i < 3 ? `<i class="cs-arrow">${icon("arrow")}</i>` : ""}</div>`).join("")}</div></section>`;
}
function placeholderPanel(title) {
  return `<div class="placeholder"><b>${esc(title)} · course wording to be inserted</b><p class="small t2" style="margin-top:4px">The approved wording from the SCORE course materials will appear here. Use the version presented in the classroom.</p></div>`;
}
function toolkitPanel() {
  const t = TOOLKIT.find(x => x.id === UI.tool);
  return `<div class="card soft stack toolkit" style="gap:12px;margin-bottom:22px">
    <div class="row between"><div><div class="eyebrow">SCORE toolkit</div><div class="small muted">Quick references from the classroom. Open one when you need it.</div></div></div>
    <div class="chips">${TOOLKIT.map(x => `<button class="chip sm ${UI.tool === x.id ? "on" : ""}" data-act="tool" data-id="${x.id}">${esc(x.t)}</button>`).join("")}</div>
    ${t ? `<div class="fade-in">${t.ph ? placeholderPanel(t.t) : `<div class="panel"><b>${esc(t.t)}</b><p class="t2" style="margin-top:4px">${esc(t.b)}</p></div>`}</div>` : ""}
  </div>`;
}
