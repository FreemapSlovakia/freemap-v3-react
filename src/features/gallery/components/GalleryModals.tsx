import { showGalleryViewerSelector } from '@app/store/selectors.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { AsyncModal } from '@shared/components/AsyncModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { gallerySetPickingPosition } from '../model/actions.js';
import './gallery.css';

const galleryViewerModalFactory = () =>
  import(
    /* webpackChunkName: "gallery-viewer-modal" */
    './GalleryViewerModal.js'
  );

const galleryUploadModalFactory = () =>
  import(
    /* webpackChunkName: "gallery-upload-modal" */
    './GalleryUploadModal.js'
  );

export function GalleryModals(): ReactElement {
  const dispatch = useDispatch();

  const pickingPositionForId = useAppSelector(
    (state) => state.gallery.pickingPositionForId,
  );

  const isPickingPosition = pickingPositionForId !== null;

  const showGalleryViewer = useAppSelector(showGalleryViewerSelector);

  const showUploadModal = useAppSelector(
    (state) =>
      state.main.activeModal?.type === 'gallery-upload' &&
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

  const pickedItemId = useRef<number | null>(null);

  // The reopened modal is a fresh instance scrolled to the top; bring back the
  // position field just picked for. A passive effect runs after the upload
  // items' own effects have appended their preview canvases.
  useEffect(() => {
    if (pickingPositionForId !== null) {
      pickedItemId.current = pickingPositionForId;
    } else if (pickedItemId.current !== null) {
      // picking can also end without its modal coming back
      if (showUploadModal || showGalleryViewer) {
        document
          .querySelector(`[data-position-pick="${pickedItemId.current}"]`)
          ?.scrollIntoView({ block: 'center' });
      }

      pickedItemId.current = null;
    }
  }, [pickingPositionForId, showUploadModal, showGalleryViewer]);

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
