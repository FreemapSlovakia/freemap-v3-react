import {
  clearMapFeatures,
  selectFeature,
  setActiveModal,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAskLoadMerge } from '@features/myMaps/hooks/useAskLoadMerge.js';
import { mapsDisconnect } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
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
  type EventItem,
  eventsDelete,
  eventsOpen,
  eventsSetParticipation,
} from '../model/actions.js';
import { selectedEventId } from '../model/selectors.js';
import { loadEventsMessages } from '../translations/loadEventsMessages.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventDetails } from './EventDetails.js';

/** The linked map in a tab of its own: the full app, leaving this one's map be. */
function mapUrl(mapId: string): string {
  return `${location.origin}${location.pathname}#id=${encodeURIComponent(mapId)}`;
}

/** The selected event's panel. */
export default function EventSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const event = useAppSelector((state) => state.events.selected);

  // By the id, which stays while the next event loads.
  const shown = useAppSelector((state) => selectedEventId(state) !== null);

  return (
    <DockPanel
      item={event}
      show={shown}
      icon={<FaCalendarDay />}
      title={() => m?.selections.event}
      keepVisible={(event) => event.startPoint}
      onClose={() => dispatch(selectFeature(null))}
    >
      {(event) => (
        <>
          <EventActions event={event} />

          <EventDetails event={event} />
        </>
      )}
    </DockPanel>
  );
}

function EventActions({ event }: { event: EventItem }): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const em = useEventsMessages();

  const activeMapId = useAppSelector((state) => state.myMaps.activeMap?.id);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const online = useOnline();

  const askLoadMerge = useAskLoadMerge();

  const confirm = useConfirm();

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
    <ButtonToolbar className="gap-2 mb-3">
      {loaded && (
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(mapsDisconnect());

            // Takes the selection too, leaving the event markers.
            dispatch(clearMapFeatures());
          }}
        >
          <FaArrowLeft /> {em?.selection.backToEvents}
        </Button>
      )}

      <Button
        variant="outline-primary"
        active={event.myParticipation === 'interested'}
        disabled={!online}
        onClick={() => participate('interested')}
      >
        <FaStar /> {em?.selection.interested} · {event.interestedCount}
      </Button>

      <Button
        variant="outline-primary"
        active={event.myParticipation === 'going'}
        disabled={!online}
        onClick={() => participate('going')}
      >
        <FaCheck /> {em?.selection.going} · {event.goingCount}
      </Button>

      {mapId !== null && !loaded && (
        <Dropdown as={ButtonGroup}>
          <Button
            variant="primary"
            href={mapUrl(mapId)}
            target="_blank"
            rel="noopener"
            className="fm-no-ext"
            disabled={!online}
          >
            <FaExternalLinkAlt /> {em?.selection.openInNewTab}
          </Button>

          <Dropdown.Toggle split variant="primary" disabled={!online} />

          <FmDropdownMenu>
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
              <MenuLabel>{em?.selection.loadHere}</MenuLabel>
            </Dropdown.Item>
          </FmDropdownMenu>
        </Dropdown>
      )}

      {event.canWrite && (
        <>
          <Button
            variant="secondary"
            disabled={!online}
            onClick={() =>
              dispatch(setActiveModal({ type: 'event-form', id: event.id }))
            }
          >
            <FaEdit /> {m?.general.modify}
          </Button>

          <LongPressTooltip label={m?.general.delete}>
            {({ props }) => (
              <Button
                variant="danger"
                disabled={!online}
                onClick={async () => {
                  if (
                    await confirm({
                      title: em?.selection.deleteTitle,
                      message: em?.selection.deleteMessage({
                        title: event.title,
                      }),
                      confirmLabel: m?.general.delete,
                      confirmStyle: 'danger',
                    })
                  ) {
                    dispatch(eventsDelete(event.id));
                  }
                }}
                {...props}
              >
                <FaTrash />
              </Button>
            )}
          </LongPressTooltip>
        </>
      )}
    </ButtonToolbar>
  );
}
