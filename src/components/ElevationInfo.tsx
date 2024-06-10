import { pointToTile } from '@mapbox/tilebelt';
import { latLonToString } from 'fm3/geoutils';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { LatLon } from 'fm3/types/common';
import Alert from 'react-bootstrap/Alert';

export type ElevationInfoBaseProps = {
  elevation: number | null;
  point: LatLon;
};

export type ElevationInfoProps = ElevationInfoBaseProps & {
  lang: string;
  tileMessage: string;
  maslMessage: string;
};

export function ElevationInfo({
  lang,
  elevation,
  point,
  tileMessage,
  maslMessage,
}: ElevationInfoProps) {
  const nf01 = new Intl.NumberFormat(lang, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const zoom = useAppSelector((state) => state.map.zoom);

  const [x, y] = pointToTile(point.lon, point.lat, zoom);

  function substitute(url?: string) {
    return url
      ?.replace('{x}', String(x))
      .replace('{y}', String(y))
      .replace('{z}', String(zoom))
      .replace('{s}', 'a');
  }

  const m = useMessages();

  const mapType = useAppSelector((state) => state.map.mapType);

  const overlays = useAppSelector((state) => state.map.overlays);

  const overlayTileUrls = overlays
    .map((type) => ({
      type,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      url: substitute(overlayLayers.find((l) => l.type === type)?.url)!,
    }))
    .filter(({ url }) => !!url);

  const baseTileUrl =
    substitute(baseLayers.find((l) => l.type === mapType)?.url) ?? '';

  return (
    <>
      {(['D', 'DM', 'DMS'] as const).map((format) => (
        <div key={format}>{latLonToString(point, lang, format)}</div>
      ))}

      {!window.fmEmbedded && (
        <div>
          {tileMessage}:{' '}
          <Alert.Link target="_blank" rel="noreferrer" href={baseTileUrl}>
            {zoom}/{x}/{y}
          </Alert.Link>
          {overlayTileUrls.length > 0 && (
            <>
              {' '}
              (
              {overlayTileUrls.map((o, i) => (
                <>
                  {i > 0 ? ', ' : null}
                  <Alert.Link href={o.url}>{o.type}</Alert.Link>
                </>
              ))}
              )
            </>
          )}
        </div>
      )}

      {elevation != null && (
        <div>
          {maslMessage}: {nf01.format(elevation)}&nbsp;{m?.general.masl}
        </div>
      )}
    </>
  );
}
