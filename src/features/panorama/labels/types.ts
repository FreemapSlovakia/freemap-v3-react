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
   * Metres the summit stands above its surroundings — signed, so a top under
   * its own ridge is negative. What the viewer ranks and filters on; the rank
   * itself is derived there, since the user sets what it weighs.
   *
   * A source that measures nothing of the kind leaves it out and passes every
   * filter — but ranks below every real summit, which is a decision the next
   * such source has to make rather than inherit. See `TODO.md`.
   */
  dominance?: number;
  /**
   * The depth lift is what brought its subject into view: drawn and nameable,
   * but hidden from the actual viewpoint. A source that warps nothing leaves it
   * out.
   */
  revealed?: boolean;
}
