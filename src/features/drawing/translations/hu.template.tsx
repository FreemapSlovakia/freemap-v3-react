import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const hu: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Tulajdonságok',
  edit: {
    pointKeys:
      'Írjon {p:nev} elemet a nev nevű tulajdonsághoz és {location} elemet a helyzethez.',
    lineKeys:
      'Írjon {p:nev} elemet a nev nevű tulajdonsághoz, {length} elemet a hosszhoz ({length_m}, {length_km}, {length_mi}), és {azimuth} elemet két pontból álló egyenes vonalhoz.',
    polygonKeys:
      'Írjon {p:nev} elemet a nev nevű tulajdonsághoz, {area} elemet a területhez ({area_m2}, {area_a}, {area_ha}, {area_km2}, {area_ac}) és {perimeter} elemet a kerülethez ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    properties: 'Tulajdonságok',
    propertyKey: 'Név',
    propertyValue: 'Érték',
    addProperty: 'Tulajdonság hozzáadása',
    removeProperty: 'Tulajdonság eltávolítása',
    insertIntoLabel: 'Beszúrás a feliratba',
    title: 'Tulajdonságok',
    color: 'Szín',
    fillColor: 'Kitöltőszín',
    label: 'Felirat',
    width: 'Szélesség',
    hint: 'Az Enter új sort kezd. A felirat eltávolításához hagyja üresen ezt a mezőt.',
    shape: 'Forma',
    text: 'Szöveg',
    textHint: 'Ikon vagy legfeljebb 2 karakter jelenik meg a jelölőn belül.',
    type: 'Geometria típusa',
    dashArray: 'Szaggatás stílusa',
    lineCap: 'Vonalvég',
    lineCapRound: 'Kerek',
    lineCapButt: 'Lapos',
    lineCapSquare: 'Négyzetes',
    lineJoin: 'Vonalcsatlakozás',
    lineJoinRound: 'Kerek',
    lineJoinMiter: 'Éles',
    lineJoinBevel: 'Ferde',
  },
  continue: 'Folytatás',
  join: 'Összekapcsolás',
  split: 'Felosztás',
  stopDrawing: 'Rajzolás befejezése',
  selectPointToJoin: 'Válasszon pontot a vonalak összekapcsolásához',
  reverse: 'Irány megfordítása',
  simplify: 'Egyszerűsítés',
  cutHole: 'Lyuk kivágása',
  cutHoleHint: 'Rajzolja meg a lyukat ezen a sokszögön belül.',
  makeHole: 'Átalakítás a befoglaló sokszög lyukává',
  detachHole: 'Lyuk leválasztása',
  defProps: {
    menuItem: 'Stílusbeállítások',
    title: 'Rajzolási stílus beállításai',
    applyToAll: 'Mentés és alkalmazás mindegyikre',
  },

  projection: {
    projectPoint: 'Pont vetítése',
    distance: 'Távolság',
    azimuth: 'Azimut',
  },
};

export default hu;
