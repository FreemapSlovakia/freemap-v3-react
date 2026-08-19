import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type ChangeEvent,
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaChartArea, FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { elevationSetSettings } from '../model/actions.js';
import {
  type ElevationSettingsState,
  elevationSettingsInitialState,
  GRADE_WINDOW_WHOLE_LINE,
} from '../model/settingsReducer.js';

const GRADE_WINDOW_STEP_M = 5;

const GRADE_WINDOW_MAX_M = 200;

// The whole-line window sits on the slider's own top notch, one step past the
// longest window measured in metres: it is unbounded, so no place on a scale of
// metres belongs to it. The stored value is out of band, hence the two
// conversions around the control.
const GRADE_WINDOW_WHOLE_LINE_POS = GRADE_WINDOW_MAX_M + GRADE_WINDOW_STEP_M;

type WindowSliderProps = {
  id: string;
  label?: string;
  help?: string;
  /** The window as the readout writes it, already parenthesised. */
  display: string;
  max?: number;
  step?: number;
  value: string;
  onChange: (value: string) => void;
};

/** One window setting: a slider in metres with the chosen width beside its label. */
function WindowSlider({
  id,
  label,
  help,
  display,
  max = 100,
  step = 5,
  value,
  onChange,
}: WindowSliderProps): ReactElement {
  return (
    <Form.Group controlId={id} className="mt-3">
      <Form.Label>
        {label} <span className="text-body-secondary">{display}</span>
      </Form.Label>

      <Form.Range
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange(e.currentTarget.value);
        }}
      />

      <Form.Text muted className="d-block">
        {help}
      </Form.Text>
    </Form.Group>
  );
}

type Props = { show: boolean };

export default function ElevationSettingsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const initialDespikeWindow = useAppSelector((state) =>
    String(state.elevationSettings.despikeWindow),
  );

  const [despikeWindow, setDespikeWindow] = useState(initialDespikeWindow);

  const initialDitchFillWindow = useAppSelector((state) =>
    String(state.elevationSettings.ditchFillWindow),
  );

  const [ditchFillWindow, setDitchFillWindow] = useState(
    initialDitchFillWindow,
  );

  const initialGradeWindow = useAppSelector((state) =>
    String(state.elevationSettings.gradeWindow),
  );

  const [gradeWindow, setGradeWindow] = useState(initialGradeWindow);

  useDocumentTitle(show ? m?.elevationChart.settings : undefined);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  // Fills the form fields with defaults; the user then applies them with Save
  // (or closes without saving).
  const handleResetDefaults = useCallback(() => {
    setDespikeWindow(String(elevationSettingsInitialState.despikeWindow));

    setDitchFillWindow(String(elevationSettingsInitialState.ditchFillWindow));

    setGradeWindow(String(elevationSettingsInitialState.gradeWindow));
  }, []);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    // Only what changed: a redraw follows the smoothing windows, and the
    // steepness window asks for none.
    const settings: Partial<ElevationSettingsState> = {};

    if (despikeWindow !== initialDespikeWindow) {
      settings.despikeWindow = Number(despikeWindow);
    }

    if (ditchFillWindow !== initialDitchFillWindow) {
      settings.ditchFillWindow = Number(ditchFillWindow);
    }

    if (gradeWindow !== initialGradeWindow) {
      settings.gradeWindow = Number(gradeWindow);
    }

    if (Object.keys(settings).length > 0) {
      dispatch(elevationSetSettings(settings));
    }

    close();
  };

  const handleGradeWindowChange = useCallback((value: string) => {
    const pos = Number(value);

    setGradeWindow(
      String(
        pos === GRADE_WINDOW_WHOLE_LINE_POS ? GRADE_WINDOW_WHOLE_LINE : pos,
      ),
    );
  }, []);

  const metres = (value: string) =>
    value === '0' ? `(${m?.elevationChart.windowOff})` : `(${value}\u00a0m)`;

  const dirty =
    despikeWindow !== initialDespikeWindow ||
    ditchFillWindow !== initialDitchFillWindow ||
    gradeWindow !== initialGradeWindow;

  const atDefault =
    despikeWindow === String(elevationSettingsInitialState.despikeWindow) &&
    ditchFillWindow === String(elevationSettingsInitialState.ditchFillWindow) &&
    gradeWindow === String(elevationSettingsInitialState.gradeWindow);

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
            <FaChartArea /> {m?.elevationChart.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Text muted className="d-block mb-3">
            {m?.elevationChart.settingsHelp}
          </Form.Text>

          <WindowSlider
            id="despikeWindow"
            label={m?.elevationChart.despike}
            help={m?.elevationChart.despikeHelp}
            display={metres(despikeWindow)}
            value={despikeWindow}
            onChange={setDespikeWindow}
          />

          <WindowSlider
            id="ditchFillWindow"
            label={m?.elevationChart.ditchFill}
            help={m?.elevationChart.ditchFillHelp}
            display={metres(ditchFillWindow)}
            value={ditchFillWindow}
            onChange={setDitchFillWindow}
          />

          <WindowSlider
            id="gradeWindow"
            label={m?.elevationChart.gradeWindow}
            help={m?.elevationChart.gradeWindowHelp}
            display={
              gradeWindow === String(GRADE_WINDOW_WHOLE_LINE)
                ? `(${m?.elevationChart.windowWholeLine})`
                : metres(gradeWindow)
            }
            max={GRADE_WINDOW_WHOLE_LINE_POS}
            step={GRADE_WINDOW_STEP_M}
            value={
              gradeWindow === String(GRADE_WINDOW_WHOLE_LINE)
                ? String(GRADE_WINDOW_WHOLE_LINE_POS)
                : gradeWindow
            }
            onChange={handleGradeWindowChange}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={!dirty}>
            <FaCheck /> {m?.general.save}
          </Button>

          <ResetToDefaultsButton
            onClick={handleResetDefaults}
            disabled={atDefault}
          />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
