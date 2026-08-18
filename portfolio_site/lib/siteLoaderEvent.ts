// Fired once, by SiteLoader, the moment the splash starts fading out (see
// components/layout/SiteLoader.tsx). Anything doing continuous background
// work that's guaranteed invisible while the splash is up — the ambient
// canvas grid, say — can wait for this instead of burning cycles on frames
// nobody will ever see. Shared as a constant so both sides can't drift out
// of sync on the string value.
export const SITE_LOADED_EVENT = "site:loaded";
