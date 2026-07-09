import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const de: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Name',
    email: 'E-Mail',
    delete: 'Konto löschen',
    deleteWarning:
      'Möchten Sie Ihr Konto wirklich löschen? Dabei werden alle Ihre Fotos, Kommentare und Bewertungen, Ihre Karten und überwachten Geräte entfernt.',
    personalInfo: 'Persönliche Informationen',
    authProviders: 'Anmeldeanbieter',
    picture: 'Profilbild',
    choosePicture: 'Bild auswählen',
    pictureTooLarge: 'Bild ist zu groß. Maximale Größe beträgt 5 MB.',
    description: 'Über mich',
  },
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
