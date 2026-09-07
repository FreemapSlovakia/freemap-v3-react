import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const pl: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Wybierz na mapie',
  locate: 'Widoczność z mojej pozycji',
  pickViewpointPrompt: 'Kliknij na mapie miejsce, z którego chcesz patrzeć',
  detail: 'Jakość / szybkość',
  details: {
    superfast: 'Najniższa / najszybsza',
    fast: 'Niska / szybka',
    standard: 'Standardowa',
    detailed: 'Szczegółowa / wolna',
    finest: 'Najdokładniejsza / najwolniejsza',
  },
  settings: 'Ustawienia widoczności',
  targetHeight: 'Wysokość celu',
  targetHeightHint:
    'Jak wysokie jest to, na co patrzysz — podnieś, by zobaczyć, skąd byłby widoczny maszt albo człowiek na grani.',
  color: 'Kolor',
  strength: 'Nasycenie',
  strengthMeasured: 'Zgodnie z pomiarem',
  strengthHint:
    'Warstwa jest cieniowana tym, jaką część terenu widzisz, więc powierzchnie oglądane niemal z boku wychodzą bardzo blado. Zwiększenie podnosi blady koniec, nie spłaszczając reszty.',
  minOpacity: 'Najniższe krycie',
  minOpacityHint:
    'Jak mocno rysowany jest widoczny teren, nawet oglądany niemal z boku. Przy 100% warstwa jest zwykłym szablonem: widać albo nie widać, nic pomiędzy.',
  update: 'Aktualizuj',
  outdated: 'Warstwa jest z poprzedniego punktu obserwacji.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Czekanie na renderer…'
      : ahead === 1
        ? 'Czekanie — przed tobą 1 obliczenie.'
        : ahead < 5
          ? `Czekanie — przed tobą ${ahead} obliczenia.`
          : `Czekanie — przed tobą ${ahead} obliczeń.`,
  errors: {
    offline: 'Widoczność liczy serwer, a ty jesteś offline.',
    unreachable:
      'Nie udało się połączyć z usługą renderującą. Może być wyłączona albo coś między tobą a nią blokuje żądanie.',
    busy: 'Usługa renderująca jest teraz niedostępna. Spróbuj za chwilę.',
    tooMany:
      'Ostatnio wykonano zbyt wiele obliczeń. Spróbuj później albo wykup premium.',
    noData:
      'Dla tego punktu obserwacji nie ma danych o terenie. Spróbuj kliknąć gdzie indziej.',
    failed: 'Nie udało się obliczyć widoczności.',
  },
};

export default pl;
