/* =========================================================
   SCORE REVIEW — guided self-assessment and debrief (assessment layer)
   ========================================================= */
VIEWS.review = function () {
  if (!S.emp) return pageHead("SCORE Review", "SCORE Review") + needEmp();
  const r = rec(), E = EMP();
  if (!roundOneDone(r)) return pageHead(`SCORE Review / ${esc(E.name)}`, "SCORE Review", empChip()) + lockedPanel("Available after Round 1", "The SCORE review of your goal plan opens once the performance contract is approved.");
  const n = UI.sub === "2" ? 2 : UI.sub === "summary" ? "summary" : 1;
  const sc = appScore();
  const tabs = [["1", "Round 1 · Setting Expectations", roundResult(1)], ["2", "Round 2 · Final Appraisal", roundResult(2)], ["summary", "Application Score", null]];
  return pageHead(`SCORE Review / ${esc(E.name)}`, "SCORE Review", empChip(), "The SCORE assessment sits alongside the platform. Automated checks only verify structure; your group judges quality; your facilitator can validate.") + `
  <div class="tabs" style="margin-bottom:16px">${tabs.map(([id, l, rr]) => `<button class="tab ${String(n) === id ? "on" : ""}" data-act="go" data-go="review/${id}">${l}${rr ? `<span class="n">${rr.total}/10</span>` : ""}</button>`).join("")}</div>
  ${n === "summary" ? summaryView(sc) : n === 2 && !roundTwoDone(r) ? lockedPanel("Available after Round 2", "This review opens once the final appraisal and the post-appraisal reflection are complete.") : roundView(n)}`;
};
function roundView(n) {
  const rr = roundResult(n);
  return `<div class="stack">
    <div class="card pad row between"><div><div class="eyebrow">Round ${n} · ${n === 1 ? "Setting Performance Expectations" : "Final Performance Appraisal"}</div><div class="small t2" style="margin-top:4px">For each criterion, read the automated checks, choose the rubric level that honestly describes your work, and give a one-line reason. Levels above the automated limit are disabled.</div></div><div class="stack-sm" style="align-items:flex-end"><span class="score-big num">${rr.total}<span class="small muted">/10</span></span>${rr.pending ? `<span class="xs" style="color:var(--warn)">${rr.pending} not yet assessed (count as 0)</span>` : `<span class="xs" style="color:var(--good)">All criteria assessed</span>`}</div></div>
    ${rr.rows.map(critCard).join("")}
  </div>`;
}
function critCard(x) {
  const c = x.c, base = P("sa", c.k), sa = x.sa;
  const checks = c.checks(x.d);
  return `<div class="crit" id="crit-${c.k}">
    <div class="crit-h"><div class="grow"><h3>${c.n}</h3><div class="xs muted">${c.principle}</div></div><div class="stack-sm" style="align-items:flex-end;gap:4px"><span class="src src-${x.src}">${SRC_LABEL[x.src]}</span><b class="num">${x.s != null ? x.s : "–"}/2</b></div></div>
    <div class="crit-b">
      <p class="small"><b>${esc(c.question)}</b></p>
      <div class="stack-sm"><span class="lbl"><span class="src src-auto">Automated checks</span> · limit ${x.cap}/2</span><div class="checklist">${checks.map(k => `<div class="ck ${k.info ? "info" : k.ok ? "ok" : "no"}">${icon(k.info ? "info" : k.ok ? "check" : "x", "i-sm")}<span>${esc(k.t)}</span></div>`).join("")}</div></div>
      <div class="stack-sm"><span class="lbl"><span class="src src-self">Your self-assessment</span></span>
        <div class="lvl-opts">${[2, 1, 0].map(l => `<button class="lvl-opt ${sa.lvl === l ? "on" : ""}" data-act="saLevel" data-k="${c.k}" data-v="${l}" ${l > x.cap ? "disabled" : ""}><b>${l} · ${ANCHOR[l]}</b>${esc(c.rubric[l])}</button>`).join("")}</div>
        <div class="field"><label class="lbl" for="${base}.refl">One-line reason (at least 3 words)</label><input class="inp" id="${base}.refl" ${bind(base + ".refl")} value="${esc(sa.refl || "")}" placeholder="Why this level?"></div>
      </div>
      ${x.fac != null ? `<div class="notice" style="background:var(--purple-soft);border-color:#D6D0FA;color:#43389A">${icon("shield", "i-sm")}<span>Facilitator-validated at ${x.fac}/2.</span></div>` : ""}
      <details class="small"><summary class="t2" style="cursor:pointer">Why it matters · apply at work</summary><div class="stack-sm" style="margin-top:8px"><p class="t2">${esc(c.why)}</p><p class="t2"><b>At work:</b> ${esc(c.apply)}</p></div></details>
    </div></div>`;
}
function summaryView(sc) {
  const r = rec();
  return `<div class="stack-lg">
    <div class="card pad-lg stack"><div class="row between"><div><div class="eyebrow">SCORE Application Score</div><h2 style="margin-top:4px">How well you applied the course</h2></div><span class="score-big num">${sc.total}<span class="small muted"> / 100</span></span></div>
      ${sc.provisional ? `<div class="notice warn">${icon("info", "i-sm")}<span>Provisional: ${sc.pending} criteri${sc.pending === 1 ? "on is" : "a are"} not yet assessed and count as 0.</span></div>` : ""}
      ${[["Round 1 · Setting Performance Expectations", sc.r1, roundOneDone(r)], ["Round 2 · Final Performance Appraisal", sc.r2, roundTwoDone(r)]].map(([l, v, done]) => `<div class="stack-sm"><div class="row between small"><b>${l} <span class="muted">· 50%</span></b><b class="num">${done ? v + "/10" : "Not completed"}</b></div><div class="bar"><i style="width:${v * 10}%"></i></div></div>`).join("")}
      <div class="row"><span class="src src-self">Self-assessed ${sc.self}</span><span class="src src-facilitator">Facilitator-validated ${sc.fac}</span></div>
      <p class="xs muted">(Round 1 + Round 2) × 5. Self-assessed levels are limited by automated structural checks; facilitator-validated levels replace them. Free text is never scored automatically.</p>
    </div>
    <div class="card"><div class="card-h"><h3>SCORE Practice Check</h3><span class="xs muted">Not scored · take it back to work</span></div><div class="card-b stack" style="gap:8px">
      ${PRACTICE.map((q, i) => `<div class="row between nowrap" style="border-bottom:1px solid var(--line);padding-bottom:8px"><span class="small">${esc(q)}</span><div class="seg">${["Yes", "Partly", "No"].map(o => `<button class="${r.pc[i] === o ? "on" : ""}" data-act="pc" data-i="${i}" data-v="${o}">${o}</button>`).join("")}</div></div>`).join("")}
    </div></div>
  </div>`;
}
