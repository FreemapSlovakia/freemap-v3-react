import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { mapAreaSelectCancel, mapAreaSelectConfirm } from '../model/actions.js';
import { useMapAreaMessages } from '../translations/useMapAreaMessages.js';

export default function MapAreaSelectionMenu(): ReactElement {
  const ma = useMapAreaMessages();

  const dispatch = useDispatch();

  return (
    <PickingMenu
      prompt={ma?.pickHint}
      onConfirm={() => dispatch(mapAreaSelectConfirm())}
      onCancel={() => dispatch(mapAreaSelectCancel())}
      cancelKbd="Esc"
    />
  );
}
