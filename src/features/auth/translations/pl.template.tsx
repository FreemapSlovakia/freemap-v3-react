import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const pl: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Imię',
    email: 'Email',
    delete: 'Usuń konto',
    deleteWarning:
      'Czy na pewno usunąć konto? Zostaną usunięte wszystkie zdjęcia, komentarze i oceny, własne mapy i śledzone urządzenia.',
    personalInfo: 'Dane osobowe',
    authProviders: 'Dostawcy logowania',
    picture: 'Zdjęcie profilowe',
    choosePicture: 'Wybierz zdjęcie',
    pictureTooLarge: 'Zdjęcie jest za duże. Maksymalny rozmiar to 5 MB.',
    description: 'O mnie',
    publicFields: 'Widoczne w profilu publicznym',
    publicProfile: 'Profil publiczny',
    homeLocation: 'Pozycja domowa',
    homeLocationUnset: 'Nie ustawiono',
    setHomeLocation: 'Ustaw na mapie',
    roles: 'Moje role',
  },
  roleNames: {
    userManager: 'Administrator użytkowników',
    galleryModerator: 'Moderator zdjęć',
    mapModerator: 'Moderator map',
    eventManager: 'Administrator wydarzeń',
    trackingManager: 'Administrator śledzenia',
    layerPreview: 'Tester przygotowywanych warstw mapy',
  },
  appTokens: {
    scopeNames: {
      'gallery:read':
        'Przeglądanie zdjęć, także premium, jeśli jest dostęp premium',
      'gallery:write': 'Przesyłanie, edycja, ocenianie i komentowanie zdjęć',
      'maps:read': 'Przeglądanie moich map',
      'maps:write': 'Tworzenie, zmiana i usuwanie moich map',
      'events:read': 'Przeglądanie wydarzeń, także moich niepublicznych',
      'events:write':
        'Tworzenie, zmiana i usuwanie moich wydarzeń oraz zgłaszanie zainteresowania i udziału',
      'tracking:read': 'Przeglądanie moich śledzonych urządzeń',
      'tracking:write':
        'Zarządzanie moimi śledzonymi urządzeniami i ich udostępnianiem',
      'tiles:outdoor':
        'Powiększenia premium (19+) mapy turystycznej w aplikacjach takich jak Locus, jeśli jest dostęp premium',
      'tiles:shading':
        'Powiększenia premium (16+) cieniowania terenu w aplikacjach takich jak Locus, jeśli jest dostęp premium',
      'tiles:aerial':
        'Powiększenie premium (20) słowackich i czeskich ortofotomap w aplikacjach takich jak Locus, jeśli jest dostęp premium',
    },
    title: 'Tokeny aplikacji',
    about: 'Czym są tokeny aplikacji?',
    intro:
      'Token aplikacji pozwala innej aplikacji lub skryptowi korzystać z Freemap w imieniu użytkownika, na przykład wyświetlać zdjęcia premium. Może robić tylko to, na co pozwalają jego uprawnienia, i nic z samym kontem.',
    usage: (
      <>
        Token należy wysyłać w nagłówku HTTP <code>Authorization</code> każdego
        żądania do API Freemap:
      </>
    ),
    tiles: (
      <>
        Aplikacja taka jak Locus wczytuje mapę turystyczną z tokenem w adresie
        kafelków (JOSM go nie potrzebuje):
      </>
    ),
    keepSecret:
      'Token należy trzymać w tajemnicy, tak jak hasło. Jeśli mógł trafić do kogoś innego, należy go usunąć i utworzyć nowy.',
    none: 'Brak tokenów aplikacji.',
    create: 'Nowy token',
    note: 'Notatka',
    scopes: 'Uprawnienia',
    expiration: 'Ważny do',
    never: 'Bez ograniczeń',
    days: ({ count }) => `Za ${count} dni`,
    customDate: 'Do daty',
    pastDate: 'Data ważności musi przypadać w przyszłości.',
    lastUsed: 'Ostatnio użyty',
    neverUsed: 'Jeszcze nieużyty',
    created:
      'Token należy zapisać teraz — później nie będzie można go tu odczytać.',
    revoke: 'Usuń',
    revokeConfirm: ({ name }) =>
      `Usunąć token „${name}”? Aplikacje, które go używają, przestaną działać.`,
    noNote: 'Bez nazwy',
    edit: 'Edytuj token',
  },
  connectLabel: 'Połącz',
  connectSuccess: ({ provider }) =>
    `Konto ${provider} zostało połączone z kontem Freemap. Teraz można logować się również za jego pomocą.`,
  disconnectLabel: 'Odłącz',
  disconnectSuccess: 'Odłączono',
  logInWith: 'Wybierz dostawcę logowania',
  logInSuccess: 'Zalogowano pomyślnie.',
  logInError: ({ err }) => addError(getMessages()!, 'Błąd logowania', err),
  logInError2: 'Błąd logowania.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Błąd weryfikacji logowania', err),
  logOutSuccess: 'Wylogowano pomyślnie.',
  logOutError: ({ err }) => addError(getMessages()!, 'Błąd wylogowania', err),
  differentAccount: ({ provider }) =>
    `Autoryzowano inne konto ${provider} niż to, które jest połączone z kontem Freemap. Należy wylogować się z ${provider}, zalogować połączonym kontem i spróbować ponownie.`,
  lastProvider:
    'To ostatni sposób logowania do konta, więc nie można go odłączyć. Aktualny stan będzie widoczny po odświeżeniu strony.',
};

export default pl;
