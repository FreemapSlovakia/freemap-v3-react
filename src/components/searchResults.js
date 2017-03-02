import React from 'react';
import { toHtml } from '../poiTypes';
import { Marker, Popup } from 'react-leaflet';

export default class SearchResults extends React.Component {
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
              {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
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
  searchResults: React.PropTypes.array
};