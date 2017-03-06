import React from 'react';
import { connect } from 'react-redux';
import { Marker } from 'react-leaflet';

class SearchResults extends React.Component {
  render() {
    const highlightIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconAnchor: [ 10 , 36 ],
      iconUrl: require('fm3/images/marker-icon-grey.png'),
      iconRetinaUrl: require('fm3/images/marker-icon-2x-grey.png')
    });
    const resultIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconAnchor: [ 10 , 36 ],
      iconUrl: require('fm3/images/marker-icon-green.png'),
      iconRetinaUrl: require('fm3/images/marker-icon-2x-green.png')
    });

    const {highlightedResult, selectedResult} = this.props;
    return (
      <div>
        {highlightedResult &&
          <Marker
            position={L.latLng(highlightedResult.lat, highlightedResult.lon)}
            icon={highlightIcon}>
          </Marker>
          }
        {selectedResult &&
          <Marker
            icon={resultIcon}
            position={L.latLng(selectedResult.lat, selectedResult.lon)}>
          </Marker>
          }
      </div>
  );
  }
}

SearchResults.propTypes = {
  highlightedResult: React.PropTypes.any,
  selectedResult: React.PropTypes.any
};

export default connect(
  function (state) {
    return {
      highlightedResult: state.search.highlightedResult,
      selectedResult: state.search.selectedResult,
    };
  },
  function (dispatch) {
    return {
    };
  }
)(SearchResults);