import { showGalleryViewerSelector } from '@app/store/selectors.js';
import { AsyncModal } from '@shared/components/AsyncModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDirtyForm } from '@shared/hooks/useDirtyForm.js';
import { type ReactElement, useEffect, useRef } from 'react';
import { galleryInputPendingSelector } from '../model/selectors.js';
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
  const pickingPositionForId = useAppSelector(
    (state) => state.gallery.pickingPositionForId,
  );

  const showGalleryViewer = useAppSelector(showGalleryViewerSelector);

  const showUploadModal = useAppSelector(
    (state) =>
      state.main.activeModal?.type === 'gallery-upload' &&
      state.gallery.pickingPositionForId === null,
  );

  // Here, not in the modals: they unmount while a position is picked.
  useDirtyForm(useAppSelector(galleryInputPendingSelector));

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
