/**
 * Something worth naming in the picture.
 *
 * The renderer answers with summits only, and scores them by how far they stand
 * above their surroundings — a measure that means nothing for a hut in a
 * valley, which stands above nothing and would score zero however worth naming
 * it is. So
 * the viewer works on this shape instead of on the wire's, and a second source
 * (map selection, drawn points, POIs) can add labels of its own: with the depth
 * buffer, anything with a coordinate and an elevation can be projected and its
 * visibility tested exactly as the renderer tests a summit's.
 */
export interface PanoramaLabel {
  /** Unique within one render. */
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Metres above sea level from the terrain model, where one answered. */
  ele: number | null;
  /** Metres from the viewpoint, great-circle. */
  distance: number;
  /** Degrees clockwise from north. */
  azimuth: number;
  /** Height in the rendered image, in output pixels, origin top-left. */
  y: number;
  /**
   * What ranks it against the rest when there is no room for everything. A
   * bare ordering with no unit — for a summit it weighs the metres it stands
   * above its surroundings against how far off it is (see `labelRank`) — so
   * nothing may test it against a fixed cut; sort by it and take what fits.
   */
  rank: number;
  /**
   * Metres the summit stands above its surroundings — signed, so a top under
   * its own ridge is negative — kept beside the rank so the dominance filter
   * has a figure with a unit to test. A source that measures nothing of the
   * kind leaves it out, and passes every filter.
   */
  dominance?: number;
}
