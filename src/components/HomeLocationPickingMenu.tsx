import type { ReactElement } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';

export default HomeLocationPickingMenu;

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useAppSelector(
    (state) => state.main.selectingHomeLocation,
  );

  const m = useMessages();

  return (
    <div>
      <Card className="fm-toolbar mt-2">
        <div className="m-1">Zvoľte domovskú pozíciu</div>

        <Button
          className="ms-1"
          variant="primary"
          onClick={() => dispatch(saveHomeLocation())}
          disabled={!selectingHomeLocation}
        >
          <FaCheck />
          <span className="d-none d-sm-inline"> {m?.general.save}</span>
        </Button>

        <Button
          className="ms-1"
          variant="dark"
          onClick={() => dispatch(setSelectingHomeLocation(false))}
        >
          <FaTimes />
          <span className="d-none d-sm-inline"> {m?.general.cancel}</span>
        </Button>
      </Card>
    </div>
  );
}
