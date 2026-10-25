import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const cs: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  split: {
    action: 'Rozdělit',
    pick: 'Klikněte na trasu v místě rozdělení',
    here: 'Rozdělit zde',
  },
  join: {
    action: 'Spojit',
    asLine: 'Spojit do jedné čáry',
    asSegments: 'Spojit se zachováním úseků',
    pick: 'Klikněte na trasu, kterou chcete připojit',
    pickEnd: 'Zvolte bod pro spojení čar',
  },
  osmUpload: {
    menuItem: 'Nahrát GPS stopu na OpenStreetMap',
    title: 'Nahrát GPS stopu na OpenStreetMap',
    help: 'Nahraje načtené trasy do vašeho účtu OpenStreetMap jako GPS stopu, podle které mohou mapovači zakreslit cesty. Nahrají se jen trasy se zaznamenanými časy – jiné OpenStreetMap neuchovává. Nahrávejte jen trasy, které jste sami zaznamenali.',
    description: 'Popis',
    tags: 'Štítky',
    tagsHint: 'Oddělené čárkami.',
    tagsInvalid:
      'OpenStreetMap ve štítku nepřijme . ; / ? % ani # a ani štítek delší než 255 znaků.',
    visibility: 'Viditelnost',
    visibilities: {
      identifiable: 'Identifikovatelná',
      public: 'Veřejná',
      trackable: 'Sledovatelná',
      private: 'Soukromá',
    },
    visibilityHints: {
      identifiable:
        'Zobrazená v seznamu stop s vaším jménem, jako seřazené body s časovými značkami.',
      public:
        'Zobrazená v seznamu stop s vaším jménem, jako anonymní neseřazené body.',
      trackable: 'Sdílená jen jako anonymní seřazené body s časovými značkami.',
      private: 'Sdílená jen jako anonymní neseřazené body.',
    },
    upload: 'Nahrát',
    loginPrompt:
      'Pro nahrání se musíte přihlásit přes OpenStreetMap a povolit Freemapu nahrávat GPS stopy. Pokračovat?',
    connectPrompt:
      'Pro nahrání musíte k účtu Freemap připojit účet OpenStreetMap a povolit Freemapu do něj nahrávat GPS stopy. Pokud už máte jiný účet Freemap, do kterého se přihlašujete tímto účtem OpenStreetMap, oba účty se sloučí do jednoho. Pokračovat?',
    authorizePrompt:
      'Pro nahrání musíte povolit Freemapu nahrávat GPS stopy do vašeho účtu OpenStreetMap. Pokračovat?',
    reauthorize:
      'Povolení Freemapu nahrávat GPS stopy do vašeho účtu OpenStreetMap bylo právě odvoláno. Klikněte znovu na Nahrát a povolte ho.',
    success: ({ url }) => (
      <>
        Trasa byla nahrána. OpenStreetMap ji zpracuje během několika minut.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Zobrazit stopu na OpenStreetMap
        </a>
      </>
    ),
  },
  match: {
    menuItem: 'Přiřadit k cestám',
    title: 'Přiřadit k cestám',
    help: 'Přichytí trasu k síti zmapovaných cest a stezek, čímž odstraní rozptyl GPS a — hlavně — zjistí, po čem trasa vede, takže ji lze obarvit podle povrchu, typu cesty, kvality lesní cesty či náročnosti.',
    transport: 'Způsob dopravy',
    dataLoss:
      'Přiřazená linie má vlastní body, takže časové značky a naměřená data ze senzorů (tep, kadence, rychlost) se ztratí.',
    run: 'Přiřadit',
    tooLong: 'Tato trasa má příliš mnoho bodů na přiřazení.',
    tooShort: 'Trasa je příliš krátká na přiřazení.',
    brokenSequence:
      'Trasa někde opouští síť zmapovaných cest, proto ji nelze přiřadit. Zkuste jiný způsob dopravy nebo ji nechte tak, jak je.',
    offNetwork:
      'Přiřazená trasa vyšla mnohem delší než původní, což znamená, že trasa nešla po zmapovaných cestách — třeba přes louku. Přiřazení umí odpovědět jen existujícími cestami, takže výsledek by nebyl tam, kudy jste šli. Trasa zůstává beze změny.',
    partial:
      'Některé části trasy se nepodařilo přiřadit — zůstávají tak, jak byly zaznamenány. Trasu, která v polovině mění způsob dopravy (túra a poté cesta autem domů), je třeba nejdřív rozdělit.',
  },
  info: () => <DataViewerDetails />,
  upload: 'Nahrát',
  unnamedTrack: ({ n, kind }) =>
    `${kind === 'track' ? 'Záznam trasy' : kind === 'route' ? 'Plánovaná trasa' : 'Čára'} ${n}`,
  simplifyAll: 'Zjednodušit vše',
  moreInfo: 'Více info',
  breakApart: 'Rozdělit na části',
  saveAsMap: 'Uložit do mých map',
  loginToSaveMap: 'Pro uložení trasy do vašich map se nejprve přihlaste.',
  snapshotGone: 'Data z tohoto kroku už tento prohlížeč neuchovává.',
  snapshotFailed:
    'Tento prohlížeč nedokázal data uchovat, takže po opětovném načtení stránky se ztratí. Chcete-li je zachovat, uložte je do svých map.',
  vertex: {
    menuItem: 'Údaje bodu',
    latitude: 'Zeměpisná šířka',
    longitude: 'Zeměpisná délka',
    elevation: 'Nadmořská výška',
    time: 'Čas',
    filled: ({ filled, total }) => `${filled} z ${total} bodů`,
    emptyHint:
      'Prázdné pole nechá bod bez této hodnoty. Jaké hodnoty čára má, se nastavuje v jejích vlastnostech.',
    notANumber: 'Zadejte číslo.',
    outOfRange: 'Mimo rozsah.',
    timeOrder: 'Čas musí ležet mezi časy předchozího a dalšího bodu.',
    channels: {
      heart: 'Tep',
      cads: 'Kadence',
      atemps: 'Teplota vzduchu',
      wtemps: 'Teplota vody',
      depths: 'Hloubka',
      speeds: 'Rychlost',
      courses: 'Směr pohybu',
      bearings: 'Azimut',
      powers: 'Výkon',
      accuracies: 'Přesnost',
      battery: 'Baterie',
      gsmSignal: 'Signál GSM',
    },
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
    existingData: 'Existující data',
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
    clear: 'Vymazat výšku',
    clearDesc: 'odstranit uloženou výšku; profily ji pak čtou z modelu terénu',
    update: 'Aktualizovat výšku',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Chybějící nadmořská výška byla doplněna.'
        : mode === 'clear'
          ? 'Nadmořská výška byla vymazána.'
          : 'Nadmořská výška byla přepsána.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání záznamu trasy', err),
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při přiřazování trasy', err),
  osmUploadError: ({ err }) =>
    addError(
      getMessages()!,
      'Nastala chyba při nahrávání na OpenStreetMap',
      err,
    ),
  loadingError: 'Soubor se nepodařilo načíst.',
  onlyOne: 'Očekává se pouze jeden soubor.',
  invalidFormat: 'Soubor není v podporovaném formátu nebo je neplatný.',
  someFilesFailed: ({ names }) =>
    `Některé soubory se nepodařilo načíst: ${names}.`,
  unsaved: 'Neuloženo',
  unsavedTooltip:
    'Tato data nejde vložit do adresy stránky (URL) a nejsou v žádné uložené mapě – zůstávají jen v tomto prohlížeči. Uložte je do svých map, abyste je zachovali.',
};

export default cs;
