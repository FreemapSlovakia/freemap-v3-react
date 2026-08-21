import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const pl: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Koloruj według',
  legend: 'Legenda',
  mode: {
    none: 'Nieaktywne',
    elevation: 'Wysokość',
    steepness: 'Stromość',
    speed: 'Prędkość',
    heartRate: 'Tętno',
    cadence: 'Kadencja',
    power: 'Moc',
    temperature: 'Temperatura',
    time: 'Czas',
    heading: 'Kierunek',
    battery: 'Bateria',
    gsmSignal: 'Sygnał GSM',
  },
};

export default pl;
