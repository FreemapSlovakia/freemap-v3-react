import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { connect } from 'react-redux';
import { RootState } from 'fm3/storeCreator';
import { LatLng, marker } from 'leaflet';
import { Feature } from 'geojson';
import { createMarkerIcon } from './RichMarker';

type Props = ReturnType<typeof mapStateToProps>;

const ptl = (_: Feature, latLng: LatLng) => {
  return marker(latLng, { icon: createMarkerIcon() });
};

const SearchResults: React.FC<Props> = ({
  highlightedResult,
  selectedResult,
}) => {
  return (
    <>
      {highlightedResult && (
        <GeoJSON
          key={highlightedResult.id}
          data={highlightedResult.geojson}
          style={{ weight: 5 }}
          pointToLayer={ptl}
        />
      )}
      {selectedResult && (
        <GeoJSON
          key={selectedResult.id}
          data={selectedResult.geojson}
          style={{ weight: 5 }}
          pointToLayer={ptl}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  highlightedResult: state.search.highlightedResult,
  selectedResult: state.search.selectedResult,
});

export default connect(mapStateToProps)(SearchResults);
