import React, { useEffect, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { galleryRequestImages } from 'fm3/actions/galleryActions';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { LatLon } from 'fm3/types/common';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const GalleryPicker: React.FC<Props> = ({ zoom, onImageRequest }) => {
  const [latLon, setLatLon] = useState<LatLon>();

  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      onImageRequest(lat, lon);
    },
    [onImageRequest],
  );

  const handleMouseMove = useCallback(
    (lat: number, lon: number, originalEvent: MouseEvent) => {
      if (
        originalEvent.target &&
        (originalEvent.target as HTMLElement).classList.contains(
          'leaflet-container',
        )
      ) {
        setLatLon({ lat, lon });
      } else {
        setLatLon(undefined);
      }
    },
    [],
  );

  const handleMouseOut = useCallback(() => {
    setLatLon(undefined);
  }, []);

  useEffect(() => {
    mapEventEmitter.on('mapClick', handleMapClick);
    mapEventEmitter.on('mouseMove', handleMouseMove);
    mapEventEmitter.on('mouseOut', handleMouseOut);
    return () => {
      mapEventEmitter.removeListener('mapClick', handleMapClick);
      mapEventEmitter.removeListener('mouseMove', handleMouseMove);
      mapEventEmitter.removeListener('mouseOut', handleMouseOut);
    };
  }, [handleMapClick, handleMouseMove, handleMouseOut]);

  return latLon ? (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={(5000 / 2 ** zoom) * 1000}
      stroke={false}
    />
  ) : null;
};

const mapStateToProps = (state: RootState) => ({
  zoom: state.map.zoom,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onImageRequest(lat: number, lon: number) {
    dispatch(galleryRequestImages({ lat, lon }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GalleryPicker);
