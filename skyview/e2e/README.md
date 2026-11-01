# skyview end-to-end tests

Playwright drives a real browser through skyview (sign-in, editing, preview, publish) and checks the failure-mode drills from [BUILD.md](../BUILD.md) step 4.1. The suite is safe to run at any time: it never talks to the real GitHub, Vercel or Cloudinary.

## Running

```sh
cd skyview
npm install                      # once; also needs the repo root's deps (npm install at the root)
npx playwright install chromium  # once: downloads the test browser
npm run test:e2e                 # build skyview, start it, run every test
```

Useful variations:

| Command | What it does |
| --- | --- |
| `npx playwright test --ui` | Interactive UI: pick tests, watch them run, step through each action. Best for learning. |
| `npx playwright test --headed` | Show the browser window while tests run. |
| `npx playwright test -g "revoked"` | Run only tests whose name matches. |
| `npx playwright test e2e/drills.spec.mjs` | Run one file. |
| `npx playwright show-report` | Open the HTML report from the last run (`playwright-report/`). |
| `npx playwright show-trace test-results/<test>/trace.zip` | Replay a failed test step by step, with DOM snapshots, network and console. |
| `npx playwright codegen localhost:3200` | Record clicks in a browser and get the matching test code (needs the server running). |

## How it works

```
 Playwright test process                       skyview (next start, port 3200)
 ┌───────────────────────────────┐   HTTP     ┌──────────────────────────────┐
 │ tests (*.spec.mjs)            │──browser──▶│ pages + /api routes          │
 │   │ change state directly     │            │   lib/github.js              │
 │   ▼                           │◀──HTTP─────│   GITHUB_API_URL=localhost:4010
 │ FakeGitHub (port 4010)        │            └──────────────────────────────┘
 └───────────────────────────────┘
```

1. **[playwright.config.mjs](../playwright.config.mjs)** builds skyview and starts it on port 3200 with test environment variables. They override `.env.local`, so the real token is never used. `GITHUB_API_URL` points skyview's server at the fake.
2. **[fake-github.mjs](fake-github.mjs)** is an in-memory GitHub. It implements only the endpoints skyview calls, starts from the real registry JSON, and records commits. Tests change it directly to set up situations: `github.pushCommit(...)` for a hand edit on v2, `github.startRun()` for a deploy in progress, `github.revokeToken()`, and so on.
3. **[fixtures.mjs](fixtures.mjs)** gives each test:
   - `github`: the fake, reset before every test.
   - `page`: a tab that is already signed in. Auth.js stores the session as an encrypted cookie; the fixture mints one with the test `AUTH_SECRET`, so there's no GitHub login and no test-only code in the app.
   - `anonPage`: a tab that isn't signed in.
   - In both, every request to the internet is intercepted with `context.route()`: Cloudinary images get a 1x1 PNG, the Media Library script is replaced by a stub that "picks" whatever the test sets in `window.__pickedAssets`, and everything else is blocked.
4. **[helpers.mjs](helpers.mjs)**: small steps like `dragPhoto`, `openPreview` and `publish`, so tests read like instructions.

## The tests

| File | Covers |
| --- | --- |
| [auth.spec.mjs](auth.spec.mjs) | Signed out sees only the sign-in button; every API route returns 401; signed in sees the editor. |
| [editor.spec.mjs](editor.spec.mjs) | Order matches v2; drag to reorder; draft survives reload; cancel; remove; edit source; add photos (duplicates and videos skipped); no Add on projects. |
| [preview-publish.spec.mjs](preview-publish.spec.mjs) | Preview renders the site's own code with the draft; publish makes one commit with exactly the edited file, formatted like the repo; status goes pending → live. |
| [drills.spec.mjs](drills.spec.mjs) | JSON hand-edited mid-draft (refused, draft kept); code-only change mid-draft (succeeds); deploy in progress and broken build (Publish disabled); the server enforces the deploy rule; a racing push (refused); revoked token (clear message). |

## Playwright ideas used here

- **Locators** (`page.getByRole`, `getByAltText`, `getByLabel`, `locator(css)`) describe how to find elements and are re-evaluated on every use. Prefer role/label/text locators: they match what a person sees.
- **Auto-waiting assertions**: `await expect(locator).toBeVisible()` retries until it passes or times out (5s), so tests don't need sleeps. `expect.poll(fn)` does the same for any value.
- **Fixtures** (`test.extend`) build per-test setup that tests request by name. Worker-scoped fixtures (`{ scope: "worker" }`) are shared across tests.
- **Network interception** (`context.route`) fulfills or aborts any request from the browser, including inside iframes.
- **`frameLocator`** reaches inside an `<iframe>` (the site preview).
- **Real input**: `page.mouse.down/move/up` produces genuine pointer events, which drag-and-drop libraries need.
- **Dialogs**: `page.once("dialog", d => d.accept())` answers `window.confirm()`.
- **`page.request`** sends API requests with the page's cookies, to test the server directly.

## Writing a new test

1. Import from the fixtures, not from `@playwright/test`: `import { test, expect } from "./fixtures.mjs";`
2. Set up the situation in `github` before or during the test.
3. Drive the UI the way a person would, then assert on both the page and `github` (for example `github.headCommit()` or `github.json(path)`).
4. If skyview starts calling a new GitHub endpoint, add it to `FakeGitHub.handle`. Unknown routes return a 404 that names the missing route.
