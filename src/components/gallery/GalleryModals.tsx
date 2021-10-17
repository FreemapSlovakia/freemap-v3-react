import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { showGalleryViewerSelector } from 'fm3/selectors/mainSelectors';
import 'fm3/styles/gallery.scss';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AsyncModal } from '../AsyncModal';

const galleryViewerModalFactory = () =>
  import('fm3/components/gallery/GalleryViewerModal');

const galleryUploadModalFactory = () =>
  import('fm3/components/gallery/GalleryUploadModal');

export function GalleryModals(): ReactElement {
  const dispatch = useDispatch();

  const isPickingPosition = useSelector(
    (state) => state.gallery.pickingPositionForId !== null,
  );

  const showGalleryViewer = useSelector(showGalleryViewerSelector);

  const showUploadModal = useSelector(
    (state) =>
      state.main.activeModal === 'gallery-upload' &&
      state.gallery.pickingPositionForId === null,
  );

  useEffect(() => {
    const map = getMapLeafletElement();

    if (!map) {
      return;
    }

    const handleMapClick = ({ latlng }: LeafletMouseEvent) => {
      if (isPickingPosition) {
        dispatch(
          gallerySetPickingPosition({ lat: latlng.lat, lon: latlng.lng }),
        );
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [dispatch, isPickingPosition]);

  return (
    <>
      <AsyncModal
        show={showGalleryViewer}
        factory={galleryViewerModalFactory}
      />

      <AsyncModal show={showUploadModal} factory={galleryUploadModalFactory} />
    </>
  );
}
