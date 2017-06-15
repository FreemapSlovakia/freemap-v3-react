import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Thumbnail from 'react-bootstrap/lib/Thumbnail';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { galleryRequestImages, gallerySetImages } from 'fm3/actions/galleryActions';

const dateFormat = new Intl.DateTimeFormat('sk');

class GalleryResult extends React.Component {
  static propTypes = {
    onImageRequest: PropTypes.func.isRequired,
    images:
      PropTypes.arrayOf(PropTypes.shape({
      })).isRequired,
    onClose: PropTypes.func.isRequired,
  }

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handleMapClick);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleMapClick);
  }

  handleMapClick = (lat, lon) => {
    this.props.onImageRequest(lat, lon);
  }

  render() {
    const { images, onClose } = this.props;
    return (
      <Modal show={images.length > 0} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Obrázky</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {images.map(({ path, title, description, author, createdAt }) => (
            <div key={path}>
              <Thumbnail
                src={`http://www.freemap.sk/lib/image.php?width=558&height=558&filename=upload/gallery/${path}`}
                alt={title}
                href={`http://www.freemap.sk/upload/gallery/${path}`}
                target="freemap_gallery_image"
              >
                {title && title !== '-' && <h3>{title}</h3>}
                <p>Nahral {author} dňa {dateFormat.format(createdAt)}</p>
                {description && description !== '-' && <p>{description}</p>}
              </Thumbnail>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    images: state.gallery.images,
  }),
  dispatch => ({
    onImageRequest(lat, lon) {
      dispatch(galleryRequestImages(lat, lon));
    },
    onClose() {
      dispatch(gallerySetImages([]));
    },
  }),
)(GalleryResult);
