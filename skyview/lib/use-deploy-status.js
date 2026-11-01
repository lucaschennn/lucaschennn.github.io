"use client";

import { useCallback, useEffect, useState } from "react";

// Deploy status from /api/status, polled every pollMs and on window focus.
// refresh() forces a check (e.g. right after publishing).
export default function useDeployStatus(pollMs) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setStatus(body);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, pollMs);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, pollMs]);

  return { status, error, refresh };
}
