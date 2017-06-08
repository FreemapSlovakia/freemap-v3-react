import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import strftime from 'strftime';

import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setTool, setActivePopup, closePopup } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerResetData, trackViewerResetTrackUID, trackViewerUploadTrack } from 'fm3/actions/trackViewerActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

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

    const userHasUploadedTrackAndWantsToShareIt = this.props.trackUID === null && newProps.trackUID != null;
    if (userHasUploadedTrackAndWantsToShareIt) {
      this.props.onLaunchPopup('track-viewer-share');
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
        this.props.onElevationChartClose();
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
    } else {
      this.props.onTrackViewerUploadTrack();
    }
  }

  toggleElevationChart = () => {
    const isActive = this.props.elevationChartTrackGeojson;
    if (isActive) {
      this.props.onElevationChartClose();
    } else {
      // this is bit confusing. TrackViewerMenu.props.trackGeojson is actually a feature set of geojsons (thought typically contains only one geojson), while in ElevationChart.props.trackGeojson we use first "real" feature, e.g. LineString
      this.props.onElevationChartSetTrackGeojson(this.props.trackGeojson.features[0]);
    }
  }

  trackGeojsonIsSuitableForElevationChart = () => {
    const trackGeojson = this.props.trackGeojson;
    if (trackGeojson && trackGeojson.features) {
      const firstGeojsonFeature = trackGeojson.features[0];
      const isLineString = firstGeojsonFeature && firstGeojsonFeature.geometry.type === 'LineString';
      return isLineString;
    }

    return false;
  }

  showTrackInfo = () => {
    const tableData = [];
    const startTime = new Date(this.props.startPoints[0].startTime);
    const finishTime = new Date(this.props.finishPoints[0].finishTime);
    const duration = new Date(finishTime - startTime);
    const lengthInKm = this.props.finishPoints[0].lengthInKm;

    const firstRealFeature = this.props.trackGeojson.features[0];
    const coords = firstRealFeature.geometry.coordinates;
    let minEle = Infinity;
    let maxEle = -Infinity;
    coords.forEach((latLonEle) => {
      const ele = latLonEle[2];
      if (ele < minEle) {
        minEle = ele;
      }
      if (maxEle < ele) {
        maxEle = ele;
      }
    });
    tableData.push(['čas štartu', strftime('%H:%M', startTime)]);
    tableData.push(['čas v cieli', strftime('%H:%M', finishTime)]);
    tableData.push(['trvanie', `${strftime('%k', duration)}h ${strftime('%M', duration)}m`]);
    tableData.push(['vzdialenosť', `${lengthInKm.toFixed(1)}km`]);
    tableData.push(['najvyšší bod', `${maxEle.toFixed(0)} m.n.m.`]);
    tableData.push(['najnižší bod', `${minEle.toFixed(0)} m.n.m.`]);
    const infoMessage = (
      <div className="trackInfo">
        <table className="trackInfoTable">
          <tbody>
            { tableData.map(labelAndValue => (
              <tr key={labelAndValue[0]}>
                <td>{labelAndValue[0]}:</td>
                <td className="infoValue">{labelAndValue[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    this.props.onShowTrackInfo(infoMessage);
  }

  render() {
    const { activePopup, onCancel, onLaunchPopup, onClosePopup, trackGpx, trackUID, elevationChartTrackGeojson } = this.props;

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
          {this.trackGeojsonIsSuitableForElevationChart() &&
            <Button active={elevationChartTrackGeojson !== null} onClick={this.toggleElevationChart}>
              <FontAwesomeIcon icon="bar-chart" /> Výškový profil
            </Button>
          }
          {' '}
          {this.trackGeojsonIsSuitableForElevationChart() &&
            <Button onClick={this.showTrackInfo}>
              <FontAwesomeIcon icon="info-circle" /> Viac info
            </Button>
          }
          {' '}
          {trackGpx &&
            <Button onClick={this.shareTrack}>
              <FontAwesomeIcon icon="share-alt" /> Zdieľať
            </Button>
          }
        </Navbar.Form>
        <Nav pullRight>
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
  onTrackViewerUploadTrack: PropTypes.func.isRequired,
  onTrackViewerSetData: PropTypes.func.isRequired,
  onLoadError: PropTypes.func.isRequired,
  onResetTrackUID: PropTypes.func.isRequired,
  trackGeojson: PropTypes.object,  // eslint-disable-line
  trackGpx: PropTypes.string,
  trackUID: PropTypes.string,
  onElevationChartSetTrackGeojson: PropTypes.func.isRequired,
  onElevationChartClose: PropTypes.func.isRequired,
  elevationChartTrackGeojson: PropTypes.object, // eslint-disable-line
  onShowTrackInfo: PropTypes.func.isRequired,
  startPoints: PropTypes.arrayOf(PropTypes.shape({
    startTime: PropTypes.string,
  })),
  finishPoints: PropTypes.arrayOf(PropTypes.shape({
    lengthInKm: PropTypes.number.isRequired,
    finishTime: PropTypes.string,
  })),
};

export default connect(
  state => ({
    activePopup: state.main.activePopup,
    trackGeojson: state.trackViewer.trackGeojson,
    trackGpx: state.trackViewer.trackGpx,
    startPoints: state.trackViewer.startPoints,
    finishPoints: state.trackViewer.finishPoints,
    trackUID: state.trackViewer.trackUID,
    elevationChartTrackGeojson: state.elevationChart.trackGeojson,
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackViewerResetData());
      dispatch(setTool(null));
      dispatch(elevationChartClose());
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
    onResetTrackUID() {
      dispatch(trackViewerResetTrackUID());
    },
    onTrackViewerUploadTrack() {
      dispatch(trackViewerUploadTrack());
    },
    onElevationChartSetTrackGeojson(trackGeojson) {
      dispatch(elevationChartSetTrackGeojson(trackGeojson));
    },
    onElevationChartClose() {
      dispatch(elevationChartClose());
    },
    onShowTrackInfo(message) {
      dispatch(toastsAdd({
        collapseKey: 'trackViewer.trackInfo',
        message,
        style: 'info',
      }));
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
