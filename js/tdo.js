function autoBuildBalancedTeams(teamsArr, strategies, teamSize, getUsedFn) {
    const baseUsed = getUsedFn ? getUsedFn() : new Set();
    const pool = Object.keys(MONSTERS).filter(nm => !baseUsed.has(nm) && !excludedFromReco.includes(nm));
    const strats = teamsArr.map((_, i) => STRATEGIES[strategies[i]] || STRATEGIES.balanced);
    const memo = new Map();
    function score(ti, members) {
        const key = ti + '|' + [...members].sort().join(',');
        let v = memo.get(key);
        if (v === undefined) { v = members.length ? evalTeamScore(members, strats[ti]) : 0; memo.set(key, v); }
        return v;
    }
    function evalAll(teams) {
        const sc = teams.map((t, i) => score(i, t));
        const min = Math.min(...sc), max = Math.max(...sc), avg = sc.reduce((x, y) => x + y, 0) / sc.length;
        return min * 2 + avg - (max - min) * 1.5;
    }
    function greedy(noise) {
        const teams = teamsArr.map(() => []);
        const used = new Set();
        for (let step = 0; step < teamSize * teams.length; step++) {
            let ti = -1;
            teams.forEach((t, i) => {
                if (t.length >= teamSize) return;
                if (ti < 0 || t.length < teams[ti].length || (t.length === teams[ti].length && score(i, t) < score(ti, teams[ti]))) ti = i;
            });
            if (ti < 0) break;
            const avail = pool.filter(nm => !used.has(nm));
            if (!avail.length) break;
            const base = score(ti, teams[ti]);
            let best = null, bestG = -Infinity;
            avail.forEach(nm => {
                const g = score(ti, [...teams[ti], nm]) - base + (noise ? Math.random() * noise : 0);
                if (g > bestG) { bestG = g; best = nm; }
            });
            teams[ti].push(best);
            used.add(best);
        }
        return teams;
    }
    function improve(teams, passes) {
        let cur = evalAll(teams);
        for (let p = 0; p < passes; p++) {
            let changed = false;
            const inTeams = new Set(teams.flat());
            const free = pool.filter(nm => !inTeams.has(nm));
            for (let a = 0; a < teams.length; a++) {
                for (let i = 0; i < teams[a].length; i++) {
                    for (let f = 0; f < free.length; f++) {
                        const old = teams[a][i];
                        teams[a][i] = free[f];
                        const v = evalAll(teams);
                        if (v > cur + 1e-6) { cur = v; free[f] = old; changed = true; } else teams[a][i] = old;
                    }
                    for (let b2 = a + 1; b2 < teams.length; b2++) {
                        for (let j = 0; j < teams[b2].length; j++) {
                            const x = teams[a][i], y = teams[b2][j];
                            teams[a][i] = y; teams[b2][j] = x;
                            const v = evalAll(teams);
                            if (v > cur + 1e-6) { cur = v; changed = true; } else { teams[a][i] = x; teams[b2][j] = y; }
                        }
                    }
                }
            }
            if (!changed) break;
        }
        return cur;
    }
    let bestTeams = null, bestVal = -Infinity;
    [0, 6, 12, 20].forEach(noise => {
        const t = greedy(noise);
        const v = improve(t, 3);
        if (v > bestVal) { bestVal = v; bestTeams = t.map(x => [...x]); }
    });
    bestTeams.forEach((members, i) => { teamsArr[i].members = members; teamsArr[i].positions = {}; });
}

function teamStrengths(teams, strategies) {
    const sc = teams.map((t, i) => t.members.length ? Math.round(evalTeamScore(t.members, STRATEGIES[strategies[i]] || STRATEGIES.balanced)) : 0);
    const filled = sc.filter((v, i) => teams[i].members.length);
    const min = filled.length ? Math.min(...filled) : 0, max = filled.length ? Math.max(...filled) : 0;
    return { sc, min, max, gap: max > 0 ? Math.round((max - min) / max * 100) : 0 };
}

function strengthBadge(st, ti) {
    const v = st.sc[ti];
    if (!v) return '';
    const weak = v === st.min && st.max > st.min;
    return `<span class="team-force${weak ? ' weak' : ''}" title="Force estimée de l'équipe (buffs, synergies, composition)">Force ${v}</span>`;
}

function strengthSummary(st) {
    if (!st.max) return '';
    return `<span class="team-balance${st.gap > 10 ? ' ko' : ''}" title="Écart entre l'équipe la plus forte et la plus faible">Écart ${st.gap}%</span>`;
}

function tdoAutoBuildAllBalanced() {
    const b = document.getElementById('tdoGenAll');
    if (b) { b.disabled = true; b.textContent = '⏳ Calcul en cours…'; }
    setTimeout(() => {
        const compo = tdoTeams[tdoActiveCompo];
        autoBuildBalancedTeams(compo.teams, tdoStrategies, 15, null);
        saveTdo(); renderTdo(); buildGrid();
    }, 30);
}