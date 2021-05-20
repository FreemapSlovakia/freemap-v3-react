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
          out geom body;
          `,
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
            lat: element.lat,
            lon: element.lon,
            geojson: toGeometry(element).geometry,
            id: element.id,
            label: getName(element),
            osmType: 'node',
            tags: element.tags,
          });

          break;
        case 'way':
          {
            const geojson = toGeometry(element);

            const [lon, lat] = center(geojson).geometry.coordinates;

            sr.push({
              lat,
              lon,
              geojson: geojson.geometry,
              id: element.id,
              label: getName(element),
              osmType: 'way',
              tags: element.tags,
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
              geojson: geojson.geometry,
              id: element.id,
              label: getName(element),
              osmType: 'relation',
              tags: element.tags,
            });
          }

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

function toGeometry(geom: NodeGeom | WayGeom) {
  if (geom.type === 'node') {
    return point([geom.lon, geom.lat]);
  } else {
    return lineString(geom.geometry.map((coord) => [coord.lon, coord.lat]));
  }
}

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

// eslint-disable-next-line
interface Node extends Record<string, Node | string> {}

const mapping: Node = {
  highway: {
    '*': 'Cesta {}',
    track: {
      '*': 'Lesná / poľná cesta',
      tracktype: {
        grade1: 'Spevnená lesná / poľná cesta',
        grade2: 'Väčšinou spevnená lesná / poľná cesta',
        grade3: 'Menej pevná lesná / poľná cesta',
        grade4: 'Väčšinou mäkká lesná / poľná cesta',
        grade5: 'Mäkká lesná / poľná cesta',
      },
    },
    residential: 'Ulica',
    living_street: 'Obytná zóna',
    path: 'Cestička',
    primary: 'Cesta prvej triedy',
    secondary: 'Cesta druhej triedy',
    tertiary: 'Cesta tretej triedy',
    service: {
      '*': 'Servisná, príjazdová cesta',
      service: {
        '*': 'Servisná cesta {}',
        driveway: 'Príjazdová cesta',
        parking_aisle: 'Cesta parkoviska',
        alley: 'Prejazdová cesta',
        emergency_access: 'Požiarná cesta',
        'drive-through': 'Cesta pre nákup z auta',
        bus: 'Cesta vyhradená pre autobus',
      },
    },
    footway: 'Chodník',
    steps: 'Schody',
    trunk: 'Cesta pre motorové vozidlá',
    motorway: 'Diaľnica',
    unclassified: 'Neklasifikovaná cesta',
    primary_link: 'Napojenie na cestu prvej triedy',
    secondaty_link: 'Napojenie na cestu druhej triedy',
    tertiary_link: 'Napojenie na cestu tretej triedy',
    motorway_link: 'Napojenie na ďiaľnicu',
    trunk_link: 'Napojenie na cestu pre motorové vozidlá',
    construction: 'Cesta vo výstavbe',
    crossing: 'Prechod',
    cycleway: 'Cyklochodník',
  },
  boundary: {
    '*': 'Oblasť',
    administrative: {
      '*': 'Administratívna oblasť',
      admin_level: {
        '10': 'Katastrálne územie',
        '9': 'Obec',
        '8': 'Okres',
        '7': 'Oblasť',
        '6': 'Mesto',
        '5': 'Provincia',
        '4': 'Kraj',
        '3': 'Región',
        '2': 'Štát',
      },
    },
  },
  type: {
    route: {
      '*': 'Trasa',
      route: {
        hiking: 'Turistická trasa',
        foot: 'Pešia trasa',
        bicycle: 'Cyklotrasa',
        ski: 'Lyžiarská trasa',
        piste: 'Bežkárska trasa trasa',
        horse: 'Jazdecká trasa',
        railway: 'Železničná trasa',
        tram: 'Električková trasa',
        bus: 'Trasa autobusu',
        mtb: 'Trasa pre horské bicykle',
      },
    },
  },
  building: {
    '*': 'Budova {}',
    yes: 'Budova',
    apartments: 'Apartmány',
    bungalow: 'Bungalov',
    cabin: 'Búda, chatka',
    detached: 'Samostatne stojací rodinný dom',
    dormitory: 'Internát',
    farm: 'Statok',
    hotel: 'Budova hotela',
    house: 'Rodinný dom',
    houseboat: 'Hausbót',
    residential: 'Obytný dom',
    static_caravan: 'Obytný přívěs, karavan',
    terrace: 'Radový dom',
    semidetached_house: 'Duplex', // TODO
    commercial: 'Budova určená na komerčné účely',
    industrial: 'Budova určená na priemyslové účely',
    office: 'Budova s kanceláriami',
    church: 'Kostol',
    cathedral: 'Katedrála',
    chapel: 'Kaplnka',
    mosque: 'Mešita',
    synagogue: 'Synagóga',
    temple: 'Chrám',
    shrine: 'Svätyňa',
  },
  amenity: {
    '*': '{}',
    hunting_stand: 'Poľovnícky posed',
    toilets: 'WC',
    shelter: {
      '*': 'Prístrešok',
      shelter_type: {
        basic_hut: 'Jednoduchá chata, bivak',
        changing_rooms: 'Prezliekáreň',
        field_shelter: 'Polný prístrešok',
        lean_to: 'Prístrešok s otvorenou stenou',
        picnic_shelter: 'Piknikový prístrešok',
        public_transport: 'Prístrešok verejnej dopravy',
        rock_shelter: 'Skalný úkryt',
        sun_shelter: 'Prístrešok proti slnku',
        weather_shelter: 'Prístrešok proti nepriaznivému počasiu',
      },
    },
    bench: 'Lavička',
    atm: 'Bankomat',
    bank: 'Banka',
    fuel: 'Čerpacia stanica',
    hospital: 'Nemocnica',
    place_of_worship: 'Miesto uctievania',
    restaurant: 'Reštaurácia',
    school: 'Škola',
    waste_basket: 'Odpadkový kôš',
    cafe: 'Kaviareň',
    fast_food: 'Rýchle občerstvenie',
    bicycle_parking: 'Parkovanie pre bicykle',
    pharmacy: 'Lekáreň',
    post_box: 'Poštová schránka',
    recycling: 'Recyklovanie',
    kindergarten: 'Škôlka',
    drinking_water: 'Pitná voda',
    bar: 'Bar',
    post_office: 'Pošta',
    townhall: 'Mestská radnica, obecný úrad',
    pub: 'Krčma',
    fountain: 'Fontána',
    police: 'Policia',
    waste_disposal: 'Odpadkový kôš',
    library: 'Knižnica',
    bus_station: 'Autobusová stanica',
  },
  waterway: {
    '*': 'Vodný tok',
    river: 'Rieka',
    stream: 'Potok',
    ditch: 'Kanál',
    drain: 'Odtok',
    waterfall: 'Vodopád',
    riverbank: 'Breh',
    dam: 'Priehrada',
  },
  landuse: {
    '*': '{}',
    forest: 'Les',
    residential: 'Rezidenčná zóna',
    commercial: 'Komerčná zóna',
    industrial: 'Industriálna zóna',
    allotments: 'Zahradkárska oblasť',
    farmland: 'Pole',
    farmyard: 'Družstvo',
    grass: 'Tráva',
    meadow: 'Lúka',
    orchard: 'Sad',
    vineyard: 'Vinica',
    cemetery: 'Cintorín',
    reservoir: 'Rezervoár',
    quarry: 'Lom',
    millitary: 'Vojenská oblasť',
  },
  leisure: {
    '*': '{}',
    firepit: 'Ohnisko',
    pitch: 'Ihrisko',
    swimming_pool: 'Bazén',
    park: 'Park',
    garden: 'Záhrada',
    playground: 'Ihrisko',
    track: 'Dráha',
    picnic_table: 'Pikniková stôl',
    stadium: 'Štadión',
  },
  natural: {
    '*': '{}',
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
    arch: 'Skalné okno',
  },
  man_made: {
    '*': '{}',
    pipeline: 'Potrubie',
    beehive: 'Úľ',
    chimney: 'Komín',
    clearcut: 'Rúbanisko',
  },
  power: {
    pole: 'Elektrický stĺp',
    tower: 'Veža vysokého napätia',
    line: 'Elektrické vedenie',
    minor_line: 'Malé elektrické vedenie',
  },
  railway: 'Železnica',
  aerialway: 'Lanovka, vlek',
  shop: {
    '*': 'Obchod {}',
    convenience: 'Potraviny',
    supermarket: 'Supermarket',
    bakery: 'Pekáreň',
    butcher: 'Mäsiareň',
    ice_cream: 'Zmrzlina',
    kiosk: 'Stánok',
  },
  historic: {
    '*': 'Historický objekt',
    wayside_cross: 'Prícestný kríž',
    wayside_shrine: 'Božia muka',
    archaeological_site: 'Archeologická nálezisko',
    monument: 'Pomník, monument',
    monastery: 'Kláštor',
    tomb: 'Hrobka',
    ruins: {
      '*': 'Ruiny',
      ruins: {
        castle: 'Zrúcanina hradu',
      },
    },
  },
  barrier: {
    '*': 'Bariéra {}',
    fence: 'Plot',
    wall: 'Múr',
    hedge: 'Živý plot',
    block: 'Blok',
    entrance: 'Vstup',
    gate: 'Brána',
    lift_gate: 'Závora',
    swing_gate: 'Otočná závora',
    bollard: 'Stĺpiky',
    chain: 'Reťaz',
  },
  sport: {
    '*': 'Šport {}',
    soccer: 'Futbal',
    tennis: 'Tenis',
  },
  tourism: {
    '*': '{}',
    viewpoint: 'Výhľad',
    information: {
      '*': 'Informácie',
      information: {
        '*': 'Informácie {}',
        office: 'Informačná kancelária',
        board: 'Informačná tabuľa',
        guidepost: 'Rázcestník, smerovník',
        map: 'Mapa',
      },
    },
    hotel: 'Hotel',
    attraction: 'Atrakcia',
    artwork: {
      '*': 'Umenie',
      artwork_type: {
        bust: 'Busta',
        sculpture: 'Plastika',
        statue: 'Socha',
        mural: 'Nástenná maľba',
        painting: 'Maľba',
        architecture: 'Významná budova, stavba',
      },
    },
    guest_house: 'Apartmán',
    picnic_site: 'Miesto na piknik',
    camp_site: 'Kemp',
    museum: 'Múzeum',
    chalet: 'Chata',
    hostel: 'Hostel',
    motel: 'Motel',
    zoo: 'ZOO',
  },
};

const typeSymbol = {
  way: '─',
  node: '•',
  relation: '▦',
};

function resolveGenericName(
  m: Node,
  tags: Record<string, string>,
): string | undefined {
  const parts = [];

  for (const [k, v] of Object.entries(tags)) {
    const valMapping = m[k];

    if (!valMapping) {
      continue;
    }

    if (typeof valMapping === 'string') {
      parts.push(valMapping.replace('{}', v));
      continue;
    }

    if (valMapping[v]) {
      const subkeyMapping = valMapping[v];

      if (typeof subkeyMapping === 'string') {
        parts.push(subkeyMapping.replace('{}', v));
        continue;
      }

      const res = resolveGenericName(subkeyMapping, tags);

      if (res) {
        parts.push(res.replace('{}', v));
        continue;
      }

      if (typeof subkeyMapping['*'] === 'string') {
        parts.push(subkeyMapping['*'].replace('{}', v));
        continue;
      }
    }

    if (typeof valMapping['*'] === 'string') {
      parts.push(valMapping['*'].replace('{}', v));
      continue;
    }
  }

  return parts.length === 0 ? undefined : parts.join('; ');
}

function getName(element: OverpassElement) {
  if (!element.tags) {
    return '???';
  }

  const name = element.tags['name'];

  const ref = element.tags['ref'];

  const operator = element.tags['operator'];

  let subj: string | undefined = resolveGenericName(mapping, element.tags);

  if (element.type === 'relation' && element.tags['type'] === 'route') {
    const color =
      colorNames[
        (element.tags['osmc:symbol'] ?? '').replace(/:.*/, '') ||
          (element.tags['color'] ?? '')
      ] ?? '';

    subj = color + ' ' + subj;
  }

  return (
    typeSymbol[element.type] +
    ' ' +
    ((subj ?? '???') + ' "' + (name ?? ref ?? operator ?? '') + '"')
  )
    .replace(/""/g, '')
    .trim();
}

// console.log(
//   'RRRRRRRRRRR',
//   // resolveGenericName(mapping, {
//   //   amenity: 'shelter',
//   //   shelter_type: 'weather_shelter',
//   // }),
//   // resolveGenericName(mapping, {
//   //   highway: 'foo',
//   // }),
//   // ';',
//   // resolveGenericName(mapping, {
//   //   highway: 'service',
//   // }),
//   // ';',
//   // resolveGenericName(mapping, {
//   //   highway: 'service',
//   //   service: 'driveway',
//   // }),
//   // ';',
//   // resolveGenericName(mapping, {
//   //   highway: 'service',
//   //   service: 'bla',
//   // }),
//   // resolveGenericName(mapping, {
//   //   leisure: 'pitch',
//   //   sport: 'soccer',
//   // }),
// );
