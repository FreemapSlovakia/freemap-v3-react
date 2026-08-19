import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const sl: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Lastnosti',
  edit: {
    pointKeys: 'Napišite {ključ} za lastnost in {location} za položaj.',
    lineKeys:
      'Napišite {ključ} za lastnost, {length} za dolžino ({length_m}, {length_km}, {length_mi}) in {azimuth} pri ravni črti iz dveh točk.',
    polygonKeys:
      'Napišite {ključ} za lastnost, {area} za površino ({area_m2}, {area_a}, {area_ha}, {area_km2}) in {perimeter} za obseg ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    properties: 'Lastnosti',
    propertyKey: 'Ime',
    propertyValue: 'Vrednost',
    addProperty: 'Dodaj lastnost',
    removeProperty: 'Odstrani lastnost',
    insertIntoLabel: 'Vstavi v oznako',
    title: 'Lastnosti',
    color: 'Barva',
    fillColor: 'Barva polnila',
    label: 'Oznaka',
    width: 'Širina',
    hint: 'S tipko Enter začnete novo vrstico. Če želite oznako odstraniti, pustite polje prazno.',
    shape: 'Oblika',
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
  cutHole: 'Izreži luknjo',
  cutHoleHint: 'Narišite luknjo znotraj tega poligona.',
  makeHole: 'Spremeni v luknjo v obdajajočem poligonu',
  detachHole: 'Loči luknjo',
};

export default sl;
