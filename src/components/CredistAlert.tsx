import { type ReactElement } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';

type Props = { buy?: boolean; price?: number; explainCredits?: boolean };

export function CreditsAlert({
  buy = false,
  price,
  explainCredits = false,
}: Props): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  const nf = useNumberFormat();

  const m = useMessages();

  return !user ? null : (
    <Alert
      variant={price !== undefined && price > user.credits ? 'danger' : 'info'}
    >
      <div className="d-flex justify-content-between">
        <span>
          {m?.credits.youHaveCredits(
            <b>{nf.format(Math.floor(user.credits))}</b>,
            explainCredits,
          )}
        </span>

        {buy && (
          <Button
            type="button"
            className="m-n2 ms-2"
            onClick={() => dispatch(setActiveModal('buy-credits'))}
          >
            <FaCoins /> {m?.credits.buyCredits}
          </Button>
        )}
      </div>
    </Alert>
  );
}
