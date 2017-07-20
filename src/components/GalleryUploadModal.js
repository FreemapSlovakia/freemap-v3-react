import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import map from 'async/map';
// import ExifReader from 'exifreader';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Thumbnail from 'react-bootstrap/lib/Thumbnail';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Alert from 'react-bootstrap/lib/Alert';

import { formatGpsCoord } from 'fm3/geoutils';

import { setActiveModal } from 'fm3/actions/mainActions';

const ExifReader = require('exifreader');

class GalleryUploadModal extends React.Component {
  static propTypes = {
    shown: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
  }

  state = {
    results: [],
  }

  nextId = 0;

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
          const ctx = canvas.getContext('2d');
          const width = img.naturalWidth;
          const height = img.naturalHeight;
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

          ctx.transform(...transformations[tags.Orientation.value - 1]);

          // TODO scale (with pica?)
          cb(null, {
            id: this.nextId += 1,
            filename: file.name,
            dataURL: canvas.toDataURL(),
            coords: tags.GPSLatitude && tags.GPSLongitude ? {
              lat: tags.GPSLatitude.description, // TODO NS
              lon: tags.GPSLongitude.description, // TODO WE
            } : null,
            title: tags.title ? tags.title.description : tags.DocumentName ? tags.DocumentName.description : '',
            description: tags.description ? tags.description.description : tags.ImageDescription ? tags.ImageDescription.description : '',
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
      this.setState({
        results: [...this.state.results, ...results],
      });
    });
  }

  render() {
    const { shown, onClose } = this.props;
    if (!shown) {
      return null;
    }

    return (
      <Modal show bsSize="large" onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Nahrať obrázky</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="danger">
            Implementácia nahrávania obrázkov ešte nie je dokončená.
          </Alert>
          {
            this.state.results.map(({ id, filename, dataURL, coords, title, description }) => (
              <Thumbnail key={id} src={dataURL} alt={filename}>
                <FormGroup>
                  <ControlLabel>Názov</ControlLabel>
                  <FormControl type="text" value={title} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Popis</ControlLabel>
                  <FormControl componentClass="textarea" value={description} />
                </FormGroup>
                {coords && <p>{formatGpsCoord(coords.lat, 'SN')}, {formatGpsCoord(coords.lon, 'WE')}</p>}
                <Button>Odstráň</Button>
              </Thumbnail>
            ))
          }
          <Dropzone onDrop={this.handleFileDrop} accept=".jpg,.jpeg,.png" className="dropzone">
            <div>Potiahnite sem obrázky, alebo sem kliknite pre ich výber.</div>
          </Dropzone>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

function callbackify(reader, callback) {
  reader.onload = (result) => {
    callback(null, result);
  };
  reader.onerror = (err) => {
    callback(err);
  };
}

export default connect(
  state => ({
    shown: state.main.activeModal === 'gallery-upload',
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(GalleryUploadModal);
