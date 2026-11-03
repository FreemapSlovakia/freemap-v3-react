import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { isClosedRing } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useHeldModal } from '@shared/hooks/useHeldModal.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { area } from '@turf/area';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaTree, FaWater } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { useTraceKinds } from '../hooks/useTraceKinds.js';
import { dataViewerSetTraceOutput } from '../model/actions.js';
import {
  runTrace,
  TRACE_MAX_AREA,
  TRACE_PHRASES,
  type TraceOutput,
} from '../traceServices.js';
import type { DataViewerMessages } from '../translations/DataViewerMessages.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

type Props = { show: boolean };

// ASPRS LAS classification codes.
const CLASSES: [number, keyof DataViewerMessages['trace']['classNames']][] = [
  [3, 'lowVegetation'],
  [4, 'mediumVegetation'],
  [5, 'highVegetation'],
  [6, 'building'],
  [9, 'water'],
];

const STREAM_FIELDS = [
  ['threshold', 'threshold', '20000', 'm²'],
  ['min-len', 'minLength', '50', 'm'],
  ['simplify-tolerance', 'simplify', '1.5', 'm'],
] as const;

export default function DataViewerTraceModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dvm = useDataViewerMessages();

  const dispatch = useDispatch();

  // Read once: the remembered result only seeds the control.
  const store = useStore<RootState>();

  const opened = useHeldModal('data-viewer-trace');

  const kind = opened?.kind ?? 'streams';

  const legacy = opened?.legacy;

  const mask = useAppSelector((state) => {
    const { selection } = state.main;

    const geometry =
      selection?.type === 'feature'
        ? state.trackViewer.trackGeojson?.features[selection.id]?.geometry
        : undefined;

    return geometry?.type === 'Polygon' ? geometry : undefined;
  });

  // The menu that offers the trace again, for the alert to point to.
  const offered = useTraceKinds(true)[kind];

  // Its polygon gone, as after a Back that rebuilt the data: nothing to trace.
  useEffect(() => {
    if (show && !mask) {
      dispatch(setActiveModal(null));
    }
  }, [show, mask, dispatch]);

  const language = useAppSelector((state) => state.l10n.language);

  const [pixelSize, setPixelSize] = useState('');

  const [streamValues, setStreamValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(STREAM_FIELDS.map(([key, , value]) => [key, value])),
  );

  const [classes, setClasses] = useState(() => new Set([4, 5]));

  // JOSM runs on a desktop only.
  const [output, setOutput] = useState<TraceOutput>(
    () =>
      store.getState().trackViewerSettings.traceOutput ??
      (window.matchMedia('(pointer: fine)').matches ? 'josm' : 'osm'),
  );

  const invalidPixelSize = pixelSize !== '' && !(Number(pixelSize) > 0);

  // The services need every ring closed, of four positions at least.
  const closed = mask?.coordinates.every(
    (ring) => ring.length >= 4 && isClosedRing(ring),
  );

  const tooBig = mask !== undefined && area(mask) > TRACE_MAX_AREA[kind];

  const valid =
    closed &&
    !tooBig &&
    (kind === 'streams'
      ? !invalidPixelSize &&
        Object.values(streamValues).every(
          (value) => value !== '' && Number(value) >= 0,
        )
      : classes.size > 0);

  const title = kind === 'streams' ? dvm?.trace.streams : dvm?.trace.forests;

  useDocumentTitle(show ? title : undefined);

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    if (!mask || !valid) {
      return;
    }

    trackMatomo(['trackEvent', 'DataViewer', 'trace', `${kind}-${output}`]);

    dispatch(dataViewerSetTraceOutput(output));

    runTrace(
      dispatch,
      kind,
      kind === 'streams'
        ? {
            ...streamValues,
            ...(pixelSize === '' ? {} : { 'pixel-size': pixelSize }),
          }
        : {
            classifications: [...classes].toSorted((a, b) => a - b).join(','),
          },
      mask,
      output,
    );

    close();
  };

  return (
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            {kind === 'streams' ? <FaWater /> : <FaTree />} {title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {legacy && offered && (
            <Alert variant="info">
              {title &&
                dvm?.trace.legacy({
                  phrase: TRACE_PHRASES[kind],
                  item: title,
                })}
            </Alert>
          )}

          <Form.Text muted className="d-block mb-3">
            {kind === 'streams'
              ? dvm?.trace.streamsHelp
              : dvm?.trace.forestsHelp}
          </Form.Text>

          {kind === 'streams' ? (
            <>
              <Form.Group controlId="tracePixelSize" className="mb-3">
                <Form.Label>
                  <Text m={dvm} k="trace.pixelSize" />
                </Form.Label>

                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    min={0}
                    step="any"
                    value={pixelSize}
                    isInvalid={invalidPixelSize}
                    onChange={(e) => setPixelSize(e.currentTarget.value)}
                  />

                  <InputGroup.Text>m</InputGroup.Text>

                  <Form.Control.Feedback type="invalid">
                    {m?.general.valueAbove({ min: '0 m' })}
                  </Form.Control.Feedback>
                </InputGroup>

                <Form.Text muted>
                  <Text m={dvm} k="trace.pixelSizeHint" />
                </Form.Text>
              </Form.Group>

              {STREAM_FIELDS.map(([key, label, , unit]) => (
                <Form.Group
                  key={key}
                  controlId={`trace-${key}`}
                  className="mb-3"
                >
                  <Form.Label>{dvm?.trace[label]}</Form.Label>

                  <InputGroup>
                    <Form.Control
                      type="number"
                      min={0}
                      step="any"
                      required
                      value={streamValues[key]}
                      onChange={(e) => {
                        const { value } = e.currentTarget;

                        setStreamValues((values) => ({
                          ...values,
                          [key]: value,
                        }));
                      }}
                    />

                    <InputGroup.Text>{unit}</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              ))}
            </>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>
                <Text m={dvm} k="trace.classes" />
              </Form.Label>

              {CLASSES.map(([code, name]) => (
                <Form.Check
                  key={code}
                  id={`traceClass${code}`}
                  label={dvm?.trace.classNames[name]}
                  checked={classes.has(code)}
                  onChange={(e) => {
                    const { checked } = e.currentTarget;

                    setClasses((prev) => {
                      const next = new Set(prev);

                      if (checked) {
                        next.add(code);
                      } else {
                        next.delete(code);
                      }

                      return next;
                    });
                  }}
                />
              ))}
            </Form.Group>
          )}

          <Form.Group controlId="traceOutput">
            <Form.Label>
              <Text m={dvm} k="trace.output" />
            </Form.Label>

            <Form.Select
              value={output}
              onChange={(e) => {
                setOutput(e.currentTarget.value as TraceOutput);
              }}
            >
              <option value="josm">{dvm?.trace.outputJosm}</option>
              <option value="osm">{dvm?.trace.outputOsm}</option>
              <option value="geojson">{dvm?.trace.outputGeojson}</option>
            </Form.Select>
          </Form.Group>

          {tooBig && (
            <Alert variant="warning" className="mt-3 mb-0">
              {dvm?.trace.tooBig({
                max: `${(TRACE_MAX_AREA[kind] / 1_000_000).toLocaleString(language)} km²`,
              })}
            </Alert>
          )}
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            variant="primary"
            type="submit"
            disabled={!valid}
            icon={<FaCheck />}
            label={dvm?.trace.run}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
