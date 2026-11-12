// Client-safe helpers for the registry shape used by the editor.
//
// Editor state per file: { array: bool, groups: { [groupKey]: [{ id, item }] } }.
// `item` is the original JSON object, untouched, so fields the editor doesn't show
// survive. `id` is editor-only and never written back.

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;

// A flat array (portfolio.json) is edited as one group with this key.
export const FLAT_GROUP = "_";

export function toEditable(data) {
  const array = Array.isArray(data);
  const raw = array ? { [FLAT_GROUP]: data } : data;
  const groups = Object.fromEntries(
    Object.entries(raw).map(([key, items]) => [
      key,
      items.map((item) => ({ id: crypto.randomUUID(), item })),
    ]),
  );
  return { array, groups };
}

export function fromEditable({ array, groups }) {
  const raw = Object.fromEntries(
    Object.entries(groups).map(([key, entries]) => [key, entries.map((e) => e.item)]),
  );
  return array ? raw[FLAT_GROUP] : raw;
}

// Groups whose entries are projects ({title, url, ref, description}) instead of
// photos ({url, source}). Like the section keys, this mirrors the site's code.
const PROJECT_GROUPS = { published: ["projects"] };
export const isProjectGroup = (fileKey, group) => PROJECT_GROUPS[fileKey]?.includes(group) ?? false;

// Project fields as the editor labels them. `title` and `ref` are required for the
// project to show properly on the site.
export const PROJECT_FIELDS = [
  ["title", "title"],
  ["ref", "link"],
  ["description", "subtitle"],
];
export const isIncompleteProject = (item) => !item.title?.trim() || !item.ref?.trim();

// An item in the shape its group needs, so a photo dragged or added into a project
// group becomes a project the site can render, and back. The link carries across
// (`source` ↔ `ref`); title and subtitle don't, since photo groups have no place for them.
// Key order matches the repo's JSON, so untouched entries never show in a diff.
export function shapeFor(project, item) {
  const isProject = "title" in item;
  if (project && !isProject) return { title: "", url: item.url, ref: item.source ?? "", description: "" };
  if (!project && isProject) return { url: item.url, source: item.ref ?? "" };
  return item;
}

// A new registry entry for a photo picked from Cloudinary.
export const newEntry = (publicId, project = false) => ({
  id: crypto.randomUUID(),
  item: shapeFor(project, { url: publicId, source: "" }),
});

export const sameData = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function thumbUrl(publicId, size = 200) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,g_auto,w_${size},h_${size},f_auto,q_auto/${publicId}`;
}
