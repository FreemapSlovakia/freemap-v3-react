import React from 'react';
import Dropzone from 'react-dropzone';
import piexif from 'piexifjs';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ExifReader from 'exifreader';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Thumbnail from 'react-bootstrap/lib/Thumbnail';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Alert from 'react-bootstrap/lib/Alert';

import { toPromise } from 'fm3/PromisedReader';
import { formatGpsCoord } from 'fm3/geoutils';

import { setActiveModal } from 'fm3/actions/mainActions';

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
    let n = 0;
    const results = [];

    const fileLoadSuccessHandler = (e) => {
      const { id, file, result } = e.target;
      const exif = piexif.load(result);
      const gps = exif.GPS;
      let coords = null;
      if (gps[piexif.GPSIFD.GPSVersionID]) {
        const lat = (gps[piexif.GPSIFD.GPSLatitudeRef] === 'N' ? 1 : -1) * toCoord(gps[piexif.GPSIFD.GPSLatitude]);
        const lon = (gps[piexif.GPSIFD.GPSLongitudeRef] === 'E' ? 1 : -1) * toCoord(gps[piexif.GPSIFD.GPSLongitude]);
        coords = { lat, lon };
      }

      const zeroth = exif['0th'];
      results.push({ id,
        filename: file.name,
        dataURL: result,
        coords,
        title: zeroth[piexif.ImageIFD.DocumentName] || '',
        description: zeroth[piexif.ImageIFD.ImageDescription] || '',
      });
      handle();
    };

    const fileLoadErrorHandler = () => {
      handle();
    };

    const handle = () => {
      n -= 1;
      if (n === 0) {
        this.setState({
          results: [...this.state.results, ...results],
        });
      }
    };

    const loadImg = (file) => {
      const img = new Image();
      const p = toPromise(img);
      const url = URL.createObjectURL(file);
      img.src = url;
      return p.then((result) => {
        URL.revokeObjectURL(url);
        return result;
      }, (err) => {
        URL.revokeObjectURL(url);
        throw err;
      });
      // img.onload = () => {
      //   URL.revokeObjectURL(url);
      //   const canvas = document.createElement('canvas');
      //   canvas.width = this.naturalWidth;
      //   canvas.height = this.naturalHeight;
      //   canvas.getContext('2d').drawImage(img, 0, 0);
      //   results.push({
      //     id: this.nextId,
      //     filename: file.name,
      //     dataURL: canvas.toDataURL('image/jpeg'),
      //     coords: null,
      //     title: null, // zeroth[piexif.ImageIFD.DocumentName] || '',
      //     description: null, // zeroth[piexif.ImageIFD.ImageDescription] || '',
      //   });
      //   this.nextId += 1;
      //   handle();
      // };
      // img.onerror = () => {
      //   URL.revokeObjectURL(url);
      //   handle();
      // };
      // img.src = url;
    };

    const loadData = (file) => {
      const reader = new FileReader();
      const p = toPromise(reader);
      reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
      return p;
      // reader.id = this.nextId;
      // this.nextId += 1;
      // reader.file = file;
      // reader.onload = fileLoadSuccessHandler;
      // reader.onerror = fileLoadErrorHandler;
      // n += 1;
    };

    Promise.all(acceptedFiles.map(file => loadData(file))).then((headers) => {
      // TODO
    });

    Promise.all(acceptedFiles.map(file => loadImg(file))).then((headers) => {
      // TODO
    });

    acceptedFiles.forEach((file) => {
      loadImg(file);
      loadData(file);
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

function toCoord(raw) {
  return raw[0][0] / raw[0][1] + raw[1][0] / raw[1][1] / 60 + raw[2][0] / raw[2][1] / 3600;
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
