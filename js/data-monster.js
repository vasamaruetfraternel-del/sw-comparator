const CW = .6;
const MAX_T = 500;
const MAX_AWK = 200;
const MAX_SPELL_EACH = 100;

function rgb(h) { h = h.replace('#', ''); return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}` }
function bVal(id) { const b = BUFFS[id]; return b ? Math.round(b.power * (b.cond ? CW : 1)) : 0 }

function spellScore(sk) {
    if (!sk) return 0;
    const atk = Math.min((sk.atk_pct || 0) / 4, 30);
    const buf = Math.min((sk.buffs || []).reduce((s, id) => s + bVal(id), 0), 40);
    const hit = Math.min(((sk.hits || 1) - 1) * 8, 20);
    const aoe = sk.aoe ? 10 : 0;
    return Math.round(atk + buf + hit + aoe);
}

function SKILLS(nm) {
    return {
        basic: BASIC_SKILLS[nm] || null,
        crit: CRIT_SKILLS[nm] || null,
        exclusive: EXCLUSIVE_SKILLS[nm] || null
    };
}

function skillBuffsRaw(nm) {
    const sk = SKILLS(nm);
    return [
        ...((sk.basic?.buffs) || []),
        ...((sk.crit?.buffs) || []),
        ...((sk.exclusive?.buffs) || []),
    ];
}

function skillPts(nm) {
    const sk = SKILLS(nm);
    return spellScore(sk.basic) + spellScore(sk.crit) + spellScore(sk.exclusive);
}


const BUFF_CATS = {
    atk: { label: "⚔ ATQ/Dégâts", ids: ["atk_10", "atk_20", "atk_25_delay", "atk_100", "atk_80", "atk_up_stack", "dmg_15", "dmg_20", "dmg_150", "dmg_aoe_scaling", "dmg_buff_scaling", "dmg_debuff_scaling", "dmg_unique_target", "dmg_frozen_50", "dmg_stunned_50", "dmg_stunned_20", "dmg_def_down_50", "dmg_cc_50", "dmg_poisoned_20", "dmg_bleed_20", "dmg_burned_20", "dmg_sleeping_20", "dmg_dot_50", "dmg_petrified_20", "dmg_blinded_20", "dmg_melee_def_target", "target_weakness_provoke", "target_weakness_immunity", "target_weakness_shield", "atk_down_ennemy_count", "atk_nerf_20"] },
    crit: { label: "✦ Critique", ids: ["crit_rate_10", "crit_rate_10_cond", "crit_rate_50", "crit_dmg_10_cond", "crit_dmg_20", "crit_res_10_cond", "crush_rate_10", "crush_rate_10_cond", "crush_rate_10_team", "crush_dmg_20", "crush_dmg_20_ally", "crush_rate_20_ally", "double_hit_10", "double_hit_15", "double_hit_10_cond", "triple_hit_10", "no_crit_cd", "teamwork_stack", "one_team_one_spirit", "perfect_team", "double_triple_dmg_team", "bloom_stack", "full_bloom", "crit_rate_nerf_20", "dodge_rate_20", "dodge_nerf_20", "weak_hit_rate_20", "weak_hit_rate_20_melee"] },
    spd: { label: "⚡ Vitesse", ids: ["spd_10", "spd_15", "spd_15_cond", "spd_30", "spd_40_cond", "spd_team_20", "skill_accel_15", "skill_accel_20_cond", "move_spd_200", "exclusive_cd_down", "cd_reset_proc", "cd_skill_cond", "no_crit_cd"] },
    range: { label: "🏹 Portée", ids: ["range_3", "range_5", "aoe_range_30", "aoe_range_30_cond"] },
    def: { label: "🛡 Défense", ids: ["def_15", "hp_max_15_cond", "res_lp_30", "dmg_resist_10", "dmg_resist_20_cond", "dmg_resist_80_cond", "dmg_resist_15_cond", "dmg_resist_20_team", "shield_hits_3_team", "shield_hits_5", "stealth_shield", "endurance_cond", "dodge_3s", "protection_shield", "limit_shield", "dmg_down_provoked", "dmg_resist_aoe_30", "debuff_immune", "regen_team"] },
    cc: { label: "🌀 CC/Survie", ids: ["cc_eff_20", "cc_immune_team_30", "cc_immune_self_react", "fran_blessing_team", "cd_reset_proc", "cd_skill_cond", "stealth", "strip_shield", "lifesteal_15_cond", "provoke_status", "entrave", "blindness", "stun", "freeze", "sleep", "petrify", "fear_25", "block_heal", "strip_immunity", "strip_debuff_team"] },
    dot: { label: "☠ DoT/Ennemi", ids: ["bleed", "dot_poison", "weakness_poison_enemy", "weak_point_detect", "weakness_element", "weakness_elem_team", "debuff_aoe_taken_10", "debuff_crit_taken_10", "block_shield", "atk_nerf_20", "def_nerf_20", "def_nerf_20_cond", "resist_nerf_30", "crit_rate_nerf_20", "dot_dark_flame", "dot_love_disease", "dot_deep_bleed"] },
    team: { label: "👥 Team", ids: ["spd_team_20", "shield_hits_3_team", "dmg_resist_20_team", "cc_immune_team_30", "fran_blessing_team", "merry_box_team_cond", "crush_rate_10_team", "weakness_elem_team", "double_triple_dmg_team", "teamwork_stack", "one_team_one_spirit", "perfect_team", "limit_shield", "class_share_melee", "target_weakness_provoke", "target_weakness_shield", "weak_point_detect", "strip_debuff_team", "regen_team", "accuracy_20_team"] },
    precision: { label: "🎯 Précision/Esquive", ids: ["accuracy_20", "accuracy_20_range", "accuracy_20_team", "dodge_rate_20", "dodge_nerf_20", "weak_hit_rate_20", "weak_hit_rate_20_melee"] },
};

const AWK3 = { level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true };
const BUFFS = {
    "atk_10": { label: "ATQ +10%", color: "#e05555", power: 10 },
    "atk_10_cond": { label: "ATQ +10% (conditionnel)", color: "#e05555", power: 7, cond: true },
    "atk_10_team": { label: "ATQ ALLIÉS +10%", color: "#ff6666", power: 22, team: true },
    "atk_10_melee": { label: "ATQ +10% Allié type Mêlée", color: "#e05555", power: 16, team: true },
    "atk_10_range": { label: "ATQ +10% Allié type Distance", color: "#e05555", power: 16, team: true },
    "atk_15": { label: "ATQ +15%", color: "#e05555", power: 13 },
    "atk_15_cond": { label: "ATQ +15% (conditionnel)", color: "#e05555", power: 9, cond: true },
    "atk_15_team": { label: "ATQ ALLIÉS +15%", color: "#ff6666", power: 29, team: true },
    "atk_15_melee": { label: "ATQ +15% Allié type Mêlée", color: "#e05555", power: 21, team: true },
    "atk_15_range": { label: "ATQ +15% Allié type Distance", color: "#e05555", power: 21, team: true },
    "atk_20": { label: "ATQ +20%", color: "#e05555", power: 18 },
    "atk_20_cond": { label: "ATQ +20% (conditionnel)", color: "#e05555", power: 13, cond: true },
    "atk_20_melee": { label: "ATQ +20% Allié type Mêlée", color: "#e05555", power: 29, team: true },
    "atk_20_range": { label: "ATQ +20% Allié type Distance", color: "#e05555", power: 29, team: true },
    "atk_team_10": { label: "ATQ ALLIÉS +10%", color: "#ff6666", power: 22, team: true },
    "atk_team_20": { label: "ATQ ALLIÉS +20%", color: "#ff6666", power: 40, team: true },
    "atk_25_delay": { label: "ATQ +25% (après 10s)", color: "#ff4444", power: 16, cond: true },
    "atk_30": { label: "ATQ +30%", color: "#e05555", power: 24 },
    "atk_30_cond": { label: "ATQ +30% (conditionnel)", color: "#e05555", power: 17, cond: true },
    "atk_30_team": { label: "ATQ ALLIÉS +30%", color: "#ff6666", power: 53, team: true },
    "atk_30_melee": { label: "ATQ +30% Allié type Mêlée", color: "#e05555", power: 38, team: true },
    "atk_30_range": { label: "ATQ +30% Allié type Distance", color: "#e05555", power: 38, team: true },
    "atk_40": { label: "ATQ +40%", color: "#e05555", power: 30 },
    "atk_50": { label: "ATQ +50%", color: "#ff4444", power: 36 },
    "atk_80": { label: "ATQ +80%", color: "#ff44aa", power: 52 },
    "atk_100": { label: "ATQ +100% (×10 stacks Yang)", color: "#ff0000", power: 38, cond: true },
    "atk_up_stack": { label: "ATQ +1%/stack (max 100, 10s)", color: "#ff44aa", power: 6 },
    "atk_down_ennemy_count": { label: "ATQ -5%/ennemi (max -60%)", color: "#ff44aa", power: 10 },
    "amplify_60_team": { label: "Coefficient d'ATQ +60% par hit réussi (ALLIÉS)", color: "#ff6666", power: 10, team: true },
    "dgt_sup_20_atk": { label: "Dégâts sup. +20% (×effets néfastes cible)", color: "#ff6666", power: 15, cond: true },
    "dgt_sup_30_atk": { label: "Dégâts sup. +30% (×effets néfastes cible)", color: "#ff6666", power: 18, cond: true },
    "atk_nerf_20": { label: "ATQ ennemi -20%", color: "#dd6644", power: 14, cond: true },

    "dmg_10": { label: "Dégâts +10%", color: "#d06030", power: 9 },
    "dmg_10_cond": { label: "Dégâts +10% (conditionnel)", color: "#d06030", power: 6, cond: true },
    "dmg_10_team": { label: "Dégâts ALLIÉS +10%", color: "#dd7030", power: 20, team: true },
    "dmg_10_melee": { label: "Dégâts +10% Allié type Mêlée", color: "#d06030", power: 14, team: true },
    "dmg_10_range": { label: "Dégâts +10% Allié type Distance", color: "#d06030", power: 14, team: true },
    "dmg_15": { label: "Dégâts +15%", color: "#d06030", power: 13 },
    "dmg_15_cond": { label: "Dégâts +15% (conditionnel)", color: "#d06030", power: 9, cond: true },
    "dmg_15_melee": { label: "Dégâts +15% Allié type Mêlée", color: "#d06030", power: 21, team: true },
    "dmg_15_range": { label: "Dégâts +15% Allié type Distance", color: "#d06030", power: 21, team: true },
    "dmg_20": { label: "Dégâts +20%", color: "#d06030", power: 17 },
    "dmg_20_cond": { label: "Dégâts +20% (conditionnel)", color: "#d06030", power: 12, cond: true },
    "dmg_20_melee": { label: "Dégâts +20% Allié type Mêlée", color: "#d06030", power: 27, team: true },
    "dmg_20_range": { label: "Dégâts +20% Allié type Distance", color: "#d06030", power: 27, team: true },
    "dmg_team_15": { label: "Dégâts ALLIÉS +15%", color: "#dd7030", power: 29, team: true },
    "dmg_team_20": { label: "Dégâts ALLIÉS +20%", color: "#dd7030", power: 37, team: true },
    "dmg_25": { label: "Dégâts +25%", color: "#d06030", power: 20 },
    "dmg_25_cond": { label: "Dégâts +25% (conditionnel)", color: "#d06030", power: 14, cond: true },
    "dmg_25_team": { label: "Dégâts ALLIÉS +25%", color: "#dd7030", power: 44, team: true },
    "dmg_25_melee": { label: "Dégâts +25% Allié type Mêlée", color: "#d06030", power: 32, team: true },
    "dmg_25_range": { label: "Dégâts +25% Allié type Distance", color: "#d06030", power: 32, team: true },
    "dmg_30": { label: "Dégâts +30%", color: "#d06030", power: 24 },
    "dmg_30_cond": { label: "Dégâts +30% (conditionnel)", color: "#d06030", power: 17, cond: true },
    "dmg_30_team": { label: "Dégâts ALLIÉS +30%", color: "#dd7030", power: 53, team: true },
    "dmg_30_melee": { label: "Dégâts +30% Allié type Mêlée", color: "#d06030", power: 38, team: true },
    "dmg_30_range": { label: "Dégâts +30% Allié type Distance", color: "#d06030", power: 38, team: true },
    "dmg_50": { label: "Dégâts +50%", color: "#ff6600", power: 36 },
    "dmg_50_cond": { label: "Dégâts +50% (conditionnel)", color: "#ff6600", power: 25, cond: true },
    "dmg_50_team": { label: "Dégâts ALLIÉS +50%", color: "#ff6600", power: 79, team: true },
    "dmg_50_melee": { label: "Dégâts +50% Allié type Mêlée", color: "#ff6600", power: 58, team: true },
    "dmg_50_range": { label: "Dégâts +50% Allié type Distance", color: "#ff6600", power: 58, team: true },
    "dmg_150": { label: "Dégâts +150% (sous Furtivité)", color: "#ff6600", power: 60, cond: true },
    "dmg_aoe_scaling": { label: "Dégâts ×ennemis (max ×10)", color: "#ddaa66", power: 32 },
    "dmg_buff_scaling": { label: "Dégâts / Nb Buffs (max 30)", color: "#c8a830", power: 24 },
    "dmg_debuff_scaling": { label: "Dégâts / Nb Debuffs (max 15)", color: "#d07030", power: 44 },
    "dmg_unique_target": { label: "Dégâts Cible Unique ↑", color: "#cc5030", power: 14 },
    "dmg_frozen_50": { label: "Dégâts +50% (cibles Gelées)", color: "#66ccff", power: 24, cond: true },
    "dmg_stunned_50": { label: "Dégâts +50% (cibles Étourdies)", color: "#cc8800", power: 24, cond: true },
    "dmg_stunned_20": { label: "Dégâts +20% (cibles Étourdies)", color: "#cc8800", power: 16, cond: true },
    "dmg_def_down_50": { label: "Dégâts +50% (cibles DEF réduite)", color: "#cc6030", power: 24, cond: true },
    "dmg_cc_50": { label: "Dégâts +50% (cibles sous CC)", color: "#cc5588", power: 26, cond: true },
    "dmg_poisoned_20": { label: "Dégâts +20% (cibles Empoisonnées)", color: "#88bb30", power: 16, cond: true },
    "dmg_bleed_20": { label: "Dégâts +20% (cibles Saignement)", color: "#aa2020", power: 16, cond: true },
    "dmg_burned_20": { label: "Dégâts +20% (cibles Brûlées)", color: "#cc5500", power: 16, cond: true },
    "dmg_sleeping_20": { label: "Dégâts +20% (cibles Endormies)", color: "#8866cc", power: 16, cond: true },
    "dmg_dot_50": { label: "Dégâts +50% (cibles sous DoT)", color: "#cc6644", power: 38, cond: true },
    "dmg_petrified_20": { label: "Dégâts +20% (cibles Pétrifiées)", color: "#bb6622", power: 16, cond: true },
    "dmg_blinded_20": { label: "Dégâts +20% (cibles Aveuglées)", color: "#bbbb22", power: 16, cond: true },
    "dmg_melee_def_target": { label: "Dégâts ↑ (cibles Mêlée/Défense)", color: "#cc5030", power: 16, cond: true },
    "dmg_down_provoked": { label: "Dég. reçus -30% (cibles Provoquées)", color: "#aa66dd", power: 26 },
    "dmg_100_immunity": { label: "Dégâts +100% cible sous immunité", color: "#ff6600", power: 20, cond: true },
    "dmg_100_solotarget": { label: "Dégâts +100% cible seule", color: "#ff6600", power: 26 },
    "dmg_frozen_50_team": { label: "Dégâts +50% (cibles Gelées) ALLIÉS", color: "#66ccff", power: 43, cond: true, team: true },
    "dmg_stunned_50_team": { label: "Dégâts +50% (cibles Étourdies) ALLIÉS", color: "#cc8800", power: 43, cond: true, team: true },
    "dmg_cc_50_team": { label: "Dégâts +50% (cibles sous CC) ALLIÉS", color: "#cc5588", power: 45, cond: true, team: true },
    "dmg_dot_50_team": { label: "Dégâts +50% (cibles sous DoT) ALLIÉS", color: "#cc6644", power: 53, cond: true, team: true },
    "congelation_dmg": { label: "Dégâts supp. = 50% de la puissance d'attaque", color: "#dd6644", power: 12, cond: true },
    "dmg_crit_add_10": { label: "Dégâts critiques reçus +10%", color: "#ff44aa", power: 12 },
    "archdemon_grand_froid": { label: "Dégâts supp. = 100% de la puissance d'attaque", color: "#dd6644", power: 12, cond: true },
    "grand_froid_cumul": { label: "Cumul Grand Froid ×1 sur la cible / 20s", color: "#dd6644", power: 3, cond: true },
    "grand_froid_stack": { label: "À 5 cumuls : Gel 2.5s + Dég. Crit reçus +20% + Trace de givre 7s", color: "#dd6644", power: 10, cond: true },
    "trace_de_givre": { label: "Immunité aux cumuls Grand Froid temporaire", color: "#dd6644", power: 0, cond: true },
    "dmg_aoe_15": { label: "Dégâts de zone supp. +15% (×cibles, max 10)", color: "#dd6644", power: 16, cond: true },
    "dmg_aoe_30": { label: "Dégâts de zone supp. +30% (×cibles, max 10)", color: "#dd6644", power: 20, cond: true },
    "dmg_aoe_team_20": { label: "Dégâts de zone +20% ALLIÉS", color: "#dd6644", power: 25, cond: true, team: true },
    "resist_nerf_20": { label: "Résistance aux dégâts -20% (ennemi)", color: "#4d8fd6", power: 20 },
    "resist_nerf_30": { label: "Résistance aux dégâts -30% (ennemi)", color: "#4d8fd6", power: 26 },

    "crit_rate_10": { label: "Taux Crit +10%", color: "#c8a830", power: 12 },
    "crit_rate_10_cond": { label: "Taux Crit +10% (conditionnel)", color: "#c8a830", power: 9, cond: true },
    "crit_rate_10_melee": { label: "Taux Crit +10% Allié type Mêlée", color: "#c8a830", power: 19, team: true },
    "crit_rate_10_range": { label: "Taux Crit +10% Allié type Distance", color: "#c8a830", power: 19, team: true },
    "crit_rate_team_10": { label: "Taux Crit ALLIÉS +10%", color: "#e8c020", power: 26, team: true },
    "crit_rate_15": { label: "Taux Crit +15%", color: "#c8a830", power: 16 },
    "crit_rate_15_cond": { label: "Taux Crit +15% (conditionnel)", color: "#c8a830", power: 11, cond: true },
    "crit_rate_15_melee": { label: "Taux Crit +15% Allié type Mêlée", color: "#c8a830", power: 26, team: true },
    "crit_rate_15_range": { label: "Taux Crit +15% Allié type Distance", color: "#c8a830", power: 26, team: true },
    "crit_rate_team_15": { label: "Taux Crit ALLIÉS +15%", color: "#e8c020", power: 35, team: true },
    "crit_rate_20": { label: "Taux Crit +20%", color: "#c8a830", power: 20 },
    "crit_rate_20_cond": { label: "Taux Crit +20% (conditionnel)", color: "#c8a830", power: 14, cond: true },
    "crit_rate_team_20_melee": { label: "Taux Crit Allié type Mêlée +20%", color: "#e8c020", power: 32, team: true },
    "crit_rate_team_20_range": { label: "Taux Crit Allié type Distance +20%", color: "#e8c020", power: 32, team: true },
    "crit_rate_team_20": { label: "Taux Crit ALLIÉS +20%", color: "#e8c020", power: 44, team: true },
    "crit_rate_30": { label: "Taux Crit +30%", color: "#e8c020", power: 26 },
    "crit_rate_30_cond": { label: "Taux Crit +30% (conditionnel)", color: "#e8c020", power: 18, cond: true },
    "crit_rate_30_melee": { label: "Taux Crit +30% Allié type Mêlée", color: "#e8c020", power: 42, team: true },
    "crit_rate_30_range": { label: "Taux Crit +30% Allié type Distance", color: "#e8c020", power: 42, team: true },
    "crit_rate_team_30": { label: "Taux Crit ALLIÉS +30%", color: "#e8c020", power: 57, team: true },
    "crit_rate_50": { label: "Taux Crit +50% (5s)", color: "#e8c020", power: 30 },
    "crit_rate_50_cond": { label: "Taux Crit +50% (conditionnel)", color: "#e8c020", power: 21, cond: true },
    "crit_rate_50_team": { label: "Taux Crit ALLIÉS +50%", color: "#e8c020", power: 66, team: true },
    "crit_rate_50_melee": { label: "Taux Crit +50% Allié type Mêlée", color: "#e8c020", power: 48, team: true },
    "crit_rate_50_range": { label: "Taux Crit +50% Allié type Distance", color: "#e8c020", power: 48, team: true },
    "crit_rate_nerf_20": { label: "Taux Crit ennemi -20%", color: "#888830", power: 12, cond: true },

    "crit_dmg_10_cond": { label: "Dég. Crit +10% (×effet ennemi)", color: "#c8b840", power: 9, cond: true },
    "crit_dmg_10": { label: "Dég. Crit +10%", color: "#c8b840", power: 12 },
    "crit_dmg_10_melee": { label: "Dég. Crit +10% Allié type Mêlée", color: "#c8b840", power: 19, team: true },
    "crit_dmg_10_range": { label: "Dég. Crit +10% Allié type Distance", color: "#c8b840", power: 19, team: true },
    "crit_dmg_team_10": { label: "Dég. Crit ALLIÉS +10%", color: "#e8c840", power: 26, team: true },
    "crit_dmg_15": { label: "Dég. Crit +15%", color: "#c8b840", power: 14 },
    "crit_dmg_15_cond": { label: "Dég. Crit +15% (conditionnel)", color: "#c8b840", power: 10, cond: true },
    "crit_dmg_15_melee": { label: "Dég. Crit +15% Allié type Mêlée", color: "#c8b840", power: 22, team: true },
    "crit_dmg_15_range": { label: "Dég. Crit +15% Allié type Distance", color: "#c8b840", power: 22, team: true },
    "crit_dmg_team_15": { label: "Dég. Crit ALLIÉS +15%", color: "#e8c840", power: 31, team: true },
    "crit_dmg_20": { label: "Dég. Crit +20%", color: "#c8b840", power: 18 },
    "crit_dmg_20_cond": { label: "Dég. Crit +20% (conditionnel)", color: "#c8b840", power: 13, cond: true },
    "crit_dmg_20_melee": { label: "Dég. Crit +20% Allié type Mêlée", color: "#c8b840", power: 29, team: true },
    "crit_dmg_20_range": { label: "Dég. Crit +20% Allié type Distance", color: "#c8b840", power: 29, team: true },
    "crit_dmg_team_20": { label: "Dég. Crit ALLIÉS +20%", color: "#e8c840", power: 40, team: true },
    "crit_dmg_team_20_range": { label: "Dég. Crit ALLIÉS +20% type Distance", color: "#e8c840", power: 32, team: true },
    "crit_dmg_30": { label: "Dég. Crit +30%", color: "#c8b840", power: 26 },
    "crit_dmg_30_cond": { label: "Dég. Crit +30% (conditionnel)", color: "#c8b840", power: 18, cond: true },
    "crit_dmg_30_melee": { label: "Dég. Crit +30% Allié type Mêlée", color: "#c8b840", power: 42, team: true },
    "crit_dmg_30_range": { label: "Dég. Crit +30% Allié type Distance", color: "#c8b840", power: 42, team: true },
    "crit_dmg_team_30": { label: "Dég. Crit ALLIÉS +30%", color: "#e8c840", power: 57, team: true },
    "crit_dmg_40": { label: "Dég. Crit +40%", color: "#c8b840", power: 34 },
    "crit_dmg_40_cond": { label: "Dég. Crit +40% (conditionnel)", color: "#c8b840", power: 24, cond: true },
    "crit_dmg_40_team": { label: "Dég. Crit ALLIÉS +40%", color: "#e8c840", power: 75, team: true },
    "crit_dmg_40_melee": { label: "Dég. Crit +40% Allié type Mêlée", color: "#c8b840", power: 54, team: true },
    "crit_dmg_40_range": { label: "Dég. Crit +40% Allié type Distance", color: "#c8b840", power: 54, team: true },
    "crit_res_10_cond": { label: "Résist. Critique +10% (2s)", color: "#8899bb", power: 7, cond: true },
    "crit_res_10": { label: "Résist. Critique +10%", color: "#8899bb", power: 10 },
    "crit_res_10_team": { label: "Résist. Critique ALLIÉS +10%", color: "#8899bb", power: 22, team: true },
    "crit_res_10_melee": { label: "Résist. Critique +10% Allié type Mêlée", color: "#8899bb", power: 16, team: true },
    "crit_res_10_range": { label: "Résist. Critique +10% Allié type Distance", color: "#8899bb", power: 16, team: true },
    "no_crit_cd": { label: "Reset CD Attaque Crit (4s)", color: "#e0a020", power: 26, cond: true },
    "debuff_crit_taken_10": { label: "Dég. Crit reçus +10% (ennemi)", color: "#dd6644", power: 12 },

    "crush_rate_10": { label: "Taux Coup Puissant +10%", color: "#e0a020", power: 12 },
    "crush_rate_10_cond": { label: "Taux Coup Puissant +10% (conditionnel)", color: "#e0a020", power: 10, cond: true },
    "crush_rate_10_melee": { label: "Taux Coup Puissant +10% Allié type Mêlée", color: "#e0a020", power: 19, team: true },
    "crush_rate_10_range": { label: "Taux Coup Puissant +10% Allié type Distance", color: "#e0a020", power: 19, team: true },
    "crush_rate_10_team": { label: "Taux Coup Puissant ALLIÉS +10%", color: "#f0b030", power: 26, team: true },
    "crush_rate_15": { label: "Taux Coup Puissant +15%", color: "#e0a020", power: 16 },
    "crush_rate_15_cond": { label: "Taux Coup Puissant +15% (conditionnel)", color: "#e0a020", power: 11, cond: true },
    "crush_rate_15_melee": { label: "Taux Coup Puissant +15% Allié type Mêlée", color: "#e0a020", power: 26, team: true },
    "crush_rate_15_range": { label: "Taux Coup Puissant +15% Allié type Distance", color: "#e0a020", power: 26, team: true },
    "crush_rate_team_15": { label: "Taux Coup Puissant ALLIÉS +15%", color: "#f0b030", power: 35, team: true },
    "crush_rate_20": { label: "Taux Coup Puissant +20%", color: "#e0a020", power: 20 },
    "crush_rate_20_cond": { label: "Taux Coup Puissant +20% (conditionnel)", color: "#e0a020", power: 14, cond: true },
    "crush_rate_20_ally": { label: "Taux Coup Puissant +20% (Allié Aléatoire)", color: "#c8b840", power: 16, cond: true },
    "crush_rate_team_melee": { label: "Taux Coup Puissant Allié type Mêlée +20%", color: "#f0b030", power: 32, team: true },
    "crush_rate_team_range": { label: "Taux Coup Puissant Allié type Distance +20%", color: "#f0b030", power: 32, team: true },
    "crush_rate_team_20": { label: "Taux Coup Puissant ALLIÉS +20%", color: "#f0b030", power: 44, team: true },
    "crush_rate_30": { label: "Taux Coup Puissant +30%", color: "#e0a020", power: 26 },
    "crush_rate_30_cond": { label: "Taux Coup Puissant +30% (conditionnel)", color: "#e0a020", power: 18, cond: true },
    "crush_rate_30_melee": { label: "Taux Coup Puissant +30% Allié type Mêlée", color: "#e0a020", power: 42, team: true },
    "crush_rate_30_range": { label: "Taux Coup Puissant +30% Allié type Distance", color: "#e0a020", power: 42, team: true },
    "crush_rate_team_30": { label: "Taux Coup Puissant ALLIÉS +30%", color: "#f0b030", power: 57, team: true },

    "crush_dmg_10": { label: "Dég. Coup Puissant +10%", color: "#e0a020", power: 10 },
    "crush_dmg_10_cond": { label: "Dég. Coup Puissant +10% (conditionnel)", color: "#e0a020", power: 7, cond: true },
    "crush_dmg_10_melee": { label: "Dég. Coup Puissant +10% Allié type Mêlée", color: "#e0a020", power: 16, team: true },
    "crush_dmg_10_range": { label: "Dég. Coup Puissant +10% Allié type Distance", color: "#e0a020", power: 16, team: true },
    "crush_dmg_team_10": { label: "Dég. Coup Puissant ALLIÉS +10%", color: "#aa60ee", power: 22, team: true },
    "crush_dmg_15": { label: "Dég. Coup Puissant +15%", color: "#e0a020", power: 14 },
    "crush_dmg_15_cond": { label: "Dég. Coup Puissant +15% (conditionnel)", color: "#e0a020", power: 10, cond: true },
    "crush_dmg_15_melee": { label: "Dég. Coup Puissant +15% Allié type Mêlée", color: "#e0a020", power: 22, team: true },
    "crush_dmg_15_range": { label: "Dég. Coup Puissant +15% Allié type Distance", color: "#e0a020", power: 22, team: true },
    "crush_dmg_team_15": { label: "Dég. Coup Puissant ALLIÉS +15%", color: "#aa60ee", power: 31, team: true },
    "crush_dmg_20": { label: "Dég. Coup Puissant +20%", color: "#e0a020", power: 18 },
    "crush_dmg_20_cond": { label: "Dég. Coup Puissant +20% (conditionnel)", color: "#e0a020", power: 13, cond: true },
    "crush_dmg_20_ally": { label: "Dég. Coup Puissant +20% (Allié Aléatoire)", color: "#44ddaa", power: 16, cond: true },
    "crush_dmg_20_melee": { label: "Dég. Coup Puissant +20% Allié type Mêlée", color: "#44ddaa", power: 29, team: true },
    "crush_dmg_20_range": { label: "Dég. Coup Puissant +20% Allié type Distance", color: "#44ddaa", power: 29, team: true },
    "crush_dmg_20_team": { label: "Dég. Coup Puissant ALLIÉS +20%", color: "#aa60ee", power: 40, team: true },
    "crush_dmg_20_team_cond": { label: "Dég. Coup Puissant ALLIÉS +20% (conditionnel)", color: "#aa60ee", power: 28, cond: true, team: true },
    "crush_dmg_30": { label: "Dég. Coup Puissant +30%", color: "#d4a830", power: 26 },
    "crush_dmg_30_cond": { label: "Dég. Coup Puissant +30% (conditionnel)", color: "#d4a830", power: 18, cond: true },
    "crush_dmg_30_melee": { label: "Dég. Coup Puissant +30% Allié type Mêlée", color: "#d4a830", power: 42, team: true },
    "crush_dmg_30_range": { label: "Dég. Coup Puissant +30% Allié type Distance", color: "#d4a830", power: 42, team: true },
    "crush_dmg_team_30": { label: "Dég. Coup Puissant ALLIÉS +30%", color: "#aa60ee", power: 57, team: true },
    "crush_dmg_40": { label: "Dég. Coup Puissant +40%", color: "#d4a830", power: 34 },
    "crush_dmg_40_cond": { label: "Dég. Coup Puissant +40% (conditionnel)", color: "#d4a830", power: 24, cond: true },
    "crush_dmg_40_melee": { label: "Dég. Coup Puissant +40% Allié type Mêlée", color: "#d4a830", power: 54, team: true },
    "crush_dmg_40_range": { label: "Dég. Coup Puissant +40% Allié type Distance", color: "#d4a830", power: 54, team: true },
    "crush_dmg_team_40": { label: "Dég. Coup Puissant ALLIÉS +40%", color: "#aa60ee", power: 75, team: true },
    "crush_dmg_team_range": { label: "Taux Coup Puissant Allié type Distance +20%", color: "#aaaaaa", power: 29, team: true },

    "double_hit_10": { label: "Coup Double +10%", color: "#cc70bb", power: 16 },
    "double_hit_10_cond": { label: "Coup Double +10% (conditionnel)", color: "#cc70bb", power: 11, cond: true },
    "double_hit_10_melee": { label: "Coup Double +10% Allié type Mêlée", color: "#cc70bb", power: 26, team: true },
    "double_hit_10_range": { label: "Coup Double +10% Allié type Distance", color: "#cc70bb", power: 26, team: true },
    "double_hit_team_10": { label: "Coup Double ALLIÉS +10%", color: "#cc70bb", power: 35, team: true },
    "double_hit_15": { label: "Coup Double +15%", color: "#cc70bb", power: 20 },
    "double_hit_15_cond": { label: "Coup Double +15% (conditionnel)", color: "#cc70bb", power: 14, cond: true },
    "double_hit_15_melee": { label: "Coup Double +15% Allié type Mêlée", color: "#cc70bb", power: 32, team: true },
    "double_hit_15_range": { label: "Coup Double +15% Allié type Distance", color: "#cc70bb", power: 32, team: true },
    "double_hit_team_15": { label: "Coup Double ALLIÉS +15%", color: "#cc70bb", power: 44, team: true },
    "double_hit_20": { label: "Coup Double +20%", color: "#cc70bb", power: 26 },
    "double_hit_20_cond": { label: "Coup Double +20% (conditionnel)", color: "#cc70bb", power: 18, cond: true },
    "double_hit_team_20_melee": { label: "Coup Double ALLIÉS Mêlée +20%", color: "#cc70bb", power: 42, team: true },
    "double_hit_team_20_range": { label: "Coup Double ALLIÉS Distance +20%", color: "#cc70bb", power: 42, team: true },
    "double_hit_team_20": { label: "Coup Double ALLIÉS +20%", color: "#cc70bb", power: 57, team: true },
    "double_hit_30": { label: "Coup Double +30%", color: "#cc70bb", power: 36 },
    "double_hit_30_cond": { label: "Coup Double +30% (conditionnel)", color: "#cc70bb", power: 25, cond: true },
    "double_hit_30_melee": { label: "Coup Double +30% Allié type Mêlée", color: "#cc70bb", power: 58, team: true },
    "double_hit_30_range": { label: "Coup Double +30% Allié type Distance", color: "#cc70bb", power: 58, team: true },
    "double_hit_team_30": { label: "Coup Double ALLIÉS +30%", color: "#cc70bb", power: 79, team: true },
    "triple_hit_10": { label: "Coup Triple +10%", color: "#aa60ee", power: 26 },
    "triple_hit_10_cond": { label: "Coup Triple +10% (conditionnel)", color: "#aa60ee", power: 18, cond: true },
    "triple_hit_10_melee": { label: "Coup Triple +10% Allié type Mêlée", color: "#aa60ee", power: 42, team: true },
    "triple_hit_10_range": { label: "Coup Triple +10% Allié type Distance", color: "#aa60ee", power: 42, team: true },
    "triple_hit_team_10": { label: "Coup Triple ALLIÉS +10%", color: "#aa60ee", power: 57, team: true },
    "triple_hit_15": { label: "Coup Triple +15%", color: "#aa60ee", power: 34 },
    "triple_hit_15_cond": { label: "Coup Triple +15% (conditionnel)", color: "#aa60ee", power: 24, cond: true },
    "triple_hit_15_melee": { label: "Coup Triple +15% Allié type Mêlée", color: "#aa60ee", power: 54, team: true },
    "triple_hit_15_range": { label: "Coup Triple +15% Allié type Distance", color: "#aa60ee", power: 54, team: true },
    "triple_hit_team_15": { label: "Coup Triple ALLIÉS +15%", color: "#aa60ee", power: 75, team: true },
    "triple_hit_20": { label: "Coup Triple +20%", color: "#aa60ee", power: 42 },
    "triple_hit_20_cond": { label: "Coup Triple +20% (conditionnel)", color: "#aa60ee", power: 29, cond: true },
    "triple_hit_20_melee": { label: "Coup Triple +20% Allié type Mêlée", color: "#aa60ee", power: 67, team: true },
    "triple_hit_20_range": { label: "Coup Triple +20% Allié type Distance", color: "#aa60ee", power: 67, team: true },
    "triple_hit_team_20": { label: "Coup Triple ALLIÉS +20%", color: "#aa60ee", power: 92, team: true },
    "double_triple_dmg_team": { label: "Dég. Coups Doubles/Triples +15% ALLIÉS", color: "#4466cc", power: 30, team: true },

    "weak_hit_rate_20": { label: "Taux Coups Affaiblis +20%", color: "#8899aa", power: 14 },
    "weak_hit_rate_20_melee": { label: "Taux Coups Affaiblis +20% Allié type Mêlée", color: "#8899aa", power: 22, team: true },

    "spd_10": { label: "Vit. ATQ +10%", color: "#e07832", power: 10 },
    "spd_10_cond": { label: "Vit. ATQ +10% (conditionnel)", color: "#e07832", power: 7, cond: true },
    "spd_10_melee": { label: "Vit. ATQ +10% Allié type Mêlée", color: "#e07832", power: 16, team: true },
    "spd_10_range": { label: "Vit. ATQ +10% Allié type Distance", color: "#e07832", power: 16, team: true },
    "spd_team_10": { label: "Vit. ATQ ALLIÉS +10%", color: "#ffcc33", power: 22, team: true },
    "spd_15": { label: "Vit. ATQ +15%", color: "#e07832", power: 14 },
    "spd_15_cond": { label: "Vit. ATQ +15% (conditionnel)", color: "#e07832", power: 10, cond: true },
    "spd_15_melee": { label: "Vit. ATQ +15% Allié type Mêlée", color: "#e07832", power: 22, team: true },
    "spd_15_range": { label: "Vit. ATQ +15% Allié type Distance", color: "#e07832", power: 22, team: true },
    "spd_team_15": { label: "Vit. ATQ ALLIÉS +15%", color: "#ffcc33", power: 31, team: true },
    "spd_20": { label: "Vit. ATQ +20%", color: "#e07832", power: 18 },
    "spd_20_cond": { label: "Vit. ATQ +20% (conditionnel)", color: "#e07832", power: 13, cond: true },
    "spd_20_melee": { label: "Vit. ATQ +20% Allié type Mêlée", color: "#e07832", power: 29, team: true },
    "spd_20_range": { label: "Vit. ATQ +20% Allié type Distance", color: "#e07832", power: 29, team: true },
    "spd_team_20": { label: "Vit. ATQ ALLIÉS +20%", color: "#ffcc33", power: 40, team: true },
    "spd_25": { label: "Vit. ATQ +25%", color: "#e07832", power: 20 },
    "spd_25_cond": { label: "Vit. ATQ +25% (conditionnel)", color: "#e07832", power: 14, cond: true },
    "spd_25_melee": { label: "Vit. ATQ +25% Allié type Mêlée", color: "#e07832", power: 32, team: true },
    "spd_25_range": { label: "Vit. ATQ +25% Allié type Distance", color: "#e07832", power: 32, team: true },
    "spd_team_25": { label: "Vit. ATQ ALLIÉS +25%", color: "#ffcc33", power: 44, team: true },
    "spd_30": { label: "Vit. ATQ +30%", color: "#e07832", power: 22 },
    "spd_30_cond": { label: "Vit. ATQ +30% (conditionnel)", color: "#e07832", power: 15, cond: true },
    "spd_30_melee": { label: "Vit. ATQ +30% Allié type Mêlée", color: "#e07832", power: 35, team: true },
    "spd_30_range": { label: "Vit. ATQ +30% Allié type Distance", color: "#e07832", power: 35, team: true },
    "spd_team_30": { label: "Vit. ATQ ALLIÉS +30%", color: "#ffcc33", power: 48, team: true },
    "spd_35": { label: "Vit. ATQ +35%", color: "#e07832", power: 24 },
    "spd_40_cond": { label: "Vit. ATQ +40% (1s)", color: "#ff8800", power: 16, cond: true },
    "spd_50": { label: "Vit. ATQ +50%", color: "#ff8800", power: 34 },
    "spd_50_cond": { label: "Vit. ATQ +50% (conditionnel)", color: "#ff8800", power: 24, cond: true },
    "spd_50_team": { label: "Vit. ATQ ALLIÉS +50%", color: "#ffcc33", power: 75, team: true },
    "spd_50_melee": { label: "Vit. ATQ +50% Allié type Mêlée", color: "#ff8800", power: 54, team: true },
    "spd_50_range": { label: "Vit. ATQ +50% Allié type Distance", color: "#ff8800", power: 54, team: true },
    "move_spd_200": { label: "Vit. Déplacement +200% (3s)", color: "#4488cc", power: 8 },
    "move_spd_20": { label: "Vit. Déplacement +20% (10s)", color: "#4488cc", power: 9 },
    "move_spd_20_cond": { label: "Vit. Déplacement +20% (conditionnel)", color: "#4488cc", power: 6, cond: true },
    "move_spd_20_team": { label: "Vit. Déplacement ALLIÉS +20%", color: "#4488cc", power: 20, team: true },
    "move_spd_25": { label: "Vit. Déplacement +25% (10s)", color: "#4488cc", power: 10 },
    "move_spd_25_team": { label: "Vit. Déplacement ALLIÉS +25%", color: "#4488cc", power: 22, team: true },
    "move_spd_30": { label: "Vit. Déplacement +30% (10s)", color: "#4488cc", power: 11 },
    "move_spd_30_cond": { label: "Vit. Déplacement +30% (conditionnel)", color: "#4488cc", power: 8, cond: true },
    "move_spd_30_team": { label: "Vit. Déplacement ALLIÉS +30%", color: "#4488cc", power: 24, team: true },
    "move_spd_35_team": { label: "Vit. Déplacement ALLIÉS +35%", color: "#4488cc", power: 26, team: true },

    "skill_accel_10": { label: "Accél. Compétences +10%", color: "#30b0d0", power: 11 },
    "skill_accel_10_cond": { label: "Accél. Compétences +10% (conditionnel)", color: "#30b0d0", power: 8, cond: true },
    "skill_accel_10_melee": { label: "Accél. Compétences +10% Allié type Mêlée", color: "#30b0d0", power: 18, team: true },
    "skill_accel_10_range": { label: "Accél. Compétences +10% Allié type Distance", color: "#30b0d0", power: 18, team: true },
    "skill_accel_10_team": { label: "Accél. Compétences ALLIÉS +10%", color: "#30b0d0", power: 24, team: true },
    "skill_accel_15": { label: "Accél. Compétences +15%", color: "#30b0d0", power: 16 },
    "skill_accel_15_cond": { label: "Accél. Compétences +15% (conditionnel)", color: "#30b0d0", power: 11, cond: true },
    "skill_accel_15_melee": { label: "Accél. Compétences +15% Allié type Mêlée", color: "#30b0d0", power: 26, team: true },
    "skill_accel_15_range": { label: "Accél. Compétences +15% Allié type Distance", color: "#30b0d0", power: 26, team: true },
    "skill_accel_15_team": { label: "Accél. Compétences ALLIÉS +15%", color: "#30b0d0", power: 35, team: true },
    "skill_accel_20_cond": { label: "Accél. Compétences +20% (conditionnel)", color: "#30b0d0", power: 17, cond: true },
    "skill_accel_20": { label: "Accél. Compétences +20%", color: "#30b0d0", power: 22 },
    "skill_accel_20_melee": { label: "Accél. Compétences +20% Allié type Mêlée", color: "#30b0d0", power: 35, team: true },
    "skill_accel_20_range": { label: "Accél. Compétences +20% Allié type Distance", color: "#30b0d0", power: 35, team: true },
    "skill_accel_20_team": { label: "Accél. Compétences ALLIÉS +20%", color: "#30b0d0", power: 48, team: true },
    "skill_accel_30": { label: "Accél. Compétences +30%", color: "#30b0d0", power: 22 },
    "skill_accel_30_cond": { label: "Accél. Compétences +30% (conditionnel)", color: "#30b0d0", power: 15, cond: true },
    "skill_accel_30_melee": { label: "Accél. Compétences +30% Allié type Mêlée", color: "#30b0d0", power: 35, team: true },
    "skill_accel_30_range": { label: "Accél. Compétences +30% Allié type Distance", color: "#30b0d0", power: 35, team: true },
    "skill_accel_30_team": { label: "Accél. Compétences ALLIÉS +30%", color: "#30b0d0", power: 48, team: true },
    "cd_reset_proc": { label: "Reset CD Compétence (conditionnel)", color: "#00ffff", power: 20, cond: true },
    "cd_reset_proc_team": { label: "Reset CD Compétence ALLIÉS (conditionnel)", color: "#00ffff", power: 36, cond: true, team: true },
    "cd_skill_cond": { label: "Réduction CD Compétence Excl. (conditionnel)", color: "#30c0d0", power: 12, cond: true },
    "exclusive_cd_down": { label: "Accél. Comp. Exclusive +5% (restant)", color: "#d06030", power: 8 },
    "exclusive_cd_down_team": { label: "Accél. Comp. Exclusive ALLIÉS +5%", color: "#d06030", power: 18, team: true },

    "range_1": { label: "Portée +1", color: "#50b890", power: 10 },
    "range_1_cond": { label: "Portée +1 (conditionnel)", color: "#50b890", power: 7, cond: true },
    "range_1_melee": { label: "Portée +1 Allié type Mêlée", color: "#50b890", power: 16, team: true },
    "range_1_range": { label: "Portée +1 Allié type Distance", color: "#50b890", power: 16, team: true },
    "range_1_team": { label: "Portée +1 ALLIÉS", color: "#50b890", power: 22, team: true },
    "range_2": { label: "Portée +2", color: "#50b890", power: 16 },
    "range_2_cond": { label: "Portée +2 (conditionnel)", color: "#50b890", power: 11, cond: true },
    "range_2_melee": { label: "Portée +2 Allié type Mêlée", color: "#50b890", power: 26, team: true },
    "range_2_range": { label: "Portée +2 Allié type Distance", color: "#50b890", power: 26, team: true },
    "range_2_team": { label: "Portée +2 ALLIÉS", color: "#50b890", power: 35, team: true },
    "range_3": { label: "Portée +3", color: "#50b890", power: 24 },
    "range_3_cond": { label: "Portée +3 (conditionnel)", color: "#50b890", power: 17, cond: true },
    "range_3_melee": { label: "Portée +3 Allié type Mêlée", color: "#50b890", power: 38, team: true },
    "range_3_range": { label: "Portée +3 Allié type Distance", color: "#50b890", power: 38, team: true },
    "range_3_team": { label: "Portée +3 ALLIÉS", color: "#50b890", power: 53, team: true },
    "range_5": { label: "Portée +5", color: "#50b890", power: 34 },
    "range_5_cond": { label: "Portée +5 (conditionnel)", color: "#50b890", power: 24, cond: true },
    "range_5_melee": { label: "Portée +5 Allié type Mêlée", color: "#50b890", power: 54, team: true },
    "range_5_range": { label: "Portée +5 Allié type Distance", color: "#50b890", power: 54, team: true },
    "range_5_team": { label: "Portée +5 ALLIÉS", color: "#50b890", power: 75, team: true },
    "aoe_range_20": { label: "Rayon Zone +20%", color: "#66ddaa", power: 14 },
    "aoe_range_20_cond": { label: "Rayon Zone +20% (conditionnel)", color: "#66ddaa", power: 10, cond: true },
    "aoe_range_20_melee": { label: "Rayon Zone +20% Allié type Mêlée", color: "#66ddaa", power: 22, team: true },
    "aoe_range_20_range": { label: "Rayon Zone +20% Allié type Distance", color: "#66ddaa", power: 22, team: true },
    "aoe_range_20_team": { label: "Rayon Zone ALLIÉS +20%", color: "#66ddaa", power: 31, team: true },
    "aoe_range_30": { label: "Rayon Zone +30%", color: "#66ddaa", power: 20 },
    "aoe_range_30_cond": { label: "Rayon Zone +30% (conditionnel)", color: "#66ddaa", power: 13, cond: true },
    "aoe_range_30_melee": { label: "Rayon Zone +30% Allié type Mêlée", color: "#66ddaa", power: 32, team: true },
    "aoe_range_30_range": { label: "Rayon Zone +30% Allié type Distance", color: "#66ddaa", power: 32, team: true },
    "aoe_range_30_team": { label: "Rayon Zone ALLIÉS +30%", color: "#66ddaa", power: 44, team: true },
    "aoe_range_50": { label: "Rayon Zone +50%", color: "#66ddaa", power: 28 },
    "aoe_range_50_cond": { label: "Rayon Zone +50% (conditionnel)", color: "#66ddaa", power: 20, cond: true },
    "aoe_range_50_melee": { label: "Rayon Zone +50% Allié type Mêlée", color: "#66ddaa", power: 45, team: true },
    "aoe_range_50_range": { label: "Rayon Zone +50% Allié type Distance", color: "#66ddaa", power: 45, team: true },
    "aoe_range_50_team": { label: "Rayon Zone ALLIÉS +50%", color: "#66ddaa", power: 62, team: true },

    "def_10": { label: "DEF +10%", color: "#4d8fd6", power: 6 },
    "def_10_cond": { label: "DEF +10% (conditionnel)", color: "#4d8fd6", power: 4, cond: true },
    "def_10_melee": { label: "DEF +10% Allié type Mêlée", color: "#4d8fd6", power: 10, team: true },
    "def_10_range": { label: "DEF +10% Allié type Distance", color: "#4d8fd6", power: 10, team: true },
    "def_10_team": { label: "DEF ALLIÉS +10%", color: "#4d8fd6", power: 13, team: true },
    "def_15": { label: "DEF +15%", color: "#4d8fd6", power: 9 },
    "def_15_cond": { label: "DEF +15% (conditionnel)", color: "#4d8fd6", power: 6, cond: true },
    "def_15_melee": { label: "DEF +15% Allié type Mêlée", color: "#4d8fd6", power: 14, team: true },
    "def_15_range": { label: "DEF +15% Allié type Distance", color: "#4d8fd6", power: 14, team: true },
    "def_team_15": { label: "DEF ALLIÉS +15%", color: "#4d8fd6", power: 20, team: true },
    "def_20": { label: "DEF +20%", color: "#4d8fd6", power: 13 },
    "def_20_cond": { label: "DEF +20% (conditionnel)", color: "#4d8fd6", power: 9, cond: true },
    "def_20_melee": { label: "DEF +20% Allié type Mêlée", color: "#4d8fd6", power: 21, team: true },
    "def_20_range": { label: "DEF +20% Allié type Distance", color: "#4d8fd6", power: 21, team: true },
    "def_team_20": { label: "DEF ALLIÉS +20%", color: "#4d8fd6", power: 29, team: true },
    "def_30": { label: "DEF +30%", color: "#4d8fd6", power: 18 },
    "def_30_cond": { label: "DEF +30% (conditionnel)", color: "#4d8fd6", power: 13, cond: true },
    "def_30_melee": { label: "DEF +30% Allié type Mêlée", color: "#4d8fd6", power: 29, team: true },
    "def_30_range": { label: "DEF +30% Allié type Distance", color: "#4d8fd6", power: 29, team: true },
    "def_team_30": { label: "DEF ALLIÉS +30%", color: "#4d8fd6", power: 40, team: true },
    "def_nerf_20": { label: "DEF ennemi -20%", color: "#4d8fd6", power: 14, cond: true },
    "def_nerf_20_cond": { label: "DEF ennemi -20% (cibles sous CC)", color: "#4d8fd6", power: 10, cond: true },

    "hp_max_10": { label: "PV MAX +10%", color: "#44aacc", power: 10 },
    "hp_max_10_cond": { label: "PV MAX +10% (conditionnel)", color: "#44aacc", power: 7, cond: true },
    "hp_max_10_melee": { label: "PV MAX +10% Allié type Mêlée", color: "#44aacc", power: 16, team: true },
    "hp_max_10_range": { label: "PV MAX +10% Allié type Distance", color: "#44aacc", power: 16, team: true },
    "hp_max_10_team": { label: "PV MAX ALLIÉS +10%", color: "#44aacc", power: 22, team: true },
    "hp_max_15_cond": { label: "PV MAX +15% (conditionnel)", color: "#44aacc", power: 14, cond: true },
    "hp_max_15": { label: "PV MAX +15%", color: "#44aacc", power: 14 },
    "hp_max_15_melee": { label: "PV MAX +15% Allié type Mêlée", color: "#44aacc", power: 22, team: true },
    "hp_max_15_range": { label: "PV MAX +15% Allié type Distance", color: "#44aacc", power: 22, team: true },
    "hp_max_team_15": { label: "PV MAX ALLIÉS +15%", color: "#44aacc", power: 31, team: true },
    "hp_max_20": { label: "PV MAX +20%", color: "#44aacc", power: 18 },
    "hp_max_20_cond": { label: "PV MAX +20% (conditionnel)", color: "#44aacc", power: 13, cond: true },
    "hp_max_20_melee": { label: "PV MAX +20% Allié type Mêlée", color: "#44aacc", power: 29, team: true },
    "hp_max_20_range": { label: "PV MAX +20% Allié type Distance", color: "#44aacc", power: 29, team: true },
    "hp_max_team_20": { label: "PV MAX ALLIÉS +20%", color: "#44aacc", power: 40, team: true },

    "res_lp_20": { label: "Résist. Longue Portée -20%", color: "#4488aa", power: 10 },
    "res_lp_20_cond": { label: "Résist. Longue Portée -20% (conditionnel)", color: "#4488aa", power: 7, cond: true },
    "res_lp_20_melee": { label: "Résist. LP -20% Allié type Mêlée", color: "#4488aa", power: 16, team: true },
    "res_lp_20_range": { label: "Résist. LP -20% Allié type Distance", color: "#4488aa", power: 16, team: true },
    "res_lp_20_team": { label: "Résist. LP ALLIÉS -20%", color: "#4488aa", power: 22, team: true },
    "res_lp_30": { label: "Résist. Longue Portée -30%", color: "#4488aa", power: 14 },
    "res_lp_30_cond": { label: "Résist. Longue Portée -30% (conditionnel)", color: "#4488aa", power: 10, cond: true },
    "res_lp_30_melee": { label: "Résist. LP -30% Allié type Mêlée", color: "#4488aa", power: 22, team: true },
    "res_lp_30_range": { label: "Résist. LP -30% Allié type Distance", color: "#4488aa", power: 22, team: true },
    "res_lp_30_team": { label: "Résist. LP ALLIÉS -30%", color: "#4488aa", power: 31, team: true },
    "res_lp_50": { label: "Résist. Longue Portée -50%", color: "#4488aa", power: 20 },
    "res_lp_50_cond": { label: "Résist. Longue Portée -50% (conditionnel)", color: "#4488aa", power: 14, cond: true },
    "res_lp_50_melee": { label: "Résist. LP -50% Allié type Mêlée", color: "#4488aa", power: 32, team: true },
    "res_lp_50_range": { label: "Résist. LP -50% Allié type Distance", color: "#4488aa", power: 32, team: true },
    "res_lp_50_team": { label: "Résist. LP ALLIÉS -50%", color: "#4488aa", power: 44, team: true },
    "dmg_resist_10": { label: "Résist. Dégâts +10%", color: "#5588cc", power: 16 },
    "dmg_resist_10_cond": { label: "Résist. Dégâts +10% (conditionnel)", color: "#5588cc", power: 11, cond: true },
    "dmg_resist_10_melee": { label: "Résist. Dégâts +10% Allié type Mêlée", color: "#5588cc", power: 26, team: true },
    "dmg_resist_10_range": { label: "Résist. Dégâts +10% Allié type Distance", color: "#5588cc", power: 26, team: true },
    "dmg_resist_team_10": { label: "Résist. Dégâts ALLIÉS +10%", color: "#33ccff", power: 35, team: true },
    "dmg_resist_15_cond": { label: "Résist. Dégâts +15% (conditionnel)", color: "#5588cc", power: 16, cond: true },
    "dmg_resist_15": { label: "Résist. Dégâts +15%", color: "#5588cc", power: 22 },
    "dmg_resist_15_melee": { label: "Résist. Dégâts +15% Allié type Mêlée", color: "#5588cc", power: 35, team: true },
    "dmg_resist_15_range": { label: "Résist. Dégâts +15% Allié type Distance", color: "#5588cc", power: 35, team: true },
    "dmg_resist_team_15": { label: "Résist. Dégâts ALLIÉS +15%", color: "#33ccff", power: 48, team: true },
    "dmg_resist_20_cond": { label: "Résist. Dégâts +20% (conditionnel)", color: "#5588cc", power: 18, cond: true },
    "dmg_resist_25": { label: "Résist. Dégâts +25%", color: "#5588cc", power: 22 },
    "dmg_resist_30": { label: "Résist. Dégâts +30%", color: "#5588cc", power: 26 },
    "dmg_resist_30_cond": { label: "Résist. Dégâts +30% (conditionnel)", color: "#5588cc", power: 18, cond: true },
    "dmg_resist_30_melee": { label: "Résist. Dégâts +30% Allié type Mêlée", color: "#5588cc", power: 42, team: true },
    "dmg_resist_30_range": { label: "Résist. Dégâts +30% Allié type Distance", color: "#5588cc", power: 42, team: true },
    "dmg_resist_80_cond": { label: "Résist. Dégâts +80% (2s)", color: "#0044ff", power: 26, cond: true },
    "dmg_resist_20_team": { label: "Résist. Dégâts ALLIÉS +20%", color: "#33ccff", power: 20, team: true },
    "dmg_resist_team_20": { label: "Résist. Dégâts ALLIÉS +20%", color: "#33ccff", power: 20, team: true },
    "dmg_resist_aoe_30": { label: "Résist. Dégâts de Zone +30%", color: "#5566cc", power: 18 },

    "shield_25": { label: "Bouclier de 25% des PV", color: "#4466cc", power: 10 },
    "shield_25_cond": { label: "Bouclier de 25% des PV (conditionnel)", color: "#4466cc", power: 7, cond: true },
    "shield_25_team": { label: "Bouclier de 25% PV ALLIÉS", color: "#6688ff", power: 22, team: true },
    "shield_50": { label: "Bouclier de 50% des PV", color: "#4466cc", power: 12 },
    "shield_50_cond": { label: "Bouclier de 50% des PV (conditionnel)", color: "#4466cc", power: 8, cond: true },
    "shield_50_team": { label: "Bouclier de 50% PV ALLIÉS", color: "#6688ff", power: 26, team: true },
    "shield_75": { label: "Bouclier de 75% des PV", color: "#4466cc", power: 14 },
    "shield_75_cond": { label: "Bouclier de 75% des PV (conditionnel)", color: "#4466cc", power: 10, cond: true },
    "shield_75_team": { label: "Bouclier de 75% PV ALLIÉS", color: "#6688ff", power: 31, team: true },
    "shield_100": { label: "Bouclier de 100% des PV", color: "#4466cc", power: 20 },
    "shield_100_cond": { label: "Bouclier de 100% PV (conditionnel)", color: "#4466cc", power: 14, cond: true },
    "shield_100_team": { label: "Bouclier de 100% PV ALLIÉS", color: "#6688ff", power: 44, team: true },
    "shield_30_pvmax": { label: "Bouclier = 30% des PV max", color: "#4466cc", power: 11 },
    "shield_hits_2": { label: "Bouclier ×2", color: "#4466cc", power: 12 },
    "shield_hits_2_team": { label: "Bouclier ×2 ALLIÉS", color: "#6688ff", power: 26, team: true },
    "shield_hits_3": { label: "Bouclier ×3", color: "#4466cc", power: 16 },
    "shield_hits_3_team": { label: "Bouclier ×3 ALLIÉS", color: "#6688ff", power: 28, team: true },
    "shield_hits_4": { label: "Bouclier ×4", color: "#4466cc", power: 16 },
    "shield_hits_4_team": { label: "Bouclier ×4 ALLIÉS", color: "#6688ff", power: 35, team: true },
    "shield_hits_5": { label: "Bouclier ×5", color: "#4466cc", power: 20 },
    "shield_hits_5_cond": { label: "Bouclier ×5 (conditionnel)", color: "#4466cc", power: 14, cond: true },
    "shield_hits_team_5": { label: "Bouclier ×5 ALLIÉS", color: "#6688ff", power: 44, team: true },
    "shield_hits_7": { label: "Bouclier ×7", color: "#4466cc", power: 26 },
    "shield_hits_7_team": { label: "Bouclier ×7 ALLIÉS", color: "#6688ff", power: 57, team: true },
    "shield_hits_10": { label: "Bouclier ×10", color: "#6688ff", power: 36 },
    "shield_hits_10_team": { label: "Bouclier ×10 ALLIÉS", color: "#6688ff", power: 79, team: true },
    "stealth_shield": { label: "Bouclier Invincible 3s", color: "#aa66dd", power: 32 },
    "stealth_shield_team": { label: "Bouclier Invincible 3s ALLIÉS", color: "#aa66dd", power: 70, team: true },
    "protection_shield": { label: "Bouclier = 50% des PV max", color: "#ffaa44", power: 18 },
    "protection_shield_team": { label: "Bouclier = 50% PV max ALLIÉS", color: "#ffaa44", power: 40, team: true },
    "limit_shield": { label: "Dégâts reçus ≤ 10% PV max", color: "#e05555", power: 26, team: true },
    "limit_shield_cond": { label: "Dégâts reçus ≤ 10% PV max (conditionnel)", color: "#e05555", power: 18, cond: true },

    "endurance_cond": { label: "Endurance anti-mort (coup létal)", color: "#ff44aa", power: 36, cond: true },
    "endurance_cond_team": { label: "Endurance anti-mort ALLIÉS (coup létal)", color: "#ff44aa", power: 64, cond: true, team: true },
    "dodge_3s": { label: "Esquive Absolue 3s", color: "#60aaee", power: 45 },
    "dodge_3s_cond": { label: "Esquive Absolue 3s (conditionnel)", color: "#60aaee", power: 32, cond: true },
    "dodge_3s_team": { label: "Esquive Absolue 3s ALLIÉS", color: "#60aaee", power: 99, team: true },
    "dodge_rate_20": { label: "Esquive +20%", color: "#60aaee", power: 12 },
    "dodge_nerf_20": { label: "Esquive ennemi -20%", color: "#888830", power: 10, cond: true },
    "debuff_immune": { label: "Immunité aux Affaiblissements", color: "#44ddaa", power: 20 },

    "cc_eff_10": { label: "Efficacité CC +10%", color: "#dd8844", power: 7 },
    "cc_eff_10_cond": { label: "Efficacité CC +10% (conditionnel)", color: "#dd8844", power: 5, cond: true },
    "cc_eff_10_melee": { label: "Efficacité CC +10% Allié type Mêlée", color: "#dd8844", power: 11, team: true },
    "cc_eff_10_range": { label: "Efficacité CC +10% Allié type Distance", color: "#dd8844", power: 11, team: true },
    "cc_eff_10_team": { label: "Efficacité CC ALLIÉS +10%", color: "#dd8844", power: 15, team: true },
    "cc_eff_20": { label: "Efficacité CC +20%", color: "#dd8844", power: 12, cond: true },
    "cc_eff_20_melee": { label: "Efficacité CC +20% Allié type Mêlée", color: "#dd8844", power: 19, team: true },
    "cc_eff_20_range": { label: "Efficacité CC +20% Allié type Distance", color: "#dd8844", power: 19, team: true },
    "cc_eff_team_20": { label: "Efficacité CC ALLIÉS +20%", color: "#dd8844", power: 26, team: true },
    "cc_eff_30": { label: "Efficacité CC +30%", color: "#dd8844", power: 16 },
    "cc_eff_30_cond": { label: "Efficacité CC +30% (conditionnel)", color: "#dd8844", power: 11, cond: true },
    "cc_eff_30_melee": { label: "Efficacité CC +30% Allié type Mêlée", color: "#dd8844", power: 26, team: true },
    "cc_eff_30_range": { label: "Efficacité CC +30% Allié type Distance", color: "#dd8844", power: 26, team: true },
    "cc_eff_team_30": { label: "Efficacité CC ALLIÉS +30%", color: "#dd8844", power: 35, team: true },

    "atk_spd_nerf_10": { label: "Vit. ATQ ennemi -10%", color: "#dd6644", power: 8, cond: true },
    "atk_spd_nerf_10_team": { label: "Vit. ATQ ennemi -10% ALLIÉS", color: "#dd6644", power: 18, team: true },
    "atk_spd_nerf_15": { label: "Vit. ATQ ennemi -15%", color: "#dd6644", power: 11, cond: true },
    "atk_spd_nerf_15_team": { label: "Vit. ATQ ennemi -15% ALLIÉS", color: "#dd6644", power: 24, team: true },
    "atk_spd_nerf_20": { label: "Vit. ATQ ennemi -20%", color: "#dd6644", power: 14, cond: true },
    "atk_spd_nerf_20_team": { label: "Vit. ATQ ennemi -20% ALLIÉS", color: "#dd6644", power: 28, team: true },
    "atk_spd_nerf_30": { label: "Vit. ATQ ennemi -30%", color: "#dd6644", power: 18, cond: true },
    "atk_spd_nerf_30_team": { label: "Vit. ATQ ennemi -30% ALLIÉS", color: "#dd6644", power: 40, team: true },
    "atk_spd_nerf_50": { label: "Vit. ATQ ennemi -50%", color: "#dd6644", power: 26, cond: true },
    "atk_spd_nerf_50_team": { label: "Vit. ATQ ennemi -50% ALLIÉS", color: "#dd6644", power: 57, team: true },

    "cc_immune_team_30": { label: "Immunité CC ALLIÉS (30s)", color: "#44ddaa", power: 30, team: true },
    "cc_immune_self_react": { label: "Immunité CC 2s (réactif) + Reset CD Excl.", color: "#44ddaa", power: 30, cond: true },
    "cc_immune_self": { label: "Immunité CC", color: "#44ddaa", power: 22 },
    "cc_immune_self_cond": { label: "Immunité CC (conditionnel)", color: "#44ddaa", power: 15, cond: true },
    "fran_blessing_team": { label: "Bénédiction de Fran ALLIÉS (Immunité débuffs + Dég. +15%, 10s)", color: "#88aaff", power: 42, cond: true, team: true },

    "entrave": { label: "Entrave (empêche le déplacement)", color: "#8866aa", power: 14, cond: true },
    "weak_point_entrave2": { label: "Détection P. Faible – Entrave (dégâts reçus +10%)", color: "#ffaa44", power: 14, cond: true, team: true },
    "weak_point_entrave": { label: "Détection P. Faible – Entrave (dégâts reçus +15%)", color: "#ffaa44", power: 18, cond: true, team: true },
    "pull_target": { label: "Attire la cible à la position du lanceur", color: "#aa66dd", power: 12, cond: true },
    "dmg_cc_state_scaling": { label: "Dégâts +50% (×effets altération d'état cible, max 5)", color: "#cc6644", power: 20, cond: true },
    "blindness": { label: "Aveuglement (CC)", color: "#bbbb22", power: 14, cond: true },
    "stun": { label: "Étourdissement (CC)", color: "#cc8800", power: 20, cond: true },
    "freeze": { label: "Gel (CC)", color: "#66ccff", power: 20, cond: true },
    "sleep": { label: "Sommeil (CC)", color: "#8866cc", power: 18, cond: true },
    "petrify": { label: "Pétrification (CC)", color: "#bb6622", power: 20, cond: true },
    "fear_25": { label: "Peur 2.5s (CC)", color: "#884488", power: 18, cond: true },
    "block_heal": { label: "Blocage de Récupération", color: "#ee4444", power: 16 },
    "strip_immunity": { label: "Supprime Immunité (ennemi)", color: "#ee4444", power: 22 },
    "strip_debuff_team": { label: "Supprime Effets Négatifs ALLIÉS", color: "#44ddaa", power: 26, team: true },
    "regen_team": { label: "Récupération Continue ALLIÉS", color: "#44cc88", power: 16, team: true },

    "accuracy_20": { label: "Précision +20%", color: "#88cccc", power: 14 },
    "accuracy_20_range": { label: "Précision +20% Allié type Distance", color: "#88cccc", power: 22, team: true },
    "accuracy_20_team": { label: "Précision ALLIÉS +20%", color: "#88cccc", power: 31, team: true },

    "stealth": { label: "Furtivité", color: "#8855cc", power: 16 },
    "stealth_cond": { label: "Furtivité (conditionnel)", color: "#8855cc", power: 11, cond: true },
    "stealth_team": { label: "Furtivité ALLIÉS", color: "#8855cc", power: 35, team: true },
    "strip_shield": { label: "Suppression Bouclier ennemi", color: "#ee4444", power: 18 },
    "strip_shield_team": { label: "Suppression Bouclier ennemi ALLIÉS", color: "#ee4444", power: 40, team: true },
    "block_shield": { label: "Détection Bouclier (cible)", color: "#5588cc", power: 30 },
    "block_shield_team": { label: "Détection Bouclier ALLIÉS", color: "#5588cc", power: 66, team: true },
    "provoke_status": { label: "Provocation (force la cible à attaquer le lanceur)", color: "#aaaaaa", power: 18 },
    "target_weakness_provoke": { label: "Dégâts +15% (cibles Provoquées)", color: "#aa66dd", power: 18, team: true },
    "target_weakness_immunity": { label: "Dégâts +30% (cible immunisée, Allié Aléatoire, 10s)", color: "#cc4488", power: 20, cond: true },
    "target_weakness_shield": { label: "Dégâts +15% / bouclier ennemi (max +45%)", color: "#30b0d0", power: 26, team: true },
    "class_share_melee": { label: "Le monstre est aussi de type Mêlée", color: "#50b890", power: 36 },
    "remove_buff_target": { label: "Supprime les effets de renforcement de la cible", color: "#ff44aa", power: 30 },
    "remove_buff_target_team": { label: "Supprime les effets de renforcement (cible) ALLIÉS", color: "#ff44aa", power: 66, team: true },

    "lifesteal_10": { label: "Aspiration Dégâts +10%", color: "#cc4488", power: 10 },
    "lifesteal_10_cond": { label: "Aspiration Dégâts +10% (conditionnel)", color: "#cc4488", power: 7, cond: true },
    "lifesteal_10_melee": { label: "Aspiration Dégâts +10% Allié type Mêlée", color: "#cc4488", power: 16, team: true },
    "lifesteal_10_range": { label: "Aspiration Dégâts +10% Allié type Distance", color: "#cc4488", power: 16, team: true },
    "lifesteal_10_team": { label: "Aspiration Dégâts ALLIÉS +10%", color: "#cc4488", power: 22, team: true },
    "lifesteal_15_cond": { label: "Aspiration Dégâts +15% (conditionnel)", color: "#cc4488", power: 14, cond: true },
    "lifesteal_15": { label: "Aspiration Dégâts +15%", color: "#cc4488", power: 14 },
    "lifesteal_15_melee": { label: "Aspiration Dégâts +15% Allié type Mêlée", color: "#cc4488", power: 22, team: true },
    "lifesteal_15_range": { label: "Aspiration Dégâts +15% Allié type Distance", color: "#cc4488", power: 22, team: true },
    "lifesteal_team_15": { label: "Aspiration Dégâts ALLIÉS +15%", color: "#cc4488", power: 31, team: true },
    "lifesteal_20": { label: "Aspiration Dégâts +20%", color: "#cc4488", power: 18 },
    "lifesteal_20_cond": { label: "Aspiration Dégâts +20% (conditionnel)", color: "#cc4488", power: 13, cond: true },
    "lifesteal_20_melee": { label: "Aspiration Dégâts +20% Allié type Mêlée", color: "#cc4488", power: 29, team: true },
    "lifesteal_20_range": { label: "Aspiration Dégâts +20% Allié type Distance", color: "#cc4488", power: 29, team: true },
    "lifesteal_team_20": { label: "Aspiration Dégâts ALLIÉS +20%", color: "#cc4488", power: 40, team: true },
    "lifesteal_30": { label: "Aspiration Dégâts +30%", color: "#cc4488", power: 26 },
    "lifesteal_30_cond": { label: "Aspiration Dégâts +30% (conditionnel)", color: "#cc4488", power: 18, cond: true },
    "lifesteal_30_melee": { label: "Aspiration Dégâts +30% Allié type Mêlée", color: "#cc4488", power: 42, team: true },
    "lifesteal_30_range": { label: "Aspiration Dégâts +30% Allié type Distance", color: "#cc4488", power: 42, team: true },
    "lifesteal_team_30": { label: "Aspiration Dégâts ALLIÉS +30%", color: "#cc4488", power: 57, team: true },

    "bleed": { label: "Saignement (ennemi)", color: "#b02020", power: 16 },
    "bleed_cond": { label: "Saignement (ennemi, conditionnel)", color: "#b02020", power: 11, cond: true },
    "bleed_team": { label: "Saignement (ennemi) — via ALLIÉS", color: "#b02020", power: 28, team: true },
    "bleed_melee": { label: "Saignement (ennemi) — Allié type Mêlée", color: "#b02020", power: 26, team: true },
    "bleed_range": { label: "Saignement (ennemi) — Allié type Distance", color: "#b02020", power: 26, team: true },
    "attenuation": { label: "Atténuation (-40% atk/Hit)", color: "#ff44aa", power: 12, cond: true },
    "attenuation_team": { label: "Atténuation ALLIÉS (-40% atk/Hit)", color: "#ff44aa", power: 26, cond: true, team: true },
    "dot_poison": { label: "Empoisonnement (ennemi, continu)", color: "#669900", power: 18 },
    "dot_poison_cond": { label: "Empoisonnement (ennemi, conditionnel)", color: "#669900", power: 13, cond: true },
    "dot_poison_team": { label: "Empoisonnement (ennemi) ALLIÉS", color: "#669900", power: 40, team: true },
    "dot_burn": { label: "Brûlure (ennemi, continu)", color: "#cc5500", power: 18 },
    "dot_burn_cond": { label: "Brûlure (ennemi, conditionnel)", color: "#cc5500", power: 13, cond: true },
    "dot_burn_team": { label: "Brûlure (ennemi) ALLIÉS", color: "#cc5500", power: 40, team: true },
    "dot_bleed": { label: "Saignement (ennemi, continu)", color: "#aa2020", power: 18 },
    "dot_bleed_cond": { label: "Saignement (ennemi, continu, conditionnel)", color: "#aa2020", power: 13, cond: true },
    "dot_bleed_team": { label: "Saignement (ennemi, continu) ALLIÉS", color: "#aa2020", power: 40, team: true },
    "dot_deep_bleed": { label: "Saignement Profond (ennemi, continu)", color: "#880000", power: 22 },
    "dot_dark_flame": { label: "Flammes Ténébreuses (ennemi, continu)", color: "#6600aa", power: 18 },
    "dot_love_disease": { label: "Maladie d'Amour (ennemi, continu)", color: "#ff66aa", power: 18 },
    "weakness_poison_enemy": { label: "Faiblesse Empoisonnement (ennemi)", color: "#88bb22", power: 20, cond: true },
    "weakness_poison_team": { label: "Faiblesse Empoisonnement ALLIÉS", color: "#88bb22", power: 36, cond: true, team: true },
    "weakness_element": { label: "Faiblesse Élémentaire (ennemi)", color: "#50aaee", power: 24 },
    "weakness_element_cond": { label: "Faiblesse Élémentaire (conditionnel)", color: "#50aaee", power: 17, cond: true },
    "weakness_elem_team": { label: "Faiblesse Élémentaire ALLIÉS", color: "#70ccff", power: 38, team: true },
    "weak_point_detect": { label: "Détection Point Faible ALLIÉS (sur DoT)", color: "#ffaa44", power: 22, cond: true, team: true },
    "debuff_aoe_taken_10": { label: "Dégâts Zone reçus +10% (ennemi)", color: "#dd6644", power: 16, cond: true },
    "debuff_aoe_taken_10_team": { label: "Dégâts Zone reçus +10% ennemi ALLIÉS", color: "#dd6644", power: 29, cond: true, team: true },
    "spd_nerf_25": { label: "Vit. Déplacement ennemi -25%", color: "#dd6644", power: 6, cond: true },
    "spd_nerf_50": { label: "Vit. Déplacement ennemi -50%", color: "#dd6644", power: 8, cond: true },
    "spd_nerf_75": { label: "Vit. Déplacement ennemi -75%", color: "#dd6644", power: 10, cond: true },
    "spd_nerf_100": { label: "Vit. Déplacement ennemi -100%", color: "#dd6644", power: 12, cond: true },
    "spd_nerf_25_team": { label: "Vit. Déplacement ennemi -25% ALLIÉS", color: "#dd6644", power: 13, team: true },
    "spd_nerf_50_team": { label: "Vit. Déplacement ennemi -50% ALLIÉS", color: "#dd6644", power: 18, team: true },
    "spd_nerf_75_team": { label: "Vit. Déplacement ennemi -75% ALLIÉS", color: "#dd6644", power: 22, team: true },
    "spd_nerf_100_team": { label: "Vit. Déplacement ennemi -100% ALLIÉS", color: "#dd6644", power: 26, team: true },
    "congelation_dot": { label: "Dégâts continus = 20% Vit. ATQ / 0.2s", color: "#dd6644", power: 6, cond: true },

    "fox_fire_cond": { label: "Feu du renard (sur Coup Puissant)", color: "#ff8c42", power: 10, cond: true },
    "fox_fire_burst": { label: "Feu du renard Burst ×2 (×20 stacks)", color: "#ff6820", power: 20, cond: true },
    "rockstar_i": { label: "Rockstar I (passif permanente)", color: "#ff44cc", power: 20 },
    "rockstar_iii_cond": { label: "Rockstar III 2s (conditionnel)", color: "#ff00aa", power: 12, cond: true },
    "happy_box_cond": { label: "Happy Box (sur Coup Puissant)", color: "#ffaa22", power: 12, cond: true },
    "happy_box_burst": { label: "Happy Box Burst (×5 stacks → Taux Crit/Dég. Crit/Précision +10%)", color: "#ffcc44", power: 16, cond: true },
    "merry_box_team_cond": { label: "Merry Box ALLIÉS (×5 stacks, 4s)", color: "#ffcc33", power: 30, cond: true, team: true },
    "rocknroll": { label: "Rock'n'roll — cumul Acclamation pour Belle", color: "#00ffff", power: 3, team: true },
    "acclamation": { label: "À 250 cumuls : Rockstar / Rockstar II pour Belle", color: "#00ffff", power: 15 },

    "teamwork_stack": { label: "ATQ/Dég.Crit/Dég.Puissant/Taux Crit/Taux Puissant +3%/cumul (max 21%)", color: "#c8a830", power: 22, team: true },
    "one_team_one_spirit": { label: "Si tous les stats ci-dessus ≥ +20% : Dégâts +30%", color: "#d06030", power: 35, team: true },
    "perfect_team": { label: "Si tous les stats ci-dessus ≥ +40% : Dégâts +30%", color: "#e05555", power: 45, team: true },

    "bloom_stack": { label: "Fleur (Cumul Bloom max 15)", color: "#d06030", power: 26 },
    "floraison": { label: "Floraison (Crits peuvent déclencher Coups Multiples)", color: "#d06030", power: 15 },
    "full_bloom": { label: "Pleine Floraison (Crits déclenchent Coups Multiples)", color: "#e05555", power: 36, cond: true },
    "full_bloom_team": { label: "Pleine Floraison ALLIÉS", color: "#e05555", power: 64, cond: true, team: true },
    "cd_reset_exclu_2S": { label: "10% Réduction compétence exclusive ( Cooldown : 2 sec )", color: "#66ddaa", power: 30, cond: true },
    "atk_stack_debuff_count": { label: "A chaque debuff, gagne 5% ATK par stack ( Max. 30% )", color: "#ff44aa", power: 30, cond: true, team: true },
    "accuracy_nerf_5": { label: "Précision ennemi -20%", color: "#88cccc", power: 15, cond: true },
    "curse_chain_stack": { label: "Dégâts subis +2%/Debuff (max 30%)", color: "#6622aa", power: 24, cond: true },
};

const BASIC_SKILLS = {
    "YeonHong": { name: "", desc: "Inflige 470% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 470 },
    "Iris": { name: "", desc: "Inflige 2 fois 190% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 190, hits: 2, aoe: true },
    "Juno": { name: "", desc: "Inflige 370% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 370 },
    "Mago": { name: "", desc: "Inflige 280% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 280, aoe: true },
    "Jagger": { name: "", desc: "Inflige 290% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 290, aoe: true },
    "Josephine": { name: "", desc: "Inflige 540% de la puissance d'attaque en dégâts dans un cône étroit de 2.5m devant soi.", cd: 0, buffs: [], atk_pct: 540, aoe: true },
    "Anavel": { name: "", desc: "Inflige 370% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 370 },
    "Trinity": { name: "", desc: "Inflige 290% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 290, aoe: true },
    "Belle": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 360, aoe: true },
    "Artamiel": { name: "", desc: "Inflige 390% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 390, aoe: true },
    "Theomars": { name: "", desc: "Inflige 420% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 420 },
    "Sekhmet": { name: "", desc: "Inflige 390% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 390 },
    "Harmonia": { name: "", desc: "Inflige 480% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 480 },
    "Barbara": { name: "", desc: "Inflige 2 fois 140% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 140, hits: 2, aoe: true },
    "Jeanne": { name: "", desc: "Inflige 230% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 230, aoe: true },
    "Craka": { name: "", desc: "Inflige 270% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 270, aoe: true },
    "Dusky": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 360 },
    "Elenoa": { name: "", desc: "Inflige 340% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 340 },
    "Soha": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 360 },
    "Frigate": { name: "", desc: "Inflige 380% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 380, aoe: true },
    "Laima": { name: "", desc: "Inflige 320% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 320 },
    "Brandia": { name: "", desc: "Inflige 370% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 370 },
    "Katarina": { name: "", desc: "Inflige 330% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 330 },
    "Tsuyuha": { name: "", desc: "Inflige 290% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 290, aoe: true },
    "Fran": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 360 },
    "Sabrina": { name: "", desc: "Inflige 430% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 430 },
    "Seimei": { name: "", desc: "Inflige 370% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 370 },
    "Zeta-06": { name: "", desc: "Inflige 330% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 330 },
    "Shazam": { name: "", desc: "Inflige 410% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 410 },
    "Melissa": { name: "", desc: "Inflige 350% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 350 },
    "Zeratu": { name: "", desc: "Inflige 280% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 280, aoe: true },
    "Astar": { name: "", desc: "Inflige 2 fois 150% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 150, hits: 2, aoe: true },
    "Qitian Dasheng": { name: "", desc: "Inflige 270% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 270, aoe: true },
    "Cassandra": { name: "", desc: "Inflige 250% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 250 },
    "Rina": { name: "", desc: "Inflige 400% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 400 },
    "Ophilia": { name: "", desc: "Inflige 300% de la puissance d'attaque en dégâts dans un cône étroit de 2.5m devant soi.", cd: 0, buffs: [], atk_pct: 300, aoe: true },
    "Tesarion": { name: "", desc: "Inflige 420% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 420 },
    "Charlotte": { name: "", desc: "Inflige 310% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 310 },
    "Galleon": { name: "", desc: "Inflige 220% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 220, aoe: true },
    "Vanessa": { name: "", desc: "Inflige 210% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 210, aoe: true },
    "Grogen": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 360 },
    "Shihwa": { name: "", desc: "Inflige 300% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 300 },
    "Chasun": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 360 },
    "Mei Hou Wang": { name: "", desc: "Inflige 220% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 220, aoe: true },
    "Alicia": { name: "", desc: "Inflige 330% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 330 },
    "Ariel": { name: "", desc: "Inflige 300% de la puissance d'attaque en dégâts dans un cône étroit de 2.5m devant soi.", cd: 0, buffs: [], atk_pct: 300, aoe: true },
    "Verdehile": { name: "", desc: "Inflige 2 fois 180% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 180, hits: 2 },
    "Delphoi": { name: "", desc: "Inflige 320% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 320 },
    "Celestia": { name: "", desc: "Inflige 360% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 360 },
    "Tetra": { name: "", desc: "Inflige 370% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 370 },
    "Feng Yan": { name: "", desc: "Inflige 210% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 210, aoe: true },
    "Lapis": { name: "", desc: "Inflige 2 fois 100% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 100, hits: 2, aoe: true },
    "Lushen": { name: "", desc: "Inflige 350% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 350 },
    "Raki": { name: "", desc: "Inflige 380% de la puissance d'attaque en dégâts dans un cône étroit de 3m devant soi.", cd: 0, buffs: [], atk_pct: 380, aoe: true },
    "Tilasha": { name: "", desc: "Inflige 460% de la puissance d'attaque en dégâts à la cible.", cd: 0, buffs: [], atk_pct: 460 },
};

const CRIT_SKILLS = {
    "YeonHong": { name: "", desc: "Inflige 3 fois 700% de la puissance d'attaque en dégâts critiques à la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de récupération (Courage !).\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["spd_team_20"], atk_pct: 700, hits: 3 },
    "Iris": { name: "", desc: "Inflige 3 fois 510% de la puissance d'attaque en dégâts critiques dans un rayon de 1m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation du taux de Coup double de 20% pendant 2 sec. (Effet cumulable)\nInflige 100% de dégâts supplémentaires aux cibles sous immunité.\nInflige 100% de dégâts supplémentaires aux cibles uniques.", cd: 2, buffs: ["double_hit_team_20_melee", "dmg_100_immunity", "dmg_100_solotarget"], atk_pct: 510, hits: 3, aoe: true },
    "Juno": { name: "", desc: "Inflige 3 fois 390% de la puissance d'attaque en dégâts critiques dans un rayon de 1m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation du taux de Coup double de 20% pendant 2 sec. (Effet cumulable)\nConfère à soi-même l'effet Floraison pendant 10 sec.", cd: 2, buffs: ["bloom_stack", "floraison", "double_hit_team_20_range"], atk_pct: 390, hits: 3, aoe: true },
    "Mago": { name: "", desc: "Inflige 5 fois 140% de la puissance d'attaque en dégâts critiques dans un cône étroit de 3m devant soi.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Atténuation pendant 2 sec.", cd: 2, buffs: ["attenuation"], atk_pct: 140, hits: 5, aoe: true },
    "Jagger": { name: "", desc: "Inflige 560% de la puissance d'attaque en dégâts critiques dans une zone de 2m de large et de 5m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires proportionnels au nombre d'effets de renforcement actifs. (Max 30)", cd: 2, buffs: ["crush_dmg_20_melee", "dmg_buff_scaling"], atk_pct: 560, aoe: true },
    "Josephine": { name: "", desc: "Inflige 1 230% de la puissance d'attaque en dégâts critiques dans un cône de 4m devant soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation du taux critique de 20% pendant 2 sec. (Effet cumulable)\nEn cas d'attaque réussie, confère aux alliés bénéficiant d'un effet de bouclier l'effet Bouclier Limite pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crit_rate_team_20", "limit_shield"], atk_pct: 1230, aoe: true },
    "Anavel": { name: "", desc: "Inflige 2 fois 160% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nInflige des dégâts supplémentaires aux cibles en état de Congélation.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la vitesse de déplacement niv.1 pendant 2 sec.", cd: 2, buffs: ["congelation_dmg", "spd_nerf_25"], atk_pct: 160, hits: 2, aoe: true },
    "Trinity": { name: "", desc: "Inflige 3 fois 190% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires proportionnels au nombre d'effets néfastes sur la cible. (Max 15)", cd: 0, buffs: ["atk_20_range", "dgt_sup_20_atk"], atk_pct: 190, hits: 3, aoe: true },
    "Belle": { name: "", desc: "Inflige 770% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crush_dmg_20_range"], atk_pct: 770, aoe: true },
    "Artamiel": { name: "", desc: "Inflige 620% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crush_dmg_20_melee"], atk_pct: 620, aoe: true },
    "Theomars": { name: "", desc: "Inflige 790% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles sous Trace de givre.", cd: 2, buffs: ["atk_20_range", "archdemon_grand_froid"], atk_pct: 790, aoe: true },
    "Sekhmet": { name: "", desc: "Inflige 3 fois 140% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation du taux critique de 20% pendant 2 sec. (Effet cumulable)\nInflige 15% de dégâts supplémentaires par ennemi touché. (Max 10 ennemis)", cd: 2, buffs: ["crit_rate_team_20_range", "dmg_aoe_15"], atk_pct: 140, hits: 3, aoe: true },
    "Harmonia": { name: "", desc: "Inflige 580% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, supprime les effets de renforcement de la cible.", cd: 2, buffs: ["remove_buff_target"], atk_pct: 580, aoe: true },
    "Barbara": { name: "", desc: "Inflige 2 fois 320% de la puissance d'attaque en dégâts critiques dans une zone de 2m de large et de 5m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation du taux de Coup puissant de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crush_rate_team_melee"], atk_pct: 320, hits: 2, aoe: true },
    "Jeanne": { name: "", desc: "Inflige 130% de la puissance d'attaque en dégâts critiques dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec.", cd: 2, buffs: ["dmg_20"], atk_pct: 130, aoe: true },
    "Craka": { name: "", desc: "Inflige 2 fois 250% de la puissance d'attaque en dégâts critiques dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état de Saignement.", cd: 2, buffs: ["dmg_20_melee", "dmg_bleed_20"], atk_pct: 250, hits: 2, aoe: true },
    "Dusky": { name: "", desc: "Inflige 2 fois 230% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état de Brûlure.", cd: 2, buffs: ["crush_dmg_20_range", "dmg_burned_20"], atk_pct: 230, hits: 2, aoe: true },
    "Elenoa": { name: "", desc: "Inflige 430% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état d'Empoisonnement.", cd: 2, buffs: ["crit_dmg_team_20_range", "dmg_poisoned_20"], atk_pct: 430, aoe: true },
    "Soha": { name: "", desc: "Inflige 3 fois 200% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution du taux critique de 20% pendant 2 sec.\nÀ chaque coup réussi, charge un cumul de Feu du renard pendant 10 sec.\nLorsque 20 cumuls de Feu du renard sont accumulés, tous les cumuls sont consommés pour utiliser la compétence critique 2 fois supplémentaires.", cd: 2, buffs: ["crit_rate_nerf_20", "fox_fire_cond", "fox_fire_burst"], atk_pct: 200, hits: 3, aoe: true },
    "Frigate": { name: "", desc: "Inflige 2 fois 1 050% de la puissance d'attaque en dégâts critiques dans un cône de 3m devant soi.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la puissance d'attaque de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état de Provocation.", cd: 2, buffs: ["atk_nerf_20", "target_weakness_provoke"], atk_pct: 1050, hits: 2, aoe: true },
    "Laima": { name: "", desc: "Inflige 5 fois 60% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation de la précision de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état d'Aveuglement.", cd: 2, buffs: ["accuracy_20_range", "dmg_blinded_20"], atk_pct: 60, hits: 5, aoe: true },
    "Brandia": { name: "", desc: "Inflige 420% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles uniques.", cd: 2, buffs: ["atk_20_range", "dmg_unique_target"], atk_pct: 420, aoe: true },
    "Katarina": { name: "", desc: "Inflige 2 fois 530% de la puissance d'attaque en dégâts critiques dans un rayon de 1m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la résistance aux dégâts de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles de type Mêlée et Défense.", cd: 2, buffs: ["resist_nerf_20", "dmg_melee_def_target"], atk_pct: 530, hits: 2, aoe: true },
    "Tsuyuha": { name: "", desc: "Inflige 2 fois 230% de la puissance d'attaque en dégâts critiques dans une zone de 4m de large et de 7m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles sous contrôle.", cd: 2, buffs: ["spd_20_melee", "dmg_cc_50"], atk_pct: 230, hits: 2, aoe: true },
    "Fran": { name: "", desc: "Inflige 2 fois 560% de la puissance d'attaque en dégâts critiques dans un rayon de 1m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation du taux critique de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crit_rate_team_20_range"], atk_pct: 560, hits: 2, aoe: true },
    "Sabrina": { name: "", desc: "Inflige 3 fois 190% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["dmg_20_range"], atk_pct: 190, hits: 3, aoe: true },
    "Seimei": { name: "", desc: "Inflige 3 fois 230% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation du taux de Coups puissants de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crush_rate_team_range"], atk_pct: 230, hits: 3, aoe: true },
    "Zeta-06": { name: "", desc: "Inflige 540% de la puissance d'attaque en dégâts critiques dans une zone de 2m de large et de 10m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["dmg_20_range"], atk_pct: 540, aoe: true },
    "Shazam": { name: "", desc: "Inflige 490% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état de Saignement.", cd: 2, buffs: ["dmg_20_range", "dmg_bleed_20"], atk_pct: 490, aoe: true },
    "Melissa": { name: "", desc: "Inflige 530% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires aux cibles en état d'Étourdissement.", cd: 2, buffs: ["dmg_20_range", "dmg_stunned_20"], atk_pct: 530, aoe: true },
    "Zeratu": { name: "", desc: "Inflige 3 fois 250% de la puissance d'attaque en dégâts critiques dans un cône de 3m devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 2 sec. (Effet cumulable)\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Réduction des dégâts de zone reçus de 30% pendant 2 sec.", cd: 2, buffs: ["crit_dmg_20_melee", "dmg_resist_aoe_30"], atk_pct: 250, hits: 3, aoe: true },
    "Astar": { name: "", desc: "Inflige 390% de la puissance d'attaque en dégâts critiques dans un cône de 3m devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation du taux critique de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crit_rate_team_20_melee"], atk_pct: 390, aoe: true },
    "Qitian Dasheng": { name: "", desc: "Inflige 170% de la puissance d'attaque en dégâts critiques dans une zone de 3m de large et de 6m de long devant soi.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Accélération des compétences de 20% pendant 2 sec.", cd: 2, buffs: ["skill_accel_20"], atk_pct: 170, aoe: true },
    "Cassandra": { name: "", desc: "Inflige 3 fois 130% de la puissance d'attaque en dégâts critiques à la cible.\nInflige des dégâts supplémentaires aux cibles en état d'Étourdissement.", cd: 2, buffs: ["dmg_stunned_20"], atk_pct: 130, hits: 3 },
    "Rina": { name: "", desc: "Inflige 150% de la puissance d'attaque en dégâts critiques dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, supprime les effets de bouclier ennemis.", cd: 2, buffs: ["strip_shield"], atk_pct: 150, aoe: true },
    "Ophilia": { name: "", desc: "Inflige 170% de la puissance d'attaque en dégâts critiques dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation du taux de Coups affaiblis de 20% pendant 2 sec.", cd: 2, buffs: ["weak_hit_rate_20"], atk_pct: 170, aoe: true },
    "Tesarion": { name: "", desc: "Inflige 280% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec.\nInflige des dégâts supplémentaires aux cibles en état de Brûlure.", cd: 2, buffs: ["dmg_20", "dmg_burned_20"], atk_pct: 280, aoe: true },
    "Charlotte": { name: "", desc: "Inflige 3 fois 70% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nInflige des dégâts supplémentaires aux cibles en état d'Empoisonnement.", cd: 2, buffs: ["dmg_poisoned_20"], atk_pct: 70, hits: 3, aoe: true },
    "Galleon": { name: "", desc: "Inflige 2 fois 160% de la puissance d'attaque en dégâts critiques dans un cône de 3m devant soi.\nInflige des dégâts supplémentaires aux cibles en état d'Empoisonnement.", cd: 2, buffs: ["dmg_poisoned_20"], atk_pct: 160, hits: 2, aoe: true },
    "Vanessa": { name: "", desc: "Inflige 2 fois 60% de la puissance d'attaque en dégâts critiques dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["atk_20_melee"], atk_pct: 60, hits: 2, aoe: true },
    "Grogen": { name: "", desc: "Inflige 3 fois 110% de la puissance d'attaque en dégâts critiques dans une zone de 2m de large et de 7m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation du taux de Coups puissants de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crush_rate_team_range"], atk_pct: 110, hits: 3, aoe: true },
    "Shihwa": { name: "", desc: "Inflige 440% de la puissance d'attaque en dégâts critiques à la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crit_dmg_team_20_range"], atk_pct: 440 },
    "Chasun": { name: "", desc: "Inflige 260% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation de l'esquive de 20% pendant 2 sec.", cd: 2, buffs: ["dodge_rate_20"], atk_pct: 260, aoe: true },
    "Mei Hou Wang": { name: "", desc: "Inflige 210% de la puissance d'attaque en dégâts critiques dans un cône de 3m devant soi.\nInflige des dégâts supplémentaires aux cibles en état de Gel.", cd: 2, buffs: ["dmg_frozen_50"], atk_pct: 210, aoe: true },
    "Alicia": { name: "", desc: "Inflige 110% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nInflige des dégâts supplémentaires aux cibles en état de Gel.", cd: 2, buffs: ["dmg_frozen_50"], atk_pct: 110, aoe: true },
    "Ariel": { name: "", desc: "Inflige 560% de la puissance d'attaque en dégâts critiques à la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la puissance d'attaque de 20% pendant 2 sec.", cd: 2, buffs: ["atk_nerf_20"], atk_pct: 560 },
    "Verdehile": { name: "", desc: "Inflige 260% de la puissance d'attaque en dégâts critiques à la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Saignement pendant 2 sec.", cd: 2, buffs: ["dot_bleed"], atk_pct: 260 },
    "Delphoi": { name: "", desc: "Inflige 210% de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crush_dmg_20_range"], atk_pct: 210, aoe: true },
    "Celestia": { name: "", desc: "Inflige 180% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet Immunité aux altérations d'état pendant 2 sec.", cd: 2, buffs: ["cc_immune_self"], atk_pct: 180, aoe: true },
    "Tetra": { name: "", desc: "Inflige 600% de la puissance d'attaque en dégâts critiques à la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de l'esquive de 20% pendant 2 sec.", cd: 2, buffs: ["dodge_nerf_20"], atk_pct: 600 },
    "Feng Yan": { name: "", desc: "Inflige 120% de la puissance d'attaque en dégâts critiques dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution du taux critique de 20% pendant 2 sec.", cd: 2, buffs: ["crit_rate_nerf_20"], atk_pct: 120, aoe: true },
    "Lapis": { name: "", desc: "Inflige 80% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation du taux critique de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["crit_rate_team_20_melee"], atk_pct: 80, aoe: true },
    "Lushen": { name: "", desc: "Inflige 160% de la puissance d'attaque en dégâts critiques dans un rayon de 3m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation du taux de Coups affaiblis de 20% pendant 2 sec. (Effet cumulable)", cd: 2, buffs: ["weak_hit_rate_20_melee"], atk_pct: 160, aoe: true },
    "Raki": { name: "", desc: "Inflige 2 fois 290% de la puissance d'attaque en dégâts critiques dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 2 sec. (Effet cumulable)\nInflige des dégâts supplémentaires proportionnels au nombre d'effets d'altération d'état sur la cible. (Max 5)", cd: 2, buffs: ["dmg_20_melee", "dmg_cc_state_scaling"], atk_pct: 290, hits: 2, aoe: true },

    "Tilasha": { name: "", desc: "Inflige 880 % de la puissance d'attaque en dégâts critiques dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, attribue l'effet de renforcement\nAugmentation des dégâts de coup puissants de 20% aux alliés de type à distance pendant 2 sec. (Effet cumulable)\nEn cas d'attaque réussie, attribue l'effet d'affaiblissement\nDiminution de la précision niv.5 pendant 2 sec.", cd: 2, buffs: ["crush_dmg_20_range", "accuracy_nerf_5"], atk_pct: 880, aoe: true },
};

const EXCLUSIVE_SKILLS = {
    "YeonHong": { name: "Amuser", desc: "Inflige 1 340% de la puissance d'attaque en dégâts à la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Une équipe, un esprit pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["one_team_one_spirit"], atk_pct: 1340, hits: 3 },
    "Iris": { name: "Épée de la Lumière", desc: "Inflige 3 fois 1 200% de la puissance d'attaque en dégâts à la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie sur une cible en état d'immunité, confère aux alliés l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 1 sec. (Effet cumulable)", cd: 10, buffs: ["crush_dmg_20_team", "crush_dmg_20_team_cond"], atk_pct: 1200, hits: 3 },
    "Juno": { name: "Perte de la cause et de l'effet", desc: "Inflige 5 fois 320% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Amplification de 60% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["amplify_60_team"], atk_pct: 320, hits: 5, aoe: true },
    "Mago": { name: "Lueur de lune déclinante", desc: "Inflige 2 fois 350% de la puissance d'attaque en dégâts dans une zone de 4m de large et de 15m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés de type Mêlée l'effet de renforcement Accélération des compétences de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Furtivité pendant 3 sec.", cd: 10, buffs: ["skill_accel_20_melee", "stealth"], atk_pct: 350, hits: 2, aoe: true },
    "Jagger": { name: "Pouvoir du dragon", desc: "Inflige 770% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation du taux de Coups puissants de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["crush_rate_team_20"], atk_pct: 770, aoe: true },
    "Josephine": { name: "Protection divine", desc: "Inflige 860% de la puissance d'attaque en dégâts critiques dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de Bouclier Protection pendant 10 sec.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la résistance aux dégâts de 20% pendant 10 sec.", cd: 10, buffs: ["shield_25", "dmg_resist_20_team"], atk_pct: 860, aoe: true },
    "Anavel": { name: "Popstar", desc: "Inflige 2 fois 480% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Congélation pendant 10 sec.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la vitesse de déplacement de 20% pendant 10 sec.", cd: 10, buffs: ["congelation_dot", "move_spd_20_team"], atk_pct: 480, hits: 2, aoe: true },
    "Trinity": { name: "Ragnarök", desc: "Inflige 840% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation du taux critique de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la vitesse d'attaque de 10% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["crit_rate_team_20", "atk_spd_nerf_10"], atk_pct: 840, aoe: true },
    "Belle": { name: "Sur scène", desc: "Inflige 2 fois 650% de la puissance d'attaque en dégâts dans un rayon de 3m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts infligés de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, confère aux alliés l'effet Rock'n'roll pendant 10 sec.", cd: 10, buffs: ["dmg_team_20", "rocknroll"], atk_pct: 650, hits: 2, aoe: true },
    "Artamiel": { name: "Lames du justicier", desc: "Inflige 750% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la résistance de 20% pendant 10 sec.", cd: 10, buffs: ["resist_nerf_20"], atk_pct: 750, aoe: true },
    "Theomars": { name: "Zéro absolu", desc: "Inflige 3 fois 470% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Archidémon du Grand Froid pendant 10 sec.", cd: 10, buffs: ["grand_froid_cumul", "grand_froid_stack", "trace_de_givre"], atk_pct: 470, hits: 3, aoe: true },
    "Sekhmet": { name: "Fièvre", desc: "Inflige 2 fois 630% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts de zone de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["dmg_aoe_team_20"], atk_pct: 630, hits: 2, aoe: true },
    "Harmonia": { name: "Champ du repos", desc: "Inflige 2 fois 390% de la puissance d'attaque en dégâts dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["atk_team_20"], atk_pct: 390, hits: 2, aoe: true },
    "Barbara": { name: "Début d'assaut", desc: "Inflige 2 fois 460% de la puissance d'attaque en dégâts dans une zone de 2m de large et de 10m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la précision de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation du taux de Coup triple de 10% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["accuracy_20_team", "triple_hit_10"], atk_pct: 460, hits: 2, aoe: true },
    "Jeanne": { name: "Prière de protection", desc: "Inflige 330% de la puissance d'attaque en dégâts dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["spd_team_20"], atk_pct: 330, aoe: true },
    "Craka": { name: "Déchiquetage", desc: "Inflige 2 fois 430% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Saignement pendant 10 sec.", cd: 10, buffs: ["dot_bleed"], atk_pct: 430, hits: 2, aoe: true },
    "Dusky": { name: "Terreur de la nuit", desc: "Inflige 910% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de contrôle Peur pendant 2.5 sec.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Flammes ténébreuses pendant 2 sec.", cd: 10, buffs: ["fear_25", "dot_dark_flame"], atk_pct: 910, aoe: true },
    "Elenoa": { name: "Ordre brutal", desc: "Inflige 3 fois 310% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Maladie d'amour pendant 10 sec.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Accélération des compétences de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["dot_love_disease", "skill_accel_20_range"], atk_pct: 310, hits: 3, aoe: true },
    "Soha": { name: "Pluie de renard", desc: "Inflige 2 fois 630% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nÀ chaque attaque réussie, confère à un allié de type Distance l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["spd_20_range"], atk_pct: 630, hits: 2, aoe: true },
    "Frigate": { name: "Approchez donc !", desc: "Inflige 3 fois 350% de la puissance d'attaque en dégâts dans une zone de 2m de large et de 8m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, attribue à la cible l'effet d'altération d'état Provocation pendant 10 sec.", cd: 10, buffs: ["crit_dmg_team_20", "provoke_status"], atk_pct: 350, hits: 3, aoe: true },
    "Laima": { name: "Verrouillage", desc: "Inflige 2 fois 310% de la puissance d'attaque en dégâts dans un rayon de 4m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'altération d'état Entrave pendant 3 sec.\nEn cas d'attaque réussie, attribue à la cible l'effet d'altération d'état Aveuglement pendant 5 sec.", cd: 10, buffs: ["entrave", "blindness"], atk_pct: 310, hits: 2, aoe: true },
    "Brandia": { name: "Toucher de clémence", desc: "Inflige 640% de la puissance d'attaque en dégâts dans un rayon de 4m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["crit_dmg_team_20"], atk_pct: 640, aoe: true },
    "Katarina": { name: "Epée de la promesse", desc: "Inflige 2 fois 790% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, attribue à la cible l'effet Détection de bouclier pendant 10 sec.", cd: 10, buffs: ["crush_dmg_20_team", "block_shield"], atk_pct: 790, hits: 2, aoe: true },
    "Tsuyuha": { name: "Charme d'illusion", desc: "Inflige 3 fois 300% de la puissance d'attaque en dégâts dans une zone de 3m de large et de 7m de long devant soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 10 sec. (Effet cumulable)\nAttribue en supplément l'effet d'affaiblissement Diminution de la défense de 20% aux cibles sous contrôle pendant 10 sec.", cd: 10, buffs: ["crush_dmg_20_team", "def_nerf_20_cond"], atk_pct: 300, hits: 3, aoe: true },
    "Fran": { name: "Toucher purifiant", desc: "Inflige 1 580% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, supprime les effets négatifs des alliés.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["strip_debuff_team", "atk_team_20"], atk_pct: 1580, aoe: true },
    "Sabrina": { name: "Boomerang turbo", desc: "Inflige 3 fois 280% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation du taux de Coups doubles de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["double_hit_team_20"], atk_pct: 280, hits: 3, aoe: true },
    "Seimei": { name: "Yin-Yang et les cinq éléments", desc: "Inflige 7 fois 200% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts des Coups puissants de 20% pendant 10 sec. (Effet cumulable)\nChaque attaque applique à la cible un cumul d'Énergie Yin d'une durée de 20 sec. Lorsque l'Énergie Yin atteint 10 cumuls, tous les cumuls sont consommés : l'immunité de la cible est dissipée et l'effet d'affaiblissement Diminution de la résistance aux dégâts de 30% est appliqué pendant 4 sec. (Effet cumulable)", cd: 10, buffs: ["crush_dmg_20_team", "strip_immunity", "resist_nerf_30"], atk_pct: 200, hits: 7, aoe: true },
    "Zeta-06": { name: "Service neurologique", desc: "Inflige 960% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés 1 cumul de l'effet Augmentation des dégâts des Coups puissants de 10% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["crush_dmg_10"], atk_pct: 960, aoe: true },
    "Shazam": { name: "Conjuration de la lumière", desc: "Inflige 3 fois 350% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Saignement profond pendant 10 sec.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["dot_deep_bleed", "spd_20_range"], atk_pct: 350, hits: 3, aoe: true },
    "Melissa": { name: "Taillade du croissant de lune", desc: "Inflige 1 050% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'altération d'état Étourdissement pendant 3 sec.\nEn cas d'attaque réussie, confère aux alliés un effet de Bouclier proportionnel à 30% des PV max pendant 5 sec.", cd: 10, buffs: ["stun", "shield_30_pvmax"], atk_pct: 1050, aoe: true },
    "Zeratu": { name: "Puissance interdite", desc: "Inflige 840% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["spd_team_20"], atk_pct: 840, aoe: true },
    "Astar": { name: "Epée de flammes", desc: "Inflige 3 fois 390% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la défense de 20% pendant 10 sec.\nÀ chaque coup porté, obtient un cumul de Happy Box pendant 20 sec. Lorsque Happy Box atteint 5 cumuls, tous les cumuls sont consommés pour conférer aux alliés, pendant 4 sec, les effets de renforcement Augmentation du taux critique de 10%, Augmentation des dégâts critiques de 10% et Augmentation de la précision de 10%. (Effet cumulable)", cd: 10, buffs: ["def_nerf_20", "happy_box_burst"], atk_pct: 390, hits: 3, aoe: true },
    "Qitian Dasheng": { name: "Filet géant", desc: "Inflige 240% de la puissance d'attaque en dégâts dans un rayon de 4m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la défense de 20% pendant 10 sec.", cd: 10, buffs: ["def_nerf_20"], atk_pct: 240, aoe: true },
    "Cassandra": { name: "Coup précis", desc: "Inflige 1 140% de la puissance d'attaque en dégâts à la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation du taux critique de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["crit_rate_team_20"], atk_pct: 1140 },
    "Rina": { name: "Bouclier magique", desc: "Inflige 2 fois 150% de la puissance d'attaque en dégâts dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Augmentation de la puissance d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["atk_20_range"], atk_pct: 150, hits: 2, aoe: true },
    "Ophilia": { name: "Flamme sacrée", desc: "Inflige 290% de la puissance d'attaque en dégâts dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la défense de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["def_team_20"], atk_pct: 290, aoe: true },
    "Tesarion": { name: "Frappe ardente", desc: "Inflige 3 fois 210% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de dégâts continus Brûlure pendant 10 sec.", cd: 10, buffs: ["dot_burn"], atk_pct: 210, hits: 3, aoe: true },
    "Charlotte": { name: "Ange-gardien", desc: "Inflige 320% de la puissance d'attaque en dégâts dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, confère aux alliés de type Distance l'effet de renforcement Accélération des compétences de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["skill_accel_20_range"], atk_pct: 320, aoe: true },
    "Galleon": { name: "Frappe de pirate", desc: "Inflige 3 fois 230% de la puissance d'attaque en dégâts dans un rayon de 1m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 10 sec.", cd: 10, buffs: ["crit_dmg_20"], atk_pct: 230, hits: 3, aoe: true },
    "Vanessa": { name: "Retour du guerrier", desc: "Inflige 300% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet Immunité aux affaiblissements pendant 2.5 sec.", cd: 10, buffs: ["debuff_immune"], atk_pct: 300, aoe: true },
    "Grogen": { name: "Orage ténébreux", desc: "Inflige 410% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de contrôle Pétrification pendant 2.5 sec.", cd: 10, buffs: ["petrify"], atk_pct: 410, aoe: true },
    "Shihwa": { name: "Feux du renard", desc: "Inflige 260% de la puissance d'attaque en dégâts dans un rayon de 4m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet d'affaiblissement Diminution de la vitesse de déplacement de 100% pendant 10 sec.", cd: 10, buffs: ["spd_nerf_100"], atk_pct: 260, aoe: true },
    "Chasun": { name: "Bourgeons tombés", desc: "Inflige 3 fois 360% de la puissance d'attaque en dégâts à la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet Récupération continue pendant 5 sec.", cd: 10, buffs: ["regen_team"], atk_pct: 360, hits: 3 },
    "Mei Hou Wang": { name: "Bâton de singe flamboyant", desc: "Inflige 280% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation du taux de Coups puissants de 20% pendant 10 sec.", cd: 10, buffs: ["crush_rate_20"], atk_pct: 280, aoe: true },
    "Alicia": { name: "Gel précipité", desc: "Inflige 3 fois 90% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet de contrôle Gel pendant 2.5 sec.", cd: 10, buffs: ["freeze"], atk_pct: 90, hits: 3, aoe: true },
    "Ariel": { name: "Bénédiction de l'Archange", desc: "Inflige 420% de la puissance d'attaque en dégâts dans un rayon de 2m autour de la cible.\nEn cas d'attaque réussie, confère aux alliés l'effet de Bouclier Protection de 50% des PV max pendant 5 sec.", cd: 10, buffs: ["protection_shield_team"], atk_pct: 420, aoe: true },
    "Verdehile": { name: "Chauve-souris vampire", desc: "Inflige 350% de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec.", cd: 10, buffs: ["spd_20"], atk_pct: 350, aoe: true },
    "Delphoi": { name: "Protection des esprits", desc: "Inflige 290% de la puissance d'attaque en dégâts dans un rayon de 5m autour de soi.\nEn cas d'attaque réussie, attribue à la cible l'effet de contrôle Sommeil pendant 2.5 sec.", cd: 10, buffs: ["sleep"], atk_pct: 290, aoe: true },
    "Celestia": { name: "Bénédiction de la fée", desc: "Inflige 160% de la puissance d'attaque en dégâts dans un rayon de 7m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la précision de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["accuracy_20_team"], atk_pct: 160, aoe: true },
    "Tetra": { name: "Chant des sirènes", desc: "Inflige 790% de la puissance d'attaque en dégâts dans un rayon de 1m autour de la cible.\nEn cas d'attaque réussie, attribue à la cible l'effet Blocage de récupération pendant 10 sec.", cd: 10, buffs: ["block_heal"], atk_pct: 790, aoe: true },
    "Feng Yan": { name: "Vents et nuages", desc: "Inflige 210% de la puissance d'attaque en dégâts dans un rayon de 4m autour de la cible.\nEn cas d'attaque réussie, confère à soi-même l'effet Immunité aux contrôles pendant 10 sec.", cd: 10, buffs: ["cc_immune_self"], atk_pct: 210, aoe: true },
    "Lapis": { name: "Récupération de magie", desc: "Inflige 3 fois 130% de la puissance d'attaque en dégâts dans un rayon de 3m autour de soi.\nEn cas d'attaque réussie, confère à soi-même l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec.", cd: 10, buffs: ["spd_20"], atk_pct: 130, hits: 3, aoe: true },
    "Lushen": { name: "Magie d'amputation", desc: "Inflige 350% de la puissance d'attaque en dégâts dans un rayon de 4m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation de la vitesse d'attaque de 20% pendant 10 sec. (Effet cumulable)", cd: 10, buffs: ["spd_team_20"], atk_pct: 350, aoe: true },
    "Raki": { name: "Capture", desc: "Inflige 2 fois 390% de la puissance d'attaque en dégâts dans un rayon de 6m autour de soi.\nEn cas d'attaque réussie, confère aux alliés l'effet de renforcement Augmentation des dégâts critiques de 20% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, attribue à la cible l'effet d'altération d'état Entrave pendant 5 sec.", cd: 10, buffs: ["crit_dmg_team_20", "entrave"], atk_pct: 390, hits: 2, aoe: true },
    "Tilasha": { name: "", desc: "Inflige 1 420 % de la puissance d'attaque en dégâts dans un rayon de 3m autour de la cible.\nEn cas d'attaque réussie, attribue l'effet d'affaiblissement Chaîne de malédictions pendant 10 sec. (Effet cumulable)\nInflige des dégâts supplémentaires proportionnels au nombre d'effets d'affaiblissement sur la cible. (Jusqu'à 15 max)", cd: 10, buffs: ["curse_chain_stack", "dmg_debuff_scaling"], atk_pct: 1420, aoe: true },
};
const MONSTERS = {
    "Craka": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- ATQ +10%.\n- Résist. LP -30%.\n- Chaque Saignement → allié : Détection point faible 10% / 10s.", buffs: ["atk_10", "res_lp_30", "bleed", "weak_point_detect"], pvp: true, pve: false }, { level: 7, desc: "Attaque réussie :\n- Point faible – Saignement 15% sur ennemi.\n- Dégâts +20%.", buffs: ["weakness_element", "dmg_20"], pvp: true, pve: false }] },
    "Mago": { type: "melee", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- Esquive absolue 3s.\n- ATQ +10%.\n- Sous Furtivité : Coup puissant +10% / 3s.", buffs: ["dodge_3s", "crush_rate_10_cond", "spd_10"], pvp: true, pve: true }, { level: 7, desc: "Sous Furtivité :\n- Dégâts +150% / 3s.\n- Attaque réussie : Dég. Coups puissants +20% / 10s.\n- Dégâts +20%.", buffs: ["dmg_150", "crush_dmg_20", "dmg_20"], pvp: true, pve: true }] },
    "Jagger": { type: "melee", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- Bouclier invincible + Vit. déplacement +200% / 3s.\n- ATQ +10%, DEF +15%, Résist. LP -30%.", buffs: ["stealth_shield", "move_spd_200", "atk_10", "res_lp_30", "def_10"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dég. Crit +20% / 10s.\n- Dégâts / nb buffs actifs (max 30).\n- Dégâts +20%.", buffs: ["crit_dmg_20", "dmg_buff_scaling", "dmg_20", "dmg_resist_20_cond"], pvp: true, pve: true }] },
    "Trinity": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Bouclier ×5 + Dég. Crit +20%.\n- Coup puissant → Dégâts zone reçus +10% sur ennemi / 2s.", buffs: ["shield_hits_5", "crit_dmg_20", "debuff_aoe_taken_10"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dég. Crit reçus +10% sur ennemi / 10s.\n- Dégâts / nb debuffs cible (max 15).\n- Dégâts +20%.", buffs: ["debuff_crit_taken_10", "dmg_debuff_scaling", "dmg_20"], pvp: true, pve: true }] },
    "Melissa": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Vit. ATQ +15%.\n- Bouclier ×5.", buffs: ["spd_15", "shield_hits_5"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Coup double +15% / 10s.\n- Dégâts +20%.", buffs: ["double_hit_15", "dmg_20"], pvp: true, pve: true }] },
    "Artamiel": { type: "melee", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- ATQ +10% immédiat.\n- Après 10s : ATQ +25% supplémentaires / 10s.", buffs: ["atk_10", "atk_25_delay", "atk_40", "crush_dmg_20"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Résist. dégâts +80% / 2s.\n- Dégâts +20%.", buffs: ["dmg_resist_80_cond", "dmg_20"], pvp: true, pve: true }] },
    "Tsuyuha": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup létal : Endurance 3s (CD : 30s).\n- Coup puissant +10%.\n- Sur coup puissant : Réduit CD compétence excl. -10% (1×/2s).", buffs: ["endurance_cond", "crush_rate_10", "cd_skill_cond"], pvp: true, pve: true }, { level: 7, desc: "Si cible subit -DEF : Reset CD compétence excl.\n- Coup puissant +10% / 5s.\n- Dégâts +20%.", buffs: ["cd_reset_proc", "crush_rate_10", "dmg_20"], pvp: true, pve: true }] },
    "Barbara": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Esquive absolue + Giclée / 3s.\n- Taux Crit +10%.", buffs: ["dodge_3s", "crit_rate_10"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Supprime boucliers ennemis.\n- Vit. ATQ +40% / 1s.\n- Dégâts +20%.", buffs: ["strip_shield", "spd_40_cond", "dmg_20"], pvp: true, pve: true }] },
    "Zeratu": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Coup puissant +10%.\n- Vit. ATQ +30% / 15s.", buffs: ["crush_rate_10", "spd_30"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Reset CD attaques critiques / 4s.\n- Dégâts +20%.", buffs: ["no_crit_cd", "dmg_20"], pvp: true, pve: true }] },
    "Astar": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Résist. LP -30% et Vit. ATQ +10%.\n- Sur coup puissant : Charge 1 Happy Box / 20s.", buffs: ["res_lp_30", "spd_10", "happy_box_cond"], pvp: true, pve: true }, { level: 7, desc: "À chaque coup : Charge 1 Merry Box.\nÀ 5 stacks → ALLIÉS : ATQ+10%, CP+10%, Dég. CP+10% / 4s.\n- Dégâts +20%.", buffs: ["merry_box_team_cond", "happy_box_cond", "dmg_20"], pvp: true, pve: true }] },
    "Belle": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Rockstar I (passif permanente).\n- Bouclier invincible 3s.", buffs: ["rockstar_i", "stealth_shield"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Vit. ATQ ALLIÉS +20% / 2s.\n- Rockstar III / 2s.\n- Dégâts +20%.", buffs: ["spd_team_20", "rockstar_iii_cond", "dmg_20"], pvp: true, pve: true }] },
    "Jeanne": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Bouclier invincible 5s.\n- Taux Crit +50% / 5s.", buffs: ["stealth_shield", "crit_rate_50"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dég. Crit +20% / 2s.\n- Dégâts +20%.", buffs: ["crit_dmg_20", "dmg_20"], pvp: true, pve: true }] },
    "Vanessa": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Accél. compétences +20% / 2s.", buffs: ["skill_accel_20_cond"], pvp: true, pve: true }, { level: 7, desc: "Dégâts +50% sur cibles Étourdies.\n- Dégâts +20%.", buffs: ["dmg_stunned_50", "dmg_20"], pvp: false, pve: true }] },
    "Feng Yan": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Résist. Critique +10% / 2s.", buffs: ["crit_res_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Taux Crit +10% / 10s.\n- Dégâts +20%.", buffs: ["crit_rate_10", "dmg_20"], pvp: true, pve: true }] },
    "Qitian Dasheng": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur CC reçu :\n- Supprime les CCs, Immunité CC 2s.\n- Reset CD compétence exclusive.", buffs: ["cc_immune_self_react", "cd_reset_proc"], pvp: true, pve: true }, { level: 7, desc: "Dégâts +50% sur cibles sous DEF réduite.\n- Dégâts +20%.", buffs: ["dmg_def_down_50", "dmg_20"], pvp: true, pve: true }] },
    "Mei Hou Wang": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Taux Crit +10% / 2s.", buffs: ["crit_rate_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Dégâts +50% sur cibles sous contrôle.\n- Dégâts +20%.", buffs: ["dmg_cc_50", "dmg_20"], pvp: true, pve: true }] },
    "Lapis": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Aspiration dégâts +15% / 2s.", buffs: ["lifesteal_15_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Coup double +10% / 2s.\n- Dégâts +20%.", buffs: ["double_hit_10_cond", "dmg_20"], pvp: true, pve: true }] },
    "Galleon": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Taux Crit +10% / 2s.", buffs: ["crit_rate_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Dégâts +50% sur cibles sous DoT.\n- Dégâts +20%.", buffs: ["dmg_dot_50", "dmg_20"], pvp: false, pve: true }] },
    "Ophilia": { type: "melee", awakenings: [AWK3, { level: 5, desc: "Sur coup létal :\n- Endurance 5s (CD : 30s).", buffs: ["endurance_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Résist. dégâts +15% / 10s.\n- Dégâts +20%.", buffs: ["dmg_resist_15_cond", "dmg_20"], pvp: true, pve: true }] },
    "Shazam": { type: "tank", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Bouclier ×3 à tous les ALLIÉS.\n- Résist. dégâts +10%.", buffs: ["shield_hits_3_team", "dmg_resist_10"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dég. Crit reçus +10% sur ennemi / 10s.\n- Dégâts +20%.", buffs: ["debuff_crit_taken_10", "dmg_20"], pvp: true, pve: true }] },
    "Ariel": { type: "tank", awakenings: [AWK3, { level: 5, desc: "Sur obtention de Bouclier :\n- Résist. dégâts +20% / 5s.", buffs: ["dmg_resist_20_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- PV MAX +15% / 10s.\n- Dégâts +20%.", buffs: ["hp_max_15_cond", "dmg_20"], pvp: true, pve: true }] },
    "Grogen": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Accél. compétences +20% / 2s.", buffs: ["skill_accel_20_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Efficacité CC +20% et Dégâts sur Pétrifiés +20% / 10s.\n- Dégâts +20%.", buffs: ["cc_eff_20", "dmg_petrified_20", "dmg_20"], pvp: true, pve: true }] },
    "Sabrina": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Vit. ATQ +15%.", buffs: ["range_3", "spd_15"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Coup triple +10% / 10s.\n- Dégâts +20%.", buffs: ["triple_hit_10", "dmg_20"], pvp: true, pve: true }] },
    "Theomars": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3.\n- Par effet cumulable sur ennemi : Dég. Crit +10% / 20s.", buffs: ["range_3", "crit_dmg_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie → ALLIÉS :\n- Faiblesse Congélation / 10s.\n- Coup puissant +10% / 10s.\n- Dégâts +20%.", buffs: ["weakness_elem_team", "crush_rate_10_team", "dmg_20"], pvp: true, pve: true }] },
    "Laima": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Accél. compétences +15%.", buffs: ["range_3", "skill_accel_15"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Taux Crit +10% et Dég. Crit +20% / 5s.\n- Dégâts +20%.", buffs: ["crit_rate_10", "crit_dmg_20", "dmg_20"], pvp: true, pve: true }] },
    "Anavel": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Taux Crit +10%.", buffs: ["range_3", "crit_rate_10"], pvp: true, pve: true }, { level: 7, desc: "Portée +3 (total +6) et Taux Crit +10%.\nAttaque réussie → ALLIÉS : Faiblesse Congélation / 10s.\n- Dégâts +20%.", buffs: ["range_3", "crit_rate_10", "weakness_elem_team", "dmg_20"], pvp: true, pve: true }] },
    "Soha": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Dég. Crit +20%.\n- Sur coup puissant : Charge 1 Feu du renard.", buffs: ["range_3", "crit_dmg_20", "fox_fire_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Coup puissant +10% / 10s.\n- À 20 charges → compétence critique ×2.\n- Dégâts +20%.", buffs: ["crush_rate_10", "fox_fire_burst", "dmg_20"], pvp: true, pve: true }] },
    "Brandia": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Coup puissant +10%.", buffs: ["range_3", "crush_rate_10"], pvp: true, pve: true }, { level: 7, desc: "Dégâts supplémentaires aux cibles uniques.\n- Dég. Coups puissants +20% / 10s.\n- Dégâts +20%.", buffs: ["dmg_unique_target", "crush_dmg_20", "dmg_20"], pvp: true, pve: true }] },
    "Dusky": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Coup double +10%.\n- Sur Brûlure → allié : Détection point faible / 10s.", buffs: ["range_3", "double_hit_10", "weak_point_detect"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Faiblesse aux brûlures sur ennemi / 10s.\n- Dégâts +20%.", buffs: ["weakness_element", "dmg_20"], pvp: true, pve: true }] },
    "Elenoa": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Taux Crit +10%.", buffs: ["range_3", "crit_rate_10", "weak_point_detect"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Faiblesse empoisonnement sur ennemi / 10s.\n- Dégâts +20%.", buffs: ["weakness_element", "dmg_20"], pvp: true, pve: true }] },
    "Seimei": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Accél. compétences +15%.", buffs: ["range_3", "skill_accel_15"], pvp: true, pve: true }, { level: 7, desc: "Par attaque : Charge 1 Énergie Yang / 20s.\nÀ 10 stacks → ATQ +100% / 4s.\n- Dégâts +20%.", buffs: ["atk_100", "dmg_20"], pvp: true, pve: true }] },
    "Sekhmet": { type: "range", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- Portée +3 et Rayon Zone +30%.", buffs: ["range_3", "aoe_range_30"], pvp: false, pve: true }, { level: 7, desc: "Attaque réussie :\n- Accél. compétences +15% / 10s.\n- Dégâts ×ennemis (max ×10).\n- Dégâts +20%.", buffs: ["skill_accel_15", "dmg_aoe_30", "dmg_20"], pvp: false, pve: true }] },
    "Zeta-06": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Accél. compétences +15%.", buffs: ["range_3", "skill_accel_15"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dég. Coups puissants +20%.\n- Dégâts +20%.", buffs: ["crush_dmg_20", "dmg_20"], pvp: true, pve: true }] },
    "Alicia": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Dégâts +50% (cibles Gelées).", buffs: ["dmg_frozen_50"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Efficacité CC +20% / 10s.\n- Dégâts +20%.", buffs: ["cc_eff_20", "dmg_20"], pvp: true, pve: true }] },
    "Cassandra": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +5.", buffs: ["range_5"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Vit. ATQ +15% / 10s.\n- Dégâts +20%.", buffs: ["spd_15_cond", "dmg_20"], pvp: true, pve: true }] },
    "Shihwa": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Accél. compétences +20% / 2s.", buffs: ["skill_accel_20_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Taux Crit +10% / 10s.\n- Dégâts +20%.", buffs: ["crit_rate_10", "dmg_20"], pvp: true, pve: true }] },
    "Lushen": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Taux Crit +10% / 2s.", buffs: ["crit_rate_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dégâts +20% (cibles Empoisonnées) / 10s.\n- Dégâts +20%.", buffs: ["dmg_poisoned_20", "dmg_20"], pvp: false, pve: true }] },
    "Verdehile": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Aspiration dégâts +15% / 2s.", buffs: ["lifesteal_15_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dégâts +20% (cibles Saignement) / 10s.\n- Dégâts +20%.", buffs: ["dmg_bleed_20", "dmg_20"], pvp: true, pve: true }] },
    "Tesarion": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Rayon Zone +30%.", buffs: ["aoe_range_30"], pvp: false, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dégâts +20% (cibles Brûlées) / 10s.\n- Dégâts +20%.", buffs: ["dmg_burned_20", "dmg_20"], pvp: false, pve: true }] },
    "Charlotte": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Faiblesse Empoisonnement sur ennemi / 2s.", buffs: ["weakness_poison_enemy"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Empoisonnement sur ennemi / 10s.\n- Dégâts +20%.", buffs: ["dot_poison", "dmg_20"], pvp: true, pve: true }] },
    "Chasun": { type: "range", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Accél. compétences +20% / 2s.", buffs: ["skill_accel_20_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Taux Crit +10% / 10s.\n- Dégâts +20%.", buffs: ["crit_rate_10", "dmg_20"], pvp: true, pve: true }] },
    "Delphoi": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Dégâts +20% (cibles Endormies).", buffs: ["dmg_sleeping_20"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Efficacité CC +20% / 10s.\n- Dégâts +20%.", buffs: ["cc_eff_20", "dmg_20"], pvp: true, pve: true }] },
    "Harmonia": { type: "support", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Immunité CC ALLIÉS / 30s.", buffs: ["cc_immune_team_30"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Taux Crit +10% / 10s.\n- Résist. dégâts ALLIÉS +20% / 10s.\n- Dégâts +20%.", buffs: ["crit_rate_10", "dmg_resist_20_team", "dmg_20"], pvp: true, pve: true }] },
    "Rina": { type: "support", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Taux Crit +10% / 2s.", buffs: ["crit_rate_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Coup puissant +10% et ATQ +20% / 10s.\n- Dégâts +20%.", buffs: ["crush_rate_10", "atk_20", "dmg_20"], pvp: true, pve: true }] },
    "Tetra": { type: "support", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Taux Crit +10% / 2s.", buffs: ["crit_rate_10_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Coup puissant +10% / 10s.\n- Dégâts +20%.", buffs: ["crush_rate_10", "dmg_20"], pvp: true, pve: true }] },
    "Celestia": { type: "support", awakenings: [AWK3, { level: 5, desc: "Sur coup puissant :\n- Accél. compétences +20% / 2s.", buffs: ["skill_accel_20_cond"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Rayon Zone +30% / 10s.\n- Dégâts +20%.", buffs: ["aoe_range_30_cond", "dmg_20"], pvp: false, pve: true }] },
    "Fran": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3.\n- Accél. Compétences +15%.", buffs: ["range_3", "skill_accel_15"], pvp: true, pve: true }, { level: 7, desc: "- Bénédiction de Fran ALLIÉS (Immunité débuffs + Dégâts +15%, 10s).\n- Dégâts +20%.", buffs: ["fran_blessing_team", "dmg_20"], pvp: true, pve: true }] },
    "Katarina": { type: "range", awakenings: [AWK3, { level: 5, desc: "Début de combat :\n- Portée +3 et Taux Crit +10%.", buffs: ["range_3", "crit_rate_10"], pvp: true, pve: true }, { level: 7, desc: "Détection faiblesse :\n- Dégâts subis sous shield de 15% (cible) /10s.\n- Dégâts +20%.", buffs: ["block_shield", "dmg_20"], pvp: true, pve: true }] },
    "YeonHong": { type: "range", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Sur coup critique :\n- Augmente l'ATQ, les Dég. Crit, les Dég. Puissant, le Taux Crit et le Taux Puissant de 3% par cumul (jusqu'à 21%). / 5s\nDébut de combat :\n- Portée +3\n- Taux Crit +10%", buffs: ["teamwork_stack", "range_3", "crit_rate_10"], pvp: true, pve: true }, { level: 7, desc: "- Lorsque l'ATQ, les Dég. Crit, les Dég. Puissant, le Taux Crit et le Taux Puissant ont tous été augmentés de 40% ou plus par des effets de compétences, augmente les Dégâts infligés de 30%.\n- Dégâts +20%", buffs: ["perfect_team", "dmg_20"], pvp: true, pve: true }] },
    "Frigate": { type: "melee", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Sur coup reçu :\n- ATQ +1%/stack (max 100, 10s)\n- Accél. Comp. Exclusive +5% (restant)\n- Endurance anti-mort (coup létal) / 3s", buffs: ["atk_up_stack", "exclusive_cd_down", "endurance_cond"], pvp: true, pve: true }, { level: 7, desc: "Début de combat :\n- Bouclier = 50% des PV max\n- Dégâts +15% (cibles Provoquées)\n- Dégâts +20%", buffs: ["protection_shield", "target_weakness_provoke", "dmg_20"], pvp: true, pve: true }] },
    "Juno": { type: "range", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- Portée +3\n- Vit. ATQ +15%", buffs: ["range_3", "spd_15"], pvp: true, pve: true }, { level: 7, desc: "- Dégâts +20%\nAttaque réussie :\n- Dég. Coups Doubles/Triples +15% ALLIÉS\n- Pleine Floraison (Crits → Coups Multiples)", buffs: ["double_triple_dmg_team", "full_bloom", "dmg_20"], pvp: true, pve: true }] },
    "Iris": { type: "melee", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- ATQ +80%\n- ATQ -5%/ennemi (max -60%)", buffs: ["atk_80", "atk_down_ennemy_count"], pvp: true, pve: true }, { level: 7, desc: "- Dégâts +20%\nAttaque réussie :\n- Dégâts +30% (cible immunisée, Allié Aléatoire) / 10s", buffs: ["target_weakness_immunity", "dmg_20"], pvp: true, pve: true }] },
    "Josephine": { type: "tank", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Début de combat :\n- Dégâts reçus ≤ 10% HP max (7s)\n- Type Mêlée partagé\n- Accél. Compétences +15%", buffs: ["limit_shield", "class_share_melee", "skill_accel_15"], pvp: true, pve: true }, { level: 7, desc: "Attaque réussie :\n- Dégâts +15% / bouclier ennemi (max +45%)\n- Dégâts +20%", buffs: ["target_weakness_shield", "dmg_20"], pvp: true, pve: true }] },
    "Raki": { type: "melee", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Au début du combat, confère à soi-même pendant 3 sec l'effet de renforcement Esquive absolue.\nAu début du combat, s'octroie l'effet de renforcement Accélération de la compétence de 15%. (Suppression impossible, cumulable)\nÀ chaque fois qu'un effet d'entrave est appliqué, accorde à un allié l'effet de renforcement Détection de point faible – Entrave de 10 % pendant 10 sec. (Effet cumulable)", buffs: ["dodge_3s", "skill_accel_15", "weak_point_entrave2"], pvp: true, pve: false }, { level: 7, desc: "En cas d'attaque réussie, applique un effet d'Point faible – Entrave de 15% pendant 10 sec. (Effet cumulable)\nEn cas d'attaque réussie, attire à sa position tous les ennemis bénéficiant de l'effet Entrave.\nLes ennemis affectés par le cercle magique Chaînes infernales sont attirés, que l'attaque touche ou non.\nLes dégâts infligés par le monstre augmentent de 20%.\n(Suppression impossible, effet cumulable)", buffs: ["weak_point_entrave", "pull_target", "dmg_20"], pvp: true, pve: true }] },
    "Tilasha": { type: "range", awakenings: [{ level: 3, desc: "Réduit de 100% le temps de recharge de ses compétences au début du combat.", buffs: [], pvp: true, pve: true }, { level: 5, desc: "Augmentation de la portée de 3.\nDiminution temps de recharge cd exclusive, cd : 2 sec.", buffs: ["range_3", "cd_reset_exclu_2S"], pvp: true, pve: false }, { level: 7, desc: "Afflux de malice.\nA chaque débuff, gagne 5% atk par stack 10s.\nDégâts + 20%", buffs: ["atk_stack_debuff_count", "dmg_20"], pvp: true, pve: true }] },
};
const OFF_IDS = new Set(['atk_10', 'atk_20', 'atk_25_delay', 'atk_80', 'atk_100', 'atk_up_stack', 'dmg_15', 'dmg_20', 'dmg_150', 'dmg_aoe_scaling', 'dmg_buff_scaling', 'dmg_debuff_scaling', 'dmg_unique_target', 'dmg_frozen_50', 'dmg_stunned_50', 'dmg_def_down_50', 'dmg_cc_50', 'dmg_poisoned_20', 'dmg_bleed_20', 'dmg_burned_20', 'dmg_sleeping_20', 'dmg_dot_50', 'dmg_petrified_20', 'crit_rate_10', 'crit_rate_10_cond', 'crit_rate_50', 'crit_dmg_10_cond', 'crit_dmg_20', 'no_crit_cd', 'crush_rate_10', 'crush_rate_10_cond', 'crush_dmg_20', 'crush_dmg_20_ally', 'crush_rate_20_ally', 'double_hit_10', 'double_hit_15', 'double_hit_10_cond', 'triple_hit_10', 'spd_10', 'spd_15', 'spd_15_cond', 'spd_30', 'spd_40_cond', 'move_spd_200', 'skill_accel_15', 'skill_accel_20_cond', 'cd_reset_proc', 'cd_skill_cond', 'exclusive_cd_down', 'range_3', 'range_5', 'aoe_range_30', 'aoe_range_30_cond', 'cc_eff_20', 'stealth', 'strip_shield', 'bleed', 'dot_poison', 'weakness_poison_enemy', 'weakness_element', 'debuff_aoe_taken_10', 'debuff_crit_taken_10', 'block_shield', 'target_weakness_provoke', 'target_weakness_immunity', 'target_weakness_shield', 'atk_down_ennemy_count', 'bloom_stack', 'full_bloom', 'fox_fire_cond', 'fox_fire_burst', 'rockstar_i', 'rockstar_iii_cond', 'happy_box_cond', 'lifesteal_15_cond', 'provoke_status', 'dmg_down_provoked', 'weak_point_detect', 'weakness_elem_team']);
const DEF_IDS = new Set(['def_15', 'hp_max_15_cond', 'res_lp_30', 'dmg_resist_10', 'dmg_resist_15_cond', 'dmg_resist_20_cond', 'dmg_resist_20_team', 'dmg_resist_80_cond', 'shield_hits_3_team', 'shield_hits_5', 'stealth_shield', 'protection_shield', 'endurance_cond', 'dodge_3s', 'limit_shield', 'cc_immune_team_30', 'cc_immune_self_react', 'fran_blessing_team']);
const TEAM_IDS = new Set(['spd_team_20', 'shield_hits_3_team', 'dmg_resist_20_team', 'cc_immune_team_30', 'fran_blessing_team', 'merry_box_team_cond', 'crush_rate_10_team', 'weakness_elem_team', 'double_triple_dmg_team', 'teamwork_stack', 'one_team_one_spirit', 'perfect_team', 'limit_shield', 'class_share_melee', 'target_weakness_provoke', 'target_weakness_shield', 'weak_point_detect']);

const SW_FAQ_CATS = [
    { id: 'all', label: 'Tout', icon: '📋' },
    { id: 'score', label: 'Scores', icon: '🏆' },
    { id: 'tb', label: 'Team Builder', icon: '⚔' },
    { id: 'reco', label: 'Suggestions', icon: '💡' },
    { id: 'strat', label: 'Stratégies', icon: '⚡' },
    { id: 'me', label: 'Mes Éveils', icon: '⭐' },
];

const STRATEGIES = {
    balanced: {
        label: 'Équilibré', icon: '⚖',
        buffWeight: { off: 1.0, def: 1.0, team: 1.8 },
        typeRatio: { front: .35, range: .45, support: .20 },
    },
    offensive: {
        label: 'Offensif', icon: '⚔',
        buffWeight: { off: 1.8, def: 0.2, team: 1.2 },
        typeRatio: { front: .40, range: .50, support: .10 },
    },
    defensive: {
        label: 'Défensif', icon: '🛡',
        buffWeight: { off: 0.4, def: 2.0, team: 1.0 },
        typeRatio: { front: .45, range: .30, support: .25 },
    },
    team: {
        label: 'Team Buff', icon: '👥',
        buffWeight: { off: 0.8, def: 0.8, team: 2.2 },
        typeRatio: { front: .25, range: .45, support: .30 },
    },
    rush: {
        label: 'Full Rush', icon: '💥',
        buffWeight: { off: 2.5, def: 0.1, team: 0.5 },
        typeRatio: { front: .50, range: .50, support: .00 },
    },
    // Dual focus
    offteam: {
        label: 'Offensif + Team', icon: '⚔👥',
        buffWeight: { off: 1.6, def: 0.3, team: 1.6 },
        typeRatio: { front: .35, range: .45, support: .20 },
    },
    defteam: {
        label: 'Défensif + Team', icon: '🛡👥',
        buffWeight: { off: 0.3, def: 1.6, team: 1.6 },
        typeRatio: { front: .35, range: .35, support: .30 },
    },
    offdef: {
        label: 'Offensif + Défensif', icon: '⚔🛡',
        buffWeight: { off: 1.5, def: 1.5, team: 0.6 },
        typeRatio: { front: .45, range: .40, support: .15 },
    },
};
const VISIBLE_STRATEGIES = ['balanced', 'offensive', 'defensive'];
// --- Ajouts depuis indexx ---
const IP = './images/';
let teamStrategy = 'balanced';
const ALL_AWK_RAW = Object.values(MONSTERS).flatMap(m =>
    (m.awakenings || []).filter(a => a.level !== 3).map(a => (a.buffs || []).reduce((s, id) => s + bVal(id), 0))
);
const MAX_AW = Math.max(...ALL_AWK_RAW, 1);
const AWK3_PTS = 25;

function awkPts(a) {
    if (a.level === 3) return AWK3_PTS;
    const raw = (a.buffs || []).reduce((s, id) => s + bVal(id), 0);
    return Math.min(Math.round(raw / MAX_AW * 100), 100);
}

function totPts(m, nm) {
    const awkSum = Math.min(
        (m.awakenings || []).reduce((s, a) => s + awkPts(a), 0),
        MAX_AWK
    );
    const skSum = nm ? skillPts(nm) : 0;
    return Math.min(awkSum + skSum, MAX_T);
}

function sCol(r) { return r >= .68 ? 'var(--hi)' : r >= .38 ? 'var(--mid)' : 'var(--lo)' }

function allMonsterBuffIds(nm) {
    const m = MONSTERS[nm]; if (!m) return [];
    const awk = (m.awakenings || []).filter(a => a.level !== 3).flatMap(a => a.buffs || []);
    return [...new Set([...awk, ...skillBuffsRaw(nm)])];
}

function genTagline(nm) {
    const m = MONSTERS[nm]; if (!m) return 'Combattant polyvalent';
    const buffs = allMonsterBuffIds(nm);
    const has = id => buffs.includes(id);
    const any = ids => ids.some(id => has(id));
    const all = ids => ids.every(id => has(id));
    const type = m.type;

    // ── Mécaniques uniques / signatures ────────────────────────────────────────
    if (has('dmg_150')) return 'Explose sous Furtivité';
    if (any(['atk_80', 'atk_100'])) return 'Attaquant avec une attaque de base exceptionnelle';
    if (has('dmg_buff_scaling') && has('dmg_debuff_scaling')) return 'Punit les ennemis boostés ET affaiblis';
    if (has('dmg_buff_scaling')) return 'Plus il est buffé, plus ses dégâts explosent';
    if (has('dmg_debuff_scaling')) return "Détruit les ennemis chargés de debuffs";
    if (has('dmg_aoe_scaling')) return 'Dévaste les groupes — plus ils sont nombreux, plus il fait mal';
    if (any(['perfect_team', 'one_team_one_spirit'])) return "Récompense les équipes bien coordonnées";
    if (has('teamwork_stack')) return "Monte en puissance avec les buffs d'équipe";
    if (any(['full_bloom', 'bloom_stack'])) return 'Transforme chaque critique en avalanche de coups';
    if (has('double_triple_dmg_team') && any(['full_bloom', 'bloom_stack'])) return 'Expert des coups multiples critiques';
    if (any(['fox_fire_burst', 'fox_fire_cond'])) return 'Accumule des charges pour déchaîner la puissance du Feu du renard';
    if (any(['rockstar_i', 'rockstar_iii_cond'])) return 'Star du combat — les applaudissements décuplent sa force';
    if (any(['merry_box_team_cond', 'happy_box_burst'])) return "Offre des bonus d'équipe via ses coups puissants";
    if (any(['grand_froid_cumul', 'grand_froid_stack', 'archdemon_grand_froid'])) return 'Archidémon du Grand Froid — gèle et fracasse';
    if (has('atk_up_stack')) return 'Grandit en puissance à chaque coup reçu';
    if (has('atk_down_ennemy_count')) return 'Réduit la menace ennemie selon leur nombre';
    if (has('dmg_cc_state_scaling')) return 'Chaque altération ennemie amplifie ses dégâts';

    // ── CC / Contrôle ──────────────────────────────────────────────────────────
    if (has('cc_immune_team_30')) return "Bouclier anti-CC pour toute l'équipe";
    if (has('fran_blessing_team')) return 'Bénédiction de Fran — immunité et dégâts pour les alliés';
    if (has('cc_immune_self_react')) return 'Réagit instantanément aux CC pour les annuler';
    if (any(['freeze', 'stun']) && any(['dmg_frozen_50', 'dmg_stunned_50'])) return 'Gèle ou étourdit, puis frappe deux fois plus fort';
    if (has('freeze')) return 'Spécialiste du Gel';
    if (has('stun')) return 'Maître de l\'Étourdissement';
    if (has('sleep')) return 'Endort les ennemis au moment critique';
    if (has('petrify')) return 'Pétrifie ses cibles pour les rendre vulnérables';
    if (has('fear_25')) return 'Sème la Peur chez l\'ennemi';
    if (has('blindness') && has('entrave')) return 'Aveugle et entrave — immobilise le champ de bataille';
    if (has('entrave') && has('pull_target')) return 'Entrave et attire — personne ne lui échappe';
    if (has('entrave')) return 'Spécialiste de l\'Entrave';
    if (has('blindness')) return 'Aveugle ses ennemis pour les rendre inefficaces';
    if (has('provoke_status')) return "Provoque l'ennemi et l'empêche d'attaquer librement";
    if (has('block_heal')) return 'Bloque la récupération ennemie au moment décisif';
    if (has('strip_immunity')) return "Supprime l'immunité — aucun ennemi n'est intouchable";
    if (has('remove_buff_target') || any(['remove_buff_target', 'remove_buff_target_team'])) return 'Dispelle les renforcements ennemis';

    // ── Buffs dégâts conditionnels (cibles sous état) ─────────────────────────
    if (any(['dmg_frozen_50', 'dmg_stunned_50', 'dmg_cc_50'])) return 'Punit sévèrement les ennemis sous contrôle';
    if (any(['dmg_stunned_20', 'dmg_stunned_50'])) return 'Redouble de puissance face aux ennemis étourdis';
    if (any(['dmg_def_down_50'])) return 'Frappe doublement fort les ennemis sans défense';
    if (any(['dmg_dot_50', 'dmg_poisoned_20', 'dmg_bleed_20', 'dmg_burned_20', 'dmg_sleeping_20', 'dmg_petrified_20', 'dmg_blinded_20'])) {
        const states = [];
        if (any(['dmg_dot_50'])) states.push('DoT');
        if (any(['dmg_poisoned_20'])) states.push('empoisonnement');
        if (any(['dmg_bleed_20'])) states.push('saignement');
        if (any(['dmg_burned_20'])) states.push('brûlure');
        if (any(['dmg_sleeping_20'])) states.push('sommeil');
        if (any(['dmg_petrified_20'])) states.push('pétrification');
        if (any(['dmg_blinded_20'])) states.push('aveuglement');
        if (states.length >= 3) return 'Exploite toutes les altérations pour maximiser ses dégâts';
        if (states.length === 1) return `Inflige des dégâts accrus sur les cibles sous ${states[0]}`;
        return `Amplifie ses dégâts sur les cibles sous ${states[0]} ou ${states[1]}`;
    }
    if (has('dmg_melee_def_target')) return 'Spécialiste contre les types Mêlée et Défense';
    if (has('dmg_unique_target')) return 'Anéantit les cibles isolées';
    if (any(['dmg_100_immunity'])) return "Perce l'immunité pour infliger des dégâts doublés";
    if (any(['dmg_100_solotarget'])) return 'Écrase les cibles seules avec une puissance redoublée';

    // ── DoT / Dégâts continus ──────────────────────────────────────────────────
    if (any(['dot_dark_flame', 'dot_love_disease', 'dot_deep_bleed'])) {
        if (has('dot_dark_flame')) return 'Brûle ses ennemis avec les Flammes Ténébreuses';
        if (has('dot_love_disease')) return 'Propage la Maladie d\'Amour sur ses cibles';
        if (has('dot_deep_bleed')) return 'Inflige un Saignement Profond dévastateur';
    }
    if (has('dot_poison') && has('weakness_poison_enemy')) return 'Empoisonne et exploite la faiblesse pour amplifier les dégâts';
    if (has('dot_poison')) return 'Empoisonneur — inflige des dégâts continus';
    if (has('dot_bleed') || has('bleed')) return 'Saigneur — maintient des dégâts continus constants';
    if (has('dot_burn')) return 'Brûleur — maintient ses cibles en feu';
    if (any(['weakness_poison_enemy', 'weakness_elem_team', 'weakness_element'])) return 'Révèle et exploite les faiblesses ennemies';
    if (has('weak_point_detect')) return 'Détecte les points faibles pour toute l\'équipe';

    // ── Longue portée + Zone ───────────────────────────────────────────────────
    if (any(['range_5']) && any(['aoe_range_30', 'aoe_range_30_cond', 'dmg_aoe_scaling'])) return 'Sniper de zone — détruit de loin en large';
    if (any(['range_3', 'range_5']) && any(['aoe_range_30', 'aoe_range_30_cond', 'dmg_aoe_scaling'])) return 'Longue portée — ravage les groupes ennemis';
    if (has('range_5')) return 'Portée exceptionnelle — frappe sans être touché';
    if (has('range_3') && type === 'range') return 'Portée étendue pour rester hors de danger';
    if (any(['aoe_range_30', 'aoe_range_30_cond'])) return 'Maître de la zone — aucun groupe ne lui résiste';

    // ── Coups multiples ────────────────────────────────────────────────────────
    if (any(['triple_hit_10']) && any(['double_hit_15', 'double_hit_10'])) return 'Déchaîne une pluie de coups doubles et triples';
    if (any(['triple_hit_10'])) return 'Frappe jusqu\'à trois fois par attaque';
    if (any(['double_hit_15'])) return 'Décuple ses dégâts avec des coups doubles fréquents';
    if (any(['double_hit_10', 'double_hit_10_cond'])) return 'Spécialiste des coups doubles';
    if (has('double_triple_dmg_team')) return 'Amplifie les coups doubles et triples de l\'équipe';

    // ── Coups puissants ────────────────────────────────────────────────────────
    if (any(['crush_dmg_20_team', 'crush_dmg_20_ally']) && any(['crush_rate_10_team', 'crush_rate_20_ally'])) return "Booste le taux ET les dégâts des Coups puissants de l'équipe";
    if (any(['crush_dmg_20_team', 'crush_dmg_20_ally'])) return "Amplifie les dégâts des Coups puissants de l'équipe";
    if (any(['crush_rate_10_team', 'crush_rate_20_ally', 'crush_rate_10'])) return "Augmente le taux de Coups puissants de l'équipe";
    if (any(['crush_dmg_20', 'crush_dmg_20_ally'])) return 'Spécialiste des Coups puissants dévastateurs';

    // ── Critiques ──────────────────────────────────────────────────────────────
    if (any(['crit_rate_team_20', 'crit_rate_50_team'])) return "Booste le taux critique de toute l'équipe";
    if (any(['crit_dmg_team_20', 'crit_dmg_40_team'])) return "Amplifie les dégâts critiques de l'équipe";
    if (all(['crit_rate_50', 'no_crit_cd'])) return 'Enchaîne les critiques sans relâche';
    if (has('no_crit_cd')) return 'Réinitialise son CD sur chaque critique';
    if (has('crit_rate_50')) return 'Taux critique massif pour des dégâts constants';
    if (any(['crit_rate_10_team', 'crit_rate_team_15'])) return "Augmente la précision critique de l'équipe";
    if (any(['crit_rate_10', 'crit_rate_10_cond'])) return 'Augmente sa précision critique';
    if (any(['crit_dmg_20', 'crit_dmg_10_cond'])) return 'Critique — inflige des dégâts considérables';

    // ── Vitesse / Accélération ─────────────────────────────────────────────────
    if (has('spd_team_20') && any(['skill_accel_20_team', 'skill_accel_15_team'])) return "Accélère l'équipe en attaque ET en compétences";
    if (has('spd_team_20')) return "Accélère la vitesse d'attaque de l'équipe";
    if (any(['skill_accel_20_range', 'skill_accel_20_melee', 'skill_accel_20_team'])) return "Accélère les compétences de l'équipe";
    if (any(['cd_reset_proc', 'cd_skill_cond', 'exclusive_cd_down', 'no_crit_cd'])) return 'Enchaîne ses compétences à une vitesse folle';
    if (any(['spd_30', 'spd_15', 'spd_15_cond'])) return 'Vitesse d\'attaque élevée pour dominer le rythme';
    if (has('move_spd_200')) return 'Repositionnement ultrarapide — insaisissable';
    if (any(['skill_accel_15', 'skill_accel_20_cond'])) return 'Accélère ses propres compétences en combat';

    // ── Défense / Survie ───────────────────────────────────────────────────────
    if (has('limit_shield') && has('class_share_melee')) return 'Tank hybride — absorbe pour toute l\'équipe';
    if (has('limit_shield')) return 'Absorbe les gros coups pour toute l\'équipe';
    if (has('class_share_melee')) return 'Tank qui se comporte comme un mêlée';
    if (has('stealth_shield') && has('endurance_cond')) return 'Invincible au départ, survit aux coups létaux';
    if (has('stealth_shield')) return 'Démarre invincible — prend position sans risque';
    if (has('endurance_cond') && has('dodge_3s')) return 'Esquive puis survit au pire — indestructible';
    if (has('endurance_cond')) return 'Survit aux coups létaux grâce à l\'Endurance';
    if (has('dodge_3s')) return 'Esquive absolue — intouchable pendant 3 secondes';
    if (has('dmg_resist_80_cond')) return 'Encaisse 80% de résistance aux dégâts en réaction';
    if (any(['dmg_resist_20_team', 'shield_hits_3_team', 'shield_hits_5'])) return "Bouclier vivant — protège ses alliés des dégâts";
    if (any(['protection_shield_team', 'shield_100_team'])) return "Pose un bouclier massif sur toute l'équipe";
    if (any(['dmg_resist_10', 'dmg_resist_15_cond', 'dmg_resist_20_cond'])) return 'Résistant — difficile à éliminer';
    if (has('debuff_immune')) return 'Immunisé aux affaiblissements';
    if (has('regen_team')) return "Régénère continuellement les PV de l'équipe";
    if (any(['res_lp_30', 'res_lp_20'])) return 'Réduit la résistance à la longue portée pour ses alliés';

    // ── Précision / Esquive ────────────────────────────────────────────────────
    if (has('accuracy_20_team')) return "Améliore la précision de toute l'équipe";
    if (has('accuracy_20_range')) return 'Augmente la précision des alliés à distance';
    if (any(['weak_hit_rate_20', 'weak_hit_rate_20_melee'])) return 'Augmente le taux de coups affaiblis';
    if (has('dodge_rate_20')) return 'Esquive améliorée — évite certaines attaques';
    if (has('dodge_nerf_20')) return "Réduit l'esquive ennemie pour sécuriser les frappes";

    // ── Debuffs ennemis ────────────────────────────────────────────────────────
    if (any(['strip_shield', 'block_shield']) && has('target_weakness_shield')) return 'Détruit les boucliers et frappe plus fort derrière';
    if (has('strip_shield')) return "Supprime les boucliers ennemis sans pitié";
    if (has('block_shield')) return "Empêche les boucliers ennemis d'être efficaces";
    if (has('target_weakness_shield')) return 'Perce les boucliers pour infliger des dégâts amplifiés';
    if (any(['strip_debuff_team'])) return "Purge les debuffs de l'équipe";
    if (has('target_weakness_immunity')) return "Inflige des dégâts amplifiés sur les cibles sous immunité";
    if (has('target_weakness_provoke')) return 'Provoque et frappe plus fort les cibles provoquées';
    if (any(['def_nerf_20', 'def_nerf_20_cond'])) return 'Réduit la défense ennemie pour toute l\'équipe';
    if (any(['resist_nerf_20', 'resist_nerf_30'])) return 'Diminue la résistance aux dégâts des ennemis';
    if (any(['atk_nerf_20'])) return 'Affaiblit l\'attaque ennemie pour protéger ses alliés';
    if (any(['debuff_aoe_taken_10', 'debuff_crit_taken_10'])) return 'Amplifie les dégâts reçus par les ennemis';
    if (any(['crit_rate_nerf_20'])) return "Réduit le taux critique ennemi";

    // ── Lifesteal ──────────────────────────────────────────────────────────────
    if (any(['lifesteal_15_cond', 'lifesteal_20', 'lifesteal_30'])) return 'Se soigne en attaquant — durable et dangereux';
    if (has('lifesteal_15_cond')) return 'Aspiration de dégâts conditionnelle pour tenir en combat';

    // ── Furtivité ──────────────────────────────────────────────────────────────
    if (has('stealth') && type === 'melee') return 'Mêlée furtif — frappe dans l\'ombre';
    if (has('stealth')) return 'Se met en furtivité pour attaquer par surprise';

    // ── Profils par type avec buffs ATQ génériques ────────────────────────────
    if (any(['atk_20', 'atk_20_melee', 'atk_20_range']) && type === 'range') return 'Attaquant à distance qui booste ses alliés';
    if (any(['atk_20', 'atk_team_20']) && type === 'support') return 'Support offensif — renforce l\'attaque de l\'équipe';
    if (any(['atk_20', 'atk_15']) && type === 'melee') return 'Guerrier offensif qui augmente sa propre puissance';
    if (any(['dmg_20', 'dmg_15']) && type === 'range') return 'Tireur qui amplifie ses propres dégâts';
    if (any(['dmg_20_team', 'dmg_team_20']) && type === 'support') return "Support — augmente les dégâts de l'équipe";

    // ── Fallback par type ──────────────────────────────────────────────────────
    if (type === 'tank') return 'Tank solide — résiste et protège ses alliés';
    if (type === 'support') return 'Support polyvalent au service de l\'équipe';
    if (type === 'melee') return 'Combattant mêlée polyvalent';
    if (type === 'range') return 'Attaquant à distance polyvalent';
    return 'Combattant polyvalent';
}
