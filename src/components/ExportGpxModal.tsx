import {
  Destination,
  exportGpx,
  setActiveModal,
} from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import FormCheck from 'react-bootstrap/FormCheck';
import Modal from 'react-bootstrap/Modal';
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

const exportableDefinitions = [
  // { type: 'search', icon: 'search', name: 'výsledok hľadania' },
  { type: 'plannedRoute', icon: <FaMapSigns /> },
  { type: 'plannedRouteWithStops', icon: <FaMapSigns /> },
  { type: 'objects', icon: <FaMapMarkerAlt /> },
  { type: 'pictures', icon: <FaCamera /> },
  { type: 'drawingLines', icon: <MdTimeline /> },
  { type: 'areaMeasurement', icon: <FaDrawPolygon /> },
  { type: 'drawingPoints', icon: <FaMapMarkerAlt /> },
  { type: 'tracking', icon: <FaBullseye /> },
  { type: 'gpx', icon: <FaRoad /> },
  // { type: 'changesets', icon: 'pencil', name: 'zmeny v mape' },
  // { type: 'mapDetils', icon: 'info', name: 'detaily v mape' },
] as const;

type Props = { show: boolean };

export function ExportGpxModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const initExportables = useSelector((state: RootState) => {
    const exportables: string[] = [];

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
      exportables.push('areaMeasurement');
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

  const [exportables, setExportables] = useState<string[] | undefined>();

  const initJoined = initExportables.join(',');

  useEffect(() => {
    if (show) {
      setExportables(initJoined.split(','));
    }
  }, [show, initJoined]);

  const onExport = useCallback(
    (exportables: string[] | null, destination: Destination) => {
      if (exportables) {
        dispatch(exportGpx({ exportables, destination }));
      }
    },
    [dispatch],
  );

  function close() {
    dispatch(setActiveModal(null));
  }

  const handleExportClick = useCallback(() => {
    if (exportables) {
      onExport(exportables, 'download');
    }
  }, [onExport, exportables]);

  const handleExportToDriveClick = useCallback(() => {
    if (exportables) {
      onExport(exportables, 'gdrive');
    }
  }, [onExport, exportables]);

  const handleExportToDropbox = useCallback(() => {
    if (exportables) {
      onExport(exportables, 'dropbox');
    }
  }, [onExport, exportables]);

  const handleCheckboxChange = useCallback(
    (type: string) => {
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
    },
    [exportables],
  );

  return (
    <Modal show={show && !!exportables} onHide={close} size="lg">
      {exportables && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaDownload /> {m?.more.gpxExport}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning">{m?.gpxExport.disabledAlert}</Alert>
            {exportableDefinitions.map(({ type, icon }) => (
              <FormCheck
                id={'chk-' + type}
                type="checkbox"
                key={type}
                checked={exportables.includes(type)}
                disabled={!initExportables.includes(type)}
                onChange={() => handleCheckboxChange(type)}
                label={
                  <>
                    {m?.gpxExport.export} {icon} {m?.gpxExport.what[type]}
                  </>
                }
              />
            ))}
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
