// Projects (published.json): title, link and subtitle are editable, show in the diff
// and the preview, and a photo moved into projects is published as a project.
import { test, expect } from "./fixtures.mjs";
import { dragPhoto, group, openEditor, openPreview, publish } from "./helpers.mjs";

const PUBLISHED = "src/assets/published.json";
const projectCard = (page, id) =>
  group(page, "projects").locator(".card").filter({ has: page.getByAltText(id, { exact: true }) });

test("edit a project: the diff and the preview show the new text", async ({ page, github }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Published" }).click();
  const [project] = github.json(PUBLISHED).projects;

  await projectCard(page, project.url).getByPlaceholder("title", { exact: true }).fill("Renamed project");
  await projectCard(page, project.url).getByPlaceholder("subtitle", { exact: true }).fill("Co-author");
  await openPreview(page);

  await expect(page.locator(".diff li")).toHaveText([
    `published/projects: ${project.url} title "${project.title}" → "Renamed project"`,
    `published/projects: ${project.url} subtitle "${project.description}" → "Co-author"`,
  ]);
  const site = page.frameLocator('iframe[title="Site preview"]');
  await expect(site.locator("#published .project-title").first()).toHaveText("Renamed project");
  await expect(site.locator("#published .project-subtitle").first()).toHaveText("Co-author");
  await expect(site.locator("#published a.project").first()).toHaveAttribute("href", project.ref);
});

test("a tear sheet moved into projects is published as a project", async ({ page, github }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Published" }).click();
  const before = github.json(PUBLISHED);
  const sheet = before.featured[0];

  await dragPhoto(page, sheet.url, before.projects[0].url);
  const card = projectCard(page, sheet.url);
  // Reshaped on drop: project fields instead of `source`, with the tear sheet's link kept.
  await expect(card.getByPlaceholder("link", { exact: true })).toHaveValue(sheet.source);
  await card.getByPlaceholder("title", { exact: true }).fill("Moved in");
  await card.getByPlaceholder("subtitle", { exact: true }).fill("Photographer");

  await openPreview(page);
  const site = page.frameLocator('iframe[title="Site preview"]');
  await expect(site.locator("#published .project-title", { hasText: "Moved in" })).toBeVisible();

  await publish(page);
  await expect(page.getByText(/Published .* to v2/)).toBeVisible();
  const { featured, projects } = github.json(PUBLISHED);
  expect(featured.map((i) => i.url)).not.toContain(sheet.url);
  expect(projects.find((p) => p.url === sheet.url)).toEqual({
    title: "Moved in",
    url: sheet.url,
    ref: sheet.source,
    description: "Photographer",
  });
});

test("projects missing a title or link get a warning before publishing", async ({ page, github }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Published" }).click();
  const [project] = github.json(PUBLISHED).projects;

  await projectCard(page, project.url).getByPlaceholder("link", { exact: true }).fill("");
  await openPreview(page);
  await expect(page.getByText(`A project is missing a title or link: ${project.url}.`)).toBeVisible();
});
