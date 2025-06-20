import { type ReactElement } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';

type Props = { buy?: boolean; price?: number };

export function CreditsAlert({ buy, price }: Props): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  const nf = useNumberFormat();

  return !user ? null : (
    <Alert
      variant={price !== undefined && price > user.credits ? 'danger' : 'info'}
      className="d-flex justify-content-between"
    >
      <span>
        <FaCoins /> You have {/* t */}{' '}
        <b>{nf.format(Math.floor(user.credits))}</b> credits.
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
