import {
  galleryList,
  galleryShowFilter,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { useMessages } from 'fm3/l10nInjector';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaBook,
  FaCamera,
  FaFilter,
  FaRegCheckSquare,
  FaRegSquare,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function GallerySubmenu(): JSX.Element {
  const m = useMessages();

  const dispatch = useDispatch();

  const filterIsActive = useSelector(
    (state) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  const overlays = useSelector((state) => state.map.overlays);

  const closeMenu = useMenuClose();

  return (
    <>
      <SubmenuHeader icon={<FaCamera />} title={m?.tools.photos} />

      <Dropdown.Item
        href="?show=gallery-filter"
        onSelect={(_, e) => {
          e.preventDefault();
          dispatch(galleryShowFilter());
          closeMenu();
        }}
        active={filterIsActive}
      >
        <FaFilter /> {m?.gallery.filter} <kbd>p</kbd> <kbd>f</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="?show=gallery-upload"
        onSelect={(_, e) => {
          e.preventDefault();
          dispatch(galleryShowUploadModal());
          closeMenu();
        }}
      >
        <FaUpload /> {m?.gallery.upload} <kbd>p</kbd> <kbd>u</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(
            mapRefocus({
              overlays: overlays.includes('I')
                ? overlays.filter((o) => o !== 'I')
                : [...overlays, 'I'],
            }),
          );
        }}
        active={overlays.includes('I')}
      >
        {overlays.includes('I') ? <FaRegCheckSquare /> : <FaRegSquare />}{' '}
        {m?.gallery.showLayer} <kbd>shift + p</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>
        <FaBook /> {m?.gallery.showPhotosFrom}
      </Dropdown.Header>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryList('-createdAt'));
          closeMenu();
        }}
      >
        {m?.gallery.f.lastUploaded} <kbd>p</kbd> <kbd>l</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryList('-takenAt'));
          closeMenu();
        }}
      >
        {m?.gallery.f.lastCaptured}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryList('-rating'));
          closeMenu();
        }}
      >
        {m?.gallery.f.mostRated}
      </Dropdown.Item>
    </>
  );
}
