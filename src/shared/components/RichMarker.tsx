import type { MarkerType } from '@features/objects/model/actions.js';
import { poiIconBBoxes } from '@osm/poiIconBBoxes.js';
import { poiIconGlyphRect } from '@shared/poiIconGlyph.js';
import type Leaflet from 'leaflet';
import { type BaseIconOptions, DomUtil, Icon } from 'leaflet';
import {
  type CSSProperties,
  cloneElement,
  type ReactElement,
  type SVGProps,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Marker, type MarkerProps } from 'react-leaflet';
import { splitColorAlpha } from '../colorAlpha.js';
import { COLORS, GLYPH_INSET_LIGHT, glyphInsetColor } from '../colors.js';

// Fixed glyph box (in viewBox units) and font size, shared by all marker
// shapes so icon/text size is independent of the shape.
const GLYPH_SIZE = 160;

// The glyph takes the marker's own color on the white inset, so shape and glyph
// read as one marker. Only applies to the monochrome glyph kinds we draw
// ourselves (label text, Font Awesome paths); a `poi` icon is referenced as an
// `<image>` and keeps the colors baked into the asset.
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
interface MarkerIconProps extends BaseIconProps {
  label?: string | number;
  image?: string;
  faIcon?: ReactElement;
  iconSvg?: IconSvg;
  imageOpacity?: number;
}

// `faIcon`, `iconSvg`, `image` (+ `imageOpacity`) and `label` are mutually
// exclusive.
type IconContentProps =
  | {
      faIcon?: ReactElement;
      iconSvg?: never;
      image?: never;
      imageOpacity?: never;
      label?: never;
    }
  | {
      iconSvg?: IconSvg;
      faIcon?: never;
      image?: never;
      imageOpacity?: never;
      label?: never;
    }
  | {
      image?: string;
      imageOpacity?: number;
      faIcon?: never;
      iconSvg?: never;
      label?: never;
    }
  | {
      label?: string | number;
      faIcon?: never;
      iconSvg?: never;
      image?: never;
      imageOpacity?: never;
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
 * Applies `interactive` to a marker that is already on the map.
 *
 * Leaflet wires up interactivity (the `leaflet-interactive` class, the map's
 * hit-test target and the drag handler) while building the icon, and
 * react-leaflet doesn't diff the option, so the declarative way to change it is
 * remounting the marker — which throws the icon element away and re-renders its
 * content through a fresh async React root, leaving the marker blank for a frame
 * (a visible blink whenever e.g. `state.main.activeTool` changes). Mutating the
 * live marker avoids that.
 *
 * `draggable` is re-applied here because Leaflet only creates the drag handler
 * for an interactive marker, and on re-creation restores the handler's previous
 * enabled state instead of the current option.
 *
 * react-leaflet won't diff `interactive` itself — see
 * https://github.com/PaulLeCam/react-leaflet/issues/843, closed with the stance
 * that it only mirrors props Leaflet has a setter for, and that apps wanting
 * more should wrap the layer in a custom component
 * (`createLayerComponent`/`createPathComponent`, as the tile layers here do).
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

export function RichMarker({
  autoOpenPopup,
  markerType = 'pin',
  color,
  glyphColor,
  faIcon,
  iconSvg,
  image,
  imageOpacity,
  label,
  ...restProps
}: Props): ReactElement {
  const markerRef = useRef<Leaflet.Marker | null>(null);

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

  const icon = useMemo(
    () =>
      new MarkerLeafletIcon({
        iconAnchor:
          markerType === 'ring' || markerType === 'square'
            ? [12, 12]
            : markerIconOptions.iconAnchor,
        tooltipAnchor:
          markerType === 'ring' || markerType === 'square'
            ? [0, -10]
            : [0, -35],
        iconSize: markerIconOptions.iconSize,
        icon: (
          <MarkerIcon
            color={color}
            glyphColor={glyphColor}
            faIcon={faIcon}
            iconSvg={iconSvg}
            image={image}
            imageOpacity={imageOpacity}
            label={label}
            markerType={markerType}
          />
        ),
      }),
    [
      color,
      glyphColor,
      faIcon,
      iconSvg,
      image,
      imageOpacity,
      label,
      markerType,
    ],
  );

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

export class MarkerLeafletIcon extends Icon<
  BaseIconOptions & { icon: ReactElement }
> {
  createIcon(oldIcon?: HTMLElement & { _fm_root?: HTMLElement }): HTMLElement {
    const reuse = oldIcon?.tagName === 'DIV';

    const div = (
      reuse ? oldIcon : document.createElement('div')
    ) as HTMLElement & { _fm_root?: Root };

    if (!div._fm_root) {
      // Leaflet's Icon._setIconStyles is an untyped internal method.
      (this as any)._setIconStyles(div, 'icon');

      div._fm_root = createRoot(div);

      div._fm_root.render(this.options.icon);
    }

    div._fm_root.render(this.options.icon);

    return div;
  }

  createShadow(oldIcon?: HTMLElement): HTMLElement {
    return oldIcon ?? document.createElement('div');
  }
}

export function MarkerIcon({
  image,
  imageOpacity,
  faIcon,
  iconSvg,
  color = COLORS.normal,
  glyphColor,
  label,
  markerType,
}: MarkerIconProps): ReactElement {
  // Split any alpha off the color: the solid RGB paints the shape, while the
  // alpha is applied as a group `opacity` on the whole marker (shape + white
  // inset + glyph) so the entire marker fades uniformly rather than only its
  // background.
  const { color: fillColor, opacity } = splitColorAlpha(color);

  const glyphFill = glyphColor ?? fillColor;

  // A `poi` icon is external multi-color artwork drawn for a light background,
  // so it always keeps the white inset; the glyphs painted in `glyphFill` get
  // whichever inset they read on.
  const insetFill = image ? GLYPH_INSET_LIGHT : glyphInsetColor(glyphFill);

  // A glyph (label text, poi image or Font Awesome icon) fills the white inset;
  // this flag also drives whether the inset is drawn.
  const hasContent = Boolean(label || image || faIcon || iconSvg);

  // The glyph is drawn at a fixed size centered on each shape's inset, so its
  // on-screen size does not depend on the marker shape.
  const renderGlyph = (cx: number, cy: number) => {
    // Scale the icon's longer side to GLYPH_SIZE and center it. Drawn as a plain
    // <path> (not a nested <svg>) to avoid the latter's overflow clipping.
    let iconTransform: string | undefined;

    // A `react-icons` element is a self-contained `<svg viewBox=…>`; clone it
    // into a GLYPH_SIZE box centered on the inset so it scales exactly like
    // `image`/`iconSvg`. Its `fill="currentColor"` resolves to the wrapping
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
    // instead of each filling the box. Icons absent from the table (e.g.
    // malformed) fall back to filling the full GLYPH_SIZE box.
    const imageGlyph =
      image &&
      (() => {
        const bbox = poiIconBBoxes[image];

        const rect = bbox
          ? poiIconGlyphRect(bbox, cx, cy, GLYPH_SIZE)
          : {
              x: cx - GLYPH_SIZE / 2,
              y: cy - GLYPH_SIZE / 2,
              width: GLYPH_SIZE,
              height: GLYPH_SIZE,
            };

        return <image {...rect} xlinkHref={image} opacity={imageOpacity} />;
      })();

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

        {imageGlyph}

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
        >
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
        >
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
        >
          <path
            d="M 156.063 11.734 C 74.589 11.734 8.53 79.093 8.53 162.204 C 8.53 185.48 13.716 207.552 22.981 227.212 C 23.5 228.329 156.063 493.239 156.063 493.239 L 287.546 230.504 C 297.804 210.02 303.596 186.803 303.596 162.204 C 303.596 79.093 237.551 11.734 156.063 11.734 Z"
            fill={fillColor}
          />

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
