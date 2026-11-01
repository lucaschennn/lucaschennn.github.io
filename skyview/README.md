# skyview

Private admin tool for rearranging the photos on the portfolio site and publishing the change. Design: [ARCHITECTURE.md](ARCHITECTURE.md). Build plan and progress: [BUILD.md](BUILD.md).

Independent Next.js app, deployed to Vercel with **Root Directory = `skyview`**. It is not part of the main site's Vite build.

New here? Take the [tech walkthrough](#tech-walkthrough) below.

## Local dev

```sh
cp .env.example .env.local   # fill in values; never commit
npm install
npm run dev                  # http://localhost:3000 (must match the local OAuth app's callback)
```

`next start` locally needs `AUTH_TRUST_HOST=true`. `next dev` and Vercel trust the host automatically.

## Preview

`preview/` builds the site's own `src/` (React 18, the site's CSS) into `public/preview/` (gitignored) with the repo root's Vite. skyview shows it in an iframe and sends the draft registry via `postMessage`.

- Needs the site's dependencies installed at the repo root (`npm install` in the repo root).
- `npm run dev` and `npm run build` rebuild it first. After changing site code in `src/`, run `npm run build:preview` (or restart dev) to see it in the preview.
- On Vercel, [vercel.json](vercel.json) sets the build command to `npm run vercel-build`, which installs the root dependencies before building. This needs "Include files outside the root directory" on. `vercel.json` takes precedence over a Build Command set in the dashboard.

## Tests

`npm run test:e2e` runs the Playwright suite against a fake GitHub: safe to run any time. See [e2e/README.md](e2e/README.md).

## Auth

- `auth.js`: Auth.js (GitHub provider, `read:user` scope, PKCE). `signIn` only admits `ALLOWED_GITHUB_ID`.
- Every page and API route calls `requireOwner()`, which re-checks the ID on the server. `app/api/me/route.js` is the template for new routes: owner-only by default.
- Everyone else is a visitor: they tour the editor and preview without signing in, from cached GitHub reads, and can't publish.

---

## Tech walkthrough

A guided tour of skyview, like a museum audio guide. Each stop opens with a short summary: enough to understand what it is and why it's there. Read only the summaries for a 10-minute overview. For the underlying technology and links to the exact lines of code, open the **Details** under a stop.

**The route**

0. [Overview](#stop-0-overview)
1. [The registry: what skyview edits](#stop-1-the-registry-what-skyview-edits)
2. [Signing in](#stop-2-signing-in)
3. [Reading from GitHub](#stop-3-reading-from-github)
4. [Deploy status: what's live](#stop-4-deploy-status-whats-live)
5. [Drag and drop](#stop-5-drag-and-drop)
6. [Cloudinary](#stop-6-cloudinary)
7. [Preview: the real site, with your draft](#stop-7-preview-the-real-site-with-your-draft)
8. [The diff](#stop-8-the-diff)
9. [Publishing](#stop-9-publishing)
10. [Deploying the site](#stop-10-deploying-the-site)
11. [Playwright tests](#stop-11-playwright-tests)
12. [Further reading](#further-reading)

### Stop 0: Overview

lucaschenphoto.com is a static React site on GitHub Pages. Which photos it shows, and in what order, comes from three JSON files in the repo. skyview is a private web app on Vercel that edits those files: you drag photos around, preview the real site with your changes, and publish. Publishing is just a git commit to `v2`. A GitHub Action deploys every commit on `v2`, so the site updates about a minute later.

```
 you ──► skyview (Next.js on Vercel) ──commit──► GitHub repo, branch v2 ──Action──► GitHub Pages
              │                                                                        │
              └──────── thumbnails, photo picker ──► Cloudinary ◄──── images ──────────┘
```

Two ideas hold the design together: **git is the database** (history is the undo button) and **`v2` is production** (whatever is on `v2` is live, or about to be).

<details>
<summary><b>Details:</b> how the code is organized</summary>

| Layer | Where | Runs on |
| --- | --- | --- |
| Pages and UI | [app/](app/): `page.js` (server component), `editor.js`, `file-board.js`, `preview.js`, `publish-panel.js`, `status-bar.js` (client components) | Server and browser |
| API routes | [app/api/](app/api/): `status`, `registry`, `publish`, `me`, `auth/[...nextauth]` | Vercel serverless functions |
| GitHub access | [lib/github.js](lib/github.js) | Server only (holds the repo token) |
| Editor logic | [lib/registry.js](lib/registry.js), [lib/diff.js](lib/diff.js) | Browser |
| Browser hooks | [lib/use-deploy-status.js](lib/use-deploy-status.js), [lib/use-media-library.js](lib/use-media-library.js) | Browser |
| Site preview | [preview/](preview/) | Built by Vite, runs in an iframe |
| Tests | [e2e/](e2e/) | Playwright |

Next.js "App Router" conventions: a file in `app/` is a route, `"use client"` at the top marks a component that runs in the browser, and everything else renders on the server by default. That's why the GitHub token can sit safely in `lib/github.js`: only server code imports it.

</details>

### Stop 1: The registry: what skyview edits

Three files in the site's `src/assets/` decide what appears on the site: `portfolio.json`, `published.json` and `galleries.json`. Each entry is mainly a Cloudinary **public ID** (`url`), and array order is display order. skyview reads them, lets you change them, and writes them back. It never invents a new format.

<details>
<summary><b>Details:</b> the shapes, and how the editor models them</summary>

| File | Shape |
| --- | --- |
| `portfolio.json` | `[{url, source}]`, a flat list |
| `published.json` | `featured: [{url, source}]`, `projects: [{title, url, ref, description}]` |
| `galleries.json` | `{smtd: [...], sports: [...], astro: [...]}` |

[lib/registry.js#L12-L30](lib/registry.js#L12-L30) converts each file into one editing model: `{ array, groups: { [group]: [{ id, item }] } }`.

- A flat array becomes a single group named `_`, and `fromEditable` turns it back into an array on save.
- `item` is the original JSON object, untouched, so fields skyview doesn't understand (like a project's `title`) survive.
- `id` is a random UUID that exists only in the editor. dnd-kit needs a stable id per draggable item, and the same photo may legitimately appear in two groups.

The site reads the same files: [../src/main.jsx](../src/main.jsx) imports them and passes them down as a `registry` prop. That small refactor is what lets skyview render the site with *different* data (Stop 7).

</details>

### Stop 2: Signing in

Only one person may publish. You sign in with GitHub, and skyview checks your numeric GitHub account ID against an allowlist of one, on every page and every API call. Anyone else can look around as a visitor, without signing in, but can't publish. Your GitHub login only proves *who you are*. Commits are made with a separate token that can touch this one repo and nothing else.

<details>
<summary><b>Details:</b> OAuth, Auth.js and the allowlist</summary>

**The OAuth dance.** The "OAuth app" registered on GitHub isn't code. It's a registration: a client ID, a client secret and an allowed callback URL.

1. "Sign in with GitHub" redirects your browser to `github.com/login/oauth/authorize?client_id=…&code_challenge=…`.
2. You sign in on github.com, with your own 2FA or passkey. skyview never sees your password.
3. GitHub redirects back to `/api/auth/callback/github?code=…`.
4. skyview's server exchanges `code` plus the client secret for a token, fetches your profile, and decides whether to let you in.

The **client secret** proves to GitHub that the server doing the exchange is really skyview, so a code leaked from a URL is useless on its own. **PKCE** (`code_challenge`) adds a one-time proof tied to the browser that started the login, which blocks forged callbacks.

**Auth.js** does all of that. [auth.js#L7-L29](auth.js#L7-L29):

- `scope: "read:user"`: skyview asks GitHub for nothing but your public profile.
- `signIn` callback: rejects any account whose `profile.id` isn't `ALLOWED_GITHUB_ID`. The rejected user lands on [app/auth-error/page.js](app/auth-error/page.js): "Access denied" and a button back to skyview home, where they can tour as a visitor.
- `pages`: points Auth.js's sign-in and error pages at that page, so its built-in ones (whose Access Denied "Sign in" link is broken) are never shown.
- `jwt` and `session` callbacks: copy the GitHub ID into the encrypted session cookie, which is signed with `AUTH_SECRET` and lasts 12 hours.
- The route `app/api/auth/[...nextauth]/route.js` mounts Auth.js's handlers.

**Checked twice.** [auth.js#L31-L38](auth.js#L31-L38) defines `requireOwner()`, which every page and API route calls first. It re-checks the ID, so changing `ALLOWED_GITHUB_ID` also demotes existing sessions to visitors. [app/api/me/route.js](app/api/me/route.js) is the smallest example.

**Visitors.** Without the owner's session, [app/page.js](app/page.js) still renders the editor, with a visitor notice and no Add or Publish. `/api/publish` refuses them on the server regardless of the UI. Their GitHub reads go through `cachedForVisitors` in [lib/github.js](lib/github.js): one shared read per 15 seconds, so a crowd of visitors costs the repo token about as much as one, and the owner never runs out of rate limit.

**Two credentials, deliberately.** Your sign-in token isn't used for commits. `GITHUB_REPO_TOKEN` is a fine-grained token limited to this one repo, with Contents read/write, Deployments read and Actions read. A stolen session could at worst commit to that repo, which git can revert.

</details>

### Stop 3: Reading from GitHub

When you open skyview, its server asks GitHub two questions: "what commit is `v2` on?" and "what are the three files at that commit?" It also records a fingerprint of each file, which later lets it tell whether anything changed underneath you.

<details>
<summary><b>Details:</b> the GitHub client and blob shas</summary>

[lib/github.js#L27-L41](lib/github.js#L27-L41), `gh()`, is a tiny wrapper around `fetch`. It adds the token, uses `cache: "no-store"` (Next.js would otherwise cache server fetches), and throws a `GitHubError`. The error carries a human hint for 401, 403 and 404 ([#L14-L25](lib/github.js#L14-L25)), so an expired token shows up as "GITHUB_REPO_TOKEN is invalid, expired or revoked…" rather than a crash ([app/page.js#L16-L22](app/page.js#L16-L22)).

[lib/github.js#L43-L58](lib/github.js#L43-L58): `getHead()` reads the branch, and `getRegistry(sha)` reads the three files through the contents API at that exact commit. Each file comes back with its **blob sha**, git's hash of the file's exact contents. Change one character and the hash changes. Drafts and publishing both rely on it (Stops 5 and 9).

`GITHUB_API_URL` (line 3) defaults to the real API. Only the test suite changes it (Stop 11).

</details>

### Stop 4: Deploy status: what's live

The coloured bar at the top answers "is the live site up to date with `v2`?" Green means live. Yellow means a push is waiting or deploying. Red means the last deploy failed, with a link to the logs. Publishing is only allowed on green.

<details>
<summary><b>Details:</b> deriving status from two GitHub APIs</summary>

[lib/github.js#L60-L88](lib/github.js#L60-L88):

- **Live commit:** the newest `github-pages` deployment whose latest status is `success` (`getLiveDeployment`). With Pages deploying from Actions, a deployment's `sha` is the `v2` commit that was built.
- **If the live commit equals HEAD:** `live`.
- **Otherwise:** skyview looks at the deploy workflow's run for HEAD. No run yet is `pending`, a run in progress is `deploying`, and a run that failed or was cancelled is `failed`. Runs are needed because a build that fails never creates a deployment at all.

The browser side is [lib/use-deploy-status.js](lib/use-deploy-status.js): a React hook that polls `/api/status` every 15 seconds and also whenever the window regains focus. [app/status-bar.js](app/status-bar.js) only displays the result. The same hook feeds the Publish button (Stop 9).

</details>

### Stop 5: Drag and drop

One tab per file, one grid per group. Drag a photo to reorder it, or drop it into another group in the same file. × removes a photo from the site (it stays in Cloudinary), and the input below each photo edits its `source`. Every change is saved as a draft in your browser, so a reload loses nothing.

<details>
<summary><b>Details:</b> dnd-kit, piece by piece</summary>

[dnd-kit](https://dndkit.com) is a toolkit of small pieces rather than a ready-made component. Everything is in [app/file-board.js](app/file-board.js):

| Piece | What it does here | Where |
| --- | --- | --- |
| `DndContext` | The drag "world" for one tab: holds sensors, collision detection and the drag event handlers | [#L109-L135](app/file-board.js#L109-L135) |
| Sensors | `PointerSensor` with `distance: 5`: a drag starts only after the pointer moves 5px, so clicks on × and inputs still work. `KeyboardSensor`: Space to pick up, arrows to move | [#L38-L42](app/file-board.js#L38-L42) |
| `useDroppable` | Makes each group's grid a drop target, so even an empty group can receive photos | [#L140](app/file-board.js#L140) |
| `SortableContext` | Declares "these ids are an ordered list" for one group | [#L153-L165](app/file-board.js#L153-L165) |
| `useSortable` | Makes each card draggable *and* a drop target, and provides the transform for the shuffle animation | [#L170-L172](app/file-board.js#L170-L172) |
| `setActivatorNodeRef` | Only the image is the drag handle, not the whole card | in `Card` |
| `DragOverlay` | The floating thumbnail under your pointer, rendered outside the grids | [#L130-L134](app/file-board.js#L130-L134) |

**Why moves between groups happen on drop.** The common dnd-kit pattern moves an item into the new group *during* the drag (`onDragOver`). Here that shifted the layout under the pointer, changed what was "over", and triggered another move: an infinite loop ("Maximum update depth exceeded"). So `handleDragOver` only records which group to highlight ([#L55-L58](app/file-board.js#L55-L58)), and `handleDragEnd` does the actual move ([#L60-L94](app/file-board.js#L60-L94)). A drop goes before the card you dropped on, or after it if you let go past its centre (`pastCentre`). `sameGroupStrategy` ([#L24-L27](app/file-board.js#L24-L27)) keeps the grids still while you hover a different group.

**Drafts.** [app/editor.js#L19-L35](app/editor.js#L19-L35) reads and writes `localStorage`, wrapped in `try/catch` so private windows still work. Each draft stores the blob shas of the files it was based on. On load ([#L62-L72](app/editor.js#L62-L72)), the draft is restored only if those shas still match `v2`. Otherwise it's set aside with a "Discard old draft" notice, never silently applied to different data.

**Rendering only in the browser.** Item ids are random, and dnd-kit generates ids for accessibility. Rendering those on the server would mismatch the browser's render, so the editor shows "Loading editor…" until it has mounted.

</details>

### Stop 6: Cloudinary

The photos themselves never live in the repo. They're on Cloudinary, and the JSON only holds their public IDs. skyview uses Cloudinary in two ways: tiny thumbnails for the editor, and Cloudinary's own Media Library picker for adding photos.

<details>
<summary><b>Details:</b> delivery URLs and the Media Library widget</summary>

**Thumbnails are just URLs.** [lib/registry.js#L36-L38](lib/registry.js#L36-L38):

```
https://res.cloudinary.com/dch9wtpmk/image/upload/c_fill,g_auto,w_200,h_200,f_auto,q_auto/<public id>
```

Cloudinary transforms the image on the fly: `c_fill` crops to a 200px square, `g_auto` picks the interesting part, and `f_auto`/`q_auto` choose the best format and quality. Each thumbnail is about 5KB. A wrong public ID returns 404, so the photo shows as a grey square with the ID as its alt text.

**The Media Library widget.** [lib/use-media-library.js](lib/use-media-library.js) is a React hook that:

1. Loads Cloudinary's script from `media-library.cloudinary.com` once ([#L7-L20](lib/use-media-library.js#L7-L20)).
2. Creates the widget with `createMediaLibrary({ cloud_name, multiple: true, max_files: 50 }, { insertHandler })` ([#L35-L45](lib/use-media-library.js#L35-L45)).
3. Opens it filtered to images when you click **+ Add photos** ([#L54-L58](lib/use-media-library.js#L54-L58)).

You sign in to Cloudinary *inside* the widget, so skyview holds no Cloudinary secret at all. When you insert, `insertHandler` receives the chosen assets. skyview keeps only images' public IDs and appends them, skipping duplicates ([app/file-board.js#L99-L107](app/file-board.js#L99-L107)).

</details>

### Stop 7: Preview: the real site, with your draft

**Final save → preview** shows lucaschenphoto.com exactly as it will look, at phone, tablet or desktop width. It isn't a mock-up. It's the site's own code, built inside skyview and fed your draft instead of the published JSON. If it looks right here, it will look right live.

<details>
<summary><b>Details:</b> building the site inside skyview, and the iframe handshake</summary>

**Building it.** [preview/vite.config.mjs](preview/vite.config.mjs) builds `../src/App.jsx` with the repo root's Vite into `public/preview/`. Two details keep it faithful:

- React is aliased to the root's `node_modules`, so the preview uses the site's React 18, not skyview's React 19. Two Reacts on one page would break hooks.
- The site's CSS comes out byte-identical to the real build. Only `public/icons` is copied in; the site's other `public/` files are v1 leftovers.

**The entry point.** [preview/main.jsx](preview/main.jsx) mirrors the site's `src/main.jsx`, with one difference: it doesn't import the JSON. It waits for a `postMessage` instead.

**The handshake.** [app/preview.js#L21-L40](app/preview.js#L21-L40):

1. skyview renders `<iframe src="/preview/index.html">`.
2. The iframe announces `skyview:ready` to its parent.
3. skyview replies with `skyview:registry` and the draft. It also sends on the iframe's `load` event, because the iframe can be ready before skyview is listening.
4. The iframe accepts messages only from its same-origin parent, ignores duplicates, and renders `<App registry={…}>`.

Opened directly, `/preview/index.html` renders nothing, because there's no parent to send data.

**Why an iframe?** It isolates the site's global CSS and its viewport. The site's masonry breakpoints respond to the iframe's width, which is how the width buttons work.

**On Vercel.** [vercel.json](vercel.json) runs `npm run vercel-build`, which installs the site's dependencies at the repo root before building. Vercel rebuilds skyview on every push to `v2`, so the preview code always matches the deployed site.

</details>

### Stop 8: The diff

Under the preview, skyview lists exactly what will change: photos added, removed, moved between groups, reordered, and `source` edits. Moving one photo to the front shows as one move, not as every other photo shifting down.

<details>
<summary><b>Details:</b> the longest increasing subsequence</summary>

[lib/diff.js](lib/diff.js) compares HEAD and the draft per file and group, identifying photos by public ID ([#L31-L72](lib/diff.js#L31-L72)).

Reordering is the interesting part. Take the photos that stayed in a group, and write down each one's *old* position in *new* order. Photos that didn't need to move form a **longest increasing subsequence** (LIS) of that list. Everything outside it is reported as moved ([#L11-L29](lib/diff.js#L11-L29)). Example: moving the 4th photo to the front gives old positions `[3, 0, 1, 2, 4, …]`. The LIS is `0, 1, 2, 4, …`, so only one photo moved.

`describe()` ([#L83-L92](lib/diff.js#L83-L92)) turns each change into a line. The same lines become the commit message.

</details>

### Stop 9: Publishing

Tick "I've checked the preview…" and **Publish** makes one commit to `v2` with exactly the files you changed. Three checks guard it: the live site must be up to date, the files must not have changed since you loaded them, and nobody may have pushed in the meantime. If any check fails, nothing is written and your draft is kept.

<details>
<summary><b>Details:</b> the publish algorithm and git's data API</summary>

The browser posts the draft and its base blob shas to [app/api/publish/route.js](app/api/publish/route.js), which checks the session and calls `publishRegistry` ([lib/github.js#L119-L161](lib/github.js#L119-L161)):

1. **Lock 1, deploy state.** Unless status is `live`, it refuses. The server checks this itself and doesn't trust the button.
2. **Lock 2, blob shas.** It re-reads HEAD. If any registry file's blob sha differs from the draft's base, it refuses with "Changed on v2 since you loaded it". Code-only commits don't change those hashes, so they don't block.
3. **Build the commit** with git's lower-level data API, which writes several files in one commit:
   - `GET /git/commits/{head}` gives the current tree.
   - `POST /git/trees` with `base_tree` plus the changed files gives a new tree.
   - `POST /git/commits` creates a commit on that tree with parent = HEAD, author `skyview`, and the diff as its message.
4. **Lock 3, the branch update.** `PATCH /git/refs/heads/v2` with `force: false`. GitHub only accepts a fast-forward, so if anyone pushed in the instant since step 2, it answers 422 and skyview reports "v2 moved while publishing". Their push survives, and nothing of yours was written.

Files are written with `JSON.stringify(data, null, 4)` and no trailing newline, which is byte-for-byte the repo's own formatting. A one-photo move therefore shows as a tiny diff on GitHub.

In the browser, [app/publish-panel.js#L22-L23](app/publish-panel.js#L22-L23) enables Publish only when there are changes, the box is ticked, and the status is `live`.

</details>

### Stop 10: Deploying the site

skyview never deploys anything itself. It commits, and GitHub takes over. Every push to `v2`, from skyview or from you, runs one workflow that builds the site and publishes it to GitHub Pages. The live site carries a tag, `/version.txt`, saying which commit it was built from.

<details>
<summary><b>Details:</b> the workflow, Pages and concurrency</summary>

[../.github/workflows/deploy.yml](../.github/workflows/deploy.yml):

- `on: push: branches: [v2]` with no path filter, plus `workflow_dispatch` for manual runs. This is what makes "`v2` is production" true.
- **build job:** checkout, Node 22, `npm ci`, `npm run build`, write `dist/version.txt` (line 31), `upload-pages-artifact`.
- **deploy job:** `actions/deploy-pages` in the `github-pages` environment. Each run creates the deployment record that Stop 4 reads.

**Concurrency** (lines 15–17): `group: pages, cancel-in-progress: false`. At most one deploy runs and one waits. A newer waiting run replaces an older waiting one (which shows as "cancelled"), so the latest commit always ends up live.

Together with git's fast-forward rule (Stop 9) and skyview waiting for green, that makes three layers that keep writes in a single line and deploys in order.

**Pages settings:** the source is "GitHub Actions", and the custom domain `lucaschenphoto.com` is set in Settings → Pages. The old `gh-pages` branch and `npm run deploy` are gone. The old setup is what once deleted the domain's CNAME file and took the site offline.

</details>

### Stop 11: Playwright tests

A suite of 22 browser tests drives skyview the way you would (sign in, drag, preview, publish) and replays every failure scenario: a hand edit mid-draft, a broken build, a revoked token, a push that races a publish. It runs against a fake GitHub, so it's safe to run any time with `npm run test:e2e`.

<details>
<summary><b>Details:</b> the fake GitHub, minted sessions and network stubs</summary>

The full guide, written for learning Playwright, is [e2e/README.md](e2e/README.md). The three tricks:

- **A fake GitHub** ([e2e/fake-github.mjs](e2e/fake-github.mjs)): an in-memory Node server implementing exactly the endpoints in Stop 3, Stop 4 and Stop 9, including real git-style blob shas and the fast-forward rule. [playwright.config.mjs](playwright.config.mjs) starts skyview with `GITHUB_API_URL` pointing at it and a fake token, so the real repo is unreachable. Tests change the fake directly, for example with `github.pushCommit(...)` or `github.revokeToken()`.
- **Minted sessions** ([e2e/fixtures.mjs#L59-L67](e2e/fixtures.mjs#L59-L67)): instead of logging in to GitHub, the fixture creates the session cookie with Auth.js's own `encode()` and the test `AUTH_SECRET`. The app contains no test backdoor.
- **No internet** ([e2e/fixtures.mjs#L40-L54](e2e/fixtures.mjs#L40-L54)): `context.route` answers every outside request. Cloudinary images become a 1x1 PNG, the Media Library script becomes a stub that "picks" whatever the test chose, and fonts are blocked.

</details>

### Further reading

- [ARCHITECTURE.md](ARCHITECTURE.md): the reference version of this tour, covering every rule, failure mode and setting.
- [BUILD.md](BUILD.md): how skyview was built, step by step.
- [e2e/README.md](e2e/README.md): Playwright, explained through this suite.
- [../CLAUDELOG.md](../CLAUDELOG.md): the story of the build sessions, including what went wrong and why.
