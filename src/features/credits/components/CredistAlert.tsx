import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type ReactElement } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useCreditsMessages } from '../translations/useCreditsMessages.js';

type Props = { buy?: boolean; price?: number; explainCredits?: boolean };

export function CreditsAlert({
  buy = false,
  price,
  explainCredits = false,
}: Props): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  const nf = useNumberFormat();

  const cm = useCreditsMessages();

  return !user ? null : (
    <Alert
      variant={price !== undefined && price > user.credits ? 'danger' : 'info'}
    >
      <div className="d-flex justify-content-between  gap-4">
        <span>
          {cm?.youHaveCredits(
            <b>{nf.format(Math.floor(user.credits))}</b>,
            explainCredits,
          )}
        </span>

        {buy && (
          <Button
            className="m-n2 ms-2"
            onClick={() =>
              dispatch(setActiveModal({ type: 'credits-purchase' }))
            }
          >
            <FaCoins /> {cm?.buyCredits}
          </Button>
        )}
      </div>
    </Alert>
  );
}
