import type { LegendMessages } from './LegendMessages.js';

const en: LegendMessages = {
  body: ({ name }) => (
    <>
      Map legend for <i>{name}</i>
    </>
  ),

  filter: 'Search the legend',

  outdoorMap: {
    'roads-and-paths': 'Roads and paths',
    railway: 'Railways',
    transport: 'Transport',
    water: 'Water',
    terrain: 'Terrain',
    'natural-poi': 'Natural features',
    landcover: 'Land cover',
    borders: 'Borders',
    accommodation: 'Accommodation and shelter',
    'gastro-poi': 'Food & Drink',
    shop: 'Shops',
    sport: 'Sports and leisure',
    tourism: 'Tourism',
    culture: 'Culture and entertainment',
    historic: 'Historical objects',
    religion: 'Places of worship',
    institution: 'Institutions',
    finance: 'Finance',
    health: 'Healthcare',
    'man-made': 'Man-made structures',
    barrier: 'Barriers',
    facility: 'Facilities',
    other: 'Other',
  },
};

export default en;
