"use client";

import { useMemo, useState } from "react";
import { describe, diffRegistry } from "@/lib/diff";
import { isIncompleteProject, isProjectGroup } from "@/lib/registry";

const BLOCKED = {
  pending: "A push to v2 is waiting to deploy. Publish unlocks once it's live.",
  deploying: "A deploy is running. Publish unlocks once it's live.",
  failed: "The last deploy failed. Fix it (see the workflow run) before publishing.",
};

// Shown under the preview: what will change, a confirmation, and Publish.
// before/after: { portfolio, published, galleries } at HEAD and in the draft.
export default function PublishPanel({ before, after, blobShas, deploy, visitor, onPublished }) {
  const diff = useMemo(() => diffRegistry(before, after), [before, after]);
  const lines = Object.entries(diff).flatMap(([file, changes]) => changes.map((c) => describe(file, c)));
  // Projects the site would show without a title or link. A warning only: the preview shows them as they'll look.
  const incomplete = Object.entries(after).flatMap(([file, data]) =>
    Array.isArray(data) ? [] : Object.entries(data)
      .filter(([group]) => isProjectGroup(file, group))
      .flatMap(([, items]) => items.filter(isIncompleteProject).map((item) => item.url)),
  );
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const state = deploy.status?.state;
  const blocked = state && state !== "live" ? BLOCKED[state] : null;
  const canPublish = lines.length > 0 && confirmed && state === "live" && !busy;

  async function publish() {
    setBusy(true);
    setError(null);
    try {
      const files = Object.fromEntries(Object.keys(diff).map((k) => [k, after[k]]));
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseBlobShas: blobShas, files, summary: lines }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      onPublished(body);
    } catch (e) {
      setError(e.message);
      deploy.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="publish">
      <h3>Changes</h3>
      {lines.length ? (
        <ul className="diff">
          {lines.map((line) => <li key={line}>{line}</li>)}
        </ul>
      ) : (
        <p className="muted">No changes. Nothing to publish.</p>
      )}

      {lines.length > 0 && incomplete.length > 0 && (
        <p className="notice">
          {incomplete.length === 1 ? "A project is" : `${incomplete.length} projects are`} missing a title or link:{" "}
          {incomplete.join(", ")}.
        </p>
      )}
      {lines.length > 0 && visitor && (
        <p className="notice">Visitors can't publish.</p>
      )}
      {lines.length > 0 && !visitor && (
        <>
          {blocked && <p className="notice">{blocked}</p>}
          {error && <p className="notice error">Not published: {error}</p>}
          <label className="confirm">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            I've checked the preview at each width. Publish these changes to lucaschenphoto.com.
          </label>
          <button type="button" className="primary" onClick={publish} disabled={!canPublish}>
            {busy ? "Publishing…" : "Publish"}
          </button>
        </>
      )}
    </div>
  );
}
