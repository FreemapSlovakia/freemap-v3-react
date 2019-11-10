import * as React from 'react';
import { connect } from 'react-redux';
import { Polyline, Tooltip, Circle } from 'react-leaflet';
import { RichMarker } from 'fm3/components/RichMarker';
import { trackingActions } from 'fm3/actions/trackingActions';
import { distance, toLatLng, toLatLngArr } from 'fm3/geoutils';
import { TrackPoint } from 'fm3/types/trackingTypes';
import {
  TrackingPoint,
  tooltipText,
} from 'fm3/components/tracking/TrackingPoint';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface State {
  activePoint: TrackPoint | null;
}

// TODO functional component with hooks was causing massive re-rendering
class TrackingResultInt extends React.Component<Props, State> {
  clickHandlerMemo: { [id: string]: () => void } = {};

  state: State = {
    activePoint: null,
  };

  handleActivePointSet = (activePoint: TrackPoint | null) => {
    this.setState({
      activePoint,
    });
  };

  render() {
    const {
      tracks,
      showLine,
      showPoints,
      language,
      activeTrackId,
    } = this.props;

    const df = new Intl.DateTimeFormat(language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const nf = Intl.NumberFormat(language, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    return tracks.map(track => {
      const color = track.color || '#7239a8';
      const width = track.width || 4;

      let handleClick = this.clickHandlerMemo[track.id];
      if (!handleClick) {
        handleClick = () => {
          this.props.onFocus(track.id);
        };
        this.clickHandlerMemo[track.id] = handleClick;
      }

      const segments: TrackPoint[][] = [];
      let curSegment: TrackPoint[] | null = null;
      let prevTp: TrackPoint | undefined;

      for (const tp of track.trackPoints) {
        if (
          prevTp &&
          ((typeof track.splitDistance === 'number' &&
            distance(tp.lat, tp.lon, prevTp.lat, prevTp.lon) >
              track.splitDistance) ||
            (typeof track.splitDuration === 'number' &&
              tp.ts.getTime() - prevTp.ts.getTime() >
                track.splitDuration * 60000))
        ) {
          curSegment = null;
        }

        if (!curSegment) {
          curSegment = [];
          segments.push(curSegment);
        }

        curSegment.push(tp);
        prevTp = tp;
      }

      const lastPoint =
        track.trackPoints.length > 0
          ? track.trackPoints[track.trackPoints.length - 1]
          : null;

      return (
        <React.Fragment key={`trk-${track.id}`}>
          {lastPoint && typeof lastPoint.accuracy === 'number' && (
            <Circle
              weight={2}
              interactive={false}
              center={toLatLng(lastPoint)}
              radius={lastPoint.accuracy}
            />
          )}

          {this.state.activePoint &&
            lastPoint !== this.state.activePoint &&
            typeof this.state.activePoint.accuracy === 'number' && (
              <Circle
                weight={2}
                interactive={false}
                center={toLatLng(this.state.activePoint)}
                radius={this.state.activePoint.accuracy}
              />
            )}

          {showLine &&
            track.trackPoints.length > 1 &&
            segments.map((segment, i) => (
              <Polyline
                key={`seg-${i}`}
                positions={toLatLngArr(segment)}
                weight={width}
                color={color}
                onClick={handleClick}
              />
            ))}

          {(showPoints || track.trackPoints.length === 0
            ? track.trackPoints
            : [track.trackPoints[track.trackPoints.length - 1]]
          ).map((tp, i) =>
            !showPoints || i === track.trackPoints.length - 1 ? (
              <RichMarker
                key={tp.id}
                position={toLatLon(
                  track.trackPoints[track.trackPoints.length - 1],
                )}
                color={color}
                onclick={handleClick}
                faIcon={track.id === activeTrackId ? 'user' : 'user-o'}
              >
                <Tooltip direction="top" offset={[0, -36]} permanent>
                  {tooltipText(df, nf, tp, track.label)}
                </Tooltip>
              </RichMarker>
            ) : (
              <TrackingPoint
                key={tp.id}
                tp={tp}
                width={width}
                color={color}
                language={language}
                onActivePointSet={this.handleActivePointSet}
                onClick={handleClick}
              />
            ),
          )}
        </React.Fragment>
      );
    });
  }
}

function toLatLon(x: TrackPoint) {
  return { lat: x.lat, lng: x.lon };
}

const mapStateToProps = (state: RootState) => {
  const tdMap = new Map(state.tracking.trackedDevices.map(td => [td.id, td]));
  return {
    tracks: state.tracking.tracks.map(track => ({
      ...track,
      ...(tdMap.get(track.id) || {}),
    })),
    showLine: state.tracking.showLine,
    showPoints: state.tracking.showPoints,
    activeTrackId: state.tracking.activeTrackId,
    language: state.l10n.language,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onFocus(id: string | number) {
    dispatch(trackingActions.setActive(id));
  },
});

export const TrackingResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TrackingResultInt);
