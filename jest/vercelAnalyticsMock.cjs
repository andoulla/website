// Stub for @vercel/analytics/react — the real package ships ESM-only and does
// nothing in jsdom. Rendering a no-op keeps App tests parseable without
// transforming node_modules.
module.exports = { Analytics: () => null };