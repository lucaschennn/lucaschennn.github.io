"use client";

import { useEffect, useMemo, useState } from "react";
import { fromEditable, sameData, toEditable } from "@/lib/registry";
import useDeployStatus from "@/lib/use-deploy-status";
import useMediaLibrary from "@/lib/use-media-library";
import FileBoard from "./file-board";
import Preview from "./preview";
import PublishPanel from "./publish-panel";
import StatusBar from "./status-bar";

const TABS = [
  ["portfolio", "Portfolio"],
  ["published", "Published"],
  ["galleries", "Galleries"],
];
const DRAFT_KEY = "skyview:draft";

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY));
  } catch {
    return null;
  }
}

function writeDraft(draft) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable (private window): edits still work, they just don't survive a reload.
  }
}

// files: { [key]: { path, blobSha, data } } as read at `head`.
export default function Editor({ head, files }) {
  const loaded = useMemo(
    () => Object.fromEntries(Object.entries(files).map(([k, f]) => [k, f.data])),
    [files],
  );
  const blobShas = useMemo(
    () => Object.fromEntries(Object.entries(files).map(([k, f]) => [k, f.blobSha])),
    [files],
  );

  const deploy = useDeployStatus();
  const picker = useMediaLibrary();
  const [tab, setTab] = useState("portfolio");
  const [state, setState] = useState(() =>
    Object.fromEntries(Object.entries(loaded).map(([k, data]) => [k, toEditable(data)])),
  );
  // A saved draft whose files have since changed on v2; kept until discarded.
  const [staleDraft, setStaleDraft] = useState(null);
  const [restored, setRestored] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [published, setPublished] = useState(null);

  // Restore a draft after mount (localStorage is browser-only). A draft is still
  // valid on a newer HEAD as long as none of the three files changed.
  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      if (sameData(draft.blobShas, blobShas)) {
        setState(Object.fromEntries(Object.entries(draft.files).map(([k, d]) => [k, toEditable(d)])));
      } else {
        setStaleDraft(draft);
      }
    }
    setRestored(true);
  }, [blobShas]);

  const current = useMemo(
    () => Object.fromEntries(Object.entries(state).map(([k, s]) => [k, fromEditable(s)])),
    [state],
  );
  const dirtyFiles = Object.keys(current).filter((k) => !sameData(current[k], loaded[k]));

  // Persist on every change, but never overwrite a stale draft the user hasn't dealt with yet.
  useEffect(() => {
    if (!restored || staleDraft) return;
    writeDraft(dirtyFiles.length ? { head, blobShas, files: current } : null);
  }, [current, restored, staleDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  function cancel() {
    if (!window.confirm("Discard all edits and go back to v2 HEAD?")) return;
    setState(Object.fromEntries(Object.entries(loaded).map(([k, data]) => [k, toEditable(data)])));
    writeDraft(null);
  }

  function discardStale() {
    if (!window.confirm("Discard the old draft? This can't be undone.")) return;
    writeDraft(null);
    setStaleDraft(null);
  }

  function handlePublished(result) {
    writeDraft(null);
    setPublished(result);
    deploy.refresh();
  }

  const statusBar = <StatusBar status={deploy.status} error={deploy.error} />;

  // Render only in the browser: item ids and dnd-kit's aria ids are generated client-side.
  if (!restored) return <>{statusBar}<p className="muted">Loading editor…</p></>;

  // After publishing, the loaded registry is out of date; reload to start from the new HEAD.
  if (published) {
    return (
      <>
        {statusBar}
        <div className="notice success">
          Published <a href={published.url} target="_blank" rel="noreferrer">{published.sha.slice(0, 7)}</a> to v2.
          The site deploys in about a minute; the status bar turns green when it's live.{" "}
          <button type="button" onClick={() => window.location.reload()}>Continue editing</button>
        </div>
      </>
    );
  }

  // The editor state stays in memory while previewing, so going back keeps everything.
  if (previewing) {
    return (
      <>
        {statusBar}
        <Preview registry={current} onClose={() => setPreviewing(false)}>
          <PublishPanel before={loaded} after={current} blobShas={blobShas} deploy={deploy} onPublished={handlePublished} />
        </Preview>
      </>
    );
  }

  return (
    <div className="editor">
      {statusBar}
      {staleDraft && (
        <div className="notice">
          A draft from {staleDraft.head.slice(0, 7)} can't be restored: the registry changed on v2
          since then. Redo the edits on the current version. New edits aren't saved until you discard it.{" "}
          <button type="button" onClick={discardStale}>Discard old draft</button>
        </div>
      )}

      <div className="toolbar">
        <nav className="tabs">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={key === tab ? "active" : ""}
              onClick={() => setTab(key)}
            >
              {label}
              {dirtyFiles.includes(key) && " •"}
            </button>
          ))}
        </nav>
        <div className="actions">
          {dirtyFiles.length ? <span>Unpublished edits</span> : <span className="muted">No edits</span>}
          <button type="button" onClick={cancel} disabled={!dirtyFiles.length}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={() => setPreviewing(true)}>
            Final save → preview
          </button>
        </div>
      </div>

      <FileBoard
        key={tab}
        fileKey={tab}
        groups={state[tab].groups}
        onChange={(next) =>
          setState((s) => ({
            ...s,
            [tab]: { ...s[tab], groups: typeof next === "function" ? next(s[tab].groups) : next },
          }))
        }
        picker={picker}
      />
      {picker.error && <p className="muted">{picker.error}</p>}
    </div>
  );
}
