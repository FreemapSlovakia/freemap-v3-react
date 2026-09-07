import type { ConvertCarry } from '@app/store/actions.js';
import {
  interpolateLabel,
  PROPERTY_PREFIX,
} from '@features/drawing/interpolateLabel.js';
import { withProps } from '@features/drawing/labelValues.js';
import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type ModalAnswer,
  type ModalBodyProps,
  type ModalOptions,
  useModal,
} from '@shared/components/ModalProvider.js';
import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import { PlaceholderHint } from '@shared/components/PlaceholderHint.js';
import {
  convertibleProps,
  defaultLabel,
  ownTable,
} from '@shared/featureProperties.js';
import {
  metersToPosition,
  positionToMeters,
  SimplifyFields,
} from '@shared/simplifyDialog.js';
import { suggestSimplifyTolerance } from '@shared/simplifyTolerance.js';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Form,
  Spinner,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaPencilAlt } from 'react-icons/fa';
import classes from './convertDialog.module.css';

export type ConvertKind = 'point' | 'line' | 'polygon' | 'mixed';

/** The token a label writes to reach a carried property. */
function token(key: string): string {
  return `{${PROPERTY_PREFIX}${key}}`;
}

/** The same token, as a pattern that reads the keys back out of a label. */
const TOKEN = new RegExp(`\\{${PROPERTY_PREFIX}([^}]+)\\}`, 'g');

export type ConvertRequest = {
  title?: ReactNode;
  icon?: ReactNode;
  /** Shown above the fields; a warning that has to be seen. */
  preamble?: ReactNode;
  /** How the features are to meet what the target already holds; the caller words it. */
  merge?: {
    label: ReactNode;
    hint?: ReactNode;
    append: ReactNode;
    replace: ReactNode;
  };
  /** Each feature's carryable properties: the union is offered, the first previewed. */
  props?: DrawingProps[];
  /** What the label starts as; `{p:key}` reaches the properties above. */
  label?: string;
  /** Which keys start ticked. Absent, only `name` does. */
  keys?: string[];
  /** Geometry the simplify slider measures. Omitted, it isn't offered. */
  lines?: Position[][];
  /**
   * Fetches the element's own geometry when that is chosen, at most once. A
   * rejection is left to the conversion to report.
   */
  probeGeometry?: () => Promise<{ lines: Position[][]; kind: ConvertKind }>;
  /** Offer the element's own geometry instead of the point it is drawn at. */
  geometry?: boolean;
  /** That the properties are OSM tags, which the table then links to the wiki. */
  osm?: boolean;
  /** What is being converted; `mixed` also covers a shape not yet known. */
  kind?: ConvertKind;
};

export type ConvertChoices = {
  /** What the converted features take along; goes on the action as it is. */
  carry: ConvertCarry;
  /** Metres; 0 is no simplification. */
  tolerance: number;
  geometry: 'point' | 'full';
  /** Whether to add to what the target holds or replace it; see `merge`. */
  mode: 'append' | 'replace';
};

type Probe = 'loading' | 'failed' | { lines: Position[][]; kind: ConvertKind };

export type Value = {
  keys: string[];
  label: string;
  resolveLabel: boolean;
  position: number;
  /** Metres the geometry suggests; 0 means it is thin enough to leave alone. */
  suggested: number;
  /** What the field opened on; a label still equal to it was never answered. */
  seed: string;
  geometry: 'point' | 'full';
  mode: 'append' | 'replace';
  /** What the element's own geometry turned out to be; see `probeGeometry`. */
  probe: Probe | null;
};

/** Every key the features carry, the most widespread first. */
function keyCounts(props: DrawingProps[]): [key: string, count: number][] {
  const counts = new Map<string, number>();

  for (const one of props) {
    for (const key of Object.keys(one)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts].sort(
    ([a, countA], [b, countB]) => countB - countA || a.localeCompare(b),
  );
}

/**
 * The keys the label names. They are carried whether ticked or not: an
 * unanswered `{p:name}` renders as nothing. A resolved label needs none.
 */
function referencedKeys(label: string, resolveLabel: boolean): Set<string> {
  return new Set(
    resolveLabel ? [] : [...label.matchAll(TOKEN)].map(([, key]) => key),
  );
}

/** A collection's features, or the one feature, as the seed takes them. */
export function featuresOf(
  geojson: Feature | FeatureCollection | null | undefined,
): Feature[] {
  return !geojson
    ? []
    : geojson.type === 'FeatureCollection'
      ? geojson.features
      : [geojson];
}

export function geometryKind(feature: Feature): ConvertKind {
  switch (feature.geometry?.type) {
    case 'Point':
    case 'MultiPoint':
      return 'point';
    case 'Polygon':
    case 'MultiPolygon':
      return 'polygon';
    case 'GeometryCollection':
      return 'mixed';
    default:
      return 'line';
  }
}

/**
 * What the dialog opens on, so accepting it converts as the app would unasked:
 * our own file's label and whole table, else the name alone.
 */
export function conversionSeed(
  features: Feature[],
  /** That a plain line's name is its label here, as the track conversion has it. */
  labelLines = false,
): {
  props: DrawingProps[];
  label: string;
  keys: string[] | undefined;
  kind: ConvertKind;
} {
  const tables = features.map((feature) => ownTable(feature.properties));

  const kinds = [...new Set(features.map(geometryKind))];

  return {
    props: features.map((feature) => convertibleProps(feature.properties)),
    kind: kinds.length === 1 ? kinds[0]! : 'mixed',
    label:
      features
        .map((feature) => defaultLabel(feature, labelLines))
        .find((one) => one !== undefined) ?? '',
    keys: tables.some(Boolean)
      ? [
          ...new Set([
            ...tables.flatMap((table) => Object.keys(table ?? {})),
            // A foreign feature beside ours would otherwise bring nothing.
            ...(features.some(
              (feature, i) => !tables[i] && feature.properties?.['name'],
            )
              ? ['name']
              : []),
          ]),
        ]
      : undefined,
  };
}

function ConvertBody({
  value,
  setValue,
  request,
}: ModalBodyProps<Value> & { request: ConvertRequest }) {
  const m = useMessages();

  const dm = useDrawingMessages();

  const props = request.props ?? [];

  // The promise is kept so a settled probe isn't asked again; the answer goes
  // into the value, where the confirm button can wait on it.
  const probe =
    useRef<Promise<{ lines: Position[][]; kind: ConvertKind }>>(null);

  const own = value.geometry === 'full';

  const started = value.probe !== null;

  // `setValue` is the provider's, and outlives this body: a probe still in
  // flight when the dialog goes would write into whatever opens next.
  const alive = useRef(true);

  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  useEffect(() => {
    if (!own || started || !request.probeGeometry) {
      return;
    }

    setValue((previous) => ({ ...previous, probe: 'loading' }));

    probe.current ??= request.probeGeometry();

    void probe.current.then(
      (result) => {
        if (!alive.current) {
          return;
        }

        // Only now is there a geometry to derive a deviation from, and the
        // slider appears carrying it.
        const suggested = suggestSimplifyTolerance(result.lines);

        setValue((previous) => {
          // A line's name is a street name, which the conversion won't draw —
          // so the field stops offering it, unless the user has typed by now.
          const seed = result.kind === 'line' ? '' : previous.seed;

          return {
            ...previous,
            probe: result,
            suggested,
            position: metersToPosition(suggested),
            seed,
            label: previous.label === previous.seed ? seed : previous.label,
          };
        });
      },
      // Left with no shape and no slider; the conversion reports the failure
      // when it goes on to fetch the element itself.
      () => {
        if (alive.current) {
          setValue((previous) => ({ ...previous, probe: 'failed' }));
        }
      },
    );
  }, [own, started, request.probeGeometry, setValue]);

  const probed = typeof value.probe === 'object' ? value.probe : null;

  // An element's own geometry is a line or an area by the API's reckoning, so
  // until the probe answers there is nothing shape-specific to say.
  const kind = own ? (probed?.kind ?? 'mixed') : (request.kind ?? 'point');

  const lines = own ? probed?.lines : request.lines;

  const probing = value.probe === 'loading';

  const keysHint = {
    point: dm?.edit.pointKeys,
    line: dm?.edit.lineKeys,
    polygon: dm?.edit.polygonKeys,
    // Nothing shape-specific is certain of a shape not yet known.
    mixed: m?.general.convert.labelHint,
  }[kind];

  const counts = useMemo(() => keyCounts(props), [props]);

  const locked = useMemo(
    () => referencedKeys(value.label, value.resolveLabel),
    [value.label, value.resolveLabel],
  );

  const ticked = useMemo(() => new Set(value.keys), [value.keys]);

  // The label field, so a property can be written in at the caret.
  const labelRef = useRef<HTMLInputElement>(null);

  const insert = (expression: string) => {
    const el = labelRef.current;

    // A field reports a selection of 0..0 whether the caret is genuinely at the
    // start or has never been in it at all, so being focused is what tells a
    // caret to write at from no caret to append after.
    const caret =
      el && document.activeElement === el
        ? { at: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 }
        : undefined;

    const { at, end } = caret ?? {
      at: value.label.length,
      end: value.label.length,
    };

    setValue((previous) => ({
      ...previous,
      label:
        previous.label.slice(0, at) + expression + previous.label.slice(end),
    }));

    if (el) {
      const to = at + expression.length;

      requestAnimationFrame(() => {
        el.focus();

        el.setSelectionRange(to, to);
      });
    }
  };

  const preview = useMemo(
    () => interpolateLabel(value.label, withProps(props[0])),
    [value.label, props],
  );

  return (
    <>
      {request.preamble !== undefined && <p>{request.preamble}</p>}

      {request.geometry && (
        <Form.Group className="mb-3">
          <Form.Label className="d-block">
            {m?.general.convert.geometry}
          </Form.Label>

          <ToggleButtonGroup
            type="radio"
            name="convert-geometry"
            value={value.geometry}
          >
            {(['point', 'full'] as const).map((geometry) => (
              <ToggleButton
                key={geometry}
                id={`convert-geometry-${geometry}`}
                variant="outline-primary"
                value={geometry}
                onClick={() =>
                  setValue((previous) => ({ ...previous, geometry }))
                }
              >
                {geometry === 'point'
                  ? m?.general.convert.pointOnly
                  : m?.general.convert.fullGeometry}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Form.Group>
      )}

      {request.props && (
        <>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="convert-label">
              {m?.general.convert.label}
            </Form.Label>

            <Form.Control
              id="convert-label"
              ref={labelRef}
              value={value.label}
              onChange={(e) => {
                const { value: label } = e.target;

                setValue((previous) => ({ ...previous, label }));
              }}
            />

            {keysHint && (
              <Form.Text className="d-block">
                <PlaceholderHint text={keysHint} onInsert={insert} />
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">
              {m?.general.convert.labelMode}
            </Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="convert-label-mode"
              value={value.resolveLabel ? 'resolved' : 'template'}
            >
              {(['template', 'resolved'] as const).map((mode) => (
                <ToggleButton
                  key={mode}
                  id={`convert-label-${mode}`}
                  variant="outline-primary"
                  value={mode}
                  onClick={() =>
                    setValue((previous) => ({
                      ...previous,
                      resolveLabel: mode === 'resolved',
                    }))
                  }
                >
                  {mode === 'resolved'
                    ? m?.general.convert.labelResolved
                    : m?.general.convert.labelTemplate}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* What the label comes out as — the very text "Plain text" stores. */}
            {preview && (
              <Form.Text className="d-block text-truncate">
                {m?.general.convert.preview}: {preview}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">
              {m?.general.convert.properties}
            </Form.Label>

            {counts.length === 0 ? (
              <Form.Text className="d-block">
                {m?.general.convert.noProperties}
              </Form.Text>
            ) : (
              <div className={classes.properties}>
                <Table striped bordered size="sm" className="mb-0 align-middle">
                  <tbody>
                    {counts.map(([key, count]) => (
                      <tr key={key}>
                        <td>
                          <Form.Check
                            className="ms-2"
                            type="checkbox"
                            id={`convert-key-${key}`}
                            checked={locked.has(key) || ticked.has(key)}
                            disabled={locked.has(key)}
                            onChange={(e) => {
                              const { checked } = e.target;

                              setValue((previous) => ({
                                ...previous,
                                keys: checked
                                  ? [...previous.keys, key]
                                  : previous.keys.filter((k) => k !== key),
                              }));
                            }}
                          />
                        </td>

                        <th>
                          <OsmTagKey tag={key} osm={request.osm} />
                        </th>

                        <td className="text-break">
                          {props.length > 1 ? (
                            `× ${count}`
                          ) : (
                            <OsmTagValue
                              tag={key}
                              value={props[0]?.[key] ?? ''}
                              osm={request.osm}
                            />
                          )}
                        </td>

                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => insert(token(key))}
                          >
                            {token(key)}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {locked.size > 0 && (
              <Form.Text className="d-block">
                {m?.general.convert.labelKeysKept}
              </Form.Text>
            )}
          </Form.Group>
        </>
      )}

      {request.merge && (
        <Form.Group className="mb-3">
          <Form.Label className="d-block">{request.merge.label}</Form.Label>

          <ToggleButtonGroup
            type="radio"
            name="convert-mode"
            value={value.mode}
          >
            {(['append', 'replace'] as const).map((mode) => (
              <ToggleButton
                key={mode}
                id={`convert-mode-${mode}`}
                // Replacing throws away what the target holds, and says so.
                variant={
                  mode === 'replace' ? 'outline-danger' : 'outline-primary'
                }
                value={mode}
                onClick={() => setValue((previous) => ({ ...previous, mode }))}
              >
                {mode === 'append'
                  ? request.merge?.append
                  : request.merge?.replace}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {request.merge.hint && (
            <Form.Text className="d-block">{request.merge.hint}</Form.Text>
          )}
        </Form.Group>
      )}

      {probing && (
        <div className="mt-3">
          <Spinner animation="border" size="sm" />
        </div>
      )}

      {lines && value.suggested > 0 && (
        <div className="mt-3">
          <SimplifyFields
            lines={lines}
            value={value.position}
            setValue={(position) =>
              setValue((previous) => ({ ...previous, position }))
            }
          />
        </div>
      )}
    </>
  );
}

function convertModal(
  request: ConvertRequest,
  title: ReactNode,
): ModalOptions<Value> {
  const suggested = request.lines ? suggestSimplifyTolerance(request.lines) : 0;

  const named = request.props?.some((one) => one['name']) ?? false;

  // An object is converted as the point it is drawn at unless its own geometry
  // is chosen, which `ConvertBody` re-seeds for once it knows the shape.
  const seed = request.label ?? (named ? token('name') : '');

  return {
    title: request.title ?? title,
    icon: request.icon ?? <FaPencilAlt />,
    size: 'md',
    initialValue: {
      // Only the name, so what lands in the URL is what was asked for — unless
      // the caller knows better, as it does for a file of ours. The label's own
      // keys join these in `toChoices`.
      keys: request.keys ?? (named ? ['name'] : []),
      label: seed,
      seed,
      resolveLabel: false,
      position: metersToPosition(suggested),
      suggested,
      geometry: 'point',
      // Adding is the safe answer; replacing is the destructive one.
      mode: 'append',
      probe: null,
    },
    // Answering while the element is still on its way would convert it
    // unsimplified, and fetch it a second time to do so.
    confirmDisabled: (value) => value.probe === 'loading',
    body: (props) => <ConvertBody {...props} request={request} />,
  };
}

export function toChoices(answer: ModalAnswer<Value>): ConvertChoices | null {
  if (answer.result === 'cancel') {
    return null;
  }

  const { value } = answer;

  return {
    carry: {
      keys: [
        ...new Set([
          ...value.keys,
          ...referencedKeys(value.label, value.resolveLabel),
        ]),
      ],
      // One field cannot say "keep each of these its own", so a field left as
      // it opened says it instead: each feature keeps the label it would have
      // got.
      label: value.label === value.seed ? undefined : value.label,
      resolveLabel: value.resolveLabel,
    },
    tolerance: positionToMeters(value.position),
    geometry: value.geometry,
    mode: value.mode,
  };
}

/** Asks what to take along on a conversion; `null` when it was cancelled. */
export type ConvertFn = (
  request: ConvertRequest,
) => Promise<ConvertChoices | null>;

export function useConvertPrompt(): ConvertFn {
  const open = useModal();

  const m = useMessages();

  return useCallback(
    async (request) =>
      toChoices(await open(convertModal(request, m?.general.convertToDrawing))),
    [open, m],
  );
}
