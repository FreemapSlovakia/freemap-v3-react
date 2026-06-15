import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const hu: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Név',
    email: 'E-mail',
    delete: 'Fiók törlése',
    deleteWarning:
      'Biztosan törölni szeretnéd a fiókodat? Ez eltávolítja az összes fotódat, fotómegjegyzésedet és értékelésedet, a térképeidet és a követett eszközeidet.',
    personalInfo: 'Személyes adatok',
    authProviders: 'Bejelentkezési szolgáltatók',
    picture: 'Profilkép',
    choosePicture: 'Kép kiválasztása',
    pictureTooLarge: 'A kép túl nagy. Maximális méret 5 MB.',
    description: 'Rólam',
  },
  connectLabel: 'Csatlakozás',
  connectSuccess: 'Csatlakoztatva',
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
