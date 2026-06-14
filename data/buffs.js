export const BUFF_CATS = { atk:{label:'⚔ ATQ/Dégâts',ids:['atk_10','atk_20','atk_25_delay','atk_100','atk_80','atk_up_stack','dmg_15','dmg_20','dmg_150','dmg_aoe_scaling','dmg_buff_scaling','dmg_debuff_scaling','dmg_unique_target','dmg_frozen_50','dmg_stunned_50','dmg_def_down_50','dmg_cc_50','dmg_poisoned_20','dmg_bleed_20','dmg_burned_20','dmg_sleeping_20','dmg_dot_50','dmg_petrified_20','target_weakness_provoke','target_weakness_immunity','target_weakness_shield','atk_down_ennemy_count']},
  crit:{label:'✦ Critique',ids:['crit_rate_10','crit_rate_10_cond','crit_rate_50','crit_dmg_10_cond','crit_dmg_20','crit_res_10_cond','crush_rate_10','crush_rate_10_cond','crush_rate_10_team','crush_dmg_20','crush_dmg_20_ally','crush_rate_20_ally','double_hit_10','double_hit_15','double_hit_10_cond','triple_hit_10','no_crit_cd','teamwork_stack','one_team_one_spirit','perfect_team','double_triple_dmg_team','bloom_stack','full_bloom']},
  spd:{label:'⚡ Vitesse',ids:['spd_10','spd_15','spd_15_cond','spd_30','spd_40_cond','spd_team_20','skill_accel_15','skill_accel_20_cond','move_spd_200','exclusive_cd_down','cd_reset_proc','cd_skill_cond','no_crit_cd']},
  range:{label:'🏹 Portée',ids:['range_3','range_5','aoe_range_30','aoe_range_30_cond']},
  def:{label:'🛡 Défense',ids:['def_15','hp_max_15_cond','res_lp_30','dmg_resist_10','dmg_resist_20_cond','dmg_resist_80_cond','dmg_resist_15_cond','dmg_resist_20_team','shield_hits_3_team','shield_hits_5','stealth_shield','endurance_cond','dodge_3s','protection_shield','limit_shield','dmg_down_provoked']},
  cc:{label:'🌀 CC/Survie',ids:['cc_eff_20','cc_immune_team_30','cc_immune_self_react','fran_blessing_team','cd_reset_proc','cd_skill_cond','stealth','strip_shield','lifesteal_15_cond','provoke_status']},
  dot:{label:'☠ DoT/Ennemi',ids:['bleed','dot_poison','weakness_poison_enemy','weak_point_detect','weakness_element','weakness_elem_team','debuff_aoe_taken_10','debuff_crit_taken_10','block_shield']},
  team:{label:'👥 Team',ids:['spd_team_20','shield_hits_3_team','dmg_resist_20_team','cc_immune_team_30','fran_blessing_team','merry_box_team_cond','crush_rate_10_team','weakness_elem_team','double_triple_dmg_team','teamwork_stack','one_team_one_spirit','perfect_team','limit_shield','class_share_melee','target_weakness_provoke','target_weakness_shield','weak_point_detect']},
 };
export const BUFFS = { "atk_10":{label:"ATQ +10%",color:"#e05555",power:10},
  "atk_15":{label:"ATQ +15%",color:"#e05555",power:13},
  "atk_20":{label:"ATQ +20%",color:"#e05555",power:18},
  "atk_20_range":{label:"ATQ +20% Allié type Distance",color:"#e05555",power:18,team:true},
  "atk_20_melee":{label:"ATQ +20% Allié type mêlée",color:"#e05555",power:18,team:true},
  "atk_25_delay":{label:"ATQ +25% (après 10s)",color:"#ff4444",power:16,cond:true},
  "atk_30":{label:"ATQ +30%",color:"#e05555",power:24},
  "atk_50":{label:"ATQ +50%",color:"#ff4444",power:36},
  "atk_80":{label:"ATQ +80%",color:"#ff44aa",power:52},
  "atk_100":{label:"ATQ +100% (×10 stacks Yang)",color:"#ff0000",power:38,cond:true},
  "atk_up_stack":{label:"ATQ +1%/stack (max 100, 10s)",color:"#ff44aa",power:6},
  "atk_down_ennemy_count":{label:"ATQ -5%/ennemi (max -60%)",color:"#ff44aa",power:10},
  "atk_team_10":{label:"ATQ ALLIÉS +10%",color:"#ff6666",power:26,team:true},
  "atk_team_20":{label:"ATQ ALLIÉS +20%",color:"#ff6666",power:40,team:true},
  "amplify_60_team":{label:"Amplification 60%",color:"#ff6666",power:10,team:true},
  "dgt_sup_20_atk":{label:"Inflige 20% de dégâts supplémentaires proportionnel aux nombres d'effets néfaste sur la cible",color:"#ff6666",power:15,cond:true},
  "dgt_sup_30_atk":{label:"Inflige 30% de dégâts supplémentaires proportionnel aux nombres d'effets néfaste sur la cible",color:"#ff6666",power:18,cond:true},
  // ── Dégâts ───────────────────────────────────────────────────────────────────
  "dmg_10":{label:"Dégâts +10%",color:"#d06030",power:9},
  "dmg_15":{label:"Dégâts +15%",color:"#d06030",power:13},
  "dmg_20":{label:"Dégâts +20%",color:"#d06030",power:17},
  "dmg_25":{label:"Dégâts +25%",color:"#d06030",power:20},
  "dmg_30":{label:"Dégâts +30%",color:"#d06030",power:24},
  "dmg_50":{label:"Dégâts +50%",color:"#ff6600",power:36},
  "dmg_150":{label:"Dégâts +150% (sous Furtivité)",color:"#ff6600",power:60,cond:true},
  "dmg_team_15":{label:"Dégâts +15% ALLIÉS",color:"#dd7030",power:30,team:true},
  "dmg_team_20":{label:"Dégâts +20% ALLIÉS",color:"#dd7030",power:38,team:true},
  "dmg_aoe_scaling":{label:"Dégâts ×ennemis (max ×10)",color:"#ddaa66",power:32},
  "dmg_buff_scaling":{label:"Dégâts / Nb Buffs (max 30)",color:"#c8a830",power:24},
  "dmg_debuff_scaling":{label:"Dégâts / Nb Debuffs (max 15)",color:"#d07030",power:44},
  "dmg_unique_target":{label:"Dégâts Cible Unique ↑",color:"#cc5030",power:14},
  "dmg_frozen_50":{label:"Dégâts +50% (cibles Gelées)",color:"#66ccff",power:24,cond:true},
  "dmg_stunned_50":{label:"Dégâts +50% (cibles Étourdies)",color:"#cc8800",power:24,cond:true},
  "dmg_def_down_50":{label:"Dégâts +50% (cibles DEF réduite)",color:"#cc6030",power:24,cond:true}, // 22→24 (aligné sur frozen/stunned)
  "dmg_cc_50":{label:"Dégâts +50% (cibles sous CC)",color:"#cc5588",power:26,cond:true},
  "dmg_poisoned_20":{label:"Dégâts +20% (cibles Empoisonnées)",color:"#88bb30",power:16,cond:true},
  "dmg_bleed_20":{label:"Dégâts +20% (cibles Saignement)",color:"#aa2020",power:16,cond:true},
  "dmg_burned_20":{label:"Dégâts +20% (cibles Brûlées)",color:"#cc5500",power:16,cond:true},
  "dmg_sleeping_20":{label:"Dégâts +20% (cibles Endormies)",color:"#8866cc",power:16,cond:true}, // 14→16 (aligné avec les autres +20% conditionnels)
  "dmg_dot_50":{label:"Dégâts +50% (cibles sous DoT)",color:"#cc6644",power:38,cond:true},
  "dmg_petrified_20":{label:"Dégâts +20% (cibles Pétrifiées)",color:"#bb6622",power:16,cond:true}, // 14→16 (aligné avec les autres +20% conditionnels)
  "dmg_down_provoked":{label:"Dég. reçus -30% (cibles Provoquées)",color:"#aa66dd",power:26},
  "dmg_100_immunity":{label:"Dégâts +100% cible sous immunité",color:"#ff6600",power:20,cond:true},
  "dmg_100_solotarget":{label:"Dégâts +100% cible seul",color:"#ff6600",power:26}, // 20→26 (sans cond, +100% vaut plus)
  "congelation_dmg":{label:"Inflige l'équivalent de 50% de la puissance d'attaque en dégâts supplémentaire.",color:"#dd6644",power:12,cond:true},
  "dmg_crit_add_10":{label:"Les dégâts critiques reçu augmentent de 10%",color:"#ff44aa",power:12},

  // ── Taux Critique ────────────────────────────────────────────────────────────
  "crit_rate_10":{label:"Taux Crit +10%",color:"#c8a830",power:12},
  "crit_rate_10_cond":{label:"Taux Crit +10% (conditionnel)",color:"#c8a830",power:9,cond:true},
  "crit_rate_15":{label:"Taux Crit +15%",color:"#c8a830",power:16},
  "crit_rate_20":{label:"Taux Crit +20%",color:"#c8a830",power:20},
  "crit_rate_30":{label:"Taux Crit +30%",color:"#e8c020",power:26},
  "crit_rate_50":{label:"Taux Crit +50% (5s)",color:"#e8c020",power:30},
  "crit_rate_team_10":{label:"Taux Crit ALLIÉS +10%",color:"#e8c020",power:28,team:true},
  "crit_rate_team_20":{label:"Taux Crit ALLIÉS +20%",color:"#e8c020",power:42,team:true},

  // ── Dégâts Critique ──────────────────────────────────────────────────────────
  "crit_dmg_10_cond":{label:"Dég. Crit +10% (×effet ennemi)",color:"#c8b840",power:9,cond:true},
  "crit_dmg_15":{label:"Dég. Crit +15%",color:"#c8b840",power:14},
  "crit_dmg_20":{label:"Dég. Crit +20%",color:"#c8b840",power:18},
  "crit_dmg_30":{label:"Dég. Crit +30%",color:"#c8b840",power:26},
  "crit_dmg_40":{label:"Dég. Crit +40%",color:"#c8b840",power:34},
  "crit_dmg_team_20":{label:"Dég. Crit ALLIÉS +20%",color:"#e8c840",power:36,team:true},
  "crit_res_10_cond":{label:"Résist. Critique +10% (2s)",color:"#8899bb",power:7,cond:true},
  "no_crit_cd":{label:"Reset CD Attaque Crit (4s)",color:"#e0a020",power:26,cond:true},
  "debuff_crit_taken_10":{label:"Dég. Crit reçus +10% (ennemi)",color:"#dd6644",power:12},

  // ── Taux Coup Puissant ───────────────────────────────────────────────────────
  "crush_rate_10":{label:"Taux Coup Puissant +10%",color:"#e0a020",power:12},
  "crush_rate_10_cond":{label:"Taux Coup Puissant +10% (conditionnel)",color:"#e0a020",power:10,cond:true},
  "crush_rate_15":{label:"Taux Coup Puissant +15%",color:"#e0a020",power:16},
  "crush_rate_20":{label:"Taux Coup Puissant +20%",color:"#e0a020",power:20},
  "crush_rate_20_ally":{label:"Taux Coup Puissant +20% (Allié Aléatoire)",color:"#c8b840",power:16,cond:true}, // 20→16 (ciblage aléatoire = conditionnel de fait)
  "crush_rate_30":{label:"Taux Coup Puissant +30%",color:"#e0a020",power:26},
  "crush_rate_10_team":{label:"Taux Coup Puissant ALLIÉS +10%",color:"#f0b030",power:26,team:true},
  "crush_rate_team_20":{label:"Taux Coup Puissant ALLIÉS +20%",color:"#f0b030",power:38,team:true},

  // ── Dégâts Coup Puissant ─────────────────────────────────────────────────────
  "crush_dmg_10":{label:"Dég. Coup Puissant +10%",color:"#e0a020",power:10},
  "crush_dmg_15":{label:"Dég. Coup Puissant +15%",color:"#e0a020",power:14},
  "crush_dmg_20":{label:"Dég. Coup Puissant +20%",color:"#e0a020",power:18},
  "crush_dmg_20_ally":{label:"Dég. Coup Puissant +20% (Allié Aléatoire)",color:"#44ddaa",power:16,cond:true},
  "crush_dmg_20_range":{label:"Dég. Coup Puissant +20% Allié type distance",color:"#44ddaa",power:16,cond:true},
  "crush_dmg_20_melee":{label:"Dég. Coup Puissant +20% Allié type mêlée",color:"#44ddaa",power:16,cond:true},  // 20→16 (allié aléatoire = fiabilité réduite)
  "crush_dmg_30":{label:"Dég. Coup Puissant +30%",color:"#d4a830",power:26},
  "crush_dmg_40":{label:"Dég. Coup Puissant +40%",color:"#d4a830",power:34},
  "crush_dmg_20_team":{label:"Dég. Coup Puissant ALLIÉS +20%",color:"#aa60ee",power:40,team:true},
  "crush_dmg_20_team_cond":{label:"Dég. Coup Puissant ALLIÉS +20% (conditionnel)",color:"#aa60ee",power:28,team:true,cond:true}, // 25→28 (team compense le cond, ratio cohérent avec crush_dmg_20_team:40)
  "crush_dmg_team_15":{label:"Dég. Coup Puissant ALLIÉS +15%",color:"#aa60ee",power:30,team:true},

  // ── Coups Multiples ──────────────────────────────────────────────────────────
  "double_hit_10":{label:"Coup Double +10%",color:"#cc70bb",power:16},
  "double_hit_10_cond":{label:"Coup Double +10% (conditionnel)",color:"#cc70bb",power:11,cond:true},
  "double_hit_15":{label:"Coup Double +15%",color:"#cc70bb",power:20},
  "double_hit_20":{label:"Coup Double +20%",color:"#cc70bb",power:26},
  "double_hit_30":{label:"Coup Double +30%",color:"#cc70bb",power:36},
  "double_hit_team_10":{label:"Coup Double ALLIÉS +10%",color:"#cc70bb",power:28,team:true},
  "double_hit_team_20_melee":{label:"Coup Double ALLIÉS mêlée +20%",color:"#cc70bb",power:28,team:true}, // 20→28 (buff team, doit être > solo)
  "double_hit_team_20_range":{label:"Coup Double ALLIÉS distance +20%",color:"#cc70bb",power:28,team:true}, // 20→28 (cohérence avec melee)
  "triple_hit_10":{label:"Coup Triple +10%",color:"#aa60ee",power:26},
  "triple_hit_15":{label:"Coup Triple +15%",color:"#aa60ee",power:34},
  "triple_hit_20":{label:"Coup Triple +20%",color:"#aa60ee",power:42},
  "triple_hit_team_10":{label:"Coup Triple ALLIÉS +10%",color:"#aa60ee",power:36,team:true},
  "double_triple_dmg_team":{label:"Dég. Coups Doubles/Triples +15% ALLIÉS",color:"#4466cc",power:30,team:true},

  // ── Vitesse ATQ ──────────────────────────────────────────────────────────────
  "spd_10":{label:"Vit. ATQ +10%",color:"#e07832",power:10},
  "spd_15":{label:"Vit. ATQ +15%",color:"#e07832",power:14},
  "spd_15_cond":{label:"Vit. ATQ +15% (conditionnel)",color:"#e07832",power:10,cond:true},
  "spd_20":{label:"Vit. ATQ +20%",color:"#e07832",power:18},
  "spd_25":{label:"Vit. ATQ +25%",color:"#e07832",power:20},
  "spd_30":{label:"Vit. ATQ +30%",color:"#e07832",power:22},
  "spd_35":{label:"Vit. ATQ +35%",color:"#e07832",power:24},
  "spd_40_cond":{label:"Vit. ATQ +40% (1s)",color:"#ff8800",power:16,cond:true},
  "spd_50":{label:"Vit. ATQ +50%",color:"#ff8800",power:34},
  "spd_team_10":{label:"Vit. ATQ ALLIÉS +10%",color:"#ffcc33",power:22,team:true},
  "spd_team_15":{label:"Vit. ATQ ALLIÉS +15%",color:"#ffcc33",power:30,team:true},
  "spd_team_20":{label:"Vit. ATQ ALLIÉS +20%",color:"#ffcc33",power:36,team:true},
  "move_spd_200":{label:"Vit. Déplacement +200% (3s)",color:"#4488cc",power:8},
  "move_spd_20":{label:"Vit. Déplacement +20% (10s)",color:"#4488cc",power:9},
  "move_spd_25":{label:"Vit. Déplacement +25% (10s)",color:"#4488cc",power:10},
  "move_spd_30":{label:"Vit. Déplacement +30% (10s)",color:"#4488cc",power:11},
  "move_spd_35_team":{label:"Vit. Déplacement +35% ALLIÉS (10s)",color:"#4488cc",power:12,team:true},

  // ── Compétences / CD ─────────────────────────────────────────────────────────
  "skill_accel_10":{label:"Accél. Compétences +10%",color:"#30b0d0",power:11},
  "skill_accel_15":{label:"Accél. Compétences +15%",color:"#30b0d0",power:16},
  "skill_accel_20_cond":{label:"Accél. Compétences +20% (conditionnel)",color:"#30b0d0",power:17,cond:true},
  "skill_accel_30":{label:"Accél. Compétences +30%",color:"#30b0d0",power:22},
  "cd_reset_proc":{label:"Reset CD Compétence (conditionnel)",color:"#00ffff",power:20,cond:true},
  "cd_skill_cond":{label:"Réduction CD Compétence Excl. (conditionnel)",color:"#30c0d0",power:12,cond:true},
  "exclusive_cd_down":{label:"Accél. Comp. Exclusive +5% (restant)",color:"#d06030",power:8},
  "no_crit_cd":{label:"Reset CD Attaque Crit (4s)",color:"#e0a020",power:26,cond:true},

  // ── Portée / Zone ────────────────────────────────────────────────────────────
  "range_1":{label:"Portée +1",color:"#50b890",power:10},
  "range_2":{label:"Portée +2",color:"#50b890",power:16},
  "range_3":{label:"Portée +3",color:"#50b890",power:24},
  "range_5":{label:"Portée +5",color:"#50b890",power:34},
  "aoe_range_20":{label:"Rayon Zone +20%",color:"#66ddaa",power:14},
  "aoe_range_30":{label:"Rayon Zone +30%",color:"#66ddaa",power:20},
  "aoe_range_30_cond":{label:"Rayon Zone +30% (conditionnel)",color:"#66ddaa",power:13,cond:true},
  "aoe_range_50":{label:"Rayon Zone +50%",color:"#66ddaa",power:28},

  // ── Défense ──────────────────────────────────────────────────────────────────
  "def_10":{label:"DEF +10%",color:"#4d8fd6",power:6},
  "def_15":{label:"DEF +15%",color:"#4d8fd6",power:9},
  "def_20":{label:"DEF +20%",color:"#4d8fd6",power:13},
  "def_30":{label:"DEF +30%",color:"#4d8fd6",power:18},
  "def_team_15":{label:"DEF ALLIÉS +15%",color:"#4d8fd6",power:28,team:true},

  // ── PV Maximum ───────────────────────────────────────────────────────────────
  "hp_max_10":{label:"PV MAX +10%",color:"#44aacc",power:10},
  "hp_max_15_cond":{label:"PV MAX +15% (conditionnel)",color:"#44aacc",power:14,cond:true},
  "hp_max_20":{label:"PV MAX +20%",color:"#44aacc",power:18},
  "hp_max_team_15":{label:"PV MAX ALLIÉS +15%",color:"#44aacc",power:30,team:true},

  // ── Résistances ──────────────────────────────────────────────────────────────
  "res_lp_20":{label:"Résist. Longue Portée -20%",color:"#4488aa",power:10},
  "res_lp_30":{label:"Résist. Longue Portée -30%",color:"#4488aa",power:14},
  "res_lp_50":{label:"Résist. Longue Portée -50%",color:"#4488aa",power:20},
  "dmg_resist_10":{label:"Résist. Dégâts +10%",color:"#5588cc",power:16},
  "dmg_resist_15_cond":{label:"Résist. Dégâts +15% (conditionnel)",color:"#5588cc",power:16,cond:true},
  "dmg_resist_20_cond":{label:"Résist. Dégâts +20% (conditionnel)",color:"#5588cc",power:18,cond:true},
  "dmg_resist_25":{label:"Résist. Dégâts +25%",color:"#5588cc",power:22},
  "dmg_resist_30":{label:"Résist. Dégâts +30%",color:"#5588cc",power:26},
  "dmg_resist_80_cond":{label:"Résist. Dégâts +80% (2s)",color:"#0044ff",power:26,cond:true},
  "dmg_resist_20_team":{label:"Résist. Dégâts ALLIÉS +20%",color:"#33ccff",power:32,team:true},
  "dmg_resist_team_10":{label:"Résist. Dégâts ALLIÉS +10%",color:"#33ccff",power:20,team:true},

  // ── Boucliers ────────────────────────────────────────────────────────────────
  "shield_25":{label:"Bouclier de 25% des PV",color:"#4466cc",power:10},
  "shield_50":{label:"Bouclier de 50% des PV",color:"#4466cc",power:12},
  "shield_75":{label:"Bouclier de 75% des PV",color:"#4466cc",power:14},
  "shield_100":{label:"Bouclier de 100% des PV",color:"#4466cc",power:20},
  "shield_hits_2":{label:"Bouclier ×2",color:"#4466cc",power:12},
  "shield_hits_3_team":{label:"Bouclier ×3 ALLIÉS",color:"#6688ff",power:28,team:true},
  "shield_hits_4":{label:"Bouclier ×4",color:"#4466cc",power:16},
  "shield_hits_5":{label:"Bouclier ×5",color:"#4466cc",power:20},
  "shield_hits_7":{label:"Bouclier ×7",color:"#4466cc",power:26},
  "shield_hits_10":{label:"Bouclier ×10",color:"#6688ff",power:36},
  "shield_hits_team_5":{label:"Bouclier ×5 ALLIÉS",color:"#6688ff",power:40,team:true},
  "stealth_shield":{label:"Bouclier Invincible 3s",color:"#aa66dd",power:32},
  "protection_shield":{label:"Bouclier = 50% des PV max",color:"#ffaa44",power:18},
  "limit_shield":{label:"Dégâts reçus ≤ 10% PV max",color:"#e05555",power:26,team:true},

  // ── Survie ───────────────────────────────────────────────────────────────────
  "endurance_cond":{label:"Endurance anti-mort (coup létal)",color:"#ff44aa",power:36,cond:true},
  "dodge_3s":{label:"Esquive Absolue 3s",color:"#60aaee",power:45},

  // ── CC offensif ──────────────────────────────────────────────────────────────
  "cc_eff_10":{label:"Efficacité CC +10%",color:"#dd8844",power:7},
  "cc_eff_20":{label:"Efficacité CC +20%",color:"#dd8844",power:12,cond:true},
  "cc_eff_30":{label:"Efficacité CC +30%",color:"#dd8844",power:16},
  "cc_eff_team_20":{label:"Efficacité CC ALLIÉS +20%",color:"#dd8844",power:28,team:true},
  // ── Malus Vitesse ATQ (ennemi) ───────────────────────────────────────────────
  "atk_spd_nerf_10":{label:"Vit. ATQ ennemi -10%",color:"#dd6644",power:8,cond:true},
  "atk_spd_nerf_15":{label:"Vit. ATQ ennemi -15%",color:"#dd6644",power:11,cond:true},
  "atk_spd_nerf_20":{label:"Vit. ATQ ennemi -20%",color:"#dd6644",power:14,cond:true},
  "atk_spd_nerf_30":{label:"Vit. ATQ ennemi -30%",color:"#dd6644",power:18,cond:true},
  "atk_spd_nerf_50":{label:"Vit. ATQ ennemi -50%",color:"#dd6644",power:26,cond:true},
  "atk_spd_nerf_20_team":{label:"Vit. ATQ ennemi -20% ALLIÉS",color:"#dd6644",power:28,team:true},

  // ── CC défensif / Immunités ──────────────────────────────────────────────────
  "cc_immune_team_30":{label:"Immunité CC ALLIÉS (30s)",color:"#44ddaa",power:46,team:true},
  "cc_immune_self_react":{label:"Immunité CC 2s (réactif) + Reset CD Excl.",color:"#44ddaa",power:30,cond:true},
  "fran_blessing_team":{label:"Bénédiction de Fran ALLIÉS (Immunité débuffs + Dégâts +15%, 10s)",color:"#88aaff",power:42,cond:true,team:true},

  // ── Mécaniques spéciales ─────────────────────────────────────────────────────
  "stealth":{label:"Furtivité",color:"#8855cc",power:16},
  "strip_shield":{label:"Suppression Bouclier ennemi",color:"#ee4444",power:18},
  "block_shield":{label:"Détection Bouclier (cible)",color:"#5588cc",power:30},
  "provoke_status":{label:"Provocation (force la cible à attaquer le lanceur)",color:"#aaaaaa",power:18},
  "target_weakness_provoke":{label:"Dégâts +15% (cibles Provoquées)",color:"#aa66dd",power:18,team:true},
  "target_weakness_immunity":{label:"Dégâts +30% (cible immunisée, Allié Aléatoire, 10s)",color:"#cc4488",power:20,cond:true}, // 24→20 (allié aléatoire réduit la fiabilité)
  "target_weakness_shield":{label:"Dégâts +15% / bouclier ennemi (max +45%)",color:"#30b0d0",power:26,team:true},
  "class_share_melee":{label:"Le monstre est aussi de type Mêlée",color:"#50b890",power:36},

  // ── Aspiration / Soin ────────────────────────────────────────────────────────
  "lifesteal_10":{label:"Aspiration Dégâts +10%",color:"#cc4488",power:10},
  "lifesteal_15_cond":{label:"Aspiration Dégâts +15% (conditionnel)",color:"#cc4488",power:14,cond:true},
  "lifesteal_20":{label:"Aspiration Dégâts +20%",color:"#cc4488",power:18},
  "lifesteal_30":{label:"Aspiration Dégâts +30%",color:"#cc4488",power:26},
  "lifesteal_team_15":{label:"Aspiration Dégâts ALLIÉS +15%",color:"#cc4488",power:30,team:true},

  // ── DoT / Affaiblissements ───────────────────────────────────────────────────
  "bleed":{label:"Saignement (ennemi)",color:"#b02020",power:16},
  "attenuation":{label:"Attenuation (-40% atk/Hit)",color:"#ff44aa",power:12,cond:true},
  "bleed_team":{label:"Saignement (ennemi) — via ALLIÉS",color:"#b02020",power:28,team:true},
  "dot_poison":{label:"Empoisonnement (ennemi, continu)",color:"#669900",power:18},
  "dot_burn":{label:"Brûlure (ennemi, continu)",color:"#cc5500",power:18},
  "dot_bleed":{label:"Saignement (ennemi, continu)",color:"#aa2020",power:18},
  "weakness_poison_enemy":{label:"Faiblesse Empoisonnement (ennemi)",color:"#88bb22",power:20,cond:true},
  "weakness_element":{label:"Faiblesse Élémentaire (ennemi)",color:"#50aaee",power:24},
  "weakness_elem_team":{label:"Faiblesse Élémentaire ALLIÉS",color:"#70ccff",power:38,team:true},
  "weak_point_detect":{label:"Détection Point Faible ALLIÉS (sur DoT)",color:"#ffaa44",power:22,cond:true,team:true},
  "debuff_aoe_taken_10":{label:"Dégâts Zone reçus +10% (ennemi)",color:"#dd6644",power:16,cond:true},
  "spd_nerf_25":{label:"Diminue la vitesse de déplacement de 25%",color:"#dd6644",power:6,cond:true},
  "spd_nerf_50":{label:"Diminue la vitesse de déplacement de 50%",color:"#dd6644",power:8,cond:true},
  "spd_nerf_75":{label:"Diminue la vitesse de déplacement de 75%",color:"#dd6644",power:10,cond:true},
  "spd_nerf_100":{label:"Diminue la vitesse de déplacement de 100%",color:"#dd6644",power:12,cond:true},
  "congelation_dot":{label:"Inflige des dégâts équivalent à 20% de la vitesse d'attaque toutes les 0.2 sec",color:"#dd6644",power:6,cond:true},

  // ── Passives / Mécaniques de personnage ──────────────────────────────────────
  "fox_fire_cond":{label:"Feu du renard (sur Coup Puissant)",color:"#ff8c42",power:10,cond:true},
  "fox_fire_burst":{label:"Feu du renard Burst ×2 (×20 stacks)",color:"#ff6820",power:20,cond:true},
  "rockstar_i":{label:"Rockstar I (passif permanente)",color:"#ff44cc",power:20},
  "rockstar_iii_cond":{label:"Rockstar III 2s (conditionnel)",color:"#ff00aa",power:12,cond:true},
  "happy_box_cond":{label:"Happy Box (sur Coup Puissant)",color:"#ffaa22",power:12,cond:true},
  "merry_box_team_cond":{label:"Merry Box ALLIÉS (×5 stacks, 4s)",color:"#ffcc33",power:30,cond:true,team:true},

  // ── Synergies d'équipe ───────────────────────────────────────────────────────
  "teamwork_stack":{label:"Augmente l'ATQ, les Dég. Crit, les Dég. Puissant, le Taux Crit et le Taux Puissant de 3% par cumul (jusqu'à 21%).",color:"#c8a830",power:22,team:true},
  "one_team_one_spirit":{label:"Lorsque l'ATQ, les Dég. Crit, les Dég. Puissant, le Taux Crit et le Taux Puissant ont tous été augmentés de 20% ou plus par des effets de compétences, augmente les Dégâts infligés de 30%.",color:"#d06030",power:35,team:true},
  "perfect_team":{label:"Lorsque l'ATQ, les Dég. Crit, les Dég. Puissant, le Taux Crit et le Taux Puissant ont tous été augmentés de 40% ou plus par des effets de compétences, augmente les Dégâts infligés de 30%.",color:"#e05555",power:45,team:true},

  // ── Floraison ────────────────────────────────────────────────────────────────
  "bloom_stack":{label:"Fleur (Cumul Bloom max 15)",color:"#d06030",power:26},
  "floraison":{label:"Floraison (Crits peuvent déclenché Coups Multiples)",color:"#d06030",power:15},
  "full_bloom":{label:"Pleine Floraison (Crits déclenchent Coups Multiples)",color:"#e05555",power:36,cond:true},
  "rocknroll":{label:"A chaque coup, confère a l'allié Belle 1 cumul d'acclamation",color:"#00ffff",power:3,team:true},
  "acclamation":{label:"A 250 cumuls, confère à la cible l'effet Rockstar et si elle le possède déjà confère en plus l'effet Rockstar II.",color:"#00ffff",power:15}, };
