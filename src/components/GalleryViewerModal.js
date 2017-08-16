/* eslint-disable jsx-a11y/no-static-element-interactions */ // prevented warning in bootstrap code

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Image from 'react-bootstrap/lib/Image';
import Label from 'react-bootstrap/lib/Label';

import { API_URL } from 'fm3/backendDefinitions';

import { galleryClear, galleryRequestImage, galleryShowOnTheMap }
  from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';

const dateFormat = new Intl.DateTimeFormat('sk');

class GalleryViewerModal extends React.Component {
  static propTypes = {
    imageIds: PropTypes.arrayOf(PropTypes.number.isRequired),
    image: PropTypes.shape({
      // TODO
    }),
    activeImageId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onImageSelect: PropTypes.func.isRequired,
    onShowOnTheMap: PropTypes.func.isRequired,
  }

  handlePreviousClick = (e) => {
    e.preventDefault();

    const { imageIds, activeImageId, onImageSelect } = this.props;
    const index = imageIds.findIndex(id => id === activeImageId);
    if (index > 0) {
      onImageSelect(imageIds[index - 1]);
    }
  }

  handleNextClick = (e) => {
    e.preventDefault();
    const { imageIds, activeImageId, onImageSelect } = this.props;
    const index = imageIds.findIndex(id => id === activeImageId);
    if (index + 1 < imageIds.length) {
      onImageSelect(imageIds[index + 1]);
    }
  }

  render() {
    const { imageIds, activeImageId, onClose, onShowOnTheMap, image } = this.props;
    const index = imageIds && imageIds.findIndex(id => id === activeImageId);
    const { title = '...', description, user, createdAt, takenAt, tags } = image || {};

    const loadingMeta = !image || image.id !== activeImageId;

    return (
      <Modal show onHide={onClose} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>
            Fotka {imageIds ? `${index + 1} / ${imageIds.length} ` : ''}{title && `- ${title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="carousel">
            <div className="item active">
              <a
                href={`${API_URL}/gallery/pictures/${activeImageId}/image`}
                target="freemap_gallery_image"
              >
                <Image
                  className="gallery-image"
                  src={`${API_URL}/gallery/pictures/${activeImageId}/image`}
                  alt={title}
                />
              </a>
            </div>
            {imageIds &&
              <a
                className={`left carousel-control ${index < 1 ? 'disabled' : ''}`}
                onClick={this.handlePreviousClick}
              >
                <Glyphicon glyph="chevron-left" />
              </a>
            }
            {imageIds &&
              <a
                className={`right carousel-control ${index >= imageIds.length - 1 ? 'disabled' : ''}`}
                onClick={this.handleNextClick}
              >
                <Glyphicon glyph="chevron-right" />
              </a>
            }
          </div>
          {image &&
            <p>
              <br />
              Nahral <b>{user.name}</b> dňa <b>{dateFormat.format(createdAt)}</b>
              {takenAt && <span>. Odfotené dňa <b>{dateFormat.format(takenAt)}</b>.</span>}
              {description && `: ${description}`}
              {tags.map(tag => <span key={tag}> <Label>{tag}</Label></span>)}
            </p>
          }
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
    imageIds: state.gallery.imageIds,
    image: state.gallery.image,
    activeImageId: state.gallery.activeImageId,
    zoom: state.map.zoom,
    pickingPosition: state.gallery.pickingPositionForId !== null,
  }),
  dispatch => ({
    onClose() {
      dispatch(galleryClear(null));
    },
    onShowOnTheMap() {
      dispatch(galleryShowOnTheMap());
      dispatch(galleryClear(null));
    },
    onImageSelect(id) {
      dispatch(galleryRequestImage(id));
    },
  }),
)(GalleryViewerModal);
