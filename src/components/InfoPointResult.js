import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import {
  infoPointChangePosition,
  infoPointSetActiveIndex,
} from 'fm3/actions/infoPointActions';
import RichMarker from 'fm3/components/RichMarker';
import PropTypes from 'prop-types';

class InfoPointResult extends React.Component {
  static propTypes = {
    points: PropTypes.arrayOf(
      PropTypes.shape({
        lat: PropTypes.number,
        lon: PropTypes.number,
        label: PropTypes.string,
      }).isRequired,
    ).isRequired,
    onInfoPointPositionChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    change: PropTypes.number.isRequired,
    activeIndex: PropTypes.number,
  };

  handleDragEnd = e => {
    const coords = e.target.getLatLng();
    this.props.onInfoPointPositionChange(coords.lat, coords.lng);
  };

  render() {
    const { points, change, onSelect, activeIndex } = this.props;

    return points.map(({ lat, lon, label }, i) => (
      <RichMarker
        key={`${change}-${i}`}
        faIcon="info"
        faIconLeftPadding="2px"
        onDragend={this.handleDragEnd}
        position={L.latLng(lat, lon)}
        onClick={() => onSelect(i)}
        color={activeIndex === i ? '#65b2ff' : undefined}
        draggable={activeIndex === i}
      >
        {label && (
          <Tooltip
            className="compact"
            offset={new L.Point(11, -25)}
            direction="right"
            permanent
          >
            <span>{label}</span>
          </Tooltip>
        )}
      </RichMarker>
    ));
  }
}

const mapStateToProps = state => ({
  points: state.infoPoint.points,
  change: state.infoPoint.change,
  activeIndex: state.infoPoint.activeIndex,
});

const mapDispatchToProps = dispatch => ({
  onInfoPointPositionChange(lat, lon) {
    dispatch(infoPointChangePosition({ lat, lon }));
  },
  onSelect(index) {
    dispatch(infoPointSetActiveIndex(index));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(InfoPointResult);
