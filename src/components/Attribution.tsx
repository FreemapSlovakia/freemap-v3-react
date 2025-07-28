import { Fragment, ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { documentShow } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { AttributionDef, integratedLayerDefs } from '../mapDefinitions.js';

type Props = { unknown: string };

const PREFIX = '?document=';

export function Attribution({ unknown }: Props): ReactElement {
  const layers = useAppSelector((state) => state.map.layers);

  const m = useMessages();

  const categorized = categorize(
    integratedLayerDefs
      .filter(({ type }) => layers.includes(type))
      .reduce((a, b) => [...a, ...b.attribution], [] as AttributionDef[]),
  );

  const esriAttribution = useAppSelector((state) => state.map.esriAttribution);

  const dispatch = useDispatch();

  return categorized.length === 0 ? (
    <div>{unknown}</div> // TODO translate
  ) : (
    <ul className="m-0 ms-n4 me-n4">
      {categorized.map(({ type, attributions }) => (
        <li key={type}>
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

                  e.preventDefault();

                  dispatch(documentShow(a.url.slice(PREFIX.length)));
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
          {esriAttribution?.map((a) => ', ' + a).join('') ?? ''}
        </li>
      ))}
    </ul>
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
