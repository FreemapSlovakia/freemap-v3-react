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
import { FaCheck, FaPaintBrush, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { type RouteStyle, routePlannerSetStyle } from '../model/actions.js';
import { routePlannerSettingsInitialState } from '../model/settingsReducer.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

type Props = { show: boolean };

const defaults: RouteStyle = {
  lineWidth: routePlannerSettingsInitialState.lineWidth,
  lineOpacity: routePlannerSettingsInitialState.lineOpacity,
  markerOpacity: routePlannerSettingsInitialState.markerOpacity,
};

const styleEquals = (a: RouteStyle, b: RouteStyle) =>
  a.lineWidth === b.lineWidth &&
  a.lineOpacity === b.lineOpacity &&
  a.markerOpacity === b.markerOpacity;

/**
 * Adjusts the drawn route's line width, line opacity, and marker opacity. The
 * per-segment colors (transport mode, colorize) are not user-editable; the
 * white/blue outline follows the line width and opacity automatically.
 */
export default function RoutePlannerStyleModal({ show }: Props): ReactElement {
  const m = useMessages();

  const rpm = useRoutePlannerMessages();

  const dispatch = useDispatch();

  const current: RouteStyle = {
    lineWidth: useAppSelector((state) => state.routePlannerSettings.lineWidth),
    lineOpacity: useAppSelector(
      (state) => state.routePlannerSettings.lineOpacity,
    ),
    markerOpacity: useAppSelector(
      (state) => state.routePlannerSettings.markerOpacity,
    ),
  };

  // Seeded once per open (the modal remounts on show), so this holds the draft
  // until Save.
  const [style, setStyle] = useState<RouteStyle>(current);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(routePlannerSetStyle(style));

    close();
  };

  useDocumentTitle(show ? rpm?.style.title : undefined);

  return (
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaintBrush /> {rpm?.style.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              {rpm?.style.lineWidth}: {style.lineWidth} px
            </Form.Label>

            <Form.Range
              min={1}
              max={12}
              step={1}
              value={style.lineWidth}
              onChange={(e) => {
                const lineWidth = e.currentTarget.valueAsNumber;

                setStyle((s) => ({ ...s, lineWidth }));
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              {rpm?.style.lineOpacity}: {Math.round(style.lineOpacity * 100)} %
            </Form.Label>

            <Form.Range
              min={0}
              max={1}
              step={0.05}
              value={style.lineOpacity}
              onChange={(e) => {
                const lineOpacity = e.currentTarget.valueAsNumber;

                setStyle((s) => ({ ...s, lineOpacity }));
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>
              {rpm?.style.markerOpacity}:{' '}
              {Math.round(style.markerOpacity * 100)} %
            </Form.Label>

            <Form.Range
              min={0}
              max={1}
              step={0.05}
              value={style.markerOpacity}
              onChange={(e) => {
                const markerOpacity = e.currentTarget.valueAsNumber;

                setStyle((s) => ({ ...s, markerOpacity }));
              }}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={styleEquals(style, current)}>
            <FaCheck /> {m?.general.save}
          </Button>

          <ResetToDefaultsButton
            onClick={() => setStyle(defaults)}
            disabled={styleEquals(style, defaults)}
          />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
