import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaCamera, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { IoIosColorPalette } from 'react-icons/io';
import { GalleryColorizeBy } from '@/features/gallery/model/actions.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function colorizeByMenuItemProps(colorizeBy: GalleryColorizeBy | '') {
  return {
    eventKey: `photosColorizeBy-${colorizeBy}`,
  };
}

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

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('')}>
        {colorizeBy === null ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.disable}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('premium')}>
        {colorizeBy === 'premium' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.premium}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('mine')}>
        {colorizeBy === 'mine' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.mine}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('userId')}>
        {colorizeBy === 'userId' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.userId}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('rating')}>
        {colorizeBy === 'rating' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.rating}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('takenAt')}>
        {colorizeBy === 'takenAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.takenAt}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('createdAt')}>
        {colorizeBy === 'createdAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.createdAt}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('season')}>
        {colorizeBy === 'season' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.gallery.c.season}
      </Dropdown.Item>
    </>
  );
}
