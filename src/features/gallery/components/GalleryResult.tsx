import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaCamera } from 'react-icons/fa';
import './gallery.css';

/** Where the photo in the viewer was taken, while it is shown on the map. */
export function GalleryResult(): ReactElement | null {
  const image = useAppSelector((state) => state.gallery.image);

  const showPosition = useAppSelector((state) => state.gallery.showPosition);

  return showPosition && image ? (
    <RichMarker
      position={{ lat: image.lat, lng: image.lon }}
      faIcon={<FaCamera />}
      interactive={false}
    />
  ) : null;
}
