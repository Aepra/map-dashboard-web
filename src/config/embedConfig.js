// List of origins allowed to embed the dashboards (must include protocol)
const configuredOrigins = [
  'https://superapps.makassarkota.go.id',
  process.env.NEXT_PUBLIC_APP_ORIGIN,
].filter(Boolean);

export const ALLOWED_EMBED_ORIGINS = [...new Set(configuredOrigins)];

// Helpful helper for checks
export function isEmbedAllowed() {
  if (typeof window === 'undefined') return false;
  try {
    const origin = window.location.origin;
    if (ALLOWED_EMBED_ORIGINS.includes(origin)) return true;
    const ref = document.referrer || '';
    if (ref.includes('superapps.makassarkota.go.id')) return true;
  } catch (e) {
    return false;
  }
  return false;
}
