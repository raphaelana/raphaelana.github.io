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

test('reported follow-ups keep the self-supervised paper and its metadata', () => {
  const result = run(`(() => {
    const state = {activePaperId:'ssgat',lastPaperIds:['ssgat']};
    return ['what dataset did he use in this study','where was the work published?','are you sure? what is the title of the paper','tell me about the paper'].map(question => {
      const plan = resolveQuestion(question,state);
      return {plan,answer:localAnswer(plan),hits:retrieve(question,6,plan.paperIds).map(h=>h.paperId)};
    });
  })()`);
  result.forEach(r => { assert.deepEqual(r.plan.paperIds, ['ssgat']); assert.equal(r.plan.clarification, false); assert.ok(r.hits.every(id => id === 'ssgat')); });
  assert.match(result[0].answer[0].text, /housing records and historical water-testing/);
  assert.match(result[1].answer[0].text, /Scientific Reports 2026/);
  assert.doesNotMatch(result[1].answer[0].text, /ICASSP/);
  assert.equal(result[2].answer[0].text, 'The paper is titled “Self-Supervised Graph Attention Networks for Community-Engaged Lead Contamination Risk Assessment”.');
  assert.ok(result[3].hits.length > 0);
});

test('ambiguous singular follow-ups ask for a paper rather than picking one', () => {
  const plan = run(`resolveQuestion('what dataset did he use in this study',{activePaperId:null,lastPaperIds:['aaai2026','ssgat']})`);
  assert.equal(plan.clarification, true);
  assert.deepEqual(plan.paperIds, ['aaai2026','ssgat']);
  assert.equal(run(`resolveQuestion('where was the work published?',{activePaperId:null,lastPaperIds:[]})`).clarification, true);
});

test('an explicit new paper overrides existing context', () => {
  const result = run(`(() => {const p=resolveQuestion('What dataset did the ICASSP study use?',{activePaperId:'ssgat',lastPaperIds:['ssgat']});return {plan:p,answer:localAnswer(p)};})()`);
  assert.deepEqual(result.plan.paperIds, ['icassp2026']);
  assert.match(result.answer[0].text, /Pitt Corpus and TAUKADIAL/);
});

test('all-paper dataset questions return each correct dataset passage', () => {
  const result = run(`localAnswer(resolveQuestion('What datasets has this research used?',{activePaperId:'ssgat',lastPaperIds:['ssgat']}))`);
  assert.equal(result.length, 5);
  assert.match(result.find(b=>b.sources[0].paperId==='aaai2026').text, /Chicago water-testing/);
  assert.match(result.find(b=>b.sources[0].paperId==='chase').text, /ICBHI/);
});

test('comparisons retrieve evidence from both explicitly named papers', () => {
  const result = run(`(() => {const p=resolveQuestion('Compare graph construction in ICASSP and CHASE',{activePaperId:null,lastPaperIds:[]});return retrieve('Compare graph construction in ICASSP and CHASE',6,p.paperIds).map(h=>h.paperId);})()`);
  assert.deepEqual([...new Set(result)].sort(), ['chase','icassp2026']);
});

test('generic filler words cannot retrieve the ICASSP ablation', () => {
  assert.deepEqual(run(`rankPassages('where was the work published?')`), []);
  assert.deepEqual(run(`retrieve('quantum entanglement')`), []);
});

test('short method aliases do not match unrelated words', () => {
  assert.deepEqual(run(`paperMatches('last year forecasting contrast')`), []);
  assert.equal(run(`resolveQuestion('Which dataset supports quantum entanglement?',{activePaperId:'ssgat',lastPaperIds:['ssgat']})`).clarification,true);
  assert.deepEqual(run(`resolveQuestion('Compare temporal and similarity edges in ICASSP',{activePaperId:null,lastPaperIds:[]})`).paperIds,['icassp2026']);
});

test('graph neighbors support relational questions after D3 replaces IDs with nodes', () => {
  const result = run(`(() => {const edge=EDGES[0];const old=edge.source;edge.source={id:old};const plan=resolveQuestion('What related papers connect to ICASSP?',{activePaperId:null,lastPaperIds:[]});edge.source=old;return plan;})()`);
  assert.ok(result.paperIds.includes('chase'));
  assert.ok(result.paperIds.includes('frontiers'));
});

test('citations refer only to supplied passages and cannot be silently invented', () => {
  const answer = run(`parseGroundedAnswer({status:'answered',blocks:[{text:'Temporal adjacency contributed to MCI classification.',citations:['icassp2026:2']}]},CHUNKS)`);
  assert.equal(answer[0].sources[0].paperId, 'icassp2026');
  assert.throws(()=>vm.runInContext(`parseGroundedAnswer({status:'answered',blocks:[{text:'Invented.',citations:['missing:99']}]},CHUNKS)`,context),/Unknown source/);
  assert.throws(()=>vm.runInContext(`parseGroundedAnswer({status:'answered',blocks:[{text:'No evidence.',citations:[]}]},CHUNKS)`,context),/Uncited claim/);
  assert.equal(run(`parseGroundedAnswer({status:'unsupported',blocks:[{text:'The summaries do not report deployment.',citations:[]}]},CHUNKS)`)[0].sources.length,0);
});

test('API sends scoped evidence and history with a citation-constrained schema', async () => {
  let requestBody;
  let answer = {status:'answered',blocks:[{text:'The study uses graph attention.',citations:['ssgat:0']}]};
  const apiContext = vm.createContext({Response,Request,process:{env:{GROQ_API_KEY:'test-key'}},fetch:async(url,options)=>{
    requestBody=JSON.parse(options.body);
    return Response.json({choices:[{message:{content:JSON.stringify(answer)}}]});
  }});
  const source = fs.readFileSync(path.join(root,'api/chat.js'),'utf8').replace('export const config','const config').replace('export default async function handler','async function handler');
  vm.runInContext(source,apiContext);
  const payload={question:'Explain the method',history:[{role:'assistant',content:'Previously discussed SSGAT.'}],passages:[{id:'ssgat:0',paperId:'ssgat',title:'SSGAT',venue:'Scientific Reports',section:'Method',text:'Self-supervised graph attention.'}]};
  apiContext.req=new Request('https://example.test/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const response=await vm.runInContext('handler(req)',apiContext);
  assert.equal(response.status,200);
  assert.equal(requestBody.response_format.json_schema.strict,true);
  assert.deepEqual(requestBody.response_format.json_schema.schema.properties.blocks.items.properties.citations.items.enum,['ssgat:0']);
  assert.match(requestBody.messages[1].content,/Previously discussed SSGAT/);
  answer={status:'answered',blocks:[{text:'Wrong source.',citations:['icassp2026:2']}]};
  apiContext.req=new Request('https://example.test/api/chat',{method:'POST',body:JSON.stringify(payload)});
  assert.equal((await vm.runInContext('handler(req)',apiContext)).status,502);
  apiContext.req=new Request('https://example.test/api/chat',{method:'POST',body:JSON.stringify({...payload,passages:[]})});
  assert.equal((await vm.runInContext('handler(req)',apiContext)).status,400);
});
