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

import { setTool, setActiveModal, closeModal } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerResetData, trackViewerResetTrackUID, trackViewerUploadTrack } from 'fm3/actions/trackViewerActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/trackViewer.scss';

const oneDecimalDigitNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const noDecimalDigitsNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

class TrackViewerMenu extends React.Component {
  componentWillMount() {
    const startingWithBlankTrackViewer = this.props.trackUID === null;
    if (startingWithBlankTrackViewer) {
      this.props.onModalLaunch('upload-track');
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.trackGeojson && JSON.stringify(this.props.trackGeojson) !== JSON.stringify(newProps.trackGeojson)) {
      const geojsonBounds = L.geoJson(newProps.trackGeojson).getBounds();
      getMapLeafletElement().fitBounds(geojsonBounds);
    }

    const userHasUploadedTrackAndWantsToShareIt = this.props.trackUID === null && newProps.trackUID != null;
    if (userHasUploadedTrackAndWantsToShareIt) {
      this.props.onModalLaunch('track-viewer-share');
    }
  }

  onFileDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = (event) => {
        const gpxAsString = event.target.result;
        this.props.onTrackUIDReset();
        this.props.onTrackViewerDataSet(gpxAsString);
        this.props.onModalClose();
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

  // TODO mode to logic
  shareTrack = () => {
    if (this.props.trackUID) {
      this.props.onModalLaunch('track-viewer-share');
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
      this.props.onElevationChartTrackGeojsonSet(this.props.trackGeojson.features[0]);
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
    tableData.push(['čas štartu', strftime('%H:%M', startTime)]);
    const finishTime = new Date(this.props.finishPoints[0].finishTime);
    tableData.push(['čas v cieli', strftime('%H:%M', finishTime)]);
    const durationWithTimezone = new Date(finishTime - startTime);
    const duration = new Date(durationWithTimezone.getTime() + durationWithTimezone.getTimezoneOffset() * 60 * 1000);
    tableData.push(['trvanie', `${strftime('%k', duration)}h ${strftime('%M', duration)}m`]);
    const lengthInKm = this.props.finishPoints[0].lengthInKm;
    tableData.push(['vzdialenosť', `${oneDecimalDigitNumberFormat.format(lengthInKm)} km`]);
    const durationInHours = duration.getHours() + duration.getMinutes() / 60.0;
    const avgSpeed = lengthInKm / durationInHours;
    tableData.push(['priem. rýchlosť', `${oneDecimalDigitNumberFormat.format(avgSpeed)} km/h`]);
    const firstRealFeature = this.props.trackGeojson.features[0];
    const coords = firstRealFeature.geometry.coordinates;
    let minEle = Infinity;
    let maxEle = -Infinity;
    let uphillEleSum = 0;
    let downhillEleSum = 0;
    let previousFlotingWindowEle = null;
    coords.forEach((latLonEle, i) => {
      const ele = latLonEle[2];
      if (ele < minEle) {
        minEle = ele;
      }
      if (maxEle < ele) {
        maxEle = ele;
      }

      const floatingWindow = coords.slice(i, i + this.props.eleSmoothingFactor).filter(e => !!e).sort();
      let floatingWindowWithoutExtremes = floatingWindow;
      if (this.props.eleSmoothingFactor >= 5) { // ignore highest and smallest value
        floatingWindowWithoutExtremes = floatingWindow.splice(1, floatingWindow.length - 2);
      }

      const flotingWindowEle = floatingWindowWithoutExtremes.reduce((a, b) => a[2] || 0 + b[2], 0) / floatingWindowWithoutExtremes.length;
      let eleDiff = 0;
      if (previousFlotingWindowEle) {
        eleDiff = flotingWindowEle - previousFlotingWindowEle;
      }
      if (eleDiff < 0) {
        downhillEleSum += eleDiff * -1;
      } else if (eleDiff > 0) {
        uphillEleSum += eleDiff;
      }
      previousFlotingWindowEle = flotingWindowEle;
    });
    tableData.push(['najnižší bod', `${noDecimalDigitsNumberFormat.format(minEle)} m.n.m.`]);
    tableData.push(['najvyšší bod', `${noDecimalDigitsNumberFormat.format(maxEle)} m.n.m.`]);
    tableData.push(['celkové stúpanie', `${noDecimalDigitsNumberFormat.format(uphillEleSum)} m`]);
    tableData.push(['celkové klesanie', `${noDecimalDigitsNumberFormat.format(downhillEleSum)} m`]);
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
    this.props.onTrackInfoShow(infoMessage);
  }

  render() {
    const { activeModal, onCancel, onModalLaunch, onModalClose, trackGpx, trackUID, elevationChartTrackGeojson } = this.props;

    let shareURL = '';
    if (trackUID) {
      shareURL = `${window.location.origin}/?tool=track-viewer&track-uid=${trackUID}`;
    }
    return (
      <div>
        <Navbar.Form pullLeft>
          <Button onClick={() => onModalLaunch('upload-track')}>
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

        <Modal show={activeModal === 'upload-track'} onHide={onModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Nahrať záznam trasy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Dropzone onDrop={this.onFileDrop} multiple={false} accept=".gpx" className="dropzone">
              <div>Potiahnite sem .gpx súbor, alebo sem kliknite pre jeho výber.</div>
            </Dropzone>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={activeModal === 'track-viewer-share'} onHide={onModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Zdieľať záznam trasy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Trasa je dostupná na následovnej adrese:
            <Alert>
              <a href={shareURL}>{shareURL}</a>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

TrackViewerMenu.propTypes = {
  activeModal: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onModalLaunch: PropTypes.func.isRequired,
  onTrackViewerUploadTrack: PropTypes.func.isRequired,
  onTrackViewerDataSet: PropTypes.func.isRequired,
  onLoadError: PropTypes.func.isRequired,
  onTrackUIDReset: PropTypes.func.isRequired,
  trackGeojson: PropTypes.object,  // eslint-disable-line
  trackGpx: PropTypes.string,
  trackUID: PropTypes.string,
  onElevationChartTrackGeojsonSet: PropTypes.func.isRequired,
  onElevationChartClose: PropTypes.func.isRequired,
  elevationChartTrackGeojson: PropTypes.object, // eslint-disable-line
  onTrackInfoShow: PropTypes.func.isRequired,
  startPoints: PropTypes.arrayOf(PropTypes.shape({
    startTime: PropTypes.string,
  })),
  finishPoints: PropTypes.arrayOf(PropTypes.shape({
    lengthInKm: PropTypes.number.isRequired,
    finishTime: PropTypes.string,
  })),
  eleSmoothingFactor: PropTypes.number.isRequired,
};

export default connect(
  state => ({
    activeModal: state.main.activeModal,
    trackGeojson: state.trackViewer.trackGeojson,
    trackGpx: state.trackViewer.trackGpx,
    startPoints: state.trackViewer.startPoints,
    finishPoints: state.trackViewer.finishPoints,
    trackUID: state.trackViewer.trackUID,
    elevationChartTrackGeojson: state.elevationChart.trackGeojson,
    eleSmoothingFactor: state.trackViewer.eleSmoothingFactor,
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackViewerResetData());
      dispatch(setTool(null));
      dispatch(elevationChartClose());
    },
    onModalLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onModalClose() {
      dispatch(closeModal());
    },
    onTrackViewerDataSet(gpx) {
      dispatch(trackViewerSetData(gpx));
    },
    onTrackUIDReset() {
      dispatch(trackViewerResetTrackUID());
    },
    onTrackViewerUploadTrack() {
      dispatch(trackViewerUploadTrack());
    },
    onElevationChartTrackGeojsonSet(trackGeojson) {
      dispatch(elevationChartSetTrackGeojson(trackGeojson));
    },
    onElevationChartClose() {
      dispatch(elevationChartClose());
    },
    onTrackInfoShow(message) {
      dispatch(toastsAdd({
        collapseKey: 'trackViewer.trackInfo',
        message,
        cancelType: ['SET_TOOL', 'TRACK_VIEWER_SET_TRACK_DATA'],
        style: 'info',
      }));
    },
    onLoadError(message) {
      dispatch(toastsAdd({
        collapseKey: 'trackViewer.loadError',
        message,
        style: 'danger',
        timeout: 5000,
      }));
    },
  }),
)(TrackViewerMenu);
