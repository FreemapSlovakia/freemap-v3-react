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

const SearchResults: React.FC<Props> = ({ selectedResult }) => {
  return (
    <>
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
  selectedResult: state.search.selectedResult,
});

export default connect(mapStateToProps)(SearchResults);
