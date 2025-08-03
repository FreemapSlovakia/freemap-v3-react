import { pointToTile } from '@mapbox/tilebelt';
import { useCallback, useMemo } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';
import { TbDecimal } from 'react-icons/tb';
import { is } from 'typia';
import { latLonToString } from '../geoutils.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
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

const FORMATS = ['D', 'DM', 'DMS'] as const;

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

  const [format, setFormat] = usePersistentState<number>(
    'fm.ele.gpsFormat',
    (value) => String(value),
    (value) => (value && /^\d+$/.test(value) ? Number(value) : 0),
  );

  const coordinates = useMemo(
    () =>
      format === 0
        ? `${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`
        : latLonToString(point, lang, FORMATS[format - 1]),
    [format, lang, point],
  );

  const handleNextFormatClick = useCallback(() => {
    setFormat((f) => (f + 1) % FORMATS.length);
  }, [setFormat]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(coordinates);
  }, [coordinates]);

  return (
    <>
      <InputGroup size="sm">
        <Form.Control readOnly className="fm-fs-content" value={coordinates} />

        <Button type="button" onClick={handleNextFormatClick}>
          <TbDecimal />
        </Button>

        <Button type="button" onClick={handleCopyClick}>
          <FaCopy />
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
