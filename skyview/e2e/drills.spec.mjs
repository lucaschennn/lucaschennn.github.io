// The failure-mode drills from BUILD.md step 4.1 and the table in ARCHITECTURE.md.
// Each test sets up a situation in the fake GitHub, then checks skyview handles it
// the documented way. None of this touches the real repo.
import { test, expect } from "./fixtures.mjs";
import { PORTFOLIO, dragPhoto, openEditor, openPreview, publish, refreshStatus } from "./helpers.mjs";

// Makes one edit in the editor: moves the 2nd portfolio photo to the front.
async function makeAnEdit(page, github) {
  const urls = github.json(PORTFOLIO).map((item) => item.url);
  await dragPhoto(page, urls[1], urls[0]);
  await expect(page.getByText("Unpublished edits")).toBeVisible();
}

test("JSON hand-edited on v2 mid-draft: publish refused, draft kept", async ({ page, github }) => {
  await openEditor(page);
  await makeAnEdit(page, github);

  // Meanwhile, someone edits portfolio.json on v2 directly, and it deploys.
  const handEdited = github.json(PORTFOLIO).slice(1);
  const handEditHead = github.pushCommit({ [PORTFOLIO]: JSON.stringify(handEdited, null, 4) });

  await openPreview(page);
  await publish(page);
  await expect(page.getByText("Not published: Changed on v2 since you loaded it: portfolio.")).toBeVisible();
  expect(github.head).toBe(handEditHead); // nothing was committed on top

  // After a reload the old draft isn't applied to the new JSON; it's kept aside.
  await page.reload();
  await expect(page.getByText(/can't be restored: the registry changed on v2/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Discard old draft" })).toBeVisible();
});

test("only code changed on v2 mid-draft: publish succeeds on top of it", async ({ page, github }) => {
  await openEditor(page);
  await makeAnEdit(page, github);

  // A code-only commit lands and deploys while the draft is open.
  const codeHead = github.pushCommit({ "src/App.jsx": "// a code change\n" }, { message: "code change" });

  await openPreview(page);
  await publish(page);
  await expect(page.getByText(/Published .* to v2/)).toBeVisible();

  const commit = github.headCommit();
  expect(commit.parents).toEqual([codeHead]); // built on the code commit, not the old HEAD
  expect(github.file("src/App.jsx")).toBe("// a code change\n"); // code change kept
});

test("deploy in progress: Publish disabled until it's live", async ({ page, github }) => {
  github.pushCommit({ "src/App.jsx": "// deploying\n" }, { deploy: false });
  github.startRun();

  await openEditor(page);
  await expect(page.locator(".status")).toContainText("Deploying");
  await makeAnEdit(page, github);
  await openPreview(page);
  await page.getByLabel(/I've checked the preview/).check();
  await expect(page.getByText("A deploy is running.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeDisabled();

  // The deploy finishes; once the status refreshes, Publish unlocks.
  github.deployHead();
  await refreshStatus(page);
  await expect(page.getByRole("button", { name: "Publish" })).toBeEnabled();
});

test("broken build on v2: status shows the failure and Publish stays disabled", async ({ page, github }) => {
  const brokenHead = github.pushCommit({ "src/App.jsx": "syntax error(\n" }, { deploy: false });
  github.deploy(brokenHead, "failure");

  await openEditor(page);
  await expect(page.locator(".status")).toContainText("Last deploy failed");
  await expect(page.locator(".status").getByRole("link", { name: "workflow run" })).toHaveAttribute(
    "href",
    `https://fake/runs/${brokenHead}`,
  );
  await makeAnEdit(page, github);
  await openPreview(page);
  await page.getByLabel(/I've checked the preview/).check();
  await expect(page.getByText(/last deploy failed/i).last()).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeDisabled();
});

test("the server enforces the deploy rule too, not just the button", async ({ page, github }) => {
  await openEditor(page);
  const files = { portfolio: github.json(PORTFOLIO).reverse() };
  // The same hashes the editor would send: read them from skyview's registry API.
  const registry = await (await page.request.get("/api/registry")).json();
  const blobShas = Object.fromEntries(Object.entries(registry.files).map(([k, f]) => [k, f.blobSha]));

  // A deploy starts, then a publish request is sent straight to the API, bypassing the UI.
  github.pushCommit({ "src/App.jsx": "// deploying\n" }, { deploy: false });
  github.startRun();
  const res = await page.request.post("/api/publish", { data: { baseBlobShas: blobShas, files, summary: [] } });
  expect(res.status()).toBe(409);
  expect((await res.json()).reason).toBe("deploy");
});

test("someone pushes while skyview is publishing: refused, nothing overwritten", async ({ page, github }) => {
  await openEditor(page);
  await makeAnEdit(page, github);
  // The fake moves v2 in the instant before skyview updates the branch.
  github.raceNextRefUpdate = true;

  await openPreview(page);
  await publish(page);
  await expect(page.getByText(/Not published: v2 moved while publishing/)).toBeVisible();
  expect(github.headCommit().message).toBe("racing push"); // their push survived
});

test("revoked repo token: a clear message instead of a crash", async ({ page, github }) => {
  github.revokeToken();
  await page.goto("/");
  await expect(page.getByText("Can't read the registry from GitHub")).toBeVisible();
  await expect(page.getByText(/GITHUB_REPO_TOKEN is invalid, expired or revoked/)).toBeVisible();
});
