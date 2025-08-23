import {
  featureCollection,
  lineString,
  multiLineString,
  point,
  polygon,
} from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { exportMapFeatures, setActiveModal } from '../actions/mainActions.js';
import type { ProcessorHandler } from '../middlewares/processorMiddleware.js';
import { RoutePlannerState } from '../reducers/routePlannerReducer.js';
import { TrackingState } from '../reducers/trackingReducer.js';
import { fetchPictures, Picture } from './fetchPictures.js';
import { licenseNotice, upload } from './upload.js';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const fc = featureCollection([]);

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
        point([p.coords.lon, p.coords.lat], { name: p.label, color: p.color }),
      );
    }
  }

  if (set.has('objects')) {
    for (const { coords, tags } of objects.objects) {
      fc.features.push(point([coords.lon, coords.lat], tags));
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

  const { target } = action.payload;

  if (
    await upload(
      'geojson',
      new Blob(
        [
          JSON.stringify({
            ...fc,
            ...{
              metadata: {
                description: 'Exported from https://www.freemap.sk/',
                licenseNotice,
                time: new Date().toISOString(),
                content: action.payload.exportables,
              },
            },
          }),
        ],
        {
          type:
            target === 'dropbox'
              ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
              : 'application/geo+json',
        },
      ),
      target,
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
    hmac,
  } of pictures) {
    let imageUrl = `${process.env['API_URL']}/gallery/pictures/${id}/image`;

    if (hmac) {
      imageUrl += '&hmac=' + encodeURIComponent(hmac);
    }

    fc.features.push(
      point([lon, lat], {
        takenAt: takenAt ? new Date(takenAt * 1000).toISOString() : undefined,
        publishedAt: createdAt
          ? new Date(createdAt * 1000).toISOString()
          : undefined,
        name: title,
        description,
        imageUrl,
        webUrl: `${process.env['BASE_URL']}?image=${id}`,
        author: user,
        tags,
      }),
    );
  }
}

function addPlannedRoute(
  fc: FeatureCollection,
  { alternatives, points, finishOnly }: RoutePlannerState,
  withStops: boolean,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  if (withStops) {
    points.forEach((pt, i: number) => {
      fc.features.push(
        point([pt.lon, pt.lat], {
          name:
            i === 0 && !finishOnly
              ? 'Štart'
              : i === points.length - 1
                ? 'Cieľ' // TODO not for roundtrip?
                : `Zastávka ${i + 1}`,
        }), // TODO translate: ;
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
