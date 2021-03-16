import {
  featureCollection,
  Geometries,
  lineString,
  point,
} from '@turf/helpers';
import {
  clearMap,
  deleteFeature,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import {
  mapDetailsSetTrackInfoPoints,
  mapDetailsSetUserSelectedPosition,
} from 'fm3/actions/mapDetailsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
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

interface OverpassNodeElement extends LatLon {
  type: 'node';
}

interface OverpassWayElement {
  type: 'way';
  geometry: LatLon[];
}

interface OverpassRelationElement {
  type: 'relation';
  members: OverpassElement[];
}

type OverpassElement =
  | OverpassNodeElement
  | OverpassWayElement
  | OverpassRelationElement;

interface OverpassResult {
  elements: OverpassElement[];
}

export const mapDetailsProcessor: Processor = {
  actionCreator: mapDetailsSetUserSelectedPosition,
  errorKey: 'mapDetails.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { subtool, userSelectedLat, userSelectedLon } = getState().mapDetails;

    if (subtool !== 'track-info') {
      return;
    }

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
        // + `node(around:33,${userSelectedLat},${userSelectedLon});`
        `way(around:33,${userSelectedLat},${userSelectedLon})[highway];` +
        // + `relation(around:33,${userSelectedLat},${userSelectedLon});`
        ');out geom meta;',
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

    const oRes = assertType<OverpassResult>(data);

    const elements = [...oRes.elements, ...data1.elements];

    if (elements.length > 0) {
      const geojson = featureCollection<Geometries>(
        elements.map((element) => {
          switch (element.type) {
            case 'node':
              return point([element.lon, element.lat]);
            case 'way':
              return lineString(
                element.geometry.map(({ lat, lon }) => [lon, lat]),
              );
            case 'relation': {
              // TODO
              // const f = featureCollection<Geometries>(
              //   element.members
              //     .filter(({ type }) =>
              //       ['way', 'node' /* TODO , 'relation' */].includes(type),
              //     )
              //     .map((member) =>
              //       member.type === 'way'
              //         ? lineString(
              //             member.geometry.map(({ lat, lon }) => [lon, lat]),
              //           )
              //         : member.type === 'node'
              //         ? point([member.lon, member.lat])
              //         : point([0, 0]),
              //     ),
              // );

              return point([0, 0]);
            }
          }
        }),
      );

      (oRes.elements || []).forEach((element) => {
        dispatch(
          toastsAdd({
            id: 'mapDetails.trackInfo.detail',
            messageKey: 'mapDetails.detail',
            messageParams: { element },
            cancelType,
            style: 'info',
          }),
        );
      });

      // dispatch(mapDetailsSetTrackInfoPoints(geojson));

      dispatch(
        trackViewerSetData({
          trackGeojson: geojson,
          startPoints: [],
          finishPoints: [],
        }),
      );
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
      dispatch(mapDetailsSetTrackInfoPoints(null));
    }
  },
};
