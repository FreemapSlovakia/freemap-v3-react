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
    publicFields: ({ profile }) => (
      <>Mostra nel {profile('mio profilo pubblico')}</>
    ),
    homeLocation: 'Posizione di casa',
    homeLocationUnset: 'Non impostata',
    setHomeLocation: 'Imposta sulla mappa',
    roles: 'I miei ruoli',
    emailUnconfirmed:
      'Questo indirizzo non è ancora confermato. Finché non lo conferma, Freemap non vi invia alcuna email e non è possibile usarlo per accedere.',
    emailChangeHint:
      'L’indirizzo cambia quando inserisce il codice che le invieremo.',
    emailConfirmed: 'Il suo indirizzo email è stato confermato.',
    mergeConflict:
      'Un altro account con questo indirizzo confermato è collegato a un altro account dello stesso provider di accesso, quindi non è possibile unirli.',
    emailMissing:
      'Senza un indirizzo email, Freemap non può inviarle alcuna email.',
    emailOnlyLogin:
      'L’email è l’unico modo per accedere al suo account, quindi non può essere rimossa.',
    emailUnconfirmedBar: 'Il suo indirizzo email non è ancora confermato.',
    emailUnconfirmedBarLink: 'Lo confermi nel suo account',
    emailMissingBar:
      'Il suo account non ha un indirizzo email, quindi Freemap non può inviarle alcuna email.',
    emailMissingBarLink: 'Lo aggiunga nel suo account',
    dontRemind: 'Non ricordarmelo più',
  },
  emailCode: {
    or: 'oppure con un codice via email',
    email: 'Indirizzo email',
    send: 'Invia codice',
    sent: ({ email }) => (
      <>
        Abbiamo inviato un codice di 6 cifre a <b>{email}</b>. Se non arriva,
        controlli la cartella dello spam.
      </>
    ),
    code: 'Codice',
    logIn: 'Accedi',
    confirm: 'Conferma',
    resend: 'Invia di nuovo',
    resendIn: ({ seconds }) => `Invia di nuovo (${seconds} s)`,
    otherAddress: 'Usa un altro indirizzo',
    confirmError: ({ err }) =>
      addError(getMessages()!, 'Errore durante la conferma del codice', err),
    wrongCode: 'Il codice è errato o scaduto.',
    tooMany: 'Troppi tentativi. Riprovi più tardi.',
    error: ({ err }) =>
      addError(getMessages()!, 'Errore durante l’invio del codice', err),
  },
  roleNames: {
    userManager: 'Gestore utenti',
    galleryModerator: 'Moderatore foto',
    mapModerator: 'Moderatore mappe',
    eventManager: 'Gestore eventi',
    trackingManager: 'Gestore tracciamento',
    layerPreview: 'Tester dei livelli di mappa in arrivo',
  },
  appTokens: {
    scopeNames: {
      'gallery:read':
        'Visualizzare le foto, anche quelle premium se ha l’accesso premium',
      'gallery:write': 'Caricare, modificare, valutare e commentare le foto',
      'maps:read': 'Visualizzare le mie mappe',
      'maps:write': 'Creare, modificare ed eliminare le mie mappe',
      'events:read': 'Visualizzare gli eventi, anche i miei non pubblicati',
      'events:write':
        'Creare, modificare ed eliminare i miei eventi e indicare interesse o partecipazione',
      'tracking:read': 'Visualizzare i miei dispositivi tracciati',
      'tracking:write':
        'Gestire i miei dispositivi tracciati e la loro condivisione',
      'tiles:outdoor':
        'Zoom premium (19+) della mappa outdoor in app come Locus, se ha l’accesso premium',
      'tiles:shading':
        'Zoom premium (16+) delle ombreggiature del terreno in app come Locus, se ha l’accesso premium',
      'tiles:aerial':
        'Zoom premium (20) delle ortofoto slovacche e ceche in app come Locus, se ha l’accesso premium',
    },
    title: 'Token delle app',
    about: 'Che cosa sono i token delle app?',
    intro:
      'Un token dell’app consente a un’altra applicazione o a uno script di usare Freemap a suo nome, ad esempio per mostrare le foto premium. Può fare solo ciò che i suoi permessi consentono, e nulla con l’account stesso.',
    usage: (
      <>
        Invii il token nell’intestazione HTTP <code>Authorization</code> di ogni
        richiesta all’API di Freemap:
      </>
    ),
    tiles: (
      <>
        Un’app come Locus carica la mappa outdoor con il token nell’URL dei
        tasselli (JOSM non ne ha bisogno):
      </>
    ),
    keepSecret:
      'Mantenga il token segreto, come una password. Se qualcun altro potrebbe averlo ottenuto, lo elimini e ne crei uno nuovo.',
    none: 'Non ha alcun token delle app.',
    create: 'Nuovo token',
    note: 'Nota',
    scopes: 'Permessi',
    expiration: 'Scadenza',
    never: 'Mai',
    days: ({ count }) => `Tra ${count} giorni`,
    customDate: 'In una data',
    pastDate: 'La data di scadenza deve essere nel futuro.',
    lastUsed: 'Ultimo utilizzo',
    neverUsed: 'Non ancora usato',
    created:
      'Salvi il token adesso. In seguito non sarà più possibile leggerlo qui.',
    revoke: 'Elimina',
    revokeConfirm: ({ name }) =>
      `Eliminare il token «${name}»? Le applicazioni che lo usano smetteranno di funzionare.`,
    noNote: 'Senza titolo',
    edit: 'Modifica token',
  },
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
  differentAccount: ({ provider }) =>
    `Ha autorizzato un account ${provider} diverso da quello collegato al suo account Freemap. Esca da ${provider}, acceda con l’account collegato e riprovi.`,
  lastProvider:
    'Questo è l’ultimo modo per accedere al suo account, quindi non può essere scollegato. Ricarichi la pagina per vedere lo stato attuale.',
};

export default it;
