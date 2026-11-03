import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setDetailsShown } from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

/** Toggles the details of a selection that came without them. */
export function DetailsButton(): ReactElement | null {
  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const offered = useAppSelector((state) => state.main.detailsOnRequest);

  const shown = useAppSelector((state) => state.main.detailsShown);

  if (!offered) {
    return null;
  }

  return (
    <LongPressTooltip breakpoint="sm" label={om?.showDetails}>
      {({ label, labelClassName, props }) => (
        <Button
          variant="secondary"
          active={shown}
          onClick={() => dispatch(setDetailsShown(!shown))}
          {...props}
        >
          <FaInfoCircle />
          <span className={labelClassName}> {label}</span>
        </Button>
      )}
    </LongPressTooltip>
  );
}
