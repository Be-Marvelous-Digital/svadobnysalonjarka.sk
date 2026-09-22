/** Mirrors THUMB_SUFFIX in the backend's photoStorage. */
const THUMB_SUFFIX = '-640';

/**
 * The smaller copy the server writes beside every stored gallery photo. Bundled
 * assets and external links have none, so they fall back to the original — the
 * caller always gets something it can render.
 */
export function thumbOf(url: string): string {
    if (!url.startsWith('/images/gallery/')) return url;
    const dot = url.lastIndexOf('.');
    return dot < 0 ? url : `${url.slice(0, dot)}${THUMB_SUFFIX}${url.slice(dot)}`;
}
