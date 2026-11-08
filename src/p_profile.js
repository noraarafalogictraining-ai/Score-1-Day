function profileModal(emp) {
  const E = EMPLOYEES[emp];
  const tab = UI.profileTab || "profile";
  const body = tab === "profile" ? `
    <div class="kv"><div><div class="k">Experience</div><div class="v">${esc(E.tenure)}</div>${E.total ? `<div class="small t2">${esc(E.total)}</div>` : ""}</div><div><div class="k">Previous-year rating</div><div class="v">${esc(E.prevRating)}</div></div></div>
    <div class="stack" style="gap:6px"><div class="eyebrow">Previous-year performance</div><p class="t2">${esc(E.prevPerformance)}</p></div>
    <div class="stack" style="gap:6px"><div class="eyebrow">Employee story</div><p class="t2">${esc(E.story)}</p></div>
    <div class="stack" style="gap:8px"><div class="eyebrow">Strengths</div><div class="chips">${E.strengths.map(s => `<span class="strength">${esc(s)}</span>`).join("")}</div></div>`
    : `<div class="stack" style="gap:6px"><div class="eyebrow">Role purpose</div><p class="t2">${esc(E.role.purpose)}</p></div>
    <div class="stack" style="gap:6px"><div class="eyebrow">Key responsibilities</div><ul class="bullets">${E.role.responsibilities.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>
    <div class="stack" style="gap:6px"><div class="eyebrow">Expected contribution</div><p class="t2">${esc(E.role.contribution)}</p></div>
    <div class="small muted">Reports to: ${esc(E.role.reportsToRole)}</div>`;
  return `<div class="scrim" data-act="closeModalBg"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(E.name)}">
    <div class="modal-h"><div class="profile-head">${portrait(emp, 64)}<div><h2>${esc(E.name)}</h2><div class="muted">${esc(E.title)}</div></div></div><button class="x" data-act="closeModal" aria-label="Close">${icon("x")}</button></div>
    <div class="modal-b"><div class="seg"><button class="${tab === "profile" ? "on" : ""}" data-act="profileTab" data-tab="profile">Profile</button><button class="${tab === "role" ? "on" : ""}" data-act="profileTab" data-tab="role">Role / Job description</button></div>${body}</div></div></div>`;
}