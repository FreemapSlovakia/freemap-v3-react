import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const sl: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Lastnosti',
  edit: {
    title: 'Lastnosti',
    color: 'Barva',
    fillColor: 'Barva polnila',
    label: 'Oznaka',
    width: 'Širina',
    hint: 'Če želite oznako odstraniti, pustite polje prazno.',
    shape: 'Oblika',
    icon: 'Ikona',
    iconChoose: 'Izberi ikono…',
    iconNone: 'Brez ikone',
    iconSearch: 'Iskanje ikon',
    text: 'Besedilo',
    textHint: 'Ikona ali največ 2 znaka, prikazana v oznaki.',
    type: 'Vrsta geometrije',
    dashArray: 'Slog črtkanja',
    lineCap: 'Konec črte',
    lineCapRound: 'Zaobljen',
    lineCapButt: 'Raven',
    lineCapSquare: 'Kvadraten',
    lineJoin: 'Spoj črt',
    lineJoinRound: 'Zaobljen',
    lineJoinMiter: 'Oster',
    lineJoinBevel: 'Prisekan',
  },
  continue: 'Nadaljuj',
  join: 'Združi',
  split: 'Razdeli',
  stopDrawing: 'Ustavi risanje',
  selectPointToJoin: 'Izberite točko za združitev črt',
  defProps: {
    menuItem: 'Nastavitve sloga',
    title: 'Nastavitve privzetega sloga risanja',
    applyToAll: 'Shrani in uporabi za vse',
  },
  projection: {
    projectPoint: 'Projiciraj točko',
    azimuth: 'Azimut',
    distance: 'Razdalja',
  },
  reverse: 'Obrni smer',
  simplify: 'Poenostavi',
};

export default sl;
