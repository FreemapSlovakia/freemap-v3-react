import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import { LatLngBounds } from 'leaflet';

export function isBigSlovakia(b: LatLngBounds) {
  const isBigSk = booleanContains(
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [23.642578, 50.625073],
            [21.566162, 51.213766],
            [14.348145, 51.213766],
            [11.832275, 50.412018],
            [11.840515, 47.802087],
            [10.302429199220001, 47.800241632830001],
            [8.60229492188, 47.942106827549999],
            [6.88293457031, 47.587641679420003],
            [5.59753417969, 46.297610989879999],
            [6.860962, 44.203866],
            [7.558594, 43.564472],
            [9.239502, 43.564472],
            [10.184326, 42.195969],
            [13.64501953125, 40.405130697529998],
            [21.104736328129999, 40.638967343819999],
            [23.642578125, 41.162113939400001],
            [26.125488, 41.162114],
            [28.201904, 41.869561],
            [29.94873, 45.243953],
            [26.993408, 48.356249],
            [23.642578, 50.625073],
          ],
        ],
      },
    },
    bboxPolygon([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]),
  );

  return isBigSk
    ? { overpassUrl: 'https://overpass.freemap.sk/api/interpreter', isBigSk }
    : { overpassUrl: '//overpass-api.de/api/interpreter', isBigSk };
}
