import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import { TrackingState } from '@features/tracking/model/reducer.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import {
  featureCollection,
  lineString,
  multiLineString,
  point,
  polygon,
} from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { exportMapFeatures } from '../actions.js';
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
    for (const line of drawingLines.lines) {
      if (
        (!set.has('drawingLines') && line.type === 'line') ||
        (!set.has('drawingAreas') && line.type === 'polygon')
      ) {
        continue;
      }

      const stroke = line.color ? splitColorAlpha(line.color) : undefined;
      const fill = line.fillColor ? splitColorAlpha(line.fillColor) : undefined;

      const props = {
        title: line.label,
        stroke: stroke?.color,
        'stroke-opacity':
          stroke && stroke.opacity < 1 ? stroke.opacity : undefined,
        fill: fill?.color,
        'fill-opacity': fill && fill.opacity < 1 ? fill.opacity : undefined,
        'stroke-width': line.width,
        'stroke-linecap': line.lineCap,
        'stroke-linejoin': line.lineJoin,
        'stroke-dasharray': line.dashArray,
      };

      fc.features.push(
        line.type === 'polygon'
          ? polygon(
              [[...line.points, line.points[0]].map((p) => [p.lon, p.lat])],
              props,
            )
          : lineString(
              line.points.map((p) => [p.lon, p.lat]),
              props,
            ),
      );
    }
  }

  if (set.has('drawingPoints')) {
    for (const p of drawingPoints.points) {
      const marker = p.color ? splitColorAlpha(p.color) : undefined;

      fc.features.push(
        point([p.coords.lon, p.coords.lat], {
          title: p.label,
          'marker-color': marker?.color,
          'marker-color-opacity':
            marker && marker.opacity < 1 ? marker.opacity : undefined,
        }),
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
        takenAt: takenAt ? takenAt.toISOString() : undefined,
        publishedAt: createdAt ? createdAt.toISOString() : undefined,
        title,
        description,
        imageUrl,
        webUrl: `${location.origin}?image=${id}`,
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
          title:
            i === 0 && !finishOnly
              ? window.translations?.routePlanner.start
              : i === points.length - 1
                ? window.translations?.routePlanner.finish // TODO not for roundtrip?
                : window.translations?.routePlanner.stop + ' ' + (i + 1),
        }),
      );
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    fc.features.push(
      multiLineString(
        legs.flatMap((leg) =>
          leg.steps.map((step) => step.geometry.coordinates),
        ),
        {
          title: window.translations?.routePlanner.alternative + ' ' + (i + 1),
        },
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
    const stroke = track.color ? splitColorAlpha(track.color) : undefined;

    fc.features.push(
      lineString(
        track.trackPoints.map((tp) => [tp.lon, tp.lat]),
        {
          title: track.label,
          stroke: stroke?.color,
          'stroke-opacity':
            stroke && stroke.opacity < 1 ? stroke.opacity : undefined,
          'stroke-width': track.width,
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
