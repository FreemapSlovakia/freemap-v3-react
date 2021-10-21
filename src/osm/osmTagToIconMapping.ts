import peak from 'fm3/images/poiIcons/peak.svg';
import picnic_shelter from 'fm3/images/poiIcons/picnic_shelter.svg';
import shelter from 'fm3/images/poiIcons/shelter.svg';
import spring from 'fm3/images/poiIcons/spring.svg';
import weather_shelter from 'fm3/images/poiIcons/weather_shelter.svg';
import { Node } from './types';

export const osmTagToIconMapping: Node = {
  natural: { spring, peak },
  amenity: {
    shelter: {
      '*': shelter,
      shelter_type: {
        picnic_shelter,
        weather_shelter,
      },
    },
  },
};
