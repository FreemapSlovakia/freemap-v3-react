import {
  FeatureCollection,
  featureCollection,
  Geometry,
  GeometryCollection,
  lineString,
  multiLineString,
  point,
  polygon,
} from '@turf/helpers';
import { exportGpx, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import { fetchPictures, Picture } from './fetchPictures';
import { licenseNotice, upload } from './upload';

const handle: ProcessorHandler<typeof exportGpx> = async ({
  getState,
  action,
  dispatch,
}) => {
  const fc = featureCollection<Geometry | GeometryCollection>([]);

  (fc as any).metadata = {
    description: 'Exported from https://www.freemap.sk/',
    licenseNotice,
    time: new Date().toISOString(),
    content: action.payload.exportables,
  };

  const {
    drawingLines,
    drawingPoints,
    objects,
    routePlanner,
    tracking,
    trackViewer,
    search,
  } = getState();

  const set = new Set(action.payload.exportables);

  if (set.has('pictures')) {
    addPictures(fc, await fetchPictures(getState));
  }

  if (set.has('drawingLines')) {
    for (const line of drawingLines.lines.filter(
      (line) => line.type === 'line',
    )) {
      fc.features.push(
        lineString(
          line.points.map((p) => [p.lon, p.lat]),
          { name: line.label, color: line.color },
        ),
      );
    }
  }

  if (set.has('drawingAreas')) {
    for (const line of drawingLines.lines.filter(
      (line) => line.type === 'polygon',
    )) {
      fc.features.push(
        polygon([[...line.points, line.points[0]].map((p) => [p.lon, p.lat])], {
          name: line.label,
          color: line.color,
        }),
      );
    }
  }

  if (set.has('drawingPoints')) {
    for (const p of drawingPoints.points) {
      fc.features.push(
        point([p.lon, p.lat], { name: p.label, color: p.color }),
      );
    }
  }

  if (set.has('objects')) {
    for (const { lat, lon, tags } of objects.objects) {
      fc.features.push(point([lon, lat], tags));
    }
  }

  if (set.has('plannedRoute') || set.has('plannedRouteWithStops')) {
    addPlannedRoute(fc, routePlanner, set.has('plannedRouteWithStops'));
  }

  if (set.has('tracking')) {
    addTracking(fc, tracking);
  }

  if (set.has('gpx')) {
    if (trackViewer.trackGeojson) {
      fc.features.push(...trackViewer.trackGeojson.features);
    }
  }

  if (set.has('search')) {
    const geojson = search.selectedResult?.geojson;

    switch (geojson?.type) {
      case 'FeatureCollection':
        fc.features.push(...geojson.features);

        break;

      case 'Feature':
        fc.features.push(geojson);

        break;
    }
  }

  const { destination } = action.payload;

  if (
    await upload(
      'geojson',
      new Blob([JSON.stringify(fc)], {
        type:
          destination === 'dropbox'
            ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
            : 'application/geo+json',
      }),
      destination,
      getState,
      dispatch,
    )
  ) {
    dispatch(setActiveModal(null));
  }
};

export default handle;

function addPictures(fc: FeatureCollection, pictures: Picture[]) {
  for (const {
    lat,
    lon,
    id,
    takenAt,
    title,
    description,
    createdAt,
    user,
    tags,
  } of pictures) {
    fc.features.push(
      point([lon, lat], {
        takenAt: takenAt ? new Date(takenAt * 1000).toISOString() : undefined,
        publishedAt: createdAt
          ? new Date(createdAt * 1000).toISOString()
          : undefined,
        name: title,
        description,
        imageUrl: `${process.env['API_URL']}/gallery/pictures/${id}/image`,
        webUrl: `${process.env['BASE_URL']}?image=${id}`,
        author: user,
        tags,
      }),
    );
  }
}

function addPlannedRoute(
  fc: FeatureCollection,
  { alternatives, start, finish, midpoints }: RoutePlannerState,
  withStops: boolean,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  if (withStops) {
    if (start) {
      fc.features.push(point([start.lon, start.lat], { name: 'Štart' })); // TODO translate
    }

    if (finish) {
      fc.features.push(point([finish.lon, finish.lat], { name: 'Cieľ' })); // TODO translate
    }

    midpoints.forEach((midpoint, i: number) => {
      fc.features.push(
        point([midpoint.lon, midpoint.lat], { name: `Zastávka ${i + 1}` }), // TODO translate
      );
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    fc.features.push(
      multiLineString(
        legs.flatMap((leg) =>
          leg.steps.map((step) => step.geometry.coordinates),
        ),
        { name: `Alternatíva ${i + 1}` }, // TODO translate
      ),
    );
  });
}

function addTracking(
  fc: FeatureCollection,
  { tracks, trackedDevices }: TrackingState,
) {
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) || {}),
  }));

  for (const track of tracks1) {
    fc.features.push(
      lineString(
        track.trackPoints.map((tp) => [tp.lon, tp.lat]),
        {
          name: track.label,
          color: track.color,
          width: track.width,
          maxAge: track.maxAge,
          maxCount: track.maxCount,
          fromTime: track.fromTime,
          splitDistance: track.splitDistance,
          splitDuration: track.splitDuration,
        },
      ),
    );

    for (const {
      ts,
      lat,
      lon,
      altitude,
      speed,
      accuracy,
      bearing,
      battery,
      gsmSignal,
      message,
    } of track.trackPoints) {
      fc.features.push(
        point([lon, lat], {
          time: ts,
          lat,
          lon,
          altitude,
          speed,
          accuracy,
          bearing,
          battery,
          gsmSignal,
          message,
        }),
      );
    }
  }
}
