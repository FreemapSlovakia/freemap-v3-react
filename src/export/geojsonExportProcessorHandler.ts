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
import { httpRequest } from 'fm3/authAxios';
import { createFilter } from 'fm3/galleryUtils';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import qs from 'query-string';
import { assertType } from 'typescript-is';
import { licenseNotice, upload } from './upload';

type Picture = {
  lat: number;
  lon: number;
  id: number;
  takenAt: string | null;
  createdAt: string | null;
  title: string | null;
  description: string | null;
  author: string; // TODO
};

const handle: ProcessorHandler<typeof exportGpx> = async ({
  getState,
  action,
  dispatch,
}) => {
  const gj = featureCollection<Geometry | GeometryCollection>([]);

  (gj as any).metadata = {
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
  } = getState();

  const set = new Set(action.payload.exportables);

  const le = getMapLeafletElement();

  if (le && set.has('pictures')) {
    const b = le.getBounds();

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/pictures',
      params: {
        by: 'bbox',
        bbox: `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`,
        ...createFilter(getState().gallery.filter),
        fields: [
          'id',
          'title',
          'description',
          'takenAt',
          'createdAt',
          'rating',
        ], // TODO author
      },
      paramsSerializer: qs.stringify,
      expectedStatus: 200,
    });

    addPictures(gj, assertType<Picture[]>(data));
  }

  if (set.has('drawingLines')) {
    for (const line of drawingLines.lines.filter(
      (line) => line.type === 'line',
    )) {
      gj.features.push(
        lineString(
          line.points.map((p) => [p.lon, p.lat]),
          { name: line.label },
        ),
      );
    }
  }

  if (set.has('drawingAreas')) {
    for (const line of drawingLines.lines.filter(
      (line) => line.type === 'polygon',
    )) {
      gj.features.push(
        polygon([line.points.map((p) => [p.lon, p.lat])], { name: line.label }),
      );
    }
  }

  if (set.has('drawingPoints')) {
    for (const p of drawingPoints.points) {
      gj.features.push(point([p.lon, p.lat], { name: p.label }));
    }
  }

  if (set.has('objects')) {
    objects.objects.forEach(({ lat, lon, tags }) => {
      gj.features.push(point([lon, lat], tags));
    });
  }

  if (set.has('plannedRoute') || set.has('plannedRouteWithStops')) {
    addPlannedRoute(gj, routePlanner, set.has('plannedRouteWithStops'));
  }

  if (set.has('tracking')) {
    addTracking(gj, tracking);
  }

  if (set.has('gpx')) {
    if (trackViewer.trackGeojson) {
      gj.features.push(...trackViewer.trackGeojson.features);
    }
  }

  const { destination } = action.payload;

  await upload(
    'geojson',
    new Blob([JSON.stringify(gj)], {
      type:
        destination === 'dropbox'
          ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
          : 'application/geo+json',
    }),
    destination,
    getState,
    dispatch,
  );

  dispatch(setActiveModal(null));
};

export default handle;

function addPictures(doc: FeatureCollection, pictures: Picture[]) {
  pictures.forEach(
    ({ lat, lon, id, takenAt, title, description, createdAt }) => {
      doc.features.push(
        point([lon, lat], {
          takenAt: takenAt,
          publishedAt: createdAt,
          name: title,
          description,
          link: `${process.env['API_URL']}/gallery/pictures/${id}/image`,
          // TODO author
          // TODO tags
        }),
      );
    },
  );
}

function addPlannedRoute(
  doc: FeatureCollection,
  { alternatives, start, finish, midpoints }: RoutePlannerState,
  withStops: boolean,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  if (withStops) {
    if (start) {
      doc.features.push(point([start.lon, start.lat], { name: 'Štart' })); // TODO translate
    }

    if (finish) {
      doc.features.push(point([finish.lon, finish.lat], { name: 'Cieľ' })); // TODO translate
    }

    midpoints.forEach((midpoint, i: number) => {
      doc.features.push(
        point([midpoint.lon, midpoint.lat], { name: `Zastávka ${i + 1}` }), // TODO translate
      );
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    doc.features.push(
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
  doc: FeatureCollection,
  { tracks, trackedDevices }: TrackingState,
) {
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) || {}),
  }));

  for (const track of tracks1) {
    doc.features.push(
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
      doc.features.push(
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
