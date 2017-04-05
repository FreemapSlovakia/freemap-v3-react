import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import { setTool, setActivePopup, closePopup } from 'fm3/actions/mainActions';
import setTrackGeojson from 'fm3/actions/trackViewerActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import toGeoJSON from '@mapbox/togeojson';
import 'fm3/styles/trackViewer.scss';

const DOMParser = require('xmldom').DOMParser;

class TrackViewerMenu extends React.Component {
  onFileDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = (evt) => {
        const gpxAsString = evt.target.result;
        const gpxAsXml = new DOMParser().parseFromString(gpxAsString);
        const geojson = toGeoJSON.gpx(gpxAsXml);
        this.props.onSetTrackGeojson(geojson);
        const geojsonBounds = L.geoJson(geojson).getBounds();
        getMapLeafletElement().fitBounds(geojsonBounds);
        this.props.onClosePopup();
      };
    }

    if (rejectedFiles.length > 0) {
      // TODO
    }
  }

  render() {
    const { activePopup, onCancel, onLaunchPopup, onClosePopup } = this.props;
    return (
      <div>
        <Nav>
          <Navbar.Form pullLeft>
            <Button onClick={() => onLaunchPopup('upload-track')}>
              <FontAwesomeIcon icon="upload" /> Nahrať trasu
            </Button>
          </Navbar.Form>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
        </Nav>

        <Modal show={activePopup === 'upload-track'} onHide={onClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Nahrať záznam trasy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Dropzone onDrop={this.onFileDrop} multiple={false} accept=".gpx" className="dropzone">
              <div>Potiahnite sem GPX súbor (alebo kliknite sem pre výber súboru).</div>
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
  activePopup: React.PropTypes.string,
  onCancel: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired,
  onLaunchPopup: React.PropTypes.func.isRequired,
  onSetTrackGeojson: React.PropTypes.func.isRequired,
};

export default connect(
  state => ({
    activePopup: state.main.activePopup,
  }),
  dispatch => ({
    onCancel() {
      dispatch(setTrackGeojson(null));
      dispatch(setTool(null));
    },
    onLaunchPopup(popupName) {
      dispatch(setActivePopup(popupName));
    },
    onClosePopup() {
      dispatch(closePopup());
    },
    onSetTrackGeojson(geojson) {
      dispatch(setTrackGeojson(geojson));
    },
  }),
)(TrackViewerMenu);
