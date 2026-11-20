import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const fr: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Prévisions météo',
  loading: 'Chargement des prévisions…',
  failed: 'Impossible de charger les prévisions.',
  elevation: ({ elevation }) => `Pour ${elevation} m d’altitude`,
  updated: ({ time }) => `Mise à jour : ${time}`,
  source: 'Source',
  gusts: 'rafales',
  alongRoute: 'Météo le long de l’itinéraire',
  start: 'Départ',
  highest: 'Point le plus haut',
  finish: 'Arrivée',
  along: ({ distance }) => `Après ${distance}`,
  beyond: 'Au-delà des prévisions',
  locked: 'La météo le long de l’itinéraire avec l’accès premium',
  noRoute: 'Planifiez d’abord un itinéraire.',
  past: 'Avec ce départ, tout l’itinéraire est déjà passé. Choisissez-en un plus tard.',
  pause: 'Pause',
  overnight: 'Nuitée',
  pickPrompt:
    'Cliquez sur la carte à l’endroit où vous souhaitez les prévisions.',
  otherPlace: 'Autre lieu',
};

export default fr;
