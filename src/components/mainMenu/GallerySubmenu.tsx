import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaCamera,
  FaChevronRight,
  FaDove,
  FaEnvelope,
  FaEye,
  FaFilter,
  FaGem,
  FaLocationArrow,
  FaUpload,
} from 'react-icons/fa';
import { IoIosColorPalette } from 'react-icons/io';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { Checkbox } from '../Checkbox.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function GallerySubmenu(): JSX.Element {
  const m = useMessages();

  const filterIsActive = useAppSelector(
    (state) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  const layers = useAppSelector((state) => state.map.layers);

  const showDirection = useAppSelector((state) => state.gallery.showDirection);

  const sendGalleryEmails = useAppSelector(
    (state) => state.auth.user?.sendGalleryEmails,
  );

  return (
    <>
      <SubmenuHeader icon={<FaCamera />} title={m?.tools.photos} />

      <Dropdown.Item as="button" eventKey="layers-toggle-I">
        <Checkbox value={layers.includes('I')} /> <FaEye />{' '}
        {m?.gallery.showLayer} <kbd>⇧f</kbd>
      </Dropdown.Item>

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

      <Dropdown.Item eventKey="submenu-galleryColorizeBy">
        <IoIosColorPalette /> {m?.gallery.colorizeBy} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="galDirection">
        <Checkbox value={showDirection} /> <FaLocationArrow />{' '}
        {m?.gallery.showDirection}
      </Dropdown.Item>

      {sendGalleryEmails !== undefined && (
        <>
          <Dropdown.Item as="button" eventKey="galEmails">
            <Checkbox value={sendGalleryEmails} /> <FaEnvelope />{' '}
            {m?.settings.account.sendGalleryEmails}
          </Dropdown.Item>

          <Dropdown.Divider />

          <Dropdown.Item as="button" eventKey="galAll-premium">
            <FaGem /> {m?.gallery.allMyPhotos.premium}
          </Dropdown.Item>

          <Dropdown.Item as="button" eventKey="galAll-free">
            <FaDove /> {m?.gallery.allMyPhotos.free}
          </Dropdown.Item>
        </>
      )}

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
    </>
  );
}
