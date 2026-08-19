import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const sk: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Vlastnosti',
  edit: {
    pointKeys: 'Napíšte {kľúč} pre vlastnosť a {location} pre polohu.',
    lineKeys:
      'Napíšte {kľúč} pre vlastnosť, {length} pre dĺžku ({length_m}, {length_km}, {length_mi}) a {azimuth} pri priamej čiare z dvoch bodov.',
    polygonKeys:
      'Napíšte {kľúč} pre vlastnosť, {area} pre plochu ({area_m2}, {area_a}, {area_ha}, {area_km2}) a {perimeter} pre obvod ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    properties: 'Vlastnosti',
    propertyKey: 'Názov',
    propertyValue: 'Hodnota',
    addProperty: 'Pridať vlastnosť',
    removeProperty: 'Odstrániť vlastnosť',
    insertIntoLabel: 'Vložiť do popisu',
    title: 'Vlastnosti',
    color: 'Farba',
    fillColor: 'Farba výplne',
    label: 'Popis',
    width: 'Šírka',
    hint: 'Klávesom Enter začnete nový riadok. Ak chcete popis odstrániť, nechajte pole prázdne.',
    shape: 'Tvar',
    text: 'Text',
    textHint: 'Ikona alebo najviac 2 znaky zobrazené v značke.',
    type: 'Typ geometrie',
    dashArray: 'Štýl prerušovania',
    lineCap: 'Koniec čiary',
    lineCapRound: 'Okrúhly',
    lineCapButt: 'Rovný',
    lineCapSquare: 'Štvorcový',
    lineJoin: 'Spoj čiar',
    lineJoinRound: 'Okrúhly',
    lineJoinMiter: 'Ostrý',
    lineJoinBevel: 'Skosený',
  },
  continue: 'Pokračovať',
  join: 'Spojiť',
  split: 'Rozdeliť',
  stopDrawing: 'Ukončiť kreslenie',
  selectPointToJoin: 'Zvoľte bod pre spojenie čiar',
  defProps: {
    menuItem: 'Nastaviť štýl',
    title: 'Nastavenie štýlu kreslenia',
    applyToAll: 'Uložiť a aplikovať na všetko',
  },
  projection: {
    projectPoint: 'Zamerať bod',
    distance: 'Vzdialenosť',
    azimuth: 'Azimut',
  },
  reverse: 'Obrátiť smer',
  simplify: 'Zjednodušiť',
  cutHole: 'Vyrezať dieru',
  cutHoleHint: 'Nakreslite dieru vo vnútri tohto polygónu.',
  makeHole: 'Zmeniť na dieru v obklopujúcom polygóne',
  detachHole: 'Oddeliť dieru',
};

export default sk;
