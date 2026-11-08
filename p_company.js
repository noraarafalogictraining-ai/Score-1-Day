function viewCompany() {
  const C = COMPANY;
  const selP = UI.coPrio || "GROW";
  const P = C.priorities.find(p => p.id === selP);
  const prodCls = { "Core Business": "core", "Future Growth": "future", "High-Value Business": "high" };
  const meter = P.from ? `<div class="stack" style="gap:6px"><div class="row between small"><span class="muted">Today ${P.from}%</span><span style="color:var(--cyan)">2027 target ${P.to}%</span></div>
    <div class="meter"><span class="from" style="width:${P.from}%"></span><span class="to" style="left:${P.to}%"></span></div><div class="xs muted">${esc(P.metric)}</div></div>` : "";
  return `<main class="page wide stack-lg">
    <section class="co-hero fade-in">
      <div class="stack"><div class="co-logo"><img src="${IMG.logo}" alt="NextWave Digital" class="co-logo-img"></div>
        <h1>${esc(C.slogan)}</h1><p class="lead">${esc(C.plain)}</p></div>
      <div class="grid2">${C.facts.map(f => `<div class="fact"><div class="fi">${icon(f.icon)}</div><div class="min0"><div class="fl">${f.label}</div><div class="fv">${esc(f.value)}</div></div></div>`).join("")}</div>
    </section>
    <section class="grid2">
      <div class="card stack"><div class="eyebrow">Mission</div><p class="t2" style="font-size:1.05rem">${esc(C.mission)}</p></div>
      <div class="card stack"><div class="eyebrow p">Vision</div><p class="t2" style="font-size:1.05rem">${esc(C.vision)}</p></div>
    </section>
    <section class="stack"><div class="eyebrow">Customers</div><p class="t2">${esc(C.customers)}</p><div class="chips">${C.sectors.map(s => `<span class="chip" style="cursor:default">${s}</span>`).join("")}</div></section>
    <section class="stack"><div><div class="eyebrow">Products</div><h2>What we sell</h2></div>
      <div class="grid3">${C.products.map(p => `<div class="prod"><div class="pi">${icon(p.icon)}</div><div><h3>${p.name}</h3><div class="small muted">${p.kind}</div></div><p class="t2">${p.desc}</p><span class="imp ${prodCls[p.importance]}">${p.importance}</span></div>`).join("")}</div></section>
    <section class="card pad-lg stack"><div class="eyebrow">Strategic challenge</div><h2>${esc(C.challenge)}</h2>
      <div class="xs muted">2027 strategic priorities. Select one.</div>
      <div class="grid4">${C.priorities.map(p => `<button class="prio ${selP === p.id ? "on" : ""}" data-act="coPrio" data-id="${p.id}"><span class="pw">${p.id}</span><span class="small t2">${p.to && !p.from ? p.to + " revenue growth" : p.from ? `${p.from}% → ${p.to}%` : "Talent & capability"}</span></button>`).join("")}</div>
      <div class="panel stack fade-in" style="gap:10px"><div class="rule" style="color:var(--cyan);letter-spacing:.14em">${P.id}</div><p>${esc(P.line)}</p>${meter}</div>
    </section>
    <section class="grid2">
      <div class="stack"><div class="eyebrow">Values</div><div class="grid2">${C.values.map(v => `<div class="value"><span class="vi">${icon(v.icon)}</span><b>${v.name}</b></div>`).join("")}</div></div>
      <div class="stack"><div class="eyebrow p">Core competencies</div><div class="chips">${C.competencies.map(c => `<span class="chip" style="cursor:default">${c}</span>`).join("")}</div>
        <div class="card soft stack" style="margin-top:8px"><div class="eyebrow" style="color:var(--risk)">Competitor</div><h3>${C.competitor.name}</h3><p class="small t2">${C.competitor.line}</p><div class="chips">${C.competitor.tags.map(t => `<span class="tagline">${t}</span>`).join("")}</div></div></div>
    </section>
    ${!S.prog.done.firstcall ? `<div class="nav-foot"><span></span><button class="btn btn-primary" data-act="nav" data-to="hub">Meet the Commercial team ${icon("arrow")}</button></div>` : ""}
  </main>`;
}