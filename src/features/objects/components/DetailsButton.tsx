import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { objectsSetDetailsOverride } from '../model/actions.js';
import {
  defaultShowsDetails,
  detailsTarget,
} from '../model/objectDetailsProcessor.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

/**
 * Asks for the details of the one kind of selection that comes without them —
 * a hit from searching by name, merely looked at. Everything else answers with
 * its details unasked, and clicking it again brings them back after the ×, so
 * there is nothing there for this to offer.
 */
export function DetailsButton(): ReactElement | null {
  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const key = useAppSelector((state) => detailsTarget(state)?.key);

  const offByDefault = useAppSelector((state) => !defaultShowsDetails(state));

  if (key === undefined || !offByDefault) {
    return null;
  }

  return (
    <LongPressTooltip breakpoint="sm" label={om?.showDetails}>
      {({ label, labelClassName, props }) => (
        <Button
          variant="secondary"
          onClick={() => dispatch(objectsSetDetailsOverride(true))}
          {...props}
        >
          <FaInfoCircle />
          <span className={labelClassName}> {label}</span>
        </Button>
      )}
    </LongPressTooltip>
  );
}
