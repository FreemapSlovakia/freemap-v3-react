import { setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useSelector(
    (state) => state.main.selectingHomeLocation,
  );

  return !selectingHomeLocation ? null : (
    <Card className="fm-toolbar mx-2 mt-2">
      <div className="m-1">Zvoľte domovskú pozíciu</div>
      <Button
        className="ml-1"
        variant="dark"
        onClick={() => {
          dispatch(setSelectingHomeLocation(false));
        }}
      >
        <FaTimes />
        <span className="d-none d-sm-inline"> Zrušiť</span>
      </Button>
    </Card>
  );
}
