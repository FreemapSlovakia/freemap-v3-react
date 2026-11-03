import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { eventsSetPickingStart } from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

export default function EventStartPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  return (
    <PickingMenu
      prompt={em?.pickStartPrompt}
      onCancel={() => dispatch(eventsSetPickingStart(false))}
      cancelKbd="Esc"
    />
  );
}
