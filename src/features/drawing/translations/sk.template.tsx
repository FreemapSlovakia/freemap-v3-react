import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { DrawingMessages } from './DrawingMessages.js';

const sk: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Vlastnosti',
  edit: {
    title: 'Vlastnosti',
    color: 'Farba',
    fillColor: 'Farba výplne',
    label: 'Popis',
    width: 'Šírka',
    hint: 'Ak chcete popis odstrániť, nechajte pole popisu prázdne.',
    shape: 'Tvar',
    icon: 'Ikona',
    iconChoose: 'Vybrať ikonu…',
    iconNone: 'Bez ikony',
    iconSearch: 'Hľadať ikony',
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
};

export default sk;
