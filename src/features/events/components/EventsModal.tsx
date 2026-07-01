import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { EventItem } from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventsModalForm } from './EventsModalForm.js';
import { EventsModalList } from './EventsModalList.js';

type Props = { show: boolean };

/** `list` shows the browser; an object opens the create/edit form. */
type View = 'list' | { editing?: EventItem; mapId?: string };

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

  const [view, setView] = useState<View>(
    createTarget ? { mapId: createTarget.mapId } : 'list',
  );

  // The modal instance can outlive a close (fade-out), so reset the view on each
  // open to match how it was opened.
  useEffect(() => {
    if (show) {
      setView(createTarget ? { mapId: createTarget.mapId } : 'list');
    }
  }, [show, createTarget]);

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
          onCreate={() => setView({})}
          onEdit={(ev) => setView({ editing: ev })}
        />
      ) : (
        <EventsModalForm
          editing={view.editing}
          initialMapId={view.mapId}
          onDone={() => setView('list')}
        />
      )}
    </Modal>
  );
}
