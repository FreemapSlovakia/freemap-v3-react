import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const pl: DeepPartialWithRequiredObjects<DrawingMessages> = {
  edit: {
    title: 'Właściwości',
    color: 'Kolor',
    fillColor: 'Kolor wypełnienia',
    label: 'Etykieta',
    width: 'Szerokość',
    hint: 'Aby usunąć etykietę, pozostaw to pole puste.',
    shape: 'Kształt',
    text: 'Tekst',
    textHint: 'Ikona lub maksymalnie 2 znaki wyświetlane w znaczniku.',
    type: 'Typ geometrii',
    dashArray: 'Styl kreskowania',
    lineCap: 'Zakończenie linii',
    lineCapRound: 'Okrągłe',
    lineCapButt: 'Płaskie',
    lineCapSquare: 'Kwadratowe',
    lineJoin: 'Połączenie linii',
    lineJoinRound: 'Okrągłe',
    lineJoinMiter: 'Ostre',
    lineJoinBevel: 'Ścięte',
  },
  defProps: {
    menuItem: 'Ustawienia stylu',
    title: 'Domyślne ustawienia stylu rysowania',
    applyToAll: 'Zapisz i zastosuj do wszystkich',
  },
  projection: {
    projectPoint: 'Wyznacz punkt',
    azimuth: 'Azymut',
    distance: 'Dystans',
  },
  modify: 'Właściwości',
  continue: 'Kontynuuj',
  join: 'Połącz',
  split: 'Podziel',
  stopDrawing: 'Zakończ rysowanie',
  selectPointToJoin: 'Wybierz punkt do połączenia linii',
  reverse: 'Odwróć kierunek',
  simplify: 'Uprość',
  cutHole: 'Wytnij otwór',
  cutHoleHint: 'Narysuj otwór wewnątrz tego wielokąta.',
  makeHole: 'Zamień na otwór w otaczającym wielokącie',
  detachHole: 'Odłącz otwór',
};

export default pl;
