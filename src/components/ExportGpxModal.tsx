import {
  Destination,
  Exportable,
  exportGpx,
  setActiveModal,
} from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ToggleButton from 'react-bootstrap/ToggleButton';
import {
  FaBullseye,
  FaCamera,
  FaDownload,
  FaDrawPolygon,
  FaDropbox,
  FaGoogle,
  FaMapMarkerAlt,
  FaMapSigns,
  FaRoad,
  FaTimes,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

const exportableDefinitions: readonly {
  type: Exportable;
  icon: ReactNode;
}[] = [
  { type: 'plannedRoute', icon: <FaMapSigns /> },
  { type: 'plannedRouteWithStops', icon: <FaMapSigns /> },
  { type: 'objects', icon: <FaMapMarkerAlt /> },
  { type: 'pictures', icon: <FaCamera /> },
  { type: 'drawingLines', icon: <MdTimeline /> },
  { type: 'drawingAreas', icon: <FaDrawPolygon /> },
  { type: 'drawingPoints', icon: <FaMapMarkerAlt /> },
  { type: 'tracking', icon: <FaBullseye /> },
  { type: 'gpx', icon: <FaRoad /> },
];

type Props = { show: boolean };

export default ExportGpxModal;

export function ExportGpxModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const initExportables = useSelector((state) => {
    const exportables: Exportable[] = [];

    // if (state.search.selectedResult) {
    //   exportables.push('search');
    // }

    if (state.routePlanner.alternatives.length) {
      exportables.push('plannedRoute');
      exportables.push('plannedRouteWithStops');
    }

    if (state.objects.objects.length) {
      exportables.push('objects');
    }

    if (state.map.overlays.includes('I')) {
      exportables.push('pictures');
    }

    if (state.drawingLines.lines.some((line) => line.type === 'line')) {
      exportables.push('drawingLines');
    }

    if (state.drawingLines.lines.some((line) => line.type === 'polygon')) {
      exportables.push('drawingAreas');
    }

    if (state.drawingPoints.points.length) {
      exportables.push('drawingPoints');
    }

    if (state.tracking.tracks.length) {
      exportables.push('tracking');
    }

    if (state.trackViewer.trackGpx || state.trackViewer.trackGeojson) {
      exportables.push('gpx');
    }

    // if (state.changesets.changesets.length) {
    //   exportables.push('changesets');
    // }

    // if (state.mapDetails.trackInfoPoints) {
    //   exportables.push('mapDetails');
    // }

    return exportables;
  });

  const [exportables, setExportables] = useState<Exportable[] | undefined>();

  const [type, setType] = useState<'gpx' | 'geojson'>('gpx');

  const initJoined = initExportables.join(',');

  useEffect(() => {
    if (show) {
      setExportables(initExportables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initJoined]);

  const onExport = useCallback(
    (
      type: 'gpx' | 'geojson',
      exportables: Exportable[] | null,
      destination: Destination,
    ) => {
      if (exportables) {
        dispatch(exportGpx({ type, exportables, destination }));
      }
    },
    [dispatch],
  );

  function close() {
    dispatch(setActiveModal(null));
  }

  const handleExportClick = () => {
    if (exportables) {
      onExport(type, exportables, 'download');
    }
  };

  const handleExportToDriveClick = () => {
    if (exportables) {
      onExport(type, exportables, 'gdrive');
    }
  };

  const handleExportToDropbox = () => {
    if (exportables) {
      onExport(type, exportables, 'dropbox');
    }
  };

  const handleCheckboxChange = (type: Exportable) => {
    if (!exportables) {
      return;
    }

    const set = new Set(exportables);
    if (exportables.includes(type)) {
      set.delete(type);
    } else {
      set.add(type);
    }
    setExportables([...set]);
  };

  return (
    <Modal show={show && !!exportables} onHide={close} size="lg">
      {exportables && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaDownload /> {m?.mainMenu.gpxExport}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning">{m?.gpxExport.licenseAlert}</Alert>

            <Alert variant="warning">{m?.gpxExport.disabledAlert}</Alert>

            <Form.Group>
              <Form.Label>{m?.gpxExport.export}:</Form.Label>

              <Form.Switch>
                {exportableDefinitions.map(({ type, icon }) => (
                  <Form.Check
                    id={'chk-' + type}
                    type="checkbox"
                    key={type}
                    checked={exportables.includes(type)}
                    disabled={!initExportables.includes(type)}
                    onChange={() => handleCheckboxChange(type)}
                    label={
                      <>
                        {icon} {m?.gpxExport.what[type]}
                      </>
                    }
                  />
                ))}
              </Form.Switch>
            </Form.Group>

            <Form.Group>
              <Form.Label>{m?.gpxExport.format}:</Form.Label>

              <Form.Row>
                <ButtonGroup toggle>
                  <ToggleButton
                    type="radio"
                    value="gpx"
                    checked={type === 'gpx'}
                    onChange={() => setType('gpx')}
                  >
                    GPX
                  </ToggleButton>
                  <ToggleButton
                    type="radio"
                    value="geojson"
                    checked={type === 'geojson'}
                    onChange={() => setType('geojson')}
                  >
                    GeoJSON
                  </ToggleButton>
                </ButtonGroup>
              </Form.Row>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleExportClick} disabled={!exportables.length}>
              <FaDownload /> {m?.gpxExport.export}
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportToDriveClick}
              disabled={!exportables.length}
            >
              <FaGoogle /> {m?.gpxExport.exportToDrive}
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportToDropbox}
              disabled={!exportables.length}
            >
              <FaDropbox /> {m?.gpxExport.exportToDropbox}
            </Button>
            <Button variant="dark" onClick={close}>
              <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
