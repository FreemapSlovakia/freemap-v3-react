declare module 'delatin' {
  export default class Delatin {
    constructor(data: ArrayLike<number>, width: number, height?: number);

    /** Vertex grid positions, `x, y` pairs. */
    coords: number[];

    /** Vertex indices, three per triangle. */
    triangles: number[];

    /** Refines until no sample is further than `maxError` from the surface. */
    run(maxError?: number): void;

    getMaxError(): number;
  }
}
