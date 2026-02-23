import { useMessages } from '@features/l10n/l10nInjector.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { pointToTile } from '@mapbox/tilebelt';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCopyButton } from '@shared/hooks/useCopyButton.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { Fragment, useCallback, useMemo } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { TbDecimal } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import {
  integratedLayerDefs,
  IsTileLayerDef,
} from '../../../mapDefinitions.js';
import { latLonToString } from '../../../shared/geoutils.js';
import type { LatLon } from '../../../types/common.js';

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

  function substitute({
    url,
    maxNativeZoom,
    extraScales = [],
  }: IsTileLayerDef) {
    const [scale] = [1, ...extraScales]
      .map((scale) => [scale, Math.abs(devicePixelRatio - scale)] as const)
      .reduce((min, val) => (val[1] < min[1] ? val : min));

    const z =
      maxNativeZoom === undefined || maxNativeZoom >= zoom
        ? zoom
        : maxNativeZoom;

    const [x, y] = pointToTile(point.lon, point.lat, z);

    return (
      url
        .replace('{x}', String(x))
        .replace('{y}', String(y))
        .replace('{z}', String(z))
        .replace('{s}', 'a') + (scale !== 1 ? `@${scale}x` : '')
    );
  }

  const m = useMessages();

  const layers = useAppSelector((state) => state.map.layers);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const tileLayerDefs = [...integratedLayerDefs, ...customLayers].filter(
    (def) => is<IsTileLayerDef>(def),
  );

  const tileUrls = layers
    .map((type) => tileLayerDefs.find((def) => def.type === type))
    .filter((def): def is (typeof tileLayerDefs)[0] => !!def)
    .filter((def) => def.minZoom !== undefined && def.minZoom <= zoom) // TODO consider scale?
    .map((def) => ({
      ...def,
      tileUrl: substitute(def),
    }));

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

  const copyButton = useCopyButton(coordinates);

  const dispatch = useDispatch();

  return (
    <>
      {elevation != null && (
        <div>
          {maslMessage}: <b>{nf01.format(elevation)}</b>&nbsp;{m?.general.masl}
        </div>
      )}

      <InputGroup size="sm" className="my-2">
        <Form.Control readOnly className="fm-fs-content" value={coordinates} />

        <Button type="button" onClick={handleNextFormatClick}>
          <TbDecimal />
        </Button>

        {copyButton}
      </InputGroup>

      {!window.fmEmbedded && (
        <div>
          {tileMessage}:{' '}
          <Alert.Link
            onClick={(e) => {
              e.preventDefault();
              dispatch(searchSetQuery({ query: `${zoom}/${x}/${y}` }));
            }}
            href={'#q=' + encodeURIComponent(`${zoom}/${x}/${y}`)}
            target="_blank"
          >
            {zoom}/{x}/{y}
          </Alert.Link>
          {tileUrls.length > 0 && (
            <>
              {' '}
              (
              {tileUrls.map((def, i) => (
                <Fragment key={def.type}>
                  {i > 0 ? ', ' : null}
                  <Alert.Link href={def.tileUrl} target="_blank">
                    {'name' in def
                      ? (def.name ?? def.type)
                      : (m?.mapLayers.letters[def.type] ?? def.type)}
                  </Alert.Link>
                </Fragment>
              ))}
              )
            </>
          )}
        </div>
      )}
    </>
  );
}
