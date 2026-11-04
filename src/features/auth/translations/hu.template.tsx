import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const hu: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Név',
    email: 'E-mail',
    delete: 'Fiók törlése',
    deleteWarning:
      'Biztosan törölni szeretné a fiókját? Ez eltávolítja az összes fotóját, fotómegjegyzését és értékelését, a térképeit és a követett eszközeit.',
    personalInfo: 'Személyes adatok',
    authProviders: 'Bejelentkezési szolgáltatók',
    picture: 'Profilkép',
    choosePicture: 'Kép kiválasztása',
    pictureTooLarge: 'A kép túl nagy. Maximális méret 5 MB.',
    description: 'Rólam',
    publicFields: 'Megjelenítés a nyilvános profilomon',
    publicProfile: 'Nyilvános profilom',
    homeLocation: 'Otthoni hely',
    homeLocationUnset: 'Nincs beállítva',
    setHomeLocation: 'Beállítás a térképen',
    roles: 'Szerepköreim',
  },
  roleNames: {
    userManager: 'Felhasználókezelő',
    galleryModerator: 'Fotómoderátor',
    mapModerator: 'Térképmoderátor',
    eventManager: 'Eseménykezelő',
    trackingManager: 'Követéskezelő',
    layerPreview: 'Készülő térképrétegek tesztelője',
  },
  appTokens: {
    scopeNames: {
      'gallery:read':
        'Fotók megtekintése, prémium hozzáféréssel a prémium fotóké is',
      'gallery:write':
        'Fotók feltöltése, szerkesztése, értékelése és hozzászólás a fotókhoz',
      'maps:read': 'Saját térképek megtekintése',
      'maps:write': 'Saját térképek létrehozása, módosítása és törlése',
      'events:read':
        'Események megtekintése, a saját nem listázott eseményeké is',
      'events:write':
        'Saját események létrehozása, módosítása és törlése, valamint az érdeklődés és a részvétel jelzése',
      'tracking:read': 'Saját követett eszközök megtekintése',
      'tracking:write': 'Saját követett eszközök és megosztásuk kezelése',
      'tiles:outdoor':
        'A túratérkép prémium nagyítási szintjei (19+) olyan alkalmazásokban, mint a Locus, prémium hozzáféréssel',
      'tiles:shading':
        'A domborzatárnyékolások prémium nagyítási szintjei (16+) olyan alkalmazásokban, mint a Locus, prémium hozzáféréssel',
      'tiles:aerial':
        'A szlovák és cseh légifotók prémium nagyítási szintje (20) olyan alkalmazásokban, mint a Locus, prémium hozzáféréssel',
    },
    title: 'Alkalmazástokenek',
    about: 'Mik azok az alkalmazástokenek?',
    intro:
      'Az alkalmazástoken lehetővé teszi, hogy egy másik alkalmazás vagy szkript az Ön nevében használja a Freemapet, például prémium fotók megjelenítésére. Csak azt teheti, amit az engedélyei megengednek, magával a fiókkal semmit.',
    usage: (
      <>
        A tokent a Freemap API-hoz intézett minden kérés{' '}
        <code>Authorization</code> HTTP-fejlécében küldje el:
      </>
    ),
    tiles: (
      <>
        Egy alkalmazás, például a Locus, a csempék címében megadott tokennel
        tölti be a túratérképet (a JOSM-nek nincs szüksége tokenre):
      </>
    ),
    keepSecret:
      'A tokent tartsa titokban, akárcsak egy jelszót. Ha más is hozzáférhetett, törölje, és hozzon létre újat.',
    none: 'Nincsenek alkalmazástokenek.',
    create: 'Új token',
    note: 'Megjegyzés',
    scopes: 'Engedélyek',
    expiration: 'Lejárat',
    never: 'Soha',
    days: ({ count }) => `${count} nap múlva`,
    customDate: 'Adott napon',
    pastDate: 'A lejárati dátumnak a jövőben kell lennie.',
    lastUsed: 'Utoljára használva',
    neverUsed: 'Még nem használták',
    created: 'Mentse el a tokent most. Később itt már nem lesz olvasható.',
    revoke: 'Törlés',
    revokeConfirm: ({ name }) =>
      `Törli a(z) „${name}” tokent? Az ezt használó alkalmazások leállnak.`,
    noNote: 'Névtelen',
    edit: 'Token szerkesztése',
  },
  connectLabel: 'Csatlakozás',
  connectSuccess: ({ provider }) =>
    `A(z) ${provider}-fiókját összekapcsoltuk a Freemap-fiókjával. Mostantól ezzel is bejelentkezhet.`,
  disconnectLabel: 'Kapcsolat bontása',
  disconnectSuccess: 'Lecsatlakoztatva',
  logInWith: 'Válasszon bejelentkezési szolgáltatót',
  logInSuccess: 'Sikeresen bejelentkezett.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a bejelentkezésnél', err),
  logInError2: 'Hiba történt a bejelentkezésnél.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a hitelesítés ellenőrzésénél', err),
  logOutSuccess: 'Sikeresen kijelentkezett.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a kijelentkezésnél', err),
  differentAccount: ({ provider }) =>
    `Nem azt a(z) ${provider}-fiókot engedélyezte, amelyik a Freemap-fiókjához kapcsolódik. Jelentkezzen ki a(z) ${provider} szolgáltatásból, jelentkezzen be a kapcsolt fiókkal, majd próbálja újra.`,
  lastProvider:
    'Ez az utolsó módja a fiókjába való bejelentkezésnek, ezért nem bontható a kapcsolata. Az aktuális állapotot az oldal újratöltése után láthatja.',
};

export default hu;
