import { LegendMessages } from './LegendMessages.js';

const en: LegendMessages = {
  body: ({ name }) => (
    <>
      Map legend for <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Accommodation',
    'gastro-poi': 'Food & Drink',
    institution: 'Institutions',
    sport: 'Sports',
    'natural-poi': 'Natural features',
    poi: 'Other points of interest',
    landcover: 'Land cover',
    water: 'Water',
    'roads-and-paths': 'Roads and paths',
    railway: 'Railways',
    terrain: 'Terrain',
    borders: 'Borders',
    other: 'Other',
  },
};

export default en;
