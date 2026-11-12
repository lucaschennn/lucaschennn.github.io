// What changed between the registry at HEAD and the draft, per file and group.
// Photos are identified by public ID (`url`) within a file.
//
// Change types: added, removed, moved (to another group), reordered (within its
// group), edited (a text field changed: `source` on photos; title, link or subtitle
// on projects).

import { PROJECT_FIELDS } from "./registry.js";

const LABELS = Object.fromEntries(PROJECT_FIELDS);

const asGroups = (data) => (Array.isArray(data) ? { "": data } : data);

// Indices (into `seq`) of a longest increasing subsequence. Items outside it are the
// fewest that must have moved to turn the old order into the new one.
function lisIndices(seq) {
  const len = seq.map(() => 1);
  const prev = seq.map(() => -1);
  for (let i = 0; i < seq.length; i++) {
    for (let j = 0; j < i; j++) {
      if (seq[j] < seq[i] && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
  }
  let end = len.indexOf(Math.max(0, ...len));
  const keep = new Set();
  while (end !== -1) {
    keep.add(end);
    end = prev[end];
  }
  return keep;
}

function diffFile(before, after) {
  const old = asGroups(before);
  const now = asGroups(after);
  const changes = [];
  const groups = [...new Set([...Object.keys(old), ...Object.keys(now)])];
  const urlsIn = (g, src) => new Set((src[g] ?? []).map((i) => i.url));

  for (const g of groups) {
    const oldItems = old[g] ?? [];
    const newItems = now[g] ?? [];
    const oldUrls = urlsIn(g, old);
    const newUrls = urlsIn(g, now);

    for (const item of newItems) {
      if (oldUrls.has(item.url)) continue;
      const from = groups.find((h) => h !== g && urlsIn(h, old).has(item.url) && !urlsIn(h, now).has(item.url));
      const change = from !== undefined ? { type: "moved", group: g, url: item.url, from } : { type: "added", group: g, url: item.url };
      // New to this group, so its fields aren't compared; name a project by its title instead.
      if (item.title) change.title = item.title;
      changes.push(change);
    }
    for (const item of oldItems) {
      if (newUrls.has(item.url)) continue;
      const movedTo = groups.some((h) => h !== g && urlsIn(h, now).has(item.url) && !urlsIn(h, old).has(item.url));
      if (!movedTo) changes.push({ type: "removed", group: g, url: item.url });
    }

    // Reordering among photos that are in this group both before and after.
    const kept = newItems.filter((i) => oldUrls.has(i.url));
    const oldIndex = new Map(oldItems.map((i, idx) => [i.url, idx]));
    const keep = lisIndices(kept.map((i) => oldIndex.get(i.url)));
    kept.forEach((item, idx) => {
      if (!keep.has(idx)) changes.push({ type: "reordered", group: g, url: item.url, position: newItems.indexOf(item) + 1 });
    });

    // Every field but the public ID, so project edits count as changes too.
    for (const item of kept) {
      const was = oldItems.find((i) => i.url === item.url);
      const fields = [...new Set([...Object.keys(was), ...Object.keys(item)])].filter((f) => f !== "url");
      for (const field of fields) {
        const before = was[field] ?? "";
        const after = item[field] ?? "";
        if (before !== after) changes.push({ type: "edited", group: g, url: item.url, field, before, after });
      }
    }
  }
  return changes;
}

// before/after: { portfolio, published, galleries }. Returns { [file]: changes[] } for changed files.
export function diffRegistry(before, after) {
  return Object.fromEntries(
    Object.keys(after)
      .map((k) => [k, diffFile(before[k], after[k])])
      .filter(([, changes]) => changes.length),
  );
}

// One line per change, for the UI and the commit message.
export function describe(file, c) {
  const where = c.group ? `${file}/${c.group}` : file;
  const named = c.title ? ` ("${c.title}")` : "";
  switch (c.type) {
    case "added": return `${where}: added ${c.url}${named}`;
    case "removed": return `${where}: removed ${c.url}`;
    case "moved": return `${where}: moved ${c.url}${named} from ${c.from || file}`;
    case "reordered": return `${where}: moved ${c.url} to position ${c.position}`;
    case "edited": return `${where}: ${c.url} ${LABELS[c.field] ?? c.field} "${c.before}" → "${c.after}"`;
  }
}
