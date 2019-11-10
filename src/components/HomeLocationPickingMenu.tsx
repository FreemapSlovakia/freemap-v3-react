import React from 'react';
import { connect } from 'react-redux';
import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import { setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const HomeLocationPickingMenuInt: React.FC<Props> = ({
  selectingHomeLocation,
  onCancel,
}) => {
  if (!selectingHomeLocation) {
    return null;
  }

  return (
    <Panel className="fm-toolbar">
      <span>Zvoľte domovskú pozíciu</span>{' '}
      <Button onClick={onCancel}>
        <FontAwesomeIcon icon="times" />
        <span className="hidden-xs"> Zrušiť</span>
      </Button>
    </Panel>
  );
};

const mapStateToProps = (state: RootState) => ({
  selectingHomeLocation: state.main.selectingHomeLocation,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onCancel() {
    dispatch(setSelectingHomeLocation(false));
  },
});

export const HomeLocationPickingMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeLocationPickingMenuInt);
