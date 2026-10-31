"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://media-library.cloudinary.com/global/all.js";

function loadScript() {
  if (window.cloudinary?.createMediaLibrary) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Could not load the Cloudinary Media Library")), { once: true });
  });
}

// Cloudinary Media Library widget (modal). The user signs in to Cloudinary inside it;
// skyview holds no Cloudinary credentials. open(onInsert) calls onInsert(publicIds).
export default function useMediaLibrary() {
  const widget = useRef(null);
  const onInsertRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || widget.current) return;
        widget.current = window.cloudinary.createMediaLibrary(
          { cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD, multiple: true, max_files: 50 },
          {
            insertHandler: (data) => {
              // The docs show both a bare array and { assets: [...] }.
              const assets = Array.isArray(data) ? data : (data?.assets ?? []);
              const ids = assets.filter((a) => a.resource_type === "image").map((a) => a.public_id);
              onInsertRef.current?.(ids);
            },
          },
        );
        setReady(true);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const open = useCallback((onInsert) => {
    if (!widget.current) return;
    onInsertRef.current = onInsert;
    widget.current.show({ search: { expression: "resource_type:image" } });
  }, []);

  return { open, ready, error };
}
