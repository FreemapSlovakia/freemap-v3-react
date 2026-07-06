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
  },
  connectLabel: 'Pripojiť',
  connectSuccess: 'Pripojené',
  disconnectLabel: 'Odpojiť',
  disconnectSuccess: 'Odpojené',
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
