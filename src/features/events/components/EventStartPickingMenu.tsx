import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { eventsConfirmPick, eventsSetPickingStart } from '../model/actions.js';

export default function EventStartPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const placed = useAppSelector((state) => state.events.pickPosition !== null);

  return (
    <PickingMenu
      prompt="Click the map where the event starts, or drag the marker"
      onConfirm={() => dispatch(eventsConfirmPick())}
      confirmDisabled={!placed}
      onCancel={() => dispatch(eventsSetPickingStart(false))}
      cancelKbd="Esc"
    />
  );
}
