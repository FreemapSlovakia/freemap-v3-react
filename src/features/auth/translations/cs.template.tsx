import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const cs: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Jméno',
    email: 'E-Mail',
    delete: 'Smazat účet',
    deleteWarning:
      'Opravdu si přejete smazat svůj účet? Spolu s ním se odstraní všechny vaše fotografie, komentáře a hodnocení fotografií, vlastní mapy a sledovaná zařízení.',
    personalInfo: 'Osobní údaje',
    authProviders: 'Poskytovatelé přihlášení',
    picture: 'Profilový obrázek',
    choosePicture: 'Vybrat obrázek',
    pictureTooLarge: 'Obrázek je příliš velký. Maximální velikost je 5 MB.',
    homeLocation: 'Domovská poloha',
    homeLocationUnset: 'Nenastavena',
    setHomeLocation: 'Nastavit v mapě',
    description: 'O mně',
    roles: 'Moje role',
    publicFields: ({ profile }) => (
      <>Zobrazit na {profile('mém veřejném profilu')}</>
    ),
    emailUnconfirmed:
      'Tato adresa zatím není potvrzená. Dokud ji nepotvrdíte, Freemap na ni nebude posílat žádné e-maily a nebude se jí dát přihlásit.',
    emailChangeHint:
      'Adresa se změní, jakmile zadáte kód, který na ni pošleme.',
    emailConfirmed: 'Vaše e-mailová adresa byla potvrzena.',
    mergeConflict:
      'Jiný účet s touto potvrzenou adresou je připojen k jinému účtu téhož poskytovatele přihlášení, proto je nelze spojit.',
    emailMissing:
      'Bez e-mailové adresy vám Freemap nemůže posílat žádné e-maily.',
    emailOnlyLogin:
      'E-mail je jediný způsob přihlášení do vašeho účtu, proto jej nelze odstranit.',
    emailUnconfirmedBar: 'Vaše e-mailová adresa zatím není potvrzená.',
    emailUnconfirmedBarLink: 'Potvrďte ji ve svém účtu',
    emailMissingBar:
      'Váš účet nemá e-mailovou adresu, takže vám Freemap nemůže posílat žádné e-maily.',
    emailMissingBarLink: 'Přidejte ji ve svém účtu',
    dontRemind: 'Nepřipomínat',
  },
  emailCode: {
    or: 'nebo kódem z e-mailu',
    email: 'E-mailová adresa',
    send: 'Poslat kód',
    sent: ({ email }) => (
      <>
        Na adresu <b>{email}</b> jsme poslali 6místný kód. Pokud nedorazí,
        podívejte se do složky se spamem.
      </>
    ),
    code: 'Kód',
    logIn: 'Přihlásit',
    confirm: 'Potvrdit',
    resend: 'Poslat znovu',
    resendIn: ({ seconds }) => `Poslat znovu (${seconds} s)`,
    otherAddress: 'Použít jinou adresu',
    confirmError: ({ err }) =>
      addError(getMessages()!, 'Nepodařilo se potvrdit kód', err),
    wrongCode: 'Kód je nesprávný nebo vypršela jeho platnost.',
    tooMany: 'Příliš mnoho pokusů. Zkuste to později.',
    error: ({ err }) =>
      addError(getMessages()!, 'Nepodařilo se odeslat kód', err),
  },
  roleNames: {
    userManager: 'Správce uživatelů',
    galleryModerator: 'Moderátor fotografií',
    mapModerator: 'Moderátor map',
    eventManager: 'Správce akcí',
    trackingManager: 'Správce sledování',
    layerPreview: 'Tester připravovaných mapových vrstev',
  },
  appTokens: {
    scopeNames: {
      'gallery:read':
        'Prohlížet fotografie, i prémiové, pokud máte prémiový přístup',
      'gallery:write': 'Nahrávat, upravovat, hodnotit a komentovat fotografie',
      'maps:read': 'Prohlížet moje mapy',
      'maps:write': 'Vytvářet, měnit a mazat moje mapy',
      'events:read': 'Prohlížet akce a to, zda o ně mám zájem nebo přijdu',
      'events:write':
        'Vytvářet, měnit a mazat moje akce a dávat vědět o zájmu a účasti',
      'tracking:read': 'Prohlížet moje sledovaná zařízení',
      'tracking:write': 'Spravovat moje sledovaná zařízení a jejich sdílení',
      'tiles:outdoor':
        'Prémiová přiblížení (19+) turistické mapy v aplikacích jako Locus, pokud máte prémiový přístup',
      'tiles:shading':
        'Prémiová přiblížení (16+) stínování terénu v aplikacích jako Locus, pokud máte prémiový přístup',
      'tiles:aerial':
        'Prémiové přiblížení (20) slovenské a české letecké mapy v aplikacích jako Locus, pokud máte prémiový přístup',
      'users:read':
        'Vyhledávání a zobrazení uživatelských účtů (správce uživatelů)',
      'users:write':
        'Úprava a slučování uživatelských účtů (správce uživatelů)',
    },
    title: 'Aplikační tokeny',
    about: 'Co jsou aplikační tokeny?',
    intro:
      'Aplikační token umožní jiné aplikaci nebo skriptu používat Freemap vaším jménem, například zobrazovat prémiové fotografie. Může dělat jen to, co mu dovolí jeho oprávnění, a nic se samotným účtem, pokud nejste správce uživatelů a nedáte mu oprávnění k uživatelským účtům.',
    usage: (
      <>
        Token posílejte v HTTP hlavičce <code>Authorization</code> každého
        požadavku na Freemap API:
      </>
    ),
    tiles: (
      <>
        Aplikace jako Locus načte turistickou mapu s tokenem v adrese dlaždic
        (JOSM token nepotřebuje):
      </>
    ),
    keepSecret:
      'Token uchovávejte v tajnosti, stejně jako heslo. Pokud se mohl dostat k někomu jinému, smažte ho a vytvořte nový.',
    none: 'Nemáte žádné aplikační tokeny.',
    create: 'Nový token',
    note: 'Poznámka',
    scopes: 'Oprávnění',
    expiration: 'Platnost do',
    never: 'Bez omezení',
    days: ({ count }) => `${count} dní`,
    customDate: 'Do data',
    roleScopeExpiry:
      'Token s oprávněními k uživatelským účtům musí vypršet do 7 dní od vytvoření.',
    pastDate: 'Datum platnosti musí být v budoucnosti.',
    lastUsed: 'Naposledy použit',
    neverUsed: 'Zatím nepoužit',
    created: 'Token si uložte, později zde již nebude k přečtení.',
    revoke: 'Smazat',
    revokeConfirm: ({ name }) =>
      `Smazat token „${name}“? Aplikace, které ho používají, přestanou fungovat.`,
    noNote: 'Bez názvu',
    edit: 'Upravit token',
  },
  connectLabel: 'Připojit',
  connectSuccess: ({ provider }) =>
    `Váš účet ${provider} byl připojen k vašemu účtu Freemap. Nyní se můžete přihlašovat i jím.`,
  differentAccount: ({ provider }) =>
    `Povolili jste jiný účet ${provider}, než jaký je připojen k vašemu účtu Freemap. Odhlaste se z ${provider}, přihlaste se připojeným účtem a zkuste to znovu.`,
  disconnectLabel: 'Odpojit',
  disconnectSuccess: 'Odpojeno',
  lastProvider:
    'Toto je poslední způsob přihlášení do vašeho účtu, proto ho nelze odpojit. Aktuální stav uvidíte po obnovení stránky.',
  logInWith: 'Vyberte poskytovatele přihlášení',
  logInSuccess: 'Byli jste úspěšně přihlášen.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se přihlásit', err),
  logInError2: 'Nepodařilo se přihlásit.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se ověřit přihlášení', err),
  logOutSuccess: 'Byli jste úspěšně odhlášen.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se odhlásit', err),
};

export default cs;
