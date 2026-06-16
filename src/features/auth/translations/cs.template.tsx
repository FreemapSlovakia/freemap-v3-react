import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

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
    description: 'O mně',
  },
  connectLabel: 'Pripojit',
  connectSuccess: 'Pripojené',
  disconnectLabel: 'Odpojit',
  disconnectSuccess: 'Odpojené',
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
