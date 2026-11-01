// Small helpers so tests read like the steps you'd take by hand.
import { expect } from "@playwright/test";

export const PORTFOLIO = "src/assets/portfolio.json";

// Opens skyview and waits until the editor has rendered its photos.
export async function openEditor(page) {
  await page.goto("/");
  // A locator is a description of how to find an element, evaluated lazily.
  // expect(locator).toBeVisible() retries until it passes or times out (5s by
  // default), so there's no need for manual sleeps.
  await expect(page.locator(".card").first()).toBeVisible();
}

// The <section> for one group, found by its heading, e.g. group(page, "sports").
export function group(page, name) {
  return page.locator("section.group").filter({ has: page.getByRole("heading", { name: new RegExp(`^${name}\\b`) }) });
}

// Public IDs of the photos in a group, in order. The editor uses each photo's
// public ID as its <img alt>, which makes photos easy to find in tests.
export function photoOrder(page, name) {
  return group(page, name).locator(".card img").evaluateAll((imgs) => imgs.map((img) => img.alt));
}

// Drags one photo onto another using real mouse events. dnd-kit only starts a drag
// after the pointer has moved 5px with the button held, so we move in small steps
// rather than jumping straight to the target (which locator.dragTo() might do).
export async function dragPhoto(page, fromId, toId) {
  const from = await page.getByAltText(fromId, { exact: true }).boundingBox();
  const to = await page.getByAltText(toId, { exact: true }).boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 5 });
  await page.mouse.move(to.x + to.width / 4, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();
  // After a drop, dnd-kit swallows clicks for 50ms (so letting go doesn't also
  // "click" the photo), then animates the floating thumbnail into place. A person
  // never clicks that fast, but Playwright does, so wait until the drag has visibly
  // finished: the floating thumbnail (DragOverlay) is gone. This waits on a
  // condition instead of a fixed sleep, which keeps the test fast and reliable.
  await expect(page.locator(".thumb.overlay")).toHaveCount(0);
}

// The status bar polls every 15s and also refreshes when the window gains focus.
// Tests trigger that refresh instead of waiting.
export async function refreshStatus(page) {
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
}

// "Preview & publish", then the publish panel underneath the preview.
export async function openPreview(page) {
  await page.getByRole("button", { name: "Preview & publish" }).click();
  await expect(page.getByRole("heading", { name: "Changes" })).toBeVisible();
}

// Ticks the confirmation and clicks Publish.
export async function publish(page) {
  await page.getByLabel(/I've checked the preview/).check();
  await page.getByRole("button", { name: "Publish" }).click();
}
