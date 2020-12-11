import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useMessages } from 'fm3/l10nInjector';

import {
  galleryShowFilter,
  galleryShowUploadModal,
  galleryList,
  GalleryListOrder,
} from 'fm3/actions/galleryActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { RootState } from 'fm3/storeCreator';
import { is } from 'typescript-is';
import { Button, DropdownButton, Form } from 'react-bootstrap';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

export function GalleryMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const filterIsActive = useSelector(
    (state: RootState) => Object.keys(state.gallery.filter).length > 0,
  );

  return (
    <Form inline>
      <Button
        onClick={() => {
          dispatch(galleryShowFilter());
        }}
        active={filterIsActive}
      >
        <FontAwesomeIcon icon="filter" />
        <span className="hidden-xs"> {m?.gallery.filter}</span>
      </Button>{' '}
      <DropdownButton
        id="all-pics"
        title={m?.gallery.allPhotos}
        onSelect={(order: unknown) => {
          if (is<GalleryListOrder>(order)) {
            dispatch(galleryList(order));
          }
        }}
      >
        <DropdownItem eventKey="+createdAt">
          {m?.gallery.f.firstUploaded}
        </DropdownItem>
        <DropdownItem eventKey="-createdAt">
          {m?.gallery.f.lastUploaded}
        </DropdownItem>
        <DropdownItem eventKey="+takenAt">
          {m?.gallery.f.firstCaptured}
        </DropdownItem>
        <DropdownItem eventKey="-takenAt">
          {m?.gallery.f.lastCaptured}
        </DropdownItem>
        <DropdownItem eventKey="+rating">
          {m?.gallery.f.leastRated}
        </DropdownItem>
        <DropdownItem eventKey="-rating">{m?.gallery.f.mostRated}</DropdownItem>
      </DropdownButton>{' '}
      <Button
        onClick={() => {
          dispatch(galleryShowUploadModal());
        }}
      >
        <FontAwesomeIcon icon="upload" />
        <span className="hidden-xs"> {m?.gallery.upload}</span>
      </Button>
    </Form>
  );
}
