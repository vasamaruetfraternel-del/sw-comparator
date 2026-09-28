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
    ms.forEach(nm => { ids[nm] = new Set(unlockedSkillBuffIds(nm)); });
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
            res.lines.push({ good: true, v: Math.round(g), short: `${STATE_LABEL[s]} (${others[0]}${others.length > 1 ? ' +' + (others.length - 1) : ''}) → bonus de ${nm}`, text: `${STATE_LABEL[s]} de ${others.slice(0, 3).join(', ')} → ${BUFFS[id].label} (${nm})` });
        } else if (prov.length) {
            res.bonus += v * 0.4;
        } else {
            res.bonus -= v * 0.6;
            res.lines.push({ good: false, v: -Math.round(v * 0.6), short: `${nm} : bonus ${STATE_LABEL[s]} sans déclencheur`, text: `${BUFFS[id].label} (${nm}) : aucun allié n'applique ${STATE_LABEL[s]}` });
        }
    }));

    ms.forEach(nm => ids[nm].forEach(id => {
        const rf = roleFilterOf(id); if (!rf || !BUFFS[id] || !BUFFS[id].team) return;
        const self = rf === 'front' ? isFrontType(MONSTERS[nm].type) : MONSTERS[nm].type === 'range';
        const cnt = (rf === 'front' ? front : range) - (self ? 1 : 0);
        const share = cnt / Math.max(1, n - 1);
        const g = bVal(id) * (share * 1.6 - 0.6);
        res.bonus += g;
        if (share < 0.25) res.lines.push({ good: false, v: Math.round(g), short: `${nm} : buff ${rf === 'front' ? 'Mêlée' : 'Distance'} peu utile (${cnt} allié${cnt > 1 ? 's' : ''})`, text: `${BUFFS[id].label} (${nm}) : seulement ${cnt} allié${cnt > 1 ? 's' : ''} ${rf === 'front' ? 'Mêlée/Tank' : 'À distance'}` });
        else if (share >= 0.5) res.lines.push({ good: true, v: Math.round(g), short: `${nm} : buff ${rf === 'front' ? 'Mêlée' : 'Distance'} ×${cnt} alliés`, text: `${BUFFS[id].label} (${nm}) profite à ${cnt} alliés ${rf === 'front' ? 'Mêlée/Tank' : 'À distance'}` });
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
        res.lines.push({ good: true, v: Math.round(g), short: label, text: `${label} : ${[...new Set([...famWho[a], ...famWho[b]])].slice(0, 4).join(', ')}` });
    });

    const aoeCount = ms.filter(nm => { const s = SKILLS(nm); return (s.exclusive && s.exclusive.aoe) || (s.crit && s.crit.aoe); }).length;
    ms.forEach(nm => ids[nm].forEach(id => {
        if (!/aoe/.test(id) || !BUFFS[id]) return;
        const g = bVal(id) * (aoeCount / n * 1.5 - 0.5);
        res.bonus += g;
        if (g > 3) res.lines.push({ good: true, v: Math.round(g), short: `${nm} : bonus de zone ×${aoeCount}`, text: `${BUFFS[id].label} (${nm}) : ${aoeCount} monstres frappent en zone` });
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

const TEAM_STAT_RE = /^(atk|dmg|spd|crit_rate|crit_dmg|crush_rate|crush_dmg|double_hit|triple_hit|skill_accel|dmg_resist|def|accuracy|dodge_rate|hp_max|double_triple_dmg)_(\d+)(?:_\d+)?_(team|melee|range)(_cond)?$/;
const TEAM_STAT_LBL = { atk: 'ATQ', dmg: 'Dégâts', spd: 'Vit. ATQ', crit_rate: 'Taux Crit', crit_dmg: 'Dég. Crit', crush_rate: 'Taux C. puissant', crush_dmg: 'Dég. C. puissant', double_hit: 'Coup double', triple_hit: 'Coup triple', skill_accel: 'Accél.', dmg_resist: 'Résist. dgts', def: 'DEF', accuracy: 'Précision', dodge_rate: 'Esquive', hp_max: 'PV', double_triple_dmg: 'Dég. multiples' };

function teamStatTotals(members) {
    const tot = {};
    members.forEach(nm => {
        if (!MONSTERS[nm]) return;
        new Set(unlockedSkillBuffIds(nm)).forEach(id => {
            const m = TEAM_STAT_RE.exec(id); if (!m) return;
            const k = m[1], v = +m[2];
            const t = tot[k] || (tot[k] = { v: 0, cond: 0, role: 0, src: [] });
            t.v += v;
            t.src.push(`${nm} : ${BUFFS[id] ? BUFFS[id].label : id}`);
            if (m[4]) t.cond += v;
            if (m[3] !== 'team') t.role += v;
        });
    });
    return Object.entries(tot).sort((a, b) => b[1].v - a[1].v);
}

function toggleSummaryDetail(uid) {
    const el = document.getElementById('sumdet-' + uid), b = document.getElementById('sumdetbtn-' + uid);
    if (!el) return;
    const open = el.style.display === 'none';
    el.style.display = open ? 'block' : 'none';
    if (b) b.textContent = open ? '▴ Masquer le détail' : '▾ Détail des buffs';
}

function renderTeamSummary(members, uid, compact) {
    if (!members.length) return '<div class="ts-empty">Ajoutez des monstres pour voir le résumé</div>';
    const cnt = { front: 0, range: 0, support: 0 };
    members.forEach(nm => { const t = MONSTERS[nm]?.type; if (t === 'range') cnt.range++; else if (t === 'support') cnt.support++; else if (t) cnt.front++; });
    let tgt = null;
    if (!compact && typeof STRATEGIES !== 'undefined' && typeof teamSize !== 'undefined') {
        const st = STRATEGIES[teamStrategy] || STRATEGIES.balanced;
        const f = Math.round(teamSize * st.typeRatio.front), r = Math.round(teamSize * st.typeRatio.range);
        tgt = { front: f, range: r, support: teamSize - f - r };
    }
    const comp = [['front', 'Mêlée/Tank', 'tc-m'], ['range', 'Distance', 'tc-r'], ['support', 'Support', 'tc-s']].map(([k, l, c]) => {
        const off = tgt && Math.abs(cnt[k] - tgt[k]) >= 2;
        return `<div class="ts-comp ${c}${off ? ' off' : ''}" title="${tgt ? 'Cible du mode : ' + tgt[k] : ''}"><b>${cnt[k]}</b>${tgt ? `<i>/${tgt[k]}</i>` : ''}<span>${l}</span></div>`;
    }).join('');
    const stats = teamStatTotals(members).slice(0, compact ? 6 : 9).map(([k, t]) =>
        `<div class="ts-stat" title="${t.src.join('&#10;').replace(/"/g, '&quot;')}"><b>+${t.v}%</b><span>${TEAM_STAT_LBL[k]}</span></div>`).join('');
    const r = synergyReport(members);
    const good = r.lines.filter(l => l.good).slice(0, 3), bad = r.lines.filter(l => !l.good).slice(0, 2);
    const line = l => `<div class="ts-syn ${l.good ? 'ok' : 'ko'}" title="${(l.text || '').replace(/"/g, '&quot;')}"><span>${l.good ? '✔' : '⚠'}</span>${l.short || l.text}</div>`;
    const more = r.lines.length - good.length - bad.length;
    return `<div class="ts-card${compact ? ' compact' : ''}">
      <div class="ts-title">Résumé d'équipe</div>
      <div class="ts-comps">${comp}</div>
      ${dmgBlock(members)}
      ${stats ? `<div class="ts-sub">Bonus d'équipe</div><div class="ts-stats">${stats}</div>` : ''}
      <div class="ts-sub">Synergies <em class="${r.bonus >= 0 ? 'ok' : 'ko'}">${r.bonus >= 0 ? '+' : ''}${Math.round(r.bonus)}</em></div>
      ${good.length || bad.length ? good.map(line).join('') + bad.map(line).join('') : '<div class="ts-empty">Aucune synergie détectée</div>'}
      ${more > 0 ? `<div class="ts-more">+${more} autre${more > 1 ? 's' : ''} dans le détail</div>` : ''}
      <button class="ts-detbtn" id="sumdetbtn-${uid}" onclick="toggleSummaryDetail('${uid}')">▾ Détail des buffs</button>
      <div class="ts-detail" id="sumdet-${uid}" style="display:none">${renderSynergyBlock(members)}${renderTeamBuffPanel(members, uid)}</div>
    </div>`;
}

const DMG_RE = /^(atk|dmg|spd|crit_rate|crit_dmg|crush_rate|crush_dmg|double_hit|triple_hit|skill_accel|double_triple_dmg)_(?:(team|ally)_)?(\d+)(?:_\d+)?(?:_(team|melee|range|ally))?(_cond)?$/;
const DMG_BASE = { crit_rate: 20, crit_dmg: 50, crush_rate: 20, crush_dmg: 50, double_hit: 5, triple_hit: 0 };
const DMG_K = 75;

const STACK_RE = /^(atk|crush_dmg|spd)_stack_(?:\d+_)?max(\d+)(_team)?$/;

const OFFENSE_CACHE = new Map();
function offenseEntry(id) {
    if (!OFFENSE_CACHE.has(id)) OFFENSE_CACHE.set(id, parseOffenseEntry(id));
    return OFFENSE_CACHE.get(id);
}

function parseOffenseEntry(id) {
    const b = BUFFS[id]; if (!b) return null;
    const cf = b.cond || /_cond$/.test(id) ? 0.6 : 1;
    let m = DMG_RE.exec(id);
    if (m) {
        const scope = m[4] || m[2] || (b.team ? 'team' : 'self');
        return { kind: 'stat', k: m[1], v: +m[3] * cf, scope: scope === 'ally' ? 'team' : scope };
    }
    m = STACK_RE.exec(id);
    if (m) return { kind: 'stat', k: m[1], v: +m[2] * cf, scope: m[3] || b.team ? 'team' : 'self' };
    m = /^(?:vuln_always|resist_nerf)_(\d+)/.exec(id);
    if (m) return { kind: 'taken', v: +m[1], uniq: true };
    m = /^debuff_crit_taken_(\d+)/.exec(id);
    if (m) return { kind: 'stat', k: 'crit_dmg', v: +m[1] * cf, scope: 'team', uniq: true };
    m = /^debuff_aoe_taken_(\d+)/.exec(id);
    if (m) return { kind: 'taken', v: +m[1] * 0.5 * cf, uniq: true };
    if (/^def_nerf_20/.test(id)) return { kind: 'taken', v: 10 * cf, uniq: true };
    const st = neededState(id);
    m = /_(\d+)(?:_(team|melee|range))?(?:_cond)?$/.exec(id);
    if (st && m) {
        const vuln = /^vuln_/.test(id);
        return { kind: vuln ? 'taken' : 'stat', k: 'dmg', v: +m[1] * 0.6, state: st, scope: m[2] || (b.team ? 'team' : 'self'), uniq: vuln };
    }
    return null;
}

function levelFactor(nm) {
    const lv = typeof getMyLevel === 'function' ? getMyLevel(nm) : 100;
    const sb = typeof getMyStatBonus === 'function' ? getMyStatBonus(nm) : 0;
    return (0.1 + 0.9 * Math.min(lv, 100) / 100) * (1 + 0.02 * Math.max(0, sb));
}

const SKDMG_CACHE = new Map();
function baseDamage(nm, critRate) {
    let d = SKDMG_CACHE.get(nm);
    if (!d) { const S = SKILLS(nm); d = [skDmg(S.basic), skDmg(S.crit), skDmg(S.exclusive)]; SKDMG_CACHE.set(nm, d); }
    const nc = 5 * Math.max(0, Math.min(1, critRate));
    return ((10 - nc) * d[0] + nc * d[1] + d[2]) / 10;
}

function teamOffense(members) {
    const ms = members.filter(nm => MONSTERS[nm]);
    const states = new Set();
    const idsOf = {};
    ms.forEach(nm => { idsOf[nm] = unlockedSkillBuffIds(nm); idsOf[nm].forEach(id => providedStates(id).forEach(s => states.add(s))); });
    const pool = { team: {}, front: {}, range: {} }, self = {}, seenUniq = {};
    let taken = 0;
    const add = (o, k, v) => { o[k] = (o[k] || 0) + v; };
    ms.forEach(nm => {
        self[nm] = {};
        const pw = Math.min(1, Math.sqrt(levelFactor(nm)));
        idsOf[nm].forEach(id => {
            const e = offenseEntry(id); if (!e) return;
            if (e.state && !states.has(e.state)) return;
            let v = e.v * (e.scope === 'self' ? 1 : pw);
            if (e.uniq) { const prev = seenUniq[id] || 0; if (prev >= v) return; seenUniq[id] = v; v -= prev; }
            if (e.kind === 'taken') { taken += v; return; }
            if (e.scope === 'self') add(self[nm], e.k, v);
            else if (e.scope === 'melee') add(pool.front, e.k, v);
            else if (e.scope === 'range') add(pool.range, e.k, v);
            else add(pool.team, e.k, v);
        });
    });
    const takenF = 1 + taken / 100;
    let total = 0, raw = 0;
    const per = ms.map(nm => {
        const t = MONSTERS[nm].type;
        const tot = { ...pool.team };
        const cls = isFrontType(t) ? pool.front : t === 'range' ? pool.range : null;
        if (cls) Object.entries(cls).forEach(([k, v]) => add(tot, k, v));
        Object.entries(self[nm]).forEach(([k, v]) => add(tot, k, v));
        const mp = dmgMultiplier(tot);
        const cr = ((DMG_BASE.crit_rate || 0) + (tot.crit_rate || 0)) / 100;
        const base = baseDamage(nm, cr) * levelFactor(nm);
        const d = base * mp.total * takenF;
        raw += base;
        total += d;
        return { nm, d, tot, parts: mp };
    });
    return { total, raw, takenF, per };
}

function teamOffenseTotals(members, r) {
    const n = Math.max(1, members.filter(nm => MONSTERS[nm]).length);
    const tot = {};
    r = r || teamOffense(members);
    r.per.forEach(p => Object.entries(p.tot).forEach(([k, v]) => { tot[k] = (tot[k] || 0) + v / n; }));
    return tot;
}

function dmgMultiplier(t) {
    const g = k => ((DMG_BASE[k] || 0) + (t[k] || 0)) / 100;
    const ratePart = (r, d) => {
        const rc = Math.min(2, r);
        return Math.min(1, rc) * d * (1 + Math.max(0, rc - 1));
    };
    const atkF = 1 + g('atk');
    const dmgF = 1 + g('dmg');
    const critPart = ratePart(g('crit_rate'), g('crit_dmg'));
    const crushPart = ratePart(g('crush_rate'), g('crush_dmg'));
    const rateF = 1 + critPart + crushPart;
    const extra = Math.min(1, g('double_hit') + g('triple_hit')) === 1 ? Math.max(0, 1 - g('triple_hit')) + 2 * Math.min(1, g('triple_hit')) : g('double_hit') + 2 * g('triple_hit');
    const hitF = 1 + extra * (1 + g('double_triple_dmg'));
    const spdF = (1 + g('spd')) * (1 + g('skill_accel') * 0.5);
    return { total: atkF * dmgF * rateF * hitF * spdF, atkF, dmgF, rateF, critPart, crushPart, hitF, spdF };
}

const DMG_M0 = dmgMultiplier({}).total;
let DMG_REF = 0;
function dmgRef() {
    if (!DMG_REF) {
        const names = Object.keys(MONSTERS);
        DMG_REF = names.reduce((s, nm) => s + baseDamage(nm, DMG_BASE.crit_rate / 100), 0) / Math.max(1, names.length) * DMG_M0;
    }
    return DMG_REF;
}

function damageScore(members) {
    const n = members.filter(nm => MONSTERS[nm]).length;
    if (!n) return { score: 0, mult: 1, parts: null, totals: {} };
    const r = teamOffense(members);
    const mult = r.total / (n * dmgRef());
    return { score: DMG_K * n * Math.log(Math.max(1e-6, mult)), mult, parts: r, get totals() { return teamOffenseTotals(members, r); } };
}

function dmgBlock(members) {
    const ds = damageScore(members);
    if (!ds.parts) return '';
    return `<div class="ts-sub">Dégâts attendus <em class="ok" title="Dégâts estimés de l'équipe (dégâts des compétences × niveau × bonus de stats × buffs × affaiblissements ennemis) par rapport à une équipe de monstres moyens niveau 100 sans buff">×${ds.mult.toFixed(1)}</em></div>`;
}
