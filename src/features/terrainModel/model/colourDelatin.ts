import Delatin from 'delatin';

/** Above any height error, so the run never stops at a triangle a colour edge crosses. */
const MIXED = 1e100;

function orient(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  return (bx - cx) * (ay - cy) - (by - cy) * (ax - cx);
}

/**
 * Delatin that also splits every triangle whose grid points differ in class,
 * so colour edges keep the grid's own detail while one-colour areas simplify.
 * `_findCandidate` is Delatin's own scan (0.2.0) with the class check added.
 */
export function colourDelatin(
  heights: ArrayLike<number>,
  classes: Uint8Array,
  cols: number,
  rows: number,
): Delatin {
  const cls = (x: number, y: number) => classes[y * cols + x]!;

  /** A point with a 4-neighbour of another class. */
  const onEdge = (x: number, y: number) => {
    const c = cls(x, y);

    return (
      (x > 0 && cls(x - 1, y) !== c) ||
      (x < cols - 1 && cls(x + 1, y) !== c) ||
      (y > 0 && cls(x, y - 1) !== c) ||
      (y < rows - 1 && cls(x, y + 1) !== c)
    );
  };

  // A subclass per grid: Delatin's constructor already scans, before any field could be set.
  class ColourDelatin extends Delatin {
    protected override _findCandidate(
      p0x: number,
      p0y: number,
      p1x: number,
      p1y: number,
      p2x: number,
      p2y: number,
      t: number,
    ): void {
      const minX = Math.min(p0x, p1x, p2x);
      const minY = Math.min(p0y, p1y, p2y);
      const maxX = Math.max(p0x, p1x, p2x);
      const maxY = Math.max(p0y, p1y, p2y);

      let w00 = orient(p1x, p1y, p2x, p2y, minX, minY);
      let w01 = orient(p2x, p2y, p0x, p0y, minX, minY);
      let w02 = orient(p0x, p0y, p1x, p1y, minX, minY);
      const a01 = p1y - p0y;
      const b01 = p0x - p1x;
      const a12 = p2y - p1y;
      const b12 = p1x - p2x;
      const a20 = p0y - p2y;
      const b20 = p2x - p0x;

      const a = orient(p0x, p0y, p1x, p1y, p2x, p2y);
      const z0 = this.heightAt(p0x, p0y) / a;
      const z1 = this.heightAt(p1x, p1y) / a;
      const z2 = this.heightAt(p2x, p2y) / a;

      const isVertex = (x: number, y: number) =>
        (x === p0x && y === p0y) ||
        (x === p1x && y === p1y) ||
        (x === p2x && y === p2y);

      const ref = cls(p0x, p0y);

      let mixed = false;

      let maxError = 0;
      let mx = 0;
      let my = 0;

      for (let y = minY; y <= maxY; y++) {
        let dx = 0;

        if (w00 < 0 && a12 !== 0) {
          dx = Math.max(dx, Math.floor(-w00 / a12));
        }

        if (w01 < 0 && a20 !== 0) {
          dx = Math.max(dx, Math.floor(-w01 / a20));
        }

        if (w02 < 0 && a01 !== 0) {
          dx = Math.max(dx, Math.floor(-w02 / a01));
        }

        let w0 = w00 + a12 * dx;
        let w1 = w01 + a20 * dx;
        let w2 = w02 + a01 * dx;

        let wasInside = false;

        for (let x = minX + dx; x <= maxX; x++) {
          if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
            wasInside = true;

            const z = z0 * w0 + z1 * w1 + z2 * w2;
            const dz = Math.abs(z - this.heightAt(x, y));

            if (dz > maxError) {
              maxError = dz;
              mx = x;
              my = y;
            }

            if (cls(x, y) !== ref) {
              mixed = true;
            }
          } else if (wasInside) {
            break;
          }

          w0 += a12;
          w1 += a20;
          w2 += a01;
        }

        w00 += b12;
        w01 += b20;
        w02 += b01;
      }

      // A second pass, for mixed triangles only: where to split, on a colour
      // edge, else anywhere inside; nearest the centroid, as a split near the
      // rim leaves most of the triangle to rescan.
      if (mixed) {
        const cx = (p0x + p1x + p2x) / 3;
        const cy = (p0y + p1y + p2y) / 3;

        let ex = -1;
        let ey = -1;
        let ed = Infinity;
        let ix = -1;
        let iy = -1;
        let id = Infinity;

        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (
              orient(p1x, p1y, p2x, p2y, x, y) < 0 ||
              orient(p2x, p2y, p0x, p0y, x, y) < 0 ||
              orient(p0x, p0y, p1x, p1y, x, y) < 0 ||
              isVertex(x, y)
            ) {
              continue;
            }

            const d = (x - cx) ** 2 + (y - cy) ** 2;

            if (d < id) {
              id = d;
              ix = x;
              iy = y;
            }

            if (d < ed && onEdge(x, y)) {
              ed = d;
              ex = x;
              ey = y;
            }
          }
        }

        if (ix >= 0) {
          this._candidates[2 * t] = ex >= 0 ? ex : ix;
          this._candidates[2 * t + 1] = ex >= 0 ? ey : iy;

          this._queuePush(t, MIXED);

          return;
        }
      }

      if (isVertex(mx, my)) {
        maxError = 0;
      }

      this._candidates[2 * t] = mx;
      this._candidates[2 * t + 1] = my;

      this._queuePush(t, maxError);
    }
  }

  return new ColourDelatin(heights, cols, rows);
}
