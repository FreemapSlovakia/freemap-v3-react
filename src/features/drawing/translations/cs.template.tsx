import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const cs: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Vlastnosti',
  edit: {
    title: 'Vlastnosti',
    color: 'Barva',
    fillColor: 'Barva výplně',
    label: 'Popis',
    width: 'Šířka',
    hint: 'Klávesou Enter začnete nový řádek. Pokud chcete popis odstranit, nechte pole prázdné.',
    shape: 'Tvar',
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
  cutHole: 'Vyříznout díru',
  cutHoleHint: 'Nakreslete díru uvnitř tohoto polygonu.',
  makeHole: 'Změnit na díru v obklopujícím polygonu',
  detachHole: 'Oddělit díru',
};

export default cs;
