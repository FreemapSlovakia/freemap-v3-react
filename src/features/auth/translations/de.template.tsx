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
    homeLocation: 'Heimatort',
    homeLocationUnset: 'Nicht festgelegt',
    setHomeLocation: 'Auf der Karte festlegen',
    description: 'Über mich',
    roles: 'Meine Rollen',
    publicFields: 'Auf meinem öffentlichen Profil zeigen',
    publicProfile: 'Mein öffentliches Profil',
    emailUnconfirmed:
      'Diese Adresse ist noch nicht bestätigt. Bis Sie sie bestätigen, sendet Freemap keine E-Mails an sie, und Sie können sich nicht mit ihr anmelden.',
    emailChangeHint:
      'Die Adresse wird geändert, sobald Sie den Code eingeben, den wir an sie senden.',
    emailConfirmed: 'Ihre E-Mail-Adresse wurde bestätigt.',
    mergeConflict:
      'Ein anderes Konto mit dieser bestätigten Adresse ist mit einem anderen Konto desselben Anmeldeanbieters verbunden, daher lassen sich die beiden nicht zusammenführen.',
    emailMissing:
      'Ohne E-Mail-Adresse erhalten Sie keine Download-Links für Offline-Karten und keine Benachrichtigungen zu Fotokommentaren, und die Anmeldung per E-Mail ist nicht möglich.',
    emailOnlyLogin:
      'Die E-Mail-Adresse ist die einzige Anmeldemöglichkeit für Ihr Konto und kann daher nicht entfernt werden.',
    emailUnconfirmedBar: 'Ihre E-Mail-Adresse ist noch nicht bestätigt.',
    emailUnconfirmedBarLink: 'In Ihrem Konto bestätigen',
    emailMissingBar:
      'Ihr Konto hat keine E-Mail-Adresse, daher kann Freemap Ihnen keine E-Mails senden.',
    emailMissingBarLink: 'In Ihrem Konto hinzufügen',
    dontRemind: 'Nicht mehr erinnern',
  },
  emailCode: {
    or: 'oder mit einem Code per E-Mail',
    email: 'E-Mail-Adresse',
    send: 'Code senden',
    sent: ({ email }) => (
      <>
        Wir haben einen 6-stelligen Code an <b>{email}</b> gesendet. Falls er
        nicht ankommt, sehen Sie bitte im Spam-Ordner nach.
      </>
    ),
    code: 'Code',
    logIn: 'Anmelden',
    confirm: 'Bestätigen',
    resend: 'Erneut senden',
    resendIn: ({ seconds }) => `Erneut senden (${seconds} s)`,
    otherAddress: 'Andere Adresse verwenden',
    confirmError: ({ err }) =>
      addError(getMessages()!, 'Fehler beim Bestätigen des Codes', err),
    wrongCode: 'Der Code ist falsch oder abgelaufen.',
    tooMany: 'Zu viele Versuche. Versuchen Sie es später erneut.',
    error: ({ err }) =>
      addError(getMessages()!, 'Fehler beim Senden des Codes', err),
  },
  roleNames: {
    userManager: 'Benutzerverwalter',
    galleryModerator: 'Fotomoderator',
    mapModerator: 'Kartenmoderator',
    eventManager: 'Veranstaltungsverwalter',
    trackingManager: 'Tracking-Verwalter',
    layerPreview: 'Tester kommender Kartenebenen',
  },
  appTokens: {
    scopeNames: {
      'gallery:read': 'Fotos ansehen, mit Premium-Zugang auch Premium-Fotos',
      'gallery:write': 'Fotos hochladen, bearbeiten, bewerten und kommentieren',
      'maps:read': 'Meine Karten ansehen',
      'maps:write': 'Meine Karten erstellen, ändern und löschen',
      'events:read': 'Veranstaltungen ansehen, auch meine nicht gelisteten',
      'events:write':
        'Meine Veranstaltungen erstellen, ändern und löschen sowie Interesse und Teilnahme angeben',
      'tracking:read': 'Meine überwachten Geräte ansehen',
      'tracking:write': 'Meine überwachten Geräte und deren Freigabe verwalten',
      'tiles:outdoor':
        'Premium-Zoomstufen (19+) der Outdoor-Karte in Apps wie Locus, mit Premium-Zugang',
      'tiles:shading':
        'Premium-Zoomstufen (16+) der Geländeschattierungen in Apps wie Locus, mit Premium-Zugang',
      'tiles:aerial':
        'Premium-Zoomstufe (20) der slowakischen und tschechischen Luftbilder in Apps wie Locus, mit Premium-Zugang',
    },
    title: 'App-Tokens',
    about: 'Was sind App-Tokens?',
    intro:
      'Ein App-Token erlaubt einer anderen Anwendung oder einem Skript, Freemap in Ihrem Namen zu nutzen, etwa um Premium-Fotos anzuzeigen. Es kann nur das tun, was seine Berechtigungen erlauben, und nichts mit dem Konto selbst.',
    usage: (
      <>
        Senden Sie das Token im HTTP-Header <code>Authorization</code> jeder
        Anfrage an die Freemap-API:
      </>
    ),
    tiles: (
      <>
        Eine App wie Locus lädt die Outdoor-Karte mit dem Token in der
        Kachel-URL (JOSM braucht keines):
      </>
    ),
    keepSecret:
      'Halten Sie das Token geheim wie ein Passwort. Falls jemand anderes es erhalten haben könnte, löschen Sie es und erstellen Sie ein neues.',
    none: 'Sie haben keine App-Tokens.',
    create: 'Neues Token',
    note: 'Notiz',
    scopes: 'Berechtigungen',
    expiration: 'Gültig bis',
    never: 'Unbegrenzt',
    days: ({ count }) => `In ${count} Tagen`,
    customDate: 'Bis zu einem Datum',
    pastDate: 'Das Ablaufdatum muss in der Zukunft liegen.',
    lastUsed: 'Zuletzt verwendet',
    neverUsed: 'Noch nicht verwendet',
    created:
      'Speichern Sie das Token jetzt. Später ist es hier nicht mehr lesbar.',
    revoke: 'Löschen',
    revokeConfirm: ({ name }) =>
      `Token „${name}“ löschen? Anwendungen, die es verwenden, funktionieren dann nicht mehr.`,
    noNote: 'Ohne Namen',
    edit: 'Token bearbeiten',
  },
  connectLabel: 'Verbinden',
  connectSuccess: ({ provider }) =>
    `Ihr ${provider}-Konto wurde mit Ihrem Freemap-Konto verbunden. Sie können sich jetzt auch damit anmelden.`,
  disconnectLabel: 'Trennen',
  disconnectSuccess: 'Getrennt',
  logInWith: 'Wählen Sie einen Anmeldeanbieter',
  logInSuccess: 'Sie wurden erfolgreich angemeldet.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Anmeldung', err),
  logInError2: 'Fehler bei der Anmeldung.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Authentifizierungsprüfung', err),
  logOutSuccess: 'Sie wurden erfolgreich abgemeldet.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Abmeldung', err),
  differentAccount: ({ provider }) =>
    `Sie haben ein anderes ${provider}-Konto autorisiert als das, das mit Ihrem Freemap-Konto verbunden ist. Melden Sie sich bei ${provider} ab, melden Sie sich mit dem verbundenen Konto an und versuchen Sie es erneut.`,
  lastProvider:
    'Dies ist die letzte Möglichkeit, sich bei Ihrem Konto anzumelden, daher kann sie nicht getrennt werden. Laden Sie die Seite neu, um den aktuellen Stand zu sehen.',
};

export default de;
