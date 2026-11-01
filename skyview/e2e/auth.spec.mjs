// Only the allowed GitHub account can see or change anything.
import { test, expect } from "./fixtures.mjs";

test("signed out: only the sign-in button is shown", async ({ anonPage }) => {
  await anonPage.goto("/");
  await expect(anonPage.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
  await expect(anonPage.locator(".card")).toHaveCount(0);
});

test("signed out: every API route answers 401", async ({ anonPage, github }) => {
  // page.request sends HTTP requests directly (no browser UI), sharing the page's
  // cookies. Here there are none, so the server must refuse.
  for (const path of ["/api/me", "/api/registry", "/api/status"]) {
    expect((await anonPage.request.get(path)).status(), path).toBe(401);
  }
  const publish = await anonPage.request.post("/api/publish", { data: { files: {} } });
  expect(publish.status()).toBe(401);

  // And nothing reached GitHub on behalf of the anonymous requests.
  expect(github.requests.filter((r) => !r.startsWith("GET"))).toEqual([]);
});

test("signed in: the editor loads with the deploy status", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".status")).toContainText("Live = v2 HEAD");
  await expect(page.getByText("Test Lucas")).toBeVisible();
});
