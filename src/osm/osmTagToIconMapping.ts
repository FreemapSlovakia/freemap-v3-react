import aerodrome from 'fm3/images/poiIcons/aerodrome.svg';
import alpine_hut from 'fm3/images/poiIcons/alpine_hut.svg';
import arch from 'fm3/images/poiIcons/arch.svg';
import archaeological_site from 'fm3/images/poiIcons/archaeological_site.svg';
import artwork from 'fm3/images/poiIcons/artwork.svg';
import attraction from 'fm3/images/poiIcons/attraction.svg';
import bar from 'fm3/images/poiIcons/bar.svg';
import bare_rock from 'fm3/images/poiIcons/bare_rock.svg';
import basic_hut from 'fm3/images/poiIcons/basic_hut.svg';
import beehive from 'fm3/images/poiIcons/beehive.svg';
import bench from 'fm3/images/poiIcons/bench.svg';
import board from 'fm3/images/poiIcons/board.svg';
import boundary_stone from 'fm3/images/poiIcons/boundary_stone.svg';
import bunker from 'fm3/images/poiIcons/bunker.svg';
import bus_station from 'fm3/images/poiIcons/bus_station.svg';
import cafe from 'fm3/images/poiIcons/cafe.svg';
import camp_site from 'fm3/images/poiIcons/camp_site.svg';
import castle from 'fm3/images/poiIcons/castle.svg';
import cave_entrance from 'fm3/images/poiIcons/cave_entrance.svg';
import chalet from 'fm3/images/poiIcons/chalet.svg';
import chimney from 'fm3/images/poiIcons/chimney.svg';
import cliff from 'fm3/images/poiIcons/cliff.svg';
import community_centre from 'fm3/images/poiIcons/community_centre.svg';
import confectionery from 'fm3/images/poiIcons/confectionery.svg';
import convenience from 'fm3/images/poiIcons/convenience.svg';
import cross from 'fm3/images/poiIcons/cross.svg';
import drinking_spring from 'fm3/images/poiIcons/drinking_spring.svg';
import drinking_water from 'fm3/images/poiIcons/drinking_water.svg';
import dyke from 'fm3/images/poiIcons/dyke.svg';
import earth_bank from 'fm3/images/poiIcons/earth_bank.svg';
import embankment from 'fm3/images/poiIcons/embankment.svg';
import fast_food from 'fm3/images/poiIcons/fast_food.svg';
import fell from 'fm3/images/poiIcons/fell.svg';
import firepit from 'fm3/images/poiIcons/firepit.svg';
import fire_station from 'fm3/images/poiIcons/fire_station.svg';
import fixme from 'fm3/images/poiIcons/fixme.svg';
import foresters_lodge from "fm3/images/poiIcons/forester's_lodge.svg";
import fountain from 'fm3/images/poiIcons/fountain.svg';
import free_flying from 'fm3/images/poiIcons/free_flying.svg';
import fuel from 'fm3/images/poiIcons/fuel.svg';
import gate from 'fm3/images/poiIcons/gate.svg';
import vineyard from 'fm3/images/poiIcons/grapes.svg';
import cemetery from 'fm3/images/poiIcons/grave.svg';
import guest_house from 'fm3/images/poiIcons/guest_house.svg';
import guidepost from 'fm3/images/poiIcons/guidepost.svg';
import gully from 'fm3/images/poiIcons/gully.svg';
import horse from 'fm3/images/poiIcons/horse.svg';
import hospital from 'fm3/images/poiIcons/hospital.svg';
import hostel from 'fm3/images/poiIcons/hostel.svg';
import hotel from 'fm3/images/poiIcons/hotel.svg';
import hot_spring from 'fm3/images/poiIcons/hot_spring.svg';
import hunting_stand from 'fm3/images/poiIcons/hunting_stand.svg';
import hut from 'fm3/images/poiIcons/hut.svg';
import lean_to from 'fm3/images/poiIcons/lean_to.svg';
import lift_gate from 'fm3/images/poiIcons/lift_gate.svg';
import manger from 'fm3/images/poiIcons/manger.svg';
import map from 'fm3/images/poiIcons/map.svg';
import mast from 'fm3/images/poiIcons/mast_other.svg';
import memorial from 'fm3/images/poiIcons/memorial.svg';
import military_area from 'fm3/images/poiIcons/military_area.svg';
import mine from 'fm3/images/poiIcons/mine.svg';
import monument from 'fm3/images/poiIcons/monument.svg';
import motel from 'fm3/images/poiIcons/motel.svg';
import museum from 'fm3/images/poiIcons/museum.svg';
import not_drinking_spring from 'fm3/images/poiIcons/not_drinking_spring.svg';
import office from 'fm3/images/poiIcons/office.svg';
import orchard from 'fm3/images/poiIcons/orchard.svg';
import peak from 'fm3/images/poiIcons/peak.svg';
import pharmacy from 'fm3/images/poiIcons/pharmacy.svg';
import picnic_shelter from 'fm3/images/poiIcons/picnic_shelter.svg';
import picnic_table from 'fm3/images/poiIcons/picnic_table.svg';
import shelter from 'fm3/images/poiIcons/shelter.svg';
import spring from 'fm3/images/poiIcons/spring.svg';
import weather_shelter from 'fm3/images/poiIcons/weather_shelter.svg';
import { Node } from './types';

export const osmTagToIconMapping: Node = {
  aeroway: {
    aerodrome,
  },
  amenity: {
    bar,
    bench,
    cafe,
    community_centre,
    drinking_water,
    fast_food,
    feeding_place: manger,
    fire_station,
    fountain,
    fuel,
    hospital,
    hunting_stand,
    pharmacy,
    shelter: {
      '*': shelter,
      shelter_type: {
        basic_hut,
        lean_to,
        picnic_shelter,
        weather_shelter,
      },
    },
  },
  barrier: { gate, lift_gate },
  building: { hut },
  fixme: {
    '*': fixme,
  },
  historic: {
    archaeological_site,
    boundary_stone,
    castle,
    memorial,
    mine,
    mine_shaft: mine,
    monument,
    wayside_cross: cross,
  },
  landuse: {
    vineyard,
    cemetery,
    industrial: { industrial: mine },
    military: military_area,
    orchard,
  },
  leisure: {
    firepit,
    picnic_table: {
      '*': picnic_table,
      covered: {
        '*': picnic_table,
        yes: 'picnic_shelter',
      },
    },
  },
  man_made: {
    adit: mine,
    beehive,
    chimney,
    cross,
    dyke,
    embankment,
    foresters_lodge,
    mast,
    mineshaft: mine,
  },
  millitary: {
    bunker,
  },
  natural: {
    arch,
    bare_rock,
    cave_entrance,
    cliff,
    earth_bank,
    fell,
    gully,
    hot_spring,
    peak,
    spring: {
      '*': spring,
      drinking_water: {
        no: not_drinking_spring,
        yes: drinking_spring,
      },
    },
  },
  shop: {
    confectionery,
    convenience,
  },
  sport: { free_flying },
  tourism: {
    alpine_hut,
    artwork,
    attraction,
    bus_station,
    camp_site,
    chalet,
    guest_house,
    hostel,
    hotel,
    information: {
      information: {
        board,
        guidepost,
        map,
        office,
      },
    },
    motel,
    museum,
  },
  type: {
    route: {
      route: { horse },
    },
  },
};
