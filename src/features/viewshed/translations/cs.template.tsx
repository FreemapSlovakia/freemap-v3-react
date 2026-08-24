import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const cs: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Vybrat v mapě',
  locate: 'Viditelnost z mé polohy',
  pickViewpointPrompt: 'Klikněte do mapy tam, odkud se chcete dívat',
  detail: 'Kvalita / rychlost',
  details: {
    superfast: 'Nejnižší / nejrychlejší',
    fast: 'Nízká / rychlá',
    standard: 'Standardní',
    detailed: 'Detailní / pomalá',
    finest: 'Nejjemnější / nejpomalejší',
  },
  settings: 'Nastavení viditelnosti',
  targetHeight: 'Výška cíle',
  targetHeightHint:
    'Jak vysoké je to, na co se díváte — zvednutím zjistíte, odkud by byl vidět stožár nebo člověk na hřebeni.',
  color: 'Barva',
  strength: 'Sytost',
  strengthMeasured: 'Podle měření',
  strengthHint:
    'Vrstva je stínovaná tím, jakou část terénu vidíte, takže plochy viděné téměř zboku vycházejí velmi bledě. Zvýšením se bledý konec nadzvedne, aniž by se zbytek zarovnal.',
  minOpacity: 'Nejnižší sytost',
  minOpacityHint:
    'Jak sytě je vykreslen viditelný terén, i když jej vidíte téměř zboku. Při 100 % je vrstva jen šablona: buď vidět, nebo ne, nic mezi tím.',
  update: 'Aktualizovat',
  outdated: 'Vrstva je z předchozího stanoviště.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Čeká se na vykreslovací službu…'
      : ahead === 1
        ? 'Čeká se — před vámi je 1 výpočet.'
        : ahead < 5
          ? `Čeká se — před vámi jsou ${ahead} výpočty.`
          : `Čeká se — před vámi je ${ahead} výpočtů.`,
  errors: {
    offline: 'Viditelnost počítá server a vy jste offline.',
    unreachable:
      'Vykreslovací službu se nepodařilo kontaktovat. Může být mimo provoz, nebo něco mezi vámi a jí blokuje požadavek.',
    busy: 'Vykreslovací služba je právě zaneprázdněná. Zkuste to za chvíli.',
    tooMany:
      'V poslední době příliš mnoho výpočtů. Zkuste to později nebo si pořiďte prémiový přístup.',
    noData: 'Pro toto stanoviště nejsou data o terénu. Zkuste kliknout jinam.',
    failed: 'Viditelnost se nepodařilo spočítat.',
  },
};

export default cs;
