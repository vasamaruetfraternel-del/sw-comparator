function autoBuildBalancedTeams(teamsArr, strategies, teamSize, getUsedFn) {
    const baseUsed = getUsedFn ? getUsedFn() : new Set();

    function buildOneAttempt(randomness) {
        const result = teamsArr.map(() => []);
        const strats = strategies.map(k => STRATEGIES[k] || STRATEGIES.balanced);

        // Pré-assigne un tank différent par équipe
        const allTanks = Object.keys(MONSTERS).filter(nm => MONSTERS[nm].type === 'tank' && !baseUsed.has(nm) && !excludedFromReco.includes(nm));
        const tankScored = allTanks.map(nm => ({ nm, score: bVal('') + getAwkLevel(nm) * 6 + investBonus(nm) + Math.random() * 5 })).sort((a, b) => b.score - a.score);
        for (let i = 0; i < result.length && i < tankScored.length; i++) result[i].push(tankScored[i].nm);

        for (let round = 0; round < teamSize; round++) {
            const order = [...result.keys()];
            if (round % 2 !== 0) order.reverse();

            for (const ti of order) {
                if (result[ti].length >= teamSize) continue;

                const allUsed = new Set(baseUsed);
                result.forEach(t => t.forEach(m => allUsed.add(m)));
                const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));
                if (!available.length) continue;

                const strat = strats[ti], W = strat.buffWeight;
                const teamBufSet = {};

                result[ti].forEach(n => {
                    [...(MONSTERS[n]?.awakenings || []).filter(a => a.level !== 3).flatMap(a => a.buffs || []), ...skillBuffsRaw(n)]
                        .forEach(id => { teamBufSet[id] = (teamBufSet[id] || 0) + 1; });
                });

                const typeCounts = { melee: 0, tank: 0, range: 0, support: 0 };
                result[ti].forEach(n => { if (MONSTERS[n]) typeCounts[MONSTERS[n].type]++; });
                const frontTarget = Math.round(teamSize * strat.typeRatio.front);
                const rangeTarget = Math.round(teamSize * strat.typeRatio.range);
                const supportTarget = teamSize - frontTarget - rangeTarget;
                const frontNeed = frontTarget - ((typeCounts.melee || 0) + typeCounts.tank);
                const rangeNeed = rangeTarget - (typeCounts.range || 0);
                const supportNeed = supportTarget - (typeCounts.support || 0);

                const scored = available.map(nm => {
                    const m = MONSTERS[nm];
                    const ids = new Set([...(m.awakenings || []).filter(a => a.level !== 3).flatMap(a => a.buffs || []), ...skillBuffsRaw(nm)]);
                    let syn = 0;

                    ids.forEach(id => {
                        const b = BUFFS[id]; if (!b) return;
                        const v = bVal(id);
                        const cat = OFF_IDS.has(id) ? 'off' : DEF_IDS.has(id) ? 'def' : TEAM_IDS.has(id) ? 'team' : 'off';
                        let w = W[cat] ?? 1;

                        const isOffensive = cat === 'off' || id.includes('atk') || id.includes('dmg') || id.includes('crit') || id.includes('crush') || id.includes('double') || id.includes('triple') || id.includes('spd');

                        if (isOffensive) {
                            w *= 1.6;
                        }

                        if (!teamBufSet[id]) {
                            syn += b.team ? v * w * 1.5 : v * w;
                        } else {
                            if (b.team) {
                                syn += v * w * 1.2;
                            } else if (isOffensive) {
                                syn += v * w * 0.9;
                            } else {
                                syn += v * w * 0.2;
                            }
                        }
                        syn += pairSynergyBonus(id, teamBufSet, w);
                    });

                    let comp = 0;
                    const t = m.type;
                    const isFront = t === 'melee' || t === 'tank', isRange = t === 'range', isSupport = t === 'support';
                    const compW = W.off + W.def + W.team;

                    if (isFront) comp += frontNeed > 0 ? (35 + frontNeed * 12) * (compW / 3) : (frontNeed < -1 ? -30 : 0);
                    if (isRange) comp += rangeNeed > 0 ? (35 + rangeNeed * 12) * (compW / 3) : (rangeNeed < -1 ? -30 : 0);
                    if (isSupport) comp += supportNeed > 0 ? (55 + supportNeed * 18) * (compW / 3) : (supportNeed < -1 ? -40 : 0);
                    if (isSupport && strat.typeRatio.support === 0) comp -= 80;

                    return { nm, score: syn + comp + getAwkLevel(nm) * 6 + investBonus(nm) };
                }).sort((a, b) => b.score - a.score);

                const k = Math.max(1, Math.round(randomness));
                const pool = scored.slice(0, k);
                const pick = pool[Math.floor(Math.random() * pool.length)];
                if (pick) result[ti].push(pick.nm);
            }
        }
        return result;
    }

    function evalAll(teamsState) {
        const scores = teamsState.map((members, i) => evalTeamScore(members, STRATEGIES[strategies[i]] || STRATEGIES.balanced));
        const sum = scores.reduce((a, b) => a + b, 0);
        const avg = sum / scores.length;

        let imbalancePenalty = 0;
        scores.forEach(score => {
            imbalancePenalty += Math.abs(score - avg);
        });

        return sum - (imbalancePenalty * 1.8);
    }

    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;

        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue;

                        const trial = best.map(t => [...t]);
                        trial[ti][i] = cand;
                        const tot = evalAll(trial);
                        if (tot > localBestTotal) { localBestTotal = tot; localBestSwap = cand; }
                    }

                    if (localBestSwap) {
                        best[ti][i] = localBestSwap;
                        bestTotal = localBestTotal;
                        improved = true;
                    }
                }
            }
        }
        return { teams: best, total: bestTotal };
    }

    const ATTEMPTS = 15;
    let bestOverall = null, bestOverallScore = -Infinity;

    for (let a = 0; a < ATTEMPTS; a++) {
        const randomness = a < 3 ? 1 : 3;
        const attempt = buildOneAttempt(randomness);
        const refined = localSearchAll(attempt, 2);
        if (refined.total > bestOverallScore) { bestOverallScore = refined.total; bestOverall = refined.teams; }
    }

    bestOverall.forEach((members, i) => { teamsArr[i].members = members; });
}
function tdoAutoBuildAllBalanced() {
    const compo = tdoTeams[tdoActiveCompo];
    autoBuildBalancedTeams(compo.teams, tdoStrategies, 15, null);
    saveTdo(); renderTdo(); buildGrid();
}