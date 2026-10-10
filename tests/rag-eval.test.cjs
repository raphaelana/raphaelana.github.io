const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(root, 'explorer.js'), 'utf8').split('let d3nodes, simulation;')[0], context);
vm.runInContext(fs.readFileSync(path.join(root, 'explorer-search.js'), 'utf8'), context);
const run = code => JSON.parse(JSON.stringify(vm.runInContext(code, context)));

function evaluate(question) {
  context.question = question;
  return run(`(() => {
    const plan = resolveQuestion(question, {activePaperId:null,lastPaperIds:[]});
    const hits = plan.clarification ? [] : retrieve(question, 8, plan.paperIds);
    return { plan, hits: hits.map(hit => ({id:hit.id,paperId:hit.paperId,kind:hit.kind,claimType:hit.claimType})) };
  })()`);
}

const cases = [
  ['Chicago data', 'What data did the Chicago study use?', ['aaai2026'], ['aaai2026:1']],
  ['Chicago graph', 'How are edges constructed in the AAAI paper?', ['aaai2026'], ['aaai2026:2']],
  ['Chicago ablation', 'What did the GAT-XGBoost ablation show?', ['aaai2026'], ['aaai2026:4']],
  ['Chicago evaluation', 'How was the Chicago model evaluated?', ['aaai2026'], ['aaai2026:5']],
  ['Chicago limitations', 'What are the limitations of the AAAI study?', ['aaai2026'], ['aaai2026:7']],
  ['Chicago outcome', 'Why did the Chicago paper use second-draw measurements?', ['aaai2026'], ['aaai2026:1']],
  ['Chicago privacy boundary', 'What does block-group aggregation hide in the IAAI paper?', ['aaai2026'], ['aaai2026:7']],
  ['ICASSP ablation', 'What does the ICASSP edge ablation establish?', ['icassp2026'], ['icassp2026:2']],
  ['ICASSP mixed edge result', 'Did similarity edges help on TAUKADIAL?', ['icassp2026'], ['icassp2026:2']],
  ['ICASSP split', 'Was the dementia study speaker-disjoint?', ['icassp2026'], ['icassp2026:1']],
  ['ICASSP parameter cost', 'How much did the graph component cost in parameters?', ['icassp2026'], ['icassp2026:4']],
  ['ICASSP validation limits', 'What does the dementia paper not validate?', ['icassp2026'], ['icassp2026:5','icassp2026:6']],
  ['ICASSP data', 'Which corpora were used in ICASSP?', ['icassp2026'], ['icassp2026:1']],
  ['CHASE annotation boundary', 'Did the CHASE model detect crackles and wheezes?', ['chase'], ['chase:5']],
  ['CHASE graph', 'How was the CHASE graph constructed?', ['chase'], ['chase:2']],
  ['CHASE split boundary', 'Was CHASE patient-disjoint?', ['chase'], ['chase:4']],
  ['CHASE mixed attention result', 'Did attention improve every CHASE task?', ['chase'], ['chase:3']],
  ['CHASE data', 'What data did CHASE use?', ['chase'], ['chase:1']],
  ['CHASE future work', 'Which CHASE claims remain future work?', ['chase'], ['chase:6']],
  ['Frontiers retained sample', 'How many Flint homes were retained in Frontiers?', ['frontiers'], ['frontiers:1']],
  ['Frontiers graph', 'How did Frontiers connect homes?', ['frontiers'], ['frontiers:2']],
  ['Frontiers topology sensitivity', 'What did changing the distance threshold do in Frontiers?', ['frontiers'], ['frontiers:5']],
  ['Frontiers split boundary', 'Was Frontiers spatially disjoint?', ['frontiers'], ['frontiers:3']],
  ['Frontiers causal boundary', 'Do GraphLIME features establish causality?', ['frontiers'], ['frontiers:6']],
  ['Frontiers scope', 'Why can the Flint result not be generalized directly?', ['frontiers'], ['frontiers:7']],
  ['SSGAT data', 'What data did SSGAT transfer between?', ['ssgat'], ['ssgat:1']],
  ['SSGAT graph', 'How are edges defined in SSGAT?', ['ssgat'], ['ssgat:2']],
  ['SSGAT objective', 'What is reconstructed during SSGAT pretraining?', ['ssgat'], ['ssgat:3']],
  ['SSGAT evaluation', 'How were LOWO and LOHO used?', ['ssgat'], ['ssgat:4']],
  ['SSGAT qualified comparison', 'Did self-supervision beat supervised GAT?', ['ssgat'], ['ssgat:5']],
  ['SSGAT transfer boundary', 'What does the Andover result not prove?', ['ssgat'], ['ssgat:7']],
  ['SSGAT imbalance failure', 'How did aggregate accuracy hide failure in SSGAT?', ['ssgat'], ['ssgat:6']],
  ['SSGAT community role', 'Did community partners change held-out labels in SSGAT?', ['ssgat'], ['ssgat:9']],
  ['Property graph comparison', 'Compare graph construction in Frontiers and Scientific Reports', ['frontiers','ssgat'], ['frontiers:2','ssgat:2']],
  ['Evaluation comparison', 'Compare evaluation in Scientific Reports and AAAI', ['aaai2026','ssgat'], ['aaai2026:5','ssgat:4']],
  ['Clinical graph comparison', 'How does the clinical audio work differ in its graph edges?', ['icassp2026','chase'], ['icassp2026:0','chase:2']],
  ['Method progression path', 'How does ICASSP relate to SSGAT?', ['icassp2026','ssgat'], ['icassp2026:2','ssgat:5']],
  ['All limitations', 'Which papers report limitations about external validation?', ['aaai2026','icassp2026','chase','frontiers','ssgat'], ['aaai2026:7','icassp2026:6','ssgat:8']]
];

for (const [name, question, expectedScope, requiredEvidence] of cases) {
  test(`RAG eval: ${name}`, () => {
    const { plan, hits } = evaluate(question);
    assert.equal(plan.clarification, false);
    assert.deepEqual([...plan.paperIds].sort(), [...expectedScope].sort());
    const ids = new Set(hits.map(hit => hit.id));
    requiredEvidence.forEach(id => assert.ok(ids.has(id), `${question} did not retrieve ${id}; got ${[...ids].join(', ')}`));
  });
}

test('RAG eval: unrelated science cannot enter the corpus by weak lexical overlap', () => {
  const result = evaluate('Which dataset supports quantum entanglement?');
  assert.equal(result.plan.clarification, true);
  assert.deepEqual(result.hits, []);
});

test('RAG eval: evidence records carry inspectable locations and typed claims', () => {
  const result = run(`CHUNKS.map(hit => ({locator:hit.locator,claimType:hit.claimType,text:hit.text}))`);
  assert.equal(result.length, 40);
  result.forEach(hit => {
    assert.match(hit.locator, /p\.|pp\./);
    assert.ok(['scope','data','method','evaluation','finding','comparison','qualification','limitation'].includes(hit.claimType));
    assert.ok(hit.text.split(/\s+/).length >= 12);
  });
});

test('RAG eval: every graph relationship names evidence from both endpoint papers', () => {
  const result = run(`EDGES.map(edge => ({source:edgePaperId(edge.source),target:edgePaperId(edge.target),evidence:edge.evidence}))`);
  result.forEach(edge => {
    assert.ok(edge.evidence.some(id => id.startsWith(edge.source + ':')));
    assert.ok(edge.evidence.some(id => id.startsWith(edge.target + ':')));
  });
});
