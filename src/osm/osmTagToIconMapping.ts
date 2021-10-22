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
import not_drinking_spring from 'fm3/images/poiIcons/not_drinking_spring.svg';
import peak from 'fm3/images/poiIcons/peak.svg';
import picnic_shelter from 'fm3/images/poiIcons/picnic_shelter.svg';
import shelter from 'fm3/images/poiIcons/shelter.svg';
import spring from 'fm3/images/poiIcons/spring.svg';
import weather_shelter from 'fm3/images/poiIcons/weather_shelter.svg';
import { Node } from './types';

export const osmTagToIconMapping: Node = {
  natural: {
    spring: {
      '*': spring,
      drinking_water: {
        yes: drinking_spring,
        no: not_drinking_spring,
      },
    },
    earth_bank,
    peak,
    arch,
    bare_rock,
    cave_entrance,
    cliff,
  },
  amenity: {
    bar,
    bench,
    cafe,
    community_centre,
    drinking_water,
    fast_food,
    shelter: {
      '*': shelter,
      shelter_type: {
        picnic_shelter,
        weather_shelter,
        basic_hut,
      },
    },
  },
  tourism: {
    alpine_hut,
    artwork,
    attraction,
    bus_station,
    camp_site,
    chalet,
    information: {
      information: { board },
    },
  },
  aeroway: { aerodrome },
  historic: {
    archaeological_site,
    boundary_stone,
    castle,
    wayside_cross: cross,
  },
  man_made: { beehive, chimney, cross, dyke, embankment },
  millitary: { bunker },
  shop: { confectionery, convenience },
};
