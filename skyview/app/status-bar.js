"use client";

import { useEffect, useState } from "react";

const POLL_MS = 15_000;
const short = (sha) => sha?.slice(0, 7) ?? "none";

const LABELS = {
  live: "Live = v2 HEAD",
  pending: "Pushed, waiting for the deploy to start",
  deploying: "Deploying",
  failed: "Last deploy failed",
};

export default function StatusBar() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
        setStatus(body);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    load();
    const timer = setInterval(load, POLL_MS);
    window.addEventListener("focus", load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, []);

  if (error) return <div className="status status-failed">Status unavailable: {error}</div>;
  if (!status) return <div className="status">Checking deploy status…</div>;

  return (
    <div className={`status status-${status.state}`}>
      <strong>{LABELS[status.state]}</strong>
      {" · "}HEAD {short(status.head)}
      {status.state !== "live" && <> · live {short(status.liveSha)}</>}
      {status.runUrl && status.state !== "live" && (
        <> · <a href={status.runUrl} target="_blank" rel="noreferrer">workflow run</a></>
      )}
      {status.liveUrl && (
        <> · <a href={status.liveUrl} target="_blank" rel="noreferrer">site</a></>
      )}
    </div>
  );
}
