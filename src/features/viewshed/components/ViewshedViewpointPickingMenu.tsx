import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { viewshedSetPickingViewpoint } from '../model/actions.js';
import { useViewshedMessages } from '../translations/useViewshedMessages.js';

export default function ViewshedViewpointPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useViewshedMessages();

  return (
    <PickingMenu
      prompt={m?.pickViewpointPrompt}
      onCancel={() => dispatch(viewshedSetPickingViewpoint(false))}
    />
  );
}
