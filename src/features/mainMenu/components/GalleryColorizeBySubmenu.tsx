import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaCamera, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { IoIosColorPalette } from 'react-icons/io';
import { GalleryColorizeBy } from '@/features/gallery/model/actions.js';
import { useGalleryMessages } from '@/features/gallery/translations/useGalleryMessages.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function colorizeByMenuItemProps(colorizeBy: GalleryColorizeBy | '') {
  return {
    eventKey: `photosColorizeBy-${colorizeBy}`,
  };
}

export function GalleryColorizeBySubmenu(): JSX.Element {
  const m = useMessages();

  const gm = useGalleryMessages();

  const colorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  return (
    <>
      <Dropdown.Header>
        <FaCamera /> {m?.tools.photos}
      </Dropdown.Header>

      <SubmenuHeader icon={<IoIosColorPalette />} title={gm?.colorizeBy} />

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('')}>
        {colorizeBy === null ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.disable}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('premium')}>
        {colorizeBy === 'premium' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.premium}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('mine')}>
        {colorizeBy === 'mine' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.mine}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('userId')}>
        {colorizeBy === 'userId' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.userId}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('rating')}>
        {colorizeBy === 'rating' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.rating}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('takenAt')}>
        {colorizeBy === 'takenAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.takenAt}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('createdAt')}>
        {colorizeBy === 'createdAt' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.createdAt}
      </Dropdown.Item>

      <Dropdown.Item as="button" {...colorizeByMenuItemProps('season')}>
        {colorizeBy === 'season' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {gm?.c.season}
      </Dropdown.Item>
    </>
  );
}
