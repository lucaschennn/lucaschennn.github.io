// The site's own App and CSS, rendered with registry data sent by skyview.
// Mirrors src/main.jsx, except the JSON comes from postMessage instead of imports.
import { createRoot } from 'react-dom/client'
import App from '../../src/App'

import '../../src/index.css'

const root = createRoot(document.getElementById('root'))
let shown = null

window.addEventListener('message', (event) => {
  // Only skyview itself (same origin, parent window) may drive the preview.
  if (event.origin !== window.location.origin || event.source !== window.parent) return
  if (event.data?.type !== 'skyview:registry') return
  // skyview may send the same data more than once; only re-render on a change.
  const next = JSON.stringify(event.data.registry)
  if (next === shown) return
  shown = next
  // A fresh key remounts the site, so per-image load state starts over like a page load.
  root.render(<App key={Date.now()} registry={event.data.registry}/>)
})

window.parent.postMessage({ type: 'skyview:ready' }, window.location.origin)
