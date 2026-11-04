import { mapPickSetPosition } from '@features/mapPick/model/actions.js';
import { useClearMapPickOnLeave } from '@features/mapPick/useClearMapPickOnLeave.js';
import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { viewshedPick, viewshedSetPickingViewpoint } from '../model/actions.js';
import { useViewshedMessages } from '../translations/useViewshedMessages.js';

export default function ViewshedViewpointPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const position = useAppSelector((state) => state.mapPick.position);

  useClearMapPickOnLeave();

  const m = useViewshedMessages();

  return (
    <PickingMenu
      prompt={m?.pickViewpointPrompt}
      // `viewshedPick` ends the picking mode itself.
      onConfirm={() => position && dispatch(viewshedPick(position))}
      confirmDisabled={!position}
      onCancel={() => dispatch(viewshedSetPickingViewpoint(false))}
      cancelKbd="Esc"
      onPlace={(at) => dispatch(mapPickSetPosition(at))}
    />
  );
}
