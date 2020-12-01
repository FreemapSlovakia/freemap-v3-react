import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslator } from 'fm3/l10nInjector';

import {
  galleryShowFilter,
  galleryShowUploadModal,
  galleryList,
  GalleryListOrder,
} from 'fm3/actions/galleryActions';

import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Form from 'react-bootstrap/lib/Form';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { RootState } from 'fm3/storeCreator';
import { is } from 'typescript-is';

export function GalleryMenuInt(): ReactElement {
  const t = useTranslator();

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
        <span className="hidden-xs"> {t('gallery.filter')}</span>
      </Button>{' '}
      <DropdownButton
        id="all-pics"
        title={t('gallery.allPhotos')}
        onSelect={(order: unknown) => {
          if (is<GalleryListOrder>(order)) {
            dispatch(galleryList(order));
          }
        }}
      >
        <MenuItem eventKey="+createdAt">
          {t('gallery.f.firstUploaded')}
        </MenuItem>
        <MenuItem eventKey="-createdAt">{t('gallery.f.lastUploaded')}</MenuItem>
        <MenuItem eventKey="+takenAt">{t('gallery.f.firstCaptured')}</MenuItem>
        <MenuItem eventKey="-takenAt">{t('gallery.f.lastCaptured')}</MenuItem>
        <MenuItem eventKey="+rating">{t('gallery.f.leastRated')}</MenuItem>
        <MenuItem eventKey="-rating">{t('gallery.f.mostRated')}</MenuItem>
      </DropdownButton>{' '}
      <Button
        onClick={() => {
          dispatch(galleryShowUploadModal());
        }}
      >
        <FontAwesomeIcon icon="upload" />
        <span className="hidden-xs"> {t('gallery.upload')}</span>
      </Button>
    </Form>
  );
}
