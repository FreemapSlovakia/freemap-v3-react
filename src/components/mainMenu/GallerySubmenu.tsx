import {
  galleryColorizeBy,
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
  FaRegCheckCircle,
  FaRegCheckSquare,
  FaRegCircle,
  FaRegSquare,
  FaUpload,
} from 'react-icons/fa';
import { IoIosColorPalette } from 'react-icons/io';
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

  const colorizeBy = useSelector((state) => state.gallery.colorizeBy);

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

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryList('-lastCommentedAt'));
          closeMenu();
        }}
      >
        {m?.gallery.f.lastComment}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>
        <IoIosColorPalette /> {m?.gallery.colorizeBy}
      </Dropdown.Header>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryColorizeBy(null));
          closeMenu();
        }}
      >
        {colorizeBy === null ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.disable}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryColorizeBy('mine'));
          closeMenu();
        }}
      >
        {colorizeBy === 'mine' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.mine}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryColorizeBy('userId'));
          closeMenu();
        }}
      >
        {colorizeBy === 'userId' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.author}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryColorizeBy('rating'));
          closeMenu();
        }}
      >
        {colorizeBy === 'rating' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.rating}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryColorizeBy('takenAt'));
          closeMenu();
        }}
      >
        {colorizeBy === 'takenAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.takenAt}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(galleryColorizeBy('createdAt'));
          closeMenu();
        }}
      >
        {colorizeBy === 'createdAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.createdAt}
      </Dropdown.Item>
    </>
  );
}
