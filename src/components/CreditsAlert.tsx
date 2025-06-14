import { type ReactElement } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';
import { useAppSelector } from '../hooks/reduxSelectHook.js';

export function CreditsAlert(): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  return !user ? null : (
    <Alert variant="info" className="d-flex justify-content-between">
      <span>
        <FaCoins /> Credits:{/* t */} <b>{user.credits.toFixed(2)}</b>
      </span>

      <Button className="m-n2 ms-2">
        <FaCoins /> Buy credits{/* t */}
      </Button>
    </Alert>
  );
}
