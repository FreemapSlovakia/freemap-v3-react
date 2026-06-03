import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  useResolvedAttribution,
  useResolvedAttributionText,
} from '@shared/components/Attribution.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { bboxPolygon } from '@turf/bbox-polygon';
import storage from 'local-storage-fallback';
import {
  ChangeEvent,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Form,
  InputGroup,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import {
  FaBicycle,
  FaCompass,
  FaCopyright,
  FaDownload,
  FaHiking,
  FaHorse,
  FaPrint,
  FaRulerHorizontal,
  FaSkiing,
  FaTimes,
} from 'react-icons/fa';
import { GiHills } from 'react-icons/gi';
import { RxTarget } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import z from 'zod';
import {
  ExportablesSelector,
  useAvailableExportables,
} from '@/features/mapFeaturesExport/components/ExportablesSelector.js';
import type { Exportable } from '@/features/mapFeaturesExport/model/actions.js';
import {
  CustomLayerOrder,
  CustomLayerOrderSchema,
  EXPORTABLE_LAYERS,
  ExportableLayer,
  ExportableLayerSchema,
  exportMapToDocument,
  Format,
  FormatSchema,
} from '../model/actions.js';

type Props = { show: boolean };

const LAYER_ICONS: Record<ExportableLayer, ReactElement> = {
  contours: <RxTarget />,
  shading: <GiHills />,
  hikingTrails: <FaHiking />,
  bicycleTrails: <FaBicycle />,
  skiTrails: <FaSkiing />,
  horseTrails: <FaHorse />,
};

const LAYERS_STORAGE_KEY = 'fm.mapToDocumentExport.layers';

const MAP_LAYERS = ['X'];

function identity<T>(value: T): T {
  return value;
}

const toScale = (value: string | null) => value ?? '100';

const toExportFormat = (value: string | null) =>
  FormatSchema.safeParse(value).data ?? 'jpeg';

const toCustomLayerOrder = (value: string | null) =>
  CustomLayerOrderSchema.safeParse(value).data ?? 'topmost';

const fromBool = (value: boolean) => (value ? '1' : '0');

// default on
const toBool = (value: string | null) => value !== '0';

export default function MapToDocumentExportModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const {
    area,
    setArea,
    areaBbox,
    selecting: selectingArea,
    startSelecting,
  } = useMapAreaSelection();

  const [scale, setScale] = usePersistentState<string>(
    'fm.exportMap.scale',
    identity,
    toScale,
  );

  const [customLayerOrder, setCustomLayerOrder] = usePersistentState<
    'topmost' | 'natural'
  >('fm.exportMap.customLayerOrder', identity, toCustomLayerOrder);

  const [format, setFormat] = usePersistentState<Format>(
    'fm.exportMap.format',
    identity,
    toExportFormat,
  );

  const [scaleBar, setScaleBar] = usePersistentState<boolean>(
    'fm.exportMap.scaleBar',
    fromBool,
    toBool,
  );

  const [northArrow, setNorthArrow] = usePersistentState<boolean>(
    'fm.exportMap.northArrow',
    fromBool,
    toBool,
  );

  const [attributionEnabled, setAttributionEnabled] =
    usePersistentState<boolean>('fm.exportMap.attribution', fromBool, toBool);

  const [layers, setLayers] = useState(() => {
    const layers = storage.getItem(LAYERS_STORAGE_KEY);

    if (!layers) {
      return new Set(EXPORTABLE_LAYERS);
    }

    const set = new Set<ExportableLayer>();

    for (const str of layers.split(',')) {
      const a = ExportableLayerSchema.safeParse(str);

      if (a.success) {
        set.add(a.data);
      }
    }

    return set;
  });

  // Vector feature sources (drawing, route, objects, …) selected via the shared
  // exportables vocabulary; default to whatever currently has data, like the
  // data-export modal.
  const availableExportables = useAvailableExportables();

  const [exportables, setExportables] = useState(availableExportables);

  useEffect(() => {
    setExportables(availableExportables);
  }, [availableExportables]);

  const dispatch = useDispatch();

  function close() {
    dispatch(setActiveModal(null));
  }

  const invalidScale = isInvalidInt(scale, true, 60, 960);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const toggleLayer = useCallback(
    (layer: ExportableLayer) => {
      setLayers((prev) => {
        const n = new Set(prev);

        if (n.has(layer)) {
          n.delete(layer);
        } else {
          n.add(layer);
        }

        if (cookiesEnabled) {
          storage.setItem(LAYERS_STORAGE_KEY, [...n].join(','));
        }

        return n;
      });
    },
    [cookiesEnabled],
  );

  const handleScaleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setScale(e.currentTarget.value);
    },
    [setScale],
  );

  const handleCustomLayerOrderChange = useCallback(
    (value: CustomLayerOrder) => {
      setCustomLayerOrder(value);
    },
    [setCustomLayerOrder],
  );

  const handleDecorationsChange = useCallback(
    (values: ('scaleBar' | 'northArrow' | 'attribution')[]) => {
      setScaleBar(values.includes('scaleBar'));
      setNorthArrow(values.includes('northArrow'));
      setAttributionEnabled(values.includes('attribution'));
    },
    [setScaleBar, setNorthArrow, setAttributionEnabled],
  );

  const countries = useAppSelector((state) => state.map.countries);

  const [areaCountries, setAreaCountries] = useState<string[] | undefined>();

  // resolve attribution countries covered by the drawn rectangle
  useEffect(() => {
    if (area !== 'area' || !areaBbox) {
      setAreaCountries(undefined);

      return;
    }

    let cancelled = false;

    fetch(`${process.env['API_URL']}/geotools/covered-countries`, {
      method: 'POST',
      body: JSON.stringify(bboxPolygon(areaBbox)),
      headers: { 'content-type': 'application/geo+json' },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw new Error();
      })
      .then((data) => {
        if (!cancelled) {
          setAreaCountries(z.array(z.string()).parse(data));
        }
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, area, areaBbox]);

  const attributionCountries = area === 'area' ? areaCountries : countries;

  const attribution = useResolvedAttribution(MAP_LAYERS, attributionCountries);

  const attributionText = useResolvedAttributionText(
    MAP_LAYERS,
    attributionCountries,
  );

  return (
    <Modal
      show={show}
      onHide={close}
      className={selectingArea ? 'd-none' : undefined}
      backdropClassName={selectingArea ? 'd-none' : undefined}
      enforceFocus={!selectingArea}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPrint /> {m?.mainMenu.mapToDocumentExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">
          {m?.mapToDocumentExport.alert(
            attribution?.map(([type, elem]) => (
              <Fragment key={type}>{elem}, </Fragment>
            )),
          )}
        </Alert>

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapToDocumentExport.area}
          </Form.Label>

          <MapAreaToggle
            area={area}
            onSelectVisible={() => setArea('visible')}
            onSelectArea={startSelecting}
            visibleLabel={m?.mapToDocumentExport.areas.visible}
            areaLabel={m?.mapToDocumentExport.areas.byArea}
          />
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {' '}
            {m?.mapToDocumentExport.format}
          </Form.Label>

          <ToggleButtonGroup
            type="radio"
            name="exportFormat"
            value={format}
            onChange={setFormat}
          >
            {FormatSchema.options.map((fmt) => (
              <ToggleButton
                key={fmt}
                id={`exportFormat-${fmt}`}
                value={fmt}
                variant="outline-primary"
              >
                {fmt.toUpperCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapToDocumentExport.layersTitle}
          </Form.Label>

          <div className="d-flex flex-wrap gap-2">
            {EXPORTABLE_LAYERS.map((layer) => (
              <ToggleButton
                key={layer}
                id={`export-layer-${layer}`}
                type="checkbox"
                value={layer}
                variant="outline-primary"
                className="rounded flex-grow-0"
                checked={layers.has(layer)}
                onChange={() => toggleLayer(layer)}
              >
                {LAYER_ICONS[layer]} {m?.mapToDocumentExport.layers[layer]}
              </ToggleButton>
            ))}
          </div>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapToDocumentExport.mapDataTitle}
          </Form.Label>

          <ExportablesSelector
            value={exportables}
            available={availableExportables}
            onChange={setExportables}
          />
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapToDocumentExport.decorations}
          </Form.Label>

          <ToggleButtonGroup
            type="checkbox"
            value={[
              ...(scaleBar ? (['scaleBar'] as const) : []),
              ...(northArrow ? (['northArrow'] as const) : []),
              ...(attributionEnabled ? (['attribution'] as const) : []),
            ]}
            onChange={handleDecorationsChange}
            className="d-flex flex-wrap gap-2"
          >
            <ToggleButton
              id="exportScaleBar"
              value="scaleBar"
              variant="outline-primary"
              className="rounded flex-grow-0"
            >
              <FaRulerHorizontal /> {m?.mapToDocumentExport.scaleBar}
            </ToggleButton>

            <ToggleButton
              id="exportNorthArrow"
              value="northArrow"
              variant="outline-primary"
              className="rounded flex-grow-0"
            >
              <FaCompass /> {m?.mapToDocumentExport.northArrow}
            </ToggleButton>

            <ToggleButton
              id="exportAttribution"
              value="attribution"
              variant="outline-primary"
              className="rounded flex-grow-0"
            >
              <FaCopyright /> {m?.mapToDocumentExport.attribution}
            </ToggleButton>
          </ToggleButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapToDocumentExport.customLayerOrder}
          </Form.Label>

          <ToggleButtonGroup
            type="radio"
            name="customLayerOrder"
            value={customLayerOrder}
            onChange={handleCustomLayerOrderChange}
          >
            <ToggleButton
              id="customLayerOrder-topmost"
              value="topmost"
              variant="outline-primary"
            >
              {m?.mapToDocumentExport.orders.topmost}
            </ToggleButton>

            <ToggleButton
              id="customLayerOrder-natural"
              value="natural"
              variant="outline-primary"
            >
              {m?.mapToDocumentExport.orders.natural}
            </ToggleButton>
          </ToggleButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group controlId="mapScale">
          <Form.Label>{m?.mapToDocumentExport.mapScale}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              value={scale}
              min={60}
              max={960}
              step={10}
              isInvalid={invalidScale}
              onChange={handleScaleChange}
            />

            <InputGroup.Text>DPI</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          disabled={invalidScale}
          onClick={() =>
            dispatch(
              exportMapToDocument({
                area,
                scale: parseInt(scale, 10) / 96,
                format,
                layers: [...layers],
                exportables: exportables
                  .split('|')
                  .filter(Boolean) as Exportable[],
                customLayerOrder,
                decorations: {
                  scaleBar,
                  northArrow: northArrow
                    ? (m?.mapToDocumentExport.northArrowLetter ?? 'N')
                    : false,
                  attribution:
                    attributionEnabled && attributionText
                      ? attributionText
                      : false,
                },
              }),
            )
          }
        >
          <FaDownload /> {m?.general.export}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
