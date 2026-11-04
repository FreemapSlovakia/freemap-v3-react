import type { RootState } from '@app/store/store.js';
import { mapPickSetPosition } from '@features/mapPick/model/actions.js';
import { useClearMapPickOnLeave } from '@features/mapPick/useClearMapPickOnLeave.js';
import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { placeToposcopeCenter } from '../centerPoint.js';
import { toposcopeSetPickingCenter } from '../model/actions.js';
import { useToposcopeMessages } from '../translations/useToposcopeMessages.js';

/**
 * The centre is an ordinary drawn point — created on confirm when there is
 * none, moved when there is — so labelling, styling and deleting it happen in
 * the drawing tool afterwards.
 */
export default function ToposcopeCenterPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const position = useAppSelector((state) => state.mapPick.position);

  useClearMapPickOnLeave();

  const m = useToposcopeMessages();

  return (
    <PickingMenu
      prompt={m?.pickCenterPrompt}
      onConfirm={() => {
        if (position) {
          dispatch(placeToposcopeCenter(store.getState(), position));

          dispatch(toposcopeSetPickingCenter(false));
        }
      }}
      confirmDisabled={!position}
      onCancel={() => dispatch(toposcopeSetPickingCenter(false))}
      cancelKbd="Esc"
      onPlace={(at) => dispatch(mapPickSetPosition(at))}
    />
  );
}
