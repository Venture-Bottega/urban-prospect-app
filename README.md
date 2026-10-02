# Urban Prospect

**Live: [urban.dotlink.ai](https://urban.dotlink.ai)**

A decision-support map for early-stage residential real-estate screening in
Italy. It ranks **7,896 municipalities** on a transparent Prospect Score built
from satellite, demographic and accessibility data, then cross-checks that score
against official market prices to surface places where the fundamentals are
ahead of the price.

It is not a price-prediction engine. It narrows a national map down to a
shortlist worth looking at properly.

---

## Who built this

The application was designed and built by **[Yelena Shabanova](https://github.com/yelenashabanova)**
for Venture Bottega — the React frontend, the spatial data pipeline, the MCDA
scoring model, the LISA cluster analysis and the AI analyst chat.

---

## Prospect Score — methodology

Four indicators, each min–max normalised to 0–100 before combining, so no signal
dominates through its unit:

```
Score = 0.35·(100 − IMD) + 0.25·TCD + 0.30·PopGrowth + 0.10·(100 − Access)
```

| Indicator | Source | Direction |
|---|---|---|
| Imperviousness Density (IMD) | Copernicus HRL, 10 m | Inverted — less sealed soil = more room |
| Tree Cover Density (TCD) | Copernicus HRL, 10 m | Direct — green = desirability |
| Population growth | ISTAT Demo 2024–2025 | Direct — demand signal |
| City access | OSRM drive time | Inverted — closer to a regional capital |

Weights are adjustable in the interface; the score recomputes live.

### Spatial clustering (LISA)

Local Moran's I identifies where a municipality sits relative to its neighbours,
on two dimensions — score and price. The combination that matters for investment
is **LH on price**: a low price surrounded by expensive neighbours.

| | Score clusters | Price clusters |
|---|---|---|
| **HH** | Growth corridor | Premium market |
| **HL** | Isolated performer | Possibly overpriced |
| **LH** | Lagging area | ★ **Undervalued opportunity** |
| **LL** | Cold spot | Depressed market |

---

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

The app reads its datasets (~390 MB of GeoJSON) from the deployed site rather
than carrying them in the repository — `VITE_DATA_BASE_URL` in `.env.example` is
preset to `https://urban.dotlink.ai/` and works out of the box.

Point it at a local `public/` folder instead if you have the data and want to
work offline.

---

## Tech stack

React 19 · Vite · Leaflet · Clerk (auth) · Vercel

The AI analyst chat runs through a serverless proxy so the model API key stays
server-side; tools execute in the browser against the already-loaded dataset.

---

## Data sources & licences

Each source is credited in the interface where its data appears. The terms
differ, and they matter if you redistribute the data.

| Source | Used for | Licence |
|---|---|---|
| **Copernicus HRL** | Imperviousness, tree cover | Free, full and open |
| **ISTAT** | Population 2024–2025 | CC BY 4.0 |
| **OpenStreetMap** | Hospitals, schools, stations | **ODbL 1.0** — derived databases inherit it |
| **OSRM** | Drive times | Computed from OSM road data — inherits ODbL |
| **Agenzia delle Entrate — OMI** | Residential prices, price zones | ⚠️ **No licence published** (see below) |
| **CARTO** | Basemap tiles | Free tier, attribution must stay visible |

### On the OMI data

The Agenzia delle Entrate publishes the OMI *Quotazioni Immobiliari* for free
download and asks that the source be cited as "Agenzia Entrate - OMI", but it
publishes **no licence terms**. Some readings limit reuse to non-commercial
purposes; the position is not stated unambiguously anywhere.
[onData](https://www.ondata.it/i-dati-sulle-quotazioni-immobiliari-dellagenzia-entrate/)
examined this specifically and treats the absent licence as a real limit on
reuse — while itself republishing the data on GitHub.

**This repository contains no OMI data.** It reads it at runtime from the
deployed site. Anyone who copies those datasets into their own repository
becomes a redistributor and takes on that ambiguity.

---

## Licence

No licence is granted for this source code. All rights reserved by
Venture Bottega S.r.l.

It is published so the work can be read and assessed, not reused.
