import { useMessages } from 'fm3/l10nInjector';
import { AttributionDef, baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';

export function Attribution(): ReactElement {
  const mapType = useSelector((state) => state.map.mapType);

  const overlays = useSelector((state) => state.map.overlays);

  const m = useMessages();

  return (
    <ul className="pl-4 pt-3">
      {categorize(
        [
          ...baseLayers.filter(({ type }) => mapType === type),
          ...overlayLayers.filter(({ type }) =>
            (overlays as string[]).includes(type),
          ),
        ].reduce((a, b) => [...a, ...b.attribution], [] as AttributionDef[]),
      ).map(({ type, attributions }) => (
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
              >
                {a.name || (a.nameKey && m?.mapLayers.attr[a.nameKey])}
              </a>
            ) : (
              a.name || (a.nameKey && m?.mapLayers.attr[a.nameKey])
            ),
          ])}
        </li>
      ))}
      {/* {imhd && (
        <li>
          {'; '}
          {m?.routePlanner.imhdAttribution}
          {' ©\xa0'}
          <a href="https://imhd.sk" target="_blank" rel="noopener noreferrer">
            imhd.sk
          </a>
        </li>
      )} */}
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
