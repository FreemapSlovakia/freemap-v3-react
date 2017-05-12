import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';

import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setTool, setActivePopup, closePopup } from 'fm3/actions/mainActions';
import { setTrackData, resetTrackViewer } from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/trackViewer.scss';

class TrackViewerMenu extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.trackGeojson && JSON.stringify(this.props.trackGeojson) !== JSON.stringify(newProps.trackGeojson)) {
      const geojsonBounds = L.geoJson(newProps.trackGeojson).getBounds();
      getMapLeafletElement().fitBounds(geojsonBounds);
    }
  }

  onFileDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = (event) => {
        const gpxAsString = event.target.result;
        this.props.onSetTrackGpx(gpxAsString);
        this.props.onClosePopup();
      };

      reader.onerror = (e) => {
        this.props.onLoadError(`Nepodarilo sa spracovať súbor: ${e && e.message}`);
      };
    }

    if (rejectedFiles.length) {
      this.props.onLoadError('Nesprávny formát súboru: Nahraný súbor musí mať príponu .gpx');
    }
  }

  render() {
    const { activePopup, onCancel, onLaunchPopup, onClosePopup } = this.props;

    return (
      <div>
        <Navbar.Form pullLeft>
          <Button onClick={() => onLaunchPopup('upload-track')}>
            <FontAwesomeIcon icon="upload" /> Nahrať trasu
          </Button>
        </Navbar.Form>
        <Nav>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
        </Nav>

        <Modal show={activePopup === 'upload-track'} onHide={onClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Nahrať záznam trasy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Dropzone onDrop={this.onFileDrop} multiple={false} accept=".gpx" className="dropzone">
              <div>Potiahnite sem .gpx súbor, alebo sem kliknite pre jeho výber.</div>
            </Dropzone>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onClosePopup}><Glyphicon glyph="remove" /> Zrušiť</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

TrackViewerMenu.propTypes = {
  activePopup: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onClosePopup: PropTypes.func.isRequired,
  onLaunchPopup: PropTypes.func.isRequired,
  onSetTrackGpx: PropTypes.func.isRequired,
  onLoadError: PropTypes.func.isRequired,
  // eslint-disable-next-line
  trackGeojson: PropTypes.object,
};

export default connect(
  state => ({
    activePopup: state.main.activePopup,
    trackGeojson: state.trackViewer.trackGeojson,
  }),
  dispatch => ({
    onCancel() {
      dispatch(resetTrackViewer(null));
      dispatch(setTool(null));
    },
    onLaunchPopup(popupName) {
      dispatch(setActivePopup(popupName));
    },
    onClosePopup() {
      dispatch(closePopup());
    },
    onSetTrackGpx(gpx) {
      dispatch(setTrackData(gpx));
    },
    onLoadError(message) {
      dispatch(toastsAdd({
        collapseKey: 'trackViewer.loadError',
        message,
        style: 'danger',
        timeout: 3000,
      }));
    },
  }),
)(TrackViewerMenu);
