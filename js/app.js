import { BUFF_CATS, BUFFS } from '../data/buffs.js';
import { MONSTERS } from '../data/monsters.js';
import { BASIC_SKILLS, CRIT_SKILLS, EXCLUSIVE_SKILLS } from '../data/skills.js';

const IP='./images/';
const CW=.6;
const MAX_T=500;
const MAX_AWK=200;
const MAX_SPELL_EACH=100;

function rgb(h){h=h.replace('#','');return`${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`}
function bVal(id){const b=BUFFS[id];return b?Math.round(b.power*(b.cond?CW:1)):0}

function spellScore(sk){
  if(!sk)return 0;
  const atk=Math.min((sk.atk_pct||0)/4,30);
  const buf=Math.min((sk.buffs||[]).reduce((s,id)=>s+bVal(id),0),40);
  const hit=Math.min(((sk.hits||1)-1)*8,20);
  const aoe=sk.aoe?10:0;
  return Math.round(atk+buf+hit+aoe);
}

function SKILLS(nm){
  return{
    basic:BASIC_SKILLS[nm]||null,
    crit:CRIT_SKILLS[nm]||null,
    exclusive:EXCLUSIVE_SKILLS[nm]||null
  };
}

function skillBuffsRaw(nm){
  const sk=SKILLS(nm);
  return[...((sk.basic?.buffs)||[]),...((sk.crit?.buffs)||[]),...((sk.exclusive?.buffs)||[])];
}

function skillPts(nm){
  const sk=SKILLS(nm);
  return spellScore(sk.basic)+spellScore(sk.crit)+spellScore(sk.exclusive);
}

const ALL_AWK_RAW=Object.values(MONSTERS).flatMap(m=>
  (m.awakenings||[]).filter(a=>a.level!==3).map(a=>(a.buffs||[]).reduce((s,id)=>s+bVal(id),0))
);
const MAX_AW=Math.max(...ALL_AWK_RAW,1);
const AWK3_PTS=25;

function awkPts(a){
  if(a.level===3)return AWK3_PTS;
  const raw=(a.buffs||[]).reduce((s,id)=>s+bVal(id),0);
  return Math.min(Math.round(raw/MAX_AW*100),100);
}

function totPts(m,nm){
  const awkSum=Math.min((m.awakenings||[]).reduce((s,a)=>s+awkPts(a),0),MAX_AWK);
  const skSum=nm?skillPts(nm):0;
  return Math.min(awkSum+skSum,MAX_T);
}

function sCol(r){return r>=.68?'var(--hi)':r>=.38?'var(--mid)':'var(--lo)'}

function allMonsterBuffIds(nm){
  const m=MONSTERS[nm];if(!m)return[];
  const awk=(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]);
  return[...new Set([...awk,...skillBuffsRaw(nm)])];
}

function genTagline(nm){
  const m=MONSTERS[nm];if(!m)return'Combattant polyvalent';
  const buffs=allMonsterBuffIds(nm);
  const has=id=>buffs.includes(id);
  const any=ids=>ids.some(id=>has(id));
  if(has('dmg_150'))return'Explose sous Furtivité';
  if(any(['atk_80','atk_100']))return'Attaquant redoutable avec une attaque de base élevée';
  if(has('cc_immune_team_30'))return"Protège toute l'équipe contre les CC";
  if(has('fran_blessing_team'))return'Immunité + dégâts groupés pour les alliés';
  if(has('spd_team_20'))return"Accélère l'équipe en combat";
  if(any(['dmg_debuff_scaling']))return"Plus l'ennemi est affaibli, plus il est détruit";
  if(any(['dmg_buff_scaling']))return'Plus il est buffé, plus il inflige des dégâts massifs';
  if(any(['perfect_team','one_team_one_spirit','teamwork_stack']))return"Brille avec des boost d'équipe bien orchestrés";
  if(any(['range_3','range_5'])&&any(['dmg_aoe_scaling','aoe_range_30','aoe_range_30_cond']))return'Longue portée — ravage les groupes';
  if(any(['full_bloom','bloom_stack','double_triple_dmg_team']))return'Spécialiste des coups multiples';
  if(any(['dmg_frozen_50','dmg_stunned_50','dmg_cc_50','dmg_def_down_50','dmg_petrified_20','dmg_sleeping_20','target_weakness_provoke']))return'Punit sévèrement les ennemis sous contrôle';
  if(any(['dmg_dot_50','dmg_poisoned_20','dmg_bleed_20','dmg_burned_20','dot_poison','weakness_poison_enemy']))return'Exploite les DoT pour amplifier ses dégâts';
  if(any(['double_hit_15','triple_hit_10','double_hit_10_cond','double_hit_10']))return'Spécialiste des coups multiples';
  if(has('class_share_melee'))return'Tank qui se prend pour un mêlée';
  if(any(['crush_rate_10_team','crush_rate_10','crush_dmg_20_ally','crush_rate_20_ally','crush_dmg_20']))return"Amplifie les coups puissants de l'équipe";
  if(any(['shield_hits_3_team','dmg_resist_20_team']))return'Bouclier vivant — protège ses alliés';
  if(any(['strip_shield','block_shield','target_weakness_shield']))return'Perce-bouclier';
  if(any(['cd_skill_cond','cd_reset_proc','no_crit_cd','exclusive_cd_down','skill_accel_20_cond','skill_accel_15']))return'Enchaîne ses compétences rapidement';
  if(any(['dodge_3s','endurance_cond','dmg_resist_80_cond','dmg_resist_15_cond','dmg_resist_10','dmg_resist_20_cond','limit_shield','protection_shield','cc_immune_self_react']))return'Survivant hors pair';
  if(any(['crit_rate_50','crit_rate_10','crit_rate_10_cond','crit_dmg_20','crit_dmg_10_cond']))return'Spécialiste des coups critiques';
  if(any(['weak_point_detect','weakness_elem_team','weakness_element','debuff_aoe_taken_10','debuff_crit_taken_10','target_weakness_immunity','bleed']))return'Détecte et exploite les failles ennemies';
  return'Combattant polyvalent';
}

const TCOL={melee:'var(--mel)',tank:'var(--tnk)',range:'var(--rng)',support:'var(--sup)'};
const TLBL={melee:'Mêlée',tank:'Tank',range:'Range',support:'Support'};
const TCLS={melee:'tc-m',tank:'tc-t',range:'tc-r',support:'tc-s'};
const SCOLS=['#4888d8','#c89020','#d84040'];
const TIERS=[{id:'S',label:'S',bg:'#b83030'},{id:'A',label:'A',bg:'#c07020'},{id:'B',label:'B',bg:'#a09020'},{id:'C',label:'C',bg:'#408830'},{id:'D',label:'D',bg:'#505080'}];

const OFF_IDS=new Set(['atk_10','atk_20','atk_25_delay','atk_80','atk_100','atk_up_stack','dmg_15','dmg_20','dmg_150','dmg_aoe_scaling','dmg_buff_scaling','dmg_debuff_scaling','dmg_unique_target','dmg_frozen_50','dmg_stunned_50','dmg_def_down_50','dmg_cc_50','dmg_poisoned_20','dmg_bleed_20','dmg_burned_20','dmg_sleeping_20','dmg_dot_50','dmg_petrified_20','crit_rate_10','crit_rate_10_cond','crit_rate_50','crit_dmg_10_cond','crit_dmg_20','no_crit_cd','crush_rate_10','crush_rate_10_cond','crush_dmg_20','crush_dmg_20_ally','crush_rate_20_ally','double_hit_10','double_hit_15','double_hit_10_cond','triple_hit_10','spd_10','spd_15','spd_15_cond','spd_30','spd_40_cond','move_spd_200','skill_accel_15','skill_accel_20_cond','cd_reset_proc','cd_skill_cond','exclusive_cd_down','range_3','range_5','aoe_range_30','aoe_range_30_cond','cc_eff_20','stealth','strip_shield','bleed','dot_poison','weakness_poison_enemy','weakness_element','debuff_aoe_taken_10','debuff_crit_taken_10','block_shield','target_weakness_provoke','target_weakness_immunity','target_weakness_shield','atk_down_ennemy_count','bloom_stack','full_bloom','fox_fire_cond','fox_fire_burst','rockstar_i','rockstar_iii_cond','happy_box_cond','lifesteal_15_cond','provoke_status','dmg_down_provoked','weak_point_detect','weakness_elem_team']);
const DEF_IDS=new Set(['def_15','hp_max_15_cond','res_lp_30','dmg_resist_10','dmg_resist_15_cond','dmg_resist_20_cond','dmg_resist_20_team','dmg_resist_80_cond','shield_hits_3_team','shield_hits_5','stealth_shield','protection_shield','endurance_cond','dodge_3s','limit_shield','cc_immune_team_30','cc_immune_self_react','fran_blessing_team']);
const TEAM_IDS=new Set(['spd_team_20','shield_hits_3_team','dmg_resist_20_team','cc_immune_team_30','fran_blessing_team','merry_box_team_cond','crush_rate_10_team','weakness_elem_team','double_triple_dmg_team','teamwork_stack','one_team_one_spirit','perfect_team','limit_shield','class_share_melee','target_weakness_provoke','target_weakness_shield','weak_point_detect']);

let selCmp=[null,null,null],selTb=[],activeTab='cmp',activeType='',activeCat='',teamSize=15;
let tlData={S:[],A:[],B:[],C:[],D:[]},tlDragName=null,tlDragFrom=null;
let tlCat='',meType='',meRecapOpen=false;
let myAwakenings=JSON.parse(localStorage.getItem('sw_my_awk')||'{}');
let teamSaves=JSON.parse(localStorage.getItem('sw_team_saves')||JSON.stringify([
  {name:'Équipe 1',members:[],size:15},
  {name:'Équipe 2',members:[],size:15},
  {name:'Équipe 3',members:[],size:15},
  {name:'Équipe 4',members:[],size:15},
  {name:'Équipe 5',members:[],size:15}
]));
let activeSlot=-1;

function saveTeamSaves(){localStorage.setItem('sw_team_saves',JSON.stringify(teamSaves));}
function saveAwk(){localStorage.setItem('sw_my_awk',JSON.stringify(myAwakenings));}
function getAwkSet(nm){const v=myAwakenings[nm];return new Set(Array.isArray(v)?v:(v?[v]:[]));}
function getAwkLevel(nm){const s=getAwkSet(nm);return s.has(7)?7:s.has(5)?5:s.has(3)?3:0;}

function toggleAwk(nm,level){
  const s=getAwkSet(nm);
  if(s.has(level))s.delete(level);else s.add(level);
  if(s.size===0)delete myAwakenings[nm];
  else myAwakenings[nm]=[...s];
  saveAwk();
  const grid=document.getElementById('meGridInner');
  if(grid&&grid.children.length)updateMeCard(nm);
  renderMeRecap();
}

function switchTab(t){
  activeTab=t;
  ['cmp','tb','tl','me'].forEach(id=>{
    document.getElementById('tab-'+id).classList.toggle('on',id===t);
    document.getElementById('panel'+id.charAt(0).toUpperCase()+id.slice(1)).className='panel '+(id===t?'on':'off');
  });
  const sb=document.getElementById('sb');
  if(t==='me')sb.classList.add('me-mode');
  else{sb.classList.remove('me-mode');buildGrid();}
  if(t==='tl')renderTierList();
  if(t==='me')renderMesEveils();
}

function onSearch(){
  if(activeTab==='me')renderMesEveils();
  else buildGrid();
}

document.getElementById('typeRow').addEventListener('click',e=>{
  const b=e.target.closest('.fp');if(!b||!('t' in b.dataset))return;
  document.querySelectorAll('#typeRow .fp').forEach(x=>x.className='fp');
  activeType=b.dataset.t;
  b.classList.add(activeType===''?'fa':activeType==='melee'?'fm':activeType==='tank'?'ft':activeType==='range'?'fr':'fs');
  buildGrid();
});
document.getElementById('catRow').addEventListener('click',e=>{
  const b=e.target.closest('.fp');if(!b||!('c' in b.dataset))return;
  const c=b.dataset.c;
  if(activeCat===c){activeCat='';document.querySelectorAll('#catRow .fp').forEach(x=>x.className='fp');}
  else{document.querySelectorAll('#catRow .fp').forEach(x=>x.className='fp');activeCat=c;b.classList.add('fbc');}
  buildGrid();
});
document.getElementById('meTypeRow').addEventListener('click',e=>{
  const b=e.target.closest('.fp');if(!b||!('mt' in b.dataset))return;
  document.querySelectorAll('#meTypeRow .fp').forEach(x=>x.className='fp');
  meType=b.dataset.mt;
  b.classList.add(meType===''?'fa':meType==='melee'?'fm':meType==='tank'?'ft':meType==='range'?'fr':'fs');
  renderMesEveils();
});

function hasBuffCat(nm){
  if(!activeCat)return true;
  const ids=new Set((BUFF_CATS[activeCat]||{ids:[]}).ids);
  const awkBuffs=(MONSTERS[nm].awakenings||[]).some(a=>a.level!==3&&(a.buffs||[]).some(id=>ids.has(id)));
  const skBuffs=skillBuffsRaw(nm).some(id=>ids.has(id));
  return awkBuffs||skBuffs;
}

function buildGrid(){
  const q=document.getElementById('srch').value.toLowerCase();
  const g=document.getElementById('grid');
  const placed={};
  TIERS.forEach(t=>tlData[t.id].forEach(nm=>{placed[nm]=t.id;}));
  const names=Object.keys(MONSTERS).filter(n=>{
    if(activeType&&MONSTERS[n].type!==activeType)return false;
    if(!n.toLowerCase().includes(q))return false;
    if(activeCat&&!hasBuffCat(n))return false;
    return true;
  }).sort((a,b)=>totPts(MONSTERS[b],b)-totPts(MONSTERS[a],a));
  g.innerHTML='';
  names.forEach(nm=>{
    const m=MONSTERS[nm],tot=totPts(m,nm),r=tot/MAX_T,sc=sCol(r);
    const iC=selCmp.indexOf(nm),iT=selTb.includes(nm);
    const tier=placed[nm];
    const d=document.createElement('div');
    d.className='pc'+(iC!==-1?' sel':'');
    d.draggable=true;
    let badge='';
    if(activeTab==='tl'&&tier){
      const bg=TIERS.find(t=>t.id===tier)?.bg||'#666';
      badge=`<div class="pc-badge" style="background:${bg};color:#fff;font-size:.55rem">${tier}</div>`;
    }else if(iC!==-1){
      badge=`<div class="pc-badge" style="background:rgba(${rgb(SCOLS[iC])},.3);color:${SCOLS[iC]}">${iC+1}</div>`;
    }else if(iT){
      badge=`<div class="pc-badge" style="background:rgba(168,212,40,.2);color:var(--green2)">✓</div>`;
    }
    d.innerHTML=`<img src="${IP}${nm}.png" loading="lazy" onerror="this.src=''">
      <div class="pc-type" style="color:${TCOL[m.type]}">${{melee:'⚔',tank:'🛡',range:'🏹',support:'💚'}[m.type]}</div>
      ${badge}
      <div class="pc-bot"><div class="pc-name">${nm}</div><div class="pc-score" style="color:${sc}">${tot}</div></div>`;
    d.addEventListener('dragstart',e=>{tlDragName=nm;tlDragFrom='pool';e.dataTransfer.effectAllowed='copy';});
    d.addEventListener('click',()=>{
      if(activeTab==='cmp'){
        const i=selCmp.indexOf(nm);
        if(i!==-1)selCmp[i]=null;
        else{const fi=selCmp.indexOf(null);if(fi!==-1)selCmp[fi]=nm;}
        renderCmp();
      }else if(activeTab==='tb'){
        const i=selTb.indexOf(nm);
        if(i!==-1)selTb.splice(i,1);
        else if(selTb.length<teamSize)selTb.push(nm);
        renderTeam();
      }else if(activeTab==='tl'){
        if(!tier){tlData['B'].push(nm);renderTierList();}
      }
      buildGrid();
    });
    g.appendChild(d);
  });
}

function toggleAccordion(id){
  const body=document.getElementById('acc-body-'+id);
  const arrow=document.getElementById('acc-arrow-'+id);
  if(!body||!arrow)return;
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  arrow.classList.toggle('open',!isOpen);
}
window.toggleAccordion=toggleAccordion;

function renderSpellPanel(nm){
  const sk=SKILLS(nm);
  function renderOneAcc(s,type,label,uid){
    const sc=spellScore(s||{});
    const r=sc/MAX_SPELL_EACH;
    const col=sCol(r);
    if(!s)return`<div class="skill-accordion"><div class="skill-acc-header" onclick="toggleAccordion('${uid}')"><span class="skill-type ${type}">${label}</span><span class="skill-acc-name" style="color:var(--tx2);font-style:italic">Non renseigné</span><span class="skill-acc-score" style="color:var(--tx2)">—</span><span class="skill-acc-arrow" id="acc-arrow-${uid}">▼</span></div></div>`;
    const cd=s.cd>0?`<div class="skill-cd">Recharge : ${s.cd}s</div>`:'';
    const meta=`<div class="skill-meta">${s.atk_pct?`<span class="skill-meta-tag atk">${s.atk_pct}% ATQ</span>`:''} ${(s.hits||1)>1?`<span class="skill-meta-tag hit">×${s.hits} coups</span>`:''} ${s.aoe?'<span class="skill-meta-tag aoe">Zone</span>':'<span class="skill-meta-tag">Cible unique</span>'}</div>`;
    const buffsHtml=s.buffs&&s.buffs.length?`<div class="skill-buffs">${s.buffs.map(id=>{const b=BUFFS[id];if(!b)return'';return`<span class="skill-buff-chip" style="border-color:${b.color}">${b.label}</span>`;}).join('')}</div>`:'';
    return`<div class="skill-accordion"><div class="skill-acc-header" onclick="toggleAccordion('${uid}')"><span class="skill-type ${type}">${label}</span><span class="skill-acc-name">${s.name||'—'}</span><span class="skill-acc-score" style="color:${col}">${sc}/100</span><span class="skill-acc-arrow" id="acc-arrow-${uid}">▼</span></div><div class="skill-acc-body" id="acc-body-${uid}"><div class="skill-desc">${s.desc||''}</div>${cd}${meta}${buffsHtml}<div class="skill-score-bar"><div class="skill-score-fill" style="width:${Math.round(r*100)}%;background:${col}"></div></div><div class="skill-score-lbl">Score : <span style="color:${col}">${sc}</span> / 100</div></div></div>`;
  }
  const base=nm.replace(/[^a-z0-9]/gi,'');
  return`<div class="mrow-skills-wrap">${renderOneAcc(sk.basic,'basic','Attaque de base',base+'_b')}${renderOneAcc(sk.crit,'crit','Attaque critique',base+'_c')}${renderOneAcc(sk.exclusive,'exclusive','Compétence exclusive',base+'_e')}</div>`;
}

function buffChips(buffs,nm){
  const s=getAwkSet(nm);
  const m=MONSTERS[nm];
  const awk3b=new Set((m?.awakenings||[]).find(a=>a.level===3)?.buffs||[]);
  const awk5b=new Set((m?.awakenings||[]).find(a=>a.level===5)?.buffs||[]);
  const awk7b=new Set((m?.awakenings||[]).find(a=>a.level===7)?.buffs||[]);
  return buffs.map(id=>{
    const b=BUFFS[id];if(!b)return'';
    let ab='';
    if(s.has(3)&&awk3b.has(id))ab='<span class="bchip-awk a3">Éveil 3</span>';
    else if(s.has(5)&&awk5b.has(id))ab='<span class="bchip-awk a5">Éveil 5★</span>';
    else if(s.has(7)&&awk7b.has(id))ab='<span class="bchip-awk a7">Éveil 7★</span>';
    return`<div class="bchip" style="border-color:${b.color}"><span class="bchip-text">${b.label}</span><span class="bchip-tags">${ab}${b.team?'<span class="bchip-tag bt-team">Équipe</span>':''}${b.cond?'<span class="bchip-tag bt-cond">Condition</span>':''}</span></div>`;
  }).join('');
}

function renderCmpRow(nm,idx){
  const m=MONSTERS[nm],tot=totPts(m,nm),r=tot/MAX_T,c=sCol(r),col=SCOLS[idx];
  const awks=(m.awakenings||[]).filter(a=>a.level!==3);
  const a5=awks.find(a=>a.level===5),a7=awks.find(a=>a.level===7);
  const pts5=a5?awkPts(a5):0,pts7=a7?awkPts(a7):0;
  const sk=SKILLS(nm);
  const skPts=spellScore(sk.basic)+spellScore(sk.crit)+spellScore(sk.exclusive);
  const awkSum=Math.min((m.awakenings||[]).reduce((s,a)=>s+awkPts(a),0),MAX_AWK);
  return`<div class="mrow" style="border-left:4px solid ${col}">
    <div class="mrow-head">
      <div class="mrow-port"><img src="${IP}${nm}.png" onerror="this.style.display='none'"></div>
      <div class="mrow-port-rm" onclick="removeCmp(${idx})">×</div>
      <div class="mrow-info"><div class="mrow-name">${nm}</div><div class="mrow-type ${TCLS[m.type]||''}">${TLBL[m.type]}</div><div class="mrow-tagline">${genTagline(nm)}</div></div>
      <div class="mrow-score-wrap"><div class="mrow-score" style="color:${c}">${tot}</div><div class="mrow-score-sub">/ ${MAX_T}</div><div class="score-breakdown">Éveils : ${awkSum} pts<br>Sorts : ${skPts} pts</div><div class="mrow-bar"><div class="mrow-barf" style="width:${Math.round(Math.min(r,1)*100)}%;background:${c}"></div></div></div>
    </div>
    ${renderSpellPanel(nm)}
    <div class="mrow-body">
      <div class="mrow-awk">${a5?`<div class="awk-title lv5">Éveil 5★<span class="awk-pts-badge" style="color:${sCol(pts5/175)};background:var(--s3)">${pts5} pts</span></div>${buffChips(a5.buffs||[],nm)}`:'<div style="color:var(--tx2);font-size:.85rem;font-style:italic;padding:10px 0">Aucun éveil 5★</div>'}</div>
      <div class="mrow-div"></div>
      <div class="mrow-awk">${a7?`<div class="awk-title lv7">Éveil 7★<span class="awk-pts-badge" style="color:${sCol(pts7/175)};background:var(--s3)">${pts7} pts</span></div>${buffChips(a7.buffs||[],nm)}`:'<div style="color:var(--tx2);font-size:.85rem;font-style:italic;padding:10px 0">Aucun éveil 7★</div>'}</div>
    </div>
  </div>`;
}

function renderCmp(){
  const filled=selCmp.filter(Boolean);
  const list=document.getElementById('cmpList');
  const sb=document.getElementById('cmpShared');
  if(!filled.length){list.innerHTML='<div class="cmp-empty">Cliquez sur des portraits pour comparer jusqu\'à 3 monstres</div>';if(sb)sb.className='';return;}
  list.innerHTML=selCmp.map((nm,i)=>nm?renderCmpRow(nm,i):'').filter(Boolean).join('');
  if(sb&&filled.length>=2){
    const bsets=filled.map(nm=>{const awk=new Set((MONSTERS[nm].awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]));const sk=new Set(skillBuffsRaw(nm));return new Set([...awk,...sk]);});
    const shared=[...bsets[0]].filter(b=>bsets.every(s=>s.has(b)));
    if(shared.length){sb.className='show';document.getElementById('sharedChips').innerHTML=shared.map(id=>{const b=BUFFS[id];if(!b)return'';return`<span class="shchip" style="background:rgba(${rgb(b.color)},.12);color:${b.color};border:1px solid rgba(${rgb(b.color)},.25)">${b.label}</span>`;}).join('');}
    else sb.className='';
  }else if(sb)sb.className='';
}
function removeCmp(i){selCmp[i]=null;renderCmp();buildGrid();}
window.removeCmp=removeCmp;

function setSize(s){
  teamSize=s;
  document.querySelectorAll('#szRow .sz').forEach(b=>b.classList.toggle('on',+b.dataset.s===s));
  if(selTb.length>s)selTb=selTb.slice(0,s);
  renderTeam();buildGrid();
}
function clearTeam(){selTb=[];renderTeam();buildGrid();}
window.setSize=setSize;
window.clearTeam=clearTeam;

function calcTeamScores(members){
  let off=0,def=0,team=0;
  members.forEach(nm=>{
    const allIds=[...(MONSTERS[nm]?.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)];
    allIds.forEach(id=>{const pv=bVal(id);if(OFF_IDS.has(id))off+=pv;if(DEF_IDS.has(id))def+=pv;if(TEAM_IDS.has(id))team+=pv;});
  });
  return{off,def,team};
}

function calcReco(){
  if(!selTb.length)return[];
  const teamBufSet={};
  selTb.forEach(nm=>{[...(MONSTERS[nm]?.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)].forEach(id=>{teamBufSet[id]=(teamBufSet[id]||0)+1;});});
  return Object.keys(MONSTERS).filter(nm=>!selTb.includes(nm)).map(nm=>{
    const ids=new Set([...(MONSTERS[nm].awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)]);
    let syn=0;ids.forEach(id=>{if(teamBufSet[id])syn+=bVal(id);});
    syn+=getAwkLevel(nm)*5;
    return{nm,syn};
  }).sort((a,b)=>b.syn-a.syn).slice(0,10).map(x=>x.nm);
}

function renderSavesBar(){
  document.getElementById('tbSavesBar').innerHTML=teamSaves.map((s,i)=>`
    <div class="tb-save-slot${i===activeSlot?' active':''}" id="saveSlot${i}">
      <input class="tb-save-name" value="${s.name}" onchange="renameSave(${i},this.value)" title="Renommer">
      <button class="tb-save-load" onclick="loadSave(${i})" title="Charger">▶</button>
      <button class="tb-save-save" onclick="saveCurrent(${i})" title="Sauvegarder">💾</button>
    </div>`).join('');
}
window.renameSave=function(i,v){teamSaves[i].name=v||`Équipe ${i+1}`;saveTeamSaves();};
window.saveCurrent=function(i){teamSaves[i]={...teamSaves[i],members:[...selTb],size:teamSize};activeSlot=i;saveTeamSaves();renderSavesBar();};
window.loadSave=function(i){const s=teamSaves[i];teamSize=s.size||15;document.querySelectorAll('#szRow .sz').forEach(b=>b.classList.toggle('on',+b.dataset.s===teamSize));selTb=[...(s.members||[]).filter(nm=>MONSTERS[nm])];activeSlot=i;saveTeamSaves();renderTeam();buildGrid();renderSavesBar();};

function renderTeam(){
  const n=selTb.length;
  document.getElementById('tbCtr').textContent=`${n} / ${teamSize}`;
  document.getElementById('tbClrBtn').disabled=n===0;
  let h='';
  for(let i=0;i<teamSize;i++){
    if(i<n){const nm=selTb[i];h+=`<div class="tslot filled"><img src="${IP}${nm}.png" onerror="this.style.display='none'"><div class="tslot-name">${nm}</div><div class="tslot-rm" onclick="rmTb('${nm}')">×</div></div>`;}
    else h+=`<div class="tslot"><span class="tslot-plus">+</span></div>`;
  }
  document.getElementById('tbSlots').innerHTML=h;
  const{off,def,team}=calcTeamScores(selTb);
  const maxVal=300;
  document.getElementById('scoreOff').textContent=off;
  document.getElementById('scoreDef').textContent=def;
  document.getElementById('scoreTeam').textContent=team;
  document.getElementById('fillOff').style.width=Math.min(off/maxVal*100,100)+'%';
  document.getElementById('fillDef').style.width=Math.min(def/maxVal*100,100)+'%';
  document.getElementById('fillTeam').style.width=Math.min(team/maxVal*100,100)+'%';
  const reco=calcReco();
  const recoEl=document.getElementById('tbReco');
  if(reco.length&&selTb.length<teamSize){recoEl.style.display='flex';document.getElementById('recoChips').innerHTML=reco.map(nm=>`<div class="reco-chip" onclick="addFromReco('${nm}')" title="Ajouter ${nm}"><img src="${IP}${nm}.png" onerror="this.src=''">${nm}</div>`).join('');}
  else recoEl.style.display='none';
  const syn=document.getElementById('tbSyn');
  if(!n){syn.innerHTML='<div class="syn-empty">Ajoutez des monstres pour voir les synergies</div>';return;}
  const agg={};
  selTb.forEach(nm=>{
    const seen=new Set();
    [...(MONSTERS[nm].awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)].forEach(id=>{if(!seen.has(id)){seen.add(id);if(!agg[id])agg[id]={count:0,ms:[]};agg[id].count++;agg[id].ms.push(nm);}});
  });
  const co=b=>b.team?0:b.cond?2:1;
  const sorted=Object.entries(agg).sort(([ai,ad],[bi,bd])=>{const ba=BUFFS[ai],bb=BUFFS[bi],ca=co(ba||{}),cb=co(bb||{});if(ca!==cb)return ca-cb;if(bd.count!==ad.count)return bd.count-ad.count;return(bb?.power||0)-(ba?.power||0);});
  const cats=[{k:0,label:"Buffs d'équipe",color:'var(--gold)'},{k:1,label:'Buffs personnels',color:'var(--tx3)'},{k:2,label:'Conditionnels',color:'#a09020'}];
  const ce={0:[],1:[],2:[]};
  sorted.forEach(e=>{const b=BUFFS[e[0]];if(b)ce[co(b)].push(e);});
  syn.innerHTML=cats.filter(c=>ce[c.k].length).map(cat=>`<div class="syn-section"><div class="syn-section-title" style="color:${cat.color}">${cat.label} <span style="font-size:.68rem;color:var(--tx2);font-weight:400">(${ce[cat.k].length})</span></div><div class="syn-grid">${ce[cat.k].map(([id,{count,ms}])=>{const b=BUFFS[id];if(!b)return'';const src=ms.slice(0,2).join(', ')+(ms.length>2?` +${ms.length-2}`:'');return`<div class="syn-row${b.cond?' cond':''}"><div class="syn-dot" style="background:${b.color}"></div><span class="syn-lbl">${b.label}</span><span class="syn-src">${src}</span><span class="syn-cnt" style="color:${b.color}">×${count}</span></div>`;}).join('')}</div></div>`).join('');
}

window.addFromReco=function(nm){if(!selTb.includes(nm)&&selTb.length<teamSize){selTb.push(nm);renderTeam();buildGrid();}};
window.rmTb=function(nm){selTb=selTb.filter(n=>n!==nm);renderTeam();buildGrid();};

function setTlCat(c){tlCat=c;document.querySelectorAll('#tlCatRow .fp').forEach(b=>{b.className='fp';if(b.dataset.tc===c)b.classList.add('fa');});buildGrid();}
window.setTlCat=setTlCat;

function renderTierList(){
  document.getElementById('tlContent').innerHTML=TIERS.map(t=>`<div class="trow"><div class="trow-lbl" style="background:${t.bg}">${t.label}</div><div class="trow-drop" id="tier-${t.id}" ondragover="tlDragOver(event,'${t.id}')" ondragleave="this.classList.remove('drag-over')" ondrop="tlDrop(event,'${t.id}')">${tlData[t.id].map(nm=>tlPcHTML(nm,t.id)).join('')}</div></div>`).join('');
  document.getElementById('tlPool').style.display='none';
  buildGrid();
}
function tlPcHTML(nm,tid){return`<div class="tl-pc" draggable="true" ondragstart="tlTierDragStart(event,'${nm}','${tid}')" ondragend="tlDragEnd()"><img src="${IP}${nm}.png" onerror="this.src=''"><div class="tl-pc-name">${nm}</div><div class="tl-pc-rm" onclick="tlRemove('${nm}','${tid}')">×</div></div>`;}
window.tlTierDragStart=function(e,nm,from){tlDragName=nm;tlDragFrom=from;e.dataTransfer.effectAllowed='move';};
window.tlDragEnd=function(){tlDragName=null;tlDragFrom=null;};
window.tlDragOver=function(e,tid){e.preventDefault();document.getElementById('tier-'+tid).classList.add('drag-over');};
window.tlDrop=function(e,tid){e.preventDefault();document.getElementById('tier-'+tid).classList.remove('drag-over');if(!tlDragName)return;if(tlDragFrom&&tlDragFrom!=='pool')tlData[tlDragFrom]=tlData[tlDragFrom].filter(n=>n!==tlDragName);if(!tlData[tid].includes(tlDragName))tlData[tid].push(tlDragName);renderTierList();buildGrid();};
window.tlRemove=function(nm,tid){tlData[tid]=tlData[tid].filter(n=>n!==nm);renderTierList();buildGrid();};
window.resetTier=function(){TIERS.forEach(t=>tlData[t.id]=[]);renderTierList();buildGrid();};

const ME_ORDER=Object.keys(MONSTERS).sort((a,b)=>totPts(MONSTERS[b],b)-totPts(MONSTERS[a],a));

function myPts(nm){
  const m=MONSTERS[nm];if(!m)return 0;
  const s=getAwkSet(nm);
  return(m.awakenings||[]).filter(a=>s.has(a.level)).reduce((sum,a)=>sum+awkPts(a),0);
}

function renderMesEveils(){
  const q=document.getElementById('srch').value.toLowerCase();
  const grid=document.getElementById('meGridInner');
  if(!grid)return;
  const filtered=ME_ORDER.filter(nm=>{
    if(meType&&MONSTERS[nm].type!==meType)return false;
    if(q&&!nm.toLowerCase().includes(q))return false;
    return true;
  });
  const fMax=filtered.reduce((s,nm)=>s+totPts(MONSTERS[nm],nm),0);
  const fEarned=filtered.reduce((s,nm)=>s+myPts(nm),0);
  const pct=fMax>0?Math.round(fEarned/fMax*100):0;
  const col=sCol(pct/100);
  const si=document.getElementById('meScoreInline');
  if(si)si.innerHTML=`<span style="color:${col}">${fEarned}</span><span style="color:var(--tx2);font-size:.78rem"> / ${fMax} pts (${pct}%)</span>`;
  const existing=new Set([...grid.querySelectorAll('[data-me-nm]')].map(el=>el.dataset.meNm));
  const needed=new Set(filtered);
  [...grid.querySelectorAll('[data-me-nm]')].forEach(el=>{if(!needed.has(el.dataset.meNm))el.remove();});
  filtered.forEach(nm=>{if(!existing.has(nm))grid.appendChild(buildMeCard(nm));});
  filtered.forEach(nm=>{const el=grid.querySelector(`[data-me-nm="${nm}"]`);if(el)grid.appendChild(el);});
  filtered.forEach(nm=>updateMeCard(nm));
  renderMeRecap();
}

function buildMeCard(nm){
  const m=MONSTERS[nm];
  const mxPts=totPts(m,nm);
  const div=document.createElement('div');
  div.className='me-card';
  div.dataset.meNm=nm;
  div.innerHTML=`<div class="me-card-top"><img class="me-card-img" src="${IP}${nm}.png" onerror="this.style.display='none'"><div class="me-card-mid"><div class="me-card-name">${nm}</div><div class="me-card-tagline">${genTagline(nm)}</div><div class="me-card-type ${TCLS[m.type]||''}">${TLBL[m.type]}</div></div><div class="me-card-score"><span class="sc-earned" style="color:var(--tx2)">0</span><span class="sc-sep">/ ${mxPts} pts</span></div></div><div class="me-card-bot"><button class="me-awk-btn" data-lv="3" onclick="toggleAwk('${nm}',3)">Éveil 3</button><button class="me-awk-btn" data-lv="5" onclick="toggleAwk('${nm}',5)">Éveil 5★</button><button class="me-awk-btn" data-lv="7" onclick="toggleAwk('${nm}',7)">Éveil 7★</button></div><div class="me-card-buffs"></div>`;
  return div;
}
window.toggleAwk=toggleAwk;

function updateMeCard(nm){
  const m=MONSTERS[nm];if(!m)return;
  const s=getAwkSet(nm);
  const has3=s.has(3),has5=s.has(5),has7=s.has(7);
  const mxPts=totPts(m,nm);
  const earned=myPts(nm);
  const scoreCol=earned>0?sCol(earned/mxPts):'var(--tx2)';
  const cardCls=has7?'awk7':has5?'awk5':has3?'awk3':'';
  const card=document.querySelector(`#meGridInner [data-me-nm="${nm}"]`);
  if(!card)return;
  card.className='me-card'+(cardCls?' '+cardCls:'');
  const sc=card.querySelector('.sc-earned');
  if(sc){sc.textContent=earned;sc.style.color=scoreCol;}
  card.querySelectorAll('.me-awk-btn').forEach(btn=>{const lv=+btn.dataset.lv;btn.className='me-awk-btn'+(s.has(lv)?' awk'+lv+'-on':'');});
  const activeBuffs=[];
  if(has3){const a=(m.awakenings||[]).find(a=>a.level===3);if(a)activeBuffs.push(...(a.buffs||[]));}
  if(has5){const a=(m.awakenings||[]).find(a=>a.level===5);if(a)activeBuffs.push(...(a.buffs||[]));}
  if(has7){const a=(m.awakenings||[]).find(a=>a.level===7);if(a)activeBuffs.push(...(a.buffs||[]));}
  const buffsEl=card.querySelector('.me-card-buffs');
  if(buffsEl)buffsEl.innerHTML=activeBuffs.map(id=>{const b=BUFFS[id];if(!b)return'';return`<div class="me-mini-chip" style="border-color:${b.color}">${b.label}</div>`;}).join('');
}

function renderMeRecap(){
  const cnt3=Object.keys(myAwakenings).filter(nm=>getAwkSet(nm).has(3)).length;
  const cnt5=Object.keys(myAwakenings).filter(nm=>getAwkSet(nm).has(5)).length;
  const cnt7=Object.keys(myAwakenings).filter(nm=>getAwkSet(nm).has(7)).length;
  const s3=document.getElementById('meStat3');const s5=document.getElementById('meStat5');const s7=document.getElementById('meStat7');
  if(s3)s3.textContent=cnt3;if(s5)s5.textContent=cnt5;if(s7)s7.textContent=cnt7;
  const buffAgg={};
  Object.entries(myAwakenings).forEach(([nm,lvArr])=>{
    const m=MONSTERS[nm];if(!m)return;
    const sv=new Set(Array.isArray(lvArr)?lvArr:[lvArr]);
    (m.awakenings||[]).forEach(a=>{if(!sv.has(a.level))return;(a.buffs||[]).forEach(id=>{const b=BUFFS[id];if(!b||!b.cond)return;if(!buffAgg[id])buffAgg[id]=0;buffAgg[id]++;});});
  });
  const body=document.getElementById('meRecapBuffs');
  if(body)body.innerHTML=Object.entries(buffAgg).sort(([,a],[,b])=>b-a).map(([id,cnt])=>{const b=BUFFS[id];if(!b)return'';return`<div class="me-buff-chip" style="border-color:${b.color}">${b.label}<span class="me-buff-chip-cnt">×${cnt}</span></div>`;}).join('');
}

window.toggleMeRecap=function(){meRecapOpen=!meRecapOpen;document.getElementById('meRecap').className='me-recap '+(meRecapOpen?'expanded':'collapsed');const btn=document.getElementById('meRecapToggle');if(btn)btn.textContent=meRecapOpen?'▲ Réduire':'▼ Détails';};
window.exportAwk=function(){const blob=new Blob([JSON.stringify(myAwakenings,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sw_eveils.json';a.click();};
window.importAwk=function(){const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{Object.assign(myAwakenings,JSON.parse(ev.target.result));saveAwk();document.getElementById('meGridInner').innerHTML='';renderMesEveils();}catch{}};reader.readAsText(file);};input.click();};
window.resetAwk=function(){if(!confirm('Réinitialiser tous vos éveils ?'))return;myAwakenings={};saveAwk();document.getElementById('meGridInner').innerHTML='';renderMesEveils();};

window.switchTab=switchTab;
window.onSearch=onSearch;

renderSavesBar();
buildGrid();renderCmp();renderTeam();
