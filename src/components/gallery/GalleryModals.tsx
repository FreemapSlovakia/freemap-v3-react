import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { mapPromise } from 'fm3/leafletElementHolder';
import { showGalleryViewerSelector } from 'fm3/selectors/mainSelectors';
import 'fm3/styles/gallery.scss';
import { LeafletMouseEvent, Map } from 'leaflet';
import {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { AsyncModal } from '../AsyncModal';

const galleryViewerModalFactory = () =>
  import('fm3/components/gallery/GalleryViewerModal');

const galleryUploadModalFactory = () =>
  import('fm3/components/gallery/GalleryUploadModal');

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

  const [map, setMap] = useState<Map>();

  useEffect(() => {
    mapPromise.then(setMap);
  }, []);

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
