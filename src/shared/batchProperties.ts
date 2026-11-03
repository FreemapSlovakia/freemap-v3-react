import type { PropRow } from '@features/drawing/components/DrawingPropsEditor.js';
import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import type { FeatureProperties } from '@shared/components/FeaturePropertiesModal.js';

/** Which features a batch edit takes: every one, or those of one kind. */
export type BatchKind = 'all' | 'points' | 'lines' | 'polygons';

/** How many features of each kind there are. */
export type BatchCounts = Record<Exclude<BatchKind, 'all'>, number>;

/** What a batch edit writes only where the user changed it. */
export type BatchField = Exclude<keyof FeatureProperties, 'props' | 'type'>;

export type Batch = {
  count: number;
  /** Which shapes there are among the features, for what a label can name. */
  has: BatchCounts;
  /** Fields whose values differ between the features. */
  mixed: ReadonlySet<BatchField>;
  /** Property keys not carried with one value by every feature. */
  mixedKeys: ReadonlySet<string>;
};

const POINT_FIELDS: BatchField[] = ['markerType', 'icon'];

const LINE_FIELDS: BatchField[] = ['width', 'dashArray', 'lineCap', 'lineJoin'];

/** The style fields a feature has; `point` says it is one. */
export function styleFields(
  item: FeatureProperties,
  point: boolean,
): BatchField[] {
  return [
    'color',
    ...(point
      ? POINT_FIELDS
      : [
          ...LINE_FIELDS,
          ...(item.type === 'polygon' ? (['fillColor'] as const) : []),
        ]),
  ];
}

/** The colors the user picked in a batch edit, for the recent colors. */
export function pickedColors(
  values: FeatureProperties,
  { touched }: BatchEdit,
): string[] {
  return [
    touched.has('color') ? values.color : undefined,
    touched.has('fillColor') ? values.fillColor : undefined,
  ].filter((color) => color !== undefined);
}

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const differ = (field: BatchField, group: readonly FeatureProperties[]) =>
  group.some((item) => !same(item[field], group[0]![field]));

/**
 * The form many features open with: what they share, else the first one's —
 * blank for the label and a property's value, which a placeholder marks. A
 * style field is compared only among the features that have it.
 */
export function batchOf(
  points: readonly FeatureProperties[],
  lines: readonly FeatureProperties[],
):
  | {
      initial: FeatureProperties;
      batch: Batch;
      /** Which style fields the editor shows. */
      kind: 'point' | 'line-poly' | 'all';
    }
  | undefined {
  const items = [...points, ...lines];

  const [first] = items;

  if (!first) {
    return undefined;
  }

  // Only a polygon has a fill.
  const polygons = lines.filter((line) => line.type === 'polygon');

  const mixed = new Set([
    ...(['label', 'color'] as const).filter((field) => differ(field, items)),
    ...POINT_FIELDS.filter((field) => differ(field, points)),
    ...LINE_FIELDS.filter((field) => differ(field, lines)),
    ...(differ('fillColor', polygons) ? (['fillColor'] as const) : []),
  ]);

  const keys = [
    ...new Set(items.flatMap((item) => Object.keys(item.props ?? {}))),
  ];

  const mixedKeys = new Set(
    keys.filter((key) =>
      items.some(
        (item) =>
          item.props?.[key] === undefined ||
          item.props[key] !== first.props?.[key],
      ),
    ),
  );

  return {
    initial: {
      ...(lines[0] ?? first),
      ...(points[0] && {
        markerType: points[0].markerType,
        icon: points[0].icon,
      }),
      color: first.color,
      fillColor: polygons[0]?.fillColor,
      label: mixed.has('label') ? '' : first.label,
      // A polygon among them is what brings up the fill.
      type: polygons.length > 0 ? 'polygon' : first.type,
      props: Object.fromEntries(
        keys.map((key) => [key, mixedKeys.has(key) ? '' : first.props![key]!]),
      ),
    },
    batch: {
      count: items.length,
      has: {
        points: points.length,
        lines: lines.length - polygons.length,
        polygons: polygons.length,
      },
      mixed,
      mixedKeys,
    },
    kind:
      lines.length === 0 ? 'point' : points.length === 0 ? 'line-poly' : 'all',
  };
}

/** What a batch edit changes, as the editor hands it over. */
export type BatchEdit = {
  /** Fields set on all; the rest stay each feature's own. */
  touched: ReadonlySet<BatchField>;
  rows: readonly PropRow[];
  /** Property keys, by the key a row was opened with, that stay each feature's own. */
  keptKeys: ReadonlySet<string>;
};

/** What a batch edit changes on one feature; empty where it changes nothing. */
export type BatchPatch = Partial<Omit<FeatureProperties, 'type'>>;

const sameProps = (a: DrawingProps, b: DrawingProps) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([key, value]) => b[key] === value);

/**
 * One feature's share of a batch edit: each touched field it has, where it
 * comes out different, and its properties, where they do. A kept row keeps the
 * feature's value under the row's key; a deleted row goes, any other is set.
 */
export function batchPatch(
  item: FeatureProperties,
  point: boolean,
  values: FeatureProperties,
  { touched, rows, keptKeys }: BatchEdit,
): BatchPatch {
  const patch: BatchPatch = {};

  for (const field of ['label' as const, ...styleFields(item, point)]) {
    if (touched.has(field) && !same(values[field], item[field])) {
      Object.assign(patch, { [field]: values[field] });
    }
  }

  const own = item.props ?? {};

  const props: DrawingProps = {};

  for (const [key, value, origin] of rows) {
    const kept = origin !== undefined && keptKeys.has(origin);

    // A kept row's key emptied is still that row; deleting it is the trash's.
    const name = key.trim() || (kept ? origin : '');

    if (!name) {
      continue;
    }

    if (!kept) {
      props[name] = value;
    } else if (Object.hasOwn(own, origin)) {
      props[name] = own[origin]!;
    }
  }

  if (!sameProps(props, own)) {
    patch.props = props;
  }

  return patch;
}

/** The features a batch edit changes, each as `toChange` makes it of its patch. */
export function batchChanges<T>(
  items: readonly { index: number; item: FeatureProperties; point: boolean }[],
  values: FeatureProperties,
  edit: BatchEdit,
  toChange: (index: number, patch: BatchPatch) => T,
): T[] {
  return items.flatMap(({ index, item, point }) => {
    const patch = batchPatch(item, point, values, edit);

    return Object.keys(patch).length > 0 ? [toChange(index, patch)] : [];
  });
}
