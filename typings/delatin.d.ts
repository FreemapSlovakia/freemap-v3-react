declare module 'delatin' {
  export default class Delatin {
    constructor(data: ArrayLike<number>, width: number, height?: number);

    /** Vertex grid positions, `x, y` pairs. */
    coords: number[];

    /** Vertex indices, three per triangle. */
    triangles: number[];

    width: number;

    height: number;

    /** Refines until no sample is further than `maxError` from the surface. */
    run(maxError?: number): void;

    getMaxError(): number;

    heightAt(x: number, y: number): number;

    // Internals `colourDelatin.ts` overrides; the version is pinned for them.
    protected _candidates: number[];

    protected _queuePush(t: number, error: number): void;

    protected _findCandidate(
      p0x: number,
      p0y: number,
      p1x: number,
      p1y: number,
      p2x: number,
      p2y: number,
      t: number,
    ): void;
  }
}
