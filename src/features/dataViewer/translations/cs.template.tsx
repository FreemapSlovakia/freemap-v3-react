import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const cs: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  style: {
    title: 'Výchozí styl',
  },
  split: {
    action: 'Rozdělit',
    pick: 'Klikněte na trasu v místě rozdělení',
    here: 'Rozdělit zde',
    segments: 'Rozdělit na úseky',
  },
  join: {
    action: 'Spojit',
    asLine: 'Spojit do jedné čáry',
    asSegments: 'Spojit se zachováním úseků',
    pick: 'Klikněte na trasu, se kterou spojit',
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
  unnamedTrack: ({ n }) => `Trasa ${n}`,
  convertLossWarning:
    'Převod na kresbu nahradí trasu a zahodí její zaznamenaná data (nadmořská výška, tep, rychlost, čas).',
  convertAllToDrawing: 'Zkonvertovat vše na kreslení',
  simplifyAll: 'Zjednodušit vše',
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
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při přiřazování trasy', err),
  loadingError: 'Soubor se nepodařilo načíst.',
  onlyOne: 'Očekává se pouze jeden soubor.',
  invalidFormat: 'Soubor není v podporovaném formátu nebo je neplatný.',
  someFilesFailed: ({ names }) =>
    `Některé soubory se nepodařilo načíst: ${names}.`,
  unsaved: 'Neuloženo',
  unsavedTooltip:
    'Tato trasa není v žádné uložené mapě ani v odkazu – zůstává jen v tomto prohlížeči, takže sdílením odkazu ji nesdílíte. Uložte ji do svých map, abyste ji zachovali.',
};

export default cs;
