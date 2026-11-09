import { makeBeamIcon } from '@shared/beamIcon.js';
import { PickMarker } from '@shared/components/PickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import type { Marker as LeafletMarker } from 'leaflet';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { Marker } from 'react-leaflet';
import { gallerySetPickingPosition } from '../model/actions.js';

// The 90° sector the gallery draws a photo's direction with.
const viewIcon = makeBeamIcon({
  halfAngle: 45,
  size: 240,
  radius: 110,
  color: '#3388ff',
  innerStop: 0.1,
  innerOpacity: 0.6,
  gradientId: 'fm-gallery-picking-beam',
});

export function GalleryPositionPicking(): ReactElement {
  const position = useAppSelector((state) => state.gallery.pickingPosition);

  const azimuth = useAppSelector((state) => state.gallery.pickingAzimuth);

  const beamRef = useRef<LeafletMarker | null>(null);

  // The store learns the pin's place only on drop; the beam follows the drag.
  const [dragged, setDragged] = useState<LatLon | null>(null);

  const apex = dragged ?? position;

  const shown = apex !== null && azimuth !== null;

  // Turned by the element's transform; the icon is drawn pointing north.
  useEffect(() => {
    const wrapper = beamRef.current?.getElement()?.firstElementChild;

    if (shown && wrapper instanceof HTMLElement) {
      wrapper.style.transform = `rotate(${azimuth.toFixed(1)}deg)`;
    }
  }, [azimuth, shown]);

  return (
    <>
      {shown && (
        <Marker
          ref={beamRef}
          position={{ lat: apex.lat, lng: apex.lon }}
          icon={viewIcon}
          interactive={false}
          keyboard={false}
          pane="fm-active-overlay"
          zIndexOffset={-1000}
        />
      )}

      <PickMarker
        position={position}
        pickAction={gallerySetPickingPosition}
        faIcon={<FaCamera />}
        onDrag={setDragged}
      />
    </>
  );
}
