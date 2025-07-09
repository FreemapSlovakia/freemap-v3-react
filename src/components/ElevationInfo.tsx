import { pointToTile } from '@mapbox/tilebelt';
import { useCallback, useMemo } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { is } from 'typia';
import useLocalStorageState from 'use-local-storage-state';
import { latLonToString } from '../geoutils.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import { integratedLayerDefs, IsTileLayerDef } from '../mapDefinitions.js';
import type { LatLon } from '../types/common.js';

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
  const nf01 = useNumberFormat({
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

  const layers = useAppSelector((state) => state.map.layers);

  const tileLayerTypes = integratedLayerDefs.filter((def) =>
    is<IsTileLayerDef>(def),
  );

  const tileUrls = layers
    .map((type) => ({
      type,
      url: substitute(tileLayerTypes.find((def) => def.type === type)?.url)!, // TODO check if zoom exists
    }))
    .filter(({ url }) => !!url);

  const cookiesEnabled = useAppSelector(
    (state) => !!state.main.cookieConsentResult,
  );

  const serializer = useMemo(() => {
    return cookiesEnabled
      ? undefined
      : {
          stringify() {
            throw new Error('cookies not enabled');
          },
          parse() {
            throw new Error('cookies not enabled');
          },
        };
  }, [cookiesEnabled]);

  const [format, setFormat] = useLocalStorageState<number>('fm.ele.gpsFormat', {
    defaultValue: 0,
    serializer,
  });

  const handleMinusClick = useCallback(() => {
    setFormat((f) => (f > 0 ? f - 1 : f));
  }, [setFormat]);

  const handlePlusClick = useCallback(() => {
    setFormat((f) => (f < 3 ? f + 1 : f));
  }, [setFormat]);

  return (
    <>
      <InputGroup size="sm">
        <Button onClick={handleMinusClick}>
          <FaAngleLeft />
        </Button>
        <Form.Control
          readOnly
          className="fm-fs-content"
          value={
            format === 0
              ? `${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`
              : latLonToString(
                  point,
                  lang,
                  (['D', 'DM', 'DMS'] as const)[format - 1],
                )
          }
        />
        <Button onClick={handlePlusClick}>
          <FaAngleRight />
        </Button>
      </InputGroup>

      {!window.fmEmbedded && (
        <div>
          {tileMessage}: {zoom}/{x}/{y}
          {tileUrls.length > 0 && (
            <>
              {' '}
              (
              {tileUrls.map((o, i) => (
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
