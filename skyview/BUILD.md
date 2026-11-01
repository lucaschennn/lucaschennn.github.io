# skyview build plan

How to get from the design in [ARCHITECTURE.md](ARCHITECTURE.md) to a working skyview. Work alternates between **Lucas** (accounts, settings, merges, validation) and **Claude** (code). Each step ends with a check that must pass before the next step starts.

## For a fresh agent

1. Read [/CLAUDE.md](../CLAUDE.md), [ARCHITECTURE.md](ARCHITECTURE.md), and this file. Find the first unchecked step in **Progress**.
2. Rules:
   - **`v2` is production.** Once Phase 1 is done, every push to `v2` deploys. Claude works on a branch named `skyview/<step>`, and Lucas reviews and merges.
   - Claude does not push, merge, or change GitHub/Vercel/Cloudinary settings. Those are Lucas's steps.
   - Never commit secrets. They live only in Vercel env vars (and `skyview/.env.local` for local dev, which is gitignored).
   - When a step is done, tick it in **Progress** in the same branch.
3. If a step's check fails, stop and report rather than moving on.

## Progress

- [x] 0.1 Commit pending changes
- [x] 1.1 Site refactor: registry as props
- [x] 1.2 Deploy workflow
- [x] 1.3 Switch Pages to GitHub Actions
- [x] 1.4 Remove the manual deploy path
- [x] 2.1 Accounts and credentials
- [x] 2.2 Scaffold skyview with auth
- [x] 2.3 Vercel project
- [x] 3.1 Read path and status bar
- [x] 3.2 Editor grid
- [x] 3.3 Add photos (Media Library widget)
- [x] 3.4 Preview
- [x] 3.5 Diff and publish
- [ ] 4.1 Failure-mode drills

---

## Phase 0: clean slate

### 0.1 Commit pending changes (Lucas)
The working tree on `v2` has uncommitted changes from the design session: `caption` renamed to `source` in `src/assets/*.json`, `CLAUDE.md`, `vite.config.js` (skyview excluded from the dev server), `public/CNAME`, and `skyview/`. Ignore `dist/` (removed in 1.4).
- Run `npm run build` to check that the site still builds, then commit to `v2`.
- **Check:** `git status` is clean apart from `dist/`.

## Phase 1: `v2` becomes production

### 1.1 Site refactor: registry as props (Claude)
Branch `skyview/site-props`.
- `src/main.jsx` imports the three JSON files and renders `<App registry={{portfolio, published, galleries}} />`.
- `App` passes `registry.portfolio`, `registry.published`, and `registry.galleries` to `Portfolio`, `Published`, and `Gallery` as a `data` prop.
- The components stop importing the JSON (`portfolio.jsx:13`, `published.jsx:13`, `gallery.jsx:14`).
- No visual or behavioural change.
- **Check (Lucas):** `npm run dev` looks identical to the live site in all three sections, including the lightbox and prev/next. `npm run build` passes. Then merge to `v2` (and deploy by hand one last time with `npm run deploy`, since the workflow doesn't exist yet).

### 1.2 Deploy workflow (Claude)
Branch `skyview/deploy-action`. Add `.github/workflows/deploy.yml`:
- Triggers: `push` to `v2` (no path filter) and `workflow_dispatch`.
- Jobs: checkout, set up Node 20, `npm ci`, `npm run build`, `actions/upload-pages-artifact` (`dist`), `actions/deploy-pages`.
- `permissions: pages: write, id-token: write, contents: read`. Set `concurrency: { group: pages, cancel-in-progress: false }`.
- **Check:** the YAML is valid (Lucas reviews it). Do not merge until 1.3 is done.

### 1.3 Switch Pages to GitHub Actions (Lucas)
1. Repo **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Environments → github-pages → Deployment branches:** allow `v2`. The default only allows the default branch, which is `main`, so a deploy from `v2` would be rejected.
3. Merge `skyview/deploy-action` into `v2`.
4. **Settings → Pages:** confirm the custom domain is `lucaschenphoto.com` and that Enforce HTTPS is on.
- **Check:**
  - The Actions run is green.
  - https://lucaschenphoto.com loads.
  - `curl "https://api.github.com/repos/lucaschennn/lucaschennn.github.io/deployments?environment=github-pages&per_page=1"` returns a `sha` equal to `git rev-parse origin/v2`.

### 1.4 Remove the manual deploy path (Claude, then Lucas)
- Claude (branch `skyview/cleanup-deploy`): remove the `predeploy` and `deploy` scripts and the `gh-pages` devDependency, untrack `dist/` (`git rm -r --cached dist`), delete `public/CNAME`, and update the Commands section of `/CLAUDE.md`.
- Lucas: merge (this deploys through the action), then delete the remote `gh-pages` branch.
- **Check:** the site still loads on the custom domain, and the latest deployment `sha` matches `v2` HEAD.

## Phase 2: skyview skeleton

### 2.1 Accounts and credentials (Lucas)
Collect these. Values go into Vercel in 2.3 and into `skyview/.env.local`, never into git.
| Env var | How to get it |
| --- | --- |
| `ALLOWED_GITHUB_ID` | `curl https://api.github.com/users/lucaschennn`, the `id` field (numeric) |
| `GITHUB_REPO_TOKEN` | Fine-grained PAT: only `lucaschennn/lucaschennn.github.io`. Permissions: Contents read/write, Deployments read, Actions read. Set an expiry date and put a reminder in your calendar. |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | GitHub OAuth app. Callback `http://localhost:3000/api/auth/callback/github` for now. Add the Vercel URL in 2.3 (or create a second OAuth app for production). |
| `AUTH_SECRET` | `npx auth secret` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD` | `dch9wtpmk` |

- **Check:** all values are in hand. Sign in to Cloudinary to confirm the account.

### 2.2 Scaffold skyview with auth (Claude)
Branch `skyview/scaffold`. Inside `skyview/`:
- Next.js (App Router) with its own `package.json`, plus `.gitignore` covering `.env*.local`, `.next`, and `node_modules`.
- Auth.js with the GitHub provider. The `signIn` callback rejects any account whose numeric ID isn't `ALLOWED_GITHUB_ID`. Every route handler re-checks the session on the server.
- One protected page: "Hello, Lucas".
- `.env.example` lists the variables from 2.1.
- Confirm the main site's `npm run dev` and `npm run build` are unaffected.
- **Check (Lucas):** `cd skyview && npm run dev`. Your GitHub account gets in. A different GitHub account, or a temporarily wrong `ALLOWED_GITHUB_ID`, is rejected.

### 2.3 Vercel project (Lucas)
1. Import the repo into Vercel. Root Directory `skyview`, production branch `v2`.
2. Turn on **"Include files outside the root directory in the Build Step"** (needed for the preview in 3.4).
3. Add the env vars from 2.1 and add the production callback URL to the OAuth app.
4. Optionally, turn on Vercel Deployment Protection for preview deployments.
- **Check:** the production URL makes you sign in with GitHub, lets you in, and rejects any other account.

## Phase 3: features

Each step is a separate branch, merged by Lucas after the check. Merging to `v2` also redeploys skyview.

### 3.1 Read path and status bar (Claude)
- A server route reads the three files at `v2` HEAD (contents API) and the latest successful `github-pages` deployment (deployments API).
- The status bar shows: live = HEAD / deploying / last deploy failed (with a link to the run).
- **Check:** the status says "live = HEAD". Push a trivial commit to `v2` and watch it go to "deploying", then back to "live".

### 3.2 Editor grid (Claude)
- Tabs: Portfolio, Published, Galleries. Each tab has a section per group (flat arrays become one group). Thumbnails come from Cloudinary (`c_fill`, small width, `f_auto`, `q_auto`).
- dnd-kit: reorder, drag between groups (not special-cased), remove (off the site only), and edit `source` inline.
- Cancel discards all edits. The draft is saved to `localStorage`, keyed by the HEAD sha it was based on.
- **Check:** the order matches the live site. Edits survive a page reload. Cancel restores HEAD.

### 3.3 Add photos (Claude)
- An "Add" button in each group opens the Cloudinary Media Library widget (which has its own Cloudinary login) and appends the selected public IDs.
- **Check:** upload a test image to Cloudinary, add it to a group, and see its thumbnail.

### 3.4 Preview (Claude)
- `skyview/preview/`: a Vite entry that imports `../../src/App.jsx` and the site CSS, and renders `<App registry={...} />` from data it receives via `postMessage`.
- skyview's build runs the preview build into `skyview/public/preview/` before `next build`. The site's dependencies must be installed at the repo root in that build (e.g. `npm ci --prefix ..`), because `../../src` resolves packages from the root `node_modules`.
- **Final save** opens the preview in an iframe with the draft.
- **Check (Lucas):** with no edits, the preview is visually identical to the live site at desktop and phone widths. With edits, they show up.

### 3.5 Diff and publish (Claude)
- The diff lists added, removed, moved, and `source`-changed photos per group, compared to HEAD.
- A confirm checkbox enables **Publish**. On publish, the server re-reads HEAD:
  - If any of the three files changed since the draft was loaded, the publish is refused and the draft is kept.
  - Otherwise skyview makes one commit with all three files (git data API), authored by `skyview`, on top of HEAD.
- Publish is blocked while live ≠ HEAD (deploying or failed), in the UI and on the server. (Decided by Lucas.)
- **Check (Lucas):** publish a small reorder. The commit appears on `v2`, the action deploys it, the live site changes, and the status returns to "live = HEAD". Then `git revert` it and confirm the site goes back.

## Phase 4: hardening

### 4.1 Failure-mode drills (Lucas, Claude fixes anything that fails)
Run through each row of the Failure modes table in ARCHITECTURE.md:
Already done by Claude (no writes to the repo):
- [x] Stale base on publish: refused ("Changed on v2 since you loaded it"), nothing written. Tested against GitHub in 3.5.
- [x] Revoked token: every GitHub call fails with a 401 that says to rotate `GITHUB_REPO_TOKEN`. Found and fixed: the main page crashed with Next's generic error instead of showing this.
- [x] Deploy status states (live, pending, deploying, failed, cancelled): checked against simulated GitHub responses.
- [x] `npm run deploy`: "Missing script".

For Lucas, in the real app:
- [ ] Hand-edit a JSON file on `v2` mid-draft, then publish: refused, draft kept. After a reload, the stale-draft notice appears.
- [ ] Edit only code on `v2` mid-draft (e.g. a comment), wait for it to go live, then publish: succeeds.
- [ ] Optional: merge a deliberately broken build. Status shows "Last deploy failed", Publish is disabled, and the live site stays on the last good version. Revert to recover.
- **Check:** every row behaves as documented. Update ARCHITECTURE.md where reality differs.
