/* MODELS is loaded globally from js/data.js */

const GROUP_META = {
  'VLA':                 {label:'VLA', short:'VLA'},
  'WAM':                 {label:'WAM', short:'WAM'},
  'Predictive-VLA':      {label:'Predictive VLA', short:'Pred-VLA'},
  'Combined':            {label:'VLA + WAM Combined', short:'Combined'},
  'Platform':            {label:'Deployment Platform', short:'Platform'},
  'Non-VLA Baseline':    {label:'Non-VLA Baseline', short:'Baseline'},
  'Historical Precursor':{label:'Historical Precursor', short:'Precursor'},
};

const TOOLTIPS = {
  worldModel: 'Explicitly learns or generates future environment states, frames, or physical-state representations conditioned on actions.',
  predictive: 'Explicitly predicts future observations, states, or consequences beyond the immediate next action.',
  planner: 'Evaluates, searches, optimizes, or selects among predicted rollouts — reasoning alone doesn\u2019t count.',
};

function extractUrl(text){
  if(!text) return null;
  const m = text.match(/https?:\/\/[^\s)]+/);
  if(!m) return null;
  return m[0].replace(/[),.]+$/, '');
}
function yearOf(m){
  const match = (m.Year || '').match(/(19|20)\d{2}/);
  return match ? parseInt(match[0]) : null;
}
function oneLiner(m){ return m['Problem Solved'] || m['Why Introduced'] || ''; }
function escapeHtml(s){ return (s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

/* ================= Timeline ================= */
function renderTimeline(){
  const years = [2022,2023,2024,2025,2026];
  const track = document.getElementById('timeline');
  const axis = document.createElement('div');
  axis.className = 'timeline-axis';
  track.appendChild(axis);
  const yearsRow = document.createElement('div');
  yearsRow.className = 'timeline-years';
  years.forEach((y, yi)=>{
    const col = document.createElement('div');
    col.className = 'timeline-year' + (yi === years.length-1 ? ' latest' : '');
    const lbl = document.createElement('div');
    lbl.className = 'yr-label';
    lbl.textContent = "'" + String(y).slice(2);
    col.appendChild(lbl);
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'timeline-dots';
    MODELS.filter(m => yearOf(m) === y).forEach(m=>{
      const dot = document.createElement('div');
      const isWam = m.group==='WAM'||m.group==='Combined';
      const isPrecursor = m.group==='Historical Precursor';
      const isOther = !isPrecursor && !(m.group==='VLA'||m.group==='Predictive-VLA'||isWam);
      dot.className = 'tdot' + (isWam ? ' wam' : (isPrecursor ? ' precursor' : (isOther ? ' other' : '')));
      dot.title = m.Model + ' (' + (GROUP_META[m.group]?GROUP_META[m.group].label:m.group) + ')';
      dot.addEventListener('click', ()=> openModal(m));
      dotsWrap.appendChild(dot);
    });
    col.appendChild(dotsWrap);
    yearsRow.appendChild(col);
  });
  track.appendChild(yearsRow);
}

/* ================= Start Here ================= */
const STARTERS = [
  {name:'RT-1', why:'The baseline everything else answers to \u2014 no language-model backbone, just a transformer trained on 130K real-robot episodes.'},
  {name:'OpenVLA', why:'The model that made the field accessible: a 7B open-weight VLA with public code and checkpoints, competitive with much larger closed systems.'},
  {name:'\u03c00 (pi-zero)', why:'A widely-cited example of the current generation \u2014 flow-matching action generation on a vision-language backbone. A good anchor for comparing everything after it.'},
];
function renderStartHere(){
  const grid = document.getElementById('start-grid');
  STARTERS.forEach((s,i)=>{
    const m = MODELS.find(x=>x.Model===s.name);
    if(!m) return;
    const el = document.createElement('div');
    el.className = 'start-card';
    el.innerHTML = `<div class="num">0${i+1} / ${yearOf(m)||''}</div><h4>${m.Model}</h4><p>${oneLiner(m)}</p><div class="why">\u2192 ${s.why}</div>`;
    el.addEventListener('click', ()=> openModal(m));
    grid.appendChild(el);
  });
}

/* ================= Wizard ================= */
const WIZARD_QUESTIONS = [
  {
    key: 'experience', type: 'single', label: 'Step 1 of 5 \u2014 Background',
    q: "Where are you starting from?",
    options: [
      {v:'new', t:'New to this field', d:'I want something I can actually get running and understand.'},
      {v:'some', t:'Some hands-on experience', d:'I\u2019ve fine-tuned a model or run a robot-learning repo before.'},
      {v:'advanced', t:'Advanced / research background', d:'I\u2019m comfortable with research code, closed docs, and rough edges.'},
    ]
  },
  {
    key: 'hardware', type: 'single', label: 'Step 2 of 5 \u2014 Hardware',
    q: "What GPU access do you actually have?",
    options: [
      {v:'none', t:'No dedicated GPU', d:'CPU only, or occasional free cloud credits.'},
      {v:'consumer', t:'Single consumer GPU', d:'RTX 3060\u20134090 class, 8\u201324GB VRAM.'},
      {v:'highend', t:'Single high-end GPU', d:'A100 / H100-class, 40GB+ VRAM.'},
      {v:'cluster', t:'Multi-GPU / cluster', d:'Lab or cloud cluster, several high-end GPUs.'},
    ]
  },
  {
    key: 'openness', type: 'single', label: 'Step 3 of 5 \u2014 Licensing',
    q: "Do you need to self-host the weights?",
    options: [
      {v:'open', t:'Yes \u2014 must be open weights', d:'I need to download and run it myself, no vendor lock-in.'},
      {v:'flexible', t:'Flexible', d:'Research-only or partial licenses are fine.'},
      {v:'exploring', t:'Just exploring', d:'I don\u2019t know yet \u2014 show me what\u2019s out there.'},
    ]
  },
  {
    key: 'priorities', type: 'rank', maxPicks: 3, label: 'Step 4 of 5 \u2014 Priorities',
    q: "What matters most for your project? Pick up to 3, in order — your 1st pick counts most.",
    options: [
      {v:'community', t:'Easy setup, strong community', d:'Documentation, tutorials, people who\u2019ve done it before.'},
      {v:'capability', t:'Cutting-edge capability', d:'The strongest performance available, even if rougher to run.'},
      {v:'worldmodel', t:'Predicting outcomes / world modeling', d:'I need it to imagine or evaluate future states, not just act.'},
      {v:'realrobot', t:'Proven on real hardware', d:'I care most about real-robot results, not just simulation.'},
      {v:'finetune', t:'Easy to fine-tune on my own data', d:'Fast, low-data adaptation matters more than raw benchmark scores.'},
      {v:'efficiency', t:'Fast inference / real-time control', d:'Needs to run at high control frequency on modest hardware.'},
    ]
  },
  {
    key: 'domain', type: 'single', label: 'Step 5 of 5 \u2014 Domain',
    q: "Which category fits your project?",
    options: [
      {v:'VLA', t:'Vision-Language-Action', d:'A policy that follows instructions and acts directly.'},
      {v:'WAM', t:'World / prediction-focused', d:'Something that imagines or predicts future states.'},
      {v:'any', t:'Not sure \u2014 show me the best overall', d:'Recommend across all categories.'},
    ]
  },
];

let wizardState = {};
let wizardStep = 0;

function renderWizard(){
  const host = document.getElementById('wizard-host');
  if(wizardStep >= WIZARD_QUESTIONS.length){
    renderWizardResults(host);
    return;
  }
  const step = WIZARD_QUESTIONS[wizardStep];
  const isRank = step.type === 'rank';
  const picked = isRank ? (wizardState[step.key] || []) : null;

  host.innerHTML = `
    <div class="wizard-inner">
      <div class="wizard-progress">
        ${WIZARD_QUESTIONS.map((_,i)=>`<div class="seg ${i<wizardStep?'done':(i===wizardStep?'current':'')}"></div>`).join('')}
      </div>
      <div class="wizard-step-label">${step.label}</div>
      <div class="wizard-q">${step.q}</div>
      <div class="wizard-options">
        ${step.options.map(o=>{
          if(!isRank){
            return `<button class="wopt ${wizardState[step.key]===o.v?'selected':''}" data-v="${o.v}">
              <strong>${o.t}</strong><small>${o.d}</small>
            </button>`;
          }
          const rank = picked.indexOf(o.v);
          return `<button class="wopt rankable ${rank>=0?'selected':''}" data-v="${o.v}">
            ${rank>=0 ? `<span class="rank-badge">${rank+1}</span>` : ''}
            <strong>${o.t}</strong><small>${o.d}</small>
          </button>`;
        }).join('')}
      </div>
      <div class="wizard-nav">
        <button class="wizard-restart" id="wiz-back" style="${wizardStep===0?'visibility:hidden':''}">\u2190 back</button>
        ${isRank
          ? `<button class="btn primary" id="wiz-continue" ${picked.length===0?'disabled style="opacity:.4;cursor:not-allowed;"':''}>Continue with ${picked.length} selected \u2192</button>`
          : `<span class="mono" style="font-size:11px;color:var(--ink-dim);">select an option to continue</span>`
        }
      </div>
    </div>
  `;

  if(isRank){
    host.querySelectorAll('.wopt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const v = btn.dataset.v;
        const arr = wizardState[step.key] || (wizardState[step.key] = []);
        const idx = arr.indexOf(v);
        if(idx >= 0){ arr.splice(idx,1); }
        else if(arr.length < step.maxPicks){ arr.push(v); }
        renderWizard();
      });
    });
    const cont = document.getElementById('wiz-continue');
    if(cont) cont.addEventListener('click', ()=>{
      wizardStep++;
      renderWizard();
      host.scrollIntoView({behavior:'smooth', block:'start'});
    });
  } else {
    host.querySelectorAll('.wopt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        wizardState[step.key] = btn.dataset.v;
        wizardStep++;
        renderWizard();
        host.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }
  const back = document.getElementById('wiz-back');
  if(back) back.addEventListener('click', ()=>{ wizardStep = Math.max(0, wizardStep-1); renderWizard(); });
}

/* ---- scoring: each factor tracked separately so results can show a breakdown ---- */
const PRIORITY_SCORERS = {
  community: (m, tags) => {
    if(tags.weights==='open' && (tags.difficulty==='low'||tags.difficulty==='medium'))
      return {delta:2.5, why:'Open weights + manageable difficulty \u2014 good community on-ramp'};
    return {delta:0, why:null};
  },
  capability: (m, tags) => {
    const yr = yearOf(m);
    let delta = 0, why = null;
    if(yr && yr >= 2025){ delta += 1.5; why = `Recent release (${m.Year})`; }
    if(tags.difficulty==='high'){ delta += 1; }
    return {delta, why};
  },
  worldmodel: (m, tags) => {
    if(tags.worldModel==='yes') return {delta:4, why:'Explicitly tagged World Model: Yes'};
    if(tags.predictive==='yes') return {delta:2, why:'Explicitly tagged Predictive: Yes'};
    return {delta:-1.5, why:null};
  },
  realrobot: (m, tags) => {
    let delta = 0, why = null;
    if(['VLA','Combined','Non-VLA Baseline'].includes(m.group)) delta += 1.5;
    const pa = (m['Practical Assessment']||'').toLowerCase();
    if(pa.includes('real') || pa.includes('aloha') || pa.includes('robot')){ delta += 0.75; why = 'Practical assessment references real-robot deployment'; }
    return {delta, why};
  },
  finetune: (m, tags) => {
    const ft = (m['Fine-tuning']||'').toLowerCase();
    let delta = 0, why = null;
    if(/lora|few-shot|small.{0,15}(dataset|demonstration)|\b[1-9][0-9]?\s*(demonstration|shot)/.test(ft)){
      delta += 2; why = 'Fine-tuning notes mention low-data / LoRA-style adaptation';
    }
    if(tags.difficulty==='low' || tags.difficulty==='medium') delta += 0.5;
    return {delta, why};
  },
  efficiency: (m, tags) => {
    const blob = ((m['Compute Requirements']||'') + ' ' + (m['Action Representation']||'') + ' ' + (m.Outputs||'')).toLowerCase();
    let delta = 0, why = null;
    if(tags.hardware==='embedded'){ delta += 2.5; why = 'Compute requirements describe embedded/on-device inference'; }
    if(/real-time|\b[5-9][0-9]\s*hz|\b[1-9][0-9]{2,}\s*hz/.test(blob)){ delta += 1.5; why = why || 'Reports a high control/inference rate'; }
    if(tags.hardware==='consumer') delta += 0.75;
    return {delta, why};
  },
};

function scoreModel(m, state){
  const tags = m.tags || {};
  const breakdown = {experience:0, hardware:0, openness:0, priorities:0};
  const why = [];

  const diffMap = {
    new:      {low:3, medium:0, high:-3, unknown:-1},
    some:     {low:1, medium:3, high:1,  unknown:0},
    advanced: {low:0, medium:2, high:3,  unknown:1},
  };
  breakdown.experience = (diffMap[state.experience]||{})[tags.difficulty] ?? 0;
  if(breakdown.experience >= 2) why.push(`Difficulty (${m.Difficulty || 'n/a'}) matches your experience level`);
  if(breakdown.experience <= -2) why.push(`Flagged difficulty "${m.Difficulty || 'high'}" \u2014 may be a steep start for a newcomer`);

  const hwMap = {
    none:     {embedded:2, consumer:3, highend:-2, cluster:-4, unknown:0},
    consumer: {embedded:2, consumer:3, highend:1,  cluster:-3, unknown:0.5},
    highend:  {embedded:1, consumer:2, highend:3,  cluster:1,  unknown:0.5},
    cluster:  {embedded:1, consumer:2, highend:3,  cluster:3,  unknown:0.5},
  };
  breakdown.hardware = (hwMap[state.hardware]||{})[tags.hardware] ?? 0;
  if(breakdown.hardware >= 2) why.push(`Compute requirements line up with your hardware: "${(m['Compute Requirements']||'').replace(/^\[[^\]]+\]\s*/,'').slice(0,90)}${(m['Compute Requirements']||'').length>90?'\u2026':''}"`);
  if(breakdown.hardware <= -2) why.push(`Likely needs more hardware than you have available`);

  const openMap = {
    open:      {open:4, unclear:0, closed:-5},
    flexible:  {open:2, unclear:1, closed:0},
    exploring: {open:0.5, unclear:0.5, closed:0.5},
  };
  breakdown.openness = (openMap[state.openness]||{})[tags.weights] ?? 0;
  if(state.openness==='open' && tags.weights==='open') why.push('Weights are publicly released \u2014 you can self-host it');
  if(state.openness==='open' && tags.weights==='closed') why.push('Weights are closed \u2014 you would not be able to self-host this one');

  // ranked, weighted priorities: 1st pick counts most
  const picks = state.priorities || [];
  const rankWeights = [1.6, 1.2, 0.9];
  picks.forEach((key, idx) => {
    const scorer = PRIORITY_SCORERS[key];
    if(!scorer) return;
    const {delta, why: w} = scorer(m, tags);
    const weighted = delta * (rankWeights[idx] || 0.7);
    breakdown.priorities += weighted;
    if(w && weighted !== 0) why.push(`${w} (priority #${idx+1})`);
  });

  const score = breakdown.experience + breakdown.hardware + breakdown.openness + breakdown.priorities;
  return {score, why, breakdown};
}

function runWizardScoring(state){
  let pool = MODELS.filter(m => m.group !== 'Historical Precursor' && m.group !== 'Platform');
  if(state.domain === 'VLA') pool = pool.filter(m => ['VLA','Predictive-VLA','Non-VLA Baseline'].includes(m.group));
  if(state.domain === 'WAM') pool = pool.filter(m => ['WAM','Combined','Predictive-VLA'].includes(m.group));

  const scored = pool.map(m => {
    const {score, why, breakdown} = scoreModel(m, state);
    return {m, score, why, breakdown};
  });
  scored.sort((a,b)=> b.score - a.score);
  return {top: scored.slice(0, 3), maxScore: scored[0] ? scored[0].score : 1, poolSize: pool.length};
}

function meterBar(label, value, max){
  const pct = Math.max(4, Math.min(100, Math.round((value / max) * 100)));
  return `<div class="meter-row"><span class="meter-label">${label}</span><div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div></div>`;
}

function renderWizardResults(host){
  const {top: results, maxScore} = runWizardScoring(wizardState);
  const factorMax = Math.max(4, ...results.map(r => Math.max(r.breakdown.experience, r.breakdown.hardware, r.breakdown.openness, r.breakdown.priorities)));
  host.innerHTML = `
    <div class="wizard-results">
      <div class="wr-head">
        <span class="tag">Your matches</span>
        <h3>Based on what you told me, start here</h3>
        <p>Ranked using your answers against each model's actual difficulty rating, compute requirements, weights availability, and your ranked priorities \u2014 with your 1st-choice priority weighted highest. Not a generic popularity list.</p>
      </div>
      <div class="wr-list">
        ${results.map((r,i)=>`
          <div class="wr-card">
            <div class="wr-rank">MATCH ${i+1}</div>
            <div class="wr-top">
              <h4>${r.m.Model}</h4>
              <span class="wr-score mono">score ${r.score.toFixed(1)} \u00b7 ${GROUP_META[r.m.group]?GROUP_META[r.m.group].label:r.m.group}</span>
            </div>
            <div style="color:var(--ink-dim);font-size:13.5px;margin-top:6px;">${oneLiner(r.m)}</div>
            <div class="meter-group">
              ${meterBar('Experience fit', r.breakdown.experience, factorMax)}
              ${meterBar('Hardware fit', r.breakdown.hardware, factorMax)}
              ${meterBar('License fit', r.breakdown.openness, factorMax)}
              ${meterBar('Priority fit', r.breakdown.priorities, factorMax)}
            </div>
            <ul class="wr-why">${r.why.map(w=>`<li>${w}</li>`).join('') || '<li>Best available overall match among your filtered options</li>'}</ul>
            <div class="wr-actions">
              <button class="btn primary wr-open" data-name="${escapeHtml(r.m.Model)}">View full spec sheet</button>
              <button class="btn wr-compare" data-name="${escapeHtml(r.m.Model)}">+ Add to compare</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="wizard-nav" style="margin-top:26px;">
        <button class="wizard-restart" id="wiz-restart">\u21ba start over</button>
        <span class="mono" style="font-size:11px;color:var(--ink-dim);">${results.length} shown \u00b7 considered across the directory</span>
      </div>
    </div>
  `;
  host.querySelectorAll('.wr-open').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = MODELS.find(x=>x.Model===btn.dataset.name);
      if(m) openModal(m);
    });
  });
  host.querySelectorAll('.wr-compare').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      toggleCompare(btn.dataset.name);
      btn.textContent = selectedForCompare.includes(btn.dataset.name) ? '\u2713 Added' : '+ Add to compare';
    });
  });
  document.getElementById('wiz-restart').addEventListener('click', ()=>{
    wizardState = {}; wizardStep = 0; renderWizard();
    host.scrollIntoView({behavior:'smooth', block:'start'});
  });
}

/* ================= Explorer (search + facets + grid) ================= */
let activeGroup = 'All';
let searchTerm = '';
let activeFacets = { hardware:null, weights:null, worldModel:null, difficulty:null };
let selectedForCompare = [];
let currentSort = 'year-desc';
let favoritesOnly = false;

/* ---- favorites, persisted in localStorage ---- */
const FAV_KEY = 'vla-wam-field-guide:favorites';
function loadFavorites(){
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch(e){ return new Set(); }
}
function saveFavorites(){
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); } catch(e){ /* storage unavailable, ignore */ }
}
let favorites = loadFavorites();
function toggleFavorite(name){
  if(favorites.has(name)) favorites.delete(name);
  else favorites.add(name);
  saveFavorites();
  renderFavCount();
  renderGrid();
}
function renderFavCount(){
  const el = document.getElementById('fav-count');
  if(el) el.textContent = favorites.size;
}

function renderChips(){
  const chips = document.getElementById('chips');
  const groups = ['All', ...Object.keys(GROUP_META)];
  chips.innerHTML = '';
  groups.forEach(g=>{
    const count = g==='All' ? MODELS.length : MODELS.filter(m=>m.group===g).length;
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (g===activeGroup ? ' active':'');
    btn.textContent = (g==='All' ? 'All systems' : GROUP_META[g].label) + '  (' + count + ')';
    btn.addEventListener('click', ()=>{ activeGroup = g; renderChips(); renderGrid(); });
    chips.appendChild(btn);
  });
}

function renderFacets(){
  const host = document.getElementById('facets');
  const facetDefs = [
    {key:'hardware', label:'Hardware', opts:[['consumer','Consumer GPU'],['highend','High-end GPU'],['cluster','Cluster'],['embedded','Embedded/On-device']]},
    {key:'weights', label:'Weights', opts:[['open','Open'],['closed','Closed'],['unclear','Unclear']]},
    {key:'worldModel', label:'World Model', opts:[['yes','Yes'],['partial','Partial'],['no','No']]},
    {key:'difficulty', label:'Difficulty', opts:[['low','Low'],['medium','Medium'],['high','High']]},
  ];
  host.innerHTML = facetDefs.map(f => `
    <div class="facet-group">
      <span class="facet-label">${f.label}</span>
      ${f.opts.map(([v,l])=>`<button class="facet-chip ${activeFacets[f.key]===v?'active':''}" data-facet="${f.key}" data-val="${v}">${l}</button>`).join('')}
    </div>
  `).join('') + `
    <div class="facet-group">
      <span class="facet-label">Bookmarks</span>
      <button class="facet-chip fav-facet ${favoritesOnly?'active':''}" id="fav-only-chip">\u2605 Favorites only (<span id="fav-count">${favorites.size}</span>)</button>
    </div>
  `;
  host.querySelectorAll('.facet-chip[data-facet]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.dataset.facet, v = btn.dataset.val;
      activeFacets[k] = activeFacets[k] === v ? null : v;
      renderFacets();
      renderGrid();
    });
  });
  document.getElementById('fav-only-chip').addEventListener('click', ()=>{
    favoritesOnly = !favoritesOnly;
    renderFacets();
    renderGrid();
  });
}

function matchesSearch(m, term){
  if(!term) return true;
  const hay = [m.Model, m['Author Affiliations / Contributing Institutions'], m.Category, m['Problem Solved']].join(' ').toLowerCase();
  return hay.includes(term.toLowerCase());
}
function matchesFacets(m){
  const t = m.tags || {};
  if(activeFacets.hardware && t.hardware !== activeFacets.hardware) return false;
  if(activeFacets.weights && t.weights !== activeFacets.weights) return false;
  if(activeFacets.worldModel && t.worldModel !== activeFacets.worldModel) return false;
  if(activeFacets.difficulty && t.difficulty !== activeFacets.difficulty) return false;
  if(favoritesOnly && !favorites.has(m.Model)) return false;
  return true;
}

const DIFF_RANK = {low:0, medium:1, unknown:2, high:3};
function sortModels(list){
  const sorted = list.slice();
  switch(currentSort){
    case 'year-desc': sorted.sort((a,b)=> (yearOf(b)||0) - (yearOf(a)||0) || a.Model.localeCompare(b.Model)); break;
    case 'year-asc':  sorted.sort((a,b)=> (yearOf(a)||0) - (yearOf(b)||0) || a.Model.localeCompare(b.Model)); break;
    case 'name-asc':  sorted.sort((a,b)=> a.Model.localeCompare(b.Model)); break;
    case 'difficulty-asc': sorted.sort((a,b)=> (DIFF_RANK[(a.tags||{}).difficulty]??2) - (DIFF_RANK[(b.tags||{}).difficulty]??2) || a.Model.localeCompare(b.Model)); break;
    default: break;
  }
  return sorted;
}

function badge(label, val, tipKey){
  const v = (val||'').trim();
  const isOn = v.toLowerCase().startsWith('yes');
  const isPartial = v.toLowerCase().includes('partial');
  const cls = isOn ? ' on' : (isPartial ? ' partial' : '');
  const tip = tipKey ? ` title="${escapeHtml(TOOLTIPS[tipKey])}"` : '';
  const short = v ? v.split(/[\u2014\-–(]/)[0].trim().slice(0,14) : '\u2014';
  return `<span class="badge${cls}"${tip}>${label}: ${short}</span>`;
}
function diffBadge(diff){
  if(!diff) return '';
  const d = diff.toLowerCase();
  const cls = d.includes('low') ? 'diff-low' : (d.includes('high') ? 'diff-high' : '');
  return `<span class="badge ${cls}">Difficulty: ${diff.split(/[\u2014\-–(]/)[0].trim()}</span>`;
}

function renderGrid(){
  const grid = document.getElementById('card-grid');
  let filtered = MODELS.filter(m => (activeGroup==='All' || m.group===activeGroup) && matchesSearch(m, searchTerm) && matchesFacets(m));
  document.getElementById('result-count').textContent = filtered.length + ' of ' + MODELS.length + ' systems';
  grid.innerHTML = '';
  filtered = sortModels(filtered);
  filtered.forEach((m, i)=>{
    const card = document.createElement('div');
    card.className = 'mcard';
    card.dataset.group = m.group;
    card.style.animationDelay = (Math.min(i, 24) * 18) + 'ms';
    const yr = yearOf(m) || '';
    const checked = selectedForCompare.includes(m.Model);
    const isFav = favorites.has(m.Model);
    card.innerHTML = `
      <div class="mcard-top">
        <div><div class="cat">${GROUP_META[m.group] ? GROUP_META[m.group].label : m.group}</div><h3>${m.Model}</h3></div>
        <div class="mcard-top-right">
          <div class="yr mono">${yr}</div>
          <button type="button" class="fav-star ${isFav?'active':''}" title="${isFav?'Remove from favorites':'Add to favorites'}" data-name="${escapeHtml(m.Model)}">${isFav?'\u2605':'\u2606'}</button>
        </div>
      </div>
      <div class="desc">${oneLiner(m)}</div>
      <div class="badge-row">
        ${badge('World Model', m['World Model?'], 'worldModel')}
        ${badge('Planner', m['Planner?'], 'planner')}
        ${diffBadge(m.Difficulty)}
      </div>
      <div class="card-foot">
        <span class="mono" style="font-size:10.5px;color:var(--ink-dim);">${(m['Author Affiliations / Contributing Institutions']||'').split(/[,(]/)[0].trim().slice(0,28)}</span>
        <button type="button" class="compare-toggle ${checked?'checked':''}" data-name="${escapeHtml(m.Model)}">
          <span class="ct-mark">${checked?'\u2713':'+'}</span>${checked?'Comparing':'Compare'}
        </button>
      </div>
    `;
    card.querySelector('.compare-toggle').addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleCompare(m.Model);
    });
    card.querySelector('.fav-star').addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleFavorite(m.Model);
    });
    card.addEventListener('click', ()=> openModal(m));
    grid.appendChild(card);
  });
  updateURL();
}

/* ================= Compare ================= */
function toggleCompare(name){
  const idx = selectedForCompare.indexOf(name);
  if(idx >= 0) selectedForCompare.splice(idx,1);
  else {
    if(selectedForCompare.length >= 4){ selectedForCompare.shift(); }
    selectedForCompare.push(name);
  }
  renderGrid();
  renderCompareBar();
}
function renderCompareBar(){
  const bar = document.getElementById('compare-bar');
  if(selectedForCompare.length === 0){ bar.classList.remove('show'); bar.classList.remove('in'); return; }
  bar.classList.add('show');
  requestAnimationFrame(()=> bar.classList.add('in'));
  bar.innerHTML = `
    <div class="cb-left">
      <span>Compare (${selectedForCompare.length}/4):</span>
      ${selectedForCompare.map(n=>`<span class="compare-chip">${n}<button data-name="${escapeHtml(n)}">\u2715</button></span>`).join('')}
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn" id="cb-clear">Clear</button>
      <button class="btn primary" id="cb-open" ${selectedForCompare.length<2?'disabled style="opacity:.4;cursor:not-allowed;"':''}>Compare side by side</button>
    </div>
  `;
  bar.querySelectorAll('.compare-chip button').forEach(b=>{
    b.addEventListener('click', ()=>{ toggleCompare(b.dataset.name); });
  });
  document.getElementById('cb-clear').addEventListener('click', ()=>{
    selectedForCompare = []; renderGrid(); renderCompareBar();
  });
  const openBtn = document.getElementById('cb-open');
  if(openBtn && selectedForCompare.length>=2) openBtn.addEventListener('click', openCompareModal);
}

const COMPARE_FIELDS = [
  'Category','Year','Difficulty','World Model?','Predictive?','Planner?',
  'Parameters','Compute Requirements','Weights','Practical Assessment',
];
function openCompareModal(){
  const models = selectedForCompare.map(n => MODELS.find(m=>m.Model===n)).filter(Boolean);
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <button class="modal-close" id="modal-close">\u2715</button>
    <div class="modal-head">
      <div class="cat">Side-by-side comparison</div>
      <h2>${models.map(m=>m.Model).join(' vs ')}</h2>
    </div>
    <div class="modal-body">
      <div class="compare-table-wrap">
        <table class="compare-table">
          <thead><tr><th>Field</th>${models.map(m=>`<th>${escapeHtml(m.Model)}</th>`).join('')}</tr></thead>
          <tbody>
            ${COMPARE_FIELDS.map(f=>`
              <tr><td class="rowkey">${f}</td>${models.map(m=>`<td>${escapeHtml(m[f])||'\u2014'}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('modal-close').addEventListener('click', closeModal);
  showModalBackdrop();
}

function showModalBackdrop(){
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.classList.add('open');
  requestAnimationFrame(()=> backdrop.classList.add('in'));
  document.body.style.overflow = 'hidden';
}

/* ================= Detail Modal ================= */
function linkify(text){
  if(!text) return '<span style="color:var(--ink-dim)">\u2014</span>';
  const url = extractUrl(text);
  if(!url) return escapeHtml(text);
  return escapeHtml(text).replace(escapeHtml(url), `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}
function field(key, val, linked){
  return `<div class="mfield"><div class="fk">${key}</div><div class="fv">${linked ? linkify(val) : (escapeHtml(val) || '<span style="color:var(--ink-dim)">\u2014</span>')}</div></div>`;
}
function openModal(m){
  const modal = document.getElementById('modal');
  const paperUrl = extractUrl(m.Paper);
  const githubUrl = extractUrl(m.GitHub);
  modal.innerHTML = `
    <button class="modal-close" id="modal-close">\u2715</button>
    <div class="modal-head">
      <div class="cat">${GROUP_META[m.group] ? GROUP_META[m.group].label : m.group}</div>
      <h2>${m.Model}</h2>
      <div class="sub">${escapeHtml(m.Year)} \u00b7 ${escapeHtml(m['Author Affiliations / Contributing Institutions'])}</div>
      <div class="modal-links">
        ${paperUrl ? `<a class="mlink" href="${paperUrl}" target="_blank" rel="noopener">\u2197 Paper</a>` : ''}
        ${githubUrl ? `<a class="mlink" href="${githubUrl}" target="_blank" rel="noopener">\u2197 Code</a>` : ''}
        <button class="mlink" id="modal-add-compare">+ Add to compare</button>
        <button class="mlink" id="modal-copy-link">\u2398 Copy link</button>
      </div>
    </div>
    <div class="modal-body">
      <div class="mgroup"><h4>Identity, Motivation &amp; Architecture</h4>
        ${field('Category', m.Category)}${field('Problem Solved', m['Problem Solved'])}${field('Why Introduced', m['Why Introduced'])}
        ${field('Previous Limitation', m['Previous Limitation'])}${field('Inputs', m.Inputs)}${field('Outputs', m.Outputs)}
        ${field('Architecture', m.Architecture)}${field('Backbone', m.Backbone)}${field('Action Representation', m['Action Representation'])}
      </div>
      <div class="mgroup"><h4>Intelligence Characteristics</h4>
        ${field('World Model?', m['World Model?'])}${field('Predictive?', m['Predictive?'])}${field('Planner?', m['Planner?'])}
        ${field('Parameters', m.Parameters)}${field('Datasets', m.Datasets)}${field('Training Method', m['Training Method'])}
      </div>
      <div class="mgroup"><h4>Practical Deployment</h4>
        ${field('Compute Requirements', m['Compute Requirements'])}${field('Fine-tuning', m['Fine-tuning'])}
        ${field('Paper', m.Paper, true)}${field('GitHub', m.GitHub, true)}${field('Weights', m.Weights)}
        ${field('Key Contributions', m['Key Contributions'])}${field('Limitations', m.Limitations)}
      </div>
      <div class="mgroup"><h4>Relevance to Lab Automation</h4>
        ${field('Practical Assessment', m['Practical Assessment'])}${field('Difficulty', m.Difficulty)}
        ${field('Research Gaps', m['Research Gaps'])}${field('Future Scope', m['Future Scope'])}
      </div>
    </div>
  `;
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-add-compare').addEventListener('click', ()=>{
    toggleCompare(m.Model);
    closeModal();
  });
  document.getElementById('modal-copy-link').addEventListener('click', (e)=>{
    copyToClipboard(modelDeepLinkURL(m.Model), e.currentTarget);
  });
  showModalBackdrop();
}
function closeModal(){
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.classList.remove('in');
  document.body.style.overflow = '';
  setTimeout(()=> backdrop.classList.remove('open'), 180);
}
document.getElementById('modal-backdrop').addEventListener('click', (e)=>{
  if(e.target.id === 'modal-backdrop') closeModal();
});
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

/* ================= Search / sort wiring ================= */
document.getElementById('search').addEventListener('input', (e)=>{
  searchTerm = e.target.value;
  renderGrid();
});
document.getElementById('sort-select').addEventListener('change', (e)=>{
  currentSort = e.target.value;
  renderGrid();
});

/* ================= Learning Path ================= */
const LEARNING_PATH = [
  {
    when: 'Stage 1 \u2014 Foundations', title: 'See what came before "VLA" existed',
    body: 'Start with the pre-VLA baselines so the rest of the field has something to contrast against. Gato and RT-1 both act, but neither follows open-ended language instructions the way later models do \u2014 that gap is exactly what the field spent the next two years closing.',
    models: ['Gato', 'RT-1', 'PaLM-E'],
  },
  {
    when: 'Stage 2 \u2014 Hands-on', title: 'Get something running yourself',
    body: 'Both of these are open-weight, reasonably documented, and explicitly rated low-to-medium difficulty in this guide \u2014 the most realistic starting point if you want to fine-tune or deploy something rather than just read about it.',
    models: ['OpenVLA', 'SmolVLA', 'ACT (Action Chunking with Transformers)'],
  },
  {
    when: 'Stage 3 \u2014 Current frontier', title: 'See where the state of the art actually sits',
    body: 'Compare an open lineage against the closed frontier: \u03c0\u2019s flow-matching approach versus GR00T\u2019s dual-system design versus what Google and Figure are shipping in closed, commercial systems right now.',
    models: ['\u03c00 (pi-zero)', 'GR00T N1 / N1.5 / N1.7 (combined row \u2014 releases differ in architecture, data, capabilities, licensing, and hardware needs; treat as a version summary, not per-release detail)', 'Gemini Robotics', 'Helix'],
  },
  {
    when: 'Stage 4 \u2014 Specialize', title: 'Go deep on the part that matches your project',
    body: 'If your project needs to imagine outcomes before acting, that\u2019s the WAM group, not the VLA group. If it needs to survive real deployment without babysitting, look at how \u03c0*0.6 tries to close that gap with reinforcement learning on top of imitation.',
    models: ['DreamZero', 'Cosmos Policy', '\u03c0*0.6 (pi-star-0.6)'],
  },
];

function renderLearningPath(){
  const host = document.getElementById('path-track');
  host.innerHTML = LEARNING_PATH.map((stage, i) => `
    <div class="path-stage">
      <div class="path-num-col">
        <div class="path-num">0${i+1}</div>
        <div class="path-line"></div>
      </div>
      <div class="path-body">
        <div class="path-when">${stage.when}</div>
        <h4>${stage.title}</h4>
        <p>${stage.body}</p>
        <div class="path-chips">
          ${stage.models.map(name => `<button class="path-chip" data-name="${escapeHtml(name)}">${name.split(' (')[0]} \u2192</button>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
  host.querySelectorAll('.path-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = MODELS.find(x=>x.Model===btn.dataset.name);
      if(m) openModal(m);
    });
  });
}

/* ================= Lineage Map ================= */
const GR00T_NAME = 'GR00T N1 / N1.5 / N1.7 (combined row \u2014 releases differ in architecture, data, capabilities, licensing, and hardware needs; treat as a version summary, not per-release detail)';
const ACT_NAME = 'ACT (Action Chunking with Transformers)';
const PI0_NAME = '\u03c00 (pi-zero)';
const PISTAR_NAME = '\u03c0*0.6 (pi-star-0.6)';

const LINEAGE = [
  {
    cluster: 'RT family \u2014 direct succession',
    chains: [
      [{n:'RT-1'}, {n:'RT-1-X', arrow:'solid'}],
      [{n:'RT-1'}, {n:'RT-2', arrow:'solid'}, {n:'RT-2-X', arrow:'solid'}],
    ],
  },
  {
    cluster: 'OpenVLA family \u2014 direct succession / derivatives',
    chains: [
      [{n:'OpenVLA'}, {n:'OpenVLA-OFT', arrow:'solid'}],
      [{n:'OpenVLA'}, {n:'TraceVLA', arrow:'solid'}],
      [{n:'OpenVLA'}, {n:'CogACT', arrow:'solid'}],
    ],
  },
  {
    cluster: '\u03c0 family (Physical Intelligence) \u2014 direct succession',
    chains: [
      [{n:PI0_NAME}, {n:'\u03c00.5', arrow:'solid'}, {n:PISTAR_NAME, arrow:'solid'}],
    ],
  },
  {
    cluster: 'GR00T evolution \u2014 same lineage, one combined entry in this guide',
    chains: [
      [{n:'GR00T N1', target:GR00T_NAME}, {n:'N1.5', arrow:'solid', target:GR00T_NAME}, {n:'N1.6', arrow:'solid', target:GR00T_NAME}, {n:'N1.7', arrow:'solid', target:GR00T_NAME}],
    ],
  },
  {
    cluster: 'Historical influence \u2014 documented in each model\u2019s own entry, not inferred',
    chains: [
      [{n:'Gato'}, {n:'RoboCat', arrow:'solid'}],
      [{n:'PaLM-E'}, {n:'RT-2', arrow:'dash', note:'directly influenced RT-2\u2019s web-scale VLM fusion approach'}],
      [{n:'RoboCat'}, {n:PISTAR_NAME, arrow:'dash', note:'self-improvement-from-experience idea echoed in RECAP'}],
    ],
  },
  {
    cluster: 'Shared design patterns \u2014 same idea, independent lineages',
    chains: [
      [{n:'GR00T N1', target:GR00T_NAME}, {n:'Helix', arrow:'dash', note:'both use a slow-reasoning / fast-control two-system split'}],
      [{n:ACT_NAME}, {n:'SmolVLA', arrow:'dash', note:'shares the action-chunking pattern, but SmolVLA is its own architecture'}],
    ],
  },
];

function renderLineage(){
  const host = document.getElementById('lineage-host');
  host.innerHTML = LINEAGE.map(cluster => `
    <div class="lineage-cluster">
      <h4>${cluster.cluster}</h4>
      ${cluster.chains.map(chain => `
        <div class="lineage-chain">
          ${chain.map((node, i) => `
            ${i>0 ? `<span class="larrow ${node.arrow==='dash'?'pattern':''}">${node.arrow==='dash'?'\u21e2':'\u2192'}</span>` : ''}
            <button class="lchip" data-name="${escapeHtml(node.target||node.n)}">${node.n}</button>
            ${node.note ? `<span class="lnote">${node.note}</span>` : ''}
          `).join('')}
        </div>
      `).join('')}
    </div>
  `).join('');
  host.querySelectorAll('.lchip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = MODELS.find(x=>x.Model===btn.dataset.name);
      if(m) openModal(m);
    });
  });
}

/* ================= Shareable URL state ================= */
function paramsFromState(){
  const p = new URLSearchParams();
  if(activeGroup !== 'All') p.set('group', activeGroup);
  if(searchTerm) p.set('q', searchTerm);
  if(activeFacets.hardware) p.set('hw', activeFacets.hardware);
  if(activeFacets.weights) p.set('wt', activeFacets.weights);
  if(activeFacets.worldModel) p.set('wm', activeFacets.worldModel);
  if(activeFacets.difficulty) p.set('diff', activeFacets.difficulty);
  if(favoritesOnly) p.set('fav', '1');
  if(currentSort !== 'year-desc') p.set('sort', currentSort);
  if(selectedForCompare.length) p.set('cmp', selectedForCompare.join('|'));
  return p;
}
function updateURL(){
  const qs = paramsFromState().toString();
  const newUrl = location.pathname + (qs ? '?' + qs : '') + location.hash;
  history.replaceState(null, '', newUrl);
}
function currentViewURL(){
  const qs = paramsFromState().toString();
  return location.origin + location.pathname + (qs ? '?' + qs : '');
}
function modelDeepLinkURL(name){
  return location.origin + location.pathname + '?model=' + encodeURIComponent(name);
}
function initFromURL(){
  const p = new URLSearchParams(location.search);
  if(p.has('group') && GROUP_META[p.get('group')]) activeGroup = p.get('group');
  if(p.has('q')) searchTerm = p.get('q');
  if(p.has('hw')) activeFacets.hardware = p.get('hw');
  if(p.has('wt')) activeFacets.weights = p.get('wt');
  if(p.has('wm')) activeFacets.worldModel = p.get('wm');
  if(p.has('diff')) activeFacets.difficulty = p.get('diff');
  if(p.get('fav') === '1') favoritesOnly = true;
  if(p.has('sort')) currentSort = p.get('sort');
  if(p.has('cmp')){
    selectedForCompare = p.get('cmp').split('|').filter(n => MODELS.some(m=>m.Model===n)).slice(0,4);
  }
  const searchInput = document.getElementById('search');
  if(searchInput) searchInput.value = searchTerm;
  const sortSelect = document.getElementById('sort-select');
  if(sortSelect) sortSelect.value = currentSort;
}

/* ---- clipboard helper, with a fallback for file:// / non-secure contexts ---- */
function copyToClipboard(text, btn){
  const original = btn.textContent;
  const flash = () => { btn.textContent = '\u2713 Copied'; setTimeout(()=>{ btn.textContent = original; }, 1500); };
  if(navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext){
    navigator.clipboard.writeText(text).then(flash).catch(()=> fallbackCopy(text, flash));
  } else {
    fallbackCopy(text, flash);
  }
}
function fallbackCopy(text, cb){
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch(e){ /* clipboard unavailable, ignore */ }
  document.body.removeChild(ta);
  cb();
}

/* ================= Init ================= */
const DEEP_LINK_MODEL = new URLSearchParams(location.search).get('model');
initFromURL();
renderTimeline();
renderStartHere();
renderLearningPath();
renderWizard();
renderChips();
renderFacets();
renderGrid();
renderCompareBar();
renderLineage();

/* deep link to a single model, e.g. ?model=OpenVLA — read before renderGrid()
   rewrites the URL via updateURL(), so we use the value captured above. */
if(DEEP_LINK_MODEL){
  const m = MODELS.find(x => x.Model === DEEP_LINK_MODEL);
  if(m) openModal(m);
}

document.getElementById('copy-view-link').addEventListener('click', (e)=>{
  copyToClipboard(currentViewURL(), e.currentTarget);
});
