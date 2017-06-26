import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';

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
    zoom: PropTypes.number.isRequired,
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

  render() {
    const { images, onClose, zoom } = this.props;

    return (
      <div>
        {this.state.lat && this.state.lon &&
          <Circle
            center={[this.state.lat, this.state.lon]}
            radius={3000 / 2 ** zoom * 1000}
            stroke={false}
          />
        }
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
      </div>
    );
  }
}

export default connect(
  state => ({
    images: state.gallery.images,
    zoom: state.map.zoom,
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
