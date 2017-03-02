import React from 'react';
import { toHtml } from '../poiTypes';
import { Marker, Tooltip } from 'react-leaflet';

export default class SearchResults extends React.Component {
  componentWillReceiveProps(newProps) {
    const highlightChanged = JSON.stringify(newProps.highlightedSearchSuggestion) != JSON.stringify(this.props.highlightedSearchSuggestion);
    const resultsChanged = JSON.stringify(newProps.searchResults) != JSON.stringify(this.props.searchResults);
    if (highlightChanged || resultsChanged) {
      this.refocusMapIfNeeded(newProps);
    }
  }

  refocusMapIfNeeded(newProps) {
    if (newProps.highlightedSearchSuggestion) {
      const mapBound = this.props.map.getBounds();
      const mapZoom = this.props.map.getZoom();
      const h = newProps.highlightedSearchSuggestion;
      const hLatLon = L.latLng(h.lat, h.lon);
      if (mapZoom < 13 || !mapBound.contains(hLatLon)) {
        this.props.doMapRefocus(h.lat, h.lon, 13);
      }
    } else if (newProps.searchResults.length) {
      const p = newProps.searchResults[0];
      this.props.doMapRefocus(p.lat, p.lon, 13);
    }
  }

  render() {
    const {searchResults, highlightedSearchSuggestion} = this.props;
    const suggestionIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconUrl: require('../images/marker-icon-grey.png'),
      iconRetinaUrl: require('../images/marker-icon-2x-grey.png')
    });
    return (
      <div>
        {searchResults.map(({ id, lat, lon, tags }) => {
          const __html = toHtml(tags);

          return (
            <Marker key={id} position={L.latLng(lat, lon)}>
              <Tooltip opacity={1.0}><span dangerouslySetInnerHTML={{ __html }}/></Tooltip>
            </Marker>
          );
        })}

        {highlightedSearchSuggestion &&
          <Marker 
            key={highlightedSearchSuggestion.id} 
            position={L.latLng(highlightedSearchSuggestion.lat, highlightedSearchSuggestion.lon)}
            icon={suggestionIcon}>
          </Marker>
          }
      </div>
    );
  }
}

SearchResults.propTypes = {
  highlightedSearchSuggestion: React.PropTypes.any,
  searchResults: React.PropTypes.array,
  doMapRefocus: React.PropTypes.func.isRequired,
  map: React.PropTypes.any
};