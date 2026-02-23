import { setTool } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { smoothElevations } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { distance } from '@turf/distance';
import { flatten } from '@turf/flatten';
import { getCoords } from '@turf/invariant';
import { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { Point as LPoint } from 'leaflet';
import { Fragment, ReactElement } from 'react';
import { FaFlag, FaPlay, FaStop } from 'react-icons/fa';
import { Polyline, Tooltip } from 'react-leaflet';
import { Hotline } from 'react-leaflet-hotline';
import { useDispatch } from 'react-redux';
import { colors } from '../../../constants.js';
import { formatDistance } from '../../../shared/distanceFormatter.js';
import { useStartFinishPoints } from '../hooks/useStartFinishPoints.js';

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

      return smoothed.map((coord) => {
        const color = (coord[2] - minEle) / (maxEle - minEle);

        return { lat: coord[1], lon: coord[0], color };
      });
    });

  const getColorLineDataForSteepness = () =>
    getFeatures('LineString').map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), eleSmoothingFactor);

      let prevCoord = smoothed[0];

      return smoothed.map((coord) => {
        const [lon, lat, ele] = coord;

        const d = distance([lon, lat], prevCoord, { units: 'meters' });

        let angle = 0;

        if (d > 0) {
          angle = (ele - prevCoord[2]) / d;
        }

        prevCoord = coord;

        const color = angle / 0.5 + 0.5;

        return { lat, lon, color };
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
            data={positions}
            getVal={(p) => p.point.color}
            getLat={(p) => p.point.lat}
            getLng={(p) => p.point.lon}
            options={{
              weight: 6,
              outlineWidth: 0,
              palette:
                colorizeTrackBy === 'elevation'
                  ? [
                      { r: 0, g: 0, b: 0, t: 0.0 },
                      { r: 128, g: 128, b: 128, t: 0.5 },
                      { r: 255, g: 255, b: 255, t: 1.0 },
                    ]
                  : [
                      { r: 0, g: 255, b: 0, t: 0.0 },
                      { r: 255, g: 255, b: 255, t: 0.5 },
                      { r: 255, g: 0, b: 0, t: 1.0 },
                    ],
            }}
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
