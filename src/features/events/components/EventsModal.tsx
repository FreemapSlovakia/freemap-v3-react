import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { eventsSetView } from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventsModalForm } from './EventsModalForm.js';
import { EventsModalList } from './EventsModalList.js';

type Props = { show: boolean };

export default function EventsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  // Opened via "Publish as event" jumps straight to the create form, prefilled
  // with the source map.
  const createTarget = useAppSelector((state) =>
    state.main.activeModal?.type === 'events'
      ? state.main.activeModal.create
      : undefined,
  );

  const view = useAppSelector((state) => state.events.view);

  // The modal instance can outlive a close (fade-out), so reset the view on each
  // open to match how it was opened.
  useEffect(() => {
    if (show) {
      dispatch(
        eventsSetView(createTarget ? { mapId: createTarget.mapId } : 'list'),
      );
    }
  }, [show, createTarget, dispatch]);

  useDocumentTitle(show ? em?.title : undefined);

  return (
    <Modal
      scrollable
      show={show}
      onHide={close}
      size="lg"
      contentClassName="bg-body-tertiary"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalendarAlt /> {em?.title}
        </Modal.Title>
      </Modal.Header>

      {view === 'list' ? (
        <EventsModalList
          onCreate={() => dispatch(eventsSetView({}))}
          onEdit={(ev) => dispatch(eventsSetView({ editing: ev }))}
        />
      ) : (
        <EventsModalForm
          editing={view.editing}
          initialMapId={view.mapId}
          onCancel={() => dispatch(eventsSetView('list'))}
        />
      )}
    </Modal>
  );
}
