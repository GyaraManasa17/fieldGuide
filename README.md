# VLA / WAM Field Guide

A browsable reference and recommendation tool for Vision-Language-Action (VLA)
and World Action Model (WAM) systems — 52 models total, including everything
in your source document plus 7 additional systems (Gemini Robotics, Helix,
π*0.6, Genie 3, and the historical precursors Gato, PaLM-E, RoboCat) added
and verified via web research for this version.

## 1. How to look at it (no setup)

Open the folder called `vla-wam-field-guide`, and inside it, **double-click
`index.html`**. It opens in your normal browser. No install, no server, no
account — everything runs offline once the page has loaded (it only needs
the internet once, briefly, to load the Google Fonts — the rest is local).

## 2. What's new in this version

- **Fixed: model detail header no longer shows stray text above it while
  scrolling.** The previous version pinned the header using CSS "sticky"
  positioning inside a padded scroll container — that padding gap let
  already-scrolled body text bleed through above the header. It's now a
  proper fixed header with an independently-scrolling body underneath,
  which isn't just a patch — it's a more robust layout pattern that can't
  produce this bug at all.
- **Shareable links.** Every filter, facet, sort order, search term, and
  compare selection is now reflected in the page URL. Copy the address
  bar at any point and sending it to someone reproduces your exact view.
  There's also a dedicated **"⎘ Copy link to this view"** button next to
  the sort dropdown, and every model's detail view has its own **"⎘ Copy
  link"** button that deep-links straight to that model
  (`?model=OpenVLA`, for example) and opens it automatically.
- **Hosting-ready.** Proper `<title>`, meta description, Open Graph and
  Twitter Card tags (with a generated 1200×630 preview image), a favicon,
  `robots.txt`, and `sitemap.xml` are all in place. See section 7 below —
  there's one placeholder domain you need to update before deploying.
- **Model Advisor** (`#advisor` section) — a 5-question guided wizard. You
  answer questions about your experience level, hardware, and licensing
  needs, then **rank up to 3 priorities in order** (your 1st pick counts
  more than your 2nd, which counts more than your 3rd) from six options:
  easy setup, cutting-edge capability, world-modeling, real-robot proof,
  fine-tuning ease, and inference speed. It scores every candidate model
  against your actual answers and shows a **per-factor breakdown bar**
  (Experience fit / Hardware fit / License fit / Priority fit) for each
  of the top 3 matches, so you can see *why* a model was recommended, not
  just that it was. You can also add a result straight to the compare tool
  without leaving the Advisor.
- **Compare tool** — tick the checkbox on up to 4 cards (or use "+ Add to
  compare" inside a model's detail view) and a bar appears at the bottom
  of the screen to open a side-by-side spec table.
- **Faceted filtering** — beyond the category tabs, you can now filter by
  hardware tier (consumer GPU / high-end GPU / cluster / embedded), weights
  openness (open / closed / unclear), and World Model status, all
  combinable with the search box.
- **52 models**, up from 45 — the additions were researched and verified,
  not invented; each carries the same honest "not disclosed" / "community
  estimate" caveats as the rest of the document where information wasn't
  public.
- **Learning Path** (`#path` section) — a 4-stage suggested route through the
  52 models, from pre-VLA baselines through hands-on open-weight models to
  the current closed frontier, to specializing into WAM or reliability work.
  Each stage links straight to the relevant spec sheets.
- **Lineage map** (`#lineage` section) — shows how models actually connect:
  solid arrows for direct successors (RT-1 → RT-2 → RT-2-X, π0 → π0.5 →
  π*0.6), dashed arrows for cross-family influence (PaLM-E → RT-2, RoboCat →
  π*0.6's self-improvement idea, GR00T ↔ Helix's shared two-system design).
  Every connection is something the model's own entry already states — none
  of it is inferred or invented for this map.
- **Architecture Patterns** (`#architecture` section) — three simplified
  diagrams showing the shapes most models in this guide follow: the core
  VLA action loop, the WAM predict-before-acting loop, and the System 2 /
  System 1 dual-model pattern used by both GR00T and Helix independently.
- **Sorting** — the directory can be sorted by newest first, oldest first,
  name (A–Z), or difficulty (easiest first), via the dropdown next to the
  search box.
- **Favorites** — click the star (☆ / ★) on any card to bookmark it. Favorites
  persist in your browser's local storage, so they're still there next time
  you open the page (not synced anywhere — it's local to that browser).
  A "★ Favorites only" filter in the facet row shows just your bookmarked
  models.
- **Richer filters** — a Difficulty facet (Low/Medium/High) joins the
  existing Hardware, Weights, and World Model facets, all combinable with
  the category tabs, the search box, and each other.
- **Hover tooltips** on the World Model / Predictive / Planner badges,
  so the jargon is explained right where it appears, not just in the
  glossary section.

## 3. Folder structure

```
vla-wam-field-guide/
├── index.html        ← page structure and sections only
├── robots.txt          ← tells search engines they can crawl this
├── sitemap.xml          ← one-page sitemap for search engines
├── assets/
│   ├── og-image.png      ← the 1200×630 preview image shown when you share a link
│   └── favicon.svg        ← the small tab icon
├── css/
│   └── style.css      ← every visual style: colors, fonts, layout, the wizard/compare UI
├── js/
│   ├── data.js         ← all 52 models as structured data (edit model info here)
│   └── app.js           ← all behavior: timeline, wizard scoring, search, filters, compare, modal, URL state
└── README.md          ← this file
```

Why the data now lives in its own file (`js/data.js`) instead of inside
`index.html`: with 52 models it got big enough that keeping content and
data separate makes both easier to find. `data.js` is still loaded as a
plain script tag (not fetched), so it works offline the same as before —
no server needed.

## 4. How to edit it

- **Change a color, font, spacing, or the wizard/compare UI look** →
  `css/style.css`.
- **Add, remove, or correct a model's information** → `js/data.js`. It's
  one JavaScript array; each model is one object with the same fields
  (Category, Year, Architecture, Compute Requirements, etc.) plus a small
  `tags` object (`hardware`, `weights`, `difficulty`, `worldModel`, etc.)
  that the Advisor's scoring engine reads. If you add a model, add
  reasonable tags too, or the Advisor will just treat it as "unknown" on
  that dimension (which is safe — it just won't be recommended as a strong
  match for anything specific).
- **Change how the Advisor scores or asks questions** → `js/app.js`, look
  for `WIZARD_QUESTIONS` (the questions/options) and `scoreModel` (the
  scoring logic).
- **Change the Learning Path stages** → `js/app.js`, look for
  `LEARNING_PATH` — an array of `{when, title, body, models}` objects.
- **Change the Lineage map** → `js/app.js`, look for `LINEAGE` — an array
  of clusters, each with `chains` of `{n, arrow, note}` nodes. `arrow:
  'solid'` means direct succession, `arrow: 'dash'` means cross-family
  influence. Only add an edge here if the model's own entry in `data.js`
  actually says so somewhere (Future Scope, Why Introduced, etc.) — that's
  what keeps this map honest rather than speculative.
- **Change the Architecture diagrams** → they're plain SVG markup directly
  in `index.html` under `#architecture`, not generated from data — edit
  the shapes/text there directly.
- **Add a sort option or change facet choices** → `js/app.js`, look for
  `sortModels` (sort logic) and `renderFacets` (which facets appear).
  Favorites are stored under the `localStorage` key
  `vla-wam-field-guide:favorites` — clearing your browser's site data for
  this page resets them.
- **Change what's captured in a shareable link** → `js/app.js`, look for
  `paramsFromState` (what gets written into the URL) and `initFromURL`
  (how a loaded URL is turned back into filters/sort/compare state).
- After editing, save and refresh the page — no build step.

## 5. How to put it online

Same as before — this is 100% static files, no backend, no database.

**Before you deploy — update one placeholder.** `index.html` (the
`<link rel="canonical">` and `og:url` tags), `robots.txt`, and
`sitemap.xml` all currently point at `https://example.com/vla-wam-field-guide/`
as a placeholder, since I don't know your real URL yet. Once you've
deployed (step below) and have a real address, find-and-replace that
placeholder with it in those three files — otherwise shared links will
technically still work, but search engines and link-preview cards
(Slack, Twitter, iMessage, etc.) will point at the wrong canonical URL.

**Option A — Netlify (easiest)**
1. Go to https://app.netlify.com/drop
2. Drag the whole `vla-wam-field-guide` folder onto the page.
3. You get a live URL in about 10 seconds.

**Option B — GitHub Pages**
1. Create a free GitHub account and a new repository.
2. Upload the contents of `vla-wam-field-guide/` to it.
3. In Settings → Pages, set the source to the `main` branch.
4. GitHub gives you a URL like `yourname.github.io/repo-name`.

## 6. Where the new models came from

Added via web search and cross-checked against official sources (company
blog posts, arXiv, or the model's own documentation) rather than invented:

| Model | Source |
|---|---|
| Gemini Robotics | deepmind.google/models/gemini-robotics/ |
| Helix | figure.ai/news/helix |
| π*0.6 | arxiv.org/abs/2511.14759 |
| Genie 3 | deepmind.google/blog/genie-3-a-new-frontier-for-world-models/ |
| Gato | arxiv.org/abs/2205.06175 |
| PaLM-E | arxiv.org/abs/2303.03378 |
| RoboCat | arxiv.org/abs/2306.11706 |

All seven are closed-weight or historical (no downloadable checkpoints),
which is stated plainly in their entries rather than glossed over.

## 7. Ideas for what to add next

- A real lineage graph connecting model families (RT-1 → RT-2 → RT-2-X,
  π0 → π0.5 → π*0.6) with drawn lines, not just year-plotted dots.
- Per-model pages with their own URL, so a specific model can be linked
  directly instead of "open the site and click around."
- A "save your Advisor answers" link you can bookmark or share.
  
Just say the word on any of these and I'll build it the same way.
