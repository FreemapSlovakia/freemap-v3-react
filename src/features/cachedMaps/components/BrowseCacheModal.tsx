import { setActiveModal } from '@app/store/actions.js';
import { askBeforeClosing } from '@shared/modalCloseGuard.js';
import type { ReactElement } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { BrowseCacheSettings } from './BrowseCacheSettings.js';

type Props = { show: boolean };

export default function BrowseCacheModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  return (
    <Modal
      show={show}
      onHide={() => askBeforeClosing(() => dispatch(setActiveModal(null)))}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <BrowseCacheSettings />
    </Modal>
  );
}
