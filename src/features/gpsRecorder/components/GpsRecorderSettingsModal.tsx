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
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { gpsRecorderSetSettings } from '../model/actions.js';
import {
  type GpsRecorderSettingsState,
  gpsRecorderSettingsInitialState,
} from '../model/settingsReducer.js';
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

  const set = useCallback(
    (patch: Partial<GpsRecorderSettingsState>) =>
      setDraft((current) => ({ ...current, ...patch })),
    [],
  );

  const resetDefaults = useCallback(() => {
    setDraft(gpsRecorderSettingsInitialState);

    setInterval(String(gpsRecorderSettingsInitialState.intervalMs / 1000));
  }, []);

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
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {grm?.settingsModal.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h6>{grm?.settingsModal.recorderSection}</h6>

          <p className="text-body-secondary small">
            {grm?.settingsModal.recorderIntro}
          </p>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.intervalMs}</Form.Label>

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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.minDistanceM}</Form.Label>

            <Form.Control
              type="number"
              min={0}
              max={1000}
              step={1}
              value={draft.minDistanceM}
              onChange={(e) => set({ minDistanceM: Number(e.target.value) })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.maxAccuracyM}</Form.Label>

            <Form.Control
              type="number"
              min={1}
              max={1000}
              step={1}
              placeholder={grm?.settingsModal.maxAccuracyOff}
              value={draft.maxAccuracyM ?? ''}
              onChange={(e) =>
                set({
                  maxAccuracyM: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.priority}</Form.Label>

            <Form.Select
              value={draft.priority}
              onChange={(e) =>
                set({
                  priority: e.target
                    .value as GpsRecorderSettingsState['priority'],
                })
              }
            >
              <option value="high">{grm?.settingsModal.priorityHigh}</option>

              <option value="balanced">
                {grm?.settingsModal.priorityBalanced}
              </option>

              <option value="low">{grm?.settingsModal.priorityLow}</option>
            </Form.Select>
          </Form.Group>

          <hr />

          <h6>{grm?.settingsModal.displaySection}</h6>

          <Form.Group className="mb-3">
            <Form.Label>{grm?.settingsModal.splitGapS}</Form.Label>

            <Form.Control
              type="number"
              min={0}
              max={720}
              step={1}
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

            <Form.Text>{grm?.settingsModal.splitGapHint}</Form.Text>
          </Form.Group>

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

          <Form.Check
            id="chkGpsRecorderKeepAwake"
            type="checkbox"
            label={grm?.settingsModal.keepScreenAwake}
            checked={draft.keepScreenAwake}
            onChange={(e) => set({ keepScreenAwake: e.currentTarget.checked })}
          />
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
