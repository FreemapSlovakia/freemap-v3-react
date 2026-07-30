import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const sk: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Nahrávať',
  resume: 'Pokračovať',
  pause: 'Pozastaviť',
  stop: 'Zastaviť',
  connect: 'Pripojiť',
  install: 'Nainštalovať zaznamenávač',
  update: 'Aktualizovať zaznamenávač',
  save: 'Uložiť do trás',
  delete: 'Zmazať záznam',
  settings: 'Nastavenia záznamu',
  details: 'Podrobnosti záznamu',
  state: {
    recording: 'Nahráva sa',
    paused: 'Pozastavené',
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
    ascent: 'Stúpanie',
    speed: 'Rýchlosť',
    avgSpeed: 'Priemerná rýchlosť',
    accuracy: 'Presnosť',
    points: 'Body',
    segments: 'Úseky',
    lastFix: 'Posledný bod',
  },
  deleteModal: {
    title: 'Zmazať záznam?',
    message:
      'Zaznamenávač zahodí celú svoju trasu. Túto akciu nemožno vrátiť späť. ' +
      'Ak si chcete záznam ponechať, najprv ho uložte do svojich trás.',
    confirm: 'Zmazať',
  },
  setup: {
    title: 'Zaznamenávač nemusí prežiť dlhé nahrávanie',
    permissionFine: 'Nie je povolená presná poloha.',
    permissionBackground:
      'Nie je povolená poloha na pozadí, takže nahrávanie sa zastaví, keď ' +
      'aplikácia nie je v popredí.',
    permissionNotifications:
      'Nie sú povolené upozornenia, takže Android môže službu nahrávania zastaviť.',
    battery:
      'Zaznamenávač podlieha optimalizácii batérie, takže ho Android môže zastaviť.',
    oem: ({ vendor }) =>
      `Na zariadeniach ${vendor} treba ručne zmeniť nastavenia automatického ` +
      `spúšťania alebo batérie, inak sa zaznamenávač na pozadí zastaví.`,
    open: 'Otvoriť zaznamenávač',
  },
  errors: {
    unreachable:
      'Zaznamenávač neodpovedal. Skontrolujte, či je nainštalovaný a spustený.',
    lnaDenied:
      'Prehliadač odmietol prístup k lokálnej sieti, takže živý náhľad nie je ' +
      'k dispozícii. Samotné nahrávanie to neovplyvní.',
    setupNeeded:
      'Zaznamenávač zatiaľ nemôže nahrávať — otvorte ho a udeľte, o čo žiada.',
    recording: 'Pred zmazaním trasy zastavte nahrávanie.',
    outdated: 'Zaznamenávač je pre túto verziu mapy príliš starý.',
    unsupported: 'Tento zaznamenávač túto funkciu neponúka.',
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
    recorderUnsupported:
      'Nainštalovaný zaznamenávač tieto nastavenia ignoruje. Aktualizujte ho, ' +
      'aby sa uplatnili.',
    intervalMs: 'Čas medzi meraniami (s)',
    minDistanceM: 'Minimálna vzdialenosť medzi meraniami (m)',
    maxAccuracyM: 'Zahodiť merania s presnosťou horšou ako (m)',
    maxAccuracyOff: 'Ponechať všetky merania',
    priority: 'Presnosť',
    priorityHigh: 'Najvyššia (GPS, najviac batérie)',
    priorityBalanced: 'Vyvážená',
    priorityLow: 'Nízka (najmenej batérie)',
    displaySection: 'Zobrazenie',
    splitGapS: 'Začať nový úsek po prestávke (min)',
    splitGapOff: 'Nikdy nedeliť',
    splitGapHint:
      'Prestávka dlhšia ako táto sa vykreslí a exportuje ako medzera, nie ako ' +
      'priama čiara cez ňu.',
    showAccuracyCircle: 'Zobraziť presnosť posledného merania',
    followPosition: 'Držať mapu na poslednom meraní',
    keepScreenAwake: 'Nechať obrazovku zapnutú počas nahrávania',
  },
};

export default sk;
