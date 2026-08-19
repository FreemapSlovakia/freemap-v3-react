import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const cs: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Vlastnosti',
  edit: {
    pointKeys: 'Napište {klíč} pro vlastnost a {location} pro polohu.',
    lineKeys:
      'Napište {klíč} pro vlastnost, {length} pro délku ({length_m}, {length_km}, {length_mi}) a {azimuth} u přímé čáry ze dvou bodů.',
    polygonKeys:
      'Napište {klíč} pro vlastnost, {area} pro plochu ({area_m2}, {area_a}, {area_ha}, {area_km2}) a {perimeter} pro obvod ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    properties: 'Vlastnosti',
    propertyKey: 'Název',
    propertyValue: 'Hodnota',
    addProperty: 'Přidat vlastnost',
    removeProperty: 'Odstranit vlastnost',
    insertIntoLabel: 'Vložit do popisu',
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
