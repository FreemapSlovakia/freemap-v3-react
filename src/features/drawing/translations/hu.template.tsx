import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const hu: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Tulajdonságok',
  edit: {
    title: 'Tulajdonságok',
    color: 'Szín',
    fillColor: 'Kitöltőszín',
    label: 'Felirat',
    width: 'Szélesség',
    hint: 'A felirat eltávolításához hagyja üresen ezt a mezőt.',
    shape: 'Forma',
    icon: 'Ikon',
    iconChoose: 'Ikon kiválasztása…',
    iconNone: 'Nincs ikon',
    iconSearch: 'Ikonok keresése',
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
