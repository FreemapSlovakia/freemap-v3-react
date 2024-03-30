import { galleryColorizeBy, galleryList } from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaBook,
  FaCamera,
  FaFilter,
  FaRegCheckCircle,
  FaRegCircle,
  FaUpload,
} from 'react-icons/fa';
import { IoIosColorPalette } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { Checkbox } from '../Checkbox';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function GallerySubmenu(): JSX.Element {
  const m = useMessages();

  const dispatch = useDispatch();

  const filterIsActive = useAppSelector(
    (state) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  const overlays = useAppSelector((state) => state.map.overlays);

  const colorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const closeMenu = useMenuClose();

  return (
    <>
      <SubmenuHeader icon={<FaCamera />} title={m?.tools.photos} />

      <Dropdown.Item
        href="#show=gallery-filter"
        onSelect={(_, e) => {
          e.preventDefault();

          dispatch(setActiveModal('gallery-filter'));

          closeMenu();
        }}
        active={filterIsActive}
      >
        <FaFilter /> {m?.gallery.filter} <kbd>p</kbd> <kbd>f</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="#show=gallery-upload"
        onSelect={(_, e) => {
          e.preventDefault();

          dispatch(setActiveModal('gallery-upload'));

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
        <Checkbox value={overlays.includes('I')} /> {m?.gallery.showLayer}{' '}
        <kbd>shift + p</kbd>
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
        onSelect={() => dispatch(galleryColorizeBy(null))}
      >
        {colorizeBy === null ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.disable}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => dispatch(galleryColorizeBy('mine'))}
      >
        {colorizeBy === 'mine' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.mine}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => dispatch(galleryColorizeBy('userId'))}
      >
        {colorizeBy === 'userId' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.author}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => dispatch(galleryColorizeBy('rating'))}
      >
        {colorizeBy === 'rating' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.rating}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => dispatch(galleryColorizeBy('takenAt'))}
      >
        {colorizeBy === 'takenAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.takenAt}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => dispatch(galleryColorizeBy('createdAt'))}
      >
        {colorizeBy === 'createdAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.createdAt}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => dispatch(galleryColorizeBy('season'))}
      >
        {colorizeBy === 'season' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.season}
      </Dropdown.Item>
    </>
  );
}
