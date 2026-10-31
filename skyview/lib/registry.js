// Client-safe helpers for the registry shape used by the editor.
//
// Editor state per file: { array: bool, groups: { [groupKey]: [{ id, item }] } }.
// `item` is the original JSON object, untouched, so unknown fields (e.g. project
// title/ref/description) survive. `id` is editor-only and never written back.

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

export const sameData = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function thumbUrl(publicId, size = 200) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,g_auto,w_${size},h_${size},f_auto,q_auto/${publicId}`;
}
