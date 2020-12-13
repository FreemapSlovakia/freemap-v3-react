import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import { setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useSelector(
    (state: RootState) => state.main.selectingHomeLocation,
  );

  return !selectingHomeLocation ? null : (
    <Card className="fm-toolbar">
      <span>Zvoľte domovskú pozíciu</span>{' '}
      <Button
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
