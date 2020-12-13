import { setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useDispatch, useSelector } from 'react-redux';

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useSelector(
    (state: RootState) => state.main.selectingHomeLocation,
  );

  return !selectingHomeLocation ? null : (
    <Card className="fm-toolbar">
      <span>Zvoľte domovskú pozíciu</span>{' '}
      <Button
        variant="dark"
        onClick={() => {
          dispatch(setSelectingHomeLocation(false));
        }}
      >
        <FontAwesomeIcon icon="times" />
        <span className="d-none d-sm-inline"> Zrušiť</span>
      </Button>
    </Card>
  );
}
