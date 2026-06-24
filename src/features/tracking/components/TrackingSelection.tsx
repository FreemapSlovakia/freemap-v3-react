import { useMessages } from '@features/l10n/l10nInjector.js';
import { Selection } from '@shared/components/Selection.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaBullseye, FaEye } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { setActiveModal, setTool } from '@/app/store/actions.js';
import { trackingActiveTrackIdSelector } from '@/app/store/selectors.js';
import { LongPressTooltip } from '@/shared/components/LongPressTooltip.js';
import { useAppSelector } from '@/shared/hooks/useAppSelector.js';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  const trackingOpen = useAppSelector((state) =>
    state.main.tools.includes('tracking'),
  );

  const selectedToken = useAppSelector(trackingActiveTrackIdSelector);

  const dispatch = useDispatch();

  return (
    <Selection
      icon={
        <>
          <LongPressTooltip label={m?.tools.tracking}>
            {({ props }) => (
              <Button
                {...props}
                variant="dark"
                disabled={trackingOpen}
                onClick={() =>
                  dispatch(setTool({ tool: 'tracking', mode: 'open' }))
                }
              >
                <FaBullseye />
              </Button>
            )}
          </LongPressTooltip>{' '}
          <FaEye />
        </>
      }
      label={m?.selections.tracking}
      deletable
      noLeftMargin
    >
      <LongPressTooltip label={m?.general.modify}>
        {({ props }) => (
          <Button
            {...props}
            className="ms-1"
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
