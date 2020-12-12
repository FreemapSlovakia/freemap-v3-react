import {
  useState,
  useMemo,
  useCallback,
  ReactElement,
  ChangeEvent,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal, exportPdf } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { colors } from 'fm3/constants';
import {
  Alert,
  Button,
  ButtonGroup,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
} from 'react-bootstrap';

type Props = { show: boolean };

export function ExportPdfModal({ show }: Props): ReactElement {
  const language = useSelector((state: RootState) => state.l10n.language);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const canExportByPolygon = useSelector(
    (state: RootState) =>
      state.main.selection?.type === 'draw-polygons' &&
      state.main.selection.id !== undefined,
  );

  const m = useMessages();

  const [area, setArea] = useState('visible');

  const [scale, setScale] = useState(1);

  const [format, setFormat] = useState('jpeg');

  const [contours, setContours] = useState(true);

  const [shadedRelief, setShadedRelief] = useState(true);

  const [hikingTrails, setHikingTrails] = useState(true);

  const [bicycleTrails, setBicycleTrails] = useState(true);

  const [skiTrails, setSkiTrails] = useState(true);

  const [horseTrails, setHorseTrails] = useState(true);

  const [drawing, setDrawing] = useState(true);

  const [plannedRoute, setPlannedRoute] = useState(true);

  const [track, setTrack] = useState(true);

  const [style, setStyle] = useState(`[
  {
    "Style": {
      "@name": "custom-polygons",
      "Rule": [
        {
          "PolygonSymbolizer": {
            "@fill": "${colors.normal}",
            "@fill-opacity": 0.2,
            "@stroke-linecap": "round",
            "@stroke-linejoin": "round"
          }
        },
        {
          "LineSymbolizer": {
            "@stroke": "${colors.normal}",
            "@stroke-width": 4,
            "@stroke-opacity": 0.8,
            "@stroke-linecap": "round",
            "@stroke-linejoin": "round",
            "@stroke-dasharray": "5,10"
          }
        },
        {
          "TextSymbolizer": {
            "@fontset-name": "regular",
            "@fill": "${colors.normal}",
            "@halo-fill": "white",
            "@halo-radius": "1.5",
            "@halo-opacity": "0.75",
            "@size": 16,
            "@line-spacing": -2,
            "@wrap-width": 100,
            "@wrap-before": true,
            "@placement": "interior",
            "#text": "[name]"
          }
        }
      ]
    }
  },
  {
    "Style": {
      "@name": "custom-polylines",
      "Rule": [
        {
          "LineSymbolizer": {
            "@stroke": "${colors.normal}",
            "@stroke-width": 4,
            "@stroke-opacity": 0.8,
            "@stroke-linecap": "round",
            "@stroke-linejoin": "round",
            "@stroke-dasharray": "5,10"
          }
        },
        {
          "TextSymbolizer": {
            "@fontset-name": "regular",
            "@fill": "${colors.normal}",
            "@halo-fill": "white",
            "@halo-radius": "1.5",
            "@halo-opacity": "0.75",
            "@size": 16,
            "@line-spacing": -2,
            "@placement": "line",
            "@spacing": "200",
            "@dy": "8",
            "#text": "[name]"
          }
        }
      ]
    }
  },
  {
    "Style": {
      "@name": "custom-points",
      "Rule": [
        {
          "MarkersSymbolizer": {
            "@fill": "${colors.normal}",
            "@width": 10,
            "@height": 10,
            "@stroke-width": 1.5,
            "@stroke-opacity": 0.75,
            "@stroke": "white"
          }
        },
        {
          "TextSymbolizer": {
            "@fontset-name": "regular",
            "@fill": "${colors.normal}",
            "@halo-fill": "white",
            "@halo-radius": "1.5",
            "@halo-opacity": "0.75",
            "@size": 16,
            "@line-spacing": -2,
            "@wrap-width": 100,
            "@wrap-before": true,
            "@dy": -10,
            "#text": "[name]"
          }
        }
      ]
    }
  }
]
`);

  const handleStyleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setStyle(e.currentTarget.value);
    },
    [],
  );

  const nf = useMemo(
    () =>
      Intl.NumberFormat(language, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [language],
  );

  const dispatch = useDispatch();

  function close() {
    dispatch(setActiveModal(null));
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="file-pdf-o" /> {m?.more.pdfExport}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning">{m?.pdfExport.alert}</Alert>
        <p>{m?.pdfExport.area}</p>
        <ButtonGroup>
          <Button
            active={area === 'visible'}
            onClick={() => setArea('visible')}
          >
            {m?.pdfExport.areas.visible}
          </Button>
          <Button
            active={area === 'selected'}
            onClick={() => setArea('selected')}
            disabled={!canExportByPolygon}
          >
            {m?.pdfExport.areas.pinned} <FontAwesomeIcon icon="square-o" />
          </Button>
        </ButtonGroup>
        <hr />
        <p>{m?.pdfExport.format}</p>
        <ButtonGroup>
          <Button onClick={() => setFormat('jpeg')} active={format === 'jpeg'}>
            JPEG
          </Button>
          <Button onClick={() => setFormat('png')} active={format === 'png'}>
            PNG
          </Button>
          <Button onClick={() => setFormat('pdf')} active={format === 'pdf'}>
            PDF
          </Button>
          <Button onClick={() => setFormat('svg')} active={format === 'svg'}>
            SVG
          </Button>
        </ButtonGroup>
        <hr />
        <p>{m?.pdfExport.layersTitle}</p>
        <FormCheck
          type="checkbox"
          checked={contours}
          onChange={() => {
            setContours((b) => !b);
          }}
          label={m?.pdfExport.layers.contours}
        />
        <FormCheck
          type="checkbox"
          checked={shadedRelief}
          onChange={() => setShadedRelief((b) => !b)}
        >
          {m?.pdfExport.layers.shading}
        </FormCheck>
        <FormCheck
          type="checkbox"
          checked={hikingTrails}
          onChange={() => {
            setHikingTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.hikingTrails}
        />
        <FormCheck
          checked={bicycleTrails}
          onChange={() => {
            setBicycleTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.bicycleTrails}
        />
        <FormCheck
          type="checkbox"
          checked={skiTrails}
          onChange={() => {
            setSkiTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.skiTrails}
        />
        <FormCheck
          type="checkbox"
          checked={horseTrails}
          onChange={() => {
            setHorseTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.horseTrails}
        />
        <FormCheck
          type="checkbox"
          checked={drawing}
          onChange={() => {
            setDrawing((b) => !b);
          }}
          label={m?.pdfExport.layers.drawing}
        />
        <FormCheck
          type="checkbox"
          checked={plannedRoute}
          onChange={() => {
            setPlannedRoute((b) => !b);
          }}
          label={m?.pdfExport.layers.plannedRoute}
        />
        <FormCheck
          type="checkbox"
          checked={track}
          onChange={() => {
            setTrack((b) => !b);
          }}
          label={m?.pdfExport.layers.track}
        />
        <hr />
        <p>
          {m?.pdfExport.mapScale} {nf.format(scale * 96)} DPI
        </p>
        <Slider
          value={scale}
          min={0.5}
          max={8}
          step={0.05}
          tooltip={false}
          onChange={setScale}
        />
        {expertMode && (
          <>
            <hr />
            <FormGroup>
              <FormLabel>
                Interactive layer styles{' '}
                <a
                  href="http://mapnik.org/mapnik-reference/"
                  target="mapnik_reference"
                >
                  <FontAwesomeIcon icon="question-circle" />
                </a>
              </FormLabel>
              <FormControl
                as="textarea"
                value={style}
                onChange={handleStyleChange}
                rows={6}
                disabled={!(drawing || plannedRoute || track)}
              />
            </FormGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            dispatch(
              exportPdf({
                area: area as any,
                scale,
                format: format as any,
                contours,
                shadedRelief,
                hikingTrails,
                bicycleTrails,
                skiTrails,
                horseTrails,
                drawing,
                plannedRoute,
                track,
                style,
              }),
            );
          }}
        >
          <FontAwesomeIcon icon="download" /> {m?.pdfExport.export}
        </Button>{' '}
        <Button onClick={close}>
          <FontAwesomeIcon icon="close" /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
