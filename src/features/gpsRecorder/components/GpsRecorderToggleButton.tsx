import { openTool } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function GpsRecorderToggleButton(): ReactElement {
  const open = useAppSelector((state) => isToolOpen(state, 'gps-recorder'));

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.tools.gpsRecorder}>
      {({ props }) => (
        <Button
          {...props}
          variant="dark"
          disabled={open}
          onClick={() => dispatch(openTool('gps-recorder'))}
        >
          <FaCircle />
        </Button>
      )}
    </LongPressTooltip>
  );
}
