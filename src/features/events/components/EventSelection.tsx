import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAskLoadMerge } from '@features/myMaps/hooks/useAskLoadMerge.js';
import { mapsDisconnect } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaArrowLeft,
  FaCalendarDay,
  FaCheck,
  FaCloudDownloadAlt,
  FaEdit,
  FaExternalLinkAlt,
  FaStar,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  eventsDelete,
  eventsOpen,
  eventsSetParticipation,
} from '../model/actions.js';
import { loadEventsMessages } from '../translations/loadEventsMessages.js';

/** The linked map in a tab of its own: the full app, leaving this one's map be. */
function mapUrl(mapId: string): string {
  return `${location.origin}${location.pathname}#id=${encodeURIComponent(mapId)}`;
}

export default function EventSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const event = useAppSelector((state) => state.events.selected);

  const activeMapId = useAppSelector((state) => state.myMaps.activeMap?.id);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const askLoadMerge = useAskLoadMerge();

  const confirm = useConfirm();

  if (!event) {
    return null;
  }

  const { mapId } = event;

  const loaded = mapId !== null && activeMapId === mapId;

  // Pressing the active one withdraws it.
  const participate = (status: 'interested' | 'going') => {
    if (!loggedIn) {
      dispatch(
        toastsAdd({
          id: 'events.loginToParticipate',
          messageKey: 'loginToParticipate',
          messageLoader: loadEventsMessages,
          style: 'warning',
          actions: [
            {
              action: setActiveModal({ type: 'login' }),
              nameKey: 'mainMenu.logIn',
              variant: 'primary',
            },
          ],
        }),
      );

      return;
    }

    dispatch(
      eventsSetParticipation({
        id: event.id,
        status: event.myParticipation === status ? null : status,
      }),
    );
  };

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

      <ResponsiveActions gap={1} align="start" toggleLabel={m?.general.actions}>
        <Action
          icon={
            <>
              <FaStar /> {event.interestedCount}
            </>
          }
          label="Interested"
          variant="outline-primary"
          active={event.myParticipation === 'interested'}
          showLabelFrom="md"
          requiresOnline
          onClick={() => participate('interested')}
        />

        <Action
          icon={
            <>
              <FaCheck /> {event.goingCount}
            </>
          }
          label="Going"
          variant="outline-primary"
          active={event.myParticipation === 'going'}
          showLabelFrom="md"
          requiresOnline
          onClick={() => participate('going')}
        />

        {((mapId !== null && !loaded) || event.canWrite) && <ActionDivider />}

        {mapId !== null && !loaded && (
          <Action
            icon={<FaExternalLinkAlt />}
            label="Open in new tab"
            variant="primary"
            href={mapUrl(mapId)}
            target="_blank"
            rel="noopener"
            className="fm-no-ext"
            showLabelFrom="md"
            requiresOnline
            menu={
              <Dropdown.Item
                as="button"
                onClick={async () => {
                  const merge = await askLoadMerge();

                  if (merge !== null) {
                    dispatch(eventsOpen({ id: event.id, mapId, merge }));
                  }
                }}
              >
                <FaCloudDownloadAlt />
                <MenuLabel>Load here</MenuLabel>
              </Dropdown.Item>
            }
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
    </Selection>
  );
}
