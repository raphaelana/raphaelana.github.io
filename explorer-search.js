"use strict";

// Small, local keyword index: no network request or model download is needed.
const STOP_WORDS = new Set("a an the what how does do is are has have this that to in of for and or with from me about research paper work used".split(" "));
function searchTokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(word => !STOP_WORDS.has(word))
    .map(word => word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word);
}
function retrieve(query, k = 4) {
  const tokens = [...new Set(searchTokens(query))];
  const scored = CHUNKS.map(chunk => {
    const body = searchTokens(chunk.text);
    const tags = searchTokens(chunk.paper.title + " " + chunk.paper.keywords.join(" "));
    const score = tokens.reduce((sum, word) => sum + (body.includes(word) ? 2 : 0) + (tags.includes(word) ? 1 : 0), 0);
    return { ...chunk, score };
  }).filter(chunk => chunk.score > 0).sort((a, b) => b.score - a.score);
  const counts = new Map();
  return scored.filter(chunk => {
    const count = counts.get(chunk.paperId) || 0;
    counts.set(chunk.paperId, count + 1);
    return count < 2;
  }).slice(0, k);
}
