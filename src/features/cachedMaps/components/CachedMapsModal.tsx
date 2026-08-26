import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { CachedMapsList } from './CachedMapsList.js';
import { CacheTilesForm } from './CacheTilesForm.js';

type Props = { show: boolean };

export default function CachedMapsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const view = useAppSelector((state) => state.cachedMaps.view);

  const editing = useAppSelector((state) =>
    state.cachedMaps.editId === null
      ? undefined
      : state.map.cachedMaps.find((m) => m.type === state.cachedMaps.editId),
  );

  const selectingArea = useAppSelector(
    (state) => state.mapArea.selecting !== null,
  );

  // a map deleted while its edit form was open falls back to the list
  const list = view === 'list' || (view === 'edit' && !editing);

  return (
    <Modal
      scrollable
      show={show}
      onHide={() => dispatch(setActiveModal(null))}
      // Only the list needs the width; the form is a single column of fields.
      size={list ? 'lg' : undefined}
      contentClassName="bg-body-tertiary"
      className={selectingArea ? 'd-none' : undefined}
      backdropClassName={selectingArea ? 'd-none' : undefined}
      // The icon picker's popover portals outside the modal; the focus trap
      // would take focus away from its search field.
      enforceFocus={false}
    >
      {list ? <CachedMapsList /> : <CacheTilesForm editing={editing} />}
    </Modal>
  );
}
