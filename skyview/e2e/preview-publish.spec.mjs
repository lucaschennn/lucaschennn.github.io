// The happy path: edit, preview the real site with the draft, publish one commit.
import { test, expect } from "./fixtures.mjs";
import { PORTFOLIO, dragPhoto, openEditor, openPreview, publish, refreshStatus } from "./helpers.mjs";

test("the preview renders the site's own code with the draft", async ({ page, github }) => {
  await openEditor(page);
  const urls = github.json(PORTFOLIO).map((item) => item.url);
  await dragPhoto(page, urls[3], urls[0]); // move the 4th photo to the front

  await openPreview(page);

  // frameLocator() reaches inside the <iframe>. Everything after it is looked up
  // in the preview document, i.e. the actual portfolio site.
  const site = page.frameLocator('iframe[title="Site preview"]');
  const photos = site.locator("#portfolio .image-wrapper img");
  await expect(photos).toHaveCount(urls.length);
  // The first <img> in the site's portfolio is the first JSON entry.
  await expect(photos.first()).toHaveAttribute("src", new RegExp(urls[3]));

  // The phone width switches the site to its 2-column masonry layout.
  await page.getByRole("button", { name: "Phone 390" }).click();
  await expect(page.locator("iframe")).toHaveCSS("width", "390px");
});

test("publish: one commit to v2 with exactly the edited file", async ({ page, github }) => {
  await openEditor(page);
  const before = github.json(PORTFOLIO);
  const urls = before.map((item) => item.url);
  const startHead = github.head;

  await dragPhoto(page, urls[3], urls[0]);
  await openPreview(page);
  await expect(page.locator(".diff li")).toHaveText([`portfolio: moved ${urls[3]} to position 1`]);

  // Publish stays disabled until the confirmation is ticked.
  await expect(page.getByRole("button", { name: "Publish" })).toBeDisabled();
  await publish(page);
  await expect(page.getByText(/Published .* to v2/)).toBeVisible();

  // Now check the fake repo: one new commit on top of the old HEAD...
  const commit = github.headCommit();
  expect(commit.parents).toEqual([startHead]);
  expect(commit.author.name).toBe("skyview");
  expect(commit.message).toContain("skyview: update portfolio");
  expect(commit.message).toContain(`moved ${urls[3]} to position 1`);

  // ...with the new order, formatted exactly like the repo's files (4 spaces, no
  // trailing newline), and the other files untouched.
  const after = [before[3], ...before.filter((_, i) => i !== 3)];
  expect(github.file(PORTFOLIO)).toBe(JSON.stringify(after, null, 4));
  for (const path of ["src/assets/published.json", "src/assets/galleries.json"]) {
    expect(github.file(path)).toBe(github.file(path, startHead));
  }

  // Until the Action deploys it, the status shows the push as pending.
  await refreshStatus(page);
  await expect(page.locator(".status")).toContainText("waiting for the deploy");
  github.deployHead();
  await refreshStatus(page);
  await expect(page.locator(".status")).toContainText("Live site is on v2 HEAD");
});

test("no edits: the preview says there's nothing to publish", async ({ page }) => {
  await openEditor(page);
  await openPreview(page);
  await expect(page.getByText("No changes. Nothing to publish.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toHaveCount(0);
});
