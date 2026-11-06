import { setActiveModal } from '@app/store/actions.js';
import { Modal } from '@shared/components/Modal.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { BrowseCacheSettings } from './BrowseCacheSettings.js';

type Props = { show: boolean };

export default function BrowseCacheModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  return (
    <Modal
      show={show}
      onHide={() => dispatch(setActiveModal(null))}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <BrowseCacheSettings />
    </Modal>
  );
}
