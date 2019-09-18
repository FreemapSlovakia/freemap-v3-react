import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { withTranslator, Translator } from 'fm3/l10nInjector';

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

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const GalleryMenu: React.FC<Props> = ({
  onUpload,
  onFilterShow,
  filterIsActive,
  onOrderSelect,
  t,
}) => {
  return (
    <Form inline>
      <Button onClick={onFilterShow} active={filterIsActive}>
        <FontAwesomeIcon icon="filter" />
        <span className="hidden-xs"> {t('gallery.filter')}</span>
      </Button>{' '}
      <DropdownButton
        id="all-pics"
        title={t('gallery.allPhotos')}
        onSelect={onOrderSelect as (x: any) => void}
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
      <Button onClick={onUpload}>
        <FontAwesomeIcon icon="upload" />
        <span className="hidden-xs"> {t('gallery.upload')}</span>
      </Button>
    </Form>
  );
};

const mapStateToProps = (state: RootState) => ({
  filterIsActive: Object.keys(state.gallery.filter).some(
    key => state.gallery.filter[key],
  ),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onUpload() {
    dispatch(galleryShowUploadModal());
  },
  onFilterShow() {
    dispatch(galleryShowFilter());
  },
  onOrderSelect(order: GalleryListOrder) {
    dispatch(galleryList(order));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(GalleryMenu));
