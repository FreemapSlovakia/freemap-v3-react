import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const sk: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Nahrávať',
  pause: 'Pozastaviť',
  stop: 'Ukončiť',
  connect: 'Pripojiť',
  install: 'Nainštalovať zaznamenávač',
  update: 'Aktualizovať zaznamenávač',
  delete: 'Zmazať záznam',
  settings: 'Nastavenia záznamu',
  details: 'Podrobnosti záznamu',
  pinHint: 'Zaškrtnuté hodnoty sa zobrazia aj v nástrojovej lište.',
  state: {
    recording: 'Nahráva sa',
    stopped: 'Zastavené',
    unknown: 'Nepripojené',
  },
  connection: {
    connecting: 'Pripájanie k zaznamenávaču…',
    syncing: 'Načítava sa trasa…',
    live: 'Naživo',
    reconnecting: 'Obnovuje sa spojenie…',
    offline: 'Bez živého náhľadu',
  },
  stats: {
    distance: 'Vzdialenosť',
    duration: 'Trvanie',
    elevation: 'Nadmorská výška',
    ascent: 'Stúpanie',
    speed: 'Rýchlosť',
    avgSpeed: 'Priemerná rýchlosť',
    accuracy: 'Presnosť',
    satellites: 'Satelity',
    points: 'Body',
    segments: 'Úseky',
    lastFix: 'Posledný bod',
  },
  stopModal: {
    title: 'Ukončiť záznam?',
    runningMessage: ({ tool }) => (
      <>
        Nahrávanie stále beží. Ukončením sa zastaví a trasa sa presunie do
        nástroja <b>{tool}</b>. V zaznamenávači nezostane nič, takže ďalšie
        nahrávanie začne novú trasu.
      </>
    ),
    stoppedMessage: ({ tool }) => (
      <>
        Trasa sa presunie do nástroja <b>{tool}</b> a v zaznamenávači nezostane
        nič, takže ďalšie nahrávanie začne novú trasu.
      </>
    ),
    confirm: 'Ukončiť',
  },
  deleteModal: {
    title: 'Zmazať záznam?',
    message:
      'Zaznamenávač zahodí celú svoju trasu. Túto akciu nemožno vrátiť späť. ' +
      'Ak si záznam chcete ponechať, namiesto toho ho ukončite.',
    confirm: 'Zmazať',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Zaznamenávač nemusí prežiť dlhé nahrávanie:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'Nie je povolená presná poloha.',
    permissionBackground:
      'Nie je povolená poloha na pozadí, takže nahrávanie sa zastaví, keď ' +
      'aplikácia nie je v popredí.',
    permissionNotifications:
      'Nie sú povolené upozornenia, takže Android môže službu nahrávania zastaviť.',
    battery:
      'Zaznamenávač podlieha optimalizácii batérie, takže ho Android môže zastaviť.',
    oem: ({ vendor }) =>
      `Zariadenia ${vendor} obmedzujú aplikácie na pozadí nad rámec pravidiel ` +
      `Androidu a príslušný krok v zaznamenávači nie je potvrdený.`,
    open: 'Otvoriť zaznamenávač',
  },
  errors: {
    unreachable: 'Zaznamenávač neodpovedal — možno nie je spustený.',
    lnaDenied:
      'Prehliadač odmietol prístup k lokálnej sieti, takže živý náhľad nie je ' +
      'k dispozícii. Samotné nahrávanie to neovplyvní.',
    setupNeeded:
      'Zaznamenávač zatiaľ nemôže nahrávať — otvorte ho a udeľte, o čo žiada.',
    recording: 'Pred zmazaním trasy zastavte nahrávanie.',
    incomplete:
      'Časť záznamu sa na túto stránku ešte nedostala, takže sa nič neprevzalo ' +
      'ani nezmazalo. Obnovte spojenie a ukončite znova.',
    notStored:
      'Záznam sa nepodarilo uložiť v tomto prehliadači, takže zostal v ' +
      'zaznamenávači. Máte ho v trasách — odtiaľ ho vyexportujte alebo uložte.',
    notPersisted:
      'Prehliadač neprisľúbil, že si ponechá svoje úložisko, takže záznam ' +
      'zostal v zaznamenávači. Máte ho v trasách — vyexportujte alebo uložte ' +
      'ho a potom záznam zmažte.',
    needsForeground:
      'Android nedovolil zaznamenávaču spustiť sa z pozadia. Otvorte ho a ' +
      'spustite nahrávanie v ňom, alebo mu povoľte bežať bez obmedzení ' +
      'batérie, aby sa dal spustiť odtiaľto.',
    outdated: 'Zaznamenávač je pre túto verziu mapy príliš starý.',
    http: 'Zaznamenávač odpovedal chybou.',
    protocol: 'Zaznamenávač odpovedal niečím neočakávaným.',
    unknown: 'Komunikácia so zaznamenávačom zlyhala.',
  },
  settingsModal: {
    title: 'Nastavenia záznamu',
    recorderSection: 'Čo sa zaznamenáva',
    recorderIntro:
      'Zaznamenávač ich uplatní pri spustení nahrávania, takže ich zmena ' +
      'neovplyvní už bežiaci záznam.',
    intervalMs: 'Čas medzi meraniami',
    minDistanceM: 'Minimálna vzdialenosť medzi meraniami',
    maxAccuracyM: 'Zahodiť merania s presnosťou horšou ako',
    maxAccuracyOff: 'Ponechať všetky merania',
    source: 'Zdroj polohy',
    sourceGps: 'GPS prijímač',
    sourceFused: 'Kombinovaný (GPS, wifi a senzory)',
    sourceHint:
      'Prijímač meria nadmorskú výšku pri každom meraní; kombinovaný zdroj vás ' +
      'lepšie umiestni medzi budovami a pod stromami, ale tú istú výšku ' +
      'opakuje aj niekoľko sekúnd.',
    priority: 'Presnosť',
    priorityHigh: 'Najvyššia (GPS, najviac batérie)',
    priorityBalanced: 'Vyvážená',
    priorityLow: 'Nízka (najmenej batérie)',
    priorityFusedOnly: 'Týka sa len kombinovaného zdroja.',
    displaySection: 'Zobrazenie',
    splitGapS: 'Začať nový úsek po prestávke',
    splitGapOff: 'Nikdy nedeliť',
    splitGapHint:
      'Prestávka dlhšia ako táto sa vykreslí a exportuje ako medzera, nie ako ' +
      'priama čiara cez ňu.',
    feedLocation: 'Použiť záznam pre „Kde som?“',
    feedLocationHint:
      'Počas nahrávania „Kde som?“ zobrazuje zaznamenané body namiesto toho, ' +
      'aby prehliadač sledoval GPS samostatne.',
    keepScreenAwake: 'Nechať obrazovku zapnutú počas nahrávania',
  },
};

export default sk;
