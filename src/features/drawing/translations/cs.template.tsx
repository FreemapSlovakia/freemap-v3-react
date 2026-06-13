import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { DrawingMessages } from './DrawingMessages.js';

const cs: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Vlastnosti',
  edit: {
    title: 'Vlastnosti',
    color: 'Barva',
    fillColor: 'Barva výplně',
    label: 'Popis',
    width: 'Šířka',
    hint: 'Pokud chcete popis odstránit, nechte pole popisu prázdné.',
    shape: 'Tvar',
    icon: 'Ikona',
    iconChoose: 'Vybrat ikonu…',
    iconNone: 'Bez ikony',
    iconSearch: 'Hledat ikony',
    text: 'Text',
    textHint: 'Ikona nebo nejvýše 2 znaky zobrazené ve značce.',
    type: 'Typ geometrie',
    dashArray: 'Styl čárkování',
    lineCap: 'Konec čáry',
    lineCapRound: 'Kulatý',
    lineCapButt: 'Rovný',
    lineCapSquare: 'Čtvercový',
    lineJoin: 'Spoj čar',
    lineJoinRound: 'Kulatý',
    lineJoinMiter: 'Ostrý',
    lineJoinBevel: 'Zkosený',
  },
  continue: 'Pokračovat',
  join: 'Spojit',
  split: 'Rozdělit',
  stopDrawing: 'Ukončit kreslení',
  selectPointToJoin: 'Zvolte bod pro spojení čar',
  defProps: {
    menuItem: 'Nastavit styl',
    title: 'Nastavení stylu kreslení',
    applyToAll: 'Uložit a aplikovat na všechno',
  },
  projection: {
    projectPoint: 'Zaměřit bod',
    distance: 'Vzdálenost',
    azimuth: 'Azimut',
  },
  reverse: 'Obrátit směr',
  simplify: 'Zjednodušit',
};

export default cs;
