# skyview architecture

Status: built and in use. The first real publish was `082ec9e` ("skyview: update portfolio"). How it was built, step by step: [BUILD.md](BUILD.md). Day-to-day commands: [README.md](README.md).

skyview is a single-owner admin tool for rearranging the photos on lucaschenphoto.com and publishing the change without hand-editing JSON. Visitors can tour it without signing in, but only the owner can publish.

## Registry

Three JSON files in `src/assets/` are the contract between skyview, Cloudinary and the site. Their schemas stay as they are.

| File | Shape |
| --- | --- |
| `portfolio.json` | `[{url, source}]` |
| `published.json` | `featured: [{url, source}]`, `projects: [{title, url, ref, description}]` |
| `galleries.json` | `{gallery: [{url, source}]}` (`smtd`, `sports`, `astro`) |

- `url` is a Cloudinary **public ID** including its random suffix (e.g. `DSC00780_aasdfz`).
- `source` is free-form metadata (e.g. an Issuu tear-sheet link). The site doesn't render it; skyview edits it.
- Array order is display order. A flat array (`portfolio.json`) is edited as one unnamed group.
- skyview keeps fields it doesn't know as they are (the project fields), and writes files exactly as the repo formats them: `JSON.stringify(data, null, 4)`, no trailing newline. Untouched lines therefore never show up in a diff.
- The site lays photos into masonry columns **in rotation**: photo *i* goes to column *i* mod *N*, with 2/3/4 columns at the 350/750/900px breakpoints. Heights don't affect placement, so the JSON order fully determines the layout. Check the layout in the preview at both phone and desktop widths.

## User flow

1. **Sign in with GitHub.** Only the numeric GitHub user ID in `ALLOWED_GITHUB_ID` can sign in. Anyone else is a **visitor**: the same editor and preview, with a visitor notice, no **+ Add photos** and no Publish.
2. **The status bar** shows the deploy state: Live site is on `v2` HEAD, Pushed / waiting, Deploying, or Last deploy failed (with a link to the run), with the HEAD commit linked to GitHub and a link to lucaschenphoto.com. It refreshes every 15s and when the window regains focus.
3. **Tabs:** Portfolio, Published and Galleries, with one grid per group. Thumbnails are 200px Cloudinary crops.
4. **Editing:**
   - Drag to reorder, or to move a photo to another group in the same file. The move happens on drop, and the target group is highlighted while you drag.
   - × takes a photo off the site; the image stays in Cloudinary.
   - Edit `source` in the input under each photo.
   - **+ Add photos** opens the Cloudinary Media Library, with its own Cloudinary login. Picked images are appended, and duplicates are skipped. Project groups have no Add button.
   - **Cancel** asks for confirmation, then discards all edits.
5. **Drafts:** saved to `localStorage` on every edit, together with the blob shas of the three files they were based on. After a reload, the draft is restored only if those shas still match `v2`. Otherwise you get a stale-draft notice with "Discard old draft".
6. **Preview & publish:** the real site, rendered with the draft, at Phone 390, Tablet 768 or Desktop 1280. Below it is the diff against HEAD: added, removed, moved between groups, reordered, `source` changed. A move counts once, not as a shift of every later photo.
7. **Publish:** tick "I've checked the preview…" to enable it. The button only works while the live site equals `v2` HEAD. skyview then commits to `v2`, shows a link to the commit, and the status bar follows the deploy.

A bad public ID shows as a broken image (grey square, with the ID as alt text) in both the editor and the preview. Catching it there is the user's job.

## Service flow

```
                        read JSON @ HEAD, deploy status, commit
  skyview (Vercel)  ───────────────────────────────────────────►  GitHub repo (v2)
   │  ▲                                                               │ every push to v2
   │  └── rebuilt on every push to v2 (preview code = site code)      ▼
   │                                                             GitHub Actions: deploy.yml
   │                                                             build → upload → deploy-pages
   │                                                                  │
   └── thumbnails, Media Library widget ─►  Cloudinary  ◄── images ─ GitHub Pages (lucaschenphoto.com)
```

- **Reading** ([lib/github.js](lib/github.js), server only, using `GITHUB_REPO_TOKEN`): the branch HEAD, the three files at HEAD with their blob shas (contents API), and the deploy status.
- **Deploy status** is derived from two APIs, because a build that fails never creates a deployment:
  - **Live commit:** the newest `github-pages` deployment whose latest status is `success`.
  - **Comparison:** if the live commit equals HEAD, the state is `live`. Otherwise skyview looks at the deploy workflow's run for HEAD: no run yet is `pending`, a run in progress (or succeeded but not yet reported) is `deploying`, and a run that failed or was cancelled is `failed`.
- **Publishing** ([lib/github.js](lib/github.js) `publishRegistry`, behind [app/api/publish/route.js](app/api/publish/route.js)):
  1. Refuse unless the status is `live`. The server checks this itself; it doesn't trust the button.
  2. Re-read HEAD. Refuse if any registry file's blob sha differs from the draft's base. Code-only commits don't block.
  3. Build one commit (git data API: tree, then commit) containing only the changed files, authored by `skyview`, with the diff as the message.
  4. Move `v2` to it **without force**. If `v2` moved in the meantime, GitHub returns 422 and nothing is published.
- **Deploying the site** ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)): every push to `v2`, or a manual run, builds and deploys with `actions/deploy-pages`. `/version.txt` on the live site holds the deployed short sha. The Pages source is "GitHub Actions", and the custom domain is set in Settings → Pages. No CNAME file or `gh-pages` branch is involved.
- **Preview** ([preview/](preview/), [app/preview.js](app/preview.js)):
  - **Build:** `preview/` builds the site's own `src/` with the repo root's Vite, React 18 and CSS (the CSS comes out byte-identical) into `public/preview/`. Only `public/icons` is copied from the site's `public/`.
  - **Data:** skyview loads it in an iframe and sends the draft with `postMessage`, both on the iframe's `load` and on its `skyview:ready` message, so neither side can miss the other. The preview accepts data only from its same-origin parent. Opened directly, it renders nothing.
  - **Deploying it:** Vercel runs `npm run vercel-build` (set in [vercel.json](vercel.json)), which installs the root dependencies first. This needs "Include files outside the root directory" turned on.
- **Cloudinary:** delivery URLs only, plus the Media Library widget in the browser. skyview holds no Cloudinary API secret.
- **Auth** ([auth.js](auth.js)):
  - Auth.js 5 with the GitHub provider: `read:user` scope only, PKCE, 12-hour sessions in an encrypted cookie.
  - `signIn` admits only `ALLOWED_GITHUB_ID`, and `requireOwner()` re-checks the ID on every page and API route. Changing the ID demotes existing sessions to visitors too.
  - Owner-only: `/api/publish`, `/api/registry`, `/api/me` (401 otherwise). Open to visitors: the page and `/api/status`.
  - A rejected sign-in lands on [app/auth-error/page.js](app/auth-error/page.js) ("Access denied", **Return to skyview home**). `pages.signIn` and `pages.error` both point there, so Auth.js's built-in pages are never shown: their Access Denied "Sign in" link is broken (it appends `/signin` to the query string).
  - **Visitor reads are cached** (`cachedForVisitors` in [lib/github.js](lib/github.js)): one shared GitHub read per 15s per server instance for the status and for the registry, so visitor traffic can't use up `GITHUB_REPO_TOKEN`'s rate limit (5,000 requests/hour, shared with the owner). Visitors also poll status every 60s instead of 15s. The owner and publishing always read fresh. The page is `noindex`.
  - Commits use a separate fine-grained token: this repo only, with Contents read/write, Deployments read and Actions read.

## Invariant: `v2` is production

Every push to `v2` deploys (the action has no path filter), so `v2` HEAD is always either live or about to be. Work in progress goes on other branches. Because Publish requires live = HEAD, a skyview publish only ever ships the photo edits.

Concurrency is handled in three layers:

1. **Writes to `v2`:** git only accepts fast-forwards. skyview's ref update isn't forced, and a normal push isn't either.
2. **Deploys:** `concurrency: { group: pages, cancel-in-progress: false }`. At most one deploy runs and one waits. A newer pending run replaces an older pending one, and the older one shows as "cancelled". The latest commit always ends up live.
3. **skyview:** Publish waits for the previous deploy to finish.

## Failure modes

These are all covered by the e2e suite ([e2e/drills.spec.mjs](e2e/drills.spec.mjs)). The site never depends on skyview at runtime, and only unpublished drafts exist only in skyview.

| Situation | What skyview does | Fix |
| --- | --- | --- |
| Deploy in progress | "Deploying"; Publish disabled (UI and server) | Wait about 1–2 min |
| Deploy failed | "Last deploy failed" + run link; Publish disabled | Re-run the workflow, or fix and push |
| Registry JSON changed on `v2` since load | Publish refused, draft kept; stale-draft notice after reload | Redo the edits on the new version |
| Only code changed on `v2` since load | Publish succeeds on top of it | Nothing |
| Someone pushes during a publish | Refused ("v2 moved while publishing"); their push survives | Reload, publish again |
| Repo token expired or revoked | Clear message naming `GITHUB_REPO_TOKEN` (401/403/404 hints) | Rotate the token in Vercel |
| Bad publish went live | Normal | `git revert` the skyview commit (redeploys) |
| `npm run deploy` | "Missing script" | Not needed: deploys only go through the action |
| skyview or Vercel down | n/a | Edit the JSON by hand and push to `v2` |

## Code map

| Path | Role |
| --- | --- |
| `app/page.js` | Server component: sign-in gate, reads HEAD and the registry, shows GitHub errors clearly |
| `app/auth-error/page.js` | Where failed sign-ins land: access denied, link home |
| `app/editor.js` | Client: tabs, draft persistence, Cancel, preview and publish states |
| `app/file-board.js` | dnd-kit board for one file: groups, cards, drag/drop, remove, source, Add |
| `app/preview.js`, `preview/` | Preview iframe, width switch; the preview's Vite entry and config |
| `app/publish-panel.js` | Diff, confirmation, Publish |
| `app/status-bar.js`, `lib/use-deploy-status.js` | Deploy status display and polling |
| `app/api/{status,registry,publish,me}` | API routes; each calls `requireOwner()` first (only `status` lets visitors through) |
| `lib/github.js` | All GitHub access: reads, deploy status, publish |
| `lib/registry.js`, `lib/diff.js` | Editor data model, thumbnails; the diff |
| `lib/use-media-library.js` | Loads and drives the Cloudinary widget |
| `e2e/` | Playwright suite and fake GitHub ([e2e/README.md](e2e/README.md)) |

## Configuration

| Env var | Where | Purpose |
| --- | --- | --- |
| `ALLOWED_GITHUB_ID` | Vercel, `.env.local` | The only GitHub account that may sign in and publish (numeric ID) |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Vercel, `.env.local` | GitHub OAuth app. Separate apps for localhost:3000 and production, since an OAuth app accepts callbacks for only one host |
| `AUTH_SECRET` | Vercel, `.env.local` | Encrypts session cookies |
| `GITHUB_REPO_TOKEN` | Vercel, `.env.local` | Fine-grained token for this repo. It expires, so set a reminder |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD` | Vercel, `.env.local` | `dch9wtpmk`, inlined at build |
| `GITHUB_API_URL` | Tests only | Points skyview at the fake GitHub. Never set in Vercel |

Vercel: Root Directory `skyview`, production branch `v2`, env vars scoped to Production, "Include files outside the root directory" on.

## Testing

`npm run test:e2e` runs 22 Playwright tests in Chromium against a production build of skyview. GitHub is replaced by an in-memory fake ([e2e/fake-github.mjs](e2e/fake-github.mjs)), sessions are minted with Auth.js's own `encode()` and a test secret, and all other internet access is stubbed. The suite never touches the real repo, Vercel or Cloudinary. See [e2e/README.md](e2e/README.md).

## Tech debt and possible improvements

1. **Inconsistent registry shapes:** `portfolio.json` is a flat array, the others are keyed by group. skyview adapts; consolidating them is deferred.
2. **Section keys and titles live in site code** (hardcoded in `Gallery` and `Published`). Adding a section needs a code change. Out of scope.
3. **Projects can't be added or edited** in skyview (title, link, description). Dragging a tear sheet into `projects` creates a card with no title or link, which the preview shows.
4. **`source` semantics are loose:** link vs. free text, often empty, no validation.
5. **Stale drafts can't be merged:** a draft based on old JSON must be redone, even if the other change touched a different file. Also, while the stale-draft notice is showing, new edits aren't saved to `localStorage` until the old draft is discarded.
6. **Dropping far from any group** still drops next to the nearest card (dnd-kit's closest-center behaviour). Press Esc to cancel a drag.
7. **The status bar can show "live none" briefly** during a deploy if GitHub marks the old deployment inactive early. Cosmetic.
8. **Site bug, left untouched:** in `published.jsx`, project images track their fade-in under the `featured` group's indices.
9. **The site's header uses `100vw`,** so a horizontal scrollbar appears where scrollbars take up width (Windows). It's visible in the phone preview.
10. **Repo housekeeping:** `public/images` (59MB, v1, unused) and the other dead v1 code listed in CLAUDE.md. The `main` branch is stale; consider making `v2` the GitHub default branch.
