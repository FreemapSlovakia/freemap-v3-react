import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { authWithGarmin } from '@features/auth/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import type { Position } from 'geojson';
import {
  type ReactElement,
  type SubmitEvent,
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
  FaDownload,
  FaDropbox,
  FaFileExport,
  FaGoogle,
  FaTimes,
} from 'react-icons/fa';
import { SiGarmin } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import {
  EXPORT_FORMAT_LABELS,
  type Exportable,
  type ExportElevation,
  ExportElevationSchema,
  type ExportTarget,
  ExportTargetSchema,
  type ExportType,
  ExportTypeSchema,
  exportMapFeatures,
} from '../model/actions.js';
import { useMapFeaturesExportMessages } from '../translations/useMapFeaturesExportMessages.js';
import {
  ExportablesSelector,
  elevationCapabilities,
  exportableDefinitions,
  useAvailableExportables,
  useSelectedExportable,
} from './ExportablesSelector.js';

const garminActivityTypes = [
  ['RUNNING', 'running'],
  ['HIKING', 'hiking'],
  ['OTHER', 'other'],
  ['MOUNTAIN_BIKING', 'mountain_biking'],
  ['TRAIL_RUNNING', 'trailRunning'],
  ['ROAD_CYCLING', 'roadCycling'],
  ['GRAVEL_CYCLING', 'gravelCycling'],
] as const;

type Props = { show: boolean };

const toExportType = (value: string | null) =>
  ExportTypeSchema.safeParse(value).data ?? 'gpx';

const toExportTarget = (value: string | null) =>
  ExportTargetSchema.safeParse(value).data ?? 'download';

const toExportElevation = (value: string | null) =>
  ExportElevationSchema.safeParse(value).data ?? 'none';

export default function MapFeaturesExportModal({ show }: Props): ReactElement {
  const m = useMessages();

  const em = useMapFeaturesExportMessages();

  useDocumentTitle(show ? m?.mainMenu.mapFeaturesExport : undefined);

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const initExportables = useAvailableExportables();

  const selectedExportable = useSelectedExportable();

  const selection = useAppSelector((state) => state.main.selection);

  const userHasGarmin = useAppSelector((state) =>
    state.auth.user?.authProviders.includes('garmin'),
  );

  const [exportables, setExportables] = useState<string>('|');

  const [onlySelected, setOnlySelected] = useState(false);

  const [type, , setType] = usePersistentState<ExportType>(
    'fm.exportFeatures.format',
    String,
    toExportType,
  );

  const [target, , setTarget] = usePersistentState<ExportTarget>(
    'fm.exportFeatures.target',
    String,
    toExportTarget,
  );

  const [elevation, , setElevation] = usePersistentState<ExportElevation>(
    'fm.exportFeatures.elevation',
    String,
    toExportElevation,
  );

  const [name, setName] = useState('');

  const [description, setDescription] = useState('');

  const [activity, setActivity] = useState('');

  // Elevation-fill capability of the current selection drives the control's
  // state: `canElevate` is false when nothing selected can carry elevation
  // (empty or polygon-only), `hasRecorded` is true when a source may arrive
  // with a real elevation (so "Override all" differs from "Fill missing").
  const selectedExportables = exportables
    .split('|')
    .filter(Boolean) as Exportable[];

  const canElevate = selectedExportables.some(
    (e) => elevationCapabilities[e] !== 'none',
  );

  const hasRecorded = selectedExportables.some(
    (e) => elevationCapabilities[e] === 'recorded',
  );

  // The effective mode, coerced to what the selection supports without
  // clobbering the persisted preference: no elevation at all when nothing can
  // carry it, and "Override all" collapses to "Fill missing" with nothing
  // recorded to override.
  const effectiveElevation: ExportElevation = !canElevate
    ? 'none'
    : !hasRecorded && elevation === 'all'
      ? 'missing'
      : elevation;

  const runExport = useCallback(
    async (e: SubmitEvent) => {
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
        // Garmin course export has its own elevation handling.
        elevation: target === 'garmin' ? undefined : effectiveElevation,
        // Mirrors `effectiveOnlySelected` (declared after this callback);
        // Garmin is gated by target here since it has its own selection.
        only:
          onlySelected && target !== 'garmin' && selectedExportable && selection
            ? selection
            : undefined,
      });

      if (target === 'garmin' && !userHasGarmin) {
        if (
          await confirm({
            message:
              userHasGarmin === false
                ? em?.garmin.connectPrompt
                : em?.garmin.authPrompt,
          })
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
      effectiveElevation,
      onlySelected,
      selectedExportable,
      selection,
      userHasGarmin,
      em,
      confirm,
    ],
  );

  const isGarmin = target === 'garmin';

  function close() {
    dispatch(setActiveModal(null));
  }

  const handleCheckboxChange = useCallback(
    (type: Exportable) => {
      let next = isGarmin ? '|' : exportables;

      if (exportables.includes(`|${type}|`)) {
        next = exportables.replace(`${type}|`, '');

        if (type === 'plannedRoute') {
          next = next.replace('|plannedRouteWithStops', '');
        }
      } else {
        next += `${type}|`;
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
      '../garminExport.js'
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

  // a selected Garmin option whose preconditions aren't met (e.g. multiple
  // lines) blocks export until resolved
  const garminSelectedError =
    isGarmin &&
    exportableDefinitions.some(
      ([type]) =>
        exportables.includes(`|${type}|`) &&
        typeof garminExportables?.[type] === 'string',
    );

  // Seed the "only selected item" toggle when the selected feature changes: a
  // selectable feature defaults it on, so selecting something then exporting
  // exports just it. Keyed on the selection alone (not the target), so
  // switching targets doesn't clobber the user's manual toggle.
  useEffect(() => {
    setOnlySelected(selectedExportable !== null);
  }, [selectedExportable]);

  // Garmin drives its own single-item selection, so the toggle has no effect
  // there — gate it out of the effective value rather than mutating the toggle.
  const effectiveOnlySelected =
    onlySelected && !isGarmin && selectedExportable !== null;

  useEffect(() => {
    const e =
      garminSingleEnabled !== undefined
        ? garminSingleEnabled
          ? `|${garminSingleEnabled}|`
          : '|'
        : effectiveOnlySelected && selectedExportable
          ? `|${selectedExportable}|`
          : initExportables
            ? initExportables
            : '|';

    setExportables(e);
  }, [
    initExportables,
    garminSingleEnabled,
    effectiveOnlySelected,
    selectedExportable,
  ]);

  return (
    <Modal show={show} onHide={close} size="lg" scrollable>
      <form onSubmit={runExport} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileExport /> {m?.mainMenu.mapFeaturesExport}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="warning">{em?.licenseAlert}</Alert>

          <Form.Group controlId="target" className="mb-3">
            <Form.Label>{em?.target}</Form.Label>

            <div>
              <ButtonGroup>
                {ExportTargetSchema.options.map((exportTarget) => (
                  <ToggleButton
                    id={exportTarget}
                    key={exportTarget}
                    type="radio"
                    variant="outline-primary"
                    checked={target === exportTarget}
                    value={exportTarget}
                    onChange={setTarget}
                    disabled={!initExportables}
                  >
                    {
                      {
                        download: (
                          <>
                            <FaDownload /> {em?.download}
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
                <Form.Label>{em?.garmin.courseName}</Form.Label>

                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </Form.Group>

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>{em?.garmin.description}</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="d-block">
                  {em?.garmin.activityType}
                </Form.Label>

                <div>
                  <ButtonGroup>
                    {garminActivityTypes.map(([value, labelKey]) => (
                      <ToggleButton
                        key={value}
                        id={`at-${value}`}
                        type="checkbox"
                        value={value}
                        variant="outline-primary"
                        checked={activity === value}
                        onChange={() =>
                          setActivity(activity === value ? '' : value)
                        }
                      >
                        {em?.garmin.at[labelKey]}
                      </ToggleButton>
                    ))}
                  </ButtonGroup>
                </div>
              </Form.Group>
            </>
          ) : (
            <Form.Group controlId="format" className="mb-3">
              <Form.Label>{em?.format}</Form.Label>

              <div>
                <ButtonGroup>
                  {ExportTypeSchema.options.map((exportType) => (
                    <ToggleButton
                      id={exportType}
                      key={exportType}
                      type="radio"
                      variant="outline-primary"
                      value={exportType}
                      checked={type === exportType}
                      onChange={setType}
                      disabled={!exportables.length}
                    >
                      {EXPORT_FORMAT_LABELS[exportType]}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
            </Form.Group>
          )}

          <Form.Group controlId="download" className="mb-3">
            <Form.Label>{m?.general.export}</Form.Label>

            {target === 'garmin' ? (
              <>
                <div className="d-flex flex-wrap gap-2">
                  {exportableDefinitions
                    .filter(([, , garmin]) => garmin)
                    .map(([type, Icon]) => {
                      const value = garminExportables?.[type];

                      const error =
                        typeof value === 'string' ? value : undefined;

                      const selected = exportables.includes(`|${type}|`);

                      return (
                        <ToggleButton
                          key={type}
                          id={`chk-${type}`}
                          name="exportable"
                          type="radio"
                          variant={
                            selected && error
                              ? 'outline-danger'
                              : 'outline-primary'
                          }
                          value={type}
                          checked={selected}
                          // only truly empty options are unavailable; options
                          // with a problem stay selectable so the reason can be
                          // shown on demand
                          disabled={!value}
                          onChange={() => handleCheckboxChange(type)}
                        >
                          <Icon /> {em?.what[type]}
                        </ToggleButton>
                      );
                    })}
                </div>

                {exportableDefinitions
                  .filter(
                    ([type, , garmin]) =>
                      garmin &&
                      exportables.includes(`|${type}|`) &&
                      typeof garminExportables?.[type] === 'string',
                  )
                  .map(([type, Icon]) => (
                    <Form.Text key={type} className="d-block text-danger mt-2">
                      <Icon /> {em?.what[type]}{' '}
                      {garminExportables?.[type] as string}
                    </Form.Text>
                  ))}
              </>
            ) : (
              <>
                {selectedExportable && (
                  <Form.Check
                    type="switch"
                    id="onlySelected"
                    className="mb-2"
                    label={em?.onlySelected}
                    checked={onlySelected}
                    onChange={(e) => setOnlySelected(e.currentTarget.checked)}
                  />
                )}

                {!effectiveOnlySelected && (
                  <ExportablesSelector
                    value={exportables}
                    available={initExportables}
                    onChange={setExportables}
                  />
                )}
              </>
            )}

            {!effectiveOnlySelected && (
              <Form.Text muted className="d-block mt-1">
                {em?.disabledAlert}
              </Form.Text>
            )}
          </Form.Group>

          {!isGarmin && (
            <Form.Group controlId="elevation" className="mb-3">
              <Form.Label>{em?.elevation.label}</Form.Label>

              <div>
                <ButtonGroup>
                  {ExportElevationSchema.options.map((option) => (
                    <ToggleButton
                      id={`ele-${option}`}
                      key={option}
                      type="radio"
                      variant="outline-primary"
                      value={option}
                      checked={effectiveElevation === option}
                      onChange={setElevation}
                      // The whole control is off when nothing selected can carry
                      // elevation; "Override all" is off when nothing recorded
                      // can be overridden (it would equal "Fill missing").
                      disabled={
                        !canElevate || (option === 'all' && !hasRecorded)
                      }
                    >
                      {em?.elevation[option]}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !exportables.length ||
              garminSelectedError ||
              (target === 'garmin' && (!name.trim() || !activity))
            }
          >
            <FaFileExport /> {m?.general.export}
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
