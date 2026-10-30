/**
 * Documents that became manual chapters: old key → chapter. The app opens the
 * chapter for an old link; the SEO prerender points the old URL's page at it.
 */
export const DOCUMENTS_IN_MANUAL: Record<string, string> = {
  shortcuts: 'shortcuts',
  tracking: 'tracking',
  garmin: 'devices',
  geocaching: 'devices',
  osm: 'about',
  freemap: 'about',
  attribution: 'about',
  premium: 'premium',
};
