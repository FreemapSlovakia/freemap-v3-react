import {
  geometryCollection,
  lineString,
  point,
  Properties,
} from '@turf/helpers';
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

    const kvFilter =
      '[~"^(amenity|highway|waterway|border|landuse|route|building|man_made|natural|leisure|information|shop|tourism|barrier|sport|place|power|boundary|railway|aerialway|historic)$"~"."]';

    const [{ data }, { data: data1 }] = await Promise.all([
      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        data:
          '[out:json];(' +
          `nwr(around:33,${userSelectedLat},${userSelectedLon})${kvFilter};` +
          ');out geom body;',
        expectedStatus: 200,
      }),
      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        data: `[out:json];
          is_in(${userSelectedLat},${userSelectedLon})->.a;
          nwr(pivot.a)${kvFilter};
          out geom body;`,
        expectedStatus: 200,
      }),
    ]);

    const oRes = assertType<OverpassResult>(data);

    const oRes1 = assertType<OverpassResult>(data1);

    const elements = [...oRes1.elements, ...oRes.elements].reverse();

    const sr: SearchResult[] = [];

    for (const element of elements) {
      switch (element.type) {
        case 'node':
          sr.push({
            geojson: toGeometry(element, element.tags),
            id: element.id,
            osmType: 'node',
            detailed: true,
          });

          break;
        case 'way':
          sr.push({
            geojson: toGeometry(element, element.tags),
            id: element.id,
            osmType: 'way',
            detailed: true,
          });

          break;
        case 'relation':
          sr.push({
            geojson: geometryCollection(
              element.members
                .filter((member) => member.type !== 'relation')
                .map(
                  (member) => toGeometry(member as WayGeom | NodeGeom).geometry,
                ),
              element.tags,
            ),
            id: element.id,
            osmType: 'relation',
          });

          break;
      }
    }

    if (elements.length > 0) {
      dispatch(setTool(null));

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

function toGeometry(geom: NodeGeom | WayGeom, properties?: Properties) {
  if (geom.type === 'node') {
    return point([geom.lon, geom.lat], properties);
  } else {
    return lineString(
      geom.geometry.map((coord) => [coord.lon, coord.lat]),
      properties,
    );
  }
}
