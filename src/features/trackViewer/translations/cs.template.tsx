import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const cs: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Nahrát',
  trackLabel: 'Trasa',
  unnamedTrack: ({ n }) => `Trasa ${n}`,
  convertLossWarning:
    'Převod na kresbu nahradí trasu a zahodí její zaznamenaná data (nadmořská výška, tep, rychlost, čas).',
  moreInfo: 'Více info',
  saveAsMap: 'Uložit do mých map',
  loginToSaveMap: 'Pro uložení trasy do vašich map se nejprve přihlaste.',
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
    source: 'Zdroj výšky',
    sourceOriginal: 'zaznamenaná',
    sourcePartial: 'zaznamenaná, neúplná',
    sourceFilledGaps: 'zaznamenaná, mezery doplněné (model terénu)',
    sourceFilled: 'model terénu',
  },
  uploadModal: {
    title: 'Importovat soubor',
    drop: 'Přetáhněte sem soubor GPX, KML, KMZ, TCX nebo GeoJSON, nebo sem klikněte pro jeho výběr.',
    mergeTitle: 'Data jsou již načtena',
    mergeMessage:
      'Některá geodata jsou již zobrazena. Připojit k nim importovaná data, nebo je nahradit?',
    append: 'Připojit',
    replace: 'Nahradit',
  },
  elevationFill: {
    title: 'Nadmořská výška',
    introNone: 'Tato trasa nemá údaje o nadmořské výšce.',
    introPartial: 'Této trase chybí nadmořská výška u některých bodů.',
    introFull:
      'Tato trasa už má nadmořskou výšku, ale model terénu bývá často ' +
      'přesnější.',
    premiumHiRes: (premiumLink) => (
      <>
        S {premiumLink('prémiovým přístupem')} se nadmořská výška v
        podporovaných zemích získává z národního modelu ve vysokém rozlišení —
        zatím Slovensko (DMR 5.0: ÚGKK SR), další přibudou.
      </>
    ),
    question: 'Co chcete udělat?',
    overrideAll: 'Přepsat vše',
    overrideAllDesc:
      'nahradit každý bod z modelu terénu — plynulý a konzistentní profil',
    fillMissing: 'Doplnit chybějící',
    fillMissingDesc:
      'zachovat zaznamenané hodnoty a doplnit jen mezery (na rozhraní obou ' +
      'zdrojů může vzniknout skok)',
    keep: 'Nic neměnit',
    keepDesc: 'použít nadmořskou výšku uloženou v trase',
    add: 'Doplnit výšku',
    update: 'Aktualizovat výšku',
    updateConfirm: 'Nahradit nadmořskou výšku trasy modelem terénu?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Chybějící nadmořská výška byla doplněna.'
        : 'Nadmořská výška byla přepsána.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání záznamu trasy', err),
  loadingError: 'Soubor se nepodařilo načíst.',
  onlyOne: 'Očekává se pouze jeden soubor.',
  invalidFormat: 'Soubor není v podporovaném formátu nebo je neplatný.',
  someFilesFailed: ({ names }) =>
    `Některé soubory se nepodařilo načíst: ${names}.`,
};

export default cs;
