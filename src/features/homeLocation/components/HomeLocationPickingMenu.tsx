import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

export default function HomeLocationPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const selectingHomeLocation = useAppSelector(
    (state) => state.homeLocation.selectingHomeLocation,
  );

  const m = useMessages();

  return (
    <PickingMenu
      prompt={m?.main.pickHomeLocationPrompt}
      onConfirm={() => {
        if (selectingHomeLocation) {
          dispatch(saveHomeLocation(selectingHomeLocation));
        }
      }}
      confirmLabel={m?.general.save}
      confirmDisabled={!selectingHomeLocation}
      onCancel={() => dispatch(setSelectingHomeLocation(false))}
      onPlace={(position) => dispatch(setSelectingHomeLocation(position))}
      cancelKbd="Esc"
    />
  );
}
