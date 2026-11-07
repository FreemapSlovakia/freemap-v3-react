import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const sl: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Ime',
    email: 'E-pošta',
    description: 'O meni',
    publicFields: ({ profile }) => (
      <>Prikaži na {profile('mojem javnem profilu')}</>
    ),
    delete: 'Izbriši račun',
    deleteWarning:
      'Ali res želite izbrisati svoj račun? Skupaj z njim bodo odstranjene vse vaše fotografije, komentarji in ocene fotografij, vaši zemljevidi in sledene naprave.',
    personalInfo: 'Osebni podatki',
    authProviders: 'Ponudniki prijave',
    picture: 'Profilna slika',
    choosePicture: 'Izberi sliko',
    pictureTooLarge: 'Slika je prevelika. Največja velikost je 5 MB.',
    homeLocation: 'Domači položaj',
    homeLocationUnset: 'Ni nastavljen',
    setHomeLocation: 'Nastavi na zemljevidu',
    roles: 'Moje vloge',
    emailUnconfirmed:
      'Ta naslov še ni potrjen. Dokler ga ne potrdite, Freemap nanj ne pošilja e-pošte in se z njim ni mogoče prijaviti.',
    emailChangeHint:
      'Naslov se spremeni, ko vnesete kodo, ki jo pošljemo nanj.',
    emailConfirmed: 'Vaš e-poštni naslov je potrjen.',
    mergeConflict:
      'Drug račun s tem potrjenim naslovom je povezan z drugim računom istega ponudnika prijave, zato ju ni mogoče združiti.',
    emailMissing:
      'Brez e-poštnega naslova vam Freemap ne more pošiljati e-pošte.',
    emailOnlyLogin:
      'E-pošta je edini način prijave v vaš račun, zato je ni mogoče odstraniti.',
    emailUnconfirmedBar: 'Vaš e-poštni naslov še ni potrjen.',
    emailUnconfirmedBarLink: 'Potrdite ga v svojem računu',
    emailMissingBar:
      'Vaš račun nima e-poštnega naslova, zato vam Freemap ne more pošiljati e-pošte.',
    emailMissingBarLink: 'Dodajte ga v svojem računu',
    dontRemind: 'Ne opominjaj me več',
  },
  emailCode: {
    or: 'ali s kodo po e-pošti',
    email: 'E-poštni naslov',
    send: 'Pošlji kodo',
    sent: ({ email }) => (
      <>
        Na <b>{email}</b> smo poslali 6-mestno kodo. Če ne prispe, preverite
        mapo z neželeno pošto.
      </>
    ),
    code: 'Koda',
    logIn: 'Prijava',
    confirm: 'Potrdi',
    resend: 'Pošlji znova',
    resendIn: ({ seconds }) => `Pošlji znova (${seconds} s)`,
    otherAddress: 'Uporabi drug naslov',
    confirmError: ({ err }) =>
      addError(getMessages()!, 'Napaka pri potrjevanju kode', err),
    wrongCode: 'Koda je napačna ali je potekla.',
    tooMany: 'Preveč poskusov. Poskusite znova pozneje.',
    error: ({ err }) =>
      addError(getMessages()!, 'Napaka pri pošiljanju kode', err),
  },
  roleNames: {
    userManager: 'Upravitelj uporabnikov',
    galleryModerator: 'Moderator fotografij',
    mapModerator: 'Moderator zemljevidov',
    eventManager: 'Upravitelj dogodkov',
    trackingManager: 'Upravitelj sledenja',
    layerPreview: 'Preizkuševalec prihajajočih slojev zemljevida',
  },
  appTokens: {
    scopeNames: {
      'gallery:read': 'Ogled fotografij, tudi premium, če imate premium dostop',
      'gallery:write':
        'Nalaganje, urejanje, ocenjevanje in komentiranje fotografij',
      'maps:read': 'Ogled mojih zemljevidov',
      'maps:write': 'Ustvarjanje, spreminjanje in brisanje mojih zemljevidov',
      'events:read': 'Ogled dogodkov, tudi mojih neobjavljenih',
      'events:write':
        'Ustvarjanje, spreminjanje in brisanje mojih dogodkov ter sporočanje zanimanja in udeležbe',
      'tracking:read': 'Ogled mojih sledenih naprav',
      'tracking:write':
        'Upravljanje mojih sledenih naprav in njihovega deljenja',
      'tiles:outdoor':
        'Premium povečave (19+) zemljevida Outdoor v aplikacijah, kot je Locus, če imate premium dostop',
      'tiles:shading':
        'Premium povečave (16+) senčenj terena v aplikacijah, kot je Locus, če imate premium dostop',
      'tiles:aerial':
        'Premium povečava (20) slovaških in čeških letalskih posnetkov v aplikacijah, kot je Locus, če imate premium dostop',
      'users:read':
        'Iskanje in ogled uporabniških računov (upravitelj uporabnikov)',
      'users:write':
        'Spreminjanje in združevanje uporabniških računov (upravitelj uporabnikov)',
    },
    title: 'Aplikacijski žetoni',
    about: 'Kaj so aplikacijski žetoni?',
    intro:
      'Aplikacijski žeton drugi aplikaciji ali skripti omogoča, da v vašem imenu uporablja Freemap, na primer za prikaz premium fotografij. Naredi lahko le to, kar mu dovoljujejo njegova dovoljenja, s samim računom pa ničesar, razen če ste upravitelj uporabnikov in mu dodelite dovoljenja za uporabniške račune.',
    usage: (
      <>
        Žeton pošljite v glavi HTTP <code>Authorization</code> vsake zahteve na
        Freemap API:
      </>
    ),
    tiles: (
      <>
        Aplikacija, kot je Locus, naloži zemljevid Outdoor z žetonom v naslovu
        ploščic (JOSM žetona ne potrebuje):
      </>
    ),
    keepSecret:
      'Žeton hranite v tajnosti, tako kot geslo. Če bi ga lahko dobil kdo drug, ga izbrišite in ustvarite novega.',
    none: 'Ni aplikacijskih žetonov.',
    create: 'Nov žeton',
    note: 'Opomba',
    scopes: 'Dovoljenja',
    expiration: 'Velja do',
    never: 'Brez omejitve',
    days: ({ count }) => `Čez ${count} dni`,
    customDate: 'Do datuma',
    roleScopeExpiry:
      'Žeton z dovoljenji za uporabniške račune mora poteči v 7 dneh od nastanka.',
    pastDate: 'Datum poteka mora biti v prihodnosti.',
    lastUsed: 'Nazadnje uporabljen',
    neverUsed: 'Še ni bil uporabljen',
    created: 'Žeton shranite zdaj, pozneje tukaj ne bo več na voljo.',
    revoke: 'Izbriši',
    revokeConfirm: ({ name }) =>
      `Želite izbrisati žeton »${name}«? Aplikacije, ki ga uporabljajo, bodo prenehale delovati.`,
    noNote: 'Brez imena',
    edit: 'Uredi žeton',
  },
  connectLabel: 'Poveži',
  connectSuccess: ({ provider }) =>
    `Vaš račun ${provider} je bil povezan z vašim računom Freemap. Zdaj se lahko prijavite tudi z njim.`,
  disconnectLabel: 'Prekini povezavo',
  disconnectSuccess: 'Povezava prekinjena',
  logInWith: 'Izberite ponudnika prijave',
  logInSuccess: 'Uspešno ste se prijavili.',
  logInError: ({ err }) => addError(getMessages()!, 'Prijava ni uspela', err),
  logInError2: 'Prijava ni uspela.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Preverjanje prijave ni uspelo', err),
  logOutSuccess: 'Uspešno ste se odjavili.',
  logOutError: ({ err }) => addError(getMessages()!, 'Odjava ni uspela', err),
  differentAccount: ({ provider }) =>
    `Odobrili ste drug račun ${provider}, kot je povezan z vašim računom Freemap. Odjavite se iz ${provider}, prijavite se s povezanim računom in poskusite znova.`,
  lastProvider:
    'To je zadnji način prijave v vaš račun, zato povezave ni mogoče prekiniti. Trenutno stanje boste videli po ponovnem nalaganju strani.',
};

export default sl;
