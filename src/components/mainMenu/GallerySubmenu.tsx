import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaCamera,
  FaDove,
  FaEnvelope,
  FaEye,
  FaFilter,
  FaGem,
  FaRegCheckCircle,
  FaRegCircle,
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

  const overlays = useAppSelector((state) => state.map.overlays);

  const colorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const sendGalleryEmails = useAppSelector(
    (state) => state.auth.user?.sendGalleryEmails,
  );

  return (
    <>
      <SubmenuHeader icon={<FaCamera />} title={m?.tools.photos} />

      <Dropdown.Item
        as="button"
        eventKey="overlays-toggle-I"
        active={overlays.includes('I')}
      >
        <Checkbox value={overlays.includes('I')} /> <FaEye />{' '}
        {m?.gallery.showLayer} <kbd>⇧f</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="#show=gallery-upload"
        eventKey="modal-gallery-upload"
      >
        <FaUpload /> {m?.gallery.upload} <kbd>p</kbd> <kbd>u</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="#show=gallery-filter"
        eventKey="modal-gallery-filter"
        active={filterIsActive}
      >
        <FaFilter /> {m?.gallery.filter} <kbd>p</kbd> <kbd>f</kbd>
      </Dropdown.Item>

      {sendGalleryEmails !== undefined && (
        <Dropdown.Item as="button" eventKey="galEmails">
          <Checkbox value={sendGalleryEmails} /> <FaEnvelope />{' '}
          {m?.settings.account.sendGalleryEmails}
        </Dropdown.Item>
      )}

      <Dropdown.Item as="button" eventKey="galAll-premium">
        <FaGem /> Zaradiť všetky moje fotky do prémiového obsahu
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="galAll-free">
        <FaDove /> Sprístupniť všetky moje fotky každému
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

      <Dropdown.Item as="button" eventKey="photosColorizeBy-premium">
        {colorizeBy === 'premium' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.premium}
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
