import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Dropzone from 'react-dropzone';

import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Alert from 'react-bootstrap/lib/Alert';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import injectL10n from 'fm3/l10nInjector';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerSetTrackUID, trackViewerUploadTrack, trackViewerColorizeTrackBy, trackViewerShowInfo, trackViewerToggleElevationChart } from 'fm3/actions/trackViewerActions';
import { elevationChartClose } from 'fm3/actions/elevationChartActions';
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
    hasTrack: PropTypes.bool,
    trackUID: PropTypes.string,
    onElevationChartClose: PropTypes.func.isRequired,
    elevationChartActive: PropTypes.bool,
    colorizeTrackBy: PropTypes.oneOf(['elevation', 'steepness']),
    onColorizeTrackBy: PropTypes.func.isRequired,
    onShowTrackInfo: PropTypes.func.isRequired,
    onToggleElevationChart: PropTypes.func.isRequired,
    trackGeojsonIsSuitableForElevationChart: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
  }

  componentWillReceiveProps(newProps) {
    const userHasUploadedTrackAndWantsToShareIt = this.props.trackUID === null && newProps.trackUID !== null;
    if (userHasUploadedTrackAndWantsToShareIt) {
      this.props.onModalLaunch('track-viewer-share');
    }
  }

  handleFileDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
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

  render() {
    const { activeModal, onModalLaunch, onModalClose, hasTrack, trackUID, elevationChartActive, colorizeTrackBy, onColorizeTrackBy,
      onShowTrackInfo, trackGeojsonIsSuitableForElevationChart, onToggleElevationChart, t } = this.props;

    const shareURL = trackUID ? `${window.location.origin}/?track-uid=${trackUID}` : '';

    const colorizingModes = [null, 'elevation', 'steepness'];

    return (
      <React.Fragment>
        <span className="fm-label">
          <FontAwesomeIcon icon="road" />
          <span className="hidden-xs"> {t('tools.trackViewer')}</span>
        </span>
        {' '}
        <Button onClick={() => onModalLaunch('upload-track')}>
          <FontAwesomeIcon icon="upload" />
          <span className="hidden-xs"> {t('trackViewer.upload')}</span>
        </Button>
        {' '}
        <Button
          active={elevationChartActive}
          onClick={onToggleElevationChart}
          disabled={!trackGeojsonIsSuitableForElevationChart}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="hidden-xs"> {t('general.elevationProfile')}</span>
        </Button>
        {' '}
        <DropdownButton
          title={
            <React.Fragment>
              <FontAwesomeIcon icon="paint-brush" /> {t(`trackViewer.colorizingMode.${colorizeTrackBy || 'none'}`)}
            </React.Fragment>
          }
          id="colorizing_mode"
        >
          {
            colorizingModes.map(mode => (
              <MenuItem
                eventKey={mode}
                key={mode || 'none'}
                active={mode === colorizeTrackBy}
                onClick={() => onColorizeTrackBy(mode)}
              >
                {t(`trackViewer.colorizingMode.${mode || 'none'}`)}
              </MenuItem>
            ))
          }
        </DropdownButton>
        {' '}
        <Button
          onClick={onShowTrackInfo}
          disabled={!trackGeojsonIsSuitableForElevationChart}
        >
          <FontAwesomeIcon icon="info-circle" />
          <span className="hidden-xs"> {t('trackViewer.moreInfo')}</span>
        </Button>
        {' '}
        <Button onClick={this.shareTrack} disabled={!hasTrack}>
          <FontAwesomeIcon icon="share-alt" />
          <span className="hidden-xs"> {t('trackViewer.share')}</span>
        </Button>

        {activeModal === 'upload-track' && // TODO move to separate component
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
        {activeModal === 'track-viewer-share' && // TODO move to separate component
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
      </React.Fragment>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      activeModal: state.main.activeModal,
      hasTrack: !!state.trackViewer.trackGeojson,
      trackUID: state.trackViewer.trackUID,
      elevationChartActive: !!state.elevationChart.trackGeojson,
      colorizeTrackBy: state.trackViewer.colorizeTrackBy,
      trackGeojsonIsSuitableForElevationChart: x(state),
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
      onElevationChartClose() {
        dispatch(elevationChartClose());
      },
      onColorizeTrackBy(approach) {
        dispatch(trackViewerColorizeTrackBy(approach));
      },
      onShowTrackInfo() {
        dispatch(trackViewerShowInfo());
      },
      onLoadError(message) {
        dispatch(toastsAdd({
          collapseKey: 'trackViewer.loadError',
          message,
          style: 'danger',
          timeout: 5000,
        }));
      },
      onToggleElevationChart() {
        dispatch(trackViewerToggleElevationChart());
      },
    }),
  ),
)(TrackViewerMenu);

function x(state) {
  const { trackGeojson } = state.trackViewer;
  if (trackGeojson && trackGeojson.features) {
    const firstGeojsonFeature = trackGeojson.features[0];
    return firstGeojsonFeature && ['LineString', 'MultiLineString'].includes(firstGeojsonFeature.geometry.type);
  }

  return false;
}
