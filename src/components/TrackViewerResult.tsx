import { distance } from '@turf/distance';
import { flatten } from '@turf/flatten';
import { getCoords } from '@turf/invariant';
import { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { LatLngExpression, Point as LPoint } from 'leaflet';
import { Fragment, ReactElement } from 'react';
import { FaFlag, FaPlay, FaStop } from 'react-icons/fa';
import { Polyline, Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { setTool } from '../actions/mainActions.js';
import { ElevationChartActivePoint } from '../components/ElevationChartActivePoint.js';
import { Hotline } from '../components/Hotline.js';
import { RichMarker } from '../components/RichMarker.js';
import { colors } from '../constants.js';
import { formatDistance } from '../distanceFormatter.js';
import { smoothElevations } from '../geoutils.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useDateTimeFormat } from '../hooks/useDateTimeFormat.js';
import { useStartFinishPoints } from '../hooks/useStartFinishPoints.js';
import { selectingModeSelector } from '../selectors/mainSelectors.js';

interface GetFeatures {
  (type: 'LineString'): Feature<LineString>[];
  (type: 'Point'): Feature<Point>[];
}

export default TrackViewerResult;

export function TrackViewerResult({
  trackGeojson,
}: {
  trackGeojson: FeatureCollection;
}): ReactElement | null {
  const language = useAppSelector((state) => state.l10n.language);

  const [startPoints, finishPoints] = useStartFinishPoints();

  const displayingElevationChart = useAppSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const colorizeTrackBy = useAppSelector(
    (state) => state.trackViewer.colorizeTrackBy,
  );

  const eleSmoothingFactor = 5;

  const getFeatures: GetFeatures = (type: 'LineString' | 'Point') =>
    flatten(trackGeojson).features.filter((f) => f.geometry?.type === type);

  const getColorLineDataForElevation = () =>
    getFeatures('LineString').map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), eleSmoothingFactor);

      const eles = smoothed.map((coord) => coord[2]);

      const maxEle = Math.max(...eles);

      const minEle = Math.min(...eles);

      return smoothed.map((coord): LatLngExpression => {
        const color = (coord[2] - minEle) / (maxEle - minEle);

        return [coord[1], coord[0], color || 0];
      });
    });

  const getColorLineDataForSteepness = () =>
    getFeatures('LineString').map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), eleSmoothingFactor);

      let prevCoord = smoothed[0];

      return smoothed.map((coord): LatLngExpression => {
        const [lon, lat, ele] = coord;

        const d = distance([lon, lat], prevCoord, { units: 'meters' });

        let angle = 0;

        if (d > 0) {
          angle = (ele - prevCoord[2]) / d;
        }

        prevCoord = coord;

        const color = angle / 0.5 + 0.5;

        return [lat, lon, color || 0];
      });
    });

  const interactive = useAppSelector(selectingModeSelector);

  const dispatch = useDispatch();

  const setThisTool = () => {
    dispatch(setTool('track-viewer'));
  };

  // TODO rather compute some hash or better - detect real change
  const keyToAssureProperRefresh = `OOXlDWrtVn-${
    (JSON.stringify(trackGeojson) + displayingElevationChart).length
  }`; // otherwise GeoJSON will still display the first data

  const features = getFeatures('LineString').map((feature) => ({
    name: feature.properties && feature.properties['name'],
    lineData: feature.geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
    })),
  }));

  const timeFormat = useDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Fragment key={keyToAssureProperRefresh}>
      {features.map(({ lineData, name }, i) => (
        <Polyline
          key={`outline-${i}-${interactive ? 'a' : 'b'}`}
          weight={10}
          interactive={interactive}
          positions={lineData}
          color="#fff"
          bubblingMouseEvents={false}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          {name && (
            <Tooltip className="compact" direction="top" permanent>
              <span>{name}</span>
            </Tooltip>
          )}
        </Polyline>
      ))}

      {colorizeTrackBy &&
        (colorizeTrackBy === 'elevation'
          ? getColorLineDataForElevation()
          : getColorLineDataForSteepness()
        ).map((positions, i) => (
          <Hotline
            key={`${colorizeTrackBy}-${i}`}
            positions={positions}
            palette={
              colorizeTrackBy === 'elevation'
                ? { 0.0: 'black', 0.5: '#838', 1.0: 'white' }
                : { 0.0: 'green', 0.5: 'white', 1.0: 'red' }
            }
            weight={6}
            outlineWidth={0}
          />
        ))}

      {colorizeTrackBy === null && (
        <Polyline
          key={`poly-${interactive ? 'a' : 'b'}`}
          weight={6}
          interactive={interactive}
          positions={features.map(({ lineData }) => lineData)}
          color="#838"
          bubblingMouseEvents={false}
          eventHandlers={{
            click: setThisTool,
          }}
        />
      )}

      {getFeatures('Point').map(({ geometry, properties }, i) => (
        <RichMarker
          faIcon={<FaFlag color={colors.normal} />}
          key={`point-${i}-${interactive ? 'a' : 'b'}`}
          interactive={interactive}
          position={{
            lat: geometry.coordinates[1],
            lng: geometry.coordinates[0],
          }}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          {properties?.['name'] && (
            <Tooltip
              className="compact"
              offset={new LPoint(10, 10)}
              direction="right"
              permanent
            >
              <span>{properties['name']}</span>
            </Tooltip>
          )}
        </RichMarker>
      ))}

      {startPoints.map((p, i) => (
        <RichMarker
          faIcon={<FaPlay color="#409a40" />}
          key={`sp-${i}-${interactive ? 'a' : 'b'}`}
          color="#409a40"
          interactive={interactive}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          {p.startTime && !isNaN(new Date(p.startTime).getTime()) && (
            <Tooltip
              className="compact"
              offset={new LPoint(10, 10)}
              direction="right"
              permanent
            >
              <span>{timeFormat.format(new Date(p.startTime))}</span>
            </Tooltip>
          )}
        </RichMarker>
      ))}

      {finishPoints.map((p, i) => (
        <RichMarker
          faIcon={<FaStop color="#d9534f" />}
          key={`fp-${i}-${interactive ? 'a' : 'b'}`}
          color="#d9534f"
          interactive={interactive}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          <Tooltip
            className="compact"
            offset={new LPoint(10, 10)}
            direction="right"
            permanent
          >
            <span>
              {p.finishTime && !isNaN(new Date(p.finishTime).getTime()) && (
                <>
                  {p.finishTime
                    ? timeFormat.format(new Date(p.finishTime))
                    : null}
                  {p.finishTime ? ', ' : ''}
                </>
              )}
              {formatDistance(p.length, language)}
            </span>
          </Tooltip>
        </RichMarker>
      ))}

      <ElevationChartActivePoint />
    </Fragment>
  );
}
