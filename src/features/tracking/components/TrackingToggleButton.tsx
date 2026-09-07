import { openTool } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function TrackingToggleButton(): ReactElement {
  const trackingOpen = useAppSelector((state) => isToolOpen(state, 'tracking'));

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.tools.tracking}>
      {({ props }) => (
        <Button
          {...props}
          variant="dark"
          disabled={trackingOpen}
          onClick={() => dispatch(openTool('tracking'))}
        >
          <FaBullseye />
        </Button>
      )}
    </LongPressTooltip>
  );
}
