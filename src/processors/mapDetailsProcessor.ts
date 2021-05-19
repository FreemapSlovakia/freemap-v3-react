import center from '@turf/center';
import { geometryCollection, lineString, point } from '@turf/helpers';
import {
  clearMap,
  deleteFeature,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { SearchResult, searchSetResults } from 'fm3/actions/searchActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { LatLon } from 'fm3/types/common';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

const cancelType = [
  getType(clearMap),
  getType(selectFeature),
  getType(deleteFeature),
  getType(setTool),

  getType(mapDetailsSetUserSelectedPosition),
];

interface OverpassBaseElement {
  id: number;
  bounds: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };

  tags?: Record<string, string>;
}

interface NodeGeom extends LatLon {
  type: 'node';
}

interface WayGeom {
  type: 'way';
  geometry: LatLon[];
}

interface OverpassNode extends OverpassBaseElement, NodeGeom {}

interface OverpassWay extends OverpassBaseElement, WayGeom {
  nodes: number[];
}

interface MemeberBase {
  ref: number;
  role: string;
}

interface WayMemeber extends MemeberBase, WayGeom {}

interface NodeMemeber extends MemeberBase, NodeGeom {}

interface RelationMemeber extends MemeberBase {
  type: 'relation';
}

type Member = RelationMemeber | WayMemeber | NodeMemeber;

interface OverpassRelation extends OverpassBaseElement {
  type: 'relation';
  members: Member[];
}

type OverpassElement = OverpassNode | OverpassWay | OverpassRelation;

interface OverpassResult {
  elements: OverpassElement[];
}

export const mapDetailsProcessor: Processor = {
  actionCreator: mapDetailsSetUserSelectedPosition,
  errorKey: 'mapDetails.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { userSelectedLat, userSelectedLon } = getState().mapDetails;

    const le = getMapLeafletElement();

    if (!le) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: 'https://overpass.freemap.sk/api/interpreter',
      data:
        '[out:json];(' +
        `nwr(around:33,${userSelectedLat},${userSelectedLon})[~"^amenity|highway|waterway|border|landuse|route|building|man_made|natural|leisure|information$"~"."];` +
        ');out geom body;',
      expectedStatus: 200,
    });

    const data1 = { elements: [] };

    // const [{ data }, { data: data1 }] = await Promise.all([
    //   httpRequest({
    //     getState,
    //     method: 'POST',
    //     url: overpassUrl,
    //     data:
    //       '[out:json];(' +
    //       // + `node(around:33,${userSelectedLat},${userSelectedLon});`
    //       `way(around:33,${userSelectedLat},${userSelectedLon})[highway];` +
    //       // + `relation(around:33,${userSelectedLat},${userSelectedLon});`
    //       ');out geom meta;',
    //     expectedStatus: 200,
    //   }),
    //   { data: { elements: [] } },
    //   // axios.post(
    //   //   overpassUrl,
    //   //   `[out:json];
    //   //     is_in(${userSelectedLat},${userSelectedLon})->.a;
    //   //     way(pivot.a);
    //   //     out geom meta;
    //   //     relation(pivot.a);
    //   //     out geom meta;
    //   //   `,
    //   //   {
    //   //     validateStatus: status => status === 200,
    //   //     cancelToken: source.token,
    //   //   },
    //   // ),
    // ]);

    console.log({ data });

    const oRes = assertType<OverpassResult>(data);

    const elements = [...oRes.elements, ...data1.elements];

    const sr: SearchResult[] = [];

    function toGeometry(geom: NodeGeom | WayGeom) {
      if (geom.type === 'node') {
        return point([geom.lon, geom.lat]);
      } else {
        return lineString(geom.geometry.map((coord) => [coord.lon, coord.lat]));
      }
    }

    for (const element of elements) {
      switch (element.type) {
        case 'node':
          if (isInteresting(element)) {
            sr.push({
              lat: element.lat,
              lon: element.lon,
              geojson: toGeometry(element),
              id: element.id,
              label: element.tags?.['name'] ?? '???',
            });
          }
          break;
        case 'way':
          if (isInteresting(element)) {
            const geojson = toGeometry(element);

            const [lon, lat] = center(geojson).geometry.coordinates;

            sr.push({
              lat,
              lon,
              geojson,
              id: element.id,
              label: element.tags?.['name'] ?? '???',
            });
          }

          break;
        case 'relation':
          {
            const geojson = geometryCollection(
              element.members
                .filter((member) => member.type !== 'relation')
                .map(
                  (member) => toGeometry(member as WayGeom | NodeGeom).geometry,
                ),
            );

            const [lon, lat] = center(geojson).geometry.coordinates;

            sr.push({
              lat,
              lon,
              geojson,
              id: element.id,
              label: element.tags?.['name'] ?? '???',
            });
          }

          break;
      }
    }

    if (elements.length > 0) {
      dispatch(searchSetResults(sr));
    } else {
      dispatch(
        toastsAdd({
          id: 'mapDetails.trackInfo.detail',
          messageKey: 'mapDetails.notFound',
          cancelType,
          timeout: 5000,
          style: 'info',
        }),
      );
    }
  },
};

function isInteresting(element: OverpassElement) {
  return (
    !!element.tags &&
    Object.keys(element.tags).some(
      (key) =>
        key !== 'attribution' &&
        key !== 'created_by' &&
        key !== 'source' &&
        key !== 'odbl' &&
        key.indexOf('source:') !== 0 &&
        key.indexOf('source_ref') !== 0 && // purposely exclude colon
        key.indexOf('tiger:') !== 0,
    )
  );
}
