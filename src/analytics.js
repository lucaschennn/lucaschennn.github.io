// Sends a GA4 custom event through the gtag loaded in index.html.
// `window.gtag?.` because skyview's preview renders src/ without loading GA.
// In dev, events are flagged debug_mode so they show in GA's DebugView and can be
// excluded from reports with GA's "Developer traffic" data filter.
export function track(event, params = {}) {
    if (!import.meta.env.PROD) {
        params = {...params, debug_mode: true};
        console.debug('[track]', event, params);
    }
    window.gtag?.('event', event, params);
}

// Click handler for links to Instagram/LinkedIn; `location` says which one on the page.
export const trackSocial = (platform, location) => () => track('social_click', {platform, location});
