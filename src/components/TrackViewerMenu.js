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
import { trackViewerSetData, trackViewerSetTrackUID, trackViewerUploadTrack, trackViewerColorizeTrackBy, trackShowInfo } from 'fm3/actions/trackViewerActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import 'fm3/styles/trackViewer.scss';

class TrackViewerMenu extends React.Component {
  static propTypes = {
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
    colorizeTrackBy: PropTypes.oneOf(['elevation', 'steepness']),
    onColorizeTrackBy: PropTypes.func.isRequired,
    onShowTrackInfo: PropTypes.func.isRequired,
  }

  componentWillReceiveProps(newProps) {
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
    const { trackGeojson } = this.props;
    if (trackGeojson && trackGeojson.features) {
      const firstGeojsonFeature = trackGeojson.features[0];
      const isLineString = firstGeojsonFeature && firstGeojsonFeature.geometry.type === 'LineString';
      return isLineString;
    }

    return false;
  }

  render() {
    const { activeModal, onModalLaunch, onModalClose, trackGpx, trackUID, elevationChartTrackGeojson, colorizeTrackBy, onColorizeTrackBy,
      onShowTrackInfo } = this.props;

    let shareURL = '';
    if (trackUID) {
      shareURL = `${window.location.origin}/?track-uid=${trackUID}`;
    }

    return (
      <span>
        <span className="fm-label"><FontAwesomeIcon icon="road" /><span className="hidden-xs"> Prehliadač trás (GPX)</span></span>
        {' '}
        <Button onClick={() => onModalLaunch('upload-track')}>
          <FontAwesomeIcon icon="upload" />
          <span className="hidden-xs"> Nahrať</span>
        </Button>
        {' '}
        <Button
          active={elevationChartTrackGeojson !== null}
          onClick={this.toggleElevationChart}
          disabled={!this.trackGeojsonIsSuitableForElevationChart()}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="hidden-xs"> Výškovy profil</span>
        </Button>
        {' '}
        {elevationChartTrackGeojson &&
          <ButtonGroup>
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
          onClick={onShowTrackInfo}
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
              <Modal.Title>Nahrať trasu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Dropzone onDrop={this.handleFileDrop} multiple={false} accept=".gpx" className="dropzone" disablePreview>
                Potiahnite sem .gpx súbor, alebo sem kliknite pre jeho výber.
              </Dropzone>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={onModalClose}>
                <Glyphicon glyph="remove" /> Zrušiť
              </Button>
            </Modal.Footer>
          </Modal>
        }
        {activeModal === 'track-viewer-share' &&
          <Modal show onHide={onModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Zdieľať trasu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Trasa je dostupná na následovnej adrese:</p>
              <Alert>
                <a href={shareURL}>{shareURL}</a>
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={onModalClose}>
                <Glyphicon glyph="remove" /> Zavrieť
              </Button>
            </Modal.Footer>
          </Modal>
        }
      </span>
    );
  }
}

export default connect(
  state => ({
    activeModal: state.main.activeModal,
    trackGeojson: state.trackViewer.trackGeojson,
    trackGpx: state.trackViewer.trackGpx,
    trackUID: state.trackViewer.trackUID,
    elevationChartTrackGeojson: state.elevationChart.trackGeojson,
    colorizeTrackBy: state.trackViewer.colorizeTrackBy,
  }),
  dispatch => ({
    onModalLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onModalClose() {
      dispatch(setActiveModal(null));
    },
    onTrackViewerDataSet(trackGpx) {
      dispatch(trackViewerSetData({ trackGpx }));
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
    onShowTrackInfo() {
      dispatch(trackShowInfo());
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
