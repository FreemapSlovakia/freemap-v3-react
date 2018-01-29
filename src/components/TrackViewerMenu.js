import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import injectL10n from 'fm3/l10nInjector';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackViewerUploadTrack, trackViewerColorizeTrackBy, trackViewerShowInfo, trackViewerToggleElevationChart } from 'fm3/actions/trackViewerActions';

import 'fm3/styles/trackViewer.scss';

class TrackViewerMenu extends React.Component {
  static propTypes = {
    hasTrack: PropTypes.bool,
    trackUID: PropTypes.string,
    elevationChartActive: PropTypes.bool,
    colorizeTrackBy: PropTypes.oneOf(['elevation', 'steepness']),
    trackGeojsonIsSuitableForElevationChart: PropTypes.bool.isRequired,
    onUpload: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onServerUpload: PropTypes.func.isRequired,
    onColorizeTrackBy: PropTypes.func.isRequired,
    onShowTrackInfo: PropTypes.func.isRequired,
    onToggleElevationChart: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  componentWillReceiveProps(newProps) {
    const userHasUploadedTrackAndWantsToShareIt = this.props.trackUID === null && newProps.trackUID !== null;
    if (userHasUploadedTrackAndWantsToShareIt) {
      this.props.onShare();
    }
  }

  // TODO move to logic
  shareTrack = () => {
    if (this.props.trackUID) {
      this.props.onShare();
    } else {
      this.props.onServerUpload();
    }
  }

  render() {
    const { onUpload, hasTrack, elevationChartActive, colorizeTrackBy, onColorizeTrackBy,
      onShowTrackInfo, trackGeojsonIsSuitableForElevationChart, onToggleElevationChart, t } = this.props;

    return (
      <React.Fragment>
        <span className="fm-label">
          <FontAwesomeIcon icon="road" />
          <span className="hidden-xs"> {t('tools.trackViewer')}</span>
        </span>
        {' '}
        <Button onClick={() => onUpload()}>
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
          id="colorizing_mode"
          title={
            <React.Fragment>
              <FontAwesomeIcon icon="paint-brush" /> {t(`trackViewer.colorizingMode.${colorizeTrackBy || 'none'}`)}
            </React.Fragment>
          }
        >
          {
            [null, 'elevation', 'steepness'].map(mode => (
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
      </React.Fragment>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      hasTrack: !!state.trackViewer.trackGeojson,
      trackUID: state.trackViewer.trackUID,
      elevationChartActive: !!state.elevationChart.trackGeojson,
      colorizeTrackBy: state.trackViewer.colorizeTrackBy,
      trackGeojsonIsSuitableForElevationChart: isSuitableForElevationChart(state),
    }),
    dispatch => ({
      onUpload() {
        dispatch(setActiveModal('upload-track'));
      },
      onServerUpload() {
        dispatch(trackViewerUploadTrack());
      },
      onColorizeTrackBy(approach) {
        dispatch(trackViewerColorizeTrackBy(approach));
      },
      onShowTrackInfo() {
        dispatch(trackViewerShowInfo());
      },
      onToggleElevationChart() {
        dispatch(trackViewerToggleElevationChart());
      },
      onShare() {
        dispatch(setActiveModal('track-viewer-share'));
      },
    }),
  ),
)(TrackViewerMenu);

function isSuitableForElevationChart(state) {
  const { trackGeojson } = state.trackViewer;
  if (trackGeojson && trackGeojson.features) {
    const firstGeojsonFeature = trackGeojson.features[0];
    return firstGeojsonFeature && firstGeojsonFeature.geometry.type === 'LineString';
  }

  return false;
}
