import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const cs: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Nahrát',
  moreInfo: 'Více info',
  share: 'Uložit na server',
  colorizingMode: {
    none: 'Neaktivní',
    elevation: 'Nadmořská výška',
    steepness: 'Sklon',
    speed: 'Rychlost',
    heartRate: 'Tepová frekvence',
    cadence: 'Kadence',
    power: 'Výkon',
    temperature: 'Teplota',
    time: 'Čas',
    heading: 'Směr',
  },
  details: {
    startTime: 'Čas startu',
    finishTime: 'Čas v cíli',
    duration: 'Trvání',
    distance: 'Vzdálenost',
    avgSpeed: 'Průměrná rychlost',
    minEle: 'Nejnižší bod',
    maxEle: 'Nejvyšší bod',
    uphill: 'Celkové stoupání',
    downhill: 'Celkové klesání',
    durationValue: ({ h, m }) => `${h} hodin ${m} minut`,
  },
  uploadModal: {
    title: 'Importovat soubor',
    drop: 'Přetáhněte sem soubor GPX nebo GeoJSON, nebo sem klikněte pro jeho výběr.',
  },
  elevationFill: {
    title: 'Nadmořská výška',
    introNone: 'Tato trasa nemá údaje o nadmořské výšce.',
    introPartial: 'Této trase chybí nadmořská výška u některých bodů.',
    introFull:
      'Tato trasa už má nadmořskou výšku, ale model NASA SRTM (~30 m) bývá ' +
      'často přesnější.',
    question: 'Co chcete udělat?',
    overrideAll: 'Přepsat vše',
    overrideAllDesc:
      'nahradit každý bod z modelu SRTM — plynulý a konzistentní profil',
    fillMissing: 'Doplnit chybějící',
    fillMissingDesc:
      'zachovat zaznamenané hodnoty a doplnit jen mezery (na rozhraní obou ' +
      'zdrojů může vzniknout skok)',
    keep: 'Ponechat zaznamenané',
    keepDesc: 'použít nadmořskou výšku uloženou v trase',
    add: 'Doplnit výšku',
  },
  shareToast:
    'Trasa byla uložena na server a můžete ji sdílet zkopírovaním URL stránky.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání záznamu trasy', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se uložit trasu', err),
  loadingError: 'Soubor se nepodařilo načíst.',
  onlyOne: 'Očekává se pouze jeden soubor.',
  invalidFormat: 'Soubor není v podporovaném formátu nebo je neplatný.',
  tooBigError: 'Nahraný soubor je příliš velký.',
};

export default cs;
