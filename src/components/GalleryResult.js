import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle, TileLayer } from 'react-leaflet';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Image from 'react-bootstrap/lib/Image';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { galleryRequestImages, gallerySetImages, gallerySetActiveImageId } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';

const dateFormat = new Intl.DateTimeFormat('sk');

class GalleryResult extends React.Component {
  static propTypes = {
    onImageRequest: PropTypes.func.isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({
      // TODO
    })).isRequired,
    activeImageId: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired,
    onImageSelect: PropTypes.func.isRequired,
  }

  state = {};

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handleMapClick);
    mapEventEmitter.on('mouseMove', this.handleMouseMove);
    mapEventEmitter.on('mouseOut', this.handleMouseOut);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleMapClick);
    mapEventEmitter.removeListener('mouseMove', this.handleMouseMove);
    mapEventEmitter.removeListener('mouseOut', this.handleMouseOut);
  }

  getModal() {
    const { images, activeImageId, onClose } = this.props;
    const index = activeImageId ? images.findIndex(({ id }) => id === activeImageId) : -1;
    const { path, title, description, author, createdAt } = images[index];

    return (
      <Modal show onHide={onClose} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>
            Obrázky {title && title !== '-' && `:: ${title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="carousel">
            <div className="item active">
              <a
                href={`http://www.freemap.sk/upload/gallery/${path}`}
                target="freemap_gallery_image"
              >
                <Image
                  className="gallery-image"
                  // src={`http://www.freemap.sk/lib/image.php?width=558&height=558&filename=upload/gallery/${path}`}
                  src={`http://www.freemap.sk/upload/gallery/${path}`}
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
            Nahral <b>{author}</b> dňa <b>{dateFormat.format(createdAt)}</b>
            {description && description !== '-' && `: ${description}`}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  handleMapClick = (lat, lon) => {
    this.props.onImageRequest(lat, lon);
  }

  handleMouseMove = (lat, lon) => {
    this.setState({ lat, lon });
  }

  handleMouseOut = () => {
    this.setState({ lat: undefined, lon: undefined });
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
    const { activeImageId, zoom } = this.props;

    return (
      <div>
        <TileLayer
          url="http://t1.freemap.sk/data/layers/presets/X~I/{z}/{x}/{y}t.png"
          maxZoom={20}
          minZoom={8}
          maxNativeZoom={16}
          zIndex={100}
        />

        {this.state.lat && this.state.lon &&
          <Circle
            center={[this.state.lat, this.state.lon]}
            radius={5000 / 2 ** zoom * 1000}
            stroke={false}
          />
        }

        {activeImageId && this.getModal()}
      </div>
    );
  }
}

export default connect(
  state => ({
    images: state.gallery.images,
    activeImageId: state.gallery.activeImageId,
    zoom: state.map.zoom,
  }),
  dispatch => ({
    onImageRequest(lat, lon) {
      dispatch(galleryRequestImages(lat, lon));
    },
    onClose() {
      dispatch(gallerySetImages([]));
    },
    onImageSelect(id) {
      dispatch(gallerySetActiveImageId(id));
    },
  }),
)(GalleryResult);
