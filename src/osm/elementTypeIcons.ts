import type { OsmFeatureId } from '@shared/types/featureId.js';
import { GenIcon, type IconTree, type IconType } from 'react-icons';

// After the OSM wiki's element icons (Category:Element icon), redrawn in
// `currentColor`: the wiki's fixed colours vanish on a selected row and in the
// dark theme. Strokes are heavier, as these are drawn at text size.

const FRAME: IconTree = {
  tag: 'rect',
  attr: {
    // Inset by more than half the stroke, which a rounded-off edge pixel
    // would otherwise clip.
    x: '16',
    y: '16',
    width: '224',
    height: '224',
    rx: '36',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '20',
  },
  child: [],
};

const VERTICES: [number, number][] = [
  [169, 58],
  [57, 145],
  [195, 199],
];

/**
 * How much the wiki's drawing is shrunk towards the centre, clear of the
 * inset frame; dots and strokes are thickened back by as much.
 */
const INNER_SCALE = 0.72;

const vertex = ([cx, cy]: [number, number]): IconTree => ({
  tag: 'circle',
  attr: { cx: String(cx), cy: String(cy), r: '36', fill: 'currentColor' },
  child: [],
});

const segment = (d: string): IconTree => ({
  tag: 'path',
  attr: {
    d,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '26',
    strokeOpacity: '0.5',
    strokeLinejoin: 'round',
  },
  child: [],
});

const icon = (...children: IconTree[]) =>
  GenIcon({
    tag: 'svg',
    attr: { viewBox: '0 0 256 256', strokeWidth: '0' },
    child: [...children, FRAME],
  });

/** An icon whose drawing is shrunk inside the frame. */
const innerIcon = (...children: IconTree[]) =>
  icon({
    tag: 'g',
    attr: {
      transform: `translate(128 128) scale(${INNER_SCALE}) translate(-128 -128)`,
    },
    child: children,
  });

const WAY_PATH = 'M169 58L57 145L195 199';

const NodeIcon: IconType = icon({
  tag: 'circle',
  attr: {
    // The relation's ring, as its scale leaves it.
    cx: '128',
    cy: '128',
    r: '29',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '19',
  },
  child: [],
});

const WayIcon: IconType = innerIcon(segment(WAY_PATH), ...VERTICES.map(vertex));

/** A way whose last node is its first. */
const ClosedWayIcon: IconType = innerIcon(
  segment(`${WAY_PATH}Z`),
  ...VERTICES.map(vertex),
);

const RelationIcon: IconType = innerIcon(
  // From the ring's outer edge, so the ring stays empty.
  segment('M125 68L196 62M118 98L196 142M68 125L62 196M98 118L142 196'),
  ...(
    [
      [196, 62],
      [196, 142],
      [62, 196],
      [142, 196],
    ] as [number, number][]
  ).map(vertex),
  {
    tag: 'circle',
    attr: {
      cx: '72',
      cy: '72',
      r: '40',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '26',
    },
    child: [],
  },
);

/** An OSM element type's glyph, wherever the type is shown. */
const ELEMENT_ICONS: Record<OsmFeatureId['elementType'], IconType> = {
  node: NodeIcon,
  way: WayIcon,
  relation: RelationIcon,
};

/** The type's glyph; a way's as closed where its last node is its first. */
export function elementTypeIcon(
  type: OsmFeatureId['elementType'],
  closed: boolean,
): IconType {
  return type === 'way' && closed ? ClosedWayIcon : ELEMENT_ICONS[type];
}
