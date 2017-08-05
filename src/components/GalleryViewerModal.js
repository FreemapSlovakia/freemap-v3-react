/* eslint-disable jsx-a11y/no-static-element-interactions */ // prevented warning in bootstrap code

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Image from 'react-bootstrap/lib/Image';

import { API_URL } from 'fm3/backendDefinitions';

import { gallerySetImages, gallerySetActiveImageId, galleryShowOnTheMap }
  from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';

const dateFormat = new Intl.DateTimeFormat('sk');

class GalleryViewerModal extends React.Component {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
    })).isRequired,
    activeImageId: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    onImageSelect: PropTypes.func.isRequired,
    onShowOnTheMap: PropTypes.func.isRequired,
  }

  handlePreviousClick = (e) => {
    e.preventDefault();

    const { images, activeImageId, onImageSelect } = this.props;
    const index = images.findIndex(({ id }) => id === activeImageId);
    if (index > 0) {
      onImageSelect(images[index - 1].id);
    }
  }

  handleNextClick = (e) => {
    e.preventDefault();
    const { images, activeImageId, onImageSelect } = this.props;
    const index = images.findIndex(({ id }) => id === activeImageId);
    if (index + 1 < images.length) {
      onImageSelect(images[index + 1].id);
    }
  }

  render() {
    const { images, activeImageId, onClose, onShowOnTheMap } = this.props;
    const index = activeImageId ? images.findIndex(({ id }) => id === activeImageId) : -1;
    const { pathname, title, description, user, createdAt, takenAt } = images[index];

    return (
      <Modal show onHide={onClose} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>
            Obrázky {title && `:: ${title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="carousel">
            <div className="item active">
              <a
                href={pathname.startsWith(':') ? `http://www.freemap.sk/upload/gallery/${pathname.substring(1)}` : `${API_URL}/static/gallery/${pathname}`}
                target="freemap_gallery_image"
              >
                <Image
                  className="gallery-image"
                  src={pathname.startsWith(':') ? `http://www.freemap.sk/upload/gallery/${pathname.substring(1)}` : `${API_URL}/static/gallery/${pathname}`}
                  alt={title}
                />
              </a>
            </div>
            <a
              className={`left carousel-control ${index < 1 ? 'disabled' : ''}`}
              onClick={this.handlePreviousClick}
            >
              <Glyphicon glyph="chevron-left" />
            </a>
            <a
              className={`right carousel-control ${index >= images.length - 1 ? 'disabled' : ''}`}
              onClick={this.handleNextClick}
            >
              <Glyphicon glyph="chevron-right" />
            </a>
          </div>
          <p>
            <br />
            Nahral <b>{user.name}</b> dňa <b>{dateFormat.format(createdAt)}</b>
            {takenAt && <span>. Odfotené dňa <b>{dateFormat.format(takenAt)}</b>.</span>}
            {description && `: ${description}`}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onShowOnTheMap}><FontAwesomeIcon icon="dot-circle-o" /> Ukázať na mape</Button>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    images: state.gallery.images,
    activeImageId: state.gallery.activeImageId,
    zoom: state.map.zoom,
    pickingPosition: state.gallery.pickingPositionForId !== null,
  }),
  dispatch => ({
    onClose() {
      dispatch(gallerySetImages([]));
    },
    onShowOnTheMap() {
      dispatch(galleryShowOnTheMap());
      dispatch(gallerySetImages([]));
    },
    onImageSelect(id) {
      dispatch(gallerySetActiveImageId(id));
    },
  }),
)(GalleryViewerModal);
