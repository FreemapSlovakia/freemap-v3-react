import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import each from 'async/each';
// import ExifReader from 'exifreader';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';

import * as FmPropTypes from 'fm3/propTypes';

import { setActiveModal } from 'fm3/actions/mainActions';
import { galleryAddItem, galleryRemoveItem, gallerySetItemTitle, gallerySetItemDescription, gallerySetItemUrl, galleryPickItemPosition } from 'fm3/actions/galleryActions';

import GalleryUploadItem from 'fm3/components/GalleryUploadItem';

const ExifReader = require('exifreader');
const pica = require('pica/dist/pica')(); // require('pica') seems not to use service workers

let nextId = 0;

class GalleryUploadModal extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        file: PropTypes.object.isRequired,
        dataURL: PropTypes.string,
        coords: FmPropTypes.point,
        title: PropTypes.string,
        description: PropTypes.string,
      }).isRequired,
    ).isRequired,
    onItemAdd: PropTypes.func.isRequired,
    onItemUrlSet: PropTypes.func.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onTitleChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
    visible: PropTypes.bool,
  }

  handleFileDrop = (acceptedFiles /* , rejectedFiles */) => {
    each(acceptedFiles, (file, cb) => {
      const reader = new FileReader();
      reader.onerror = (err) => {
        cb(err);
      };
      reader.onload = () => {
        const tags = ExifReader.load(reader.result);
        const id = nextId;
        nextId += 1;

        this.props.onItemAdd({
          id,
          file,
          coords: tags.GPSLatitude && tags.GPSLongitude ? {
            lat: tags.GPSLatitude.description * (tags.GPSLatitudeRef.value[0] === 'S' ? -1 : 1),
            lon: tags.GPSLongitude.description * (tags.GPSLongitudeRef.value[0] === 'W' ? -1 : 1),
          } : null,
          title: tags.title ? tags.title.description : tags.DocumentName ? tags.DocumentName.description : '',
          description: tags.description ? tags.description.description : tags.ImageDescription ? tags.ImageDescription.description : '',
        });

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

            // canvas2.toBlob((blob) => {
            //   this.props.onItemUrlSet(id, URL.createObjectURL(blob));
            //   cb();
            // });
            this.props.onItemUrlSet(id, canvas2.toDataURL()); // TODO play with toBlob (not supported in safari)
            cb();
          });
        };

        img.src = url;
      };

      reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
    }, (err) => {
      if (err) {
        // TODO
      }
    });
  }

  handleRemove = (id) => {
    this.props.onItemRemove(id);
  }

  render() {
    const { items, onClose, onPositionPick, onTitleChange, onDescriptionChange, visible } = this.props;
    return (
      <Modal show={visible} bsSize="large" onHide={onClose}>
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
            items.map(({ id, file, dataURL, coords, title, description }) => (
              <GalleryUploadItem
                key={id}
                id={id}
                filename={file.name}
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
    visible: state.gallery.pickingPositionForId === null,
  }),
  dispatch => ({
    onItemAdd(item) {
      dispatch(galleryAddItem(item));
    },
    onItemRemove(id) {
      dispatch(galleryRemoveItem(id));
    },
    onItemUrlSet(id, url) {
      dispatch(gallerySetItemUrl(id, url));
    },
    onClose() {
      dispatch(setActiveModal(null));
    },
    onPositionPick(id) {
      dispatch(galleryPickItemPosition(id));
    },
    onTitleChange(id, title) {
      dispatch(gallerySetItemTitle(id, title));
    },
    onDescriptionChange(id, description) {
      dispatch(gallerySetItemDescription(id, description));
    },
  }),
)(GalleryUploadModal);
