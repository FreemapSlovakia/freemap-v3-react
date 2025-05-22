import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { gallerySetPickingPosition } from '../../actions/galleryActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMap } from '../../hooks/useMap.js';
import { showGalleryViewerSelector } from '../../selectors/mainSelectors.js';
import '../../styles/gallery.scss';
import { AsyncModal } from '../AsyncModal.js';

const galleryViewerModalFactory = () => import('./GalleryViewerModal.js');

const galleryUploadModalFactory = () => import('./GalleryUploadModal.js');

export function GalleryModals(): ReactElement {
  const dispatch = useDispatch();

  const isPickingPosition = useAppSelector(
    (state) => state.gallery.pickingPositionForId !== null,
  );

  const showGalleryViewer = useAppSelector(showGalleryViewerSelector);

  const showUploadModal = useAppSelector(
    (state) =>
      state.main.activeModal === 'gallery-upload' &&
      state.gallery.pickingPositionForId === null,
  );

  const map = useMap();

  useEffect(() => {
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
  }, [dispatch, isPickingPosition, map]);

  const scrollTop = useRef(-1);

  const prevPickingPosition = useRef(false);

  // preserving upload modal scroll
  useLayoutEffect(() => {
    if (!isPickingPosition && prevPickingPosition.current) {
      const el = document.querySelector('.modal');

      if (el) {
        el.scrollTop = scrollTop.current;
      }
    }

    prevPickingPosition.current = isPickingPosition;

    if (showUploadModal) {
      const to = setInterval(() => {
        const el = document.querySelector('.modal');

        if (el instanceof HTMLElement) {
          scrollTop.current = el.scrollTop;
        }
      }, 500);

      return () => clearInterval(to);
    }
  }, [isPickingPosition, showUploadModal]);

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
