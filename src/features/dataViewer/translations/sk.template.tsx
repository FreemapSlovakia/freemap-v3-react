import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const sk: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  info: () => <DataViewerDetails />,
  upload: 'Nahrať',
  unnamedTrack: ({ n }) => `Trasa ${n}`,
  convertLossWarning:
    'Prevod na kresbu nahradí trasu a zahodí jej zaznamenané údaje (nadmorská výška, tep, rýchlosť, čas).',
  convertAllToDrawing: 'Skonvertovať všetko na kreslenie',
  moreInfo: 'Viac info',
  saveAsMap: 'Uložiť do mojich máp',
  unsaved: 'Neuložené',
  unsavedTooltip:
    'Táto trasa nie je v žiadnej uloženej mape ani v odkaze – zostáva len v tomto prehliadači, takže zdieľaním odkazu ju nezdieľate. Uložte ju do svojich máp, aby ste ju zachovali.',
  loginToSaveMap: 'Pre uloženie trasy do vašich máp sa najprv prihláste.',
  style: {
    title: 'Predvolený štýl',
  },
  match: {
    menuItem: 'Priradiť k cestám',
    title: 'Priradiť k cestám',
    help: 'Prichytí trasu na sieť zmapovaných ciest a chodníkov, čím odstráni rozptyl GPS a — hlavne — zistí, po čom trasa vedie, takže ju možno vyfarbiť podľa povrchu, typu cesty, kvality lesnej cesty či náročnosti.',
    transport: 'Spôsob prepravy',
    dataLoss:
      'Priradená línia má vlastné body, takže časové značky a namerané údaje zo senzorov (tep, kadencia, rýchlosť) sa stratia.',
    run: 'Priradiť',
    tooLong: 'Táto trasa má priveľa bodov na priradenie.',
    tooShort: 'Trasa je príliš krátka na priradenie.',
    brokenSequence:
      'Trasa niekde opúšťa sieť zmapovaných ciest, preto ju nemožno priradiť. Skúste iný spôsob prepravy alebo ju nechajte tak, ako je.',
    offNetwork:
      'Priradená trasa vyšla oveľa dlhšia než pôvodná, čo znamená, že trasa nešla po zmapovaných cestách — napríklad cez lúku. Priradenie vie odpovedať len existujúcimi cestami, takže výsledok by nebol tam, kade ste šli. Trasa zostáva nezmenená.',
    partial:
      'Niektoré časti trasy sa nepodarilo priradiť — zostávajú tak, ako boli zaznamenané. Trasu, ktorá v polovici mení spôsob prepravy (túra a potom cesta autom domov), treba najprv rozdeliť.',
  },
  details: {
    startTime: 'Čas štartu',
    finishTime: 'Čas v cieli',
    duration: 'Trvanie',
    distance: 'Vzdialenosť',
    avgSpeed: 'Priemerná rýchlosť',
    minEle: 'Najnižší bod',
    maxEle: 'Najvyšší bod',
    uphill: 'Celkové stúpanie',
    downhill: 'Celkové klesanie',
    durationValue: ({ h, m }) => `${h} hodín ${m} minút`,
    source: 'Zdroj výšky',
    sourceOriginal: 'zaznamenaná',
    sourcePartial: 'zaznamenaná, neúplná',
    sourceFilledGaps: 'zaznamenaná, medzery doplnené (model terénu)',
    sourceFilled: 'model terénu',
  },
  uploadModal: {
    title: 'Importovať súbor',
    drop: 'Potiahnite sem súbor GPX, KML, KMZ, TCX alebo GeoJSON alebo kliknite sem pre jeho výber.',
    mergeTitle: 'Údaje sú už načítané',
    mergeMessage:
      'Niektoré geoúdaje sú už zobrazené. Pripojiť k nim importované údaje, alebo ich nahradiť?',
    append: 'Pripojiť',
    replace: 'Nahradiť',
  },
  elevationFill: {
    title: 'Nadmorská výška',
    introNone: 'Táto trasa nemá údaje o nadmorskej výške.',
    introPartial: 'Tejto trase chýba nadmorská výška pre niektoré body.',
    introFull:
      'Táto trasa už má nadmorskú výšku, no model terénu býva často presnejší.',
    premiumHiRes: (premiumLink) => (
      <>
        S {premiumLink('prémiovým prístupom')} sa nadmorská výška v
        podporovaných krajinách získava z národného modelu vo vysokom rozlíšení
        — zatiaľ Slovensko (DMR 5.0: ÚGKK SR), ďalšie pribudnú.
      </>
    ),
    question: 'Čo chcete urobiť?',
    overrideAll: 'Prepísať všetko',
    overrideAllDesc:
      'nahradiť každý bod z modelu terénu — plynulý a konzistentný profil',
    fillMissing: 'Doplniť chýbajúce',
    fillMissingDesc:
      'zachovať zaznamenané hodnoty a doplniť len medzery (na rozhraní ' +
      'oboch zdrojov môže vzniknúť skok)',
    keep: 'Nič nemeniť',
    keepDesc: 'použiť nadmorskú výšku uloženú v trase',
    add: 'Doplniť výšku',
    update: 'Aktualizovať výšku',
    updateConfirm: 'Nahradiť nadmorskú výšku trasy modelom terénu?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Chýbajúca nadmorská výška bola doplnená.'
        : 'Nadmorská výška bola prepísaná.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní záznamu trasy', err),
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri priraďovaní trasy', err),
  loadingError: 'Súbor sa nepodarilo načítať.',
  onlyOne: 'Očakáva sa iba jeden súbor.',
  invalidFormat: 'Súbor nie je v podporovanom formáte alebo je neplatný.',
  someFilesFailed: ({ names }) =>
    `Niektoré súbory sa nepodarilo načítať: ${names}.`,
};

export default sk;
