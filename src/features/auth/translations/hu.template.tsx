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
  },
  appTokens: { scopeNames: {} },
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
};

export default hu;
