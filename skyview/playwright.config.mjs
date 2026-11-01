// Playwright configuration for skyview's end-to-end tests (e2e/*.spec.mjs).
// Run with `npm run test:e2e`; see e2e/README.md for how the suite works.
import { defineConfig, devices } from "@playwright/test";

// Values shared by the config, the fixtures and the tests. None of them are real
// secrets: the test server only ever talks to the fake GitHub on fakeGitHubPort.
export const E2E = {
  port: 3200,
  baseURL: "http://localhost:3200",
  fakeGitHubPort: 4010,
  githubId: "4242", // the "allowed" GitHub user in tests
  authSecret: "e2e-only-auth-secret-not-used-anywhere-else",
};

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.mjs",

  // All tests share one skyview server and one fake GitHub, so run them one at a time.
  workers: 1,
  fullyParallel: false,

  // Fail if someone leaves a `test.only` in, and retry once on CI where timing varies.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  // "list" prints each test as it runs; "html" writes a browsable report to
  // playwright-report/ (open it with `npx playwright show-report`).
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: E2E.baseURL,
    // On failure, keep a trace: a step-by-step recording with DOM snapshots,
    // network and console. View it with `npx playwright show-trace <file>`.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Playwright starts skyview before the tests and stops it afterwards. It's a
  // production build, as on Vercel, but every external dependency is swapped out:
  webServer: {
    command: `npm run build && npx next start -p ${E2E.port}`,
    url: E2E.baseURL,
    timeout: 240_000,
    // Never reuse a server that happens to be running: it could have real credentials.
    reuseExistingServer: false,
    // These override skyview/.env.local (real env vars win over .env files in Next).
    env: {
      GITHUB_API_URL: `http://localhost:${E2E.fakeGitHubPort}`,
      GITHUB_REPO_TOKEN: "e2e-fake-token", // must match TOKEN in e2e/fake-github.mjs
      ALLOWED_GITHUB_ID: E2E.githubId,
      AUTH_SECRET: E2E.authSecret,
      AUTH_TRUST_HOST: "true",
      AUTH_GITHUB_ID: "e2e-unused",
      AUTH_GITHUB_SECRET: "e2e-unused",
      NEXT_PUBLIC_CLOUDINARY_CLOUD: "dch9wtpmk",
    },
  },
});
