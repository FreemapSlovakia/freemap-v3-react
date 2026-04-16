import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { CachedMapsList } from './CachedMapsList.js';
import { CacheTilesForm } from './CacheTilesForm.js';

type Props = { show: boolean };

export default OfflineMapsModal;

export function OfflineMapsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const view = useAppSelector((state) => state.cachedMaps.view);

  return (
    <Modal show={show} onHide={() => dispatch(setActiveModal(null))} size="lg">
      {view === 'list' ? <CachedMapsList /> : <CacheTilesForm />}
    </Modal>
  );
}
