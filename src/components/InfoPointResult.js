import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import { infoPointChangePosition } from 'fm3/actions/infoPointActions';
import RichMarker from 'fm3/components/RichMarker';
import PropTypes from 'prop-types';

class InfoPointResult extends React.Component {
  static propTypes = {
    lat: PropTypes.number,
    lon: PropTypes.number,
    label: PropTypes.string,
    inEditMode: PropTypes.bool.isRequired,
    onInfoPointPositionChange: PropTypes.func.isRequired,
  };

  handleDragEnd = (e) => {
    const coords = e.target.getLatLng();
    this.props.onInfoPointPositionChange(coords.lat, coords.lng);
  }

  handlePointClick = () => {
    // just to prevent click propagation to map
  }

  render() {
    const { lat, lon, label, inEditMode } = this.props;

    return lat && (
      <RichMarker
        faIcon="info"
        faIconLeftPadding="2px"
        draggable={inEditMode}
        onDragend={this.handleDragEnd}
        position={L.latLng(lat, lon)}
        onClick={this.handlePointClick}
      >
        {label &&
          <Tooltip
            className="compact"
            offset={new L.Point(9, -25)}
            direction="right"
            permanent
          >
            <span>
              {label}
            </span>
          </Tooltip>
        }
      </RichMarker>
    );
  }
}

export default connect(
  state => ({
    lat: state.infoPoint.lat,
    lon: state.infoPoint.lon,
    label: state.infoPoint.label,
    inEditMode: state.main.tool === 'info-point',
  }),
  dispatch => ({
    onInfoPointPositionChange(lat, lon) {
      dispatch(infoPointChangePosition(lat, lon));
    },
  }),
)(InfoPointResult);
