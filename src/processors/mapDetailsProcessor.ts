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

    const [{ data }, { data: data1 }] = await Promise.all([
      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        data:
          '[out:json];(' +
          `nwr(around:33,${userSelectedLat},${userSelectedLon})[~"^amenity|highway|waterway|border|landuse|route|building|man_made|natural|leisure|information|shop|tourism|barrier|sport|place|power|boundary|railway|aerialway$"~"."];` +
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
          nwr(pivot.a)[~"^amenity|highway|waterway|border|landuse|route|building|man_made|natural|leisure|information|shop|tourism|barrier|sport|place|power|boundary|railway|aerialway$"~"."];
          out geom body;
          `,
        expectedStatus: 200,
      }),
    ]);

    console.log({ data, data1 });

    const oRes = assertType<OverpassResult>(data);

    const oRes1 = assertType<OverpassResult>(data1);

    const elements = [...oRes1.elements, ...oRes.elements].reverse();

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
          sr.push({
            lat: element.lat,
            lon: element.lon,
            geojson: toGeometry(element),
            id: element.id,
            label: getName(element),
            osmType: 'node',
          });

          break;
        case 'way':
          {
            const geojson = toGeometry(element);

            const [lon, lat] = center(geojson).geometry.coordinates;

            sr.push({
              lat,
              lon,
              geojson,
              id: element.id,
              label: getName(element),
              osmType: 'way',
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
              label: getName(element),
              osmType: 'relation',
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

const colorNames: Record<string, string> = {
  red: 'Čevená',
  blue: 'Modrá',
  green: 'Zelená',
  yellow: 'Žltá',
  orange: 'Oranžová',
  purple: 'Fialová',
  violet: 'Fialová',
  white: 'Biela',
  black: 'Čierna',
  gray: 'Sivá',
  brown: 'Hnedá',
};

const powerNames: Record<string, string> = {
  pole: 'Elektrický stĺp',
  tower: 'Veža vysokého napätia',
  line: 'Elektrické vedenie',
  minor_line: 'Malé elektrické vedenie',
};

const manMadeNames: Record<string, string> = {
  pipeline: 'Potrubie',
  beehive: 'Úľ',
  chimney: 'Komín',
  clearcut: 'Rúbanisko',
};

const naturalNames: Record<string, string> = {
  wood: 'Les',
  water: 'Vodná plocha',
  spring: 'Prameň',
  cave_entrance: 'Jaskyňa',
  basin: 'Kotlina',
  mountain_range: 'Pohorie',
  scrub: 'Kríky',
  heath: 'Step',
  valley: 'Dolina',
  ridge: 'Hrebeň',
  saddle: 'Sedlo',
  peak: 'Vrchol',
  tree: 'Strom',
  plateau: 'Planina',
};

const tourismNames: Record<string, string> = {
  viewpoint: 'Výhľad',
};

const leisureNames: Record<string, string> = {
  firepit: 'Ohnisko',
};

const landuseNames: Record<string, string> = {
  forest: 'Les',
  residential: 'Rezidenčná zóna',
  commercial: 'Komerčná zóna',
  industrial: 'Industriálna zóna',
  allotments: 'Zahradkárska oblasť',
  farmland: 'Pole',
  farmyard: 'Družstvo',
};

const waterwayNames: Record<string, string> = {
  river: 'Rieka',
  stream: 'Potok',
  ditch: 'Kanál',
  drain: 'Odtok',
};

const amenityNames: Record<string, string> = {
  hunting_stand: 'Poľovnícky posed',
  toilets: 'WC',
  shelter: 'Prístrešok',
};

const routeNames: Record<string, string> = {
  hiking: 'Turistická trasa',
  foot: 'Pešia trasa',
  bicycle: 'Cyklotrasa',
  ski: 'Lyžiarská trasa',
  horse: 'Jazdecká trasa',
  railway: 'Železničná trasa',
};

const adminLevelNames: Record<string, string> = {
  '10': 'Katastrálne územie',
  '9': 'Obec',
  '8': 'Okres',
  '7': 'Oblasť',
  '6': 'Mesto',
  '5': 'Provincia',
  '4': 'Kraj',
  '3': 'Región',
  '2': 'Štát',
};

const highwayNames: Record<string, string> = {
  residential: 'Ulica',
  living_street: 'Obytná zóna',
  path: 'Cestička',
  track: 'Lesná / poľná cesta',
  primary: 'Cesta prvej triedy',
  secondary: 'Cesta druhej triedy',
  tertiary: 'Cesta tretej triedy',
  service: 'Servisná, príjazdová cesta',
  footway: 'Chodník',
  steps: 'Schody',
  trunk: 'Cesta pre motorové vozidlá',
  motorway: 'Diaľnica',
  unclassified: 'Neklasifikovaná cesta',
  primary_link: 'Napojenie na cestu prvej triedy',
  secondaty_link: 'Napojenie na cestu druhej triedy',
  tertiary_link: 'Napojenie na cestu tretej triedy',
};

function getName(element: OverpassElement) {
  if (!element.tags) {
    return '???';
  }

  const name = element.tags['name'];

  const ref = element.tags['ref'];

  const operator = element.tags['operator'];

  let subj: string | undefined = undefined;

  const highway = element.tags['highway'];

  if (highway) {
    subj = highwayNames[highway] ?? highway;
  }

  if (element.tags['building']) {
    subj = 'Budova';
  }

  const landuse = element.tags['landuse'];

  if (landuse) {
    subj = landuseNames[landuse] ?? landuse;
  }

  const natural = element.tags['natural'];

  if (natural) {
    subj = naturalNames[natural] ?? natural;
  }

  if (element.type === 'relation' && element.tags['type'] === 'route') {
    const route = element.tags['route'];

    const color =
      colorNames[
        (element.tags['osmc:symbol'] ?? '').replace(/:.*/, '') ||
          (element.tags['color'] ?? '')
      ] ?? '';

    subj = (color + ' ' + (routeNames[route] ?? `Trasa ${route ?? ''}`)).trim();
  }

  const waterway = element.tags['waterway'];

  if (waterway) {
    subj = waterwayNames[waterway] ?? waterway;
  }

  const amenity = element.tags['amenity'];

  if (amenity) {
    subj = amenityNames[amenity] ?? amenity;
  }

  const tourism = element.tags['tourism'];

  if (tourism) {
    subj = tourismNames[tourism] ?? tourism;
  }

  const leisure = element.tags['leisure'];

  if (leisure) {
    subj = leisureNames[leisure] ?? leisure;
  }

  const boundary = element.tags['boundary'];

  if (boundary === 'administrative') {
    subj = adminLevelNames[element.tags['admin_level']] ?? 'Hranica';
  }

  const manMade = element.tags['man_made'];

  if (manMade) {
    subj = manMadeNames[manMade] ?? manMade;
  }

  const power = element.tags['power'];

  if (power) {
    subj = powerNames[power] ?? power;
  }

  const shop = element.tags['shop'];

  if (shop) {
    subj = shop;
  }

  const railway = element.tags['railway'];

  if (railway) {
    subj = 'Železnica';
  }

  const aerialway = element.tags['aerialway'];

  if (aerialway) {
    subj = 'Lanovka, vlek';
  }

  return ((subj ?? '') + ' ' + (name ?? ref ?? operator ?? '')).trim();
}
