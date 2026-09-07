/**
 * The same build is served from two domains under two portal names. The domain
 * decides the name; the UI language only translates the rest of the copy.
 *
 * Consumed by the build (entry-document variants), the sitemap generator (where
 * the page language implies its home domain — see `langBase` in `seo.ts`) and
 * the running app (which resolves the site from the hostname).
 */

export type Site = 'sk' | 'eu';

export const siteNames: Record<Site, string> = {
  sk: 'Freemap Slovakia',
  eu: 'Freemap Europe',
};

export const siteUrls: Record<Site, string> = {
  sk: 'https://www.freemap.sk',
  eu: 'https://www.freemap.eu',
};

/** freemap.eu is the international site; anything else (incl. dev) is the Slovak one. */
export function siteOf(hostname: string): Site {
  return hostname === 'freemap.eu' || hostname.endsWith('.freemap.eu')
    ? 'eu'
    : 'sk';
}

/** Substitutes the `{site}` placeholder the SEO title strings are written with. */
export function expandSite(text: string, site: Site): string {
  return text.replace(/\{site\}/g, siteNames[site]);
}
