import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useState,
} from 'react';
import {
  Button,
  Form,
  InputGroup,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { gpsRecorderSetSettings } from '../model/actions.js';
import {
  type GpsRecorderSettingsState,
  gpsRecorderSettingsInitialState,
} from '../model/settingsReducer.js';
import { gpsRecorderPlatformSupported } from '../support.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';

type Props = { show: boolean };

/**
 * Split by who acts on each setting: the top half travels to the recorder with
 * `POST /start` and decides what is recorded at all, the bottom half never
 * leaves the browser. They are kept apart because only the first is subject to
 * the recorder supporting it, and only the first is powerless over a recording
 * that has already started.
 */
export default function GpsRecorderSettingsModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const grm = useGpsRecorderMessages();

  const dispatch = useDispatch();

  const saved = useAppSelector((state) => state.gpsRecorderSettings);

  const [draft, setDraft] = useState<GpsRecorderSettingsState>(saved);

  // Seconds as typed. Only the draft is submitted, so an empty or half-written
  // field simply leaves the last good value in place — `required` and `min` are
  // what stop it being submitted in that state.
  const [interval, setInterval] = useState(String(saved.intervalMs / 1000));

  // Off Android there is nothing else it could be, whatever the stored value
  // says — the same rule `recorderBackendKind` applies.
  const browser = !gpsRecorderPlatformSupported || draft.backend === 'browser';

  // Unlike everything else here, switching engines mid-ride is not merely
  // ineffective until the next start: the engine that is running keeps its watch
  // and keeps appending, while every handler starts addressing the other one. So
  // this one field is locked for the duration rather than left to be ignored.
  const recording = useAppSelector(
    (state) => state.gpsRecorder.status?.recording ?? false,
  );

  const set = useCallback(
    (patch: Partial<GpsRecorderSettingsState>) =>
      setDraft((current) => ({ ...current, ...patch })),
    [],
  );

  const resetDefaults = useCallback(() => {
    setDraft((current) => ({
      ...gpsRecorderSettingsInitialState,
      // The defaults name a backend too, so a reset would switch engines by the
      // back door — the one door the control above is closed against.
      backend: recording
        ? current.backend
        : gpsRecorderSettingsInitialState.backend,
    }));

    setInterval(String(gpsRecorderSettingsInitialState.intervalMs / 1000));
  }, [recording]);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(gpsRecorderSetSettings(draft));

    close();
  };

  useDocumentTitle(show ? grm?.settingsModal.title : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {grm?.settingsModal.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Only where both exist. Off Android the recorder app cannot be
              installed at all, and offering — or even naming — it there would be
              an option the user can do nothing with. */}
          {gpsRecorderPlatformSupported && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="d-block">
                  {grm?.settingsModal.backend}
                </Form.Label>

                <ToggleButtonGroup
                  type="radio"
                  name="recorderBackend"
                  value={draft.backend}
                  onChange={(backend: GpsRecorderSettingsState['backend']) =>
                    set({ backend })
                  }
                >
                  <ToggleButton
                    id="rb-app"
                    value="app"
                    variant="outline-primary"
                    disabled={recording}
                  >
                    {grm?.settingsModal.backendApp}
                  </ToggleButton>

                  <ToggleButton
                    id="rb-browser"
                    value="browser"
                    variant="outline-primary"
                    disabled={recording}
                  >
                    {grm?.settingsModal.backendBrowser}
                  </ToggleButton>
                </ToggleButtonGroup>

                <Form.Text className="d-block">
                  {recording
                    ? grm?.settingsModal.backendLockedHint
                    : grm?.settingsModal.backendHint}
                </Form.Text>
              </Form.Group>

              <hr />
            </>
          )}

          <h6>{grm?.settingsModal.recorderSection}</h6>

          <p className="text-body-secondary small">
            {browser
              ? grm?.settingsModal.browserIntro
              : grm?.settingsModal.recorderIntro}
          </p>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.intervalMs}</Form.Label>

            <InputGroup>
              {/* The field keeps its own text while it is being edited, so clearing
                  it leaves it empty instead of snapping to "0" under the cursor —
                  which is what a value derived straight from the draft did, and what
                  also made `required` unreachable, since the field was never
                  actually empty. */}
              <Form.Control
                type="number"
                required
                min={0.2}
                max={600}
                // Anchored to `min`, so a coarser step would reject 1.5 s, 2.5 s
                // and every other value between its multiples.
                step={0.1}
                value={interval}
                onChange={(e) => {
                  setInterval(e.target.value);

                  const seconds = Number(e.target.value);

                  if (e.target.value !== '' && Number.isFinite(seconds)) {
                    set({ intervalMs: Math.round(seconds * 1000) });
                  }
                }}
              />

              <InputGroup.Text>{m?.general.seconds}</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.minDistanceM}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                max={1000}
                step={1}
                value={draft.minDistanceM}
                onChange={(e) => set({ minDistanceM: Number(e.target.value) })}
              />

              <InputGroup.Text>{m?.general.meters}</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.maxAccuracyM}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={1}
                max={1000}
                step={1}
                placeholder={grm?.settingsModal.maxAccuracyOff}
                value={draft.maxAccuracyM ?? ''}
                onChange={(e) =>
                  set({
                    maxAccuracyM: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />

              <InputGroup.Text>{m?.general.meters}</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {/* Neither has any meaning in the browser: the web API picks no
              provider and offers no accuracy/battery trade-off. Hidden rather
              than disabled — a control that could never do anything says
              nothing by being greyed out. */}
          {!browser && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>{grm?.settingsModal.source}</Form.Label>

                <Form.Select
                  value={draft.source}
                  onChange={(e) =>
                    set({
                      source: e.target
                        .value as GpsRecorderSettingsState['source'],
                    })
                  }
                >
                  <option value="gps">{grm?.settingsModal.sourceGps}</option>

                  <option value="fused">
                    {grm?.settingsModal.sourceFused}
                  </option>
                </Form.Select>

                <Form.Text>{grm?.settingsModal.sourceHint}</Form.Text>
              </Form.Group>

              {/* Only the fused provider has modes to trade off, and the recorder
              ignores this under the other one — so the field says so rather than
              taking a choice that would go nowhere. */}
              <Form.Group className="mb-3">
                <Form.Label>{grm?.settingsModal.priority}</Form.Label>

                <Form.Select
                  disabled={draft.source === 'gps'}
                  value={draft.priority}
                  onChange={(e) =>
                    set({
                      priority: e.target
                        .value as GpsRecorderSettingsState['priority'],
                    })
                  }
                >
                  <option value="high">
                    {grm?.settingsModal.priorityHigh}
                  </option>

                  <option value="balanced">
                    {grm?.settingsModal.priorityBalanced}
                  </option>

                  <option value="low">{grm?.settingsModal.priorityLow}</option>
                </Form.Select>

                {draft.source === 'gps' && (
                  <Form.Text>{grm?.settingsModal.priorityFusedOnly}</Form.Text>
                )}
              </Form.Group>
            </>
          )}

          <hr />

          <h6>{grm?.settingsModal.displaySection}</h6>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.splitGapS}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                max={720}
                // Minutes, over a value held in seconds — a stored gap that is
                // not a whole number of minutes must still submit. The arrows
                // step by one regardless.
                step="any"
                placeholder={grm?.settingsModal.splitGapOff}
                value={draft.splitGapS === 0 ? '' : draft.splitGapS / 60}
                onChange={(e) =>
                  set({
                    splitGapS: e.target.value
                      ? Math.round(Number(e.target.value) * 60)
                      : 0,
                  })
                }
              />

              <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
            </InputGroup>

            <Form.Text>{grm?.settingsModal.splitGapHint}</Form.Text>
          </Form.Group>

          {/* A question only the recorder app raises. Recording in the browser
              feeds "Locate me" from the very same watch, so there is no second
              source to choose between and nothing to save by choosing. */}
          {!browser && (
            <Form.Group className="mb-3">
              <Form.Check
                id="chkGpsRecorderFeedLocation"
                type="checkbox"
                label={grm?.settingsModal.feedLocation}
                checked={draft.feedLocation}
                onChange={(e) => set({ feedLocation: e.currentTarget.checked })}
              />

              <Form.Text>{grm?.settingsModal.feedLocationHint}</Form.Text>
            </Form.Group>
          )}

          {/* Not a choice when this page is what records: a blanked screen ends
              a browser recording rather than merely hiding it, so the lock is
              held regardless and offering to turn it off would be offering to
              lose rides. */}
          {!browser && (
            <Form.Check
              id="chkGpsRecorderKeepAwake"
              type="checkbox"
              label={grm?.settingsModal.keepScreenAwake}
              checked={draft.keepScreenAwake}
              onChange={(e) =>
                set({ keepScreenAwake: e.currentTarget.checked })
              }
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit">
            <FaCheck /> {m?.general.save}
          </Button>

          <ResetToDefaultsButton onClick={resetDefaults} />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
