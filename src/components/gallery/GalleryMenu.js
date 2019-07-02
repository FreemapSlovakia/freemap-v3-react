import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import injectL10n from 'fm3/l10nInjector';

import {
  galleryShowFilter,
  galleryShowUploadModal,
  galleryList,
} from 'fm3/actions/galleryActions';

import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Form from 'react-bootstrap/lib/Form';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function GalleryMenu({
  onUpload,
  onFilterShow,
  filterIsActive,
  onOrderSelect,
  t,
}) {
  return (
    <Form inline>
      <span className="fm-label">
        <FontAwesomeIcon icon="picture-o" />
        <span className="hidden-xs"> {t('tools.gallery')}</span>
      </span>{' '}
      <Button onClick={onFilterShow} active={filterIsActive}>
        <FontAwesomeIcon icon="filter" />
        <span className="hidden-xs"> {t('gallery.filter')}</span>
      </Button>{' '}
      <DropdownButton
        id="all-pics"
        title={t('gallery.allPhotos')}
        onSelect={onOrderSelect}
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
}

GalleryMenu.propTypes = {
  onUpload: PropTypes.func.isRequired,
  onFilterShow: PropTypes.func.isRequired,
  onOrderSelect: PropTypes.func.isRequired,
  filterIsActive: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  filterIsActive: Object.keys(state.gallery.filter).some(
    key => state.gallery.filter[key],
  ),
});

const mapDispatchToProps = dispatch => ({
  onUpload() {
    dispatch(galleryShowUploadModal());
  },
  onFilterShow() {
    dispatch(galleryShowFilter());
  },
  onOrderSelect(order) {
    dispatch(galleryList(order));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(GalleryMenu);
