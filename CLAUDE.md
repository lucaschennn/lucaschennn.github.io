# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lucas Chen's photography portfolio: a single-page React 18 + Vite site deployed to GitHub Pages. **`v2` is the working/main branch** (the `main` branch holds the old v1). There are no tests and no linter configured.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/` (`base: ""` in [vite.config.js](vite.config.js) so asset paths are relative, as GitHub Pages needs)
- `npm run preview` — serve the built `dist/`
- `npm run deploy` — runs `predeploy` (build) then `gh-pages -d dist`, pushing `dist/` to the `gh-pages` branch. Deploy from `v2`.

## Architecture

- [src/App.jsx](src/App.jsx) renders one scrolling page: `Header`, `About` (slide-in panel toggled via `aboutActive` state), `Portfolio`, `Divider`, `Published`, `Divider`, `Gallery`, `Footer`. There is no router in use.
- `App` creates a single Cloudinary client (cloud name `dch9wtpmk`) and passes it as the `cloud` prop to every image-rendering component. Header nav scrolls to sections via three `pageRefs` (portfolio, published, gallery) passed to `Header` and to each section's `pageref` prop.
- **Images are hosted on Cloudinary, not in the repo.** Content is driven by JSON in [src/assets/](src/assets/):
  - `portfolio.json` — array of `{url, source}`
  - `published.json` — object keyed by group (e.g. `featured`); `source` is an Issuu tear-sheet link (metadata only, not rendered)
  - `galleries.json` — object keyed by gallery (`smtd`, `sports`, `astro`)

  `url` is a Cloudinary **public ID** (including its random suffix, e.g. `DSC00780_aasdfz`), not a path. Components render `cloud.image(item.url).delivery(quality(auto())).toURL()`. To add/reorder photos, edit the JSON; upload the image to Cloudinary first.
- Layout uses `react-responsive-masonry` (`ResponsiveMasonry` + `Masonry`, breakpoints 350/750/900 → 2/3/4 columns). Each image fades in via an `imagesLoaded` state map toggling an `active`/`hidden` class on `onLoad`.
- Clicking an image opens `PortfolioViewer` (lightbox). `Portfolio` and `Gallery` each own their viewer state (`viewerActive`, index, and for `Gallery` the gallery key) and a wrap-around prev/next handler. `Gallery` repeats the masonry block per gallery key — a new gallery means copying a block and adding the JSON key.
- Styles: global [src/App.css](src/App.css) and [src/index.css](src/index.css), plus one CSS file per component in [src/styles/](src/styles/) (imported by the component).
- [index.html](index.html) includes Google Analytics and Font Awesome 4.7 from a CDN; icons in components come from `react-icons`.

## Dead code from v1 (safe to ignore or delete; don't extend)

- Components not imported anywhere: `book.jsx`, `message.jsx` (EmailJS contact form), `imgcarousel.jsx`, `scrolldown.jsx`
- `src/photos.json`, `src/nav-animate.js` — unused
- [tools/](tools/) — old Flask/Jupyter helper for local `public/images/portfolio/*` files (images now live on Cloudinary); `script.js` imports a nonexistent `captions.json`
- Unused dependencies: `react-router-dom`, `masonic`, `react-masonry-css`, `@emailjs/browser` (only used by dead `message.jsx`)
- `public/images/` and `vite.config.js.timestamp-*.mjs` are likely leftovers
- Many components import `AdvancedImage`, `placeholder`, etc. without using them
