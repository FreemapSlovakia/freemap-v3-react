import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { panoramaSetPicking } from '../model/actions.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

export default function PanoramaPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = usePanoramaMessages();

  const picking = useAppSelector((state) => state.panorama.picking);

  return (
    <PickingMenu
      prompt={
        picking === 'target' ? m?.pickTargetPrompt : m?.pickViewpointPrompt
      }
      onCancel={() => dispatch(panoramaSetPicking(null))}
      cancelKbd="Esc"
    />
  );
}
