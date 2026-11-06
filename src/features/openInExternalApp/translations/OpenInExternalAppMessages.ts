export type OpenInExternalAppMessages = {
  openInExternal: string;
  /** Heads the list of targets where the menu holds more than them. */
  openIn: string;
  osm: string;
  oma: string;
  googleMaps: string;
  appleMaps: string;
  hiking_sk: string;
  zbgis: string;
  mapy_cz: string;
  josm: string;
  id: string;
  window: string;
  /** Any installed map app, through Android's `geo:` app picker. */
  geoApp: string;
  url: string;
  image: string;
  /** Beside the page's link while the connected map's server copy lacks changes. */
  linkIncompleteMap: string;
  /** Beside the page's link while the data is too big for it. */
  linkIncompleteData: string;
};
