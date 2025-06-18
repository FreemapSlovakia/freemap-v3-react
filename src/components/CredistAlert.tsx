import { type ReactElement } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';

type Props = { buy?: boolean };

export function CreditsAlert({ buy }: Props): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  return !user ? null : (
    <Alert variant="info" className="d-flex justify-content-between">
      <span>
        <FaCoins /> You have {/* t */} <b>{user.credits.toFixed(2)}</b> credits.
      </span>

      {buy !== false && (
        <Button
          type="button"
          className="m-n2 ms-2"
          onClick={() => dispatch(setActiveModal('buy-credits'))}
        >
          <FaCoins /> Buy credit{/* t */}
        </Button>
      )}
    </Alert>
  );
}
