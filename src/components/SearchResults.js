import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';

export default class SearchResults extends React.Component {
  componentWillReceiveProps(newProps) {
    const highlightChanged = JSON.stringify(newProps.highlightedSearchSuggestion) != JSON.stringify(this.props.highlightedSearchSuggestion);
    const resultsChanged = JSON.stringify(newProps.selectedSearchResult) != JSON.stringify(this.props.selectedSearchResult);
    if (highlightChanged || resultsChanged) {
      this.refocusMapIfNeeded(newProps);
    }
  }

  refocusMapIfNeeded(newProps) {
    if (newProps.highlightedSearchSuggestion) {
      const h = newProps.highlightedSearchSuggestion;
      const hLatLon = L.latLng(h.lat, h.lon);
      const mapBound = this.props.map.getBounds();
      const mapZoom = this.props.map.getZoom();
      if (mapZoom < 13 || !mapBound.contains(hLatLon)) {
        this.props.doMapRefocus(h.lat, h.lon, 13);
      }
    } else if (newProps.selectedSearchResult) {
      const s = newProps.selectedSearchResult;
      this.props.doMapRefocus(s.lat, s.lon, 13);
    }
  }

  render() {
    const suggestionIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconUrl: require('fm3/images/marker-icon-grey.png'),
      iconRetinaUrl: require('fm3/images/marker-icon-2x-grey.png')
    });
    const s = this.props.selectedSearchResult;
    const h = this.props.highlightedSearchSuggestion;
    let tooltipContent = '';
    if (s) {
      tooltipContent = `${s.tags.name} (${s.tags.type})` ;
    }
    return (
      <div>
        {s &&
          <Marker position={L.latLng(s.lat, s.lon)}>
            <Tooltip opacity={1.0}>
              <span dangerouslySetInnerHTML={{__html: tooltipContent}}/>
            </Tooltip>
          </Marker>
        }

        {h &&
          <Marker
            key={h.id}
            position={L.latLng(h.lat, h.lon)}
            icon={suggestionIcon}>
          </Marker>
          }
      </div>
  );
  }
}

SearchResults.propTypes = {
  highlightedSearchSuggestion: React.PropTypes.any,
  selectedSearchResult: React.PropTypes.any,
  doMapRefocus: React.PropTypes.func.isRequired,
  map: React.PropTypes.any
};
