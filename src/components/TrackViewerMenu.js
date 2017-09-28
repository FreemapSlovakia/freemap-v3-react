import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';

import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerSetTrackUID, trackViewerUploadTrack, trackViewerColorizeTrackBy } from 'fm3/actions/trackViewerActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import { smoothElevations, distance } from 'fm3/geoutils';

import 'fm3/styles/trackViewer.scss';

const oneDecimalDigitNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const noDecimalDigitsNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const timeFormat = new Intl.DateTimeFormat('sk', { hour: 'numeric', minute: '2-digit' });

class TrackViewerMenu extends React.Component {
  // NOTE commented out because UX feels weird
  // componentWillMount() {
  //   const startingWithBlankTrackViewer = this.props.trackUID === null;
  //   if (startingWithBlankTrackViewer) {
  //     this.props.onModalLaunch('upload-track');
  //   }
  // }

  componentWillReceiveProps(newProps) {
    if (newProps.trackGeojson && JSON.stringify(this.props.trackGeojson) !== JSON.stringify(newProps.trackGeojson)) {
      const geojsonBounds = L.geoJson(newProps.trackGeojson).getBounds();
      if (geojsonBounds.isValid()) {
        getMapLeafletElement().fitBounds(geojsonBounds);
      }
    }

    const userHasUploadedTrackAndWantsToShareIt = this.props.trackUID === null && newProps.trackUID != null;
    if (userHasUploadedTrackAndWantsToShareIt) {
      this.props.onModalLaunch('track-viewer-share');
    }
  }

  handleFileDrop = (acceptedFiles, rejectedFiles) => {
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

  // TODO move to logic
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
    const startTime = this.props.startPoints[0].startTime;
    if (startTime) {
      tableData.push(['Čas štartu', timeFormat.format(new Date(startTime))]);
    }
    const finishTime = this.props.finishPoints[0].finishTime;
    if (finishTime) {
      tableData.push(['Čas v cieli', timeFormat.format(new Date(finishTime))]);
    }

    let duration = 0;
    if (startTime && finishTime) {
      duration = (new Date(finishTime) - new Date(startTime)) / 1000;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration - hours * 3600) / 60);
      tableData.push(['Trvanie', `${hours} hodín ${minutes} minút`]);
    }

    const lengthInKm = this.props.finishPoints[0].lengthInKm;
    tableData.push(['Vzdialenosť', `${oneDecimalDigitNumberFormat.format(lengthInKm)} km`]);

    if (duration) {
      const avgSpeed = lengthInKm / duration * 3600;
      tableData.push(['Priemerná rýchlosť', `${oneDecimalDigitNumberFormat.format(avgSpeed)} km/h`]);
    }

    const firstRealFeature = this.props.trackGeojson.features[0];
    let minEle = Infinity;
    let maxEle = -Infinity;
    let uphillEleSum = 0;
    let downhillEleSum = 0;
    const smoothedLatLonEles = smoothElevations(firstRealFeature, this.props.eleSmoothingFactor);
    let previousLatLonEle = smoothedLatLonEles[0];
    smoothedLatLonEles.forEach((latLonEle) => {
      const distanceFromPrevPointInMeters = distance(latLonEle[0], latLonEle[1], previousLatLonEle[0], previousLatLonEle[1]);
      if (10 * this.props.eleSmoothingFactor < distanceFromPrevPointInMeters) { // otherwise the ele sums are very high
        const ele = latLonEle[2];
        if (ele < minEle) {
          minEle = ele;
        }
        if (maxEle < ele) {
          maxEle = ele;
        }

        const eleDiff = ele - previousLatLonEle[2];
        if (eleDiff < 0) {
          downhillEleSum += eleDiff * -1;
        } else if (eleDiff > 0) {
          uphillEleSum += eleDiff;
        }
        previousLatLonEle = latLonEle;
      }
    });
    if (minEle !== Infinity) {
      tableData.push(['Najnižší bod', `${noDecimalDigitsNumberFormat.format(minEle)} m.n.m.`]);
    }
    if (maxEle !== -Infinity) {
      tableData.push(['Najvyšší bod', `${noDecimalDigitsNumberFormat.format(maxEle)} m.n.m.`]);
    }
    tableData.push(['Celkové stúpanie', `${noDecimalDigitsNumberFormat.format(uphillEleSum)} m`]);
    tableData.push(['Celkové klesanie', `${noDecimalDigitsNumberFormat.format(downhillEleSum)} m`]);
    const infoMessage = (
      <dl className="trackInfo dl-horizontal">
        {
          tableData.map(labelAndValue => ([
            <dt>{labelAndValue[0]}:</dt>,
            <dd className="infoValue">{labelAndValue[1]}</dd>,
          ]))
        }
      </dl>
    );
    this.props.onTrackInfoShow(infoMessage);
  }

  render() {
    const { activeModal, onModalLaunch, onModalClose, trackGpx, trackUID, elevationChartTrackGeojson, colorizeTrackBy, onColorizeTrackBy } = this.props;

    let shareURL = '';
    if (trackUID) {
      shareURL = `${window.location.origin}/?track-uid=${trackUID}`;
    }
    return (
      <span>
        <Button onClick={() => onModalLaunch('upload-track')}>
          <FontAwesomeIcon icon="upload" />
          <span className="hidden-xs"> Nahrať trasu</span>
        </Button>
        {' '}
        <Button
          active={elevationChartTrackGeojson !== null}
          onClick={this.toggleElevationChart}
          disabled={!this.trackGeojsonIsSuitableForElevationChart()}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="hidden-xs"> Výškový profil</span>
        </Button>
        {' '}
        {elevationChartTrackGeojson &&
          <ButtonGroup bsSize="small">
            <Button active={colorizeTrackBy === 'elevation'} onClick={() => onColorizeTrackBy('elevation')}>
              Nadm. výška
            </Button>
            <Button active={colorizeTrackBy === 'steepness'} onClick={() => onColorizeTrackBy('steepness')}>
              Sklon
            </Button>
          </ButtonGroup>
        }
        {' '}
        <Button
          onClick={this.showTrackInfo}
          disabled={!this.trackGeojsonIsSuitableForElevationChart()}
        >
          <FontAwesomeIcon icon="info-circle" />
          <span className="hidden-xs"> Viac info</span>
        </Button>
        {' '}
        <Button onClick={this.shareTrack} disabled={!trackGpx}>
          <FontAwesomeIcon icon="share-alt" />
          <span className="hidden-xs"> Zdieľať</span>
        </Button>

        {activeModal === 'upload-track' &&
          <Modal show onHide={onModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Nahrať záznam trasy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Dropzone onDrop={this.handleFileDrop} multiple={false} accept=".gpx" className="dropzone" disablePreview>
                <div>Potiahnite sem .gpx súbor, alebo sem kliknite pre jeho výber.</div>
              </Dropzone>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
            </Modal.Footer>
          </Modal>
        }
        {activeModal === 'track-viewer-share' &&
          <Modal show onHide={onModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Zdieľať záznam trasy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Trasa je dostupná na následovnej adrese:</p>
              <Alert>
                <a href={shareURL}>{shareURL}</a>
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
            </Modal.Footer>
          </Modal>
        }
      </span>
    );
  }
}

TrackViewerMenu.propTypes = {
  activeModal: PropTypes.string,
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
  colorizeTrackBy: PropTypes.oneOf(['elevation', 'steepness']),
  onColorizeTrackBy: PropTypes.func.isRequired,
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
    colorizeTrackBy: state.trackViewer.colorizeTrackBy,
  }),
  dispatch => ({
    onModalLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onModalClose() {
      dispatch(setActiveModal(null));
    },
    onTrackViewerDataSet(gpx) {
      dispatch(trackViewerSetData(gpx));
    },
    onTrackUIDReset() {
      dispatch(trackViewerSetTrackUID(null));
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
    onColorizeTrackBy(approach) {
      dispatch(trackViewerColorizeTrackBy(approach));
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
