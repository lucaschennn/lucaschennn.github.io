# skyview architecture

Status: design agreed, nothing implemented yet.

A private, single-user admin tool to rearrange the photos on the portfolio site (lucaschenphoto.com) and publish the change without hand-editing JSON.

## Registry

Three JSON files in `src/assets/` are the contract between skyview, Cloudinary, and the site. Schemas stay as they are.

| File | Shape |
| --- | --- |
| `portfolio.json` | `[{url, source}]` |
| `published.json` | `{group: [{url, source}]}` (`featured` or `projects`) |
| `galleries.json` | `{gallery: [{url, source}]}` (`smtd`, `sports`, `astro`) |

- `url` is a Cloudinary **public ID** including its random suffix (e.g. `DSC00780_aasdfz`).
- `source` is free-form metadata (e.g. an Issuu tear-sheet link). The site does not render it. skyview edits it.
- Array order is display order. A flat array is treated as one unnamed group.

## User flow

1. Sign in with GitHub. Only my GitHub user ID is allowed.
2. A status bar shows whether the deployed site matches `v2` HEAD (or a deploy is pending or failed).
3. One tab per registry file, with one section per group. Thumbnails come from Cloudinary.
4. Edit: drag to reorder (moving between groups is allowed, not special-cased), remove (off the site only, the image stays in Cloudinary), add via the Media Library widget (separate Cloudinary login), and edit `source`. Cancel discards the changes. Drafts persist in `localStorage`.
5. **Final save** opens the preview: the real site rendered with the draft JSON, plus a diff against `v2` HEAD (added, removed, moved between groups, reordered, `source` changed). **Publish is only enabled when the live site equals `v2` HEAD** (enforced on the server too), so a publish only ever ships the photo edits.
6. Tick the confirm checkbox, then **Publish**. This commits to `v2`, and the deploy action runs.

A bad public ID shows as a broken image in the preview. Catching it there is my responsibility.

## Service flow

```
             read JSON @ HEAD, commit            push to v2 (src/assets/**)
  skyview  ───────────────────────►  GitHub repo  ─────────────────────────►  GitHub Actions
 (Vercel)  ◄───────────────────────    (v2)       ◄── deployments API ──┐       build + deploy-pages
    │       deployments API: live sha                                   │             │
    │                                                                   └──────  GitHub Pages
    └── thumbnails, Media Library widget ──► Cloudinary ◄── images ──────────  (lucaschenphoto.com)
```

- **GitHub API (repo):** skyview reads the three files at `v2` HEAD and publishes them as **one commit** containing all three, using the git data API (trees and commits). At publish, skyview re-reads HEAD. If the three files are unchanged since load, it commits on top of the new HEAD (unrelated commits don't block). If any of them changed, the publish is refused and the draft is kept for a manual reload. Commit author: `skyview`.
- **GitHub Actions:** on push to `v2` (or manual dispatch), the action runs `npm run build` and deploys with `actions/deploy-pages`. This is the only deploy path. Pages source is set to "GitHub Actions".
- **Deployments API:** `GET /deployments?environment=github-pages` returns the latest successful deployment. Its `sha` is the `v2` commit that is live. skyview compares it to HEAD for the status bar and can read the live JSON at that commit.
- **Preview:** the site's components take registry data as props. `skyview/preview/` is a Vite entry that imports `../../src/App.jsx` and the site's CSS and renders with JSON received via `postMessage`. skyview builds it into a static page and loads it in an iframe, which keeps the two sets of CSS apart. Vercel rebuilds skyview on every push to `v2`, so the preview code always matches what the action deploys.
- **Cloudinary:** delivery URLs only (thumbnails and preview), plus the Media Library widget in the browser. skyview holds no Cloudinary API secret.
- **Auth:** GitHub OAuth (only the read-user scope), allowlisted by numeric user ID and checked on every API route on the server. Commits use a separate fine-grained token: this repo only, Contents read/write, stored as a Vercel env var.

## Invariant: `v2` is production

Every push to `v2` deploys (the action has no path filter), so `v2` HEAD is always what is live or about to be. Work in progress goes on other branches and is merged into `v2` when ready to go live. A skyview publish therefore never ships surprise code: anything beyond the photo edits was already headed to production, and the preview and diff show it.

## Failure modes

"Deployed sha == `v2` HEAD" is monitored, and it only differs while a deploy runs or after one fails. The site never depends on skyview at runtime, and nothing lives only in skyview except unpublished drafts.

| Situation | What skyview shows | Fix |
| --- | --- | --- |
| Deploy in progress | "Deploying", Publish disabled | Wait (~1–2 min) |
| Deploy failed | "Deploy failed" + link to the run, Publish disabled | Re-run the workflow, or fix and push |
| JSON changed on `v2` since load | Publish refused, draft kept | Reload, redo the edits |
| Bad publish went live | Normal | `git revert` the skyview commit (auto-redeploys) |
| `npm run deploy` run manually | Nothing | No effect: Pages serves from Actions, not the `gh-pages` branch |
| Repo token expired or revoked | Publish fails with an auth error | Rotate the token in Vercel env |
| skyview or Vercel down | n/a | Edit the JSON by hand and push |

## Stack

Next.js on Vercel (Root Directory = `skyview`, production branch = `v2`), dnd-kit, Auth.js (GitHub provider).

## Initialization steps

1. **Site refactor:** `main.jsx` imports the three JSON files and passes them through `App` as props to `Portfolio`, `Published`, and `Gallery`. No visual change.
2. **Deploy action:** add `.github/workflows/deploy.yml` (build + `actions/deploy-pages`). In repo Settings → Pages, set the source to "GitHub Actions" and confirm the custom domain `lucaschenphoto.com` with Enforce HTTPS. Remove the `deploy`/`predeploy` scripts and the `gh-pages` dependency, then delete the `gh-pages` branch. `public/CNAME` becomes redundant.
3. **Scaffold skyview:** a Next.js app in `skyview/`, and the `skyview/preview/` Vite entry wired into its build.
4. **GitHub credentials:** create an OAuth app (callback set to the Vercel URL) and a fine-grained personal access token (this repo, Contents read/write).
5. **Vercel project:** import the repo with Root Directory `skyview` and production branch `v2`. Confirm that files outside the root directory are included in the build (needed for `../src`). Set env vars: OAuth client ID/secret, `AUTH_SECRET`, allowed GitHub user ID, repo token, and the Cloudinary cloud name.
6. Build the UI: status bar, tabs and grid, Media Library widget, preview and diff, publish.

## Tech debt

1. **Inconsistent registry shapes:** `portfolio.json` is a flat array, the others are keyed by group. skyview adapts to this. Consolidating them is deferred.
2. **Section keys and titles live in site code** (e.g. hardcoded in `Gallery`). Adding a section requires a code change. Out of scope.
3. **`source` semantics are loose:** link vs. free text, empty on many entries, no validation. It was renamed from `caption`.
4. **No existence check for public IDs.** This is covered by inspecting the preview by eye.
5. **`dist/` is tracked in git** despite `.gitignore`. Untrack it once the action deploys.
6. **Dead v1 code and deps** (see CLAUDE.md). skyview must not copy any of it.
