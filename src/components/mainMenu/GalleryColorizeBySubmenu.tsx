import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaCamera, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { IoIosColorPalette } from 'react-icons/io';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useMessages } from '../../l10nInjector.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function GalleryColorizeBySubmenu(): JSX.Element {
  const m = useMessages();

  const colorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  return (
    <>
      <Dropdown.Header>
        <FaCamera /> {m?.tools.photos}
      </Dropdown.Header>

      <SubmenuHeader
        icon={<IoIosColorPalette />}
        title={m?.gallery.colorizeBy}
      />

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
