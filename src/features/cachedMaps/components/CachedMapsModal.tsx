import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { CachedMapsList } from './CachedMapsList.js';
import { CacheTilesForm } from './CacheTilesForm.js';

type Props = { show: boolean };

export default CachedMapsModal;

export function CachedMapsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const view = useAppSelector((state) => state.cachedMaps.view);

  const selectingArea = useAppSelector(
    (state) => state.mapArea.selecting !== null,
  );

  return (
    <Modal
      show={show}
      onHide={() => dispatch(setActiveModal(null))}
      size="lg"
      contentClassName="bg-body-tertiary"
      className={selectingArea ? 'd-none' : undefined}
      backdropClassName={selectingArea ? 'd-none' : undefined}
      enforceFocus={!selectingArea}
    >
      {view === 'list' ? <CachedMapsList /> : <CacheTilesForm />}
    </Modal>
  );
}
