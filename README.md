# Fusion portfolio

A chemical-engineering portfolio told through controlled nuclear fusion, plus a dashboard built on live Eskom grid data.

- **Portfolio (`/#/`)**: a scroll-driven canvas scene. Deuterium appears, tritium joins, the plasma heats and is magnetically confined, the nuclei fuse, and a neutron carries 17.6 MeV away. Frosted info cards appear after each transition. The rail on the right shows progress and jumps to any stage.
- **Grid dashboard (`/#/grid`)**: generation mix, demand vs forecast, outages and diesel peaker use from the [Eskom Data Portal](https://www.eskom.co.za/dataportal/). It also has a load-shift what-if and recommendations computed from the data. It fits one screen on desktop, with no scrollbars.

Stack: Vite · React 19 · TypeScript · Tailwind CSS 4 · shadcn structure (`src/components/ui`) · framer-motion · recharts · lucide-react.

## Edit your content

Everything you'll want to change is in **`src/content/portfolio.ts`**: name, links, and every card. Put your CV at `public/cv.pdf`.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/
node scripts/fetch-eskom.mjs   # refresh public/data/eskom.json by hand
```

## Deploy to GitHub Pages

1. Create a GitHub repo and push this folder to its `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and deploys on every push. It also runs every 6 hours to pull fresh Eskom CSVs, commit `public/data/eskom.json`, and redeploy.

The build uses relative paths and hash routing, so it works at `https://<user>.github.io/<any-repo-name>/` with no configuration.

## How the Eskom data works

The portal's own download links point at monthly folders that go stale (404). `scripts/fetch-eskom.mjs` asks the portal's WordPress media API for every uploaded copy of each dataset and uses the newest one that parses. If a fetch fails, the previous data is kept, so the site never breaks. The capacity dataset hasn't been updated on the portal since February 2026, so the dashboard ignores it until it is fresh again.

The one assumption in the maths is `PEAKER_COST_R_PER_KWH` (default R6/kWh) in `src/lib/eskom.ts`, and it's labelled on the page.

## Accessibility & performance

- Respects `prefers-reduced-motion`: no particle drift, slow spin, a dimmed flash and no smoothing.
- Every card stays in the DOM for screen readers. Tabbing into a hidden card scrolls to it.
- Nucleus textures are pre-rendered once. Particle links use a spatial grid. Pixel ratio and particle count are capped on phones. The animation pauses when the tab is hidden.
- The dashboard and the charting library load only when the Grid tab is opened.
