import {
  DocumentSchema,
  documentShow,
} from '@features/documents/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
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

function useCategorizedAttribution(layers: string[], countries?: string[]) {
  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedAttrs = cachedMaps
    .filter((cm) => layers.includes(cm.type) && cm.attribution)
    .flatMap((cm) => cm.attribution!);

  const categorized = categorize(
    [
      ...integratedLayerDefs
        .filter(({ type }) => layers.includes(type))
        .flatMap((def) => def.attribution),
      ...cachedAttrs,
    ].filter(
      (def) => !countries || !def.country || countries.includes(def.country),
    ),
  );

  const esriAttribution = useAppSelector((state) => state.map.esriAttribution);

  return { categorized, esriAttribution };
}

/**
 * Plain-text attribution for the given layers and covered countries, suitable
 * for baking into an exported map. Mirrors {@link useResolvedAttribution} but
 * flattens to a string and skips attributions whose label is not plain text.
 */
export function useResolvedAttributionText(
  layers: string[],
  countries?: string[],
): string | null {
  const m = useMessages();

  const { categorized, esriAttribution } = useCategorizedAttribution(
    layers,
    countries,
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
): [string, ReactElement][] | null {
  const m = useMessages();

  const { categorized, esriAttribution } = useCategorizedAttribution(
    layers,
    countries,
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

  for (const attribution of attributions) {
    let x = res[attribution.type];

    if (!x) {
      x = [];

      res[attribution.type] = x;
    }

    if (!x.includes(attribution)) {
      x.push(attribution);
    }
  }

  const keys = Object.keys(res) as AttributionDef['type'][];

  return keys.map((type) => ({
    type,
    attributions: res[type] as AttributionDef[],
  }));
}
