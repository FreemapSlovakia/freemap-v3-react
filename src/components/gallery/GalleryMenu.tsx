import {
  galleryList,
  GalleryListOrder,
  galleryShowFilter,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';

export function GalleryMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const filterIsActive = useSelector(
    (state: RootState) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          dispatch(galleryShowFilter());
        }}
        active={filterIsActive}
      >
        <FontAwesomeIcon icon="filter" />
        <span className="d-none d-sm-inline"> {m?.gallery.filter}</span>
      </Button>
      <DropdownButton
        className="ml-1"
        variant="secondary"
        id="all-pics"
        title={m?.gallery.allPhotos}
        onSelect={(order) => {
          if (is<GalleryListOrder>(order)) {
            dispatch(galleryList(order));
          }
        }}
      >
        <Dropdown.Item eventKey="+createdAt">
          {m?.gallery.f.firstUploaded}
        </Dropdown.Item>
        <Dropdown.Item eventKey="-createdAt">
          {m?.gallery.f.lastUploaded}
        </Dropdown.Item>
        <Dropdown.Item eventKey="+takenAt">
          {m?.gallery.f.firstCaptured}
        </Dropdown.Item>
        <Dropdown.Item eventKey="-takenAt">
          {m?.gallery.f.lastCaptured}
        </Dropdown.Item>
        <Dropdown.Item eventKey="+rating">
          {m?.gallery.f.leastRated}
        </Dropdown.Item>
        <Dropdown.Item eventKey="-rating">
          {m?.gallery.f.mostRated}
        </Dropdown.Item>
      </DropdownButton>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(galleryShowUploadModal());
        }}
      >
        <FontAwesomeIcon icon="upload" />
        <span className="d-none d-sm-inline"> {m?.gallery.upload}</span>
      </Button>
    </>
  );
}
