# Claude session log: building skyview

Sessions on 2026-10-30 and 2026-10-31. Lucas and Claude (Claude Code, mostly Opus 5.5, with a few Sonnet and Haiku turns) designed and built **skyview**: a private admin tool for rearranging the photos on lucaschenphoto.com and publishing the change. Lucas did the accounts, settings, merges and validation; Claude wrote the code on `skyview/<step>` branches.

**Outcome:** skyview is live on Vercel. The first real publish was `082ec9e` ("skyview: update portfolio"). The site deploys only through a GitHub Action, and a 19-test Playwright suite checks every failure mode against a fake GitHub. Current design: [skyview/ARCHITECTURE.md](skyview/ARCHITECTURE.md). Step-by-step history: [skyview/BUILD.md](skyview/BUILD.md).

## How it went

| Phase | What happened |
| --- | --- |
| Brainstorm | Looked for anything ready-made in the Cloudinary docs. Nothing does "arrange and publish". The Media Library widget, Upload Widget and Admin/Search APIs are building blocks. The asset-management MCP server and MediaFlows are for agents and automation, not this. |
| Design | The repo's three JSON files are the registry. Publishing is a git commit, deploys go through a GitHub Action, and the preview is the real site rendered with the draft. Wrote ARCHITECTURE.md, then BUILD.md: a plan of steps for Lucas and Claude, each ending in a check. |
| Phase 1 | Refactored the site to take the registry as props. Added the deploy workflow and `/version.txt`, switched Pages to GitHub Actions, removed `npm run deploy`, untracked `dist/`. |
| Phase 2 | Lucas set up the OAuth apps, the token and Vercel. Claude scaffolded Next.js 16 with Auth.js sign-in limited to one account. |
| Phase 3 | Status bar, then editor grid (dnd-kit), adding photos (Media Library widget), preview (iframe), and finally diff and publish. |
| Phase 4 | Failure-mode drills, then a Playwright e2e suite that automates them. |

## Key decisions and why

- **The JSON files stay the source of truth, with their schemas unchanged.** skyview adapts to them. Git history is the undo button and audit trail, and Cloudinary only holds the pixels. `caption` was renamed to `source`; nothing rendered it.
- **`v2` is production.** Every push to `v2` deploys, with no path filter. Work in progress goes on branches. That way "what's on `v2`" and "what's live" can only differ while a deploy is running or after one fails.
- **"What's deployed" comes from GitHub's deployments API,** once Pages deploys from Actions; each deployment's sha is the `v2` commit. Under the old `gh-pages` setup, deployment shas pointed at build-output commits, and the JSON was inlined into the JS bundle, so neither could be read back.
- **The preview is built inside skyview from the site's own `src/`,** using the root's Vite, React 18 and CSS (the CSS comes out byte-identical), and loaded in an iframe. It needed one small site change: components take the registry as props. Lucas wanted approval in skyview to be trustworthy for the real deploy, and running the site's actual code gives that.
- **Publish is blocked unless the live site equals `v2` HEAD** (Lucas's call). The server enforces it too. A publish can then only ship the photo edits, never undeployed code.
- **Publishing is one commit, guarded twice:** the server refuses if a registry file's blob sha changed since the draft was loaded (code-only commits don't block), and the branch is updated without force, so a racing push can't be overwritten.
- **Auth:** GitHub OAuth with the `read:user` scope only, an allowlist by numeric user ID re-checked on every route, and a *separate* fine-grained repo token for commits. A stolen session can at worst commit to one repo, which git can revert.
- **Adding photos uses the Media Library widget's own Cloudinary login,** so skyview never holds a Cloudinary secret.
- **Tests run against a fake GitHub, never the real one,** because the real drills push to `v2` and deploy the live site. Sessions are minted with Auth.js's own `encode()`, so the app has no test backdoor.

## Things discovered along the way

- **The custom domain broke on a deploy.** `gh-pages -d dist` replaced the branch and deleted the `CNAME` file, and lucaschenphoto.com returned 404. Fixed short-term with `public/CNAME`, then permanently by deploying through Actions with the domain set in the Pages settings.
- **The masonry layout fills columns in rotation:** photo *i* goes to column *i* mod *N*. Confirmed on the live site. `react-responsive-masonry`'s height balancing never took effect. So JSON order fully determines the layout, but it differs between phone and desktop widths.
- **Schema surprise:** `published.json`'s `projects` entries are `{title, url, ref, description}`, not `{url, source}`. skyview keeps unknown fields as they are and doesn't offer Add on projects.
- **Featured → projects drag crashed with "Maximum update depth exceeded".** Moving items between groups *during* the drag shifted the layout under the pointer, which made dnd-kit loop. Fixed by moving data only on drop.
- **The preview sometimes stayed blank.** The iframe sent "ready" before skyview was listening. Fixed by also sending on the iframe's `load` event, and skipping duplicate data.
- **Playwright clicked faster than dnd-kit allows.** After a drop, dnd-kit swallows clicks for 50ms. The test helper waits for the drag to visibly finish instead of sleeping.
- **`npx auth secret` opened a file in `skyview/`.** On Windows, cmd resolves `auth` to `.\auth.js`, because `.JS` is in `PATHEXT`. Running it from another folder works.
- **Next 16 allows only one `next dev` per project,** and generates `AGENTS.md` (committed, as it recommends).
- **Vercel's `vercel-build` script convention isn't documented for Next.js.** Replaced it with an explicit `buildCommand` in `skyview/vercel.json`.
- **Pushes went to `main` instead of `v2` twice,** which matters because Vercel and Pages build from `v2`. `main` is now stale; consider making `v2` the default branch.
- **The revoked-token drill found a real bug:** the main page crashed to Next's generic error. It now shows a clear message naming `GITHUB_REPO_TOKEN`.

## Concepts explained

- **OAuth sign-in:** the OAuth app is only a registration (client ID, secret, callback), not something embedded in skyview. The browser goes to github.com, comes back with a one-time `code`, and skyview's server exchanges code plus secret for an identity.
- **Why the client secret exists:** the code travels through the browser and can leak. Only the holder of the secret can turn it into a token. PKCE (which Auth.js uses for GitHub, instead of `state`) adds a per-login proof that ties the code to the browser that started the login.
- **Blob shas:** git's hash of a file's exact contents. Drafts record the shas of the files they were based on, which is how skyview knows whether a draft is still valid on a newer HEAD.
- **The three concurrency layers:** git only accepts fast-forwards (for writes). The workflow's `concurrency` group allows one running and one pending deploy, with a newer pending run replacing an older one (for deploys). skyview waits for the previous deploy before allowing a publish.
- **The iframe handshake:** the preview page renders nothing until its same-origin parent sends registry data with `postMessage`. That's why opening `/preview/index.html` directly shows a blank page.
- **`${{ steps.deployment.outputs.page_url }}`:** an Actions expression that reads the `deploy-pages` step's output. It's the "View deployment" link, and later steps in the same job can read it.

## Corrections Claude made to its own earlier statements

- The Haiku turn's explanation of when the environment `url` is evaluated was muddled. GitHub reads it after the job finishes.
- Claude first said `state` blocks forged OAuth callbacks. For GitHub, Auth.js actually uses PKCE.
- Claude reported a commit sha (`5bf1c0e`) without checking it; the real one was `6874a7e`.
- Claude first said queued deploy runs "wait instead of cancelling". In fact, a newer pending run replaces an older pending one.
- Claude first assumed `vercel-build` was a documented Vercel convention. It isn't for Next.js, which is why `vercel.json` was added.
- Claude's first design for the diff showed live-vs-HEAD changes separately. It was simplified once publishing was gated on live = HEAD.

## Open items

- **Push and merge:** push local `v2`, which holds hardening, the e2e suite and `vercel.json`, and merge `skyview/docs`.
- **Branches:** decide what to do with `main`, and consider making `v2` the GitHub default branch.
- **Possible improvements:** see "Tech debt and possible improvements" in ARCHITECTURE.md. Candidates include editing project entries, merging stale drafts automatically, and saving new edits while a stale-draft notice is showing.
- **Housekeeping:** set a calendar reminder before `GITHUB_REPO_TOKEN` expires.
