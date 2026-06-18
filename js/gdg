function toggleGdgMode() {
    gdgMode = !gdgMode;
    if (tdoMode) { tdoMode = false; const tb = document.getElementById('tdoBtn'); if (tb) { tb.style.background = 'rgba(72,136,216,.1)'; tb.style.color = 'var(--tnk)'; } const tdoEl = document.getElementById('tdoContainer'); if (tdoEl) tdoEl.remove(); }
    const btn = document.getElementById('gdgBtn');
    if (btn) {
        btn.style.background = gdgMode ? 'rgba(220,140,40,.3)' : 'rgba(220,140,40,.1)';
        btn.style.color = gdgMode ? '#ffaa44' : '#dc8c28';
    }
    if (gdgMode) {
        document.getElementById('tbSlots').style.display = 'none';
        document.getElementById('tbScores').style.display = 'none';
        document.getElementById('tbSyn').style.display = 'none';
        document.getElementById('tbReco').style.display = 'none';
        document.getElementById('szRow').style.display = 'none';
        document.getElementById('tbClrBtn').style.display = 'none';
        document.getElementById('tbCtr').style.display = 'none';
        let gdgEl = document.getElementById('gdgContainer');
        if (!gdgEl) { gdgEl = document.createElement('div'); gdgEl.id = 'gdgContainer'; gdgEl.style.flex = '1'; gdgEl.style.overflow = 'auto'; document.getElementById('tbContent').prepend(gdgEl); }
        gdgEl.innerHTML = '';
        renderGdg();
    } else {
        document.getElementById('tbSlots').style.display = '';
        document.getElementById('tbScores').style.display = '';
        document.getElementById('tbSyn').style.display = '';
        document.getElementById('szRow').style.display = '';
        document.getElementById('tbClrBtn').style.display = '';
        document.getElementById('tbCtr').style.display = '';
        const gdgEl = document.getElementById('gdgContainer');
        if (gdgEl) gdgEl.remove();
        renderTeam();
    }
    buildGrid();
}
function renderGdg() {
    const el = document.getElementById('gdgContainer');
    if (!el) return;
    const compo = gdgTeams[gdgActiveCompo];
    const TEAM_COLS = ['#4888d8', '#c89020', '#c83030'];

    const compoTabs = gdgTeams.map((c, i) => `
    <button onclick="gdgSetCompo(${i})" style="padding:5px 14px;border-radius:3px;border:1px solid ${i === gdgActiveCompo ? 'rgba(220,140,40,.5)' : 'var(--b1)'};background:${i === gdgActiveCompo ? 'rgba(220,140,40,.1)' : 'none'};color:${i === gdgActiveCompo ? '#dc8c28' : 'var(--tx2)'};cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700;flex-shrink:0">
      ${c.name}
    </button>`).join('');

    const stratSelect = (idx) => VISIBLE_STRATEGIES.map(k => {
        const s = STRATEGIES[k]; return `<option value="${k}"${gdgStrategies[idx] === k ? ' selected' : ''}>${s.icon} ${s.label}</option>`;
    }).join('');

    const teamsHtml = compo.teams.map((t, ti) => {
        const col = TEAM_COLS[ti];
        const isActive = ti === gdgActiveTeam;
        const { off, def, team: teamScore } = calcTeamScores(t.members);
        const maxVal = 200;
        const gridHtml = renderStrategicGrid(t.members, GRID_GDG_W, GRID_GDG_H, col, `gdgRemoveMember(${ti},'__NM__')`);
        const scoreBar = (label, val, barCol) => {
            const pct = Math.min(val / maxVal * 100, 100);
            return `<div style="flex:1;display:flex;flex-direction:column;gap:2px">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:var(--tx2);display:flex;justify-content:space-between">
          <span>${label}</span><span style="font-weight:900;color:var(--tx3)">${val}</span>
        </div>
        <div style="height:4px;background:var(--b1);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${barCol};border-radius:2px"></div>
        </div>
      </div>`;
        };
        return `<div onclick="gdgSetTeam(${ti})" style="flex:1;min-width:0;background:var(--s2);border:1px solid ${isActive ? col : 'var(--b1)'};border-radius:8px;overflow:hidden;cursor:pointer">
      <div style="display:flex;align-items:center;gap:6px;padding:7px 10px;background:${isActive ? `rgba(${rgb(col)},.1)` : 'none'};border-bottom:1px solid var(--b1)">
        <span style="font-size:.82rem;font-weight:800;color:${col}">${t.name}</span>
        <span style="font-size:.68rem;color:var(--tx2)">${t.members.length}/${GDG_TEAM_SIZE}</span>
        ${isActive ? `<span style="font-size:.62rem;font-weight:700;background:rgba(${rgb(col)},.15);color:${col};padding:2px 7px;border-radius:3px;margin-left:auto">Sélectionnée</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;padding:6px 10px;border-bottom:1px solid var(--b1)">
        ${scoreBar('Off', off, 'var(--mel)')}${scoreBar('Déf', def, 'var(--tnk)')}${scoreBar('Team', teamScore, 'var(--gold)')}
      </div>
      <select onclick="event.stopPropagation()" onchange="gdgStrategies[${ti}]=this.value" style="width:calc(100% - 16px);margin:6px 8px;background:var(--s3);border:1px solid var(--b2);border-radius:3px;color:var(--tx);font-size:.7rem;padding:3px 6px;font-family:inherit">
        ${stratSelect(ti)}
      </select>
      <div style="padding:8px 10px" onclick="event.stopPropagation()">${gridHtml}</div>
      <div style="padding:0 8px 8px" onclick="event.stopPropagation()">
        <button onclick="gdgAutoBuild(${ti})" style="width:100%;font-size:.66rem;padding:5px 0;margin-bottom:5px;border-radius:3px;border:1px solid rgba(168,212,40,.4);background:rgba(168,212,40,.1);color:var(--green2);cursor:pointer;font-family:inherit;font-weight:700">⚡ Auto-Build</button>
        <button onclick="gdgClearTeam(${ti})" style="width:100%;font-size:.66rem;padding:5px 0;border-radius:3px;border:1px solid rgba(200,48,48,.35);background:rgba(200,48,48,.08);color:var(--mel);cursor:pointer;font-family:inherit;font-weight:700">Vider</button>
      </div>
    </div>`;
    }).join('');

    const usedInOther = getGdgUsed(gdgActiveTeam);
    const conflictLegend = usedInOther.size ? `<div style="font-size:.72rem;color:var(--tx2);padding:4px 0 6px"><span style="color:#c83030;font-weight:700">●</span> ${usedInOther.size} monstre(s) indisponible(s) (déjà assigné dans une autre équipe)</div>` : '';

    el.innerHTML = `
    <div style="padding:10px 14px;background:var(--s1);border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <span style="font-size:.7rem;font-weight:700;color:var(--tx2);flex-shrink:0">Compo :</span>
      ${compoTabs}
      <button onclick="gdgAutoBuildAllBalanced()" style="margin-left:auto;white-space:nowrap;font-size:.75rem;padding:5px 14px;border-radius:3px;border:1px solid rgba(168,212,40,.4);background:rgba(168,212,40,.1);color:var(--green2);cursor:pointer;font-family:inherit;font-weight:700">⚖️ Équilibrer 3 Équipes</button>
    </div>
    <div style="padding:10px 14px">
      ${conflictLegend}
      <div style="display:flex;gap:10px;align-items:stretch">${teamsHtml}</div>
    </div>`;
}
function gdgAutoBuild(ti) {
    const teamIdx = ti !== undefined ? ti : gdgActiveTeam;
    const compo = gdgTeams[gdgActiveCompo];
    const team = compo.teams[teamIdx];
    const strat = STRATEGIES[gdgStrategies[teamIdx]] || STRATEGIES.balanced;
    const usedElsewhere = getGdgUsed(teamIdx);

    const ATTEMPTS = 25;
    let best = null, bestScore = -Infinity;
    for (let a = 0; a < ATTEMPTS; a++) {
        const randomness = a < 5 ? 1 : 3;
        let candidate = randomizedGreedyBuild(GDG_TEAM_SIZE, strat, usedElsewhere, randomness);
        const improved = localSearchImprove(candidate, strat, usedElsewhere, 3);
        if (improved.score > bestScore) { bestScore = improved.score; best = improved.members; }
    }

    team.members = best || [];
    saveGdg(); renderGdg(); buildGrid();
}
