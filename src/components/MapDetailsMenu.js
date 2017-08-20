import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';

import { setTool } from 'fm3/actions/mainActions';
import { mapDetailsSetSubtool, mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

class MapDetailsMenu extends React.Component {
  componentWillMount() {
    mapEventEmitter.on('mapClick', this.setUserSelectedPosition);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.setUserSelectedPosition);
  }

  setUserSelectedPosition = (lat, lon) => {
    if (this.props.subtool !== null) {
      this.props.onSetUserSelectedPosition(lat, lon);
    }
  }

  render() {
    const { subtool, onSetSubtool, onCancel } = this.props;
    return (
      <Navbar.Form pullLeft>
        <Button onClick={() => onSetSubtool('track-info')} active={subtool === 'track-info'} title="Info o ceste">
          <FontAwesomeIcon icon="road" />Info o ceste
        </Button>
        {' '}
        <Button onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</Button>
      </Navbar.Form>
    );
  }
}

MapDetailsMenu.propTypes = {
  subtool: PropTypes.oneOf(['track-info']),
  onSetSubtool: PropTypes.func.isRequired,
  onSetUserSelectedPosition: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    subtool: state.mapDetails.subtool,
  }),
  dispatch => ({
    onSetSubtool(subtool) {
      dispatch(mapDetailsSetSubtool(subtool));
    },
    onSetUserSelectedPosition(lat, lon) {
      dispatch(mapDetailsSetUserSelectedPosition(lat, lon));
    },
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(MapDetailsMenu);
