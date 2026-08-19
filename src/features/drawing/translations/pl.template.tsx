import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const pl: DeepPartialWithRequiredObjects<DrawingMessages> = {
  edit: {
    pointKeys: 'Wpisz {klucz} dla właściwości i {location} dla położenia.',
    lineKeys:
      'Wpisz {klucz} dla właściwości, {length} dla długości ({length_m}, {length_km}, {length_mi}) oraz {azimuth} dla prostej linii z dwóch punktów.',
    polygonKeys:
      'Wpisz {klucz} dla właściwości, {area} dla powierzchni ({area_m2}, {area_a}, {area_ha}, {area_km2}) i {perimeter} dla obwodu ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    properties: 'Właściwości',
    propertyKey: 'Nazwa',
    propertyValue: 'Wartość',
    addProperty: 'Dodaj właściwość',
    removeProperty: 'Usuń właściwość',
    insertIntoLabel: 'Wstaw do etykiety',
    title: 'Właściwości',
    color: 'Kolor',
    fillColor: 'Kolor wypełnienia',
    label: 'Etykieta',
    width: 'Szerokość',
    hint: 'Enter zaczyna nowy wiersz. Aby usunąć etykietę, pozostaw to pole puste.',
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
