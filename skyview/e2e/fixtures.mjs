// Shared setup for every test, using Playwright "fixtures".
//
// A fixture is a value a test asks for by name in its arguments, e.g.
//   test("…", async ({ page, github }) => { … })
// Playwright creates it before the test and cleans it up after. `page` is built in;
// below we add our own and change how `page` behaves:
//
//   github     the FakeGitHub skyview's server talks to (state reset for every test)
//   page       a browser tab that is already signed in to skyview, with all
//              internet access replaced by stubs (see `blockTheInternet`)
//   anonPage   the same, but not signed in
//
// Tests import { test, expect } from this file instead of from "@playwright/test".

import { test as base, expect } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { FakeGitHub } from "./fake-github.mjs";
import { E2E } from "../playwright.config.mjs";

// Smallest valid PNG (1x1, grey). Stands in for every Cloudinary image.
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

// Replaces the Cloudinary Media Library script. createMediaLibrary() returns a widget
// whose show() immediately "inserts" whatever the test put in window.__pickedAssets.
const MEDIA_LIBRARY_STUB = `
  window.cloudinary = {
    createMediaLibrary(options, { insertHandler }) {
      return { show() { insertHandler({ assets: window.__pickedAssets ?? [] }); } };
    },
  };
`;

// Every request the browser makes to anything other than skyview itself is handled
// here: Cloudinary images get the 1x1 PNG, the Media Library script gets the stub,
// and everything else (fonts, Font Awesome) is aborted. Tests then don't depend on
// the internet and never touch real services.
async function blockTheInternet(context) {
  await context.route(
    (url) => url.hostname !== "localhost",
    (route) => {
      const url = route.request().url();
      if (url.startsWith("https://res.cloudinary.com/")) {
        return route.fulfill({ contentType: "image/png", body: PIXEL });
      }
      if (url.startsWith("https://media-library.cloudinary.com/")) {
        return route.fulfill({ contentType: "text/javascript", body: MEDIA_LIBRARY_STUB });
      }
      return route.abort();
    },
  );
}

// skyview's session is a cookie holding an encrypted JWT (Auth.js). Instead of going
// through GitHub's login, we mint that cookie ourselves with the same secret the test
// server uses. The app is unchanged: it decrypts the cookie and sees the allowed user.
async function signIn(context) {
  const name = "authjs.session-token"; // the cookie name on http://localhost
  const value = await encode({
    token: { name: "Test Lucas", sub: E2E.githubId, githubId: E2E.githubId },
    secret: E2E.authSecret,
    salt: name,
  });
  await context.addCookies([{ name, value, url: E2E.baseURL, httpOnly: true, sameSite: "Lax" }]);
}

export const test = base.extend({
  // Worker-scoped: one fake server for the whole run (the skyview server is shared
  // too, so tests run one at a time; see `workers: 1` in the config).
  fakeServer: [
    async ({}, use) => {
      const fake = new FakeGitHub();
      await fake.listen(E2E.fakeGitHubPort);
      await use(fake);
      await fake.close();
    },
    { scope: "worker" },
  ],

  // Test-scoped: the same server, reset to the starting state before each test.
  github: async ({ fakeServer }, use) => {
    fakeServer.reset();
    await use(fakeServer);
  },

  // Overrides the built-in `context` so every page in it is offline and signed in.
  // Depending on `github` makes sure the fake is reset before the browser starts.
  context: async ({ context, github }, use) => {
    await blockTheInternet(context);
    await signIn(context);
    await use(context);
  },

  anonPage: async ({ browser, github }, use) => {
    const context = await browser.newContext({ baseURL: E2E.baseURL });
    await blockTheInternet(context);
    await use(await context.newPage());
    await context.close();
  },
});

export { expect };
