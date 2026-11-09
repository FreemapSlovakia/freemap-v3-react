import {
  clearMapFeatures,
  selectFeature,
  setActiveModal,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { useAskLoadMerge } from '@features/myMaps/hooks/useAskLoadMerge.js';
import { mapsDisconnect } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { UserChip } from '@shared/components/UserChip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import {
  Alert,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Dropdown,
} from 'react-bootstrap';
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
import { EventsListTraitSchema } from '../model/listSort.js';
import { selectedEventId } from '../model/selectors.js';
import { loadEventsMessages } from '../translations/loadEventsMessages.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventDetails } from './EventDetails.js';
import { EventLine } from './EventLine.js';
import { EventIndicators } from './EventTraits.js';

/** The linked map in a tab of its own: the full app, leaving this one's map be. */
function mapUrl(mapId: string): string {
  return `${location.origin}${location.pathname}#id=${encodeURIComponent(mapId)}`;
}

// A minimized panel has the width for all an event states.
const ALL_TRAITS = new Set(EventsListTraitSchema.options);

/** The selected event's panel. */
export default function EventSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const event = useAppSelector((state) => state.events.selected);

  // By the id, which stays while the next event loads.
  const shown = useAppSelector((state) => selectedEventId(state) !== null);

  return (
    <DockPanel
      item={event}
      show={shown}
      icon={<FaCalendarDay />}
      label={<Text k="selections.event" />}
      title={(event) => event.title}
      summary={(event) => <EventLine event={event} traits={ALL_TRAITS} />}
      marks={(event) => <EventIndicators event={event} traits={ALL_TRAITS} />}
      keepVisible={(event) => event.startPoint}
      onClose={() => dispatch(selectFeature(null))}
    >
      {(event) => (
        <>
          <EventActions event={event} />

          <EventDetails
            event={event}
            mapActions={<EventMapActions event={event} />}
          />

          <EventParticipants event={event} />
        </>
      )}
    </DockPanel>
  );
}

/** Who is going and who is interested, each under the label of its button. */
function EventParticipants({
  event,
}: {
  event: EventItem;
}): ReactElement | null {
  const em = useEventsMessages();

  const participants = useAppSelector((state) => state.events.participants);

  if (!em) {
    return null;
  }

  const items =
    participants?.eventId === event.id ? participants.items : undefined;

  // Counted as the buttons count, while a refreshed list is on its way.
  const groups = [
    {
      status: 'going',
      icon: <FaCheck />,
      label: em.selection.going,
      count: event.goingCount,
    },
    {
      status: 'interested',
      icon: <FaStar />,
      label: em.selection.interested,
      count: event.interestedCount,
    },
  ] as const;

  return (
    <>
      {groups.map(({ status, icon, label, count }) => {
        const users = items?.filter((p) => p.status === status) ?? [];

        return (
          users.length > 0 && (
            <div key={status} className="mt-3">
              <div className="d-flex align-items-center gap-1 fw-semibold mb-1">
                {icon} {label} · {count}
              </div>

              <div className="d-flex flex-wrap column-gap-3 row-gap-1">
                {users.map(({ user }) => (
                  <span
                    key={user.id}
                    className="d-inline-flex align-items-center"
                  >
                    <UserChip user={user} />
                  </span>
                ))}
              </div>
            </div>
          )
        );
      })}
    </>
  );
}

/** Opening the linked map, beside its name; none while it is loaded here. */
function EventMapActions({ event }: { event: EventItem }): ReactElement | null {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const activeMapId = useAppSelector((state) => state.myMaps.activeMap?.id);

  const online = useOnline();

  const askLoadMerge = useAskLoadMerge();

  const { mapId } = event;

  if (mapId === null || activeMapId === mapId) {
    return null;
  }

  return (
    <Dropdown as={ButtonGroup} size="sm">
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
  );
}

function EventActions({ event }: { event: EventItem }): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const em = useEventsMessages();

  const activeMapId = useAppSelector((state) => state.myMaps.activeMap?.id);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const online = useOnline();

  const confirm = useConfirm();

  const loaded = event.mapId !== null && activeMapId === event.mapId;

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
    <>
      <ButtonToolbar className={event.imported ? 'gap-2 mb-2' : 'gap-2 mb-3'}>
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

      {/* Its organizer is the calendar's account: whoever comes, nobody here
        hears of it. */}
      {event.imported && (
        <Alert variant="warning" className="small py-2 px-3 mb-3">
          {em?.card.importedNote({ source: <em>{event.user.name}</em> })}
        </Alert>
      )}
    </>
  );
}
