import {
  type FixConsumer,
  requestFix,
  setFixRequest,
} from '@features/location/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement, ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaRegDotCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { SplitButton } from './SplitButton.js';

type Props = {
  /** Which waiting-for-a-fix this button owns; see `locateOnceProcessor`. */
  consumer: FixConsumer;
  /** Starts the picking mode this panel uses. */
  onPick: () => void;
  label: ReactNode;
  icon: ReactNode;
  locateLabel: ReactNode;
  variant?: string;
  /** Run before either action — the panorama asks iOS for the magnetometer here. */
  onAct?: () => void;
};

/**
 * "Where does this go?", answered either by pointing at the map or by standing
 * somewhere. Pointing is under the button because it is the common case; the
 * GPS is behind the caret.
 *
 * Owns the wait: a spinner while a fix is coming, and either half ends it —
 * picking because a fix landing mid-pick would place the thing itself, and the
 * menu item because a fix can fail to arrive with nothing dispatched to say so
 * (a bare timeout keeps trying), which would otherwise spin for ever.
 */
export function PlacePickerButton({
  consumer,
  onPick,
  label,
  icon,
  locateLabel,
  variant,
  onAct,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const awaitingFix = useAppSelector(
    (state) => state.location.fixRequest === consumer,
  );

  return (
    <SplitButton
      variant={variant}
      label={label}
      icon={awaitingFix ? <Spinner animation="border" size="sm" /> : icon}
      onClick={() => {
        onAct?.();

        dispatch(setFixRequest(null));

        onPick();
      }}
      items={[
        {
          icon: <FaRegDotCircle />,
          label: locateLabel,
          onSelect: () => {
            onAct?.();

            dispatch(awaitingFix ? setFixRequest(null) : requestFix(consumer));
          },
        },
      ]}
    />
  );
}
