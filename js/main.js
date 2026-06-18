const TCOL={melee:'var(--mel)',tank:'var(--tnk)',range:'var(--rng)',support:'var(--sup)'};
const TLBL={melee:'Mêlée',tank:'Tank',range:'Range',support:'Support'};
const TCLS={melee:'tc-m',tank:'tc-t',range:'tc-r',support:'tc-s'};
const SCOLS=['#4888d8','#c89020','#d84040'];
const TIERS=[{id:'S',label:'S',bg:'#b83030'},{id:'A',label:'A',bg:'#c07020'},{id:'B',label:'B',bg:'#a09020'},{id:'C',label:'C',bg:'#408830'},{id:'D',label:'D',bg:'#505080'}];

const OFF_IDS=new Set(['atk_10','atk_20','atk_25_delay','atk_80','atk_100','atk_up_stack','dmg_15','dmg_20','dmg_150','dmg_aoe_scaling','dmg_buff_scaling','dmg_debuff_scaling','dmg_unique_target','dmg_frozen_50','dmg_stunned_50','dmg_def_down_50','dmg_cc_50','dmg_poisoned_20','dmg_bleed_20','dmg_burned_20','dmg_sleeping_20','dmg_dot_50','dmg_petrified_20','crit_rate_10','crit_rate_10_cond','crit_rate_50','crit_dmg_10_cond','crit_dmg_20','no_crit_cd','crush_rate_10','crush_rate_10_cond','crush_dmg_20','crush_dmg_20_ally','crush_rate_20_ally','double_hit_10','double_hit_15','double_hit_10_cond','triple_hit_10','spd_10','spd_15','spd_15_cond','spd_30','spd_40_cond','move_spd_200','skill_accel_15','skill_accel_20_cond','cd_reset_proc','cd_skill_cond','exclusive_cd_down','range_3','range_5','aoe_range_30','aoe_range_30_cond','cc_eff_20','stealth','strip_shield','bleed','dot_poison','weakness_poison_enemy','weakness_element','debuff_aoe_taken_10','debuff_crit_taken_10','block_shield','target_weakness_provoke','target_weakness_immunity','target_weakness_shield','atk_down_ennemy_count','bloom_stack','full_bloom','fox_fire_cond','fox_fire_burst','rockstar_i','rockstar_iii_cond','happy_box_cond','lifesteal_15_cond','provoke_status','dmg_down_provoked','weak_point_detect','weakness_elem_team']);
const DEF_IDS=new Set(['def_15','hp_max_15_cond','res_lp_30','dmg_resist_10','dmg_resist_15_cond','dmg_resist_20_cond','dmg_resist_20_team','dmg_resist_80_cond','shield_hits_3_team','shield_hits_5','stealth_shield','protection_shield','endurance_cond','dodge_3s','limit_shield','cc_immune_team_30','cc_immune_self_react','fran_blessing_team']);
const TEAM_IDS=new Set(['spd_team_20','shield_hits_3_team','dmg_resist_20_team','cc_immune_team_30','fran_blessing_team','merry_box_team_cond','crush_rate_10_team','weakness_elem_team','double_triple_dmg_team','teamwork_stack','one_team_one_spirit','perfect_team','limit_shield','class_share_melee','target_weakness_provoke','target_weakness_shield','weak_point_detect']);

let selCmp=[null,null],selTb=[],activeTab='cmp',activeType='',activeCat='',teamSize=15;
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
let excludedFromReco=JSON.parse(localStorage.getItem('sw_excluded_reco')||'[]');
function saveExcluded(){localStorage.setItem('sw_excluded_reco',JSON.stringify(excludedFromReco));}
function toggleExclude(nm){
  const i=excludedFromReco.indexOf(nm);
  if(i!==-1)excludedFromReco.splice(i,1);else excludedFromReco.push(nm);
  saveExcluded();
  updateMeCard(nm);
}
let tdoMode = false;
let tdoTeams = JSON.parse(localStorage.getItem('sw_tdo_teams') || JSON.stringify([
  {name:'Compo 1', teams:[{name:'Équipe A',members:[]},{name:'Équipe B',members:[]},{name:'Équipe C',members:[]}]},
  {name:'Compo 2', teams:[{name:'Équipe A',members:[]},{name:'Équipe B',members:[]},{name:'Équipe C',members:[]}]},
  {name:'Compo 3', teams:[{name:'Équipe A',members:[]},{name:'Équipe B',members:[]},{name:'Équipe C',members:[]}]},
]));
let tdoActiveCompo = 0;
let tdoActiveTeam = 0;
let tdoStrategies = ['balanced','balanced','balanced'];
function saveTdo(){localStorage.setItem('sw_tdo_teams',JSON.stringify(tdoTeams));}
let activeSlot=-1;

function saveTeamSaves(){localStorage.setItem('sw_team_saves',JSON.stringify(teamSaves));}
function saveAwk(){localStorage.setItem('sw_my_awk',JSON.stringify(myAwakenings));}
function getAwkSet(nm){const v=myAwakenings[nm];return new Set(Array.isArray(v)?v:(v?[v]:[]));}
function getAwkLevel(nm){const s=getAwkSet(nm);return s.has(7)?7:s.has(5)?5:s.has(3)?3:0;}

let gdgMode = false;
let gdgTeams = JSON.parse(localStorage.getItem('sw_gdg_teams') || JSON.stringify([
  {name:'Compo 1', teams:[{name:'Équipe A',members:[]},{name:'Équipe B',members:[]},{name:'Équipe C',members:[]}]},
  {name:'Compo 2', teams:[{name:'Équipe A',members:[]},{name:'Équipe B',members:[]},{name:'Équipe C',members:[]}]},
  {name:'Compo 3', teams:[{name:'Équipe A',members:[]},{name:'Équipe B',members:[]},{name:'Équipe C',members:[]}]},
]));
let gdgActiveCompo = 0;
let gdgActiveTeam = 0;
let gdgStrategies = ['balanced','balanced','balanced'];
const GDG_TEAM_SIZE = 10;
function saveGdg(){localStorage.setItem('sw_gdg_teams',JSON.stringify(gdgTeams));}

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
  ['cmp','tb','tl','me','faq'].forEach(id=>{
    document.getElementById('tab-'+id).classList.toggle('on',id===t);
    document.getElementById('panel'+id.charAt(0).toUpperCase()+id.slice(1)).className='panel '+(id===t?'on':'off');
  });
  const sb=document.getElementById('sb');
  if(t==='me'||t==='faq')sb.classList.add('me-mode');
  else{sb.classList.remove('me-mode');buildGrid();}
  if(t==='tl')renderTierList();
  if(t==='me')renderMesEveils();
  if(t==='tb')renderStrategyPicker();
  if(t==='faq'){buildSwFaqCats();renderSwFaq();}
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
    const tdoUsed=tdoMode?getTdoUsed(tdoActiveTeam):new Set();
    const tdoInCurrent=tdoMode&&tdoTeams[tdoActiveCompo].teams[tdoActiveTeam].members.includes(nm);
    const tdoBlocked=tdoMode&&tdoUsed.has(nm);
    const gdgUsed=gdgMode?getGdgUsed(gdgActiveTeam):new Set();
    const gdgInCurrent=gdgMode&&gdgTeams[gdgActiveCompo].teams[gdgActiveTeam].members.includes(nm);
    const gdgBlocked=gdgMode&&gdgUsed.has(nm);
    let badge='';
    if(tdoMode){
      if(tdoBlocked)badge=`<div class="pc-badge" style="background:rgba(200,48,48,.4);color:#ff8888">✗</div>`;
      else if(tdoInCurrent)badge=`<div class="pc-badge" style="background:rgba(168,212,40,.2);color:var(--green2)">✓</div>`;
    }else if(gdgMode){
      if(gdgBlocked)badge=`<div class="pc-badge" style="background:rgba(200,48,48,.4);color:#ff8888">✗</div>`;
      else if(gdgInCurrent)badge=`<div class="pc-badge" style="background:rgba(220,140,40,.2);color:#dc8c28">✓</div>`;
    }else if(activeTab==='tl'&&tier){
      const bg=TIERS.find(t=>t.id===tier)?.bg||'#666';
      badge=`<div class="pc-badge" style="background:${bg};color:#fff;font-size:.55rem">${tier}</div>`;
    }else if(iC!==-1){
      badge=`<div class="pc-badge" style="background:rgba(${rgb(SCOLS[iC])},.3);color:${SCOLS[iC]}">${iC+1}</div>`;
    }else if(iT){
      badge=`<div class="pc-badge" style="background:rgba(168,212,40,.2);color:var(--green2)">✓</div>`;
    }
    d.innerHTML=`<img src="${IP}${nm}.png" loading="lazy" onerror="this.src=''" style="${(tdoBlocked||gdgBlocked)?'opacity:.35':''}">
      <div class="pc-type" style="color:${TCOL[m.type]}">${{melee:'⚔',tank:'🛡',range:'🏹',support:'💚'}[m.type]}</div>
      ${badge}
      <div class="pc-bot"><div class="pc-name">${nm}</div><div class="pc-score" style="color:${sc}">${tot}</div></div>`;
    if(tdoBlocked||gdgBlocked)d.style.opacity='.35';
    d.addEventListener('dragstart',e=>{tlDragName=nm;tlDragFrom='pool';e.dataTransfer.effectAllowed='copy';});
    d.addEventListener('click',()=>{
      if(activeTab==='cmp'){
        const i=selCmp.indexOf(nm);
        if(i!==-1){
          selCmp[i]=null;
        }else{
          const fi=selCmp.indexOf(null);
          if(fi!==-1){ selCmp[fi]=nm; }
          else{ selCmp.shift(); selCmp.push(nm); }
        }
        renderCmp();
      }else if(activeTab==='tb'){
        if(tdoMode){tdoAddMonster(nm);}
        else if(gdgMode){gdgAddMonster(nm);}
        else{const i=selTb.indexOf(nm);if(i!==-1)selTb.splice(i,1);else if(selTb.length<teamSize)selTb.push(nm);renderTeam();}
      }else if(activeTab==='tl'){
        if(!tier){tlData['B'].push(nm);renderTierList();}
      }
      buildGrid();
    });
    g.appendChild(d);
  });
}

// ── Accordéon sorts ──────────────────────────────────────────────────────────
function toggleAccordion(id){
  const body=document.getElementById('acc-body-'+id);
  const arrow=document.getElementById('acc-arrow-'+id);
  if(!body||!arrow)return;
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  arrow.classList.toggle('open',!isOpen);
}

function renderSpellPanel(nm){
  const sk=SKILLS(nm);

  function renderOneAcc(s, type, label, uid){
    const sc   = spellScore(s||{});
    const r    = sc / MAX_SPELL_EACH;
    const col  = sCol(r);

    if(!s) return `<div class="skill-accordion">
      <div class="skill-acc-header" onclick="toggleAccordion('${uid}')">
        <span class="skill-type ${type}">${label}</span>
        <span class="skill-acc-name" style="color:var(--tx2);font-style:italic">Non renseigné</span>
        <span class="skill-acc-score" style="color:var(--tx2)">—</span>
        <span class="skill-acc-arrow" id="acc-arrow-${uid}">▼</span>
      </div>
    </div>`;

    const cd   = s.cd>0 ? `<div class="skill-cd">Recharge : ${s.cd}s</div>` : '';
    const meta = `<div class="skill-meta">
      ${s.atk_pct  ? `<span class="skill-meta-tag atk">${s.atk_pct}% ATQ</span>` : ''}
      ${(s.hits||1)>1 ? `<span class="skill-meta-tag hit">×${s.hits} coups</span>` : ''}
      ${s.aoe ? `<span class="skill-meta-tag aoe">Zone</span>` : '<span class="skill-meta-tag">Cible unique</span>'}
    </div>`;
    const buffsHtml = s.buffs&&s.buffs.length
      ? `<div class="skill-buffs">${s.buffs.map(id=>{const b=BUFFS[id];if(!b)return'';return`<span class="skill-buff-chip" style="border-color:${b.color}">${b.label}</span>`;}).join('')}</div>`
      : '';

    return `<div class="skill-accordion">
      <div class="skill-acc-header" onclick="toggleAccordion('${uid}')">
        <span class="skill-type ${type}">${label}</span>
        <span class="skill-acc-name">${s.name||'—'}</span>
        <span class="skill-acc-score" style="color:${col}">${sc}/100</span>
        <span class="skill-acc-arrow" id="acc-arrow-${uid}">▼</span>
      </div>
      <div class="skill-acc-body" id="acc-body-${uid}">
        <div class="skill-desc">${s.desc||''}</div>
        ${cd}
        ${meta}
        ${buffsHtml}
        <div class="skill-score-bar"><div class="skill-score-fill" style="width:${Math.round(r*100)}%;background:${col}"></div></div>
        <div class="skill-score-lbl">Score : <span style="color:${col}">${sc}</span> / 100</div>
      </div>
    </div>`;
  }

  const base=nm.replace(/[^a-z0-9]/gi,'');
  return `<div class="mrow-skills-wrap">
    ${renderOneAcc(sk.basic,    'basic',     'Attaque de base',    base+'_b')}
    ${renderOneAcc(sk.crit,     'crit',      'Attaque critique',   base+'_c')}
    ${renderOneAcc(sk.exclusive,'exclusive', 'Compétence exclusive',base+'_e')}
  </div>`;
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
    return`<div class="bchip" style="border-color:${b.color}">
      <span class="bchip-text">${b.label}</span>
      <span class="bchip-tags">${ab}${b.team?'<span class="bchip-tag bt-team">Équipe</span>':''}${b.cond?'<span class="bchip-tag bt-cond">Condition</span>':''}</span>
    </div>`;
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
      <div class="mrow-info">
        <div class="mrow-name">${nm}</div>
        <div class="mrow-type ${TCLS[m.type]||''}">${TLBL[m.type]}</div>
        <div class="mrow-tagline">${genTagline(nm)}</div>
      </div>
      <div class="mrow-score-wrap">
		<div class="mrow-score" style="color:${c}">${tot}</div>
		<div class="mrow-score-sub">/ ${MAX_T}</div>
		<div class="score-breakdown">Éveils : ${awkSum} pts<br>Sorts : ${skPts} pts</div>
		<div class="mrow-bar"><div class="mrow-barf" style="width:${Math.round(Math.min(r,1)*100)}%;background:${c}"></div></div>
		<button onclick="showSimilarMonsters('${nm}')" style="margin-top:10px;font-size:.78rem;font-weight:700;padding:7px 14px;border-radius:5px;border:1px solid rgba(168,212,40,.45);background:rgba(168,212,40,.12);color:var(--green2);cursor:pointer;font-family:inherit;white-space:nowrap">🔗 Voir les monstres similaires</button>
	  </div>
    </div>
    ${renderSpellPanel(nm)}
    <div class="mrow-body">
      <div class="mrow-awk">
        ${a5?`<div class="awk-title lv5">Éveil 5★<span class="awk-pts-badge" style="color:${sCol(pts5/175)};background:var(--s3)">${pts5} pts</span></div>${buffChips(a5.buffs||[],nm)}`:
        '<div style="color:var(--tx2);font-size:.85rem;font-style:italic;padding:10px 0">Aucun éveil 5★</div>'}
      </div>
      <div class="mrow-div"></div>
      <div class="mrow-awk">
        ${a7?`<div class="awk-title lv7">Éveil 7★<span class="awk-pts-badge" style="color:${sCol(pts7/175)};background:var(--s3)">${pts7} pts</span></div>${buffChips(a7.buffs||[],nm)}`:
        '<div style="color:var(--tx2);font-size:.85rem;font-style:italic;padding:10px 0">Aucun éveil 7★</div>'}
      </div>
    </div>
	<div id="simWrap_${nm.replace(/[^a-z0-9]/gi,'')}" style="display:none;padding:0 18px 14px"></div>
  </div>`;
}

function renderCmp(){
  const filled=selCmp.filter(Boolean);
  const list=document.getElementById('cmpList');
  const sb=document.getElementById('cmpShared');
  if(!filled.length){
    list.style.flexDirection='column';
    list.innerHTML='<div class="cmp-empty" style="flex-direction:column;gap:6px;text-align:center"><span>Cliquez sur des portraits pour comparer jusqu\'à 2 monstres</span><span style="font-size:.8rem;color:var(--tx2)">Ps : Les valeurs sont pour avoir un visuel, ils ne représente en rien la réalité du terrain étant donner qu\'un monstre dépend surtout de la compo qui l\'entoure.</span></div>';
    if(sb)sb.className='';return;
  }
  if(filled.length===1){
    const idx=selCmp.indexOf(filled[0]);
    list.style.flexDirection='column';
    list.innerHTML=renderCmpRowSolo(filled[0],idx);
  } else {
    list.style.flexDirection='row';
    list.style.alignItems='flex-start';
    const html=selCmp.map((nm,i)=>nm?`<div style="flex:1;min-width:0">${renderCmpRowSolo(nm,i)}</div>`:'').filter(Boolean).join('');
    list.innerHTML=`<div style="display:flex;gap:10px;width:100%">${html}</div>`;
  }
  if(sb&&filled.length>=2){
    const bsets=filled.map(nm=>{
      const awk=new Set((MONSTERS[nm].awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]));
      const sk=new Set(skillBuffsRaw(nm));
      return new Set([...awk,...sk]);
    });
    const shared=[...bsets[0]].filter(b=>bsets.every(s=>s.has(b)));
    if(shared.length){
      sb.className='show';
      document.getElementById('sharedChips').innerHTML=shared.map(id=>{const b=BUFFS[id];if(!b)return'';return`<span class="shchip" style="background:rgba(${rgb(b.color)},.12);color:${b.color};border:1px solid rgba(${rgb(b.color)},.25)">${b.label}</span>`;}).join('');
    }else sb.className='';
  }else if(sb)sb.className='';
}
function removeCmp(i){selCmp[i]=null;renderCmp();buildGrid();}

function setSize(s){
  teamSize=s;
  document.querySelectorAll('#szRow .sz').forEach(b=>b.classList.toggle('on',+b.dataset.s===s));
  if(selTb.length>s)selTb=selTb.slice(0,s);
  renderTeam();buildGrid();
}
function clearTeam(){selTb=[];renderTeam();buildGrid();}

function calcTeamScores(members){
  let off=0,def=0,team=0;
  members.forEach(nm=>{
    const allIds=[
      ...(MONSTERS[nm]?.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),
      ...skillBuffsRaw(nm)
    ];
    allIds.forEach(id=>{
      const pv=bVal(id);
      if(OFF_IDS.has(id))off+=pv;
      if(DEF_IDS.has(id))def+=pv;
      if(TEAM_IDS.has(id))team+=pv;
    });
  });
  return{off,def,team};
}

function calcReco(){
  if(!selTb.length) return [];
  const remaining = teamSize - selTb.length;
  if(remaining <= 0) return [];

  const strat = STRATEGIES[teamStrategy] || STRATEGIES.balanced;
  const W = strat.buffWeight;

  const teamBufSet={};
  selTb.forEach(nm=>{
    [...(MONSTERS[nm]?.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),
     ...skillBuffsRaw(nm)
    ].forEach(id=>{ teamBufSet[id]=(teamBufSet[id]||0)+1; });
  });

  const typeCounts={melee:0,tank:0,range:0,support:0};
  selTb.forEach(nm=>{ if(MONSTERS[nm]) typeCounts[MONSTERS[nm].type]++; });

  const frontTarget   = Math.round(teamSize * strat.typeRatio.front);
  const rangeTarget   = Math.round(teamSize * strat.typeRatio.range);
  const supportTarget = teamSize - frontTarget - rangeTarget;

  const frontNeed   = frontTarget   - ((typeCounts.melee||0)+(typeCounts.tank||0));
  const rangeNeed   = rangeTarget   - (typeCounts.range||0);
  const supportNeed = supportTarget - (typeCounts.support||0);

  const synPairs={
    'crush_dmg_20_team':['crush_rate_10','crush_rate_10_team','crush_rate_20'],
    'crush_rate_10_team':['crush_dmg_20','crush_dmg_20_team'],
    'crit_dmg_team_20':['crit_rate_10','crit_rate_team_20','crit_rate_50'],
    'crit_rate_team_20':['crit_dmg_20','crit_dmg_team_20'],
    'double_hit_team_20':['double_triple_dmg_team','full_bloom'],
    'triple_hit_team_10':['double_triple_dmg_team','full_bloom'],
    'full_bloom':['double_triple_dmg_team','crit_rate_team_20'],
    'spd_team_20':['skill_accel_20_team','skill_accel_15_team'],
    'dmg_resist_20_team':['shield_hits_3_team','limit_shield'],
  };

  function buffCategory(id){
    if(OFF_IDS.has(id))  return 'off';
    if(DEF_IDS.has(id))  return 'def';
    if(TEAM_IDS.has(id)) return 'team';
    return 'off';
  }

  return Object.keys(MONSTERS).filter(nm=>!selTb.includes(nm)&&!excludedFromReco.includes(nm))
    .map(nm=>{
      const m = MONSTERS[nm];
      const ids = new Set([
        ...(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),
        ...skillBuffsRaw(nm)
      ]);

      let synScore=0;
      ids.forEach(id=>{
        const b=BUFFS[id]; if(!b) return;
        const v   = bVal(id);
        const cat = buffCategory(id);
        const w   = W[cat] ?? 1.0;
        if(!teamBufSet[id]){
          synScore += b.team ? v*w*1.4 : v*w;
        } else if(b.team){
          synScore += v*w*0.5;
        } else {
          synScore -= v*0.3;
        }
        // Bonus synergie paires
        if(synPairs[id]){
          synPairs[id].forEach(pid=>{
            if(teamBufSet[pid]) synScore += bVal(id)*(w)*0.5;
          });
        }
        // Cross-synergie base→team
        const baseId=id.replace(/_team$/,'').replace(/_20_team$/,'_20').replace(/_10_team$/,'_10');
        if(b.team&&teamBufSet[baseId]) synScore += v*w*0.7;
      });

      let compScore=0;
      const isFront   = m.type==='melee'||m.type==='tank';
      const isRange   = m.type==='range';
      const isSupport = m.type==='support';
      const compW     = W.off+W.def+W.team;

      if(isFront)   compScore += frontNeed   > 0 ? (35+frontNeed*12)*(compW/3)   : (frontNeed   < -1 ? -30 : 0);
      if(isRange)   compScore += rangeNeed   > 0 ? (35+rangeNeed*12)*(compW/3)   : (rangeNeed   < -1 ? -30 : 0);
      if(isSupport) compScore += supportNeed > 0 ? (55+supportNeed*18)*(compW/3) : (supportNeed < -1 ? -40 : 0);
      if(isSupport && strat.typeRatio.support === 0) compScore -= 80;

      const awkBonus = getAwkLevel(nm)*6;

      let urgencyPenalty=0;
      if(remaining===1){
        const maxNeed=Math.max(frontNeed,rangeNeed,supportNeed);
        if(isFront   && frontNeed   < maxNeed) urgencyPenalty=-25;
        if(isRange   && rangeNeed   < maxNeed) urgencyPenalty=-25;
        if(isSupport && supportNeed < maxNeed) urgencyPenalty=-25;
      }

      return{ nm, total: synScore+compScore+awkBonus+urgencyPenalty };
    })
    .sort((a,b)=>b.total-a.total)
    .slice(0,10)
    .map(x=>x.nm);
}

function renderSavesBar(){
  document.getElementById('tbSavesBar').innerHTML=teamSaves.map((s,i)=>`
    <div class="tb-save-slot${i===activeSlot?' active':''}" id="saveSlot${i}">
      <input class="tb-save-name" value="${s.name}" onchange="renameSave(${i},this.value)" title="Renommer">
      <button class="tb-save-load" onclick="loadSave(${i})" title="Charger">▶</button>
      <button class="tb-save-save" onclick="saveCurrent(${i})" title="Sauvegarder">💾</button>
    </div>`).join('');
}

function saveCurrent(i){teamSaves[i]={...teamSaves[i],members:[...selTb],size:teamSize};activeSlot=i;saveTeamSaves();renderSavesBar();}
function loadSave(i){
  const s=teamSaves[i];
  teamSize=s.size||15;
  document.querySelectorAll('#szRow .sz').forEach(b=>b.classList.toggle('on',+b.dataset.s===teamSize));
  selTb=[...(s.members||[]).filter(nm=>MONSTERS[nm])];
  activeSlot=i;saveTeamSaves();renderTeam();buildGrid();renderSavesBar();
}
function renameSave(i,v){teamSaves[i].name=v||`Équipe ${i+1}`;saveTeamSaves();}

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
  if(reco.length&&selTb.length<teamSize){
    recoEl.style.display='flex';
    document.getElementById('recoChips').innerHTML=reco.map(nm=>`<div class="reco-chip" onclick="addFromReco('${nm}')" title="Ajouter ${nm}"><img src="${IP}${nm}.png" onerror="this.src=''">${nm}</div>`).join('');
  }else recoEl.style.display='none';
  const syn=document.getElementById('tbSyn');
  if(!n){syn.innerHTML='<div class="syn-empty">Ajoutez des monstres pour voir les synergies</div>';return;}
  const agg={};
  selTb.forEach(nm=>{
    const seen=new Set();
    [...(MONSTERS[nm].awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)]
      .forEach(id=>{if(!seen.has(id)){seen.add(id);if(!agg[id])agg[id]={count:0,ms:[]};agg[id].count++;agg[id].ms.push(nm);}});
  });
  const co=b=>b.team?0:b.cond?2:1;
  const sorted=Object.entries(agg).sort(([ai,ad],[bi,bd])=>{
    const ba=BUFFS[ai],bb=BUFFS[bi],ca=co(ba||{}),cb=co(bb||{});
    if(ca!==cb)return ca-cb;if(bd.count!==ad.count)return bd.count-ad.count;return(bb?.power||0)-(ba?.power||0);
  });
  const cats=[{k:0,label:"Buffs d'équipe",color:'var(--gold)'},{k:1,label:'Buffs personnels',color:'var(--tx3)'},{k:2,label:'Conditionnels',color:'#a09020'}];
  const ce={0:[],1:[],2:[]};
  sorted.forEach(e=>{const b=BUFFS[e[0]];if(b)ce[co(b)].push(e);});
  syn.innerHTML=cats.filter(c=>ce[c.k].length).map(cat=>`
    <div class="syn-section">
      <div class="syn-section-title" style="color:${cat.color}">${cat.label} <span style="font-size:.68rem;color:var(--tx2);font-weight:400">(${ce[cat.k].length})</span></div>
      <div class="syn-grid">${ce[cat.k].map(([id,{count,ms}])=>{
        const b=BUFFS[id];if(!b)return'';
        const src=ms.slice(0,2).join(', ')+(ms.length>2?` +${ms.length-2}`:'');
        return`<div class="syn-row${b.cond?' cond':''}"><div class="syn-dot" style="background:${b.color}"></div><span class="syn-lbl">${b.label}</span><span class="syn-src">${src}</span><span class="syn-cnt" style="color:${b.color}">×${count}</span></div>`;
      }).join('')}</div>
    </div>`).join('');
}

function addFromReco(nm){if(!selTb.includes(nm)&&selTb.length<teamSize){selTb.push(nm);renderTeam();buildGrid();}}
function rmTb(nm){selTb=selTb.filter(n=>n!==nm);renderTeam();buildGrid();}

function setTlCat(c){
  tlCat=c;
  document.querySelectorAll('#tlCatRow .fp').forEach(b=>{b.className='fp';if(b.dataset.tc===c)b.classList.add('fa');});
  buildGrid();
}
function renderTierList(){
  document.getElementById('tlContent').innerHTML=TIERS.map(t=>`
    <div class="trow">
      <div class="trow-lbl" style="background:${t.bg}">${t.label}</div>
      <div class="trow-drop" id="tier-${t.id}" ondragover="tlDragOver(event,'${t.id}')" ondragleave="this.classList.remove('drag-over')" ondrop="tlDrop(event,'${t.id}')">
        ${tlData[t.id].map(nm=>tlPcHTML(nm,t.id)).join('')}
      </div>
    </div>`).join('');
  document.getElementById('tlPool').style.display='none';
  buildGrid();
}
function tlPcHTML(nm,tid){
  return`<div class="tl-pc" draggable="true" ondragstart="tlTierDragStart(event,'${nm}','${tid}')" ondragend="tlDragEnd()">
    <img src="${IP}${nm}.png" onerror="this.src=''">
    <div class="tl-pc-name">${nm}</div>
    <div class="tl-pc-rm" onclick="tlRemove('${nm}','${tid}')">×</div>
  </div>`;
}
function tlTierDragStart(e,nm,from){tlDragName=nm;tlDragFrom=from;e.dataTransfer.effectAllowed='move';}
function tlDragEnd(){tlDragName=null;tlDragFrom=null;}
function tlDragOver(e,tid){e.preventDefault();document.getElementById('tier-'+tid).classList.add('drag-over');}
function tlDrop(e,tid){
  e.preventDefault();document.getElementById('tier-'+tid).classList.remove('drag-over');
  if(!tlDragName)return;
  if(tlDragFrom&&tlDragFrom!=='pool')tlData[tlDragFrom]=tlData[tlDragFrom].filter(n=>n!==tlDragName);
  if(!tlData[tid].includes(tlDragName))tlData[tid].push(tlDragName);
  renderTierList();buildGrid();
}
function tlRemove(nm,tid){tlData[tid]=tlData[tid].filter(n=>n!==nm);renderTierList();buildGrid();}
function resetTier(){TIERS.forEach(t=>tlData[t.id]=[]);renderTierList();buildGrid();}

const ME_ORDER=Object.keys(MONSTERS).sort((a,b)=>totPts(MONSTERS[b],b)-totPts(MONSTERS[a],a));

function myPts(nm){
  const m=MONSTERS[nm];if(!m)return 0;
  const s=getAwkSet(nm);
  return Math.min((m.awakenings||[]).filter(a=>s.has(a.level)).reduce((sum,a)=>sum+awkPts(a),0),225);
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
  const fMax=filtered.reduce((s,nm)=>{
    const m=MONSTERS[nm];
    return s+Math.min((m.awakenings||[]).reduce((sum,a)=>sum+awkPts(a),0),225);
  },0);
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
  const mxPts=Math.min((m.awakenings||[]).reduce((s,a)=>s+awkPts(a),0),225);
  const div=document.createElement('div');
  div.className='me-card';
  div.dataset.meNm=nm;
  div.innerHTML=`
    <div class="me-card-top">
      <img class="me-card-img" src="${IP}${nm}.png" onerror="this.style.display='none'">
      <div class="me-card-mid">
        <div class="me-card-name">${nm}</div>
        <div class="me-card-tagline">${genTagline(nm)}</div>
        <div class="me-card-type ${TCLS[m.type]||''}">${TLBL[m.type]}</div>
      </div>
      <div class="me-card-score">
        <span class="sc-earned" style="color:var(--tx2)">0</span>
        <span class="sc-sep">/ ${mxPts} pts</span>
      </div>
    </div>
    <div class="me-card-bot">
      <button class="me-awk-btn" data-lv="3" onclick="toggleAwk('${nm}',3)">Éveil 3</button>
      <button class="me-awk-btn" data-lv="5" onclick="toggleAwk('${nm}',5)">Éveil 5★</button>
      <button class="me-awk-btn" data-lv="7" onclick="toggleAwk('${nm}',7)">Éveil 7★</button>
      <button class="me-awk-btn me-excl-btn" onclick="toggleExclude('${nm}')">🚫 Exclure</button>
    </div>
    <div class="me-card-buffs"></div>`;
  return div;
}

function updateMeCard(nm){
  const m=MONSTERS[nm];if(!m)return;
  const s=getAwkSet(nm);
  const has3=s.has(3),has5=s.has(5),has7=s.has(7);
  const mxPts=Math.min((m.awakenings||[]).reduce((sum,a)=>sum+awkPts(a),0),225);
  const earned=myPts(nm);
  const scoreCol=earned>0?sCol(earned/mxPts):'var(--tx2)';
  const cardCls=has7?'awk7':has5?'awk5':has3?'awk3':'';
  const card=document.querySelector(`#meGridInner [data-me-nm="${nm}"]`);
  if(!card)return;
  card.className='me-card'+(cardCls?' '+cardCls:'');
  const sc=card.querySelector('.sc-earned');
  if(sc){sc.textContent=earned;sc.style.color=scoreCol;}
  card.querySelectorAll('.me-awk-btn:not(.me-excl-btn)').forEach(btn=>{
    const lv=+btn.dataset.lv;
    btn.className='me-awk-btn'+(s.has(lv)?' awk'+lv+'-on':'');
  });
  // Bouton exclusion
  const exclBtn=card.querySelector('.me-excl-btn');
  if(exclBtn){
    const isExcl=excludedFromReco.includes(nm);
    exclBtn.className='me-awk-btn me-excl-btn'+(isExcl?' awk7-on':'');
    exclBtn.textContent=isExcl?'✅ Inclus':'🚫 Exclure';
    exclBtn.title=isExcl?'Réactiver dans les suggestions':'Exclure des suggestions d\'équipe';
  }
  const activeBuffs=[];
  if(has3){const a=(m.awakenings||[]).find(a=>a.level===3);if(a)activeBuffs.push(...(a.buffs||[]));}
  if(has5){const a=(m.awakenings||[]).find(a=>a.level===5);if(a)activeBuffs.push(...(a.buffs||[]));}
  if(has7){const a=(m.awakenings||[]).find(a=>a.level===7);if(a)activeBuffs.push(...(a.buffs||[]));}
  const buffsEl=card.querySelector('.me-card-buffs');
  if(buffsEl)buffsEl.innerHTML=activeBuffs.map(id=>{
    const b=BUFFS[id];if(!b)return'';
    return`<div class="me-mini-chip" style="border-color:${b.color}">${b.label}</div>`;
  }).join('');
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
    (m.awakenings||[]).forEach(a=>{
      if(!sv.has(a.level))return;
      (a.buffs||[]).forEach(id=>{const b=BUFFS[id];if(!b||!b.cond)return;if(!buffAgg[id])buffAgg[id]=0;buffAgg[id]++;});
    });
  });
  const body=document.getElementById('meRecapBuffs');
  if(body)body.innerHTML=Object.entries(buffAgg).sort(([,a],[,b])=>b-a).map(([id,cnt])=>{
    const b=BUFFS[id];if(!b)return'';
    return`<div class="me-buff-chip" style="border-color:${b.color}">${b.label}<span class="me-buff-chip-cnt">×${cnt}</span></div>`;
  }).join('');
}

function toggleMeRecap(){
  meRecapOpen=!meRecapOpen;
  document.getElementById('meRecap').className='me-recap '+(meRecapOpen?'expanded':'collapsed');
  const btn=document.getElementById('meRecapToggle');
  if(btn)btn.textContent=meRecapOpen?'▲ Réduire':'▼ Détails';
}

function exportAwk(){
  const blob=new Blob([JSON.stringify(myAwakenings,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sw_eveils.json';a.click();
}
function importAwk(){
  const input=document.createElement('input');input.type='file';input.accept='.json';
  input.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{Object.assign(myAwakenings,JSON.parse(ev.target.result));saveAwk();document.getElementById('meGridInner').innerHTML='';renderMesEveils();}catch{}
    };
    reader.readAsText(file);
  };
  input.click();
}
function resetAwk(){
  if(!confirm('Réinitialiser tous vos éveils ?'))return;
  myAwakenings={};saveAwk();document.getElementById('meGridInner').innerHTML='';renderMesEveils();
}
function renderStrategyPicker(){
  const bar=document.getElementById('tbTopbar');
  if(!bar)return;
  const old=document.getElementById('stratPicker');
  if(old)old.remove();
  const wrap=document.createElement('div');
  wrap.id='stratPicker';
  wrap.style.cssText='display:flex;align-items:center;gap:4px;flex-shrink:0;overflow-x:auto;margin-left:4px;';
  wrap.innerHTML=
    `<span style="font-size:.7rem;font-weight:700;color:var(--tx2);white-space:nowrap;flex-shrink:0">Strat :</span>`+
    VISIBLE_STRATEGIES.map(k=>{const s=STRATEGIES[k];return `<button class="sz${k===teamStrategy?' on':''}" data-strat="${k}"
        onclick="setStrategy('${k}')"
        title="${s.label}"
        style="white-space:nowrap;font-size:.7rem;padding:3px 8px;flex-shrink:0">
        ${s.icon} ${s.label}
      </button>`;
    }).join('')+
    `<button onclick="autoBuildTeam()"
      style="white-space:nowrap;font-size:.7rem;padding:3px 10px;flex-shrink:0;
             border-radius:3px;border:1px solid rgba(168,212,40,.4);background:rgba(168,212,40,.1);
             color:var(--green2);cursor:pointer;font-family:inherit;font-weight:700;margin-left:6px;"
      title="Construire automatiquement une équipe optimisée">
      ⚡ Auto-Build
    </button>
    <button onclick="toggleTdoMode()" id="tdoBtn"
      style="white-space:nowrap;font-size:.7rem;padding:3px 10px;flex-shrink:0;
             border-radius:3px;border:1px solid rgba(72,136,216,.4);background:rgba(72,136,216,.1);
             color:var(--tnk);cursor:pointer;font-family:inherit;font-weight:700;margin-left:6px;"
      title="Mode Tour des Origines">
      🏆 Mode Tour des Origines
    </button>
    <button onclick="toggleGdgMode()" id="gdgBtn"
      style="white-space:nowrap;font-size:.7rem;padding:3px 10px;flex-shrink:0;
             border-radius:3px;border:1px solid rgba(220,140,40,.4);background:rgba(220,140,40,.1);
             color:#dc8c28;cursor:pointer;font-family:inherit;font-weight:700;margin-left:6px;"
      title="Mode Guerre de Guilde">
      ⚔ Guerre de Guilde
    </button>`;
  bar.appendChild(wrap);
}
function autoBuildTeam(){
  selTb = [];

  const usedInOtherTeams = new Set();

if (tdoMode) {
    const currentTdoCompo = tdoTeams[tdoActiveCompo].teams;
    currentTdoCompo.forEach((team, index) => {
        if (index !== tdoActiveTeam) {
            team.members.forEach(m => usedInOtherTeams.add(m));
        }
    });
}
else if (gdgMode) {
    const currentGdgCompo = gdgTeams[gdgActiveCompo].teams;
    currentGdgCompo.forEach((team, index) => {
        if (index !== gdgActiveTeam) {
            team.members.forEach(m => usedInOtherTeams.add(m));
        }
    });
}

const strat = STRATEGIES[teamStrategy] || STRATEGIES.balanced;
const W = strat.buffWeight;

  const frontTarget   = Math.round(teamSize * strat.typeRatio.front);
  const rangeTarget   = Math.round(teamSize * strat.typeRatio.range);
  const supportTarget = teamSize - frontTarget - rangeTarget;

  function buffCategory(id){
    if(OFF_IDS.has(id)) return 'off';
    if(DEF_IDS.has(id)) return 'def';
    if(TEAM_IDS.has(id)) return 'team';
    return 'off';
  }

  function scoreAlone(nm){
    const m = MONSTERS[nm]; if(!m) return 0;
    const ids = new Set([
      ...(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),
      ...skillBuffsRaw(nm)
    ]);
    let s = 0;
    ids.forEach(id=>{
      const b = BUFFS[id]; if(!b) return;
      const v = bVal(id);
      const cat = buffCategory(id);
      s += v * (W[cat]??1) * (b.team?1.4:1);
    });
    s += getAwkLevel(nm)*6;
    return s;
  }

  // On place d'abord le meilleur monstre solo (en excluant les autres équipes)
  const first = Object.keys(MONSTERS)
    .filter(nm => !excludedFromReco.includes(nm) && !usedInOtherTeams.has(nm))
    .map(nm => ({nm, score:scoreAlone(nm)}))
    .sort((a,b)=>b.score-a.score)[0];

  if(first) selTb.push(first.nm);

  // Ensuite calcReco gère tout le reste avec les synergies
  for(let i = 1; i < teamSize; i++){
    const candidates = calcReco();
    if(!candidates.length) break;

    const typeCounts = {melee:0,tank:0,range:0,support:0};
    selTb.forEach(nm=>{ if(MONSTERS[nm]) typeCounts[MONSTERS[nm].type]++; });

    const frontCurrent   = (typeCounts.melee||0)+(typeCounts.tank||0);
    const rangeCurrent   = typeCounts.range||0;
    const supportCurrent = typeCounts.support||0;

    let chosen = null;
    for(const nm of candidates){
      // SÉCURITÉ ANTI-DOUBLON : Ignorer si déjà dans l'équipe actuelle OU dans les autres équipes
      if (selTb.includes(nm) || usedInOtherTeams.has(nm)) continue;

      const t = MONSTERS[nm]?.type;
      const isFront   = t==='melee'||t==='tank';
      const isRange   = t==='range';
      const isSupport = t==='support';

      const frontLeft   = frontTarget   - frontCurrent;
      const rangeLeft   = rangeTarget   - rangeCurrent;
      const supportLeft = supportTarget - supportCurrent;
      const remaining   = teamSize - selTb.length;
      const slotsLeft   = remaining - 1;

      let ok = true;
      if(isFront   && frontCurrent   >= frontTarget+2   && (rangeLeft>0||supportLeft>0) && slotsLeft>=rangeLeft+supportLeft) ok=false;
      if(isRange   && rangeCurrent   >= rangeTarget+2   && (frontLeft>0||supportLeft>0) && slotsLeft>=frontLeft+supportLeft) ok=false;
      if(isSupport && supportCurrent >= supportTarget+2 && (frontLeft>0||rangeLeft>0)   && slotsLeft>=frontLeft+rangeLeft)  ok=false;
      if(isSupport && strat.typeRatio.support===0) ok=false;

      if(ok){ chosen=nm; break; }
    }

    // Sécurité de repli : Si aucun ne valide les ratios, on prend le premier disponible et STRICTEMENT UNIQUE
    if(!chosen){
      chosen = candidates.find(nm => !selTb.includes(nm) && !usedInOtherTeams.has(nm));
    }

    if(!chosen) break; // Plus aucun monstre valide et unique disponible
    selTb.push(chosen);
  }

  renderTeam();
  buildGrid();
}
function toggleTdoMode(){
  tdoMode = !tdoMode;
  if(gdgMode){ gdgMode=false; const gb=document.getElementById('gdgBtn'); if(gb){gb.style.background='rgba(220,140,40,.1)';gb.style.color='#dc8c28';} const gdgEl=document.getElementById('gdgContainer'); if(gdgEl)gdgEl.remove(); }
  const btn = document.getElementById('tdoBtn');
  if(btn){
    btn.style.background = tdoMode ? 'rgba(72,136,216,.3)' : 'rgba(72,136,216,.1)';
    btn.style.color = tdoMode ? '#88ccff' : 'var(--tnk)';
  }
  if(tdoMode){
    document.getElementById('tbSlots').style.display='none';
    document.getElementById('tbScores').style.display='none';
    document.getElementById('tbSyn').style.display='none';
    document.getElementById('tbReco').style.display='none';
    document.getElementById('szRow').style.display='none';
    document.getElementById('tbClrBtn').style.display='none';
    document.getElementById('tbCtr').style.display='none';
    let tdoEl = document.getElementById('tdoContainer');
    if(!tdoEl){ tdoEl=document.createElement('div'); tdoEl.id='tdoContainer'; tdoEl.style.flex='1'; tdoEl.style.overflow='auto'; document.getElementById('tbContent').prepend(tdoEl); }
    tdoEl.innerHTML='';
    renderTdo();
  } else {
    document.getElementById('tbSlots').style.display='';
    document.getElementById('tbScores').style.display='';
    document.getElementById('tbSyn').style.display='';
    document.getElementById('szRow').style.display='';
    document.getElementById('tbClrBtn').style.display='';
    document.getElementById('tbCtr').style.display='';
    const tdoEl=document.getElementById('tdoContainer');
    if(tdoEl)tdoEl.remove();
    renderTeam();
  }
  buildGrid();
}

function getTdoUsed(excludeTeam){
  const compo = tdoTeams[tdoActiveCompo];
  const used = new Set();
  compo.teams.forEach((t,i)=>{ if(i!==excludeTeam) t.members.forEach(nm=>used.add(nm)); });
  return used;
}

function tdoAddMonster(nm){
  const compo = tdoTeams[tdoActiveCompo];
  const team = compo.teams[tdoActiveTeam];
  const used = getTdoUsed(tdoActiveTeam);
  if(used.has(nm)) return; // déjà dans une autre équipe
  if(team.members.includes(nm)) { // retirer si déjà présent
    team.members = team.members.filter(n=>n!==nm);
  } else if(team.members.length < 15) {
    team.members.push(nm);
  }
  saveTdo();
  renderTdo();
  buildGrid();
}

function tdoRemoveMember(teamIdx, nm){
  tdoTeams[tdoActiveCompo].teams[teamIdx].members = tdoTeams[tdoActiveCompo].teams[teamIdx].members.filter(n=>n!==nm);
  saveTdo();
  renderTdo();
  buildGrid();
}
function renderTdo(){
  const el=document.getElementById('tdoContainer');
  if(!el)return;
  const compo=tdoTeams[tdoActiveCompo];
  const TEAM_COLS=['#4888d8','#c89020','#c83030'];

  const compoTabs=tdoTeams.map((c,i)=>`
    <button onclick="tdoSetCompo(${i})" style="padding:5px 14px;border-radius:3px;border:1px solid ${i===tdoActiveCompo?'rgba(168,212,40,.5)':'var(--b1)'};background:${i===tdoActiveCompo?'rgba(168,212,40,.1)':'none'};color:${i===tdoActiveCompo?'var(--green2)':'var(--tx2)'};cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700;flex-shrink:0">
      ${c.name}
    </button>`).join('');

  const stratSelect=(idx)=>VISIBLE_STRATEGIES.map(k=>{const s=STRATEGIES[k];return `<option value="${k}"${tdoStrategies[idx]===k?' selected':''}>${s.icon} ${s.label}</option>`;
  }).join('');

  const teamsHtml=compo.teams.map((t,ti)=>{
    const col=TEAM_COLS[ti];
    const isActive=ti===tdoActiveTeam;
    const {off,def,team:teamScore}=calcTeamScores(t.members);
    const maxVal=300;
    const gridHtml=renderStrategicGrid(t.members,GRID_TDO_W,GRID_TDO_H,col,`tdoRemoveMember(${ti},'__NM__')`);

    const scoreBar=(label,val,barCol)=>{
      const pct=Math.min(val/maxVal*100,100);
      return`<div style="flex:1;display:flex;flex-direction:column;gap:2px">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--tx2);display:flex;justify-content:space-between">
          <span>${label}</span><span style="font-weight:900;color:var(--tx3)">${val}</span>
        </div>
        <div style="height:4px;background:var(--b1);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${barCol};border-radius:2px"></div>
        </div>
      </div>`;
    };

    return`<div onclick="tdoSetTeam(${ti})" style="flex:1;min-width:0;background:var(--s2);border:1px solid ${isActive?col:'var(--b1)'};border-radius:8px;overflow:hidden;cursor:pointer">
      <div style="display:flex;align-items:center;gap:6px;padding:7px 10px;background:${isActive?`rgba(${rgb(col)},.1)`:'none'};border-bottom:1px solid var(--b1)">
        <span style="font-size:.82rem;font-weight:800;color:${col}">${t.name}</span>
        <span style="font-size:.68rem;color:var(--tx2)">${t.members.length}/15</span>
        ${isActive?`<span style="font-size:.62rem;font-weight:700;background:rgba(${rgb(col)},.15);color:${col};padding:2px 7px;border-radius:3px;margin-left:auto">Sélectionnée</span>`:''}
      </div>
      <div style="display:flex;gap:6px;padding:6px 10px;border-bottom:1px solid var(--b1)">
        ${scoreBar('Off',off,'var(--mel)')}${scoreBar('Déf',def,'var(--tnk)')}${scoreBar('Team',teamScore,'var(--gold)')}
      </div>
      <select onclick="event.stopPropagation()" onchange="tdoStrategies[${ti}]=this.value" style="width:calc(100% - 16px);margin:6px 8px;background:var(--s3);border:1px solid var(--b2);border-radius:3px;color:var(--tx);font-size:.7rem;padding:3px 6px;font-family:inherit">
        ${stratSelect(ti)}
      </select>
      <div style="padding:8px 10px" onclick="event.stopPropagation()">${gridHtml}</div>
      <div style="padding:0 8px 8px" onclick="event.stopPropagation()">
        <button onclick="tdoAutoBuild(${ti})" style="width:100%;font-size:.66rem;padding:5px 0;margin-bottom:5px;border-radius:3px;border:1px solid rgba(168,212,40,.4);background:rgba(168,212,40,.1);color:var(--green2);cursor:pointer;font-family:inherit;font-weight:700">⚡ Auto-Build</button>
        <button onclick="tdoClearTeam(${ti})" style="width:100%;font-size:.66rem;padding:5px 0;border-radius:3px;border:1px solid rgba(200,48,48,.35);background:rgba(200,48,48,.08);color:var(--mel);cursor:pointer;font-family:inherit;font-weight:700">Vider</button>
      </div>
    </div>`;
  }).join('');

  const usedInOther=getTdoUsed(tdoActiveTeam);
  const conflictLegend=usedInOther.size?`<div style="font-size:.72rem;color:var(--tx2);padding:4px 0 6px"><span style="color:#c83030;font-weight:700">●</span> ${usedInOther.size} monstre(s) indisponible(s) (déjà assigné dans une autre équipe)</div>`:'';

  el.innerHTML=`
    <div style="padding:10px 14px;background:var(--s1);border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <span style="font-size:.7rem;font-weight:700;color:var(--tx2);flex-shrink:0">Compo :</span>
      ${compoTabs}
      <button onclick="tdoAutoBuildAllBalanced()" style="margin-left:auto;white-space:nowrap;font-size:.75rem;padding:5px 14px;border-radius:3px;border:1px solid rgba(72,136,216,.4);background:rgba(72,136,216,.1);color:#4888d8;cursor:pointer;font-family:inherit;font-weight:700">⚖️ Équilibrer 3 Équipes</button>
    </div>
    <div style="padding:10px 14px">
      ${conflictLegend}
      <div style="display:flex;gap:10px;align-items:stretch">${teamsHtml}</div>
    </div>`;
}

function tdoSetCompo(i){ tdoActiveCompo=i; tdoActiveTeam=0; renderTdo(); buildGrid(); }

function tdoSetTeam(i){ tdoActiveTeam=i; renderTdo(); buildGrid(); }

function setStrategy(k){
  teamStrategy = k;
  document.querySelectorAll('#stratPicker .sz').forEach(b=>{
    b.classList.toggle('on', b.dataset.strat===k);
  });
  renderTeam(); // rafraîchit les suggestions
}
function tdoClearTeam(ti){
  tdoTeams[tdoActiveCompo].teams[ti].members=[];
  saveTdo();renderTdo();buildGrid();
}

function tdoAutoBuild(ti){
  const teamIdx = ti!==undefined ? ti : tdoActiveTeam;
  const compo=tdoTeams[tdoActiveCompo];
  const team=compo.teams[teamIdx];
  const strat=STRATEGIES[tdoStrategies[teamIdx]]||STRATEGIES.balanced;
  const usedElsewhere=getTdoUsed(teamIdx);

  const ATTEMPTS=25;
  let best=null, bestScore=-Infinity;
  for(let a=0;a<ATTEMPTS;a++){
    const randomness = a<5 ? 1 : 3;
    let candidate = randomizedGreedyBuild(15, strat, usedElsewhere, randomness);
    const improved = localSearchImprove(candidate, strat, usedElsewhere, 3);
    if(improved.score>bestScore){ bestScore=improved.score; best=improved.members; }
  }

  team.members = best || [];
  saveTdo();renderTdo();buildGrid();
}
const SW_FAQ = [
  {cat:'score', q:"Comment est calculé le score d'un monstre ?",
   a:`<p>Chaque monstre est noté sur <strong>500 points</strong>, composés de deux parties :</p>
   <ul><li><strong>Éveils (max 200 pts)</strong> — Éveil 3★ vaut 25 pts fixes. Les éveils 5★ et 7★ sont normalisés sur 100 pts chacun selon la valeur de leurs buffs.</li><li><strong>Sorts (max 300 pts)</strong> — 3 sorts × 100 pts chacun.</li></ul>
   <div class="faq-hi">⭐ Ces scores sont indicatifs. La puissance réelle en combat dépend surtout de la composition qui entoure le monstre.</div>`},
  {cat:'score', q:"Comment est noté chaque sort ?",
   a:`<p>Chaque sort (Attaque de base, Critique, Exclusive) est noté sur <strong>100 pts</strong> selon 4 critères :</p>
   <ul><li><strong>Puissance d'attaque</strong> — plafonné à 30 pts</li><li><strong>Buffs apportés</strong> — plafonné à 40 pts</li><li><strong>Coups multiples</strong> — +8 pts/coup supplémentaire, max 20 pts</li><li><strong>Zone (AoE)</strong> — +10 pts</li></ul>`},
  {cat:'score', q:"Les buffs conditionnels valent-ils moins ?",
   a:`<p>Oui. Un buff conditionnel voit sa valeur réduite de <strong>40%</strong> par rapport à un buff permanent du même type.</p>
   <div class="faq-tip">💡 Les buffs d'équipe (alliés) ont toujours un bonus de valeur car ils profitent à toute la composition.</div>`},
  {cat:'score', q:"Que mesure le score dans 'Mes Éveils' ?",
   a:`<p>Dans l'onglet <strong>Mes Éveils</strong>, seuls les éveils activés comptent — les sorts ne sont pas inclus. Le maximum par monstre est de <strong>225 pts</strong> (25 + 100 + 100).</p>`},
  {cat:'tb', q:"Comment fonctionne l'Auto-Build ?",
   a:`<p>L'Auto-Build construit une équipe complète depuis zéro selon la stratégie choisie :</p>
   <ul><li>Le <strong>premier monstre</strong> est choisi sur son score individuel pondéré par la stratégie.</li><li>Les <strong>suivants</strong> sont évalués en contexte — synergies, doublons, et quotas de rôle.</li><li>Les <strong>monstres exclus</strong> (🚫 dans Mes Éveils) sont ignorés.</li></ul>
   <div class="faq-tip">💡 Changez la stratégie avant de lancer l'Auto-Build pour obtenir des compositions radicalement différentes.</div>`},
  {cat:'tb', q:"Comment sauvegarder et charger une équipe ?",
   a:`<p>La barre sous le Team Builder propose <strong>5 emplacements de sauvegarde</strong>. Pour chaque slot :</p>
   <ul><li>Cliquez sur 💾 pour <strong>sauvegarder</strong> l'équipe et la taille actuelles.</li><li>Cliquez sur ▶ pour <strong>charger</strong> un slot.</li><li>Le champ texte permet de <strong>renommer</strong> le slot.</li></ul>`},
  {cat:'tb', q:"Comment fonctionne le Mode Tour des Origines ?",
   a:`<p>Le bouton <strong>🏆 Mode Tour des Origines</strong> active un mode spécial qui gère <strong>3 compos × 3 équipes</strong>.</p>
   <ul><li>Un monstre assigné à une équipe est <strong>verrouillé</strong> pour les autres (portrait grisé).</li><li>Chaque équipe a sa propre stratégie et son propre Auto-Build.</li><li>Les compos sont sauvegardées automatiquement.</li></ul>
   <div class="faq-warn">⚠ Un même monstre ne peut pas apparaître dans deux équipes d'une même compo.</div>`},
  {cat:'reco', q:"Comment sont calculées les suggestions manuelles ?",
   a:`<p>Quand vous ajoutez des monstres manuellement, les <strong>10 meilleures suggestions</strong> sont calculées selon 4 critères :</p>
   <ul><li><strong>Synergie de buffs</strong> — buff nouveau = bonus, team buff = ×1.4, doublon solo = malus.</li><li><strong>Synergies de paires</strong> — Taux CP + Dégâts CP, Taux Crit + Dégâts Crit, Floraison + Coups Multiples…</li><li><strong>Quota de rôles</strong> — rôle manquant = bonus, rôle saturé = malus.</li><li><strong>Niveau d'éveil</strong> — un monstre éveillé dans Mes Éveils reçoit un léger bonus.</li></ul>`},
  {cat:'reco', q:"Pourquoi un monstre n'apparaît-il pas dans les suggestions ?",
   a:`<p>Deux raisons possibles :</p>
   <ul><li>Le monstre est <strong>déjà dans l'équipe</strong>.</li><li>Il a été marqué <strong>🚫 Exclure</strong> dans l'onglet Mes Éveils — cliquez sur le bouton pour le réintégrer.</li></ul>`},
  {cat:'strat', q:"Quelle stratégie choisir ?",
   a:`<p>Tout dépend de votre objectif :</p>
   <ul><li><strong>Équilibré</strong> — bon point de départ, sans parti pris.</li><li><strong>Offensif / Full Rush</strong> — maximise les dégâts, ignore les supports.</li><li><strong>Défensif</strong> — privilégie résistances et boucliers.</li><li><strong>Team Buff</strong> — favorise les buffs qui profitent à toute l'équipe.</li><li><strong>Offensif + Team / Défensif + Team</strong> — compromis entre buff personnel et soutien d'équipe.</li></ul>
   <div class="faq-tip">💡 Consultez la section Stratégies disponibles pour voir les ratios exacts de chaque mode.</div>`},
  {cat:'strat', q:"Qu'est-ce que le ratio de rôles dans une stratégie ?",
   a:`<p>Chaque stratégie définit une cible de <strong>répartition Mêlée/Tank — Range — Support</strong> pour l'équipe. L'Auto-Build et les suggestions utilisent ce ratio pour équilibrer les types de personnages.</p>
   <div class="faq-hi">⭐ Exemple : Full Rush impose 50% front + 50% range et 0% support — aucun support ne sera jamais suggéré.</div>`},
  {cat:'me', q:"À quoi sert l'onglet Mes Éveils ?",
   a:`<p>Il vous permet de <strong>déclarer vos éveils actifs</strong> (3★, 5★, 7★) pour chaque monstre. Ces données servent à :</p>
   <ul><li>Calculer votre <strong>score personnel</strong> d'éveil.</li><li>Donner un <strong>bonus de priorité</strong> dans les suggestions du Team Builder.</li><li>Alimenter le résumé des buffs conditionnels actifs.</li></ul>`},
  {cat:'me', q:"Comment exclure un monstre des suggestions ?",
   a:`<p>Dans l'onglet Mes Éveils, cliquez sur le bouton <strong>🚫 Exclure</strong> sur la carte du monstre. Il disparaîtra des suggestions et de l'Auto-Build. Cliquez à nouveau (<strong>✅ Inclus</strong>) pour le réintégrer.</p>`},
  {cat:'me', q:"Les données d'éveil sont-elles sauvegardées ?",
   a:`<p>Oui, elles sont sauvegardées dans le <strong>localStorage</strong> de votre navigateur. Vous pouvez également les exporter/importer via les boutons ⬆ Importer et ⬇ Exporter pour les transférer entre appareils.</p>
   <div class="faq-warn">⚠ Vider le cache du navigateur efface les données. Pensez à exporter régulièrement.</div>`},
];

let swFaqCat = 'all', swFaqQ = '';
const TL_FAQ = {score:'Scores', tb:'Team Builder', reco:'Suggestions', strat:'Stratégies', me:'Mes Éveils'};
const TI_FAQ = {score:'🏆', tb:'⚔', reco:'💡', strat:'⚡', me:'⭐'};
const TCLS_FAQ = {score:'ftag-score', tb:'ftag-tb', reco:'ftag-reco', strat:'ftag-strat', me:'ftag-me'};

function buildSwFaqCats() {
  document.getElementById('faqCats').innerHTML = SW_FAQ_CATS.map(c =>
    `<button class="faq-cat-btn${c.id === 'all' ? ' on' : ''}" onclick="setSwFaqCat('${c.id}',this)">
      <span>${c.icon}</span>${c.label}
    </button>`
  ).join('');
}

function setSwFaqCat(id, btn) {
  swFaqCat = id;
  document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderSwFaq();
}

function filterFaq() {
  swFaqQ = document.getElementById('faqSearch').value.toLowerCase().trim();
  renderSwFaq();
}

function renderSwFaq() {
  const c = document.getElementById('faqContainer');
  const f = SW_FAQ.filter(x =>
    (swFaqCat === 'all' || x.cat === swFaqCat) &&
    (!swFaqQ || x.q.toLowerCase().includes(swFaqQ) || x.a.toLowerCase().includes(swFaqQ))
  );
  if (!f.length) {
    c.innerHTML = `<div class="faq-empty"><div style="font-size:2rem;opacity:.3;margin-bottom:8px">🔍</div>Aucune question trouvée.</div>`;
    return;
  }
  if (swFaqCat === 'all' && !swFaqQ) {
    const g = {};
    f.forEach(x => { if (!g[x.cat]) g[x.cat] = []; g[x.cat].push(x); });
    c.innerHTML = Object.entries(g).map(([cat, items]) =>
      `<div style="margin-bottom:22px">
        <div class="faq-section-hd"><span>${TI_FAQ[cat]}</span>${TL_FAQ[cat]}</div>
        ${items.map((x, i) => swFaqHtml(x, cat + i)).join('')}
      </div>`
    ).join('');
  } else {
    c.innerHTML = f.map((x, i) => swFaqHtml(x, 'fq' + i)).join('');
  }
  c.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const it = q.closest('.faq-item');
      const an = it.querySelector('.faq-ans');
      const op = it.classList.contains('open');
      it.classList.toggle('open', !op);
      an.classList.toggle('show', !op);
    });
  });
}

function swFaqHtml(f, uid) {
  return `<div class="faq-item" id="sfaq-${uid}">
    <div class="faq-q">
      <div class="faq-q-left">
        <span class="faq-qtag ${TCLS_FAQ[f.cat]}">${TL_FAQ[f.cat]}</span>
        <span class="faq-qtext">${f.q}</span>
      </div>
      <span class="faq-arrow">▼</span>
    </div>
    <div class="faq-ans">${f.a}</div>
  </div>`;
}

function findSimilarMonsters(nm,limit=6){
  const m=MONSTERS[nm];if(!m)return[];
  const myBuffs=new Set(allMonsterBuffIds(nm));
  if(!myBuffs.size)return[];

  const scored=Object.keys(MONSTERS).filter(n=>n!==nm).map(n=>{
    const otherBuffs=new Set(allMonsterBuffIds(n));
    let exactShared=0;
    myBuffs.forEach(id=>{ if(otherBuffs.has(id)) exactShared++; });
    const sameType=MONSTERS[n].type===m.type;
    const score=exactShared*10+(sameType?1:0);
    return{nm:n,score,exactShared,sameType};
  })
    .filter(x=>x.exactShared>=2)
    .sort((a,b)=>b.score-a.score || b.exactShared-a.exactShared)
    .slice(0,limit);
  return scored;
}

function showSimilarMonsters(nm){
  const results=findSimilarMonsters(nm);
  const wrap=document.getElementById('simWrap_'+nm.replace(/[^a-z0-9]/gi,''));
  if(!wrap)return;
  if(!results.length){
    wrap.innerHTML='<div style="color:var(--tx2);font-size:.8rem;font-style:italic;padding:8px 0">Aucun monstre vraiment similaire trouvé.</div>';
    wrap.style.display='block';
    return;
  }
  wrap.innerHTML=`<div style="font-size:.74rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--tx2);margin:10px 0 7px">Monstres similaires</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${results.map(r=>{
        const mm=MONSTERS[r.nm];
        return`<div style="display:flex;align-items:center;gap:6px;background:var(--s3);border:1px solid var(--b1);border-radius:5px;padding:4px 8px 4px 4px;cursor:pointer" onclick="addSimilarToCmp('${r.nm}')" title="Voir ${r.nm}">
          <img src="${IP}${r.nm}.png" onerror="this.style.display='none'" style="width:60px;height:60px;border-radius:3px;object-fit:cover;object-position:top center">
          <span style="font-size:.78rem;color:var(--tx3);font-weight:600">${r.nm}</span>
          <span style="font-size:.65rem;color:${TCOL[mm.type]}">${r.exactShared} buff${r.exactShared>1?'s':''} commun${r.exactShared>1?'s':''}</span>
        </div>`;
      }).join('')}
    </div>`;
  wrap.style.display='block';
}
function addSimilarToCmp(nm){
  const fi=selCmp.indexOf(null);
  if(fi!==-1){ selCmp[fi]=nm; }
  else{ selCmp.shift(); selCmp.push(nm); }
  renderCmp();buildGrid();
}

function renderFaqStrats() {
  const el = document.getElementById('faqStratGrid');
  if (!el) return;
  el.innerHTML = Object.entries(STRATEGIES).map(([k, s]) => `
    <div style="background:var(--s2);border:1px solid var(--b1);border-radius:8px;padding:12px 14px">
      <div style="font-size:.9rem;font-weight:800;color:var(--tx);margin-bottom:6px">${s.icon} ${s.label}</div>
      <div style="font-size:.75rem;color:var(--tx2);line-height:1.9">
        Offensif ×${s.buffWeight.off}<br>
        Défensif ×${s.buffWeight.def}<br>
        Team ×${s.buffWeight.team}<br>
        Front ${Math.round(s.typeRatio.front * 100)}% · Range ${Math.round(s.typeRatio.range * 100)}% · Support ${Math.round(s.typeRatio.support * 100)}%
      </div>
    </div>`).join('');
}
const GRID_TDO_W=5, GRID_TDO_H=5;
const GRID_GDG_W=5, GRID_GDG_H=4;

function computeStrategicSlot(nm,idx,total,w,h){
  const m=MONSTERS[nm];
  const buffs=allMonsterBuffIds(nm);
  const has=id=>buffs.includes(id);
  const hasRange=has('range_3')||has('range_5')||has('range_1')||has('range_2');
  let col;
  if(m.type==='melee'||m.type==='tank') col=hasRange?w-2:w-1;
  else if(m.type==='support') col=0;
  else col=hasRange?1:2;
  return col;
}

function layoutStrategicGrid(members,w,h){
  const cells=Array.from({length:h},()=>Array(w).fill(null));
  const colTargets=members.map((nm,i)=>({nm,col:computeStrategicSlot(nm,i,members.length,w,h)}));
  const byCol={};
  colTargets.forEach(({nm,col})=>{ (byCol[col]=byCol[col]||[]).push(nm); });
  Object.keys(byCol).forEach(col=>{
    const list=byCol[col];
    let row=0;
    for(const nm of list){
      while(row<h && cells[row][col]) row++;
      if(row>=h){
        let placed=false;
        for(let c=0;c<w && !placed;c++){
          for(let r=0;r<h;r++){
            if(!cells[r][c]){ cells[r][c]=nm; placed=true; break; }
          }
        }
      } else {
        cells[row][col]=nm;
      }
      row++;
    }
  });
  return cells;
}

function renderStrategicGrid(members,w,h,teamColor,onRemove){
  const cells=layoutStrategicGrid(members,w,h);
  let html=`<div style="display:grid;grid-template-columns:repeat(${w},100px);grid-auto-rows:100px;gap:4px;justify-content:center">`;
  for(let r=0;r<h;r++){
    for(let c=0;c<w;c++){
      const nm=cells[r][c];
      if(nm){
        const m=MONSTERS[nm];
        const rmAttr=onRemove?` onclick="${onRemove.replace('__NM__',nm)}"`:'';
        html+=`<div style="position:relative;width:100%;height:100%;border-radius:5px;overflow:hidden;border:1.5px solid ${teamColor||TCOL[m.type]}">
          <img src="${IP}${nm}.png" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;object-position:top center">
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.85);font-size:.55rem;font-weight:700;color:#fff;text-align:center;padding:9px 1px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nm}</div>
          ${onRemove?`<div${rmAttr} style="position:absolute;top:0;right:0;width:16px;height:16px;border-radius:50%;background:rgba(180,30,30,.9);color:#fff;font-size:.6rem;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2">×</div>`:''}
        </div>`;
      } else {
        html+=`<div style="width:100%;height:100%;border-radius:5px;border:1px dashed var(--b1);background:var(--s2)"></div>`;
      }
    }
  }
  html+='</div>';
  return html;
}
function getGdgUsed(excludeTeam){
  const compo = gdgTeams[gdgActiveCompo];
  const used = new Set();
  compo.teams.forEach((t,i)=>{ if(i!==excludeTeam) t.members.forEach(nm=>used.add(nm)); });
  return used;
}

function gdgAddMonster(nm){
  const compo = gdgTeams[gdgActiveCompo];
  const team = compo.teams[gdgActiveTeam];
  const used = getGdgUsed(gdgActiveTeam);
  if(used.has(nm)) return;
  if(team.members.includes(nm)){
    team.members = team.members.filter(n=>n!==nm);
  } else if(team.members.length < GDG_TEAM_SIZE){
    team.members.push(nm);
  }
  saveGdg();renderGdg();buildGrid();
}

function gdgRemoveMember(teamIdx,nm){
  gdgTeams[gdgActiveCompo].teams[teamIdx].members = gdgTeams[gdgActiveCompo].teams[teamIdx].members.filter(n=>n!==nm);
  saveGdg();renderGdg();buildGrid();
}

function gdgSetCompo(i){ gdgActiveCompo=i; gdgActiveTeam=0; renderGdg(); buildGrid(); }
function gdgSetTeam(i){ gdgActiveTeam=i; renderGdg(); buildGrid(); }

function gdgClearTeam(ti){
  gdgTeams[gdgActiveCompo].teams[ti].members=[];
  saveGdg();renderGdg();buildGrid();
}
function autoBuildBalancedTeams(teamsArr, strategies, teamSize, getUsedFn){
  const baseUsed = getUsedFn ? getUsedFn() : new Set();

  function buildOneAttempt(randomness){
    const result = teamsArr.map(()=>[]);
    const strats = strategies.map(k=>STRATEGIES[k]||STRATEGIES.balanced);

    // Pré-assigne un tank différent par équipe
    const allTanks = Object.keys(MONSTERS).filter(nm=>MONSTERS[nm].type==='tank'&&!baseUsed.has(nm)&&!excludedFromReco.includes(nm));
    const tankScored = allTanks.map(nm=>({nm,score:bVal('')+getAwkLevel(nm)*6+Math.random()*5})).sort((a,b)=>b.score-a.score);
    for(let i=0;i<result.length && i<tankScored.length;i++) result[i].push(tankScored[i].nm);

    for(let round=0; round<teamSize; round++){
      const order=[...result.keys()];
      if(round%2!==0) order.reverse();
      for(const ti of order){
        if(result[ti].length>=teamSize) continue;
        const allUsed = new Set(baseUsed);
        result.forEach(t=>t.forEach(m=>allUsed.add(m)));
        const available = Object.keys(MONSTERS).filter(nm=>!allUsed.has(nm)&&!excludedFromReco.includes(nm));
        if(!available.length) continue;

        const strat=strats[ti], W=strat.buffWeight;
        const teamBufSet={};
        result[ti].forEach(n=>{
          [...(MONSTERS[n]?.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(n)]
            .forEach(id=>{teamBufSet[id]=(teamBufSet[id]||0)+1;});
        });
        const typeCounts={melee:0,tank:0,range:0,support:0};
        result[ti].forEach(n=>{if(MONSTERS[n])typeCounts[MONSTERS[n].type]++;});
        const frontTarget=Math.round(teamSize*strat.typeRatio.front);
        const rangeTarget=Math.round(teamSize*strat.typeRatio.range);
        const supportTarget=teamSize-frontTarget-rangeTarget;
        const frontNeed=frontTarget-((typeCounts.melee||0)+typeCounts.tank);
        const rangeNeed=rangeTarget-(typeCounts.range||0);
        const supportNeed=supportTarget-(typeCounts.support||0);

        const scored = available.map(nm=>{
          const m=MONSTERS[nm];
          const ids=new Set([...(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)]);
          let syn=0;
          ids.forEach(id=>{
            const b=BUFFS[id];if(!b)return;
            const v=bVal(id);
            const cat=OFF_IDS.has(id)?'off':DEF_IDS.has(id)?'def':TEAM_IDS.has(id)?'team':'off';
            const w=W[cat]??1;
            if(!teamBufSet[id])syn+=b.team?v*w*1.4:v*w;
            else if(b.team)syn+=v*w*0.5;
            else syn-=v*0.3;
          });
          let comp=0;
          const t=m.type;
          const isFront=t==='melee'||t==='tank', isRange=t==='range', isSupport=t==='support';
          const compW=W.off+W.def+W.team;
          if(isFront)comp+=frontNeed>0?(35+frontNeed*12)*(compW/3):(frontNeed<-1?-30:0);
          if(isRange)comp+=rangeNeed>0?(35+rangeNeed*12)*(compW/3):(rangeNeed<-1?-30:0);
          if(isSupport)comp+=supportNeed>0?(55+supportNeed*18)*(compW/3):(supportNeed<-1?-40:0);
          if(isSupport&&strat.typeRatio.support===0)comp-=80;
          return {nm, score: syn+comp+getAwkLevel(nm)*6};
        }).sort((a,b)=>b.score-a.score);

        const k=Math.max(1,Math.round(randomness));
        const pool=scored.slice(0,k);
        const pick=pool[Math.floor(Math.random()*pool.length)];
        if(pick) result[ti].push(pick.nm);
      }
    }
    return result;
  }

  function evalAll(teamsState){
    return teamsState.reduce((sum,members,i)=>sum+evalTeamScore(members, STRATEGIES[strategies[i]]||STRATEGIES.balanced),0);
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
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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
    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;
        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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
    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;
        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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
    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;
        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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
    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;
        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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
    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;
        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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
    function localSearchAll(teamsState, maxPasses) {
        let best = teamsState.map(t => [...t]);
        let bestTotal = evalAll(best);
        let improved = true, pass = 0;
        while (improved && pass < maxPasses) {
            improved = false; pass++;
            for (let ti = 0; ti < best.length; ti++) {
                const strat = STRATEGIES[strategies[ti]] || STRATEGIES.balanced;

                for (let i = 0; i < best[ti].length; i++) {
                    // 1. On recalcule les monstres utilisés dynamiquement pour CHAQUE emplacement (i)
                    const allUsed = new Set(baseUsed);
                    best.forEach((t, j) => {
                        t.forEach((m, idx) => {
                            // Bloquer si le monstre est dans une autre équipe (j !== ti)
                            // OU s'il est déjà dans l'équipe actuelle mais sur un AUTRE emplacement (idx !== i)
                            if (j !== ti || idx !== i) {
                                allUsed.add(m);
                            }
                        });
                    });

                    // 2. On filtre les monstres vraiment disponibles pour cet emplacement précis
                    const available = Object.keys(MONSTERS).filter(nm => !allUsed.has(nm) && !excludedFromReco.includes(nm));

                    let localBestSwap = null, localBestTotal = bestTotal;
                    for (const cand of available) {
                        if (cand === best[ti][i]) continue; // Inutile de tester le monstre déjà en place contre lui-même

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

  const ATTEMPTS=15;
  let bestOverall=null, bestOverallScore=-Infinity;
  for(let a=0;a<ATTEMPTS;a++){
    const randomness = a<3 ? 1 : 3;
    const attempt = buildOneAttempt(randomness);
    const refined = localSearchAll(attempt, 2);
    if(refined.total>bestOverallScore){ bestOverallScore=refined.total; bestOverall=refined.teams; }
  }

  bestOverall.forEach((members,i)=>{ teamsArr[i].members = members; });
}

function tdoAutoBuildAllBalanced(){
  const compo=tdoTeams[tdoActiveCompo];
  autoBuildBalancedTeams(compo.teams, tdoStrategies, 15, null);
  saveTdo();renderTdo();buildGrid();
}

function gdgAutoBuildAllBalanced(){
  const compo=gdgTeams[gdgActiveCompo];
  autoBuildBalancedTeams(compo.teams, gdgStrategies, GDG_TEAM_SIZE, null);
  saveGdg();renderGdg();buildGrid();
}
function toggleGdgMode(){
  gdgMode = !gdgMode;
  if(tdoMode){ tdoMode=false; const tb=document.getElementById('tdoBtn'); if(tb){tb.style.background='rgba(72,136,216,.1)';tb.style.color='var(--tnk)';} const tdoEl=document.getElementById('tdoContainer'); if(tdoEl)tdoEl.remove(); }
  const btn = document.getElementById('gdgBtn');
  if(btn){
    btn.style.background = gdgMode ? 'rgba(220,140,40,.3)' : 'rgba(220,140,40,.1)';
    btn.style.color = gdgMode ? '#ffaa44' : '#dc8c28';
  }
  if(gdgMode){
    document.getElementById('tbSlots').style.display='none';
    document.getElementById('tbScores').style.display='none';
    document.getElementById('tbSyn').style.display='none';
    document.getElementById('tbReco').style.display='none';
    document.getElementById('szRow').style.display='none';
    document.getElementById('tbClrBtn').style.display='none';
    document.getElementById('tbCtr').style.display='none';
    let gdgEl = document.getElementById('gdgContainer');
    if(!gdgEl){ gdgEl=document.createElement('div'); gdgEl.id='gdgContainer'; gdgEl.style.flex='1'; gdgEl.style.overflow='auto'; document.getElementById('tbContent').prepend(gdgEl); }
    gdgEl.innerHTML='';
    renderGdg();
  } else {
    document.getElementById('tbSlots').style.display='';
    document.getElementById('tbScores').style.display='';
    document.getElementById('tbSyn').style.display='';
    document.getElementById('szRow').style.display='';
    document.getElementById('tbClrBtn').style.display='';
    document.getElementById('tbCtr').style.display='';
    const gdgEl=document.getElementById('gdgContainer');
    if(gdgEl)gdgEl.remove();
    renderTeam();
  }
  buildGrid();
}
function renderGdg(){
  const el=document.getElementById('gdgContainer');
  if(!el)return;
  const compo=gdgTeams[gdgActiveCompo];
  const TEAM_COLS=['#4888d8','#c89020','#c83030'];

  const compoTabs=gdgTeams.map((c,i)=>`
    <button onclick="gdgSetCompo(${i})" style="padding:5px 14px;border-radius:3px;border:1px solid ${i===gdgActiveCompo?'rgba(220,140,40,.5)':'var(--b1)'};background:${i===gdgActiveCompo?'rgba(220,140,40,.1)':'none'};color:${i===gdgActiveCompo?'#dc8c28':'var(--tx2)'};cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700;flex-shrink:0">
      ${c.name}
    </button>`).join('');

  const stratSelect=(idx)=>VISIBLE_STRATEGIES.map(k=>{const s=STRATEGIES[k];return `<option value="${k}"${gdgStrategies[idx]===k?' selected':''}>${s.icon} ${s.label}</option>`;
  }).join('');

  const teamsHtml=compo.teams.map((t,ti)=>{
    const col=TEAM_COLS[ti];
    const isActive=ti===gdgActiveTeam;
    const {off,def,team:teamScore}=calcTeamScores(t.members);
    const maxVal=200;
    const gridHtml=renderStrategicGrid(t.members,GRID_GDG_W,GRID_GDG_H,col,`gdgRemoveMember(${ti},'__NM__')`);
    const scoreBar=(label,val,barCol)=>{
      const pct=Math.min(val/maxVal*100,100);
      return`<div style="flex:1;display:flex;flex-direction:column;gap:2px">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:var(--tx2);display:flex;justify-content:space-between">
          <span>${label}</span><span style="font-weight:900;color:var(--tx3)">${val}</span>
        </div>
        <div style="height:4px;background:var(--b1);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${barCol};border-radius:2px"></div>
        </div>
      </div>`;
    };
    return`<div onclick="gdgSetTeam(${ti})" style="flex:1;min-width:0;background:var(--s2);border:1px solid ${isActive?col:'var(--b1)'};border-radius:8px;overflow:hidden;cursor:pointer">
      <div style="display:flex;align-items:center;gap:6px;padding:7px 10px;background:${isActive?`rgba(${rgb(col)},.1)`:'none'};border-bottom:1px solid var(--b1)">
        <span style="font-size:.82rem;font-weight:800;color:${col}">${t.name}</span>
        <span style="font-size:.68rem;color:var(--tx2)">${t.members.length}/${GDG_TEAM_SIZE}</span>
        ${isActive?`<span style="font-size:.62rem;font-weight:700;background:rgba(${rgb(col)},.15);color:${col};padding:2px 7px;border-radius:3px;margin-left:auto">Sélectionnée</span>`:''}
      </div>
      <div style="display:flex;gap:6px;padding:6px 10px;border-bottom:1px solid var(--b1)">
        ${scoreBar('Off',off,'var(--mel)')}${scoreBar('Déf',def,'var(--tnk)')}${scoreBar('Team',teamScore,'var(--gold)')}
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

  const usedInOther=getGdgUsed(gdgActiveTeam);
  const conflictLegend=usedInOther.size?`<div style="font-size:.72rem;color:var(--tx2);padding:4px 0 6px"><span style="color:#c83030;font-weight:700">●</span> ${usedInOther.size} monstre(s) indisponible(s) (déjà assigné dans une autre équipe)</div>`:'';

  el.innerHTML=`
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
function gdgAutoBuild(ti){
  const teamIdx = ti!==undefined ? ti : gdgActiveTeam;
  const compo=gdgTeams[gdgActiveCompo];
  const team=compo.teams[teamIdx];
  const strat=STRATEGIES[gdgStrategies[teamIdx]]||STRATEGIES.balanced;
  const usedElsewhere=getGdgUsed(teamIdx);

  const ATTEMPTS=25;
  let best=null, bestScore=-Infinity;
  for(let a=0;a<ATTEMPTS;a++){
    const randomness = a<5 ? 1 : 3;
    let candidate = randomizedGreedyBuild(GDG_TEAM_SIZE, strat, usedElsewhere, randomness);
    const improved = localSearchImprove(candidate, strat, usedElsewhere, 3);
    if(improved.score>bestScore){ bestScore=improved.score; best=improved.members; }
  }

  team.members = best || [];
  saveGdg();renderGdg();buildGrid();
}
renderSavesBar();
renderStrategyPicker();
buildSwFaqCats();
renderSwFaq();
renderFaqStrats();
buildGrid();renderCmp();renderTeam();

function evalTeamScore(members, strat){
  const W = strat.buffWeight;
  const teamBufSeen = {};
  let total = 0;

  members.forEach(nm=>{
    const m = MONSTERS[nm]; if(!m) return;
    const ids = new Set([
      ...(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),
      ...skillBuffsRaw(nm)
    ]);
    ids.forEach(id=>{
      const b = BUFFS[id]; if(!b) return;
      const v = bVal(id);
      const cat = OFF_IDS.has(id)?'off':DEF_IDS.has(id)?'def':TEAM_IDS.has(id)?'team':'off';
      const w = W[cat] ?? 1;
      if(b.team){
        if(!teamBufSeen[id]){ total += v*w*1.4; teamBufSeen[id]=1; }
        else total += v*w*0.5;
      } else {
        total += v*w;
      }
    });
    total += getAwkLevel(nm)*6;
  });

  const typeCounts = {melee:0,tank:0,range:0,support:0};
  members.forEach(nm=>{ if(MONSTERS[nm]) typeCounts[MONSTERS[nm].type]++; });
  const teamSize = members.length;
  const frontTarget   = Math.round(teamSize*strat.typeRatio.front);
  const rangeTarget   = Math.round(teamSize*strat.typeRatio.range);
  const supportTarget = teamSize - frontTarget - rangeTarget;
  const frontHave   = (typeCounts.melee||0)+(typeCounts.tank||0);
  const rangeHave   = typeCounts.range||0;
  const supportHave = typeCounts.support||0;
  const compW = W.off+W.def+W.team;

  total -= Math.abs(frontHave-frontTarget)*14*(compW/3);
  total -= Math.abs(rangeHave-rangeTarget)*14*(compW/3);
  total -= Math.abs(supportHave-supportTarget)*18*(compW/3);
  if(strat.typeRatio.support===0) total -= supportHave*80;
  if(typeCounts.tank===0 && (strat.typeRatio.front>0)) total -= 60;

  return total;
}
function randomizedGreedyBuild(teamSize, strat, usedElsewhere, randomness){
  const W = strat.buffWeight;
  const frontTarget   = Math.round(teamSize*strat.typeRatio.front);
  const rangeTarget   = Math.round(teamSize*strat.typeRatio.range);
  const supportTarget = teamSize - frontTarget - rangeTarget;
  const members = [];

  function scoreAlone(nm){
    const m=MONSTERS[nm];if(!m)return 0;
    const ids=new Set([...(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)]);
    let s=0;
    ids.forEach(id=>{
      const b=BUFFS[id];if(!b)return;
      const v=bVal(id);
      const cat=OFF_IDS.has(id)?'off':DEF_IDS.has(id)?'def':TEAM_IDS.has(id)?'team':'off';
      s+=v*(W[cat]??1)*(b.team?1.4:1);
    });
    s+=getAwkLevel(nm)*6;
    return s;
  }

  function scoreWithTeam(nm, currentMembers){
    const m=MONSTERS[nm];if(!m)return 0;
    const teamBufSet={};
    currentMembers.forEach(n=>{
      [...(MONSTERS[n]?.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(n)]
        .forEach(id=>{teamBufSet[id]=(teamBufSet[id]||0)+1;});
    });
    const ids=new Set([...(m.awakenings||[]).filter(a=>a.level!==3).flatMap(a=>a.buffs||[]),...skillBuffsRaw(nm)]);
    const typeCounts={melee:0,tank:0,range:0,support:0};
    currentMembers.forEach(n=>{if(MONSTERS[n])typeCounts[MONSTERS[n].type]++;});
    const frontNeed=frontTarget-((typeCounts.melee||0)+(typeCounts.tank||0));
    const rangeNeed=rangeTarget-(typeCounts.range||0);
    const supportNeed=supportTarget-(typeCounts.support||0);
    let syn=0;
    ids.forEach(id=>{
      const b=BUFFS[id];if(!b)return;
      const v=bVal(id);
      const cat=OFF_IDS.has(id)?'off':DEF_IDS.has(id)?'def':TEAM_IDS.has(id)?'team':'off';
      const w=W[cat]??1;
      if(!teamBufSet[id])syn+=b.team?v*w*1.4:v*w;
      else if(b.team)syn+=v*w*0.5;
      else syn-=v*0.3;
    });
    let comp=0;
    const t=m.type;
    const isFront=t==='melee'||t==='tank';
    const isRange=t==='range';
    const isSupport=t==='support';
    const compW=W.off+W.def+W.team;
    if(isFront)comp+=frontNeed>0?(35+frontNeed*12)*(compW/3):(frontNeed<-1?-30:0);
    if(isRange)comp+=rangeNeed>0?(35+rangeNeed*12)*(compW/3):(rangeNeed<-1?-30:0);
    if(isSupport)comp+=supportNeed>0?(55+supportNeed*18)*(compW/3):(supportNeed<-1?-40:0);
    if(isSupport&&strat.typeRatio.support===0)comp-=80;
    if(t==='tank'&&!typeCounts.tank)comp+=200;
    return syn+comp+getAwkLevel(nm)*6;
  }

  function pickRandomTop(scoredList, k){
    const pool = scoredList.slice(0, k);
    return pool[Math.floor(Math.random()*pool.length)];
  }

  for(let i=0;i<teamSize;i++){
    const available = Object.keys(MONSTERS).filter(nm=>!members.includes(nm)&&!usedElsewhere.has(nm)&&!excludedFromReco.includes(nm));
    if(!available.length) break;

    const scored = members.length===0
      ? available.map(nm=>({nm,score:scoreAlone(nm)})).sort((a,b)=>b.score-a.score)
      : available.map(nm=>({nm,score:scoreWithTeam(nm,members)})).sort((a,b)=>b.score-a.score);
    if(!scored.length) break;

    const k = Math.max(1, Math.round(randomness));
    const pick = pickRandomTop(scored, k);
    if(pick) members.push(pick.nm);
  }
  return members;
}
function localSearchImprove(members, strat, usedElsewhere, maxPasses){
  let best = [...members];
  let bestScore = evalTeamScore(best, strat);
  let improved = true;
  let pass = 0;

  while(improved && pass<maxPasses){
    improved = false; pass++;
    const available = Object.keys(MONSTERS).filter(nm=>!best.includes(nm)&&!usedElsewhere.has(nm)&&!excludedFromReco.includes(nm));

    for(let i=0;i<best.length;i++){
      let localBestSwap=null, localBestScore=bestScore;
      for(const cand of available){
        const trial=[...best]; trial[i]=cand;
        const sc=evalTeamScore(trial, strat);
        if(sc>localBestScore){ localBestScore=sc; localBestSwap=cand; }
      }
      if(localBestSwap){
        best[i]=localBestSwap;
        bestScore=localBestScore;
        improved=true;
      }
    }
  }
  return {members:best, score:bestScore};
}
function renderSpellCardSolo(s, type, label){
  if(!s) return `<div style="border:1px solid var(--b1);border-radius:8px;padding:10px 12px;min-width:0">
    <span class="skill-type ${type}">${label}</span>
    <div style="color:var(--tx2);font-size:.85rem;font-style:italic;margin-top:6px">Non renseigné</div>
  </div>`;
  const sc=spellScore(s);
  const r=sc/MAX_SPELL_EACH;
  const col=sCol(r);
  const meta = `<div class="skill-meta" style="margin-top:8px">
    ${s.atk_pct  ? `<span class="skill-meta-tag atk">${s.atk_pct}% ATQ</span>` : ''}
    ${(s.hits||1)>1 ? `<span class="skill-meta-tag hit">×${s.hits} coups</span>` : ''}
    ${s.aoe ? `<span class="skill-meta-tag aoe">Zone</span>` : '<span class="skill-meta-tag">Cible unique</span>'}
  </div>`;
  const buffsHtml = s.buffs&&s.buffs.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">${s.buffs.map(id=>{const b=BUFFS[id];if(!b)return'';return`<span style="font-size:.72rem;padding:3px 8px;border-radius:3px;background:var(--s3);color:var(--tx3);word-break:break-word">${b.label}</span>`;}).join('')}</div>`
    : '';
  return `<div style="border:1px solid var(--b1);border-radius:8px;padding:10px 12px;min-width:0">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="skill-type ${type}">${label}</span>
      <span style="font-size:.85rem;font-weight:800;color:${col}">${sc}/100</span>
    </div>
    <div style="font-size:.85rem;color:var(--tx3);line-height:1.5;margin-top:6px;word-break:break-word">${s.desc||''}</div>
    ${meta}
    ${buffsHtml}
  </div>`;
}

function renderCmpRowSolo(nm,idx){
  const m=MONSTERS[nm],tot=totPts(m,nm),r=tot/MAX_T,c=sCol(r),col=SCOLS[idx];
  const awks=(m.awakenings||[]).filter(a=>a.level!==3);
  const a5=awks.find(a=>a.level===5),a7=awks.find(a=>a.level===7);
  const sk=SKILLS(nm);
  const skPts=spellScore(sk.basic)+spellScore(sk.crit)+spellScore(sk.exclusive);
  const awkSum=Math.min((m.awakenings||[]).reduce((s,a)=>s+awkPts(a),0),MAX_AWK);

  return`<div class="mrow" style="border-left:4px solid ${col};width:100%">
    <div style="display:flex;gap:clamp(8px,3%,16px);padding:clamp(10px,3%,18px) clamp(10px,3%,18px) clamp(8px,2%,14px);align-items:flex-start;position:relative;flex-wrap:wrap">
      <div class="mrow-port" style="width:clamp(96px,32%,144px);height:clamp(96px,32%,144px);flex-shrink:0"><img src="${IP}${nm}.png" onerror="this.style.display='none'"></div>
      <div class="mrow-port-rm" onclick="removeCmp(${idx})">×</div>
      <div style="flex:1;min-width:120px">
        <div class="mrow-name" style="font-size:clamp(1rem,5cqw,1.25rem);word-break:break-word">${nm}</div>
        <div class="mrow-type ${TCLS[m.type]||''}">${TLBL[m.type]}</div>
        <div class="mrow-tagline" style="word-break:break-word">${genTagline(nm)}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="mrow-score" style="color:${c};font-size:clamp(1.6rem,7cqw,2.4rem)">${tot}</div>
        <div class="mrow-score-sub">/ ${MAX_T}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 clamp(10px,3%,18px) clamp(10px,2%,16px)">
      <div style="background:var(--s3);border-radius:6px;padding:10px 12px;min-width:0">
        <div style="font-size:.7rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.4px;font-weight:700">Éveils</div>
        <div style="font-size:clamp(.9rem,4cqw,1.1rem);font-weight:800;margin-top:2px;color:var(--tx)">${awkSum} <span style="font-size:.75rem;color:var(--tx2);font-weight:400">/ ${MAX_AWK}</span></div>
      </div>
      <div style="background:var(--s3);border-radius:6px;padding:10px 12px;min-width:0">
        <div style="font-size:.7rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.4px;font-weight:700">Sorts</div>
        <div style="font-size:clamp(.9rem,4cqw,1.1rem);font-weight:800;margin-top:2px;color:var(--tx)">${skPts} <span style="font-size:.75rem;color:var(--tx2);font-weight:400">/ 300</span></div>
      </div>
    </div>
    <div style="padding:0 clamp(10px,3%,18px) clamp(10px,2%,16px)">
      <button onclick="showSimilarMonsters('${nm}')" style="width:100%;font-size:.82rem;font-weight:700;padding:9px;border-radius:6px;border:1px solid rgba(168,212,40,.45);background:rgba(168,212,40,.12);color:var(--green2);cursor:pointer;font-family:inherit">🔗 Voir les monstres similaires</button>
    </div>
    <div style="border-top:1px solid var(--b1);padding:clamp(10px,2%,14px) clamp(10px,3%,18px)">
      <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--tx2);margin-bottom:10px">Compétences</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${renderSpellCardSolo(sk.basic,'basic','Attaque de base')}
        ${renderSpellCardSolo(sk.crit,'crit','Attaque critique')}
        ${renderSpellCardSolo(sk.exclusive,'exclusive','Compétence exclusive')}
      </div>
    </div>
    <div style="border-top:1px solid var(--b1);padding:clamp(10px,2%,14px) clamp(10px,3%,18px);display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="min-width:0">
        <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--gold);margin-bottom:8px">Éveil 5★</div>
        ${a5?buffChips(a5.buffs||[],nm):'<div style="color:var(--tx2);font-size:.82rem;font-style:italic">Aucun éveil 5★</div>'}
      </div>
      <div style="min-width:0">
        <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:#cc2848;margin-bottom:8px">Éveil 7★</div>
        ${a7?buffChips(a7.buffs||[],nm):'<div style="color:var(--tx2);font-size:.82rem;font-style:italic">Aucun éveil 7★</div>'}
      </div>
    </div>
	<div id="simWrap_${nm.replace(/[^a-z0-9]/gi,'')}" style="display:none;padding:0 clamp(10px,3%,18px) 14px"></div>
  </div>`;
}
function renderSpellCardCompact(s, type, label){
  if(!s) return `<div style="border:1px solid var(--b1);border-radius:6px;padding:8px 10px">
    <span class="skill-type ${type}" style="font-size:.6rem">${label}</span>
    <div style="color:var(--tx2);font-size:.74rem;font-style:italic;margin-top:4px">Non renseigné</div>
  </div>`;
  const sc=spellScore(s);
  const r=sc/MAX_SPELL_EACH;
  const col=sCol(r);
  const buffsHtml = s.buffs&&s.buffs.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px">${s.buffs.map(id=>{const b=BUFFS[id];if(!b)return'';return`<span style="font-size:.65rem;padding:2px 6px;border-radius:3px;background:var(--s3);color:var(--tx3)">${b.label}</span>`;}).join('')}</div>`
    : '';
  return `<div style="border:1px solid var(--b1);border-radius:6px;padding:8px 10px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="skill-type ${type}" style="font-size:.6rem">${label}</span>
      <span style="font-size:.72rem;font-weight:800;color:${col}">${sc}/100</span>
    </div>
    <div style="font-size:.72rem;color:var(--tx2);margin-top:3px">${s.name||''}</div>
    ${buffsHtml}
  </div>`;
}

function awkBadgesOnly(buffs){
  if(!buffs||!buffs.length)return'<div style="color:var(--tx2);font-size:.72rem;font-style:italic">Aucun</div>';
  return `<div style="display:flex;flex-wrap:wrap;gap:3px">${buffs.map(id=>{
    const b=BUFFS[id];if(!b)return'';
    return`<span style="font-size:.65rem;padding:2px 7px;border-radius:3px;background:var(--s3);border-left:2px solid ${b.color};color:var(--tx3)">${b.label}</span>`;
  }).join('')}</div>`;
}

function renderCmpRowCompact(nm,idx){
  const m=MONSTERS[nm],tot=totPts(m,nm),r=tot/MAX_T,c=sCol(r),col=SCOLS[idx];
  const awks=(m.awakenings||[]).filter(a=>a.level!==3);
  const a5=awks.find(a=>a.level===5),a7=awks.find(a=>a.level===7);
  const sk=SKILLS(nm);

  return`<div class="mrow" style="border-left:4px solid ${col};flex:1;min-width:0">
    <div style="display:flex;gap:10px;padding:12px 14px;align-items:flex-start;position:relative">
      <div class="mrow-port" style="width:52px;height:52px"><img src="${IP}${nm}.png" onerror="this.style.display='none'"></div>
      <div class="mrow-port-rm" onclick="removeCmp(${idx})" style="top:6px;right:6px">×</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:1rem;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nm}</div>
        <div class="mrow-type ${TCLS[m.type]||''}" style="font-size:.65rem;padding:2px 7px">${TLBL[m.type]}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:1.5rem;font-weight:900;color:${c};line-height:1">${tot}</div>
        <div style="font-size:.65rem;color:var(--tx2)">/ ${MAX_T}</div>
      </div>
    </div>
    <div style="padding:0 14px 12px">
      <button onclick="showSimilarMonsters('${nm}')" style="width:100%;font-size:.7rem;font-weight:700;padding:6px;border-radius:5px;border:1px solid rgba(168,212,40,.45);background:rgba(168,212,40,.12);color:var(--green2);cursor:pointer;font-family:inherit">🔗 Similaires</button>
    </div>
    <div style="border-top:1px solid var(--b1);padding:10px 14px">
      <div style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--tx2);margin-bottom:7px">Compétences</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${renderSpellCardCompact(sk.basic,'basic','Base')}
        ${renderSpellCardCompact(sk.crit,'crit','Crit')}
        ${renderSpellCardCompact(sk.exclusive,'exclusive','Exclu')}
      </div>
    </div>
    <div style="border-top:1px solid var(--b1);padding:10px 14px;display:flex;flex-direction:column;gap:10px">
      <div>
        <div style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--gold);margin-bottom:5px">Éveil 5★</div>
        ${awkBadgesOnly(a5?a5.buffs:null)}
      </div>
      <div>
        <div style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#cc2848;margin-bottom:5px">Éveil 7★</div>
        ${awkBadgesOnly(a7?a7.buffs:null)}
      </div>
    </div>
	<div id="simWrap_${nm.replace(/[^a-z0-9]/gi,'')}" style="display:none;padding:0 14px 12px"></div>
  </div>`;
}
