// Editing in skyview: reorder, remove, edit source, add photos, drafts, cancel.
// Nothing here publishes; changes stay in the browser.
import { test, expect } from "./fixtures.mjs";
import { PORTFOLIO, dragPhoto, group, openEditor, photoOrder } from "./helpers.mjs";

test("shows the registry in the same order as v2", async ({ page, github }) => {
  await openEditor(page);
  const expected = github.json(PORTFOLIO).map((item) => item.url);
  expect(await photoOrder(page, "portfolio")).toEqual(expected);
});

test("drag to reorder; the draft survives a reload", async ({ page, github }) => {
  await openEditor(page);
  const [first, second, third] = github.json(PORTFOLIO).map((item) => item.url);

  await dragPhoto(page, first, third);
  // toEqual compares the arrays; expect.poll retries the function until it matches,
  // which covers the moment between the drop and React re-rendering.
  await expect.poll(() => photoOrder(page, "portfolio").then((o) => o.slice(0, 3))).toEqual([second, third, first]);
  await expect(page.getByText("Unpublished edits")).toBeVisible();

  await page.reload();
  await expect(page.locator(".card").first()).toBeVisible();
  expect((await photoOrder(page, "portfolio")).slice(0, 3)).toEqual([second, third, first]);
});

test("cancel discards all edits after confirming", async ({ page, github }) => {
  await openEditor(page);
  const original = github.json(PORTFOLIO).map((item) => item.url);
  await dragPhoto(page, original[0], original[2]);
  await expect(page.getByText("Unpublished edits")).toBeVisible();

  // window.confirm() opens a native dialog. Playwright dismisses dialogs by default,
  // so we register a handler that accepts it before clicking.
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByText("No edits")).toBeVisible();
  expect(await photoOrder(page, "portfolio")).toEqual(original);
});

test("remove a photo and edit a source", async ({ page, github }) => {
  await openEditor(page);
  const [first, second] = github.json(PORTFOLIO).map((item) => item.url);

  // Find the card that contains a given image, then the controls inside it.
  const card = (id) => page.locator(".card").filter({ has: page.getByAltText(id, { exact: true }) });
  await card(first).getByRole("button", { name: "×" }).click();
  await card(second).getByPlaceholder("source").fill("https://example.com/story");

  const order = await photoOrder(page, "portfolio");
  expect(order).not.toContain(first);
  await expect(card(second).getByPlaceholder("source")).toHaveValue("https://example.com/story");
});

test("add photos from the Media Library: new images appended, duplicates and videos skipped", async ({ page, github }) => {
  await openEditor(page);
  const existing = github.json(PORTFOLIO).map((item) => item.url);

  // The Media Library script is replaced by a stub (see fixtures.mjs). Its show()
  // "inserts" whatever is in window.__pickedAssets, so we set that first.
  await page.evaluate((dup) => {
    window.__pickedAssets = [
      { public_id: "new_photo_e2e", resource_type: "image" },
      { public_id: dup, resource_type: "image" },
      { public_id: "some_video", resource_type: "video" },
    ];
  }, existing[0]);

  const add = group(page, "portfolio").getByRole("button", { name: "+ Add photos" });
  await expect(add).toBeEnabled(); // enabled once the widget script has loaded
  await add.click();

  const order = await photoOrder(page, "portfolio");
  expect(order).toEqual([...existing, "new_photo_e2e"]);
});

test("project groups have no Add button", async ({ page }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Published" }).click();
  await expect(group(page, "featured").getByRole("button", { name: "+ Add photos" })).toBeVisible();
  await expect(group(page, "projects").getByRole("button", { name: "+ Add photos" })).toHaveCount(0);
});
