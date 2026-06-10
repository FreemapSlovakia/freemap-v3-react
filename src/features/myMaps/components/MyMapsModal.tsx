import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { type ReactElement, useCallback, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaRegMap } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { MapMeta } from '../model/actions.js';
import { MyMapsModalForm } from './MyMapsModalForm.js';
import { MyMapsModalList } from './MyMapsModalList.js';

type Props = { show: boolean };

export default function MyMapsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const m = useMessages();

  const [editTarget, setEditTarget] = useState<MapMeta | 'new' | null>(null);

  useDocumentTitle(show ? m?.tools.myMaps : undefined);

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
          <FaRegMap /> {m?.tools.myMaps}
        </Modal.Title>
      </Modal.Header>

      {editTarget !== null ? (
        <MyMapsModalForm
          target={editTarget === 'new' ? undefined : editTarget}
          onDone={() => setEditTarget(null)}
        />
      ) : (
        <MyMapsModalList
          onAdd={() => setEditTarget('new')}
          onEdit={(map) => setEditTarget(map)}
        />
      )}
    </Modal>
  );
}
