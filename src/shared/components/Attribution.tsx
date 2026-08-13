import {
  DocumentSchema,
  documentShow,
} from '@features/documents/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { legTransports } from '@features/routePlanner/model/legTransports.js';
import { SONNY_ROUTING_ATTR } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import { Fragment, type ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { type AttributionDef, integratedLayerDefs } from '../mapDefinitions.js';

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
 * Whether a GraphHopper result stands. Its graph is weighted by Sonny's terrain
 * model, so the model is credited for any route or isochrone it produced — the
 * elevation chart credits only what the drawn profile displays, which past the
 * free tier is our own terrain model instead.
 *
 * A multimodal route is asked of both routers leg by leg, so one GraphHopper leg
 * under an OSRM default is enough. The free tier ignores the per-leg overrides,
 * which this doesn't model: crediting a source that didn't answer is the lesser
 * error, dropping one that did is the licence breach.
 */
function useHasGraphhopperResult(): boolean {
  return useAppSelector((state) => {
    const { alternatives, isochrones, mode, points, transportType } =
      state.routePlanner;

    if (alternatives.length === 0 && !isochrones?.length) {
      return false;
    }

    // Only an ordered route is planned leg by leg; every other mode — and a
    // result with no legs to read, an isochrone above all — goes by the default.
    const legs = mode === 'route' ? legTransports(points, transportType) : [];

    return (legs.length > 0 ? legs : [transportType]).some(
      (transport) => transportTypeDefs[transport]?.api === 'gh',
    );
  });
}

function useCategorizedAttribution(
  layers: string[],
  countries?: string[],
  creditRouting = true,
) {
  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedAttrs = cachedMaps
    .filter((cm) => layers.includes(cm.type) && cm.attribution)
    .flatMap((cm) => cm.attribution!);

  const graphhopperResult = useHasGraphhopperResult();

  const categorized = categorize(
    [
      ...integratedLayerDefs
        .filter(({ type }) => layers.includes(type))
        .flatMap((def) => def.attribution),
      ...cachedAttrs,
      ...(creditRouting && graphhopperResult ? [SONNY_ROUTING_ATTR] : []),
    ].filter((def) => coversCountries(def, countries)),
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
                    key={a.type}
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
                  <Fragment key={a.type}>
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
