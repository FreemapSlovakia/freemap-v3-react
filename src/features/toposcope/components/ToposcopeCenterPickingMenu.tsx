import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { toposcopeSetPickingCenter } from '../model/actions.js';
import { useToposcopeMessages } from '../translations/useToposcopeMessages.js';

export default function ToposcopeCenterPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useToposcopeMessages();

  return (
    <PickingMenu
      prompt={m?.pickCenterPrompt}
      onCancel={() => dispatch(toposcopeSetPickingCenter(false))}
    />
  );
}
