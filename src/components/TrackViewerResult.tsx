// import turfLineSlice from '@turf/line-slice';
// import turfLength from '@turf/length';
import turfFlatten from '@turf/flatten';
import { Feature, LineString, Point, Properties } from '@turf/helpers';
import { getCoords } from '@turf/invariant';
import { setTool } from 'fm3/actions/mainActions';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { Hotline } from 'fm3/components/Hotline';
import { RichMarker } from 'fm3/components/RichMarker';
import { colors } from 'fm3/constants';
import { distance, smoothElevations } from 'fm3/geoutils';
import { useStartFinishPoints } from 'fm3/hooks/startFinishPointsHook';
import { selectingModeSelector } from 'fm3/selectors/mainSelectors';
import { Point as LPoint } from 'leaflet';
import { Fragment, ReactElement, useState } from 'react';
import { FaFlag, FaInfo, FaPlay, FaStop } from 'react-icons/fa';
import { Polyline, Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

interface GetFeatures {
  (type: 'LineString'): Feature<LineString, Properties>[];
  (type: 'Point'): Feature<Point, Properties>[];
}

export function TrackViewerResult(): ReactElement | null {
  const trackGeojson = useSelector((state) => state.trackViewer.trackGeojson);

  const [startPoints, finishPoints] = useStartFinishPoints();

  const displayingElevationChart = useSelector(
    (state) => state.elevationChart.trackGeojson !== null,
  );

  const colorizeTrackBy = useSelector(
    (state) => state.trackViewer.colorizeTrackBy,
  );

  const eleSmoothingFactor = useSelector(
    (state) => state.main.eleSmoothingFactor,
  );

  const language = useSelector((state) => state.l10n.language);

  const [infoLat] = useState<number>();

  const [infoLon] = useState<number>();

  const [infoDistanceKm] = useState<number>();

  const getFeatures: GetFeatures = (type: 'LineString' | 'Point') =>
    turfFlatten(trackGeojson as any).features.filter(
      (f) => f.geometry?.type === type,
    ) as any;

  const getColorLineDataForElevation = () =>
    getFeatures('LineString').map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), eleSmoothingFactor);

      const eles = smoothed.map((coord) => coord[2]);
      const maxEle = Math.max(...eles);
      const minEle = Math.min(...eles);

      return smoothed.map((coord) => {
        const color = (coord[2] - minEle) / (maxEle - minEle);
        return [coord[1], coord[0], color || 0] as const;
      });
    });

  const getColorLineDataForSteepness = () =>
    getFeatures('LineString').map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), eleSmoothingFactor);

      let prevCoord = smoothed[0];

      return smoothed.map((coord) => {
        const [lon, lat, ele] = coord;
        const d = distance(lat, lon, prevCoord[1], prevCoord[0]);
        let angle = 0;
        if (d > 0) {
          angle = (ele - prevCoord[2]) / d;
        }
        prevCoord = coord;
        const color = angle / 0.5 + 0.5;
        return [lat, lon, color || 0] as const;
      });
    });

  // TODO
  // // we keep here only business logic which needs access to the layer (otherwise use trackViewerLogic)
  // handleEachFeature = (feature, layer) => {
  //   if (
  //     feature.geometry.type === 'Point' &&
  //     feature.properties &&
  //     feature.properties.name
  //   ) {
  //     layer.bindTooltip(feature.properties.name, {
  //       direction: 'right',
  //       className: 'compact',
  //     });
  //   }

  //   if (feature.geometry.type === 'LineString') {
  //     layer.on('click', (e) => {
  //       this.showInfoPoint(e, feature);
  //     });

  //     layer.on('mouseover', (e) => {
  //       this.showInfoPoint(e, feature);
  //     });

  //     layer.on('mouseout', () => {
  //       this.setState({
  //         infoLat: undefined,
  //         infoLon: undefined,
  //         infoDistanceKm: undefined,
  //       });
  //     });
  //   }
  // };

  // showInfoPoint = (e, feature) => {
  //   const infoLat = e.latlng.lat;
  //   const infoLon = e.latlng.lng;
  //   const infoDistanceKm = this.computeInfoDistanceKm(
  //     infoLat,
  //     infoLon,
  //     feature,
  //   );
  //   this.setState({ infoLat, infoLon, infoDistanceKm });
  // };

  // computeInfoDistanceKm = (
  //   infoLat: number,
  //   infoLon: number,
  //   geojsonLineString,
  // ) => {
  //   const p1 = point(geojsonLineString.geometry.coordinates[0]);
  //   const p2 = point([infoLon, infoLat]);
  //   return turfLength(turfLineSlice(p1, p2, geojsonLineString));
  // };

  const interactive = useSelector(selectingModeSelector);

  const dispatch = useDispatch();

  const setThisTool = () => {
    dispatch(setTool('track-viewer'));
  };

  if (!trackGeojson) {
    return null;
  }

  // TODO rather compute some hash or better - detect real change
  const keyToAssureProperRefresh = `OOXlDWrtVn-${
    (JSON.stringify(trackGeojson) + displayingElevationChart).length
  }`; // otherwise GeoJSON will still display the first data

  const xxx = getFeatures('LineString').map((feature) => ({
    name: feature.properties && feature.properties['name'],
    lineData: feature.geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
    })),
  }));

  const oneDecimalDigitNumberFormat = Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const timeFormat = new Intl.DateTimeFormat(language, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Fragment key={keyToAssureProperRefresh}>
      {xxx.map(({ lineData, name }, i) => (
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
          positions={xxx.map(({ lineData }) => lineData)}
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
              offset={new LPoint(10, -25)}
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
          {p.startTime && (
            <Tooltip
              className="compact"
              offset={new LPoint(10, -25)}
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
            offset={new LPoint(10, -25)}
            direction="right"
            permanent
          >
            <span>
              {p.finishTime ? timeFormat.format(new Date(p.finishTime)) : ''}
              {p.finishTime ? ', ' : ''}
              {oneDecimalDigitNumberFormat.format(p.lengthInKm)} km
            </span>
          </Tooltip>
        </RichMarker>
      ))}

      {infoLat && infoLon && infoDistanceKm && (
        <RichMarker
          key={`info-${interactive ? 'a' : 'b'}`}
          faIcon={<FaInfo color="grey" />}
          color="grey"
          interactive={interactive}
          position={{ lat: infoLat, lng: infoLon }}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          <Tooltip
            className="compact"
            offset={new LPoint(10, -25)}
            direction="right"
            permanent
          >
            <span>
              {oneDecimalDigitNumberFormat.format(infoDistanceKm)}
              {' km'}
            </span>
          </Tooltip>
        </RichMarker>
      )}

      <ElevationChartActivePoint />
    </Fragment>
  );
}
