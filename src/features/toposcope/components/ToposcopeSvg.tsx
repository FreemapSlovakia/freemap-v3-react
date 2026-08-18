import type { ReactElement, Ref } from 'react';
import { dialPoint, readsUpsideDown } from '../toposcopeGeometry.js';

// The dial is drawn in a fixed 200-unit square so every size setting (font,
// inner circle) means the same thing whatever the window is.
const VIEW_BOX = '-100 -100 200 200';

// The circle the cardinal letters and the inscriptions curve along; the band
// between it and the ring the rays stop at is what they are written in. How
// wide that band is, is the outer-circle setting's business — the text is
// centred in whatever it turns out to be, so a narrow one crowds the writing
// rather than sending it wandering towards the middle.
const TEXT_CIRCLE = 99;

// The `TEXT_CIRCLE` path as a closed arc starting due east and running
// clockwise, so a `textPath` offset of 0/25/50/75% lands on E/S/W/N.
const TEXT_CIRCLE_PATH = `M ${TEXT_CIRCLE},0 A ${TEXT_CIRCLE},${TEXT_CIRCLE} 0 0 1 0,${TEXT_CIRCLE} ${TEXT_CIRCLE},${TEXT_CIRCLE} 0 0 1 -${TEXT_CIRCLE},0 ${TEXT_CIRCLE},${TEXT_CIRCLE} 0 0 1 0,-${TEXT_CIRCLE} ${TEXT_CIRCLE},${TEXT_CIRCLE} 0 0 1 ${TEXT_CIRCLE},0 Z`;

// Padding around a ray's label, as spaces inside the `textPath` — the label is
// anchored at the ray's end, and this is what keeps it off the two circles.
const PAD = '    ';

const INK = 'var(--bs-body-color)';
const ACTIVE_INK = 'var(--bs-primary)';

// How large the writing is against the dial it sits on, which is the whole of
// it: the dial is a drawing in its own units and the viewBox does the resizing,
// so making the panel bigger enlarges everything together and nothing has to be
// held to a pixel size. The `scale` setting is what changes the text against
// the rest.
const FONT_RATIO = 0.022;

// Line weight follows the text, so the two never drift apart.
const STROKE_PER_FONT = 1 / 11;

// How much of the font a capital actually occupies above the baseline, which is
// what has to be centred rather than the em box.
const CAP_HEIGHT = 0.7;

// The dial's own coordinate span; see `VIEW_BOX`.
const DIAL_SPAN = 200;

/** One line drawn from the inner circle out to the ring, with its label along it. */
export type ToposcopeRay = {
  id: number;
  /** Degrees clockwise from north. */
  bearing: number;
  /**
   * What the two templates yielded, kept apart because each sits on its own
   * side of the ray: the first template's lines above it, the second's below,
   * however many lines either turned out to be.
   */
  above: string[];
  below: string[];
};

type Props = {
  rays: ToposcopeRay[];
  /** Lines inside the inner circle, usually the observer's position. */
  centerLines: string[];
  /** Curved along the outer circle, one per quadrant from S–E clockwise. */
  inscriptions: string[];
  /** Cardinal letters, in the order E, S, W, N. */
  cardinals: [string, string, string, string];
  innerCircleRadius: number;
  outerCircleRadius: number;
  /** Percentage; 100 draws the text and lines at their designed size. */
  scale: number;
  preventUpturnedText: boolean;
  /** Highlighted, e.g. because its point is selected on the map. */
  activeRayId?: number | null;
  onRayClick?: (id: number) => void;
  svgRef?: Ref<SVGSVGElement>;
  width: number;
  height: number;
};

/**
 * The toposcope itself: a compass dial of named rays, drawn as a standalone SVG
 * so it can be saved and printed as it appears.
 */
export function ToposcopeSvg({
  rays,
  centerLines,
  inscriptions,
  cardinals,
  innerCircleRadius,
  outerCircleRadius,
  scale,
  preventUpturnedText,
  activeRayId,
  onRayClick,
  svgRef,
  width,
  height,
}: Props): ReactElement {
  // In the dial's own units, so the panel's size never enters into it.
  // Everything laid out around the text is a multiple of this, so the whole
  // dial keeps its proportions however large it is drawn.
  const fs = DIAL_SPAN * FONT_RATIO * (scale / 100);

  // Exactly where the setting says, short of turning the dial inside out.
  const outerCircle = Math.max(outerCircleRadius, innerCircleRadius);

  // Seats a curved label centred in the band between the two circles. `dy` on a
  // text path moves the baseline inwards, and glyphs rise outwards from it, so
  // dropping half the band and lifting back half a cap puts the body of the
  // text on the band's middle whatever either is set to.
  const dyRing = (TEXT_CIRCLE - outerCircle) / 2 + (fs * CAP_HEIGHT) / 2;

  // Line height for a block of stacked lines — the middle of the dial. Its own
  // measure, not the ring's: `dyRing` follows the band between the circles, and
  // borrowing it made the outer-circle setting shift the text in the middle.
  const lineHeight = fs * 1.7;

  // Where a ray's lines sit. Those above it stack upwards from the ray, so the
  // last of them is the one nearest it and a block of them reads top to bottom
  // towards the ray; those below stack the same way downwards.
  const rayDyAbove = (i: number, count: number) =>
    fs * -(0.6 + (count - 1 - i) * 1.15);

  const rayDyBelow = (i: number) => fs * (1.45 + i * 1.15);

  const strokeProps = {
    strokeWidth: fs * STROKE_PER_FONT,
    strokeLinecap: 'round',
    fill: 'none',
  } as const;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={VIEW_BOX}
      fontSize={fs}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Something to read the dial against: without it the map shows through
          every gap, and a saved copy has nothing behind its text at all. */}
      <circle cx="0" cy="0" r={TEXT_CIRCLE} fill="var(--bs-body-bg)" />

      <path
        id="fm-toposcope-circle"
        d={TEXT_CIRCLE_PATH}
        stroke={INK}
        {...strokeProps}
      />

      {[
        ...inscriptions.map((text, i) => ({
          key: `i${i}`,
          text,
          offset: i * 25 + 12.5,
        })),
        ...cardinals.map((text, i) => ({
          key: `c${i}`,
          text,
          offset: i * 25,
        })),
      ].map(({ key, text, offset }) => (
        <text key={key} dy={dyRing} fill={INK}>
          <textPath
            href="#fm-toposcope-circle"
            startOffset={`${offset}%`}
            textAnchor="middle"
          >
            {text}
          </textPath>
        </text>
      ))}

      {rays.map((ray) => {
        // A ray's label runs along the ray itself. Reversing the path turns the
        // label the right way up in the dial's western half.
        const reversed = preventUpturnedText && readsUpsideDown(ray.bearing);

        const inner = dialPoint(ray.bearing, innerCircleRadius);

        const outer = dialPoint(ray.bearing, outerCircle);

        const [from, to] = reversed ? [outer, inner] : [inner, outer];

        const ink = ray.id === activeRayId ? ACTIVE_INK : INK;

        return (
          <g
            key={ray.id}
            onClick={onRayClick && (() => onRayClick(ray.id))}
            style={onRayClick && { cursor: 'pointer' }}
          >
            <path
              id={`fm-toposcope-ray-${ray.id}`}
              d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`}
              stroke={ink}
              {...strokeProps}
            />

            {[
              ...ray.above.map((line, i) => ({
                key: `a${i}`,
                line,
                dy: rayDyAbove(i, ray.above.length),
              })),
              ...ray.below.map((line, i) => ({
                key: `b${i}`,
                line,
                dy: rayDyBelow(i),
              })),
            ].map(({ key, line, dy }) => (
              <text key={key} fill={ink}>
                <textPath
                  href={`#fm-toposcope-ray-${ray.id}`}
                  startOffset={reversed ? '0%' : '100%'}
                  textAnchor={reversed ? 'start' : 'end'}
                >
                  <tspan x="0" dy={dy} xmlSpace="preserve">
                    {PAD}
                    {line}
                    {PAD}
                  </tspan>
                </textPath>
              </text>
            ))}
          </g>
        );
      })}

      <circle cx="0" cy="0" r={outerCircle} stroke={INK} {...strokeProps} />

      <circle
        cx="0"
        cy="0"
        r={innerCircleRadius}
        stroke={INK}
        {...strokeProps}
      />

      {/* Seated so the block's ink straddles the middle however many lines it
          runs to: the first baseline drops half a cap and rises half of what the
          lines below it take, and the `<text>` sits one line height above that
          because the first `tspan` carries one. */}
      <text
        x="0"
        y={
          (fs * CAP_HEIGHT - (centerLines.length - 1) * lineHeight) / 2 -
          lineHeight
        }
        fill={INK}
      >
        {centerLines.map((line, i) => (
          <tspan key={i} textAnchor="middle" x="0" dy={lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
}
