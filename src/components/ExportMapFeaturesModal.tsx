import { Position } from 'geojson';
import {
  SubmitEvent,
  Fragment,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  Modal,
  ToggleButton,
} from 'react-bootstrap';
import {
  FaBullseye,
  FaCamera,
  FaDownload,
  FaDrawPolygon,
  FaDropbox,
  FaFileExport,
  FaGoogle,
  FaMapMarkerAlt,
  FaMapSigns,
  FaRoad,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { SiGarmin } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { is } from 'typia';
import { authWithGarmin } from '../features/auth/model/actions.js';
import {
  ExportTarget,
  ExportType,
  Exportable,
  exportMapFeatures,
  exportTargets,
  exportTypes,
} from '../features/export/model/actions.js';
import {
  setActiveModal,
} from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useMessages } from '../l10nInjector.js';
import { ExperimentalFunction } from './ExperimentalFunction.js';

const exportableDefinitions: readonly [
  type: Exportable,
  icon: ReactNode,
  garmin: boolean,
][] = [
  ['plannedRoute', <FaMapSigns />, true],
  ['objects', <FaMapMarkerAlt />, false],
  ['pictures', <FaCamera />, false],
  ['drawingLines', <MdTimeline />, true],
  ['drawingAreas', <FaDrawPolygon />, false],
  ['drawingPoints', <FaMapMarkerAlt />, false],
  ['tracking', <FaBullseye />, true],
  ['gpx', <FaRoad />, true],
  ['search', <FaSearch />, true],
];

type Props = { show: boolean };

export default ExportMapFeaturesModal;

export function ExportMapFeaturesModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const initExportables = useAppSelector((state) => {
    const exportables: Exportable[] = [];

    if (state.search.selectedResult) {
      exportables.push('search');
    }

    if (state.routePlanner.alternatives.length) {
      exportables.push('plannedRoute');
    }

    if (state.objects.objects.length) {
      exportables.push('objects');
    }

    if (state.map.layers.includes('I')) {
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

    return '|' + exportables.map((e) => e + '|').join('');
  });

  const userHasGarmin = useAppSelector((state) =>
    state.auth.user?.authProviders.includes('garmin'),
  );

  const [exportables, setExportables] = useState<string>('|');

  const [type, , setType] = usePersistentState<ExportType>(
    'fm.exportFeatures.format',
    (value) => String(value),
    (value) => (is<ExportType>(value) ? value : 'gpx'),
  );

  const [target, , setTarget] = usePersistentState<ExportTarget>(
    'fm.exportFeatures.target',
    (value) => String(value),
    (value) => (is<ExportTarget>(value) ? value : 'download'),
  );

  const [name, setName] = useState('');

  const [description, setDescription] = useState('');

  const [activity, setActivity] = useState('');

  const runExport = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      if (!exportables) {
        return;
      }

      const exportAction = exportMapFeatures({
        type,
        exportables: exportables.split('|').filter((a) => a) as Exportable[],
        target,
        name: name || undefined,
        description: description || undefined,
        activity: activity || undefined,
      });

      if (target === 'garmin' && !userHasGarmin) {
        if (
          window.confirm(
            userHasGarmin === false
              ? m?.exportMapFeatures.garmin.connectPrompt
              : m?.exportMapFeatures.garmin.authPrompt,
          )
        ) {
          dispatch(
            authWithGarmin({ connect: true, successAction: exportAction }),
          );
        }
      } else {
        dispatch(exportAction);
      }
    },
    [
      dispatch,
      type,
      exportables,
      target,
      name,
      description,
      activity,
      userHasGarmin,
      m,
    ],
  );

  const isGarmin = target === 'garmin';

  function close() {
    dispatch(setActiveModal(null));
  }

  const handleCheckboxChange = useCallback(
    (type: Exportable) => {
      let next = isGarmin ? '|' : exportables;

      if (exportables.includes('|' + type + '|')) {
        next = exportables.replace(type + '|', '');

        if (type === 'plannedRoute') {
          next = next.replace('|plannedRouteWithStops', '');
        }
      } else {
        next += type + '|';
      }

      setExportables(next);
    },
    [exportables, isGarmin],
  );

  const [garminExportables, setGarminExportables] = useState<
    Partial<Record<Exportable, Position[] | string | null>> | undefined
  >();

  const state = useAppSelector((state) => state); // TODO optimize - return only necessary

  useEffect(() => {
    if (!isGarmin) {
      return;
    }

    import(
      /* webpackChunkName: "garmin-export" */
      '../features/export/garminExport.js'
    ).then((x) =>
      setGarminExportables(
        Object.fromEntries(
          Object.entries(x.getExportables()).map(([exportable, tryExport]) => [
            exportable,
            tryExport(state),
          ]),
        ),
      ),
    );
  }, [state, isGarmin]);

  const garminEnabled = isGarmin
    ? Object.entries(garminExportables ?? [])
        .filter(([, v]) => v && typeof v !== 'string')
        .map(([k]) => k)
    : undefined;

  const garminSingleEnabled =
    garminEnabled?.length === 1
      ? garminEnabled[0]
      : garminEnabled
        ? ''
        : undefined;

  useEffect(() => {
    const e =
      garminSingleEnabled !== undefined
        ? garminSingleEnabled
          ? '|' + garminSingleEnabled + '|'
          : '|'
        : initExportables
          ? initExportables
          : '|';

    setExportables(e);
  }, [initExportables, garminSingleEnabled]);

  const isWide = useMediaQuery({ query: '(min-width: 992px)' });

  return (
    <Modal show={show} onHide={close} size="lg">
      <Form onSubmit={runExport}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaDownload /> {m?.mainMenu.mapFeaturesExport}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="warning">{m?.exportMapFeatures.licenseAlert}</Alert>

          <Form.Group controlId="target" className="mb-3">
            <Form.Label>{m?.exportMapFeatures.target}</Form.Label>

            <div>
              <ButtonGroup vertical={!isWide}>
                {exportTargets.map((exportTarget) => (
                  <ToggleButton
                    id={exportTarget}
                    key={exportTarget}
                    type="radio"
                    checked={target === exportTarget}
                    value={exportTarget}
                    onChange={setTarget}
                    disabled={!initExportables}
                  >
                    {
                      {
                        download: (
                          <>
                            <FaDownload /> {m?.exportMapFeatures.download}
                          </>
                        ),
                        gdrive: (
                          <>
                            <FaGoogle /> Google Drive
                          </>
                        ),
                        dropbox: (
                          <>
                            <FaDropbox /> Dropbox
                          </>
                        ),
                        garmin: (
                          <>
                            <SiGarmin
                              style={{
                                fontSize: '400%',
                                marginBlock: '-24px',
                              }}
                            />
                            &ensp;Garmin&ensp;
                            <ExperimentalFunction />
                          </>
                        ),
                      }[exportTarget]
                    }
                  </ToggleButton>
                ))}
              </ButtonGroup>
            </div>
          </Form.Group>

          {isGarmin ? (
            <>
              <Form.Group controlId="courseName" className="mb-3">
                <Form.Label>
                  {m?.exportMapFeatures.garmin.courseName}:
                </Form.Label>

                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </Form.Group>

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>
                  {m?.exportMapFeatures.garmin.description}:
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                />
              </Form.Group>

              <Form.Group controlId="activityType" className="mb-3">
                <Form.Label>
                  {m?.exportMapFeatures.garmin.activityType}:
                </Form.Label>

                <Form.Control
                  as="select"
                  value={activity}
                  onChange={(e) => setActivity(e.currentTarget.value)}
                >
                  <option value="" />
                  <option value="RUNNING">
                    {m?.exportMapFeatures.garmin.at.running}
                  </option>
                  <option value="HIKING">
                    {m?.exportMapFeatures.garmin.at.hiking}
                  </option>
                  <option value="OTHER">
                    {m?.exportMapFeatures.garmin.at.other}
                  </option>
                  <option value="MOUNTAIN_BIKING">
                    {m?.exportMapFeatures.garmin.at.mountain_biking}
                  </option>
                  <option value="TRAIL_RUNNING">
                    {m?.exportMapFeatures.garmin.at.trailRunning}
                  </option>
                  <option value="ROAD_CYCLING">
                    {m?.exportMapFeatures.garmin.at.roadCycling}
                  </option>
                  <option value="GRAVEL_CYCLING">
                    {m?.exportMapFeatures.garmin.at.gravelCycling}
                  </option>
                </Form.Control>
              </Form.Group>
            </>
          ) : (
            <Form.Group controlId="format" className="mb-3">
              <Form.Label>{m?.exportMapFeatures.format}</Form.Label>

              <div>
                <ButtonGroup>
                  {exportTypes.map((exportType) => (
                    <ToggleButton
                      id={exportType}
                      key={exportType}
                      type="radio"
                      value={exportType}
                      checked={type === exportType}
                      onChange={setType}
                      disabled={!exportables.length}
                    >
                      {exportType === 'gpx' ? 'GPX' : 'GeoJSON'}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
            </Form.Group>
          )}

          <Form.Group controlId="download" className="mb-3">
            <Form.Label>{m?.general.export}</Form.Label>

            <div>
              {exportableDefinitions
                .filter(([, , garmin]) => target !== 'garmin' || garmin)
                .map(([type, icon]) => (
                  <Fragment key={type}>
                    <Form.Check
                      id={'chk-' + type}
                      name="exportable"
                      type={target === 'garmin' ? 'radio' : 'checkbox'}
                      inline={type === 'plannedRoute'}
                    >
                      <Form.Check.Input
                        isInvalid={
                          target === 'garmin' &&
                          typeof garminExportables?.[type] === 'string'
                        }
                        disabled={
                          target === 'garmin'
                            ? !garminExportables?.[type] ||
                              typeof garminExportables[type] === 'string'
                            : !initExportables.includes('|' + type + '|')
                        }
                        checked={exportables.includes('|' + type + '|')}
                        onChange={() => handleCheckboxChange(type)}
                        type={target === 'garmin' ? 'radio' : 'checkbox'}
                      />

                      <Form.Check.Label>
                        {icon} {m?.exportMapFeatures.what[type]}
                      </Form.Check.Label>

                      {target === 'garmin' &&
                      typeof garminExportables?.[type] === 'string' ? (
                        <Form.Control.Feedback type="invalid">
                          {garminExportables[type]}
                        </Form.Control.Feedback>
                      ) : null}
                    </Form.Check>

                    {type === 'plannedRoute' && target !== 'garmin' && (
                      <Form.Check
                        id="chk-plannedRouteWithStops"
                        inline
                        type="checkbox"
                        checked={exportables.includes(
                          '|plannedRouteWithStops|',
                        )}
                        disabled={!exportables.includes('|' + type + '|')}
                        onChange={() =>
                          handleCheckboxChange('plannedRouteWithStops')
                        }
                        label={
                          m?.exportMapFeatures.what['plannedRouteWithStops']
                        }
                      />
                    )}
                  </Fragment>
                ))}
            </div>

            <Form.Text muted className="d-block mt-3">
              {m?.exportMapFeatures.disabledAlert}
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !exportables.length ||
              (target === 'garmin' && (!name.trim() || !activity))
            }
          >
            <FaFileExport /> {m?.general.export}
          </Button>

          <Button type="button" variant="dark" onClick={close}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
