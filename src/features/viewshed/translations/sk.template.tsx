import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const sk: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Vybrať v mape',
  locate: 'Viditeľnosť z mojej polohy',
  pickViewpointPrompt: 'Kliknite do mapy tam, odkiaľ sa chcete pozerať',
  detail: 'Kvalita / rýchlosť',
  details: {
    superfast: 'Najnižšia / najrýchlejšia',
    fast: 'Nízka / rýchla',
    standard: 'Štandardná',
    detailed: 'Detailná / pomalá',
    finest: 'Najjemnejšia / najpomalšia',
  },
  settings: 'Nastavenia viditeľnosti',
  targetHeight: 'Výška cieľa',
  targetHeightHint:
    'Aké vysoké je to, na čo sa pozeráte — zdvihnutím zistíte, odkiaľ by bolo vidieť stožiar alebo človeka na hrebeni.',
  color: 'Farba',
  strength: 'Sýtosť',
  strengthMeasured: 'Podľa merania',
  strengthHint:
    'Vrstva je tieňovaná tým, akú časť terénu vidíte, takže plochy videné takmer zboku vychádzajú veľmi bledo. Zvýšením sa bledý koniec nadvihne bez toho, aby sa zvyšok zarovnal.',
  minOpacity: 'Najnižšia sýtosť',
  minOpacityHint:
    'Ako sýto je vykreslený viditeľný terén, aj keď ho vidíte takmer zboku. Pri 100 % je vrstva iba šablóna: buď vidno, alebo nevidno, nič medzi tým.',
  update: 'Aktualizovať',
  outdated: 'Vrstva je z predchádzajúceho stanoviska.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Čaká sa na vykresľovaciu službu…'
      : ahead === 1
        ? 'Čaká sa — pred vami je 1 výpočet.'
        : ahead < 5
          ? `Čaká sa — pred vami sú ${ahead} výpočty.`
          : `Čaká sa — pred vami je ${ahead} výpočtov.`,
  errors: {
    offline: 'Viditeľnosť počíta server a vy ste offline.',
    unreachable:
      'Vykresľovacia služba je nedostupná. Môže byť mimo prevádzky, alebo niečo medzi vami a ňou blokuje požiadavku.',
    busy: 'Vykresľovacia služba je práve zaneprázdnená. Skúste to o chvíľu.',
    tooMany:
      'V poslednom čase priveľa výpočtov. Skúste to neskôr alebo si zaobstarajte prémiový prístup.',
    noData: 'Pre toto stanovisko nie sú údaje o teréne. Skúste kliknúť inam.',
    failed: 'Viditeľnosť sa nepodarilo vypočítať.',
  },
};

export default sk;
