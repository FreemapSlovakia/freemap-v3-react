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
import { Checkbox } from '../Checkbox';
import { SubmenuHeader } from './SubmenuHeader';

export function GallerySubmenu(): JSX.Element {
  const m = useMessages();

  const filterIsActive = useAppSelector(
    (state) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  const overlays = useAppSelector((state) => state.map.overlays);

  const colorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  return (
    <>
      <SubmenuHeader icon={<FaCamera />} title={m?.tools.photos} />

      <Dropdown.Item
        href="#show=gallery-filter"
        eventKey="modal-gallery-filter"
        active={filterIsActive}
      >
        <FaFilter /> {m?.gallery.filter} <kbd>p</kbd> <kbd>f</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="#show=gallery-upload"
        eventKey="modal-gallery-upload"
      >
        <FaUpload /> {m?.gallery.upload} <kbd>p</kbd> <kbd>u</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="overlays-toggle-I"
        active={overlays.includes('I')}
      >
        <Checkbox value={overlays.includes('I')} /> {m?.gallery.showLayer}{' '}
        <kbd>shift + p</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>
        <FaBook /> {m?.gallery.showPhotosFrom}
      </Dropdown.Header>

      <Dropdown.Item as="button" eventKey="photosBy--createdAt">
        {m?.gallery.f.lastUploaded} <kbd>p</kbd> <kbd>l</kbd>
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosBy--takenAt">
        {m?.gallery.f.lastCaptured}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosBy--rating">
        {m?.gallery.f.mostRated}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosBy--lastCommentedAt">
        {m?.gallery.f.lastComment}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>
        <IoIosColorPalette /> {m?.gallery.colorizeBy}
      </Dropdown.Header>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-">
        {colorizeBy === null ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.disable}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-mine">
        {colorizeBy === 'mine' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.mine}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-userId">
        {colorizeBy === 'userId' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.author}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-rating">
        {colorizeBy === 'rating' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.rating}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-takenAt">
        {colorizeBy === 'takenAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.takenAt}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-createdAt">
        {colorizeBy === 'createdAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.createdAt}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="photosColorizeBy-season">
        {colorizeBy === 'season' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.season}
      </Dropdown.Item>
    </>
  );
}
