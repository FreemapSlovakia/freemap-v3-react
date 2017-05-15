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
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setTool, setActivePopup, closePopup } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerResetData, trackViewerSetTrackUID, trackViewerResetTrackUID } from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { getNodejsBackendURL, MAX_GPX_TRACK_SIZE_IN_MB } from 'fm3/backendDefinitions';
import 'whatwg-fetch';
import 'fm3/styles/trackViewer.scss';

class TrackViewerMenu extends React.Component {
  componentWillMount() {
    const startingWithBlankTrackViewer = this.props.trackUID === null;
    if (startingWithBlankTrackViewer) {
      this.props.onLaunchPopup('upload-track');
    }
  }

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
        this.props.onResetTrackUID();
        this.props.onTrackViewerSetData(gpxAsString);
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

  shareTrack = () => {
    if (this.props.trackUID) {
      this.props.onLaunchPopup('track-viewer-share');
    } else if (this.props.trackGpx.length > (MAX_GPX_TRACK_SIZE_IN_MB * 1000000)) {
      this.props.onLoadError(`Veľkosť nahraného súboru prevyšuje ${MAX_GPX_TRACK_SIZE_IN_MB}MB. Zdieľanie podporujeme len pre menšie súbory.`);
    } else {
      fetch(`${getNodejsBackendURL()}/tracklogs`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: btoa(this.props.trackGpx),
          mediaType: 'application/gpx+xml',
        }),
      }).then(res => res.json())
      .then((res) => {
        this.props.onSetTrackUID(res.uid);
        this.props.onLaunchPopup('track-viewer-share');
      }).catch((e) => {
        this.props.onLoadError(`Nepodarilo sa nahrať súbor: ${e}`);
      });
    }
  }

  render() {
    const { activePopup, onCancel, onLaunchPopup, onClosePopup, trackGpx, trackUID } = this.props;

    let shareURL = '';
    if (trackUID) {
      shareURL = `${window.location.origin}/?tool=track-viewer&track-uid=${trackUID}`;
    }
    return (
      <div>
        <Navbar.Form pullLeft>
          <Button onClick={() => onLaunchPopup('upload-track')}>
            <FontAwesomeIcon icon="upload" /> Nahrať trasu
          </Button>
          {' '}
          {trackGpx &&
            <Button onClick={this.shareTrack}>
              <FontAwesomeIcon icon="share-alt" /> Zdieľať
            </Button>
          }
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

        <Modal show={activePopup === 'track-viewer-share'} onHide={onClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Zdieľať záznam trasy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Trasa je dostupná na nasledovnej adrese:
            <Alert>
              <a href={shareURL}>{shareURL}</a>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onClosePopup}><Glyphicon glyph="remove" /> Zavrieť</Button>
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
  onTrackViewerSetData: PropTypes.func.isRequired,
  onLoadError: PropTypes.func.isRequired,
  onSetTrackUID: PropTypes.func.isRequired,
  onResetTrackUID: PropTypes.func.isRequired,
  trackGeojson: PropTypes.object,  // eslint-disable-line
  trackGpx: PropTypes.string,
  trackUID: PropTypes.string,
};

export default connect(
  state => ({
    activePopup: state.main.activePopup,
    trackGeojson: state.trackViewer.trackGeojson,
    trackGpx: state.trackViewer.trackGpx,
    trackUID: state.trackViewer.trackUID,
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackViewerResetData());
      dispatch(setTool(null));
    },
    onLaunchPopup(popupName) {
      dispatch(setActivePopup(popupName));
    },
    onClosePopup() {
      dispatch(closePopup());
    },
    onTrackViewerSetData(gpx) {
      dispatch(trackViewerSetData(gpx));
    },
    onSetTrackUID(uid) {
      dispatch(trackViewerSetTrackUID(uid));
    },
    onResetTrackUID() {
      dispatch(trackViewerResetTrackUID());
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
