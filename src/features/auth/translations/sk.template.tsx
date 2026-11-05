import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const sk: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Meno',
    email: 'E-Mail',
    description: 'O mne',
    delete: 'Zmazať účet',
    deleteWarning:
      'Naozaj si prajete zmazať svoj účet? Spolu s ním sa odstránia všetky vaše fotografie, komentáre a hodnotenia fotografií, vlastné mapy a sledované zariadenia.',
    personalInfo: 'Osobné údaje',
    authProviders: 'Poskytovatelia prihlásenia',
    picture: 'Profilový obrázok',
    choosePicture: 'Vybrať obrázok',
    pictureTooLarge: 'Obrázok je príliš veľký. Maximálna veľkosť je 5 MB.',
    homeLocation: 'Domovská poloha',
    homeLocationUnset: 'Nenastavená',
    setHomeLocation: 'Nastaviť v mape',
    roles: 'Moje roly',
    publicFields: ({ profile }) => (
      <>Zobraziť na {profile('mojom verejnom profile')}</>
    ),
    emailUnconfirmed:
      'Táto adresa zatiaľ nie je potvrdená. Kým ju nepotvrdíte, Freemap na ňu neposiela žiadne e-maily a nedá sa ňou prihlásiť.',
    emailChangeHint: 'Adresa sa zmení, keď zadáte kód, ktorý na ňu pošleme.',
    emailConfirmed: 'Vaša e-mailová adresa bola potvrdená.',
    mergeConflict:
      'Iný účet s touto potvrdenou adresou je pripojený k inému účtu toho istého poskytovateľa prihlásenia, preto ich nemožno spojiť.',
    emailMissing:
      'Bez e-mailovej adresy vám Freemap nemôže posielať žiadne e-maily.',
    emailOnlyLogin:
      'E-mail je jediný spôsob prihlásenia do vášho účtu, preto ho nemožno odstrániť.',
    emailUnconfirmedBar: 'Vaša e-mailová adresa zatiaľ nie je potvrdená.',
    emailUnconfirmedBarLink: 'Potvrďte ju vo svojom účte',
    emailMissingBar:
      'Váš účet nemá e-mailovú adresu, takže vám Freemap nemôže posielať žiadne e-maily.',
    emailMissingBarLink: 'Pridajte ju vo svojom účte',
    dontRemind: 'Nepripomínať',
  },
  emailCode: {
    or: 'alebo kódom z e-mailu',
    email: 'E-mailová adresa',
    send: 'Poslať kód',
    sent: ({ email }) => (
      <>
        Na adresu <b>{email}</b> sme poslali 6-miestny kód. Ak nepríde, pozrite
        sa do priečinka so spamom.
      </>
    ),
    code: 'Kód',
    logIn: 'Prihlásiť',
    confirm: 'Potvrdiť',
    resend: 'Poslať znova',
    resendIn: ({ seconds }) => `Poslať znova (${seconds} s)`,
    otherAddress: 'Použiť inú adresu',
    confirmError: ({ err }) =>
      addError(getMessages()!, 'Nepodarilo sa potvrdiť kód', err),
    wrongCode: 'Kód je nesprávny alebo jeho platnosť vypršala.',
    tooMany: 'Príliš veľa pokusov. Skúste to neskôr.',
    error: ({ err }) =>
      addError(getMessages()!, 'Nepodarilo sa poslať kód', err),
  },
  roleNames: {
    userManager: 'Správca používateľov',
    galleryModerator: 'Moderátor fotografií',
    mapModerator: 'Moderátor máp',
    eventManager: 'Správca akcií',
    trackingManager: 'Správca sledovania',
    layerPreview: 'Tester pripravovaných mapových vrstiev',
  },
  appTokens: {
    title: 'Aplikačné tokeny',
    about: 'Čo sú aplikačné tokeny?',
    intro:
      'Aplikačný token umožní inej aplikácii alebo skriptu používať Freemap vo vašom mene, napríklad zobrazovať prémiové fotografie. Môže robiť len to, čo mu dovolia jeho oprávnenia, a nič so samotným účtom.',
    usage: (
      <>
        Token posielajte v HTTP hlavičke <code>Authorization</code> každej
        požiadavky na Freemap API:
      </>
    ),
    tiles: (
      <>
        Aplikácia ako Locus načíta turistickú mapu s tokenom v adrese dlaždíc
        (JOSM token nepotrebuje):
      </>
    ),
    keepSecret:
      'Token uchovávajte v tajnosti, rovnako ako heslo. Ak sa mohol dostať k niekomu inému, zmažte ho a vytvorte nový.',
    none: 'Nemáte žiadne aplikačné tokeny.',
    create: 'Nový token',
    note: 'Poznámka',
    scopes: 'Oprávnenia',
    scopeNames: {
      'gallery:read':
        'Prezerať fotografie, aj prémiové, ak máte prémiový prístup',
      'gallery:write': 'Nahrávať, upravovať, hodnotiť a komentovať fotografie',
      'maps:read': 'Prezerať moje mapy',
      'maps:write': 'Vytvárať, meniť a mazať moje mapy',
      'events:read': 'Prezerať akcie, aj moje nezverejnené',
      'events:write':
        'Vytvárať, meniť a mazať moje akcie a dávať vedieť o záujme a účasti',
      'tracking:read': 'Prezerať moje sledované zariadenia',
      'tracking:write': 'Spravovať moje sledované zariadenia a ich zdieľanie',
      'tiles:outdoor':
        'Prémiové priblíženia (19+) turistickej mapy v aplikáciách ako Locus, ak máte prémiový prístup',
      'tiles:shading':
        'Prémiové priblíženia (16+) tieňovaní terénu v aplikáciách ako Locus, ak máte prémiový prístup',
      'tiles:aerial':
        'Prémiové priblíženie (20) slovenskej a českej leteckej mapy v aplikáciách ako Locus, ak máte prémiový prístup',
    },
    expiration: 'Platnosť do',
    never: 'Bez obmedzenia',
    days: ({ count }) => `${count} dní`,
    customDate: 'Do dátumu',
    pastDate: 'Dátum platnosti musí byť v budúcnosti.',
    lastUsed: 'Naposledy použitý',
    neverUsed: 'Zatiaľ nepoužitý',
    created: 'Token si uložte, neskôr tu už nebude dostupný na čítanie.',
    revoke: 'Zmazať',
    revokeConfirm: ({ name }) =>
      `Zmazať token „${name}“? Aplikácie, ktoré ho používajú, prestanú fungovať.`,
    noNote: 'Bez názvu',
    edit: 'Upraviť token',
  },
  connectLabel: 'Pripojiť',
  connectSuccess: ({ provider }) =>
    `Váš účet ${provider} bol pripojený k vášmu účtu Freemap. Odteraz sa môžete prihlasovať aj ním.`,
  differentAccount: ({ provider }) =>
    `Povolili ste iný účet ${provider}, než aký je pripojený k vášmu účtu Freemap. Odhláste sa z ${provider}, prihláste sa pripojeným účtom a skúste to znova.`,
  disconnectLabel: 'Odpojiť',
  disconnectSuccess: 'Odpojené',
  lastProvider:
    'Toto je posledný spôsob prihlásenia do vášho účtu, preto ho nemožno odpojiť. Aktuálny stav uvidíte po obnovení stránky.',
  logInWith: 'Vyberte poskytovateľa prihlásenia',
  logInSuccess: 'Boli ste úspešne prihlásený.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa prihlásiť', err),
  logInError2: 'Nepodarilo sa prihlásiť.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa overiť prihlásenie', err),
  logOutSuccess: 'Boli ste úspešne odhlásený.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa odhlásiť', err),
};

export default sk;
