import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const it: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Nome',
    email: 'Email',
    personalInfo: 'Dati personali',
    authProviders: 'Provider di accesso',
    delete: 'Elimina account',
    deleteWarning:
      'È sicuro di voler eliminare il suo account? Verranno rimossi tutte le sue foto, i commenti e le valutazioni delle foto, le sue mappe e i dispositivi monitorati.',
    picture: 'Foto del profilo',
    choosePicture: 'Scegli foto',
    pictureTooLarge: 'La foto è troppo grande. La dimensione massima è 5 MB.',
    description: 'Su di me',
  },
  appTokens: { scopeNames: {} },
  connectLabel: 'Connetti',
  connectSuccess: ({ provider }) =>
    `Il suo account ${provider} è stato collegato al suo account Freemap. Ora può accedere anche con esso.`,
  disconnectLabel: 'Disconnetti',
  disconnectSuccess: 'Disconnesso',
  logInWith: 'Scelga un provider di accesso',
  logInSuccess: 'Accesso eseguito correttamente.',
  logInError: ({ err }) => addError(getMessages()!, 'Error logging in:', err),
  logInError2: 'Error logging in.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Error verifying authentication:', err),
  logOutSuccess: 'Disconnessione avvenuta correttamente.',
  logOutError: ({ err }) => addError(getMessages()!, 'Error logging out:', err),
};

export default it;
