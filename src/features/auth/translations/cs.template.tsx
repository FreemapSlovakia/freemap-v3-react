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
    publicFields: 'Zobrazit na mém veřejném profilu',
    publicProfile: 'Můj veřejný profil',
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
      'events:read': 'Prohlížet akce, i moje nezveřejněné',
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
    },
    title: 'Aplikační tokeny',
    about: 'Co jsou aplikační tokeny?',
    intro:
      'Aplikační token umožní jiné aplikaci nebo skriptu používat Freemap vaším jménem, například zobrazovat prémiové fotografie. Může dělat jen to, co mu dovolí jeho oprávnění, a nic se samotným účtem.',
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
