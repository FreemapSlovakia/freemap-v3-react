import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const pl: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>Miejsce obserwacji wybierz przyciskiem {icon} poniżej.</>
  ),
  rendering: 'Renderowanie panoramy…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Czekanie na renderer…'
      : ahead === 1
        ? 'Czekanie — przed tobą 1 panorama.'
        : ahead < 5
          ? `Czekanie — przed tobą ${ahead} panoramy.`
          : `Czekanie — przed tobą ${ahead} panoram.`,
  cancel: 'Anuluj',
  update: 'Aktualizuj',
  outdated: 'Obraz jest z poprzedniego punktu obserwacji.',
  locate: 'Widok z mojej pozycji',
  pickViewpoint: 'Wybierz na mapie',
  pickViewpointPrompt: 'Kliknij na mapie miejsce, z którego chcesz patrzeć',
  lookAt: 'Spójrz na miejsce na mapie',
  pickTargetPrompt: 'Kliknij na mapie miejsce, na które chcesz spojrzeć',
  createToposcope: 'Utwórz tablicę panoramiczną z tego widoku',
  toposcopeMergeModal: {
    title: 'Mapa nie jest pusta',
    message:
      'Na mapie są już narysowane punkty. Dodać do nich szczyty z tego widoku, czy je zastąpić? Środek tablicy tak czy inaczej przesunie się na ten punkt obserwacji.',
    append: 'Dodaj',
    replace: 'Zastąp',
  },
  settings: {
    title: 'Ustawienia panoramy',
    tiltHint: 'Ile nieba i ziemi mieści obraz — kąty nad horyzontem i pod nim.',
    custom: 'Dokładne kąty',
    depthLift: 'Rozwiń dal',
    depthLiftOff: 'Widok wierny',
    depthLiftHint:
      'Podnosi odległy teren, dzięki czemu dalekie pasma odrywają się od grani przed nimi — tak jak na panoramie rysowanej ręcznie. Do obrazu trafiają przez to również szczyty, których stąd naprawdę nie widać; ich nazwy są oznaczone.',
    rangeHint:
      'Teren powyżej 300 km należy do premium. Każdy dodatkowy kilometr przechodzony jest wzdłuż każdego promienia obrazu, więc dalszy widok kosztuje renderer proporcjonalnie więcej.',
    look: 'Wygląd',
    looks: {
      natural: 'Naturalny',
      relief: 'Cieniowana rzeźba',
      drawn: 'Rysowany',
      engraved: 'Rytowany',
      custom: 'Własny',
    },
    ridgeStrength: 'Wyrazistość linii grani',
    ridgeWidth: 'Grubość linii grani',
    ridgeColor: 'Kolor grani',
    ground: 'Teren',
    groundHint:
      'Jeden kolor, który wbudowana mgiełka wraz z odległością zmywa ku barwie nieba — albo gradient, który maluje teren zależnie od tego, jak jest daleko, i zastępuje mgiełkę w całości.',
    groundSolid: 'Kolor',
    groundGradient: 'Gradient',
    gradientFar: 'Gradient sięga do',
    gradientFarAuto: 'Automatycznie',
    gradientFarHint:
      'Odległość, na której osiągany jest ostatni kolor; środek paska leży w jednej trzeciej tej odległości. Automatycznie mierzy teren faktycznie widoczny w kadrze, dzięki czemu cała paleta przypada na to, co pokazuje obraz.',
    gradientSky: 'Przejście w niebo',
    gradientSkyHint:
      'Ostatnim kolorem staje się samo niebo, więc dalekie pasma rozpływają się w horyzoncie, zamiast się na nim odcinać. Wyłączone daje twardą linię grani, jakiej chce plakat.',
    gradientClip: 'Ukryj teren dalej',
    gradientClipHint:
      'Teren za tą odległością nie jest rysowany, zamiast być wypełniony ostatnim kolorem, więc cały gradient przypada na to, co pokazuje obraz. Szczyty na nim stojące nie są nazywane.',
  },
  preview: 'Podgląd',
  quality: {
    label: 'Jakość / szybkość',
    superfast: 'Najniższa / najszybsza',
    fast: 'Niska / szybka',
    standard: 'Standardowa',
    detailed: 'Szczegółowa / wolna',
    finest: 'Najdokładniejsza / najwolniejsza',
    premiumHint:
      'Dokładniejsza panorama renderowana jest w rozdzielczości do sześciu razy większej i z dziewięciokrotnym próbkowaniem, dzięki czemu granie wyglądają tak, jak wyglądają naprawdę, a nie jak schodki. Na serwerze renderującym jedną panoramę naraz każdy stopień kosztuje proporcjonalnie więcej, dlatego te dokładniejsze należą do premium.',
  },
  tilt: {
    label: 'Zakres pionowy',
    standard: 'Standardowy',
    wide: 'Wysoki',
    flat: 'Niski',
  },
  labels: {
    title: 'Nazwy szczytów',
    density: 'Liczba nazw',
    none: 'Brak',
    few: 'Mniej',
    normal: 'Normalnie',
    many: 'Więcej',
    weight: 'Oceniaj szczyty według',
    weightHint:
      'Według wielkości nazwane zostaną wielkie góry, choćby najdalsze, pośrodku to, co wypełnia widok, a według bliskości to, co blisko, jakkolwiek by wyglądało.',
    weights: [
      'Wielkości',
      'Raczej wielkości',
      'Wielkości i bliskości',
      'Raczej bliskości',
      'Bliskości',
    ],
    prominence: 'Preferuj prawdziwe góry',
    prominenceOff: 'Wyłączone',
    prominenceHint:
      'Szczyt dostaje nazwę za to, że sam w sobie jest górą, a nie tylko za to, jak wybija się z miejsca, w którym stoisz — dzięki temu również słynny szczyt wciśnięty między wyższych sąsiadów zasłuży na nazwę. Przy wielu szczytach jest nieznana i te oceniane są jak dotąd.',
    haze: 'Jak daleko sięgają nazwy',
    hazeOff: 'Czyste powietrze',
    hazeHint:
      'Jak daleko musi być szczyt, żeby mgiełka znaczyła więcej niż sam szczyt. Powyżej trzykrotności tej odległości nie jest nazywane już nic.',
    showEle: 'Pokaż wysokości',
    showEleHint:
      'Pod nazwą każdego szczytu wypisuje jego wysokość. Podpis ma wtedy dwa wiersze, więc mieści się ich na obrazie mniej.',
    showRevealed: 'Nazywaj odsłonięte szczyty',
    showRevealedHint:
      'Szczyty, które rozwinięcie dali wyciągnęło zza bliższej grani: są narysowane, ale stąd naprawdę ich nie widać. Ich nazwy są jaśniejsze, a gdy brakuje miejsca dla obu, pierwszeństwo ma szczyt widoczny.',
  },
  dominance: {
    label: 'Minimalna dominacja',
    all: 'Dowolna',
  },
  autoPan: 'Obracaj z urządzeniem albo samoczynnie',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
  },
  errors: {
    offline: 'Panoramę renderuje serwer, a ty jesteś offline.',
    unreachable:
      'Nie udało się połączyć z usługą renderującą. Może być wyłączona albo coś między tobą a nią blokuje żądanie.',
    busy: 'Usługa renderująca jest teraz niedostępna. Spróbuj za chwilę.',
    tooMany:
      'Ostatnio wyrenderowano zbyt wiele panoram. Spróbuj później albo wykup premium.',
    noData:
      'Dla tego punktu obserwacji nie ma danych o terenie. Spróbuj kliknąć gdzie indziej.',
    failed: 'Nie udało się wyrenderować panoramy.',
  },
  caveats: {
    title: 'Co obraz pokazuje, a czego nie',
    bareEarth:
      'Model terenu to naga ziemia: nie ma w nim lasów ani budynków, więc widok, który zasłoniłby las, narysowany jest jako wolny. To zdecydowanie największe źródło błędu.',
    coverage:
      'Szczegółowość zależy od kraju. Tam, gdzie istnieje krajowy model z lotniczego skaningu laserowego, bliskie otoczenie jest ostre; gdzie indziej odpowiada globalny model 30 m.',
    viewpoint:
      'Oko umieszczane jest na najwyższym punkcie w promieniu kilku metrów od kliknięcia, żeby widoku ze szczytu nie psuła skała obok ciebie.',
    depthLift:
      'Dal jest rozwinięta, więc ten obraz to rysunek, a nie fotografia: szczyty o jaśniejszej nazwie zasłania w rzeczywistości grań przed nimi, a odległość odczytana z obrazu nie oznacza już wolnej linii widzenia.',
  },
  terrainSource: 'Teren',
  peakSource: 'Nazwy szczytów',
};

export default pl;
