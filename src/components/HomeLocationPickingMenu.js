import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setSelectingHomeLocation } from 'fm3/actions/mainActions';

function HomeLocationPickingMenu({ selectingHomeLocation, onCancel }) {
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
}

HomeLocationPickingMenu.propTypes = {
  selectingHomeLocation: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    selectingHomeLocation: state.main.selectingHomeLocation,
  }),
  dispatch => ({
    onCancel() {
      dispatch(setSelectingHomeLocation(false));
    },
  }),
)(HomeLocationPickingMenu);
