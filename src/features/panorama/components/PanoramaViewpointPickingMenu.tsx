import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { panoramaSetPickingViewpoint } from '../model/actions.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

export default function PanoramaViewpointPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = usePanoramaMessages();

  return (
    <PickingMenu
      prompt={m?.pickViewpointPrompt}
      onCancel={() => dispatch(panoramaSetPickingViewpoint(false))}
    />
  );
}
