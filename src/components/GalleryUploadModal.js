import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import map from 'async/map';
// import ExifReader from 'exifreader';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';

import { setActiveModal } from 'fm3/actions/mainActions';
import { galleryAddItems, galleryRemoveItem, gallerySetTitle, gallerySetDescription } from 'fm3/actions/galleryActions';

import GalleryUploadItem from 'fm3/components/GalleryUploadItem';

const ExifReader = require('exifreader');
const pica = require('pica/dist/pica')(); // require('pica') seems not to use service workers

class GalleryUploadModal extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({

      }).isRequired,
    ).isRequired,
    onAddItems: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onTitleChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
  }

  handleFileDrop = (acceptedFiles /* , rejectedFiles */) => {
    map(acceptedFiles, (file, cb) => {
      const reader = new FileReader();
      reader.onerror = (err) => {
        cb(err);
      };
      reader.onload = () => {
        const tags = ExifReader.load(reader.result);

        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          cb(err);
        };
        img.onload = () => {
          URL.revokeObjectURL(url);

          const canvas = document.createElement('canvas');
          const ratio = 858 / img.naturalWidth;
          const width = img.naturalWidth * ratio;
          const height = img.naturalHeight * ratio;
          const o = tags.Orientation.value;
          canvas.width = width;
          canvas.height = height;

          const transformations = [
            [1, 0, 0, 1, 0, 0],
            [-1, 0, 0, 1, width, 0],
            [-1, 0, 0, -1, width, height],
            [1, 0, 0, -1, 0, height],
            [0, 1, 1, 0, 0, 0],
            [0, 1, -1, 0, height, 0],
            [0, -1, -1, 0, height, width],
            [0, -1, 1, 0, 0, width],
          ];

          pica.resize(img, canvas).then(() => {
            const canvas2 = document.createElement('canvas');
            const ctx = canvas2.getContext('2d');
            canvas2.width = o > 4 ? height : width;
            canvas2.height = o > 4 ? width : height;
            ctx.transform(...transformations[o - 1]);
            ctx.drawImage(canvas, 0, 0);

            cb(null, {
              filename: file.name,
              dataURL: canvas2.toDataURL(), // TODO play with toBlob (not supported in safari)
              coords: tags.GPSLatitude && tags.GPSLongitude ? {
                lat: tags.GPSLatitude.description * (tags.GPSLatitudeRef.value[0] === 'S' ? -1 : 1),
                lon: tags.GPSLongitude.description * (tags.GPSLongitudeRef.value[0] === 'W' ? -1 : 1),
              } : null,
              title: tags.title ? tags.title.description : tags.DocumentName ? tags.DocumentName.description : '',
              description: tags.description ? tags.description.description : tags.ImageDescription ? tags.ImageDescription.description : '',
            });
          });
        };

        img.src = url;
      };

      reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
    }, (err, results) => {
      if (err) {
        // TODO
        return;
      }
      this.props.onAddItems(results);
    });
  }

  handleRemove = (id) => {
    this.props.onRemoveItem(id);
  }

  render() {
    const { items, onClose, onPositionPick, onTitleChange, onDescriptionChange } = this.props;
    return (
      <Modal show bsSize="large" onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Nahrať obrázky</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="danger">
            Implementácia nahrávania obrázkov ešte nie je dokončená.
          </Alert>
          <Dropzone onDrop={this.handleFileDrop} accept=".jpg,.jpeg,.png" className="dropzone">
            <div>Potiahnite sem obrázky, alebo sem kliknite pre ich výber.</div>
          </Dropzone>
          {
            items.map(({ id, filename, dataURL, coords, title, description }) => (
              <GalleryUploadItem
                key={id}
                id={id}
                filename={filename}
                dataURL={dataURL}
                coords={coords}
                title={title}
                description={description}
                onRemove={this.handleRemove}
                onPositionPick={onPositionPick}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
              />
            ))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    items: state.gallery.items,
  }),
  dispatch => ({
    onAddItems(items) {
      dispatch(galleryAddItems(items));
    },
    onRemoveItem(id) {
      dispatch(galleryRemoveItem(id));
    },
    onClose() {
      dispatch(setActiveModal(null));
    },
    onPositionPick() {
      // TODO
    },
    onTitleChange(id, title) {
      dispatch(gallerySetTitle(id, title));
    },
    onDescriptionChange(id, description) {
      dispatch(gallerySetDescription(id, description));
    },
  }),
)(GalleryUploadModal);
