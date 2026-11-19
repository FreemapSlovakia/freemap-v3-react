import {
  savePlace,
  setPickedPlaceName,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

export default function HomeLocationPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const position = useAppSelector(
    (state) => state.homeLocation.selectingHomeLocation,
  );

  const placeId = useAppSelector((state) => state.homeLocation.pickingPlace);

  const name = useAppSelector((state) => state.homeLocation.pickedPlaceName);

  const m = useMessages();

  const loggedIn = useAppSelector((state) => state.auth.user !== null);

  const online = useOnline();

  // Saved only to the account.
  const canSave = loggedIn && online;

  const confirm = () => {
    if (position && name.trim() && canSave) {
      dispatch(
        savePlace({
          // Negative until the account has it.
          id: placeId ?? -Date.now(),
          name: name.trim(),
          lat: position.lat,
          lon: position.lon,
        }),
      );
    }
  };

  return (
    <PickingMenu
      prompt={m?.main.pickPlacePrompt}
      onConfirm={confirm}
      confirmLabel={m?.general.save}
      confirmDisabled={!position || !name.trim() || !canSave}
      onCancel={() => dispatch(setSelectingHomeLocation(false))}
      onPlace={(at) => dispatch(setSelectingHomeLocation(at))}
      cancelKbd="Esc"
    >
      <Form
        className="d-flex"
        onSubmit={(e) => {
          e.preventDefault();

          confirm();
        }}
      >
        <Form.Control
          className="w-auto"
          placeholder={m?.main.placeName}
          value={name}
          maxLength={100}
          required
          onChange={(e) => dispatch(setPickedPlaceName(e.target.value))}
        />
      </Form>
    </PickingMenu>
  );
}
