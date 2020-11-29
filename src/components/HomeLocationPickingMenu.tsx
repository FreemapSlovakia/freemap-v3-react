import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import { setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useSelector(
    (state: RootState) => state.main.selectingHomeLocation,
  );

  return !selectingHomeLocation ? null : (
    <Panel className="fm-toolbar">
      <span>Zvoľte domovskú pozíciu</span>{' '}
      <Button
        onClick={() => {
          dispatch(setSelectingHomeLocation(false));
        }}
      >
        <FontAwesomeIcon icon="times" />
        <span className="hidden-xs"> Zrušiť</span>
      </Button>
    </Panel>
  );
}
