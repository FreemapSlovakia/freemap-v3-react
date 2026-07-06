import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const sl: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Ime',
    email: 'E-pošta',
    description: 'O meni',
    delete: 'Izbriši račun',
    deleteWarning:
      'Ali res želite izbrisati svoj račun? Skupaj z njim bodo odstranjene vse vaše fotografije, komentarji in ocene fotografij, vaši zemljevidi in sledene naprave.',
    personalInfo: 'Osebni podatki',
    authProviders: 'Ponudniki prijave',
    picture: 'Profilna slika',
    choosePicture: 'Izberi sliko',
    pictureTooLarge: 'Slika je prevelika. Največja velikost je 5 MB.',
  },
  connectLabel: 'Poveži',
  connectSuccess: 'Povezano',
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
};

export default sl;
