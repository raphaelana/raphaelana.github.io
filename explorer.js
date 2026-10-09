"use strict";
const PAPERS = [
  {
    "id": "aaai2026",
    "title": "Spatial Graph Attention Network Modeling for Neighborhood-Scale Lead Contamination Risk Prediction Using Publicly Available Data",
    "venue": "AAAI / IAAI 2026",
    "domain": "env",
    "color": "#00d4aa",
    "year": 2026,
    "url": "https://doi.org/10.1609/aaai.v40i47.41455",
    "keywords": [
      "GAT",
      "XGBoost",
      "Chicago",
      "spatial graph",
      "lead risk"
    ],
    "chunks": [
      "The AAAI/IAAI study models Chicago census block groups with a directed spatial Graph Attention Network and combines graph representations with XGBoost. It integrates housing and sociodemographic features with relational information from nearby geographic units. Comparisons with spatial-only baselines examine what the hybrid representation contributes.",
      "Datasets: Chicago water-testing records, American Community Survey variables, and Census records are linked at census-block-group level. Water-test concentrations supply the prediction labels; public housing and demographic records provide explanatory features."
    ],
    "status": "Published"
  },
  {
    "id": "icassp2026",
    "title": "Modeling Inter-Segment Relationships in Speech for Dementia Detection with Audio Spectrogram Transformers and Graph Attention Networks",
    "venue": "ICASSP 2026",
    "domain": "clinical",
    "color": "#8b5cf6",
    "year": 2026,
    "url": "https://doi.org/10.1109/ICASSP55912.2026.11464316",
    "keywords": [
      "AST",
      "GAT",
      "dementia",
      "speech",
      "TAUKADIAL",
      "temporal edges"
    ],
    "chunks": [
      "The ICASSP study represents overlapping speech windows with Audio Spectrogram Transformers. Windows are connected by temporal adjacency and acoustic-similarity edges, and a graph attention network aggregates their representations. The experimental question is which relationships contribute beyond pooled window features.",
      "Datasets and evaluation: Pitt Corpus and TAUKADIAL are trained and evaluated separately using speaker-disjoint, stratified cross-validation. Repeated recordings from a speaker remain in the same evaluation partition.",
      "Edge-type ablations compare pooled AST representations, temporal-only graphs, and graphs with both temporal and acoustic-similarity edges. Temporal adjacency was the main contributor to mild cognitive impairment classification; similarity edges affected ranking more than class decisions. The finding makes graph construction an explicit modeling choice."
    ],
    "status": "Published"
  },
  {
    "id": "chase",
    "title": "Enhancing Respiratory Disease Diagnosis with Graph Convolutional Networks Through Non-Speech Audio Synthesis",
    "venue": "ACM/IEEE CHASE 2025",
    "domain": "clinical",
    "color": "#8b5cf6",
    "year": 2025,
    "url": "https://doi.org/10.1145/3721201.3721402",
    "keywords": [
      "CNN",
      "GCN",
      "respiratory sounds",
      "STFT",
      "ICBHI"
    ],
    "chunks": [
      "The CHASE respiratory study uses STFT representations of lung sounds, convolutional feature extraction, PCA, and cosine-similarity graph construction. Graph convolution aggregates the learned features, with an attention comparison to examine the contribution of weighting signal features for disease classification.",
      "Dataset: ICBHI respiratory sound recordings contain expert annotations for crackles and wheezes and cover multiple clinical conditions and acquisition settings. The study predicts respiratory disease classes from the recordings."
    ],
    "status": "Published"
  },
  {
    "id": "frontiers",
    "title": "Graph Neural Network-Based Water Contamination Detection from Community Housing Information",
    "venue": "Frontiers in Environmental Engineering",
    "domain": "env",
    "color": "#00d4aa",
    "year": 2025,
    "url": "https://doi.org/10.3389/fenve.2025.1488965",
    "keywords": [
      "GAT",
      "Flint",
      "housing",
      "lead risk",
      "water tests"
    ],
    "chunks": [
      "Dataset: The Frontiers study links Flint historical water-testing records with housing and parcel data. Houses become graph nodes, with edges defined through spatial proximity. Historical lead measurements supply labels for prediction from housing characteristics.",
      "Graph attention aggregates neighboring property features. The study examines spatial connection thresholds and compares relational prediction with tabular models, making geographic graph construction part of the methodological question."
    ],
    "status": "Published"
  },
  {
    "id": "ssgat",
    "title": "Self-Supervised Graph Attention Networks for Community-Engaged Lead Contamination Risk Assessment",
    "venue": "Scientific Reports 2026",
    "domain": "methods",
    "color": "#f59e0b",
    "year": 2026,
    "url": "https://doi.org/10.1038/s41598-026-52965-y",
    "keywords": [
      "SSGAT",
      "self-supervised",
      "GAT",
      "lead risk",
      "labels"
    ],
    "chunks": [
      "Dataset and method: The Scientific Reports study uses housing and historical water-testing records for self-supervised graph attention. Pretraining learns representations before supervised lead-risk prediction. The work connects to the question of how relational structure can make use of records with limited labels.",
      "Self-supervised pretraining and supervised risk prediction play distinct roles: the former learns from available record structure and features, while the latter uses contamination labels. The linked paper documents the complete training and evaluation settings."
    ],
    "status": "Published"
  }
];
// Relations are supported by the curated summaries, not inferred findings.
const PAPER_DETAILS = {
  aaai2026: { label: 'AAAI', aliases: ['AAAI', 'IAAI', 'Chicago', 'XGBoost'], methods: ['GAT', 'XGBoost'], task: 'Lead-risk prediction', datasetChunk: 1, sections: ['Method and comparisons', 'Dataset'] },
  icassp2026: { label: 'ICASSP', aliases: ['ICASSP', 'dementia', 'speech', 'AST', 'Pitt', 'TAUKADIAL'], methods: ['AST', 'GAT'], task: 'Clinical audio classification', datasetChunk: 1, sections: ['Method', 'Dataset and evaluation', 'Edge ablations'] },
  chase: { label: 'CHASE', aliases: ['CHASE', 'respiratory', 'lung sounds', 'ICBHI'], methods: ['STFT', 'CNN', 'GCN'], task: 'Clinical audio classification', datasetChunk: 1, sections: ['Method and comparisons', 'Dataset'] },
  frontiers: { label: 'Frontiers', aliases: ['Frontiers', 'Flint', 'community housing'], methods: ['GAT'], task: 'Lead-risk prediction', datasetChunk: 0, sections: ['Dataset and graph construction', 'Method and comparisons'] },
  ssgat: { label: 'Sci. Rep.', aliases: ['Scientific Reports', 'SSGAT', 'self-supervised', 'community-engaged'], methods: ['GAT', 'Self-supervised pretraining'], task: 'Lead-risk prediction', datasetChunk: 0, sections: ['Dataset and method', 'Training design'] }
};
const DATASET_DESCRIPTIONS = {
  aaai2026: 'The AAAI/IAAI study links Chicago water-testing records with American Community Survey variables and Census records at the census-block-group level. Water-test concentrations supply the prediction labels, while housing and demographic records supply features.',
  icassp2026: 'The ICASSP study uses the Pitt Corpus and TAUKADIAL, training and evaluating each separately with speaker-disjoint, stratified cross-validation. Repeated recordings from a speaker stay in the same evaluation partition.',
  chase: 'The CHASE study uses ICBHI respiratory sound recordings, which include expert annotations for crackles and wheezes and cover multiple clinical conditions and acquisition settings. Its prediction task is respiratory disease classification.',
  frontiers: 'The Frontiers study links historical water-testing records from Flint with housing and parcel data. Historical lead measurements supply the prediction labels.',
  ssgat: 'The Scientific Reports study uses housing records and historical water-testing records for self-supervised graph attention and subsequent lead-risk prediction.'
};
PAPERS.forEach(paper => Object.assign(paper, PAPER_DETAILS[paper.id], { datasetDescription: DATASET_DESCRIPTIONS[paper.id] }));
const EDGES = [];
PAPERS.forEach((source, i) => PAPERS.slice(i + 1).forEach(target => {
  const methods = source.methods.filter(method => target.methods.includes(method));
  const sharedTask = source.task === target.task;
  if (methods.length || sharedTask) EDGES.push({
    source: source.id, target: target.id, weight: sharedTask ? 3 : 1,
    relations: [...methods.map(method => `Shared method: ${method}`), ...(sharedTask ? [`Shared task: ${source.task}`] : [])],
    evidence: [`${source.id}:0`, `${target.id}:0`]
  });
}));

const CHUNKS=[];
PAPERS.forEach(p=>p.chunks.forEach((text,i)=>CHUNKS.push({id:`${p.id}:${i}`,paperId:p.id,chunkIdx:i,kind:p.sections[i],text,paper:p})));

const chatState = { activePaperId: null, lastPaperIds: [], messages: [] };
function updatePaperContext(ids) {
  chatState.lastPaperIds = [...new Set(ids)];
  chatState.activePaperId = chatState.lastPaperIds.length === 1 ? chatState.lastPaperIds[0] : null;
  const papers = PAPERS.filter(p => ids.includes(p.id));
  document.getElementById('chat-context').textContent = papers.length ? `Discussing: ${papers.map(p => p.venue).join(' · ')}` : 'Choose a paper or ask across the research.';
}
function rememberMessage(role, content) {
  chatState.messages.push({ role, content });
  chatState.messages = chatState.messages.slice(-8);
}

let d3nodes, simulation;
function initGraph(){
  if (!window.d3) return;
  simulation?.stop();
  const isMobile=window.matchMedia('(max-width:780px)').matches;
  const W=window.innerWidth,H=window.innerHeight;
  const topBar=isMobile?50:56;                 // header height
  const graphBottom=isMobile?H*0.48:H;         // chat sheet covers the rest on phones
  const R=isMobile?22:32;                      // node radius
  window._R=R;
  const svg=d3.select('#graph-svg').attr('viewBox',`0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  const defs=svg.append('defs');
  ['teal','violet','amber'].forEach((name,i)=>{
    const f=defs.append('filter').attr('id',`glow-${name}`).attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
    f.append('feGaussianBlur').attr('stdDeviation','6').attr('result','blur');
    const merge=f.append('feMerge');
    merge.append('feMergeNode').attr('in','blur');
    merge.append('feMergeNode').attr('in','SourceGraphic');
  });

  const sim=simulation=d3.forceSimulation(PAPERS)
    .force('link',d3.forceLink(EDGES).id(d=>d.id).distance(d=>(isMobile?54:85)+(3-d.weight)*(isMobile?12:20)))
    .force('charge',d3.forceManyBody().strength(isMobile?-100:-180))
    .force('center',d3.forceCenter(isMobile?W/2:W*0.42,isMobile?(topBar+graphBottom)/2:H/2))
    .force('collision',d3.forceCollide(isMobile?42:70));

  const g=svg.append('g');

  const link=g.selectAll('.lk').data(EDGES).enter().append('line')
    .attr('stroke','rgba(255,255,255,0.06)')
    .attr('stroke-width',d=>0.5+d.weight*0.4);
  link.append('title').text(d=>d.relations.join(' · '));

  const pulseRings=g.selectAll('.pr').data(PAPERS).enter().append('circle')
    .attr('r',R+14).attr('fill','none')
    .attr('stroke',d=>d.color).attr('stroke-width',1)
    .attr('opacity',0).attr('class','pr');

  const node=g.selectAll('.nd').data(PAPERS).enter().append('g')
    .attr('cursor','pointer')
    .call(d3.drag()
      .on('start',(e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;})
      .on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y;})
      .on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;})
    )
    .attr('role','button').attr('tabindex',0).attr('aria-label',d=>d.title)
    .on('keydown',(event,d)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showPaper(d);}})
    .on('click',(_,d)=>showPaper(d))
    .on('mouseenter',function(){d3.select(this).select('.nd-circle').transition().duration(200).attr('r',R+6);})
    .on('mouseleave',function(){d3.select(this).select('.nd-circle').transition().duration(300).attr('r',R);});

  const glowName=d=>d.domain==='env'?'teal':d.domain==='clinical'?'violet':'amber';

  node.append('circle').attr('class','nd-circle').attr('r',R)
    .attr('fill',d=>`${d.color}22`)
    .attr('stroke',d=>d.color)
    .attr('stroke-width',1.5)
    .attr('filter',d=>`url(#glow-${glowName(d)})`);

  node.append('text')
    .attr('text-anchor','middle').attr('dy','0.35em')
    .attr('font-family','Space Grotesk,sans-serif')
    .attr('font-size',isMobile?'9px':'11px').attr('font-weight','600')
    .attr('fill',d=>d.color).attr('pointer-events','none')
    .text(d=>d.label);

  node.append('text')
    .attr('text-anchor','middle').attr('dy',(R+13)+'px')
    .attr('font-size',isMobile?'9px':'10px').attr('fill','rgba(168,180,204,0.7)').attr('pointer-events','none')
    .text(d=>({aaai2026:'AAAI / IAAI',icassp2026:'ICASSP',chase:'CHASE',frontiers:'Frontiers',ssgat:'Sci. Reports'})[d.id]);

  const padX=R+14, padTop=topBar+R+24, padBottom=R+26;
  sim.on('tick',()=>{
    PAPERS.forEach(d=>{
      d.x=Math.max(padX,Math.min(W-padX,d.x));
      d.y=Math.max(padTop,Math.min(graphBottom-padBottom,d.y));
    });
    link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
        .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('transform',d=>`translate(${d.x},${d.y})`);
    pulseRings.attr('cx',d=>d.x).attr('cy',d=>d.y);
  });

  d3nodes=node;
  window._pulseRings=pulseRings;
}

window.pulseNodes=function(ids){
  if(!d3nodes)return;
  d3nodes.select('.nd-circle')
    .transition().duration(300)
    .attr('r',d=>ids.includes(d.id)?(window._R||32)+10:(window._R||32))
    .attr('stroke-width',d=>ids.includes(d.id)?2.5:1.5)
    .attr('fill',d=>ids.includes(d.id)?`${d.color}44`:`${d.color}22`);
  if(window._pulseRings){
    window._pulseRings.filter(d=>ids.includes(d.id))
      .transition().duration(400).attr('opacity',0.6)
      .transition().duration(1200).attr('opacity',0)
      .transition().duration(400).attr('opacity',0.4)
      .transition().duration(800).attr('opacity',0);
  }
  setTimeout(()=>{
    d3nodes.select('.nd-circle')
      .transition().duration(600)
      .attr('r',window._R||32).attr('stroke-width',1.5)
      .attr('fill',d=>`${d.color}22`);
  },2200);
};

function showPaper(p) {
  if (pending) return;
  updatePaperContext([p.id]);
  const drawer = document.getElementById('paper-drawer');
  document.getElementById('drawer-venue').textContent = `${p.venue} · ${p.status}`;
  document.getElementById('drawer-venue').style.color = p.color;
  document.getElementById('drawer-title').textContent = p.title;
  document.getElementById('drawer-abstract').textContent = p.chunks[0];
  const tags = document.getElementById('drawer-keywords');
  tags.replaceChildren();
  p.keywords.slice(0, 5).forEach(word => {
    const tag = document.createElement('span');
    tag.className = 'kw'; tag.textContent = word; tags.appendChild(tag);
  });
  document.getElementById('drawer-link').href = p.url;
  document.querySelectorAll('.paper-button').forEach(button => button.setAttribute('aria-expanded', String(button.dataset.paper === p.id)));
  drawer.hidden = false;
  drawer.classList.add('visible');
}
function closeDrawer() {
  const drawer = document.getElementById('paper-drawer');
  if (drawer.contains(document.activeElement)) document.querySelector('.paper-button[aria-expanded="true"]')?.focus();
  drawer.classList.remove('visible');
  drawer.hidden = true;
  document.querySelectorAll('.paper-button').forEach(button => button.setAttribute('aria-expanded', 'false'));
}
function appendAnswerText(parent, text) {
  // Support inline emphasis using DOM nodes; never insert model HTML.
  text.split(/(\*\*[^*\n]+\*\*)/g).forEach(part => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const strong = document.createElement('strong'); strong.textContent = part.slice(2, -2); parent.appendChild(strong);
    } else parent.appendChild(document.createTextNode(part));
  });
}
function addMsg(role, content, hits = []) {
  const message = document.createElement('div'); message.className = `msg ${role}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble';
  const blocks = Array.isArray(content) ? content : [{ text: content, sources: hits }];
  const citationNumbers = new Map();
  blocks.forEach(block => {
    const paragraph = document.createElement('div'); paragraph.className = 'answer-block';
    if (role === 'assistant') appendAnswerText(paragraph, block.text);
    else paragraph.textContent = block.text;
    if (block.sources?.length) {
      const links = document.createElement('div'); links.className = 'answer-sources';
      [...new Map(block.sources.map(hit => [hit.id, hit])).values()].forEach(hit => {
        if (!citationNumbers.has(hit.id)) citationNumbers.set(hit.id, citationNumbers.size + 1);
        const details = document.createElement('details'); details.className = 'source-detail';
        const summary = document.createElement('summary'); summary.className = 'source-pill';
        summary.textContent = `[${citationNumbers.get(hit.id)}] ${hit.paper.venue} · ${hit.kind}`;
        summary.title = hit.paper.title;
        const excerpt = document.createElement('div'); excerpt.className = 'source-excerpt';
        excerpt.textContent = hit.text;
        const link = document.createElement('a'); link.href = hit.paper.url; link.target = '_blank'; link.rel = 'noopener';
        link.textContent = `${hit.paper.title} ↗`;
        details.append(summary, excerpt, link); links.appendChild(details);
      });
      paragraph.appendChild(links);
    }
    bubble.appendChild(paragraph);
  });
  message.appendChild(bubble);
  const chat = document.getElementById('chat-messages');
  chat.appendChild(message); chat.scrollTop = chat.scrollHeight;
  return message;
}
let pending = null;
function setBusy(busy) {
  document.getElementById('send-btn').disabled = busy;
  document.querySelectorAll('.sq').forEach(button => { button.disabled = busy; });
  document.querySelectorAll('.paper-button').forEach(button => { button.disabled = busy; });
  document.getElementById('chat-messages').setAttribute('aria-busy', String(busy));
}
function showPassages(hits) {
  const blocks = [{ text: 'A synthesized answer is unavailable. These are the relevant curated passages:', sources: [] }, ...hits.map(hit => ({ text: hit.text, sources: [hit] }))];
  addMsg('assistant', blocks);
  rememberMessage('assistant', 'Source passages displayed without synthesis.');
}
function clarifyPaper(plan, query) {
  const message = addMsg('assistant', 'Which paper do you mean? Select one below; I will use it for this question and its follow-ups.');
  const options = document.createElement('div'); options.className = 'paper-choices';
  PAPERS.filter(p => !plan.paperIds.length || plan.paperIds.includes(p.id)).forEach(paper => {
    const button = document.createElement('button'); button.className = 'sq';
    button.textContent = `${paper.venue} — ${paper.title}`;
    button.addEventListener('click', () => {
      if (pending) return;
      showPaper(paper); options.remove();
      document.getElementById('chat-input').value = query; sendMessage();
    });
    options.appendChild(button);
  });
  message.querySelector('.bubble').appendChild(options);
}
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const query = input.value.trim();
  if (!query || pending) return;
  addMsg('user', query); input.value = '';
  const history = chatState.messages.slice();
  rememberMessage('user', query);
  document.getElementById('suggestions').style.display = 'none';
  const plan = resolveQuestion(query, chatState);
  if (plan.clarification) { clarifyPaper(plan, query); return; }
  const factual = localAnswer(plan);
  if (factual?.length) {
    updatePaperContext(plan.paperIds); pulseNodes(plan.paperIds);
    addMsg('assistant', factual);
    rememberMessage('assistant', factual.map(block => block.text).join('\n\n'));
    return;
  }
  const hits = retrieve(query, 6, plan.paperIds);
  if (!hits.length) {
    addMsg('assistant', 'The indexed summaries do not contain evidence for that question. You can select a paper to inspect its available methods, datasets and comparisons.');
    return;
  }
  updatePaperContext(plan.paperIds);
  pulseNodes(plan.paperIds);
  const controller = new AbortController(); pending = controller; setBusy(true);
  const timeout = setTimeout(() => controller.abort(), 12000);
  const notice = addMsg('assistant', 'Finding an answer from the linked research summaries…');
  try {
    const response = await fetch('https://raphaelana-github-io.vercel.app/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({
        question: query, intent: plan.intent,
        history,
        passages: hits.map(hit => ({ id: hit.id, paperId: hit.paperId, title: hit.paper.title, venue: hit.paper.venue, section: hit.kind, text: hit.text })),
        relationships: EDGES.filter(edge => plan.paperIds.includes(edgePaperId(edge.source)) && plan.paperIds.includes(edgePaperId(edge.target)))
          .map(edge => ({ source: edgePaperId(edge.source), target: edgePaperId(edge.target), relations: edge.relations }))
      })
    });
    if (!response.ok) throw new Error('Answer service unavailable');
    const data = await response.json();
    const answer = parseGroundedAnswer(data.choices?.[0]?.message?.content, hits);
    if (pending !== controller) return;
    notice.remove(); addMsg('assistant', answer);
    rememberMessage('assistant', answer.map(block => block.text).join('\n\n'));
    const citedPaperIds = [...new Set(answer.flatMap(block => block.sources.map(source => source.paperId)))];
    if (citedPaperIds.length) updatePaperContext(citedPaperIds);
  } catch {
    if (pending !== controller) return;
    notice.remove(); showPassages(hits);
  } finally {
    clearTimeout(timeout);
    if (pending === controller) { pending = null; setBusy(false); }
  }
}
function resetChat() {
  pending?.abort(); pending = null; setBusy(false);
  document.getElementById('chat-messages').replaceChildren();
  chatState.messages = []; updatePaperContext([]); closeDrawer();
  addMsg('assistant', 'Browse a paper or ask a question about the research.');
  document.getElementById('suggestions').style.display = 'flex';
  document.getElementById('chat-input').value = '';
}
const paperList = document.getElementById('paper-list');
PAPERS.forEach(paper => {
  const button = document.createElement('button'); button.className = 'paper-button';
  button.dataset.paper = paper.id; button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'paper-drawer');
  const venue = document.createElement('strong'); venue.textContent = paper.venue;
  const title = document.createElement('span'); title.textContent = paper.title;
  button.append(venue, title); button.addEventListener('click', () => showPaper(paper));
  paperList.appendChild(button);
});
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('clear-btn').addEventListener('click', resetChat);
document.querySelectorAll('.sq').forEach(button => button.addEventListener('click', () => {
  document.getElementById('chat-input').value = button.textContent; sendMessage();
}));
document.getElementById('chat-input').addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(); }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });
initGraph();
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer); resizeTimer = setTimeout(initGraph, 250);
});
