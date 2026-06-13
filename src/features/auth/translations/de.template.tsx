import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const de: DeepPartialWithRequiredObjects<AuthMessages> = {
  connectLabel: 'Verbinden',
  connectSuccess: 'Verbunden',
  disconnectLabel: 'Trennen',
  disconnectSuccess: 'Getrennt',
  logInWith: 'Wähle einen Anmeldeanbieter',
  logInSuccess: 'Du wurdest erfolgreich angemeldet.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Anmeldung', err),
  logInError2: 'Fehler bei der Anmeldung.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Authentifizierungsprüfung', err),
  logOutSuccess: 'Du wurdest erfolgreich abgemeldet.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Abmeldung', err),
};

export default de;
