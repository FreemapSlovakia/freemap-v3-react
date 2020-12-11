import { Fragment, ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { Tooltip, Polyline } from 'react-leaflet';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { RichMarker } from 'fm3/components/RichMarker';
import { Hotline } from 'fm3/components/Hotline';
// import turfLineSlice from '@turf/line-slice';
// import turfLength from '@turf/length';
import turfFlatten from '@turf/flatten';
import { Feature, Properties, LineString, Point } from '@turf/helpers';
import { getCoords } from '@turf/invariant';

import { distance, smoothElevations } from 'fm3/geoutils';
import { Point as LPoint } from 'leaflet';
import { RootState } from 'fm3/storeCreator';

interface GetFeatures {
  (type: 'LineString'): Feature<LineString, Properties>[];
  (type: 'Point'): Feature<Point, Properties>[];
}

const handlePointClick = () => {
  // just to prevent click propagation to map
};

export function TrackViewerResult(): ReactElement | null {
  const trackGeojson = useSelector(
    (state: RootState) => state.trackViewer.trackGeojson,
  );

  const startPoints = useSelector(
    (state: RootState) => state.trackViewer.startPoints,
  );

  const finishPoints = useSelector(
    (state: RootState) => state.trackViewer.finishPoints,
  );

  const displayingElevationChart = useSelector(
    (state: RootState) => state.elevationChart.trackGeojson !== null,
  );

  const colorizeTrackBy = useSelector(
    (state: RootState) => state.trackViewer.colorizeTrackBy,
  );

  const eleSmoothingFactor = useSelector(
    (state: RootState) => state.main.eleSmoothingFactor,
  );

  const language = useSelector((state: RootState) => state.l10n.language);

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

  if (!trackGeojson) {
    return null;
  }

  // TODO rather compute some hash or better - detect real change
  const keyToAssureProperRefresh = `OOXlDWrtVn-${
    (JSON.stringify(trackGeojson) + displayingElevationChart).length
  }`; // otherwise GeoJSON will still display the first data

  const xxx = getFeatures('LineString').map((feature) => ({
    name: feature.properties && feature.properties.name,
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
          key={`outline-${i}`}
          weight={10}
          interactive={false}
          positions={lineData}
          color="#fff"
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
          weight={6}
          interactive={false}
          positions={xxx.map(({ lineData }) => lineData)}
          color="#838"
        />
      )}

      {getFeatures('Point').map(({ geometry, properties }, i) => (
        <RichMarker
          faIcon="flag"
          key={`point-${i}`}
          interactive={false}
          position={{
            lat: geometry.coordinates[1],
            lng: geometry.coordinates[0],
          }}
          eventHandlers={{
            click: handlePointClick,
          }}
        >
          {properties && properties.name && (
            <Tooltip
              className="compact"
              offset={new LPoint(10, -25)}
              direction="right"
              permanent
            >
              <span>{properties.name}</span>
            </Tooltip>
          )}
        </RichMarker>
      ))}

      {startPoints.map((p, i) => (
        <RichMarker
          faIcon="play"
          key={`5rZwATEZfM-${i}`}
          color="#409a40"
          interactive={false}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: handlePointClick,
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
          faIcon="stop"
          key={`GWT1OzhnV1-${i}`}
          color="#d9534f"
          interactive={false}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: handlePointClick,
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
          faIcon="info"
          color="grey"
          interactive={false}
          position={{ lat: infoLat, lng: infoLon }}
          eventHandlers={{
            click: handlePointClick,
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
