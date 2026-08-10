import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { objectsSetShowDetails } from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

/**
 * Shows or hides the details of whatever is selected. Shared by the selection
 * toolbars of every feature kind that has details, so the toast is reachable
 * from the selection it belongs to instead of only from a click on the map.
 */
export function DetailsToggle(): ReactElement {
  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const showDetails = useAppSelector(
    (state) => state.objectsSettings.showDetails,
  );

  return (
    <LongPressTooltip label={om?.showDetails}>
      {({ props }) => (
        <Button
          className="ms-1"
          variant="secondary"
          active={showDetails}
          aria-pressed={showDetails}
          onClick={() => dispatch(objectsSetShowDetails(!showDetails))}
          {...props}
        >
          <FaInfoCircle />
        </Button>
      )}
    </LongPressTooltip>
  );
}
