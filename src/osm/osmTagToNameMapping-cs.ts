import { Node } from './types';
export const osmTagToNameMapping: Node = {
  highway: {
    '*': 'Cesta {}',
    bus_stop: 'Autobusová zastávka',
    construction: "Cesta ve výstavbě",
    crossing: "Přechod",
    cycleway: "Cyklostezka",
    footway: 'Chodník',
    living_street: "Rezidenční zóna",
    motorway_link: "Napojení na dálnici",
    motorway: "Dálnice",
    path: "Pěšina",
    primary_link: "Napojení na cestu první třídy",
    primary: "Cesta první třídy",
    residential: "Ulice",
    secondary: "Cesta druhé třídy",
    secondaty_link: "Napojení na cestu druhé třídy",
    service: {
      '*': "Servisní, příjezdová cesta",
      service: {
        '*': "Servisní cesta {}",
        alley: "Příjezdová cesta",
        bus: "Cesta vyhražená pro autobusy",
        driveway: "Příjezdová cesta",
        'drive-through': "Cesta pro nákup z auta",
        emergency_access: "Požární cesta",
        parking_aisle: "Cesta parkoviště"
      }
    },
    steps: 'Schody',
    tertiary_link: "Napojení na cestu třetí třídy",
    tertiary: "Cesta třetí třídy",
    track: {
      '*': "Lesní / polní cesta",
      tracktype: {
        grade1: "Zpevněná lesní / polní cesta",
        grade2: "Převážně zpevněná lesní / polní cesta",
        grade3: "Méňe pevná lesní / polní cesta",
        grade4: "Převážně měkká lesní / polní cesta",
        grade5: "Měkká lesní / polní cesta"
      }
    },
    trunk_link: "Napojení na cestu pro motorová vozidla",
    trunk: "Silnice pro motorová vozidla",
    unclassified: 'Neklasifikovaná cesta'
  },
  boundary: {
    '*': "Oblast",
    administrative: {
      '*': "Administrativní oblast",
      admin_level: {
        '10': "Katastrální území",
        '9': 'Obec',
        '8': 'Okres',
        '7': "Oblast",
        '6': "Město",
        '5': "Provincie",
        '4': 'Kraj',
        '3': "Region",
        '2': "Stát"
      }
    },
    protected_area: "Chráněná oblast",
    national_park: "Národní park" // *

  },
  type: {
    route: {
      '*': 'Trasa',
      route: {
        '*': 'Trasa {}',
        bicycle: "Cyklostezka",
        bus: 'Trasa autobusu',
        foot: "Stezka pro pěší",
        hiking: "Turistická stezka",
        horse: "Jezdecká trasa",
        mtb: "Stezka pro horská kola",
        piste: "Sjezdovka",
        railway: "Železnice",
        ski: "Lyžařská stezka",
        tram: "Tramvajová dráha"
      }
    }
  },
  building: {
    '*': 'Budova {}',
    apartments: 'Apartmány',
    bungalow: 'Bungalov',
    cabin: "Bouda, chatka",
    cathedral: 'Katedrála',
    chapel: "Kaplička",
    church: "Kostel",
    commercial: "Budova určená pro komerční účely",
    detached: "Samostatně stojící rodinný dům",
    dormitory: 'Internát',
    farm: "Statek",
    garage: 'Garáž',
    hotel: "Hotel",
    house: "Rodinný dům",
    houseboat: 'Hausbót',
    industrial: "Budova určená pro průmyslové účely",
    mosque: 'Mešita',
    office: "Kancelářská budova",
    residential: "Obytný dům",
    semidetached_house: "Dvojdům",
    shrine: "Svatyně",
    static_caravan: "Obytný přívěs, karavan",
    synagogue: "Synagoga",
    temple: 'Chrám',
    terrace: "Radový dům",
    train_station: "Vlaková stanice",
    yes: 'Budova'
  },
  amenity: {
    '*': '{}',
    atm: 'Bankomat',
    bank: 'Banka',
    bar: 'Bar',
    bbq: 'Gril',
    // *
    bench: 'Lavička',
    bicycle_parking: "Parkoviště pro kola",
    brothel: 'Bordel',
    // *
    bureau_de_change: "Směnárna",
    // *
    bus_station: "Autobusové nádraží",
    cafe: "Kavárna",
    casino: "Kasino",
    // *
    charging_station: "Nabíjecí stanice",
    clinic: 'Poliklinika',
    community_centre: "Komunitní centrum",
    // *
    courthouse: "Soud",
    // *
    dentist: "Zubní ordinace",
    doctors: "Lékařská ordinace",
    drinking_water: 'Pitná voda',
    embassy: 'Ambasáda',
    // *
    fast_food: "Rychlé občerstvení",
    fire_station: "Hasičská stanice",
    fountain: 'Fontána',
    fuel: "Čerpací stanice",
    gambling: "Herna",
    // *
    grave_yard: "Pohřebiště",
    // *
    hospital: "Nemocnice",
    hunting_stand: "Myslivecký posed",
    kindergarten: "Školka",
    library: "Knihovna",
    monastery: "Klášter",
    // *
    nightclub: "Noční klub",
    // *
    parking: "Parkování",
    pharmacy: "Lékárna",
    place_of_mourning: "Dům smutku",
    // *
    place_of_worship: "Chrám/kostel",
    planetarium: 'Planetárium',
    // *
    police: "Policie",
    post_box: "Poštovní schránka",
    post_office: 'Pošta',
    prison: "Věznice",
    // *
    pub: "Hospoda",
    recycling: "Recyklování",
    restaurant: "Restaurace",
    school: 'Škola',
    shelter: {
      '*': "Přístřešek",
      shelter_type: {
        '*': "Přístřešek {}",
        basic_hut: 'Jednoduchá chata, bivak',
        changing_rooms: "Převlékárna",
        field_shelter: "Polní přístřešek",
        lean_to: "Přístřešek s otevřenou stěnou",
        picnic_shelter: "Piknikový přístřešek",
        public_transport: "Přístřešek veřejné dopravy",
        rock_shelter: "Skalní úkryt",
        sun_shelter: "Přístřešek proti slunci",
        weather_shelter: "Přístřešek proti nepříznivému počasí"
      }
    },
    social_centre: "Sociální centrum",
    // *
    social_facility: "Sociální zařízení",
    // *
    taxi: 'Taxi',
    // *
    telephone: "Telefon",
    toilets: 'WC',
    townhall: "Radnice, obecní úřad",
    university: 'Univerzita',
    // *
    vending_machine: 'Automat',
    veterinary: "Veterinář",
    // *
    watering_place: "Napajedlo",
    // *
    waste_basket: "Odpadkový koš",
    waste_disposal: "Odpadkový koš"
  },
  waterway: {
    '*': "Vodní tok {}",
    canal: 'Kanál',
    river: "Řeka",
    stream: 'Potok',
    ditch: "Příkop",
    drain: "Dranáž",
    waterfall: 'Vodopád',
    riverbank: "Břeh",
    dam: "Přehrada"
  },
  landuse: {
    '*': '{}',
    allotments: "Zahrádkářská oblast",
    brownfield: "Brownfield",
    // *
    cemetery: "Hřbitov",
    commercial: "Komerční zóna",
    construction: "Staveniště",
    // *
    farmland: 'Pole',
    farmyard: 'Družstvo',
    forest: 'Les',
    garages: 'Garáže',
    // *
    grass: 'Tráva',
    greenfield: "Greenfield",
    industrial: "Industriální zóna",
    landfill: 'Skládka',
    // *
    meadow: "Louka",
    military: "Vojenský újezd",
    orchard: 'Sad',
    plant_nursery: "Lesní školka",
    // *
    quarry: 'Lom',
    recreation_ground: "Rekreační zóna",
    // *
    religions: "Cirkevní pozemek",
    reservoir: "Přehrada / vodní nádrž",
    residential: "Rezidenční zóna",
    retail: "Nákupní zóna",
    // *
    vineyard: "Vinice",
    winter_sports: "Zimní sporty" // *

  },
  leisure: {
    '*': '{}',
    dog_park: "Park pro psy",
    // *
    firepit: "Ohniště",
    fishing: "Místo pro rybolov",
    // *
    fitness_centre: "Posilovna",
    // *
    fitness_station: "Posilovací zařízení",
    // *
    garden: "Zahrada",
    golf_course: "Golfové hřiště",
    // *
    horse_riding: "Jízda na koni",
    // *
    nature_reserve: "Přírodní rezervace",
    // *
    park: 'Park',
    picnic_table: "Piknikový stůl",
    pitch: "Hřiště",
    playground: "Dětské hřiště",
    sports_centre: "Sportovní centrum",
    // *
    sports_hall: "Sportovní hala",
    // *
    stadium: "Stadion",
    swimming_pool: 'Bazén',
    track: "Cesta",
    water_park: "Vodní park" // *

  },
  natural: {
    '*': '{}',
    arch: "Skalní okno",
    bare_rock: "Holá skála",
    // *
    basin: 'Kotlina',
    cave_entrance: "Jeskyně",
    cliff: "Skála",
    geyser: "Gejzir",
    // *
    grassland: "Travnatá vegetace",
    // *
    heath: 'Step',
    hot_spring: "Termální pramen",
    mountain_range: "Pohoří",
    mud: "Bláto",
    // *
    peak: 'Vrchol',
    plateau: 'Planina',
    ridge: "Hřeben",
    rock: "Kámen",
    // *
    saddle: 'Sedlo',
    sand: "Písek",
    // *
    scree: "Suťoviště",
    scrub: "Keře",
    sinkhole: 'Závrt',
    // *
    spring: "Pramen",
    stone: 'Balvan',
    // *
    tree_row: "Stromořadí / větrolam",
    tree: 'Strom',
    valley: "Údolí",
    water: "Vodní plocha",
    wetland: "Mokřad",
    // *
    wood: 'Les'
  },
  man_made: {
    '*': '{}',
    adit: "Důlní štola",
    beehive: "Včelí úl",
    bridge: 'Most',
    // *
    bunker_silo: 'Silo',
    // *
    chimney: 'Komín',
    clearcut: "Roubaniště",
    // *
    communications_tower: "Telekomunikační věž",
    // *
    crane: "Jeřáb",
    // *
    cross: "Kříž",
    // *
    cutline: "Průsek",
    // *
    dyke: "Hráz",
    // *
    embankment: 'Násyp',
    lighthouse: 'Maják',
    // *
    mast: "Stožár",
    // *
    mineshaft: "Důlní šachta",
    observatory: "Observatorium",
    pier: "Molo",
    // *
    pipeline: "Potrubí",
    reservoir_covered: 'Krytý rezervoár',
    // *
    silo: 'Silo',
    survey_point: 'Geodetický bod',
    // *
    telescope: 'Teleskop',
    // *
    tower: {
      '*': "Věž",
      'tower:type': {
        bell_tower: "Zvonice",
        communication: "Telekomunikační věž",
        cooling: "Chladírenská věž",
        observation: "Rozhledna"
      }
    },
    wastewater_plant: "Čistička odpadních vod",
    water_tower: "Vodárenská věž",
    water_well: "Studna",
    // *
    water_works: "Vodohospodářský objekt",
    // *
    watermill: "Vodní mlýn",
    // *
    windmill: "Větrný mlýn",
    // *
    works: 'Fabrika' // *

  },
  power: {
    '*': '{}',
    generator: 'Generátor',
    // *
    line: "Elektrické vedení",
    minor_line: "Vedlejší elektrické vedení",
    plant: "Elektrárna",
    // *
    pole: "Elektrický sloup",
    substation: "Elektrická distribuční stanice",
    // *
    tower: "Stožár vysokého napětí",
    transformer: 'Transformátor' // *

  },
  railway: "Železnice",
  aerialway: 'Lanovka, vlek',
  shop: {
    '*': 'Obchod {}',
    antiques: 'Starožitnosti',
    bakery: "Pekařství",
    bicycle: "Prodej kol",
    books: "Knihkupectví",
    butcher: "Masna",
    car_parts: "Prodej autodílů",
    car_repair: 'Autoservis',
    car: "Prodej aut",
    carpet: "Prodej koberců",
    chemist: "Drogerie",
    clothes: 'Obchod s oblečením',
    computer: 'Počítačový obchod',
    convenience: 'Potraviny',
    copyshop: 'Copy centrum',
    department_store: "Obchodní dům",
    electronics: 'Obchod s elektronikou',
    fabric: 'Metrový textil',
    florist: "Květinářství",
    funeral_directors: "Pohřební služby",
    furniture: "Prodej nábytku",
    garden_center: "Záhradní centrum",
    greengrocer: "Ovoce a zelenina",
    hairdresser: "Kadernictví, holičství",
    hardware: "Železářství",
    ice_cream: 'Zmrzlina',
    jewerly: "Klenotnictví",
    kiosk: "Stánek",
    mall: "Nákupní středisko",
    mobile_phone: "Prodej mobilních telefonů",
    optician: 'Optika',
    outdoor: "Prodej outdoorového vybavení",
    paint: 'Farby, laky',
    pet: "Potřeby pro zvířata",
    radiotechnics: "Prodej elektronických součástek",
    second_hand: 'Second hand',
    shoes: 'Obuv',
    sports: "Sportovní potřeby",
    stationery: "Papírnictví",
    supermarket: 'Supermarket',
    tattoo: "Tetovací studio",
    toys: "Hračkařství",
    trade: 'Stavebniny'
  },
  historic: {
    '*': 'Historický objekt',
    archaeological_site: "Archeologické naleziště",
    castle: 'Hrad',
    // *
    church: "Historický kostel",
    // *
    city_gate: "Městská brána",
    // *
    manor: "Panství",
    // *
    memorial: "Pmátník",
    // *
    monastery: "Klášter",
    monument: 'Pomník, monument',
    ruins: {
      '*': 'Ruiny',
      ruins: {
        castle: "Zřícenina hradu"
      }
    },
    tomb: 'Hrobka',
    wayside_cross: "Křížek u cesty",
    wayside_shrine: "Boží muka"
  },
  barrier: {
    '*': 'Bariéra {}',
    block: 'Blok',
    bollard: "Sloupek",
    border_control: "Hraniční kontrola",
    // *
    chain: "Řetěz",
    ditch: "Příkop",
    // *
    entrance: 'Vstup',
    fence: 'Plot',
    gate: 'Brána',
    hedge: 'Živý plot',
    kerb: 'Obrubník',
    // *
    lift_gate: 'Závora',
    rope: 'Lano',
    // *
    sliding_gate: 'Posuvná brána',
    // *
    swing_gate: "Otoční závora",
    turnstile: 'Turniket',
    // *
    wall: "Zeď"
  },
  sport: {
    '*': "Sport {}",
    basketball: 'Basketbal',
    // *
    beachvolleyball: 'Plážový volejbal',
    // *
    chess: "Šachy",
    // *
    climbing: "Lezení",
    // *
    fitness: "Posilovna",
    // *
    golf: 'Golf',
    // *
    multi: "Různé sporty",
    // *
    running: "Běh",
    // *
    shooting: "Střelba",
    // *
    skiing: "Lyžování",
    // *
    soccer: "Fotbal",
    swimming: "Plavání",
    // *
    tennis: 'Tenis',
    volleyball: 'Volejbal' // *

  },
  tourism: {
    '*': '{}',
    alpine_hut: 'Horská chata',
    // *
    apartment: 'Apartmán',
    artwork: {
      '*': "Umění",
      artwork_type: {
        architecture: 'Významná budova, stavba',
        bust: 'Busta',
        mural: "Nástěnná malba",
        painting: "Obraz",
        sculpture: 'Plastika',
        statue: 'Socha'
      }
    },
    attraction: "Atrakce",
    camp_site: 'Kemp',
    caravan_site: "Autokemp pro obytné přívěsy",
    chalet: 'Chata',
    guest_house: "Penzion",
    hostel: 'Hostel',
    hotel: 'Hotel',
    information: {
      '*': "Informace",
      information: {
        '*': "Informace {}",
        board: "Informační tabule",
        guidepost: "Rozcestník, směrovník",
        map: 'Mapa',
        office: "Informační kancelář"
      }
    },
    motel: 'Motel',
    museum: "Muzeum",
    picnic_site: "Místo na piknik",
    viewpoint: "Výhled",
    wilderness_hut: "Chata v divočině",
    // *
    zoo: 'ZOO'
  },
  place: {
    '*': "Místo {}",
    city: "Velkoměsto",
    country: 'Krajina',
    farm: 'Farma',
    // *
    hamlet: 'Osada',
    island: 'Ostrov',
    // *
    islwt: "Ostrůvek",
    // *
    isolated_dwelling: 'Samota',
    locality: 'Lokalita',
    ocean: 'Oceán',
    // *
    sea: "Moře",
    // *
    state: "Stát",
    square: "Náměstí",
    // *
    suburb: "Předměstí",
    town: "Město",
    village: "Vesnice"
  },
  public_transport: {
    platform: "Nástupiště",
    // *
    station: "Stanice",
    // *
    stop_position: 'Zastávka'
  }
};
export const colorNames: Record<string, string> = {
  red: 'Červená',
  blue: 'Modrá',
  green: 'Zelená',
  yellow: "Žlutá",
  orange: 'Oranžová',
  purple: 'Purpurová',
  violet: 'Fialová',
  white: "Bílá",
  black: "Černá",
  gray: "Šedá",
  brown: "Hnědá"
};
