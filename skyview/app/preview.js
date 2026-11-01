"use client";

import { useEffect, useRef, useState } from "react";

const WIDTHS = [
  ["Phone", 390],
  ["Tablet", 768],
  ["Desktop", 1280],
];

// The real site (built from ../src into /preview) in an iframe, rendered with
// `registry` ({ portfolio, published, galleries }). Data is sent when the iframe
// loads (its listener exists by then) and whenever it says it's ready, so neither
// side can miss the other.
export default function Preview({ registry, onClose, children }) {
  const frame = useRef(null);
  const registryRef = useRef(registry);
  const [width, setWidth] = useState(1280);
  const [error, setError] = useState(null);

  const send = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "skyview:registry", registry: registryRef.current },
      window.location.origin,
    );

  useEffect(() => {
    registryRef.current = registry;
    send();
  }, [registry]);

  useEffect(() => {
    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "skyview:ready") send();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The preview is a static build; if it's missing (e.g. dev without build:preview), say so.
  useEffect(() => {
    fetch("/preview/index.html", { method: "HEAD" })
      .then((res) => !res.ok && setError("Preview build missing. Run `npm run build:preview` in skyview/."))
      .catch(() => setError("Could not load the preview."));
  }, []);

  return (
    <div className="preview">
      <div className="preview-bar">
        <button type="button" onClick={onClose}>← Back to editing</button>
        <div className="tabs">
          {WIDTHS.map(([label, w]) => (
            <button
              key={w}
              type="button"
              className={w === width ? "active" : ""}
              onClick={() => setWidth(w)}
            >
              {label} {w}
            </button>
          ))}
        </div>
      </div>
      {children}
      {error ? (
        <p className="notice">{error}</p>
      ) : (
        <div className="preview-stage">
          <iframe
            ref={frame}
            src="/preview/index.html"
            title="Site preview"
            onLoad={send}
            style={{ width }}
            className="preview-frame"
          />
        </div>
      )}
    </div>
  );
}
