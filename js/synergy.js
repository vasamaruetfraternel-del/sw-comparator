const STATE_LABEL = { frozen: 'Gel', stunned: 'Étourdissement', sleeping: 'Sommeil', petrified: 'Pétrification', blinded: 'Aveuglement', cc: 'Contrôle', dot: 'Dégâts continus', poisoned: 'Poison', bleed: 'Saignement', burned: 'Brûlure', defdown: 'DEF réduite' };
const STATE_PROVIDERS = {
    freeze: ['frozen', 'cc'], stun: ['stunned', 'cc'], sleep: ['sleeping', 'cc'], petrify: ['petrified', 'cc'], blindness: ['blinded', 'cc'],
    entrave: ['cc'], provoke_status: ['cc'], silence: ['cc'], fear_25: ['cc'],
    dot_poison: ['poisoned', 'dot'], bleed: ['bleed', 'dot'], dot_bleed: ['bleed', 'dot'], dot_deep_bleed: ['bleed', 'dot'],
    dot_burn: ['burned', 'dot'], dot_dark_flame: ['burned', 'dot'], dot_chill: ['dot'], congelation_dot: ['dot'], dot_love_disease: ['dot'],
};
const STATE_ALIAS = { def_down: 'defdown', stun: 'stunned', freeze: 'frozen', poison: 'poisoned', burn: 'burned', sleep: 'sleeping', blind: 'blinded' };
const FAMILY_PAIRS = [['cr', 'cd', 'Taux Crit ↔ Dég. Crit'], ['pr', 'pd', 'Taux Coup puissant ↔ Dég. Coup puissant'], ['mh', 'mhd', 'Coups multiples ↔ Dég. coups multiples']];

function providedStates(id) {
    if (STATE_PROVIDERS[id]) return STATE_PROVIDERS[id];
    if (/^def_nerf/.test(id)) return ['defdown'];
    return [];
}

function neededState(id) {
    if (id === 'weakness_poison_enemy') return 'poisoned';
    const m = /^(?:dmg|vuln)_([a-z]+(?:_down)?)_\d/.exec(id);
    if (!m) return null;
    const s = STATE_ALIAS[m[1]] || m[1];
    return STATE_LABEL[s] ? s : null;
}

function statFamily(id) {
    if (/^crit_rate_/.test(id)) return 'cr';
    if (/^crit_dmg_/.test(id)) return 'cd';
    if (/^crush_rate_/.test(id)) return 'pr';
    if (/^crush_dmg_/.test(id)) return 'pd';
    if (/^(double_hit|triple_hit)_/.test(id)) return 'mh';
    if (/^double_triple_dmg/.test(id)) return 'mhd';
    return null;
}

function roleFilterOf(id) {
    if (/_melee(_|$)/.test(id)) return 'front';
    if (/_range(_|$)/.test(id)) return 'range';
    return null;
}

const DEF_RE = /^(def_|dmg_resist|hp_max|crit_res|res_lp|shield|stealth_shield|protection|endurance|limit_shield|dodge|cc_immune|fran_blessing|regen|debuff_immune|phoenix|dmg_down_provoked)/;
function buffCat(id) {
    if (typeof DEF_IDS !== 'undefined' && DEF_IDS.has(id)) return 'def';
    if (DEF_RE.test(id)) return 'def';
    if (typeof OFF_IDS !== 'undefined' && OFF_IDS.has(id)) return 'off';
    if (BUFFS[id] && BUFFS[id].team && !statFamily(id) && !/^(atk|dmg|spd|skill_accel)/.test(id)) return 'team';
    return 'off';
}

function isFrontType(t) { return t === 'melee' || t === 'tank'; }

function synergyReport(members) {
    const ms = members.filter(nm => MONSTERS[nm]);
    const n = ms.length;
    const res = { bonus: 0, lines: [] };
    if (n < 2) return res;
    const ids = {};
    ms.forEach(nm => { ids[nm] = new Set(allMonsterBuffIds(nm)); });
    const front = ms.filter(nm => isFrontType(MONSTERS[nm].type)).length;
    const range = ms.filter(nm => MONSTERS[nm].type === 'range').length;

    const providers = {};
    ms.forEach(nm => ids[nm].forEach(id => providedStates(id).forEach(s => { (providers[s] = providers[s] || new Set()).add(nm); })));
    ms.forEach(nm => ids[nm].forEach(id => {
        const s = neededState(id); if (!s) return;
        const v = bVal(id);
        const prov = [...(providers[s] || [])];
        const others = prov.filter(p => p !== nm);
        if (others.length) {
            const g = v * Math.min(1.6, 0.9 + 0.35 * others.length);
            res.bonus += g;
            res.lines.push({ good: true, v: Math.round(g), text: `${STATE_LABEL[s]} de ${others.slice(0, 3).join(', ')} → ${BUFFS[id].label} (${nm})` });
        } else if (prov.length) {
            res.bonus += v * 0.4;
        } else {
            res.bonus -= v * 0.6;
            res.lines.push({ good: false, v: -Math.round(v * 0.6), text: `${BUFFS[id].label} (${nm}) : aucun allié n'applique ${STATE_LABEL[s]}` });
        }
    }));

    ms.forEach(nm => ids[nm].forEach(id => {
        const rf = roleFilterOf(id); if (!rf || !BUFFS[id] || !BUFFS[id].team) return;
        const self = rf === 'front' ? isFrontType(MONSTERS[nm].type) : MONSTERS[nm].type === 'range';
        const cnt = (rf === 'front' ? front : range) - (self ? 1 : 0);
        const share = cnt / Math.max(1, n - 1);
        const g = bVal(id) * (share * 1.6 - 0.6);
        res.bonus += g;
        if (share < 0.25) res.lines.push({ good: false, v: Math.round(g), text: `${BUFFS[id].label} (${nm}) : seulement ${cnt} allié${cnt > 1 ? 's' : ''} ${rf === 'front' ? 'Mêlée/Tank' : 'À distance'}` });
        else if (share >= 0.5) res.lines.push({ good: true, v: Math.round(g), text: `${BUFFS[id].label} (${nm}) profite à ${cnt} alliés ${rf === 'front' ? 'Mêlée/Tank' : 'À distance'}` });
    }));

    const fam = {}, famWho = {};
    ms.forEach(nm => ids[nm].forEach(id => {
        const f = statFamily(id); if (!f || !BUFFS[id]) return;
        const w = BUFFS[id].team ? 1 : 0.35;
        fam[f] = (fam[f] || 0) + bVal(id) * w;
        (famWho[f] = famWho[f] || new Set()).add(nm);
    }));
    FAMILY_PAIRS.forEach(([a, b, label]) => {
        if (!fam[a] || !fam[b]) return;
        const g = Math.sqrt(fam[a] * fam[b]) * 0.6;
        res.bonus += g;
        res.lines.push({ good: true, v: Math.round(g), text: `${label} : ${[...new Set([...famWho[a], ...famWho[b]])].slice(0, 4).join(', ')}` });
    });

    const aoeCount = ms.filter(nm => { const s = SKILLS(nm); return (s.exclusive && s.exclusive.aoe) || (s.crit && s.crit.aoe); }).length;
    ms.forEach(nm => ids[nm].forEach(id => {
        if (!/aoe/.test(id) || !BUFFS[id]) return;
        const g = bVal(id) * (aoeCount / n * 1.5 - 0.5);
        res.bonus += g;
        if (g > 3) res.lines.push({ good: true, v: Math.round(g), text: `${BUFFS[id].label} (${nm}) : ${aoeCount} monstres frappent en zone` });
    }));

    res.lines.sort((x, y) => (y.good - x.good) || Math.abs(y.v) - Math.abs(x.v));
    return res;
}

function synergyBonus(members) { return synergyReport(members).bonus; }

function renderSynergyBlock(members) {
    const r = synergyReport(members);
    if (!r.lines.length) return '';
    const good = r.lines.filter(l => l.good).slice(0, 8), bad = r.lines.filter(l => !l.good).slice(0, 5);
    const row = l => `<div class="syn-row syn-link ${l.good ? 'ok' : 'ko'}"><span class="syn-link-ic">${l.good ? '✔' : '✖'}</span><span class="syn-lbl">${l.text}</span><span class="syn-cnt">${l.v > 0 ? '+' : ''}${l.v}</span></div>`;
    return `<div class="syn-block"><div class="syn-block-title">🔗 Synergies (${r.bonus >= 0 ? '+' : ''}${Math.round(r.bonus)})</div>${good.map(row).join('')}${bad.map(row).join('')}</div>`;
}
