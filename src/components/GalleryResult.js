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
import DisqusThread from 'fm3/components/DisqusThread';

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
    const index = (images.findIndex(({ id }) => id === activeImageId) - 1 + images.length) % images.length;
    onImageSelect(images[index].id);
  }

  handleNextClick = (e) => {
    e.preventDefault();
    const { images, activeImageId, onImageSelect } = this.props;
    const index = (images.findIndex(({ id }) => id === activeImageId) + 1) % images.length;
    onImageSelect(images[index].id);
  }

  render() {
    const { images, activeImageId, onClose, zoom } = this.props;

    const index = activeImageId ? images.findIndex(({ id }) => id === activeImageId) : -1;

    const { id, path, title, description, author, createdAt } = index === -1 ? {} : images[index];

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

        {activeImageId &&
          <Modal show onHide={onClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                Obrázky
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
                      style={{ width: '100%' }}
                      // src={`http://www.freemap.sk/lib/image.php?width=558&height=558&filename=upload/gallery/${path}`}
                      src={`http://www.freemap.sk/upload/gallery/${path}`}
                      alt={title}
                    />
                  </a>
                </div>
                <a className="left carousel-control" onClick={this.handlePreviousClick} disabled={index < 1}>
                  <Glyphicon glyph="chevron-left" />
                </a>
                <a className="right carousel-control" onClick={this.handleNextClick} disabled={index >= images.length - 1}>
                  <Glyphicon glyph="chevron-right" />
                </a>
              </div>
              {title && title !== '-' && <h3>{title}</h3>}
              <p>Nahral {author} dňa {dateFormat.format(createdAt)}</p>
              {description && description !== '-' && <p>{description}</p>}
              <DisqusThread id={`gi_${id}`} path={`http://www.freemap.sk/upload/gallery/${path}`} title={title} />
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={onClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
            </Modal.Footer>
          </Modal>
        }
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
