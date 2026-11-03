import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAskLoadMerge } from '@features/myMaps/hooks/useAskLoadMerge.js';
import { mapsDisconnect } from '@features/myMaps/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaArrowLeft,
  FaCalendarDay,
  FaCloudDownloadAlt,
  FaEdit,
  FaExternalLinkAlt,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { eventsDelete, eventsOpen } from '../model/actions.js';

/** The linked map in a tab of its own: the full app, leaving this one's map be. */
function mapUrl(mapId: string): string {
  return `${location.origin}${location.pathname}#id=${encodeURIComponent(mapId)}`;
}

export default function EventSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const event = useAppSelector((state) => state.events.selected);

  const activeMapId = useAppSelector((state) => state.myMaps.activeMap?.id);

  const askLoadMerge = useAskLoadMerge();

  const confirm = useConfirm();

  if (!event) {
    return null;
  }

  const { mapId } = event;

  const loaded = mapId !== null && activeMapId === mapId;

  return (
    <Selection icon={<FaCalendarDay />} label={event.title}>
      {loaded && (
        <LongPressTooltip label="Back to events" breakpoint="md">
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
      )}

      {mapId !== null && !loaded && (
        <LongPressTooltip label="Open in new tab" breakpoint="md">
          {({ props, label, labelClassName }) => (
            <Button
              variant="primary"
              href={mapUrl(mapId)}
              target="_blank"
              rel="noopener"
              {...props}
            >
              <FaExternalLinkAlt />{' '}
              <span className={labelClassName}>{label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {((mapId !== null && !loaded) || event.canWrite) && (
        <ResponsiveActions
          gap={1}
          align="start"
          toggleLabel={m?.general.actions}
        >
          {mapId !== null && !loaded && (
            <Action
              icon={<FaCloudDownloadAlt />}
              label="Load here"
              requiresOnline
              onClick={async () => {
                const merge = await askLoadMerge();

                if (merge !== null) {
                  dispatch(eventsOpen({ id: event.id, mapId, merge }));
                }
              }}
              showFrom="never"
            />
          )}

          {event.canWrite && mapId !== null && !loaded && <ActionDivider />}

          {event.canWrite && (
            <Action
              icon={<FaEdit />}
              label={m?.general.modify}
              showLabelFrom="sm"
              requiresOnline
              onClick={() =>
                dispatch(setActiveModal({ type: 'event-form', id: event.id }))
              }
              showFrom="lg"
            />
          )}

          {event.canWrite && (
            <Action
              icon={<FaTrash />}
              label={m?.general.delete}
              variant="danger"
              requiresOnline
              onClick={async () => {
                if (
                  await confirm({
                    title: 'Delete event',
                    message: `Delete event "${event.title}"? Its linked map stays.`,
                    confirmLabel: m?.general.delete,
                    confirmStyle: 'danger',
                  })
                ) {
                  dispatch(eventsDelete(event.id));
                }
              }}
              showFrom="lg"
            />
          )}
        </ResponsiveActions>
      )}
    </Selection>
  );
}
