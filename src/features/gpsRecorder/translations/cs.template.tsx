import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const cs: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Nahrávat',
  pause: 'Pozastavit',
  stop: 'Ukončit',
  connect: 'Připojit',
  install: 'Nainstalovat záznamník',
  update: 'Aktualizovat záznamník',
  delete: 'Smazat záznam',
  settings: 'Nastavení záznamu',
  details: 'Podrobnosti záznamu',
  state: {
    recording: 'Nahrává se',
    stopped: 'Zastaveno',
    unknown: 'Nepřipojeno',
  },
  connection: {
    connecting: 'Připojování k záznamníku…',
    syncing: 'Načítá se trasa…',
    live: 'Živě',
    reconnecting: 'Obnovuje se spojení…',
    offline: 'Bez živého náhledu',
  },
  stats: {
    distance: 'Vzdálenost',
    duration: 'Trvání',
    elevation: 'Nadmořská výška',
    ascent: 'Stoupání',
    speed: 'Rychlost',
    avgSpeed: 'Průměrná rychlost',
    accuracy: 'Přesnost',
    satellites: 'Satelity',
    points: 'Body',
    segments: 'Úseky',
    lastFix: 'Poslední bod',
  },
  stopModal: {
    title: 'Ukončit záznam?',
    message: ({ tool }) => (
      <>
        Nahrávání stále běží. Ukončením se zastaví a trasa se přesune do
        nástroje <b>{tool}</b>. V záznamníku nezůstane nic, takže další
        nahrávání začne novou trasu.
      </>
    ),
    confirm: 'Ukončit',
  },
  deleteModal: {
    title: 'Smazat záznam?',
    message:
      'Záznamník zahodí celou svou trasu. Tuto akci nelze vrátit zpět. ' +
      'Pokud si záznam chcete ponechat, místo toho jej ukončete.',
    confirm: 'Smazat',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Záznamník nemusí přežít dlouhé nahrávání:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'Není povolena přesná poloha.',
    permissionBackground:
      'Není povolena poloha na pozadí, takže nahrávání se zastaví, když ' +
      'aplikace není v popředí.',
    permissionNotifications:
      'Nejsou povolena upozornění, takže Android může službu nahrávání zastavit.',
    battery:
      'Záznamník podléhá optimalizaci baterie, takže jej Android může zastavit.',
    oem: ({ vendor }) =>
      `Zařízení ${vendor} omezují aplikace na pozadí nad rámec pravidel ` +
      `Androidu a příslušný krok v záznamníku není potvrzen.`,
    open: 'Otevřít záznamník',
  },
  errors: {
    unreachable: 'Záznamník neodpověděl — možná není spuštěn.',
    lnaDenied:
      'Prohlížeč odmítl přístup k místní síti, takže živý náhled není ' +
      'k dispozici. Samotné nahrávání to neovlivní.',
    setupNeeded:
      'Záznamník zatím nemůže nahrávat — otevřete jej a udělte, oč žádá.',
    recording: 'Před smazáním trasy zastavte nahrávání.',
    incomplete:
      'Část záznamu se na tuto stránku ještě nedostala, takže se nic ' +
      'nepřevzalo ani nesmazalo. Obnovte spojení a ukončete znovu.',
    notStored:
      'Záznam se nepodařilo uložit v tomto prohlížeči, takže zůstal v ' +
      'záznamníku. Máte jej v trasách — odtud jej vyexportujte nebo uložte.',
    notPersisted:
      'Prohlížeč neslíbil, že si ponechá své úložiště, takže záznam zůstal ' +
      'v záznamníku. Máte jej v trasách — vyexportujte nebo uložte jej a ' +
      'potom záznam smažte.',
    needsForeground:
      'Android nedovolil záznamníku spustit se z pozadí. Otevřete jej a ' +
      'spusťte nahrávání v něm, nebo mu povolte běžet bez omezení baterie, ' +
      'aby šel spustit odtud.',
    outdated: 'Záznamník je pro tuto verzi mapy příliš starý.',
    http: 'Záznamník odpověděl chybou.',
    protocol: 'Záznamník odpověděl něčím neočekávaným.',
    unknown: 'Komunikace se záznamníkem selhala.',
  },
  settingsModal: {
    title: 'Nastavení záznamu',
    recorderSection: 'Co se zaznamenává',
    recorderIntro:
      'Záznamník je uplatní při spuštění nahrávání, takže jejich změna ' +
      'neovlivní již běžící záznam.',
    intervalMs: 'Čas mezi měřeními',
    minDistanceM: 'Minimální vzdálenost mezi měřeními',
    maxAccuracyM: 'Zahodit měření s přesností horší než',
    maxAccuracyOff: 'Ponechat všechna měření',
    source: 'Zdroj polohy',
    sourceGps: 'GPS přijímač',
    sourceFused: 'Kombinovaný (GPS, wifi a senzory)',
    sourceHint:
      'Přijímač měří nadmořskou výšku při každém měření; kombinovaný zdroj ' +
      'vás lépe umístí mezi budovami a pod stromy, ale tutéž výšku opakuje ' +
      'i několik sekund.',
    priority: 'Přesnost',
    priorityHigh: 'Nejvyšší (GPS, nejvíce baterie)',
    priorityBalanced: 'Vyvážená',
    priorityLow: 'Nízká (nejméně baterie)',
    priorityFusedOnly: 'Týká se jen kombinovaného zdroje.',
    displaySection: 'Zobrazení',
    splitGapS: 'Začít nový úsek po přestávce',
    splitGapOff: 'Nikdy nedělit',
    splitGapHint:
      'Přestávka delší než tato se vykreslí a exportuje jako mezera, ne jako ' +
      'přímá čára přes ni.',
    feedLocation: 'Použít záznam pro „Kde jsem?“',
    feedLocationHint:
      'Během nahrávání „Kde jsem?“ zobrazuje zaznamenané body místo toho, ' +
      'aby prohlížeč sledoval GPS samostatně.',
    keepScreenAwake: 'Nechat obrazovku zapnutou během nahrávání',
  },
};

export default cs;
