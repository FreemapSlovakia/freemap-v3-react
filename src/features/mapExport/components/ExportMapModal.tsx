import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  useResolvedAttribution,
  useResolvedAttributionText,
} from '@shared/components/Attribution.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { polygon } from '@turf/helpers';
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
  ButtonGroup,
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
  FaDrawPolygon,
  FaEye,
  FaHiking,
  FaHorse,
  FaPencilAlt,
  FaPrint,
  FaRoute,
  FaRulerHorizontal,
  FaShoePrints,
  FaSkiing,
  FaTimes,
} from 'react-icons/fa';
import { GiHills } from 'react-icons/gi';
import { RxTarget } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import z from 'zod';
import {
  CustomLayerOrder,
  CustomLayerOrderSchema,
  EXPORTABLE_LAYERS,
  ExportableLayer,
  ExportableLayerSchema,
  ExportFormat,
  ExportFormatSchema,
  exportMap,
} from '../model/actions.js';

type Props = { show: boolean };

const LAYER_ICONS: Record<ExportableLayer, ReactElement> = {
  contours: <RxTarget />,
  shading: <GiHills />,
  hikingTrails: <FaHiking />,
  bicycleTrails: <FaBicycle />,
  skiTrails: <FaSkiing />,
  horseTrails: <FaHorse />,
  drawing: <FaPencilAlt />,
  plannedRoute: <FaRoute />,
  track: <FaShoePrints />,
};

const LAYERS_STORAGE_KEY = 'fm.exportMap.layers';

const MAP_LAYERS = ['X'];

function identity<T>(value: T): T {
  return value;
}

export default ExportMapModal;

const toScale = (value: string | null) => value ?? '100';

const toExportFormat = (value: string | null) =>
  ExportFormatSchema.safeParse(value).data ?? 'jpeg';

const toCustomLayerOrder = (value: string | null) =>
  CustomLayerOrderSchema.safeParse(value).data ?? 'topmost';

const fromBool = (value: boolean) => (value ? '1' : '0');

// default on
const toBool = (value: string | null) => value !== '0';

export function ExportMapModal({ show }: Props): ReactElement {
  const canExportByPolygon = useAppSelector(
    (state) =>
      state.main.selection?.type === 'draw-line-poly' &&
      state.main.selection.id !== undefined,
  );

  const m = useMessages();

  const [area, setArea] = useState<'visible' | 'selected'>(
    canExportByPolygon ? 'selected' : 'visible',
  );

  const [scale, setScale] = usePersistentState<string>(
    'fm.exportMap.scale',
    identity,
    toScale,
  );

  const [customLayerOrder, setCustomLayerOrder] = usePersistentState<
    'topmost' | 'natural'
  >('fm.exportMap.customLayerOrder', identity, toCustomLayerOrder);

  const [format, , setFormat] = usePersistentState<ExportFormat>(
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

  const dispatch = useDispatch();

  function close() {
    dispatch(setActiveModal(null));
  }

  const invalidScale = isInvalidInt(scale, true, 60, 960);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const handleLayersChange = useCallback(
    (values: ExportableLayer[]) => {
      const n = new Set(values);

      if (cookiesEnabled) {
        storage.setItem(LAYERS_STORAGE_KEY, [...n].join(','));
      }

      setLayers(n);
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

  const [polyCountries, setPolyCountries] = useState<string[] | undefined>();

  const poly0 = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id]
      : undefined,
  );

  const poly = area === 'selected' ? poly0 : undefined;

  useEffect(() => {
    if (!poly || poly.points.length < 3 || polyCountries) {
      return;
    }

    fetch(`${process.env['API_URL']}/geotools/covered-countries`, {
      method: 'POST',
      body: JSON.stringify(
        polygon([[...poly.points, poly.points[0]].map((p) => [p.lon, p.lat])]),
      ),
      headers: { 'content-type': 'application/geo+json' },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw new Error();
      })
      .then((data) => {
        setPolyCountries(z.array(z.string()).parse(data));
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
  }, [dispatch, poly, polyCountries]);

  const attributionCountries = area === 'selected' ? polyCountries : countries;

  const attribution = useResolvedAttribution(MAP_LAYERS, attributionCountries);

  const attributionText = useResolvedAttributionText(
    MAP_LAYERS,
    attributionCountries,
  );

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPrint /> {m?.mainMenu.mapExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">
          {m?.mapExport.alert(
            attribution?.map(([type, elem]) => (
              <Fragment key={type}>{elem}, </Fragment>
            )),
          )}
        </Alert>

        <Form.Group>
          <Form.Label className="d-block">{m?.mapExport.area}</Form.Label>

          <ButtonGroup className="d-flex">
            <Button
              className="fm-ellipsis"
              variant="outline-primary"
              active={area === 'visible'}
              onClick={() => setArea('visible')}
            >
              <FaEye /> {m?.mapExport.areas.visible}
            </Button>

            <Button
              className="fm-ellipsis"
              variant="outline-primary"
              active={area === 'selected'}
              onClick={() => setArea('selected')}
              disabled={!canExportByPolygon}
            >
              <FaDrawPolygon /> {m?.mapExport.areas.pinned}
            </Button>
          </ButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block"> {m?.mapExport.format}</Form.Label>

          <ButtonGroup>
            {['jpeg', 'png', 'pdf', 'svg'].map((fmt) => (
              <Button
                variant="outline-primary"
                key={fmt}
                value={fmt}
                onClick={setFormat}
                active={format === fmt}
              >
                {fmt.toUpperCase()}
              </Button>
            ))}
          </ButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapExport.layersTitle}
          </Form.Label>

          <ToggleButtonGroup
            type="checkbox"
            value={[...layers]}
            onChange={handleLayersChange}
            className="d-flex flex-wrap gap-2"
          >
            {EXPORTABLE_LAYERS.map((layer) => (
              <ToggleButton
                key={layer}
                id={`export-layer-${layer}`}
                value={layer}
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                {LAYER_ICONS[layer]} {m?.mapExport.layers[layer]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapExport.decorations}
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
              <FaRulerHorizontal /> {m?.mapExport.scaleBar}
            </ToggleButton>

            <ToggleButton
              id="exportNorthArrow"
              value="northArrow"
              variant="outline-primary"
              className="rounded flex-grow-0"
            >
              <FaCompass /> {m?.mapExport.northArrow}
            </ToggleButton>

            <ToggleButton
              id="exportAttribution"
              value="attribution"
              variant="outline-primary"
              className="rounded flex-grow-0"
            >
              <FaCopyright /> {m?.mapExport.attribution}
            </ToggleButton>
          </ToggleButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group>
          <Form.Label className="d-block">
            {m?.mapExport.customLayerOrder}
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
              {m?.mapExport.orders.topmost}
            </ToggleButton>

            <ToggleButton
              id="customLayerOrder-natural"
              value="natural"
              variant="outline-primary"
            >
              {m?.mapExport.orders.natural}
            </ToggleButton>
          </ToggleButtonGroup>
        </Form.Group>

        <div className="mt-3" />

        <Form.Group controlId="mapScale">
          <Form.Label>{m?.mapExport.mapScale}</Form.Label>

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
              exportMap({
                area,
                scale: parseInt(scale, 10) / 96,
                format,
                layers: [...layers],
                customLayerOrder,
                decorations: {
                  scaleBar,
                  northArrow: northArrow
                    ? (m?.mapExport.northArrowLetter ?? 'N')
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
