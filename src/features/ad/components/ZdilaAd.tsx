import { type ReactElement, useEffect, useRef } from 'react';
import classes from './ZdilaAd.module.css';

type Props = {
  /** Top mono kicker line (authorship variant). */
  kick?: string;
  head: string;
  sub: string;
  /** Bottom mono line (map-native variant). */
  meta?: string;
};

/** Number of drifting "1" lines drawn over the "0" field. */
const LINES = 6;

/** Mirrors the `line-height` of `.bin` in the stylesheet. */
const LINE_HEIGHT = 12;

type Segment = { t1: number; v1: number; t2: number; v2: number };

// Measure the real rendered character advance (glyph + letter-spacing) inside
// the field element, so it matches whatever monospace font the browser picks.
function measureCellWidth(field: HTMLElement): number {
  const probe = document.createElement('span');

  probe.textContent = '0'.repeat(100);
  probe.style.visibility = 'hidden';
  probe.style.position = 'absolute';
  probe.style.whiteSpace = 'pre';

  field.appendChild(probe);

  const width = probe.getBoundingClientRect().width / 100;

  probe.remove();

  return width || 7;
}

function drawLine(
  grid: Uint8Array[],
  cols: number,
  rows: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let err = dx - dy;
  let x = x0;
  let y = y0;

  for (;;) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      grid[y][x] = 1;
    }

    if (x === x1 && y === y1) {
      break;
    }

    const e2 = 2 * err;

    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }

    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/**
 * Animated binary field: a grid of `0`s with `LINES` bright `1` segments whose
 * endpoints drift around the banner's edge, each at its own constant (possibly
 * negative) velocity.
 */
function BinaryField(): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el?.parentElement) {
      return;
    }

    // Measure the card itself; `.bin` is absolutely stretched over it.
    const host = el.parentElement;

    const cellW = measureCellWidth(el);

    const rnd = (min: number, max: number) => min + Math.random() * (max - min);

    // Constant speed in cells/second; direction (sign) is random too.
    const velocity = () => rnd(3, 9) * (Math.random() < 0.5 ? -1 : 1);

    let cols = 2;
    let rows = 2;
    let perimeter = 4;
    let segments: Segment[] = [];

    const reset = () => {
      // Over-fill in each direction so the field always covers the card even
      // with rounding/metric slack; the excess is clipped by `overflow: hidden`.
      cols = Math.max(2, Math.ceil(host.clientWidth / cellW) + 2);
      rows = Math.max(2, Math.ceil(host.clientHeight / LINE_HEIGHT) + 2);
      perimeter = 2 * (cols - 1) + 2 * (rows - 1);

      segments = Array.from({ length: LINES }, () => ({
        t1: rnd(0, perimeter),
        v1: velocity(),
        t2: rnd(0, perimeter),
        v2: velocity(),
      }));
    };

    // Map a perimeter offset to grid coordinates (clockwise from top-left).
    const toXY = (t: number): [number, number] => {
      const p = ((t % perimeter) + perimeter) % perimeter;
      const top = cols - 1;
      const right = top + (rows - 1);
      const bottom = right + (cols - 1);

      if (p <= top) {
        return [Math.round(p), 0];
      }

      if (p <= right) {
        return [cols - 1, Math.round(p - top)];
      }

      if (p <= bottom) {
        return [cols - 1 - Math.round(p - right), rows - 1];
      }

      return [0, rows - 1 - Math.round(p - bottom)];
    };

    const build = () => {
      const grid = Array.from({ length: rows }, () => new Uint8Array(cols));

      for (const s of segments) {
        const [x0, y0] = toXY(s.t1);
        const [x1, y1] = toXY(s.t2);

        drawLine(grid, cols, rows, x0, y0, x1, y1);
      }

      let html = '';

      for (let y = 0; y < rows; y++) {
        if (y > 0) {
          html += '\n';
        }

        const row = grid[y];

        let ones = row[0] === 1;
        let run = ones ? '1' : '0';

        for (let x = 1; x < cols; x++) {
          const one = row[x] === 1;

          if (one === ones) {
            run += one ? '1' : '0';
          } else {
            html += ones ? `<b>${run}</b>` : run;
            ones = one;
            run = one ? '1' : '0';
          }
        }

        html += ones ? `<b>${run}</b>` : run;
      }

      return html;
    };

    let raf = 0;
    let last = 0;
    let prev = '';

    const render = () => {
      const html = build();

      if (html !== prev) {
        el.innerHTML = html;
        prev = html;
      }
    };

    const frame = (now: number) => {
      const dt = last === 0 ? 0 : (now - last) / 1000;
      last = now;

      for (const s of segments) {
        s.t1 += s.v1 * dt;
        s.t2 += s.v2 * dt;
      }

      render();

      raf = requestAnimationFrame(frame);
    };

    const still = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Fires immediately with the settled size, then on every resize — this is
    // what makes the field track the real card dimensions.
    const ro = new ResizeObserver(() => {
      reset();
      render();
    });

    ro.observe(host);

    if (!still) {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <div className={classes.bin} aria-hidden="true" ref={ref} />;
}

export function ZdilaAd({ kick, head, sub, meta }: Props): ReactElement {
  return (
    <a
      className={classes.root}
      href="https://www.zdila.sk"
      target="_blank"
      rel="noreferrer"
    >
      <BinaryField />

      <div className={classes.body}>
        {kick && <div className={classes.kick}>{kick}</div>}

        <div className={classes.head}>{head}</div>

        <div className={classes.sub}>{sub}</div>

        {meta && <div className={classes.meta}>{meta}</div>}
      </div>

      <span className={classes.sig}>
        <svg
          viewBox="0 0 100 100"
          width="26"
          height="26"
          style={{ display: 'block' }}
        >
          <polyline
            points="24,26 76,26 24,74 76,74"
            fill="none"
            stroke="var(--z)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g fill="var(--z)">
            <circle cx="24" cy="26" r="8.5" />
            <circle cx="76" cy="26" r="8.5" />
            <circle cx="50" cy="50" r="8.5" />
            <circle cx="24" cy="74" r="8.5" />
          </g>
          <circle
            cx="76"
            cy="74"
            r="10"
            fill="var(--z)"
            stroke="var(--ring)"
            strokeWidth="8"
          />
        </svg>
      </span>
    </a>
  );
}
