// Anyone can tour skyview as a visitor; only the allowed GitHub account can publish.
import { test, expect } from "./fixtures.mjs";
import { dragPhoto, openEditor, openPreview, photoOrder } from "./helpers.mjs";

test("visitor: tours the editor with a notice, and no Add or Publish", async ({ anonPage }) => {
  await openEditor(anonPage);
  await expect(anonPage.locator(".notice.visitor")).toBeVisible();
  await expect(anonPage.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
  await expect(anonPage.locator(".status")).toContainText("Live = v2 HEAD");
  await expect(anonPage.getByRole("button", { name: /Add photos/ })).toHaveCount(0);

  // Editing and the preview work as for the owner; publishing doesn't.
  const [first, second] = await photoOrder(anonPage, "portfolio");
  await dragPhoto(anonPage, first, second);
  await openPreview(anonPage);
  await expect(anonPage.getByText("Visitors can't publish.")).toBeVisible();
  await expect(anonPage.getByRole("button", { name: "Publish" })).toHaveCount(0);
});

test("visitor: owner-only API routes answer 401", async ({ anonPage, github }) => {
  // page.request sends HTTP requests directly (no browser UI), sharing the page's
  // cookies. Here there are none, so the server must refuse.
  for (const path of ["/api/me", "/api/registry"]) {
    expect((await anonPage.request.get(path)).status(), path).toBe(401);
  }
  const publish = await anonPage.request.post("/api/publish", { data: { files: {} } });
  expect(publish.status()).toBe(401);
  expect((await anonPage.request.get("/api/status")).status()).toBe(200);

  // And nothing was written to GitHub on behalf of the visitor.
  expect(github.requests.filter((r) => !r.startsWith("GET"))).toEqual([]);
});

test("visitor: status reads are shared, not one GitHub call per request", async ({ anonPage, github }) => {
  await anonPage.request.get("/api/status"); // fills the cache if an earlier test hasn't
  const before = github.requests.length;
  for (let i = 0; i < 5; i++) expect((await anonPage.request.get("/api/status")).status()).toBe(200);
  expect(github.requests.length).toBe(before);
});

test("denied sign-in: access denied, and the button returns home", async ({ anonPage }) => {
  // Where Auth.js redirects when the signIn callback rejects a GitHub account.
  await anonPage.goto("/api/auth/error?error=AccessDenied");
  await expect(anonPage).toHaveURL(/\/auth-error\?error=AccessDenied$/);
  await expect(anonPage.getByText("Access denied.")).toBeVisible();
  await anonPage.getByRole("button", { name: "Return to skyview home" }).click();
  await expect(anonPage).toHaveURL(/:\d+\/\??$/);
  await expect(anonPage.locator(".notice.visitor")).toBeVisible();
});

test("Auth.js's built-in sign-in page is never shown", async ({ anonPage }) => {
  await anonPage.goto("/api/auth/signin");
  await expect(anonPage).toHaveURL(/:\d+\/$/);
  await expect(anonPage.locator(".notice.visitor")).toBeVisible();
});

test("owner: the editor loads with the deploy status", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".status")).toContainText("Live = v2 HEAD");
  await expect(page.getByText("Test Lucas")).toBeVisible();
  await expect(page.locator(".notice.visitor")).toHaveCount(0);
});
