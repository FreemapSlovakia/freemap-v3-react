import * as React from 'react';
import { baseLayers, overlayLayers, AttributionDef } from 'fm3/mapDefinitions';
import { Translator } from 'fm3/l10nInjector';

interface Props {
  t: Translator;
  imhd: boolean;
  mapType: string; // TODO enum
  overlays: string[]; // TODO enum
}

const Attribution: React.FC<Props> = ({ t, mapType, overlays, imhd }) => {
  return (
    <ul style={{ padding: '10px 0 0 20px' }}>
      {categorize(
        [
          ...baseLayers.filter(({ type }) => mapType === type),
          ...overlayLayers.filter(({ type }) => overlays.includes(type)),
        ].reduce((a, b) => [...a, ...b.attribution], [] as AttributionDef[]),
      ).map(({ type, attributions }) => (
        <li key={type}>
          {t(`mapLayers.type.${type}`)}{' '}
          {attributions.map((a, j) => [
            j > 0 ? ', ' : '',
            a.url ? (
              <a
                key={a.type}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {a.name || (a.nameKey && t(a.nameKey))}
              </a>
            ) : (
              a.name || (a.nameKey && t(a.nameKey))
            ),
          ])}
        </li>
      ))}
      {imhd && (
        <li>
          {'; '}
          {t('routePlanner.imhdAttribution')}
          {' ©\xa0'}
          <a href="https://imhd.sk" target="_blank" rel="noopener noreferrer">
            imhd.sk
          </a>
        </li>
      )}
    </ul>
  );
};

function categorize(
  attributions: AttributionDef[],
): Array<{ type: string; attributions: AttributionDef[] }> {
  const res: { [type: string]: AttributionDef[] } = {};

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

  return Object.keys(res).map(type => ({ type, attributions: res[type] }));
}

export default Attribution;
