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
      'Czy na pewno chcesz usunąć swoje konto? Zostaną usunięte wszystkie Twoje zdjęcia, komentarze i oceny, własne mapy i śledzone urządzenia.',
    personalInfo: 'Dane osobowe',
    authProviders: 'Dostawcy logowania',
    picture: 'Zdjęcie profilowe',
    choosePicture: 'Wybierz zdjęcie',
    pictureTooLarge: 'Zdjęcie jest za duże. Maksymalny rozmiar to 5 MB.',
    description: 'O mnie',
  },
  connectLabel: 'Połącz',
  connectSuccess: 'Połączono',
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
};

export default pl;
