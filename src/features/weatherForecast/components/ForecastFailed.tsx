import { trackMatomo } from '@shared/trackMatomo.js';
import clsx from 'clsx';
import type { MouseEvent, ReactElement } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaRedo } from 'react-icons/fa';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';

/**
 * A forecast that failed to load, and the way to ask for it again; `inline` as
 * text with a link, for a table row.
 */
export function ForecastFailed({
  retry,
  inline,
  className,
}: {
  retry: () => void;
  inline?: boolean;
  className?: string;
}): ReactElement {
  const m = useWeatherForecastMessages();

  const handleClick = (e: MouseEvent) => {
    // Not a clickable row's own click.
    e.stopPropagation();

    trackMatomo(['trackEvent', 'Weather', 'retry']);

    retry();
  };

  if (inline) {
    return (
      <>
        {m?.failed}{' '}
        <Button
          variant="link"
          size="sm"
          className="p-0 align-baseline"
          onClick={handleClick}
        >
          {m?.retry}
        </Button>
      </>
    );
  }

  return (
    <Alert
      variant="warning"
      className={clsx('d-flex align-items-center gap-2', className)}
    >
      <span className="flex-grow-1">{m?.failed}</span>

      <Button
        variant="secondary"
        size="sm"
        className="flex-shrink-0"
        onClick={handleClick}
      >
        <FaRedo /> {m?.retry}
      </Button>
    </Alert>
  );
}
