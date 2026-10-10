"use strict";

// Resolve paper scope before ranking passages in this small, local corpus.
const STOP_WORDS = new Set("a an the what how does do did is are was were has have this that these those to in of for and or with from me about research paper papers work study studies used use he his it its they their you your tell please sure which where when published publication title name dataset datasets method methods support supports supporting".split(" "));
const TOKEN_ALIASES = { graphs: "graph", transformers: "transformer", lungs: "lung", acoustics: "audio", biosignals: "signal", modelling: "modeling" };
function searchTokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(word => !STOP_WORDS.has(word))
    .map(word => TOKEN_ALIASES[word] || (word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word));
}
function paperMatches(query) {
  const lower = query.toLowerCase();
  return PAPERS.filter(paper => [paper.title, ...paper.aliases].some(alias => {
    const escaped = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(lower);
  }));
}
function questionIntent(query) {
  if (/\b(limitations?|caveats?|weakness|does not|not establish|unreported)\b/i.test(query)) return "limitation";
  if (/\b(evaluat(?:e|ed|ion)|split|cross-validation|holdout|validation|leakage|protocol)\b/i.test(query)) return "evaluation";
  if (/\b(graph construction|topology|nodes?|edges?|connect(?:ed|ion|ivity)?|neighbou?r|radius|distance threshold|architecture|pipeline|objective|pretrain|fine-tun)\b/i.test(query)) return "method";
  if (/\b(ablation|finding|result|contribut(?:e|ion)|comparison|compare|versus|vs)\b/i.test(query)) return "finding";
  if (/^\s*(why|how|compare)\b|\b(bias|collected|generaliz(?:e|ation)|differences?)\b/i.test(query)) return "research";
  if (/\b(title|name of (?:the |this )?(?:paper|study))\b/i.test(query)) return "title";
  if (/\b(publish(?:ed|ing)?|publication|venue|journal|conference)\b/i.test(query)) return "publication";
  if (/\b(dataset(?:s)?|corpus|corpora|what data|which data|data (?:did|was|were|used|source))\b/i.test(query)) return "dataset";
  if (/\b(tell me about|summari[sz]e|overview|explain (?:the |this )?paper)\b/i.test(query)) return "overview";
  return "research";
}
function edgePaperId(endpoint) { return typeof endpoint === "string" ? endpoint : endpoint.id; }
function resolveQuestion(query, state) {
  const intent = questionIntent(query);
  const explicit = paperMatches(query);
  const acrossAll = /\b(all|each|every)\s+(?:of\s+)?(?:the\s+)?(?:papers|studies|publications)\b|\b(?:datasets|data)\b.*\b(?:research|papers|studies)\b|\bacross (?:the |your |his )?(?:research|papers|studies)\b/i.test(query);
  const comparison = /\b(compare|comparison|versus|vs|relate|related|relationship between|connections?|shared|common|different|differ|differences)\b/i.test(query);
  const followup = /\b(this|that|it|its|the (?:paper|study|work)|are you sure)\b/i.test(query) || (["title", "publication", "dataset", "overview"].includes(intent) && !searchTokens(query).length);
  let paperIds = explicit.map(p => p.id);
  if (acrossAll) paperIds = PAPERS.map(p => p.id);
  else if (!paperIds.length && /\bclinical audio\b|\baudio (?:papers?|work|studies)\b/i.test(query)) paperIds = ['icassp2026', 'chase'];
  else if (!paperIds.length && /\blead (?:risk|contamination|papers?|work|research|models?)\b/i.test(query)) paperIds = ['aaai2026', 'frontiers', 'ssgat'];
  else if (!paperIds.length && followup) paperIds = state.activePaperId ? [state.activePaperId] : state.lastPaperIds.slice();
  const relatedPapers = /\brelated\b|\bother\b.*\b(?:papers|studies|work)\b|\bconnect(?:ion)?s?\b.*\b(?:papers|research|work)\b|\brelate\b.*\b(?:work|papers|studies)\b/i.test(query);
  if (comparison && relatedPapers && paperIds.length === 1) {
    const seed = paperIds[0];
    const neighbors = EDGES.filter(e => edgePaperId(e.source) === seed || edgePaperId(e.target) === seed)
      .map(e => edgePaperId(e.source) === seed ? edgePaperId(e.target) : edgePaperId(e.source));
    paperIds = [...new Set([...paperIds, ...neighbors])];
  }
  if (!paperIds.length) {
    const ranked = rankPassages(query);
    if (ranked.length) {
      const best = ranked[0].score;
      paperIds = [...new Set(ranked.filter(h => h.score >= best * 0.8).map(h => h.paperId))];
    }
  }
  const singularFact = ["title", "publication", "dataset"].includes(intent) && !acrossAll && !comparison;
  if ((singularFact && paperIds.length !== 1) || (followup && !paperIds.length && !searchTokens(query).length)) {
    return { intent, paperIds, clarification: true, comparison, acrossAll };
  }
  return { intent, paperIds, clarification: false, comparison, acrossAll };
}
function rankPassages(query, paperIds = null) {
  const tokens = [...new Set(searchTokens(query))];
  return CHUNKS.filter(chunk => !paperIds || paperIds.includes(chunk.paperId)).map(chunk => {
    const body = searchTokens(`${chunk.text} ${chunk.kind} ${chunk.claimType} ${(chunk.tags || []).join(' ')}`);
    const tags = searchTokens(chunk.paper.title + " " + chunk.paper.keywords.join(" "));
    const intent = questionIntent(query);
    const lexicalScore = tokens.reduce((sum, word) => sum + (body.includes(word) ? 2 : 0) + (tags.includes(word) ? 1 : 0), 0);
    const typeBoost = lexicalScore > 0 && (intent === chunk.claimType || (intent === 'method' && chunk.claimType === 'scope')) ? 7 : 0;
    const kindBoost = lexicalScore > 0 && (
      (/\bablation\b/i.test(query) && /ablation/i.test(chunk.kind)) ||
      (intent === 'method' && /graph construction|model pipeline|training objective|representation and graph/i.test(chunk.kind)) ||
      (intent === 'evaluation' && /evaluation/i.test(chunk.kind)) ||
      (intent === 'dataset' && chunk.claimType === 'data') ||
      (intent === 'limitation' && chunk.claimType === 'limitation') ||
      (/\bnot (?:prove|establish|validate)|\bboundar(?:y|ies)\b/i.test(query) && ['qualification','limitation'].includes(chunk.claimType))
    ) ? (/\bablation\b/i.test(query) && /ablation/i.test(chunk.kind) ? 10 : 5) : 0;
    const score = lexicalScore + typeBoost + kindBoost;
    return { ...chunk, score };
  }).filter(chunk => chunk.score > 0).sort((a, b) => b.score - a.score);
}
function retrieve(query, k = 6, paperIds = null) {
  if (paperIds?.length === 1) {
    const ranked = rankPassages(query, paperIds);
    const remaining = CHUNKS.filter(h => h.paperId === paperIds[0] && !ranked.some(r => r.id === h.id));
    return [...ranked, ...remaining].slice(0, k);
  }
  const ranked = rankPassages(query, paperIds);
  const scope = paperIds || [...new Set(ranked.map(h => h.paperId))];
  const comparison = /\b(compare|comparison|versus|vs|relate|related|relationship|connections?|shared|common|different|differ|differences)\b/i.test(query);
  const relationIds = comparison ? EDGES
    .filter(edge => scope.includes(edgePaperId(edge.source)) && scope.includes(edgePaperId(edge.target)))
    .flatMap(edge => edge.evidence) : [];
  const relationEvidence = relationIds.map(id => CHUNKS.find(chunk => chunk.id === id)).filter(Boolean);
  const rankedScore = new Map(ranked.map(hit => [hit.id, hit.score]));
  const groups = scope.map(id => {
    const matches = ranked.filter(h => h.paperId === id);
    const pathEvidence = relationEvidence.filter(h => h.paperId === id)
      .sort((a, b) => (rankedScore.get(b.id) || 0) - (rankedScore.get(a.id) || 0));
    const preferred = [...pathEvidence, ...matches].filter((hit, index, list) => list.findIndex(item => item.id === hit.id) === index);
    return [...preferred, ...CHUNKS.filter(h => h.paperId === id && !preferred.some(r => r.id === h.id))];
  });
  const balanced = [];
  for (let i = 0; i < 3; i++) groups.forEach(group => { if (group[i]) balanced.push(group[i]); });
  return balanced.slice(0, Math.max(k, scope.length * 2));
}
function metadataPassage(paper) {
  return { id: `${paper.id}:metadata`, paperId: paper.id, paper, kind: "Publication metadata", text: `${paper.title}. Published in ${paper.venue}${paper.venue.includes(String(paper.year)) ? "" : ` (${paper.year})`}.` };
}
function localAnswer(plan) {
  const papers = PAPERS.filter(p => plan.paperIds.includes(p.id));
  if (["title", "publication"].includes(plan.intent)) return papers.map(p => ({
    text: plan.intent === "title" ? `The paper is titled “${p.title}”.` : `“${p.title}” was published in ${p.venue}${p.venue.includes(String(p.year)) ? "" : ` (${p.year})`}.`,
    sources: [metadataPassage(p)]
  }));
  if (plan.intent === "dataset") return papers.map(p => {
    const source = CHUNKS.find(h => h.paperId === p.id && h.chunkIdx === p.datasetEvidence);
    return { text: p.datasetDescription, sources: [source] };
  });
  if (plan.intent === "overview" && papers.length === 1) {
    const paper = papers[0];
    const preferred = ['scope', 'data', 'method', 'finding', 'limitation'];
    const overviewSources = preferred.map(type => CHUNKS.find(h => h.paperId === paper.id && h.claimType === type)).filter(Boolean);
    return [
      { text: `“${paper.title}” was published in ${paper.venue}${paper.venue.includes(String(paper.year)) ? "" : ` (${paper.year})`}.`, sources: [metadataPassage(paper)] },
      ...overviewSources.map(source => ({
        text: source.text, sources: [source]
      }))
    ];
  }
  return null;
}
function parseGroundedAnswer(content, hits) {
  const value = typeof content === "string" ? JSON.parse(content) : content;
  if (!value || !["answered", "unsupported"].includes(value.status) || !Array.isArray(value.blocks) || !value.blocks.length || value.blocks.length > 4) throw new Error("Invalid answer structure");
  const allowed = new Map(hits.map(hit => [hit.id, hit]));
  return value.blocks.map((block, index) => {
    if (!["direct_answer", "evidence", "comparison", "qualification"].includes(block.role) || (index === 0 && block.role !== "direct_answer")) throw new Error("Invalid answer role");
    if (typeof block.text !== "string" || !block.text.trim() || !Array.isArray(block.citations)) throw new Error("Invalid answer block");
    if (block.citations.some(id => !allowed.has(id))) throw new Error("Unknown source");
    if (value.status === "answered" && !block.citations.length) throw new Error("Uncited claim");
    if (value.status === "unsupported" && block.citations.length) throw new Error("Unsupported answer must not claim evidence");
    return { role: block.role, text: block.text, sources: [...new Set(block.citations)].map(id => allowed.get(id)) };
  });
}
