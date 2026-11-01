// What changed between the registry at HEAD and the draft, per file and group.
// Photos are identified by public ID (`url`) within a file.
//
// Change types: added, removed, moved (to another group), reordered (within its
// group), source (the `source` field changed).

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
      changes.push(from !== undefined ? { type: "moved", group: g, url: item.url, from } : { type: "added", group: g, url: item.url });
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

    for (const item of kept) {
      const was = oldItems.find((i) => i.url === item.url);
      if ((was.source ?? "") !== (item.source ?? "")) {
        changes.push({ type: "source", group: g, url: item.url, before: was.source ?? "", after: item.source ?? "" });
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
  switch (c.type) {
    case "added": return `${where}: added ${c.url}`;
    case "removed": return `${where}: removed ${c.url}`;
    case "moved": return `${where}: moved ${c.url} from ${c.from || file}`;
    case "reordered": return `${where}: moved ${c.url} to position ${c.position}`;
    case "source": return `${where}: ${c.url} source "${c.before}" → "${c.after}"`;
  }
}
