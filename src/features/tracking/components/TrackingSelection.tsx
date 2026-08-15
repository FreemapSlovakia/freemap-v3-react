import { openTool, setActiveModal } from '@app/store/actions.js';
import {
  isToolOpen,
  trackingActiveTrackIdSelector,
} from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaBullseye, FaEye } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  const trackingOpen = useAppSelector((state) => isToolOpen(state, 'tracking'));

  const selectedToken = useAppSelector(trackingActiveTrackIdSelector);

  const dispatch = useDispatch();

  return (
    <Selection
      control={
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
      }
      icon={<FaEye />}
      label={m?.selections.tracking}
      deletable
    >
      <LongPressTooltip label={m?.general.modify}>
        {({ props }) => (
          <Button
            {...props}
            variant="secondary"
            onClick={() =>
              dispatch(
                setActiveModal(
                  selectedToken == null
                    ? { type: 'tracking-watched' }
                    : {
                        type: 'tracking-watched',
                        token: String(selectedToken),
                      },
                ),
              )
            }
          >
            <FaPencil />
          </Button>
        )}
      </LongPressTooltip>
    </Selection>
  );
}
