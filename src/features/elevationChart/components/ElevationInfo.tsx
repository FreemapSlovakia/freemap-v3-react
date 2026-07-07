import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { pointToTile } from '@mapbox/tilebelt';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCopyButton } from '@shared/hooks/useCopyButton.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import {
  type IsTileLayerDef,
  integratedLayerDefs,
  isTileLayerDef,
} from '@shared/mapDefinitions.js';
import type { LatLon } from '@shared/types/common.js';
import { Fragment, useCallback, useMemo } from 'react';
import { Alert, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { TbDecimal } from 'react-icons/tb';
import { useDispatch } from 'react-redux';

export type ElevationInfoBaseProps = {
  elevation: number | null | undefined;
  point: LatLon;
  loading: boolean;
};

export type ElevationInfoProps = ElevationInfoBaseProps & {
  lang: string;
  tileMessage: string;
  maslMessage: string;
};

const FORMATS = ['D', 'DM', 'DMS'] as const;

const toFormat = (value: string | null) =>
  value && /^\d+$/.test(value) ? Number(value) : 0;

export function ElevationInfo({
  lang,
  elevation,
  loading,
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

  const prm = usePremiumMessages();

  const layers = useAppSelector((state) => state.map.layers);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const tileLayerDefs = [...integratedLayerDefs, ...customLayers].filter(
    isTileLayerDef,
  );

  const tileUrls = layers
    .map((type) => tileLayerDefs.find((def) => def.type === type))
    .filter((def): def is (typeof tileLayerDefs)[0] => Boolean(def))
    .filter((def) => def.minZoom !== undefined && def.minZoom <= zoom) // TODO consider scale?
    .map((def) => ({
      ...def,
      tileUrl: substitute(def),
    }));

  const [format, setFormat] = usePersistentState<number>(
    'fm.ele.gpsFormat',
    String,
    toFormat,
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
      {loading ? (
        <div>
          {maslMessage}: <Spinner animation="border" size="sm" />
        </div>
      ) : elevation === undefined ? null : elevation === null ? (
        <div>
          {maslMessage}: <span className="text-muted">—</span>
        </div>
      ) : (
        <div>
          {maslMessage}: <b>{nf01.format(elevation)}</b>&nbsp;{m?.general.masl}
          <PremiumGem className="ms-1" hint={prm?.higherPrecisionElevation} />
        </div>
      )}

      <InputGroup size="sm" className="my-2">
        <Form.Control readOnly className="fm-fs-content" value={coordinates} />

        <Button onClick={handleNextFormatClick}>
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
            href={`#q=${encodeURIComponent(`${zoom}/${x}/${y}`)}`}
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
