import { setActiveModal } from '@app/store/actions.js';
import { authInit } from '@features/auth/model/actions.js';
import { CreditsAlert } from '@features/credits/components/CredistAlert.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  type IntegratedLayerDef,
  type IsTileLayerDef,
  integratedLayerDefs,
} from '@shared/mapDefinitions.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { countTilesInBbox } from '@shared/tileEnumeration.js';
import { bboxPolygon } from '@turf/bbox-polygon';
import type { BBox } from 'geojson';
import {
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaDatabase, FaDownload, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { downloadMap } from '../model/actions.js';
import { useOfflineMapExportMessages } from '../translations/useOfflineMapExportMessages.js';

type Props = { show: boolean };

export default function OfflineMapExportModal({
  show,
}: Props): ReactElement | null {
  const m = useMessages();

  const ome = useOfflineMapExportMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState('');

  const [nameChanged, setNameChanged] = useState(false);

  const [email, setEmail] = useState(user?.email ?? '');

  const [minZoom, setMinZoom] = useState('0');

  const [maxZoom, setMaxZoom] = useState('0');

  const {
    area,
    setArea,
    selecting: selectingArea,
    bbox,
    startSelecting,
  } = useMapAreaSelection();

  const mapDefs = useMemo(
    () =>
      integratedLayerDefs
        .filter(
          (
            def,
          ): def is IntegratedLayerDef<
            IsTileLayerDef & {
              creditsPerMTile: number;
            }
          > => def.technology === 'tile' && def.creditsPerMTile !== undefined,
        )
        .map((layer) => ({
          ...layer,
          overlay: layer.layer === 'overlay', // TODO make server understand `layer` property
          url: layer.url.startsWith('//') ? 'http:' + layer.url : layer.url,
        })),
    [],
  );

  // for server: src/downloadableMaps.ts
  // console.log(
  //   JSON.stringify(
  //     mapDefs.map((mapDef) => ({
  //       type: mapDef.type,
  //       url: mapDef.url,
  //       extraScales: mapDef.extraScales,
  //       minZoom: mapDef.minZoom,
  //       maxNativeZoom: mapDef.maxNativeZoom,
  //       creditsPerMTile: mapDef.creditsPerMTile,
  //       layer: mapDef.layer,
  //       attribution: mapDef.attribution
  //         .map(
  //           (a) =>
  //             a.type +
  //             ': ' +
  //             (a.nameKey ? (m?.mapLayers.attr[a.nameKey] ?? '') : a.name),
  //         )
  //         .join(', '),
  //     })),
  //   ),
  // );

  const layers = useAppSelector((state) => state.map.layers);

  const [mapType, setMapType] = useState(
    mapDefs.find(
      (mapDef) => mapDef.creditsPerMTile && layers.includes(mapDef.type),
    )?.type ?? 'X',
  );

  const [format, setFormat] = useState('mbtiles');

  const [scale, setScale] = useState('1');

  const mapDef = useMemo(
    () => mapDefs.find((def) => def.type === mapType),
    [mapType, mapDefs],
  );

  useEffect(() => {
    if (!mapDef) {
      return;
    }

    setMinZoom(String(mapDef.minZoom ?? 0));

    setMaxZoom(String(mapDef.maxNativeZoom));
  }, [mapDef]);

  const tileCount = useMemo(() => {
    if (!bbox) {
      return undefined;
    }

    return countTilesInBbox(bbox, Number(minZoom), Number(maxZoom));
  }, [bbox, minZoom, maxZoom]);

  const cnf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const invalidMinZoom = isInvalidInt(
    minZoom,
    true,
    mapDef?.minZoom ?? 0,
    Math.min(
      mapDef?.maxNativeZoom ?? Infinity,
      parseInt(maxZoom, 10) || Infinity,
    ),
  );

  const invalidMaxZoom = isInvalidInt(
    maxZoom,
    true,
    Math.max(parseInt(minZoom, 10) || 0, mapDef?.minZoom ?? 0),
    mapDef?.maxNativeZoom,
  );

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      dispatch(
        downloadMap({
          email,
          name,
          map: mapType,
          format,
          maxZoom: parseInt(maxZoom, 10),
          minZoom: parseInt(minZoom, 10),
          scale: parseInt(scale, 10),
          boundary: bboxPolygon(bbox as BBox),
        }),
      );
    },
    [dispatch, email, name, mapType, format, maxZoom, minZoom, scale, bbox],
  );

  // refresh user (credits)
  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const price = (() => {
    const price =
      mapDef && tileCount
        ? Math.ceil((tileCount * mapDef.creditsPerMTile) / 1_000_000)
        : 0;

    return price < 1_000_000_000 ? price : Infinity;
  })();

  const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    setName((name) =>
      name && nameChanged ? name : (m?.mapLayers.letters[mapType] ?? ''),
    );
  }, [m, mapType, nameChanged]);

  function getItem(def: IntegratedLayerDef) {
    return <MapLayerItem def={def} />;
  }

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      className={selectingArea ? 'd-none' : undefined}
      backdropClassName={selectingArea ? 'd-none' : undefined}
      enforceFocus={!selectingArea}
      scrollable
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaDatabase /> {m?.mainMenu.offlineMapExport}{' '}
            <ExperimentalFunction />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div>
            <p>
              <strong>{ome?.usageIntro}</strong>
            </p>
            <ul>
              <li>
                <strong>{ome?.usageDesktop}</strong>{' '}
                <a href="https://qgis.org/" target="_blank">
                  QGIS
                </a>{' '}
                (Windows/macOS/Linux),{' '}
                <a href="https://www.maptiler.com/desktop/" target="_blank">
                  MapTiler Desktop
                </a>
              </li>

              <li>
                <strong>{ome?.usageAndroid}</strong>{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=menion.android.locus"
                  target="_blank"
                >
                  Locus Map
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=menion.android.locus.pro"
                  target="_blank"
                >
                  OruxMaps
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=com.bodunov.galileo"
                  target="_blank"
                >
                  Guru Maps
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=net.osmand"
                  target="_blank"
                >
                  OsmAnd
                </a>
              </li>

              <li>
                <strong>{ome?.usageIos}</strong>{' '}
                <a
                  href="https://apps.apple.com/app/guru-maps-offline-maps-gps/id1032458712"
                  target="_blank"
                >
                  Guru Maps
                </a>
                ,{' '}
                <a
                  href="https://apps.apple.com/app/map-plus/id123456789"
                  target="_blank"
                >
                  Map Plus
                </a>
                ,{' '}
                <a
                  href="https://apps.apple.com/us/app/osmand-maps-travel-navigate/id934850257"
                  target="_blank"
                >
                  OsmAnd
                </a>
              </li>

              <li>
                <strong>{ome?.usageWeb}</strong> {ome?.usageWebLead}{' '}
                <a
                  href="https://github.com/consbio/mbtileserver"
                  target="_blank"
                  rel="noreferrer"
                >
                  mbtileserver
                </a>{' '}
                {ome?.usageWebMid}{' '}
                <a
                  href="https://github.com/maptiler/tileserver-gl"
                  target="_blank"
                  rel="noreferrer"
                >
                  TileServer GL
                </a>
                {ome?.usageWebTrail}
              </li>
            </ul>
          </div>

          <CreditsAlert buy price={price} />

          <hr />

          <Form.Group controlId="mapType">
            <Form.Label>{ome?.map}</Form.Label>

            <Dropdown className="mb-3" onSelect={(value) => setMapType(value!)}>
              <Dropdown.Toggle as={SelectToggle} className="w-100">
                {mapDef ? getItem(mapDef) : ome?.unknownMapType}
              </Dropdown.Toggle>

              <Dropdown.Menu popperConfig={sameMinWidthPopperConfig}>
                {mapDefs.map((def) => (
                  <Dropdown.Item key={def.type} eventKey={def.type}>
                    {getItem(def)}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
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

          <Form.Group controlId="name" className="mb-3">
            <Form.Label>{ome?.name}</Form.Label>

            <Form.Control
              type="text"
              value={name}
              onChange={(e) => {
                setNameChanged(true);
                setName(e.currentTarget.value);
              }}
            />
          </Form.Group>

          <Form.Group controlId="format" className="mb-3">
            <Form.Label>{ome?.format}</Form.Label>

            <ButtonGroup className="d-block">
              <LongPressTooltip label={ome?.formatMbtilesTooltip}>
                {({ props }) => (
                  <ToggleButton
                    id="downloadFormat-mbtiles"
                    type="radio"
                    name="downloadFormat"
                    variant="outline-primary"
                    value="mbtiles"
                    checked={format === 'mbtiles'}
                    onChange={() => setFormat('mbtiles')}
                    {...props}
                  >
                    {ome?.formatMbtiles}
                  </ToggleButton>
                )}
              </LongPressTooltip>

              <LongPressTooltip label={ome?.formatSqlitedbTooltip}>
                {({ props }) => (
                  <ToggleButton
                    id="downloadFormat-sqlitedb"
                    type="radio"
                    name="downloadFormat"
                    variant="outline-primary"
                    value="sqlitedb"
                    checked={format === 'sqlitedb'}
                    onChange={() => setFormat('sqlitedb')}
                    {...props}
                  >
                    {ome?.formatSqlitedb}
                  </ToggleButton>
                )}
              </LongPressTooltip>
            </ButtonGroup>
          </Form.Group>

          {mapDef && (
            <Form.Group controlId="zoomRange" className="mb-3">
              <Form.Label className="required">{ome?.zoomRange}</Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={mapDef.minZoom ?? 0}
                  max={mapDef.maxNativeZoom}
                  value={minZoom}
                  isInvalid={invalidMinZoom}
                  onChange={(e) => setMinZoom(e.currentTarget.value)}
                />

                <InputGroup.Text>&ndash;</InputGroup.Text>

                <Form.Control
                  type="number"
                  min={mapDef.minZoom ?? 0}
                  max={mapDef.maxNativeZoom}
                  value={maxZoom}
                  isInvalid={invalidMaxZoom}
                  onChange={(e) => setMaxZoom(e.currentTarget.value)}
                />
              </InputGroup>
            </Form.Group>
          )}

          {mapDef?.extraScales && (
            <Form.Group controlId="scale" className="mb-3">
              <Form.Label>{ome?.scale}</Form.Label>

              <ToggleButtonGroup
                type="radio"
                name="scale"
                value={scale}
                onChange={setScale}
                className="d-flex"
              >
                {[1, ...mapDef.extraScales].map((scale) => (
                  <ToggleButton
                    key={scale}
                    id={`scale-${scale}`}
                    value={String(scale)}
                    variant="outline-primary"
                  >
                    {scale}×
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Form.Group>
          )}

          <Form.Group controlId="email" className="mb-3">
            <Form.Label className="required">{ome?.email}</Form.Label>

            <Form.Control
              type="email"
              value={email}
              required
              isInvalid={invalidEmail}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <Form.Text className="text-muted">{ome?.emailInfo}</Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="flex-wrap">
          {tileCount !== undefined && mapDef && (
            <div className="w-100 text-end">
              {ome?.summaryTiles}: <b>{cnf.format(tileCount)}</b> ｜{' '}
              <span
                className={
                  price >= Math.floor(user?.credits ?? 0) ? 'text-danger' : ''
                }
              >
                {ome?.summaryPrice(<b>{cnf.format(price)}</b>)}
              </span>
            </div>
          )}

          <Button
            variant="primary"
            onClick={close}
            type="submit"
            disabled={
              invalidEmail ||
              invalidMinZoom ||
              invalidMaxZoom ||
              price >= Math.floor(user?.credits ?? 0)
            }
          >
            <FaDownload /> {m?.general.export} <kbd>Enter</kbd>
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
