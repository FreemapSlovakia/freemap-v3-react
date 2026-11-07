import type { MarkerType } from '@features/objects/model/actions.js';
import { POI_ICON_KNOCKOUT_VAR, poiIcons } from '@osm/poiIcons.js';
import { poiIconGlyphRect } from '@shared/poiIconGlyph.js';
import type Leaflet from 'leaflet';
import { type BaseIconOptions, DomUtil, Icon } from 'leaflet';
import {
  Component,
  type CSSProperties,
  cloneElement,
  isValidElement,
  type ReactElement,
  type SVGProps,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Marker, type MarkerProps } from 'react-leaflet';
import { shallowEqual } from 'react-redux';
import { splitColorAlpha } from '../colorAlpha.js';
import {
  COLORS,
  GLYPH_INSET_LIGHT,
  glyphInsetColor,
  POI_ARTWORK_INK,
} from '../colors.js';
import { HALO_OPACITY } from '../halo.js';

// Fixed glyph box (in viewBox units) and font size, shared by all marker
// shapes so icon/text size is independent of the shape.
const GLYPH_SIZE = 160;

// The selection ring, in viewBox units: every shape is drawn 310 units wide
// into a 24 px icon, so this is a 6 px stroke on screen. It is stroked under
// the shape, whose fill covers the inner half — leaving a crisp 3 px ring
// outside, the same as a line's halo shows on each side.
const HALO_STROKE = (2 * 3 * 310) / 24;

// The pin, shared by its fill and the ring stroked over it.
const PIN_PATH =
  'M 156.063 11.734 C 74.589 11.734 8.53 79.093 8.53 162.204 C 8.53 185.48 13.716 207.552 22.981 227.212 C 23.5 228.329 156.063 493.239 156.063 493.239 L 287.546 230.504 C 297.804 210.02 303.596 186.803 303.596 162.204 C 303.596 79.093 237.551 11.734 156.063 11.734 Z';

// The glyph takes the marker's own color on the inset, so shape and glyph read
// as one marker. Applies to every monochrome glyph kind — label text, Font
// Awesome paths, and the poi icons that carry no color of their own, whose
// drawing is inlined and so follows the fill like any other path.
const textStyle: CSSProperties = {
  fontSize: '150px',
  fontWeight: 'bold',
  whiteSpace: 'pre',
  fontFamily: 'Sans-Serif',
  textAnchor: 'middle',
};

interface BaseIconProps {
  color?: string;
  markerType?: MarkerType;
  /**
   * Draws a ring of this color around the marker's shape — the halo a line
   * wears, for something that has no outline to widen.
   */
  halo?: string;
  /**
   * Color of the glyph on the white inset; defaults to the marker's own color.
   * Set it when the shape is drawn in a derived color (a paled selection) and
   * the glyph should keep the original one to stay readable.
   */
  glyphColor?: string;
}

// A Font Awesome icon described as a raw `{ width, height, path }`, embedded
// directly into the marker SVG so it scales and positions with the marker
// shape. `faIcon` (a ready-made react-icons `<svg>` element) is rendered the
// same way; both share the `GLYPH_SIZE` scale.
export interface IconSvg {
  width: number;
  height: number;
  path: string;
}

// Loose shape accepted by the low-level renderer, which receives the content
// props already destructured (and thus uncorrelated). Public callers use the
// mutually-exclusive `IconProps` below.
export interface MarkerIconProps extends BaseIconProps {
  label?: string | number;
  poi?: string;
  faIcon?: ReactElement;
  iconSvg?: IconSvg;
  poiOpacity?: number;
}

// `faIcon`, `iconSvg`, `poi` (+ `poiOpacity`) and `label` are mutually
// exclusive.
type IconContentProps =
  | {
      faIcon?: ReactElement;
      iconSvg?: never;
      poi?: never;
      poiOpacity?: never;
      label?: never;
    }
  | {
      iconSvg?: IconSvg;
      faIcon?: never;
      poi?: never;
      poiOpacity?: never;
      label?: never;
    }
  | {
      poi?: string;
      poiOpacity?: number;
      faIcon?: never;
      iconSvg?: never;
      label?: never;
    }
  | {
      label?: string | number;
      faIcon?: never;
      iconSvg?: never;
      poi?: never;
      poiOpacity?: never;
    };

type IconProps = BaseIconProps & IconContentProps;

type Props = MarkerProps &
  IconProps & {
    autoOpenPopup?: boolean;
  };

export const markerIconOptions = {
  iconSize: [24, 40] as [number, number],
  iconAnchor: [12, 37] as [number, number],
  popupAnchor: [0, -34] as [number, number],
};

/**
 * Applies `interactive` to a marker already on the map. react-leaflet doesn't
 * diff it (react-leaflet#843), and remounting would rebuild the icon — a blink
 * whenever e.g. `state.main.mapTool` changes. `draggable` is re-applied too:
 * Leaflet makes the drag handler only for an interactive marker.
 */
function setMarkerInteractive(
  marker: Leaflet.Marker,
  interactive: boolean,
  draggable: boolean,
): void {
  const internal = marker as Leaflet.Marker & {
    _icon?: HTMLElement;
    _initInteraction(): void;
  };

  const icon = internal._icon;

  if (!icon) {
    return;
  }

  if (Boolean(marker.options.interactive) !== interactive) {
    marker.options.interactive = interactive;

    if (interactive) {
      internal._initInteraction();
    } else {
      DomUtil.removeClass(icon, 'leaflet-interactive');

      marker.removeInteractiveTarget(icon);
    }
  }

  if (marker.dragging) {
    if (interactive && draggable) {
      marker.dragging.enable();
    } else {
      marker.dragging.disable();
    }
  }
}

/**
 * Whether two elements would render the same thing — same component, same
 * props. Shallow, which is all a `react-icons` glyph ever needs.
 */
function sameElement(a?: ReactElement, b?: ReactElement): boolean {
  return (
    a === b ||
    (a !== undefined &&
      b !== undefined &&
      a.type === b.type &&
      shallowEqual(a.props, b.props))
  );
}

export function RichMarker({
  autoOpenPopup,
  markerType = 'pin',
  color,
  glyphColor,
  halo,
  faIcon,
  iconSvg,
  poi: poiName,
  poiOpacity,
  label,
  ...restProps
}: Props): ReactElement {
  const markerRef = useRef<Leaflet.Marker | null>(null);

  // `faIcon` is written inline at the call site, so it is a fresh object every
  // render — and rebuilding the icon from it reaches Leaflet's `setIcon`, whose
  // `_initInteraction` **replaces the marker's drag handler**. A marker that
  // re-renders often is then undraggable: the gesture dies under the finger.
  // Keep the previous element wherever it says the same thing.
  const faIconRef = useRef(faIcon);

  if (!sameElement(faIconRef.current, faIcon)) {
    faIconRef.current = faIcon;
  }

  const stableFaIcon = faIconRef.current;

  useEffect(() => {
    if (autoOpenPopup && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [autoOpenPopup]);

  // Normalized once and handed to `<Marker>` below as well, so the options the
  // marker is built with and the ones the effect asserts can't disagree: an
  // explicit `interactive={undefined}` would otherwise reach Leaflet's
  // `setOptions` and shadow its `interactive: true` default, making the marker
  // start out non-interactive while the effect believes it is interactive.
  const interactive = restProps.interactive ?? true;

  const draggable = restProps.draggable ?? false;

  useEffect(() => {
    if (markerRef.current) {
      setMarkerInteractive(markerRef.current, interactive, draggable);
    }
  }, [interactive, draggable]);

  const icon = useMemo(() => {
    const iconProps: MarkerIconProps = {
      color,
      glyphColor,
      halo,
      faIcon: stableFaIcon,
      iconSvg,
      poi: poiName,
      poiOpacity,
      label,
      markerType,
    };

    return new MarkerLeafletIcon({
      iconAnchor:
        markerType === 'ring' || markerType === 'square'
          ? [12, 12]
          : markerIconOptions.iconAnchor,
      tooltipAnchor:
        markerType === 'ring' || markerType === 'square' ? [0, -10] : [0, -35],
      iconSize: markerIconOptions.iconSize,
      icon: <MarkerIcon {...iconProps} />,
      iconKey: markerIconKey(iconProps),
    });
  }, [
    color,
    glyphColor,
    halo,
    stableFaIcon,
    iconSvg,
    poiName,
    poiOpacity,
    label,
    markerType,
  ]);

  return (
    <Marker
      {...restProps}
      interactive={interactive}
      draggable={draggable}
      icon={icon}
      key={markerType}
      ref={markerRef}
    />
  );
}

// Marker content is stateless SVG: each look renders once, in one hidden root,
// and every marker gets a copy of its markup.
const iconHtml = new Map<string, string>();

/** Markers whose look is still rendering, by its key. */
const waiting = new Map<string, Set<IconDiv>>();

/** Looks to render, each under a request number of its own. */
const pending = new Map<string, { icon: ReactElement; request: number }>();

type IconDiv = HTMLElement & { _fmIconKey?: string };

let iconRoot: Root | undefined;

let requests = 0;

/** A look rendered once and unshared: keyless, or props that don't serialise. */
const UNSHARED = 'unshared:';

/** Hands a rendered look's markup to the markers waiting for it. */
function settle(id: string, html: string, failed = false) {
  // A failure blanks only the markers waiting now; the look is tried again.
  if (!failed && !id.startsWith(UNSHARED)) {
    iconHtml.set(id, html);
  }

  for (const div of waiting.get(id) ?? []) {
    // Not if the marker was given another look meanwhile.
    if (div._fmIconKey === id) {
      div.innerHTML = html;
    }
  }

  waiting.delete(id);

  pending.delete(id);
}

function CapturedIcon({
  id,
  children,
}: {
  id: string;
  children: ReactElement;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    settle(id, ref.current!.innerHTML);
  }, [id]);

  return <div ref={ref}>{children}</div>;
}

/** One look that throws leaves its markers blank, not all in the batch. */
class IconBoundary extends Component<
  { id: string; children: ReactElement },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Marker icon not rendered', error);

    settle(this.props.id, '', true);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function showIcon(div: IconDiv, key: string, icon: ReactElement) {
  div._fmIconKey = key;

  const html = iconHtml.get(key);

  if (html !== undefined) {
    div.innerHTML = html;

    return;
  }

  // Blank until it arrives: the old look at a new anchor would jump.
  div.replaceChildren();

  const divs = waiting.get(key);

  if (divs) {
    divs.add(div);

    return;
  }

  // Looks are few (colour × glyph); a bound keeps arbitrary labels in check.
  if (iconHtml.size > 5000) {
    iconHtml.clear();
  }

  waiting.set(key, new Set([div]));

  pending.set(key, { icon, request: ++requests });

  // Once for a whole batch of new looks, not once each.
  if (!renderQueued) {
    renderQueued = true;

    queueMicrotask(renderPending);
  }
}

let renderQueued = false;

function renderPending() {
  renderQueued = false;

  iconRoot ??= createRoot(document.createElement('div'));

  // Keyed by the request too: a look asked for again after the cache dropped
  // it mounts anew, so its effect runs again.
  iconRoot.render(
    [...pending].map(([id, { icon, request }]) => (
      <IconBoundary key={`${id}#${request}`} id={id}>
        <CapturedIcon id={id}>{icon}</CapturedIcon>
      </IconBoundary>
    )),
  );
}

/**
 * What makes two markers' content the same, for sharing its markup; undefined
 * where it can't be told.
 */
export function markerIconKey({
  faIcon,
  ...props
}: MarkerIconProps): string | undefined {
  const fa = faIcon && elementKey(faIcon);

  return fa === null ? undefined : JSON.stringify([props, fa]);
}

const objectIds = new WeakMap<object, number>();

let objectCount = 0;

/** A function or component by identity, which JSON would drop. */
function idOf(value: object): number {
  if (!objectIds.has(value)) {
    objectIds.set(value, ++objectCount);
  }

  return objectIds.get(value)!;
}

/**
 * A glyph by its component and props — nested elements and functions by
 * identity; null where unserialisable.
 */
function elementKey(element: ReactElement): string | null {
  const { type } = element;

  // An intrinsic element (`<svg>`) is its tag; a WeakMap takes objects only.
  const id = typeof type === 'string' ? type : idOf(type);

  try {
    return `${id}:${JSON.stringify(element.props, (_, value: unknown) =>
      typeof value === 'function'
        ? `fn${idOf(value)}`
        : isValidElement(value)
          ? `el${elementKey(value)}`
          : value,
    )}`;
  } catch {
    return null;
  }
}

export class MarkerLeafletIcon extends Icon<
  BaseIconOptions & {
    icon: ReactElement;
    /** Shared by icons rendering alike (`markerIconKey`); unset, a look of its own. */
    iconKey?: string;
  }
> {
  createIcon(oldIcon?: HTMLElement): HTMLElement {
    const reuse = oldIcon?.tagName === 'DIV';

    const div: IconDiv = reuse ? oldIcon : document.createElement('div');

    // On a reused element too: a new icon may have another anchor (pin → ring).
    // Leaflet's Icon._setIconStyles is an untyped internal method.
    (this as any)._setIconStyles(div, 'icon');

    showIcon(
      div,
      this.options.iconKey ?? `${UNSHARED}${++requests}`,
      this.options.icon,
    );

    return div;
  }

  createShadow(oldIcon?: HTMLElement): HTMLElement {
    return oldIcon ?? document.createElement('div');
  }
}

export function MarkerIcon({
  poi: poiName,
  poiOpacity,
  faIcon,
  iconSvg,
  color = COLORS.normal,
  glyphColor,
  halo,
  label,
  markerType,
}: MarkerIconProps): ReactElement {
  // Split any alpha off the color: the solid RGB paints the shape, while the
  // alpha is applied as a group `opacity` on the whole marker (shape + white
  // inset + glyph) so the entire marker fades uniformly rather than only its
  // background.
  const { color: fillColor, opacity } = splitColorAlpha(color);

  // The shape's own outline, stroked under the marker so only the half outside
  // it shows — a ring that leaks neither inward nor into a blur. That half
  // falls past the viewBox, which an SVG root clips by default — hence
  // `overflow`.
  const haloProps = halo
    ? ({
        fill: 'none',
        stroke: halo,
        strokeWidth: HALO_STROKE,
        // Divided out of the group `opacity` the ring is stroked inside, so it
        // lands at HALO_OPACITY whatever the marker's own alpha — the line
        // halos it matches take theirs from a pane, not from the feature.
        strokeOpacity: Math.min(1, HALO_OPACITY / opacity),
        // Round, or the default miter shoots a spike out of the pin's tip —
        // which is the marker's own anchor.
        strokeLinejoin: 'round',
      } as const)
    : undefined;

  const haloStyle: CSSProperties | undefined = halo
    ? { overflow: 'visible' }
    : undefined;

  const glyphFill = glyphColor ?? fillColor;

  const icon = poiName === undefined ? undefined : poiIcons[poiName];

  // A poi icon with colors of its own is artwork drawn for a light background,
  // so it keeps the white inset; everything else is painted in `glyphFill` and
  // gets whichever inset that reads on.
  const insetFill =
    icon && !icon.mono ? GLYPH_INSET_LIGHT : glyphInsetColor(glyphFill);

  // A glyph (label text, poi icon or Font Awesome icon) fills the inset; this
  // flag also drives whether the inset is drawn.
  const hasContent = Boolean(label || icon || faIcon || iconSvg);

  // The glyph is drawn at a fixed size centered on each shape's inset, so its
  // on-screen size does not depend on the marker shape.
  const renderGlyph = (cx: number, cy: number) => {
    // Scale the icon's longer side to GLYPH_SIZE and center it. Drawn as a plain
    // <path> (not a nested <svg>) to avoid the latter's overflow clipping.
    let iconTransform: string | undefined;

    // A `react-icons` element is a self-contained `<svg viewBox=…>`; clone it
    // into a GLYPH_SIZE box centered on the inset so it scales exactly like
    // `poi`/`iconSvg`. Its `fill="currentColor"` resolves to the wrapping
    // `<g>`'s color unless the element sets its own `color`.
    // Size via `size`, not `width`/`height`: react-icons' IconBase writes its
    // own `height`/`width` from `size` *after* spreading our props, so a cloned
    // `width`/`height` is overridden by the default `1em` (~1px glyph).
    const faGlyph =
      faIcon &&
      cloneElement(
        faIcon as ReactElement<SVGProps<SVGSVGElement> & { size?: number }>,
        {
          x: cx - GLYPH_SIZE / 2,
          y: cy - GLYPH_SIZE / 2,
          size: GLYPH_SIZE,
        },
      );

    if (iconSvg) {
      const scale = GLYPH_SIZE / Math.max(iconSvg.width, iconSvg.height);

      iconTransform =
        `translate(${cx - (iconSvg.width * scale) / 2} ` +
        `${cy - (iconSvg.height * scale) / 2}) scale(${scale})`;
    }

    // Scale+center the icon by its precomputed drawing bbox (see
    // poiIconGlyphRect), so icons keep the relative sizes the map renders
    // instead of each filling the box.
    const poiGlyph = icon && (
      <svg
        {...poiIconGlyphRect(icon, cx, cy, GLYPH_SIZE)}
        viewBox={icon.vb.join(' ')}
        opacity={poiOpacity}
        fill={icon.mono ? glyphFill : POI_ARTWORK_INK}
        style={
          {
            // `color` as well as `fill`: shapes that carry no paint of their own
            // inherit the fill, while the ones the drawing paints explicitly say
            // `currentColor`, which resolves against `color`.
            color: icon.mono ? glyphFill : POI_ARTWORK_INK,
            // Knockouts inside the drawing show the inset the glyph sits on.
            [POI_ICON_KNOCKOUT_VAR]: insetFill,
          } as CSSProperties
        }
        // Build-time markup from the generated icon table, never user input.
        dangerouslySetInnerHTML={{ __html: icon.body }}
      />
    );

    return (
      <>
        {label && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ ...textStyle, fill: glyphFill }}
          >
            {label}
          </text>
        )}

        {poiGlyph}

        {iconSvg && (
          <path
            d={iconSvg.path}
            style={{ fill: glyphFill }}
            transform={iconTransform}
          />
        )}

        {faGlyph && <g style={{ color: glyphFill }}>{faGlyph}</g>}
      </>
    );
  };

  return (
    <>
      {markerType === 'ring' ? (
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 310 310"
          xmlns="http://www.w3.org/2000/svg"
          opacity={opacity}
          style={haloStyle}
        >
          {haloProps && (
            <ellipse cx={155} cy={155} rx={135} ry={135} {...haloProps} />
          )}

          <ellipse cx={155} cy={155} rx={135} ry={135} fill={fillColor} />

          {hasContent && (
            <ellipse cx={155} cy={155} rx={110} ry={110} fill={insetFill} />
          )}

          {renderGlyph(155, 155)}
        </svg>
      ) : markerType === 'square' ? (
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 310 310"
          xmlns="http://www.w3.org/2000/svg"
          opacity={opacity}
          style={haloStyle}
        >
          {haloProps && (
            <rect
              x={30}
              y={30}
              width={240}
              height={240}
              rx={20}
              ry={20}
              {...haloProps}
            />
          )}

          <rect
            x={30}
            y={30}
            width={240}
            height={240}
            rx={20}
            ry={20}
            fill={fillColor}
          />

          {hasContent && (
            <rect
              x={50}
              y={50}
              width={200}
              height={200}
              rx={20}
              ry={20}
              fill={insetFill}
            />
          )}

          {renderGlyph(150, 150)}
        </svg>
      ) : (
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 310 512"
          xmlns="http://www.w3.org/2000/svg"
          opacity={opacity}
          style={haloStyle}
        >
          {haloProps && <path d={PIN_PATH} {...haloProps} />}

          <path d={PIN_PATH} fill={fillColor} />

          {hasContent && (
            <ellipse
              cx={154.12}
              cy={163.702}
              rx={119.462}
              ry={119.462}
              fill={insetFill}
            />
          )}

          {renderGlyph(154, 164)}
        </svg>
      )}
    </>
  );
}
