import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export default HomeLocationPickingMenu;

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useAppSelector(
    (state) => state.main.selectingHomeLocation,
  );

  const m = useMessages();

  return (
    <div>
      <Card className="fm-toolbar mx-2 mt-2">
        <div className="m-1">Zvoľte domovskú pozíciu</div>

        <Button
          className="ml-1"
          variant="primary"
          onClick={() => dispatch(saveHomeLocation())}
          disabled={!selectingHomeLocation}
        >
          <FaCheck />
          <span className="d-none d-sm-inline"> {m?.general.save}</span>
        </Button>

        <Button
          className="ml-1"
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
