import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';

import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal, clearMap } from 'fm3/actions/mainActions';
import {
  trackViewerUploadTrack,
  trackViewerColorizeTrackBy,
  trackViewerToggleElevationChart,
  ColorizingMode,
  trackViewerSetData,
} from 'fm3/actions/trackViewerActions';

import 'fm3/styles/trackViewer.scss';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import TrackViewerDetails from './TrackViewerDetails';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

class TrackViewerMenu extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.trackUID === null && this.props.trackUID !== null) {
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
  };

  render() {
    const {
      onUpload,
      hasTrack,
      elevationChartActive,
      colorizeTrackBy,
      onColorizeTrackBy,
      onShowTrackInfo,
      trackGeojsonIsSuitableForElevationChart,
      onToggleElevationChart,
      t,
    } = this.props;

    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="road" />
          <span className="hidden-xs"> {t('tools.trackViewer')}</span>
        </span>{' '}
        <Button onClick={() => onUpload()}>
          <FontAwesomeIcon icon="upload" />
          <span className="hidden-xs"> {t('trackViewer.upload')}</span>
        </Button>{' '}
        <Button
          active={elevationChartActive}
          onClick={onToggleElevationChart}
          disabled={!trackGeojsonIsSuitableForElevationChart}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="hidden-xs"> {t('general.elevationProfile')}</span>
        </Button>{' '}
        <DropdownButton
          id="colorizing_mode"
          title={
            <>
              <FontAwesomeIcon icon="paint-brush" />{' '}
              {t(`trackViewer.colorizingMode.${colorizeTrackBy || 'none'}`)}
            </>
          }
        >
          {([null, 'elevation', 'steepness'] as const).map(mode => (
            <MenuItem
              eventKey={mode}
              key={mode || 'none'}
              active={mode === colorizeTrackBy}
              onClick={() => onColorizeTrackBy(mode)}
            >
              {t(`trackViewer.colorizingMode.${mode || 'none'}`)}
            </MenuItem>
          ))}
        </DropdownButton>{' '}
        <Button
          onClick={onShowTrackInfo}
          disabled={!trackGeojsonIsSuitableForElevationChart}
        >
          <FontAwesomeIcon icon="info-circle" />
          <span className="hidden-xs"> {t('trackViewer.moreInfo')}</span>
        </Button>{' '}
        <Button onClick={this.shareTrack} disabled={!hasTrack}>
          <FontAwesomeIcon icon="share-alt" />
          <span className="hidden-xs"> {t('trackViewer.share')}</span>
        </Button>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  hasTrack: !!state.trackViewer.trackGeojson,
  trackUID: state.trackViewer.trackUID,
  elevationChartActive: !!state.elevationChart.trackGeojson,
  colorizeTrackBy: state.trackViewer.colorizeTrackBy,
  trackGeojsonIsSuitableForElevationChart: isSuitableForElevationChart(state),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onUpload() {
    dispatch(setActiveModal('upload-track'));
  },
  onServerUpload() {
    dispatch(trackViewerUploadTrack());
  },
  onColorizeTrackBy(approach: ColorizingMode | null) {
    dispatch(trackViewerColorizeTrackBy(approach));
  },
  onShowTrackInfo() {
    dispatch(
      toastsAdd({
        collapseKey: 'trackViewer.trackInfo',
        message: <TrackViewerDetails />, // TODO only string
        cancelType: [getType(clearMap), getType(trackViewerSetData)],
        style: 'info',
      }),
    );
  },
  onToggleElevationChart() {
    dispatch(trackViewerToggleElevationChart());
  },
  onShare() {
    dispatch(setActiveModal('track-viewer-share'));
  },
});

export default compose(
  withTranslator,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(TrackViewerMenu);

function isSuitableForElevationChart(state: RootState) {
  const { trackGeojson } = state.trackViewer;
  if (trackGeojson && trackGeojson.features) {
    const firstGeojsonFeature = trackGeojson.features[0];
    return (
      firstGeojsonFeature && firstGeojsonFeature.geometry.type === 'LineString'
    );
  }

  return false;
}
