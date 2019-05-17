import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Polyline, Tooltip } from 'react-leaflet';
import RichMarker from 'fm3/components/RichMarker';

function TrackingResult({ tracks }) {
  return tracks.map(track => (
    <Fragment key={track.id}>
      <Polyline
        positions={track.trackPoints}
        weight={4}
        color="#7239a8"
      />
      {track.trackPoints.length && (
        <RichMarker
          position={track.trackPoints[track.trackPoints.length - 1]}
          color="#7239a8"
        >
          {track.label && (
            <Tooltip direction="top" offset={[0, -36]} permanent>
              {track.label}
            </Tooltip>
          )}
        </RichMarker>
      )}
    </Fragment>
  ));
}

TrackingResult.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    trackPoints: PropTypes.arrayOf(PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired).isRequired,
    // TODO other
  }).isRequired).isRequired,
};

export default connect((state) => {
  const tdMap = new Map(state.tracking.trackedDevices.map(td => [td.id, td]));
  return {
    tracks: state.tracking.tracks.map(track => ({ ...track, ...(tdMap.get(track.id) || {}) })),
  };
})(TrackingResult);
