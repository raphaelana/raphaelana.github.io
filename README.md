# Raphael Anaadumba’s research website

Static website hosted on GitHub Pages at https://raphaelana.github.io/.

## Run locally

From this folder, start a static server:

```sh
python3 -m http.server 8000
```

On Windows, use `py -m http.server 8000`. Open http://localhost:8000.
No build step is required.

## Update the site

- `index.html`: profile, research case studies, publications, direct CV links.
- `site.css`: layout, typography, mobile styles.
- `site.js`: hash navigation, older news, citation toggles and copying.
- `research-graph-explorer.html`: explorer layout.
- `explorer.js`: curated paper summaries, graph, search interface and answer handling.
- `explorer-search.js`: local keyword retrieval over the summaries.
- `vendor/d3.min.js`: D3 7.8.5; see `vendor/D3-LICENSE.txt`.

The main résumé is `Raphael_Anaadumba_Resume.pdf`. When replacing it, copy the
same file to `Raphael_Anaadumba_CV.pdf` so previously shared CV links still work.
The website links to the canonical résumé filename.

Research summaries should distinguish published findings from ongoing work.
Keep numerical results, evaluation protocols, publication dates and links
consistent with the original papers. New explorer papers belong in `PAPERS`;
`EDGES` represents shared themes, not learned or causal relationships.

## Explorer behavior

Paper browsing and keyword search run locally, without an embedding download.
The optional answer service is hosted separately on Vercel; `api/chat.js`
contains that endpoint’s source. API credentials belong only in the Vercel
server environment. If the answer service fails or exceeds 12 seconds, the
explorer displays the retrieved summaries and links to the papers.

## Before publishing

- Open each page from its direct hash URL, including `/#research` and `/#publications`.
- Test the header and sidebar CV links, citations, copying, and older news.
- Test the explorer’s paper buttons, suggestions, search, Clear, and back link.
- Confirm search still shows source passages when the answer service is offline.
- Check a narrow viewport and keyboard navigation.
