import type { RootState } from '@app/store/store.js';
import {
  DocumentSchema,
  documentShow,
} from '@features/documents/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { legTransports } from '@features/routePlanner/model/legTransports.js';
import { SONNY_ATTR } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import { Fragment, type ReactElement, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  type AttributionDef,
  FIXTHEMAP_ATTR,
  integratedLayerDefs,
  OSM_DATA_ATTR,
  OSRM_ROUTING_ATTR,
} from '../mapDefinitions.js';

type Props = { unknown: string };

const PREFIX = '?document=';

/**
 * Maps the `state.map.countries` tri-state to the country filter that
 * {@link useResolvedAttribution} expects: not yet loaded (`undefined`) → `[]`
 * to hide country-specific providers until coverage is known, error (`null`) →
 * `undefined` to show all providers, loaded → the country list itself.
 */
export function toAttributionCountries(
  countriesState: string[] | null | undefined,
): string[] | undefined {
  return countriesState === undefined
    ? []
    : countriesState === null
      ? undefined
      : countriesState;
}

/**
 * Tells whether an attribution applies to the covered `countries`: a
 * country-specific source needs its country in the list, and a global fallback
 * (`exceptCountries`) needs at least one covered country the national sources
 * don't serve. An `undefined` country list means "unknown", so everything shows.
 */
function coversCountries(
  def: AttributionDef,
  countries: string[] | undefined,
): boolean {
  return (
    !countries ||
    ((!def.country || countries.includes(def.country)) &&
      (!def.exceptCountries ||
        countries.some((country) => !def.exceptCountries?.includes(country))))
  );
}

export function Attribution({ unknown }: Props): ReactElement {
  const layers = useAppSelector((state) => state.map.layers);

  const countriesState = useAppSelector((state) => state.map.countries);

  const attribution = useResolvedAttribution(
    layers,
    toAttributionCountries(countriesState),
  );

  return attribution === null ? (
    <div>{unknown}</div>
  ) : (
    <ul className="m-0 ps-3">
      {attribution.map(([type, elem]) => (
        <li key={type}>{elem}</li>
      ))}
    </ul>
  );
}

/**
 * Whether a standing result was answered by `api`. A multimodal route is asked
 * of both routers leg by leg, so both can be true at once. The free tier ignores
 * the per-leg overrides, which this doesn't model: crediting a router that
 * didn't answer is the lesser error, dropping one that did is the licence
 * breach.
 */
function answeredBy(
  routePlanner: RootState['routePlanner'],
  api: 'gh' | 'osrm',
): boolean {
  const { alternatives, isochrones, mode, points, transportType } =
    routePlanner;

  if (alternatives.length === 0 && !isochrones?.length) {
    return false;
  }

  // Only an ordered route is planned leg by leg; every other mode — and a
  // result with no legs to read, an isochrone above all — goes by the default.
  const legs = mode === 'route' ? legTransports(points, transportType) : [];

  return (legs.length > 0 ? legs : [transportType]).some(
    (transport) => transportTypeDefs[transport]?.api === api,
  );
}

/**
 * The credits a standing route or isochrone earns.
 *
 * The data it is derived from: both routers read OSM, so the line on screen is
 * OSM-derived whatever is drawn under it — over an aerial layer nothing else
 * would credit it — and GraphHopper's graph is weighted by Sonny's terrain
 * model, so that shapes every route it returns, not only the profiles that
 * display its values. Either may already be credited by a layer; {@link
 * categorize} drops the duplicate.
 *
 * `routing` is left to the service that answered, and only OSRM is somebody
 * else's to name — the GraphHopper behind it is ours to run.
 *
 * Selected as two booleans and assembled here: a selector returning a fresh
 * array would compare unequal on every store change.
 */
export function useRoutingAttributions(): AttributionDef[] {
  const graphhopper = useAppSelector((state) =>
    answeredBy(state.routePlanner, 'gh'),
  );

  const osrm = useAppSelector((state) =>
    answeredBy(state.routePlanner, 'osrm'),
  );

  return useMemo(
    () =>
      graphhopper || osrm
        ? [
            OSM_DATA_ATTR,
            ...(graphhopper ? [SONNY_ATTR] : []),
            ...(osrm ? [OSRM_ROUTING_ATTR] : []),
          ]
        : [],
    [graphhopper, osrm],
  );
}

/**
 * `linked` says the output renders anchors, which is what decides whether the
 * "fix the map" obligation applies: it is a link or it is nothing, and baking
 * its label into an exported image would only add noise.
 */
function useCategorizedAttribution(
  layers: string[],
  countries?: string[],
  creditRouting = true,
  linked = false,
) {
  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedAttrs = cachedMaps
    .filter((cm) => layers.includes(cm.type) && cm.attribution)
    .flatMap((cm) => cm.attribution!);

  const routingAttrs = useRoutingAttributions();

  const defs = [
    ...integratedLayerDefs
      .filter(({ type }) => layers.includes(type))
      .flatMap((def) => def.attribution),
    ...cachedAttrs,
    ...(creditRouting ? routingAttrs : []),
  ].filter((def) => coversCountries(def, countries));

  const categorized = categorize(
    linked && defs.some((def) => def.nameKey === 'osmData')
      ? [...defs, FIXTHEMAP_ATTR]
      : defs,
  );

  const esriAttribution = useAppSelector((state) => state.map.esriAttribution);

  return { categorized, esriAttribution };
}

/**
 * Plain-text attribution for the given layers and covered countries, suitable
 * for baking into an exported map. Mirrors {@link useResolvedAttribution} but
 * flattens to a string and skips attributions whose label is not plain text.
 *
 * `creditRouting` is what the caller says about the route: an export that leaves
 * it out must not carry the routers' credit either.
 */
export function useResolvedAttributionText(
  layers: string[],
  countries?: string[],
  creditRouting = true,
): string | null {
  const m = useMessages();

  const { categorized, esriAttribution } = useCategorizedAttribution(
    layers,
    countries,
    creditRouting,
  );

  if (categorized.length === 0) {
    return null;
  }

  const parts = categorized
    .map(({ type, attributions }) => {
      const names = attributions
        .map((a) => a.name ?? (a.nameKey ? m?.mapLayers.attr[a.nameKey] : ''))
        .filter(
          (name): name is string => typeof name === 'string' && name !== '',
        );

      return names.length === 0
        ? ''
        : `${m?.mapLayers.type[type] ?? ''} ${names.join(', ')}`.trim();
    })
    .filter(Boolean);

  if (esriAttribution?.length) {
    parts.push(esriAttribution.join(', '));
  }

  return parts.length === 0 ? null : parts.join('; ');
}

export function useResolvedAttribution(
  layers: string[],
  countries?: string[],
  creditRouting = true,
): [string, ReactElement][] | null {
  const m = useMessages();

  const { categorized, esriAttribution } = useCategorizedAttribution(
    layers,
    countries,
    creditRouting,
    true,
  );

  const dispatch = useDispatch();

  return categorized.length === 0
    ? null
    : categorized.map(
        ({ type, attributions }) =>
          [
            type,
            <>
              {m?.mapLayers.type[type]}{' '}
              {attributions.map((a, j) => [
                j > 0 ? ', ' : '',
                a.url ? (
                  <a
                    key={j}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!a.url?.startsWith(PREFIX)) {
                        return;
                      }

                      const doc = DocumentSchema.safeParse(
                        a.url.slice(PREFIX.length),
                      );

                      if (!doc.success) {
                        return;
                      }

                      e.preventDefault();

                      dispatch(documentShow(doc.data));
                    }}
                  >
                    {a.name || (a.nameKey && m?.mapLayers.attr[a.nameKey])}
                  </a>
                ) : (
                  <Fragment key={j}>
                    {a.name || (a.nameKey && m?.mapLayers.attr[a.nameKey])}
                  </Fragment>
                ),
              ])}
              {esriAttribution?.map((a) => `, ${a}`).join('') ?? ''}
            </>,
          ] as const,
      );
}

function categorize(
  attributions: AttributionDef[],
): { type: AttributionDef['type']; attributions: AttributionDef[] }[] {
  const res: Partial<Record<AttributionDef['type'], AttributionDef[]>> = {};

  // the same source can be listed by several layers under separate defs
  const seen = new Set<string>();

  for (const attribution of attributions) {
    let x = res[attribution.type];

    if (!x) {
      x = [];

      res[attribution.type] = x;
    }

    const key = `${attribution.type}\0${attribution.name ?? attribution.nameKey}\0${attribution.url}`;

    if (!seen.has(key)) {
      seen.add(key);

      x.push(attribution);
    }
  }

  const keys = Object.keys(res) as AttributionDef['type'][];

  return keys.map((type) => ({
    type,
    attributions: res[type] as AttributionDef[],
  }));
}
