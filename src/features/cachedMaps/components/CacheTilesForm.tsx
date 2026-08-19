import { saveSettings } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import { LayerVisibilityFields } from '@features/mapSettings/components/LayerVisibilityFields.js';
import { useOfflineMapExportMessages } from '@features/offlineMapExport/translations/useOfflineMapExportMessages.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { useFreeStorage } from '@shared/hooks/useFreeStorage.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { useTilesSizeEstimate } from '@shared/hooks/useTilesSizeEstimate.js';
import {
  type IntegratedLayerDef,
  type IsTileLayerDef,
  integratedLayerDefs,
} from '@shared/mapDefinitions.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  countCachedOf,
  countTilesInBbox,
  coverageIncludes,
} from '@shared/tileEnumeration.js';
import { pickSubdomain, pickTileScale } from '@shared/tileUrl.js';
import {
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Spinner,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaChevronLeft, FaSave } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  type CachedTileMapDef,
  getCachedTileScale,
} from '../cachedTileMaps.js';
import {
  cachedMapEdited,
  cachedMapsSetView,
  cacheTilesStart,
} from '../model/actions.js';
import { premiumZoomLimit } from '../sourceLayer.js';
import { useCachedMapsMessages } from '../translations/useCachedMapsMessages.js';

type CacheableLayerDef = IntegratedLayerDef<IsTileLayerDef> & {
  url: string;
};

// pre-filled upper bound; the layer's own `maxNativeZoom` still caps it
const DEFAULT_MAX_ZOOM = 16;

// warn once the download would claim this share of the free storage
const QUOTA_HEADROOM = 0.9;

// Rough cost model behind the "this may take a while" warning: every tile costs
// one request (latency, spread over the batches the download runs in) and its
// bytes cost bandwidth. Neither term alone catches both a million tiny tiles and
// a handful of hi-DPI ones.
const REQUEST_SECONDS = 0.15;

const CONCURRENT_REQUESTS = 6; // BATCH_SIZE in cacheTilesProcessor

const BYTES_PER_SECOND = 1_250_000; // ~10 Mbps

const LARGE_DOWNLOAD_SECONDS = 5 * 60;

type Props = {
  /** The map being modified; absent when a new one is being added. */
  editing?: CachedTileMapDef;
};

export function CacheTilesForm({ editing }: Props): ReactElement {
  const m = useMessages();

  const ome = useOfflineMapExportMessages();

  const cm = useCachedMapsMessages();

  const dispatch = useDispatch();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const mapDefs = useMemo(() => {
    const integrated = integratedLayerDefs
      .filter((def): def is CacheableLayerDef => def.technology === 'tile')
      .map((layer) => {
        const url = layer.url.startsWith('//')
          ? `https:${layer.url}`
          : layer.url;

        return { ...layer, url };
      });

    // WMS is not offered: `buildTileUrl` substitutes only {x}/{y}/{z}, so every
    // WMS tile would collapse to one cache entry, while the rendered layer asks
    // for per-tile `?…&BBOX=…` URLs that are not in the cache. See TODO.md.
    const custom = customLayers
      .filter((def) => def.technology === 'tile')
      .map((def) => ({
        ...def,
        icon: undefined as ReactElement | undefined,
        countries: undefined as string[] | undefined,
        superseededBy: undefined as string | undefined,
        experimental: undefined as boolean | undefined,
      }));

    return [...integrated, ...custom];
  }, [customLayers]);

  const layers = useAppSelector((state) => state.map.layers);

  const [mapType, setMapType] = useState(
    editing?.sourceType ??
      mapDefs.find((def) => layers.includes(def.type))?.type ??
      mapDefs[0]?.type ??
      '',
  );

  const mapDef = useMemo(
    () => mapDefs.find((def) => def.type === mapType),
    [mapType, mapDefs],
  );

  // Editing keeps the layer and the scale as they were downloaded — changing
  // either invalidates every stored tile. The source layer can meanwhile have
  // been removed from the registry (a deleted custom layer), so the map's own
  // metadata stands in for it; the zoom range then can't be grown past what is
  // already cached, there being nothing left to say how deep the source goes.
  const urlTemplate = editing?.url ?? mapDef?.url;

  const limitMinZoom = editing && !mapDef ? editing.minZoom : mapDef?.minZoom;

  const user = useAppSelector((state) => state.auth.user);

  const premiumLimit = premiumZoomLimit(editing?.sourceType ?? mapType, user);

  // The field keeps the range a map was given while premium: capping it below
  // what is already downloaded would make even a rename delete tiles. Growing it
  // is another matter — see `premiumWiden` — and fetching those zooms is refused
  // outright by the download itself.
  const sourceMaxZoom =
    editing && !mapDef ? editing.maxNativeZoom : mapDef?.maxNativeZoom;

  const limitMaxZoom =
    premiumLimit === undefined
      ? sourceMaxZoom
      : Math.min(
          sourceMaxZoom ?? Infinity,
          Math.max(premiumLimit, editing?.maxNativeZoom ?? 0),
        );

  const [name, setName] = useState(editing?.name ?? '');

  const [nameChanged, setNameChanged] = useState(editing !== undefined);

  const [iconSpec, setIconSpec] = useState(editing?.iconSpec);

  /** Whether the icon is the user's to keep rather than the source layer's. */
  const iconChanged = useRef(editing !== undefined);

  const [minZoom, setMinZoom] = useState(String(editing?.minZoom ?? 0));

  const [maxZoom, setMaxZoom] = useState(String(editing?.maxNativeZoom ?? 0));

  // A map that recorded no scale still holds one, and the estimate has to
  // sample that variant or be off by its area. The same guess the download
  // falls back to when probing the cache turns nothing up.
  const [scale, setScale] = useState(
    String(editing ? getCachedTileScale(editing) : 1),
  );

  const { area, setArea, bbox, startSelecting } = useMapAreaSelection(
    editing?.bounds,
  );

  const [networkFallback, setNetworkFallback] = useState(
    editing?.networkFallback !== false,
  );

  const [showInMenu, setShowInMenu] = useState(
    editing ? (layersSettings[editing.type]?.showInMenu ?? true) : true,
  );

  const [showInToolbar, setShowInToolbar] = useState(
    editing ? (layersSettings[editing.type]?.showInToolbar ?? false) : false,
  );

  // Where the two toggles started, so a save can tell whether they were touched:
  // they are the only part of this form kept on the server, and everything else
  // about a cached map — its name, icon, area, zoom range — is the browser's own.
  const initialVisibility = useRef({ showInMenu, showInToolbar }).current;

  useEffect(() => {
    if (editing || !mapDef) {
      return;
    }

    // scales are per-layer; default to what this screen would display
    setScale(String(pickTileScale(mapDef.extraScales)));

    setMinZoom(String(mapDef.minZoom ?? 0));

    setMaxZoom(
      String(
        Math.max(
          mapDef.minZoom ?? 0,
          Math.min(limitMaxZoom ?? Infinity, DEFAULT_MAX_ZOOM),
        ),
      ),
    );
  }, [mapDef, editing, limitMaxZoom]);

  // A copy of a custom map starts out with that map's own icon, so the offline
  // one is recognizable the same way.
  useEffect(() => {
    if (!iconChanged.current) {
      setIconSpec(mapDef && 'iconSpec' in mapDef ? mapDef.iconSpec : undefined);
    }
  }, [mapDef]);

  useEffect(() => {
    setName((prev) => {
      if (prev && nameChanged) {
        return prev;
      }

      const layerName = m?.mapLayers.letters[mapType] ?? mapType;

      return cm?.namePrefix ? `${cm.namePrefix} ${layerName}` : layerName;
    });
  }, [m, cm, mapType, nameChanged]);

  const tileCount = useMemo(() => {
    if (!bbox) {
      return undefined;
    }

    return countTilesInBbox(bbox, Number(minZoom), Number(maxZoom));
  }, [bbox, minZoom, maxZoom]);

  const online = useOnline();

  // The visibility toggles below are settings, which a signed-in account keeps
  // on the server; the rest of this form is the browser's own.
  const canSaveSettings = useCanSaveSettings();

  // What caching will actually fetch: everything for a new map, for an edited
  // one everything the previous download didn't already get to. Where it got to
  // matters as much as how far — moving the area onto tiles a stopped download
  // never reached leaves them all to fetch.
  const tilesToAdd = useMemo(() => {
    if (tileCount === undefined || !bbox || !editing) {
      return tileCount;
    }

    const held = countCachedOf(
      {
        bounds: editing.bounds,
        minZoom: editing.minZoom ?? 0,
        maxZoom: editing.maxNativeZoom ?? 18,
      },
      { bounds: bbox, minZoom: Number(minZoom), maxZoom: Number(maxZoom) },
      editing.downloadedCount,
    );

    return Math.max(0, tileCount - held);
  }, [bbox, minZoom, maxZoom, editing, tileCount]);

  // A map is allowed to keep premium zooms it already downloaded, but not to
  // take them over ground it didn't cover — that would fetch premium tiles
  // afresh. Only the part of the range past the limit is pinned this way, so
  // the free zooms can still be widened. Where the new range stops short of the
  // limit there is nothing to compare, and `coverageIncludes` says so.
  const premiumWiden =
    premiumLimit !== undefined &&
    editing !== undefined &&
    bbox !== undefined &&
    !coverageIncludes(
      {
        bounds: editing.bounds,
        minZoom: Math.max(editing.minZoom ?? 0, premiumLimit + 1),
        maxZoom: editing.maxNativeZoom ?? 18,
      },
      {
        bounds: bbox,
        minZoom: Math.max(Number(minZoom), premiumLimit + 1),
        maxZoom: Number(maxZoom),
      },
    );

  // Offline a map can only be narrowed: reaching past what it covers would have
  // to fetch. Asked of the coverage, not of the tiles still missing — a stopped
  // or premium-skipped download leaves those behind, and renaming such a map
  // needs no connection.
  const offlineWiden =
    !online &&
    (editing === undefined ||
      bbox === undefined ||
      !coverageIncludes(
        {
          bounds: editing.bounds,
          minZoom: editing.minZoom ?? 0,
          maxZoom: editing.maxNativeZoom ?? 18,
        },
        {
          bounds: bbox,
          minZoom: Number(minZoom),
          maxZoom: Number(maxZoom),
        },
      ));

  const cnf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const invalidMinZoom = isInvalidInt(
    minZoom,
    true,
    limitMinZoom ?? 0,
    Math.min(limitMaxZoom ?? Infinity, parseInt(maxZoom, 10) || Infinity),
  );

  const invalidMaxZoom = isInvalidInt(
    maxZoom,
    true,
    Math.max(parseInt(minZoom, 10) || 0, limitMinZoom ?? 0),
    limitMaxZoom,
  );

  // a custom layer may well declare 1 among its extra resolutions, or the same
  // scale twice; a lone 1× is no choice at all, so it hides the picker
  const layerScales = [...new Set([1, ...(mapDef?.extraScales ?? [])])].sort(
    (a, b) => a - b,
  );

  const scales = layerScales.length > 1 ? layerScales : undefined;

  // sample the very variant the download will fetch — the scale is the biggest
  // single lever on the size
  const { bytes: estimatedSize, sampling } = useTilesSizeEstimate({
    urlTemplate,
    subdomain: pickSubdomain(
      (editing && 'subdomains' in editing ? editing.subdomains : undefined) ??
        mapDef?.subdomains,
    ),
    bbox,
    minZoom: Number(minZoom),
    maxZoom: Number(maxZoom),
    tileCount,
    estimateForCount: tilesToAdd,
    scale: Number(scale),
    enabled: !invalidMinZoom && !invalidMaxZoom,
  });

  const freeSpace = useFreeStorage();

  const overQuota =
    estimatedSize !== undefined &&
    freeSpace !== undefined &&
    estimatedSize > freeSpace * QUOTA_HEADROOM;

  const largeDownload =
    estimatedSize !== undefined &&
    tilesToAdd !== undefined &&
    (tilesToAdd * REQUEST_SECONDS) / CONCURRENT_REQUESTS +
      estimatedSize / BYTES_PER_SECOND >
      LARGE_DOWNLOAD_SECONDS;

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!bbox || premiumWiden || offlineWiden) {
        return;
      }

      let type: string;

      if (editing) {
        type = editing.type;

        dispatch(
          cachedMapEdited({
            prev: editing,
            next: {
              ...editing,
              name,
              iconSpec,
              minZoom: parseInt(minZoom, 10),
              maxNativeZoom: parseInt(maxZoom, 10),
              bounds: bbox,
              tileCount: tileCount ?? 0,
              networkFallback,
            },
          }),
        );
      } else {
        if (!mapDef) {
          return;
        }

        type = Math.random().toString(36).slice(2);

        // strip integrated-only / non-serializable fields (icon, shortcut, etc.);
        // `bbox` is the source layer's declared coverage — a cached map's real
        // extent is its `bounds`, set below
        const {
          icon: _icon,
          shortcut: _shortcut,
          defaultInToolbar: _dt,
          defaultInMenu: _dm,
          countries: _countries,
          superseededBy: _s,
          experimental: _e,
          layerPreview: _lp,
          premiumFromZoom: _p,
          bbox: _bbox,
          ...rest
        } = mapDef as Record<string, unknown> & typeof mapDef;

        const meta = {
          ...rest,
          type,
          name,
          iconSpec,
          sourceType: mapDef.type,
          minZoom: parseInt(minZoom, 10),
          maxNativeZoom: parseInt(maxZoom, 10),
          bounds: bbox,
          tileCount: tileCount ?? 0,
          downloadedCount: 0,
          cacheName: `tiles-${type}`,
          createdAt: new Date().toISOString(),
          sizeBytes: 0,
          tileScale: Number(scale),
          networkFallback,
        } as CachedTileMapDef;

        dispatch(cacheTilesStart(meta));
      }

      // A new map has no entry yet, so it always writes one; an edit writes only
      // when the toggles moved. Without this an offline rename would fail on a
      // settings request it never needed.
      if (
        !editing ||
        showInMenu !== initialVisibility.showInMenu ||
        showInToolbar !== initialVisibility.showInToolbar
      ) {
        dispatch(
          saveSettings({
            settings: {
              layersSettings: {
                ...layersSettings,
                [type]: {
                  ...(layersSettings[type] ?? {}),
                  showInMenu,
                  showInToolbar,
                },
              },
            },
            keepOpen: true,
          }),
        );
      }
    },
    [
      dispatch,
      editing,
      premiumWiden,
      offlineWiden,
      name,
      iconSpec,
      mapDef,
      minZoom,
      maxZoom,
      scale,
      bbox,
      tileCount,
      layersSettings,
      showInMenu,
      showInToolbar,
      initialVisibility,
      networkFallback,
    ],
  );

  function getItem(def: (typeof mapDefs)[number]) {
    return <MapLayerItem def={def} />;
  }

  return (
    <form onSubmit={handleSubmit} className="d-contents">
      <Modal.Header closeButton>
        <Modal.Title>
          <BiWifiOff /> {editing ? cm?.modifyOfflineMap : cm?.cacheOfflineMap}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group controlId="mapType">
          <Form.Label>{ome?.map}</Form.Label>

          {editing ? (
            <div className="form-control-plaintext mb-3">
              {mapDef ? (
                getItem(mapDef)
              ) : (
                <MapLayerItem
                  def={{
                    type: editing.sourceType,
                    layer: editing.layer,
                    name: editing.name,
                  }}
                />
              )}
            </div>
          ) : (
            <Dropdown className="mb-3" onSelect={(value) => setMapType(value!)}>
              <Dropdown.Toggle as={SelectToggle} className="w-100">
                {mapDef ? getItem(mapDef) : '???'}
              </Dropdown.Toggle>

              <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
                {mapDefs.map((def) => (
                  <Dropdown.Item
                    as="button"
                    type="button"
                    key={def.type}
                    eventKey={def.type}
                  >
                    {getItem(def)}
                  </Dropdown.Item>
                ))}
              </FmDropdownMenu>
            </Dropdown>
          )}
        </Form.Group>

        <Form.Group controlId="downloadArea">
          <Form.Label>{ome?.downloadArea}</Form.Label>

          <MapAreaToggle
            className="mb-3"
            area={area}
            onSelectVisible={() => setArea('visible')}
            onSelectArea={startSelecting}
          />
        </Form.Group>

        <div className="d-flex gap-3 align-items-end mb-3">
          <Form.Group controlId="name" className="flex-grow-1 min-w-0">
            <Form.Label>{m?.general.name}</Form.Label>

            <Form.Control
              type="text"
              value={name}
              onChange={(e) => {
                setNameChanged(true);
                setName(e.currentTarget.value);
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="d-block" htmlFor="cachedMapIcon">
              {m?.general.icon}
            </Form.Label>

            <IconPicker
              id="cachedMapIcon"
              selected={iconSpec}
              placeholder={<MdDashboardCustomize />}
              onSelect={(spec) => {
                iconChanged.current = true;

                setIconSpec(spec);
              }}
            />
          </Form.Group>
        </div>

        {urlTemplate && (
          <Form.Group controlId="zoomRange" className="mb-3">
            <Form.Label className="required">
              {ome?.zoomRange}

              {/* the range stops short of the layer's premium zooms; the gem
                  says why, there being no checkerboard on a cached map */}
              {premiumLimit !== undefined && (
                <PremiumGem hint={cm?.premiumZoomHint} />
              )}
            </Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={limitMinZoom ?? 0}
                max={limitMaxZoom ?? 18}
                value={minZoom}
                isInvalid={invalidMinZoom}
                onChange={(e) => setMinZoom(e.currentTarget.value)}
              />

              <InputGroup.Text>&ndash;</InputGroup.Text>

              <Form.Control
                type="number"
                min={limitMinZoom ?? 0}
                max={limitMaxZoom ?? 18}
                value={maxZoom}
                isInvalid={invalidMaxZoom}
                onChange={(e) => setMaxZoom(e.currentTarget.value)}
              />
            </InputGroup>
          </Form.Group>
        )}

        {editing
          ? editing.tileScale !== undefined && (
              <Form.Group className="mb-3">
                <Form.Label>{ome?.scale}</Form.Label>

                <div className="form-control-plaintext">
                  {editing.tileScale}×
                </div>
              </Form.Group>
            )
          : scales && (
              <Form.Group controlId="scale" className="mb-3">
                <Form.Label>{ome?.scale}</Form.Label>

                <ToggleButtonGroup
                  type="radio"
                  name="scale"
                  value={scale}
                  onChange={setScale}
                  className="d-flex"
                >
                  {scales.map((s) => (
                    <ToggleButton
                      key={s}
                      id={`scale-${s}`}
                      value={String(s)}
                      variant="outline-primary"
                    >
                      {s}×
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Form.Group>
            )}

        <Form.Group className="mb-3">
          <Form.Check
            id="networkFallback"
            type="checkbox"
            checked={networkFallback}
            label={cm?.networkFallback}
            onChange={(e) => setNetworkFallback(e.currentTarget.checked)}
          />

          <Form.Text>{cm?.networkFallbackHint}</Form.Text>
        </Form.Group>

        <Form.Group>
          <LayerVisibilityFields
            disabled={!canSaveSettings}
            showInMenu={showInMenu}
            showInToolbar={showInToolbar}
            onChange={(v) => {
              setShowInMenu(v.showInMenu);
              setShowInToolbar(v.showInToolbar);
            }}
          />
        </Form.Group>

        {tilesToAdd !== undefined &&
          tilesToAdd !== Infinity &&
          !invalidMinZoom &&
          !invalidMaxZoom && (
            <>
              {/* the quota alert says the same thing more urgently */}
              {largeDownload && !overQuota && (
                <Alert variant="warning" className="mt-3 mb-0">
                  {cm?.largeDownload({
                    tiles: cnf.format(tilesToAdd),
                    size: sampling ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      formatSize(estimatedSize!)
                    ),
                  })}
                </Alert>
              )}

              {/* only once measured — the fallback is too crude to alarm with */}
              {overQuota && !sampling && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {cm?.notEnoughSpace({
                    size: formatSize(estimatedSize!),
                    free: formatSize(freeSpace!),
                  })}
                </Alert>
              )}
            </>
          )}

        {premiumWiden && (
          <Alert variant="warning" className="mt-3 mb-0">
            {cm?.premiumWiden}
          </Alert>
        )}

        {offlineWiden && (
          <Alert variant="warning" className="mt-3 mb-0">
            {/* A new map is nothing but a download, so the narrowing advice
                the edit form gives would make no sense here. */}
            <BiWifiOff />{' '}
            {editing ? cm?.offlineWiden : m?.general.offlineNotice}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="flex-wrap">
        {tileCount !== undefined && (
          <div className="w-100 text-end">
            {cm?.tiles}: <b>{cnf.format(tileCount)}</b>
            {editing && tilesToAdd !== undefined && (
              <>
                {' '}
                | {cm?.toDownload}: <b>{cnf.format(tilesToAdd)}</b>
              </>
            )}
            {estimatedSize !== undefined && (
              <>
                {' '}
                | {cm?.estSize}:{' '}
                {sampling ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <b>{formatSize(estimatedSize)}</b>
                )}
              </>
            )}
          </div>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={
            invalidMinZoom ||
            invalidMaxZoom ||
            premiumWiden ||
            offlineWiden ||
            !tileCount ||
            tileCount === Infinity ||
            !name.trim()
          }
        >
          <FaSave /> {editing ? m?.general.save : cm?.startCaching}{' '}
          <kbd>Enter</kbd>
        </Button>

        <Button
          variant="dark"
          onClick={() => dispatch(cachedMapsSetView('list'))}
        >
          <FaChevronLeft /> {m?.general.back}
        </Button>
      </Modal.Footer>
    </form>
  );
}
