import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ColorizerMessages } from './ColorizerMessages.js';

const pl: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Koloruj według',
  premiumDuringLaunch: 'Premium — bezpłatnie w okresie wprowadzenia',
  legend: 'Legenda',
  compass: {
    n: 'N',
    e: 'E',
    s: 'S',
    w: 'W',
  },
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
