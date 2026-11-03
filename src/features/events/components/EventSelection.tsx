import { clearMapFeatures } from '@app/store/actions.js';
import { useAskLoadMerge } from '@features/myMaps/hooks/useAskLoadMerge.js';
import { mapsDisconnect } from '@features/myMaps/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaSignInAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { eventsOpen } from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

export default function EventSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const event = useAppSelector((state) => state.events.selected);

  const activeMapId = useAppSelector((state) => state.myMaps.activeMap?.id);

  const askLoadMerge = useAskLoadMerge();

  if (!event) {
    return null;
  }

  return (
    <Selection icon={<FaCalendarAlt />} label={event.name ?? undefined}>
      {activeMapId === event.mapId ? (
        <LongPressTooltip label={em?.backToEvents} breakpoint="md">
          {({ props, label, labelClassName }) => (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(mapsDisconnect());

                // Takes the selection too, leaving the event markers.
                dispatch(clearMapFeatures());
              }}
              {...props}
            >
              <FaArrowLeft /> <span className={labelClassName}>{label}</span>
            </Button>
          )}
        </LongPressTooltip>
      ) : (
        <LongPressTooltip label={em?.open} breakpoint="md">
          {({ props, label, labelClassName }) => (
            <Button
              variant="primary"
              onClick={async () => {
                const merge = await askLoadMerge();

                if (merge !== null) {
                  dispatch(eventsOpen({ mapId: event.mapId, merge }));
                }
              }}
              {...props}
            >
              <FaSignInAlt /> <span className={labelClassName}>{label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </Selection>
  );
}
