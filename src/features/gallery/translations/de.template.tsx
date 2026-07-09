import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const de: DeepPartialWithRequiredObjects<GalleryMessages> = {
  sendGalleryEmails:
    'Benachrichtigungen zu Fotokommentaren per E-Mail erhalten',
  stats: {
    leaderboard: 'Bestenliste',
    country: 'Land',
    perUserPerCountry: 'Fotos pro Autor und Land',
    perUser: 'Fotos pro Autor',
    more: 'Mehr',
    less: 'Weniger',
    user: 'Autor',
    photos: 'Fotos',
    numberOfPhotos: 'Anzahl der Fotos',
    timePeriod: 'Zeitraum',
    allTime: 'Gesamter Zeitraum',
    last3months: 'Letzte 3 Monate',
    last30days: 'Letzte 30 Tage',
  },

  f: {
    '-createdAt': 'von zuletzt hochgeladenen',
    '-takenAt': 'von neuesten aufgenommenen',
    '-rating': 'von am höchsten bewerteten',
    '-lastCommentedAt': 'vom letzten Kommentar',
  },

  c: {
    disable: 'Nicht einfärben',
    mine: 'Meine hervorheben',
    userId: 'Autor',
    rating: 'Bewertung',
    takenAt: 'Aufnahmedatum',
    createdAt: 'Hochladedatum',
    season: 'Jahreszeit',
    premium: 'Premium',
    license: 'Lizenz',
  },

  viewer: {
    title: 'Foto',
    comments: 'Kommentare',
    newComment: 'Neuer Kommentar',
    addComment: 'Hinzufügen',
    yourRating: 'Deine Bewertung:',
    showOnTheMap: 'Auf der Karte anzeigen',
    openInNewWindow: 'Öffnen in…',
    uploaded: ({ username, createdAt }) => (
      <>
        Hochgeladen von {username} am {createdAt}
      </>
    ),
    captured: (takenAt) => <>Aufgenommen am {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Möchten Sie das Bild <i>{title}</i> wirklich löschen?
        </>
      ) : (
        <>Möchten Sie dieses Bild wirklich löschen?</>
      ),
    deleteTitle: 'Löschen des Bildes',
    modify: 'Bearbeiten',
    premiumOnly:
      'Dieses Foto wurde vom Autor nur für Nutzer mit Premium-Zugang freigegeben.',
    noComments: 'Keine Kommentare',
  },

  editForm: {
    takenAt: {
      datetime: 'Aufnahmedatum und -zeit',
      date: 'Aufnahmedatum',
      time: 'Aufnahmezeit',
    },
    name: 'Name',
    description: 'Beschreibung',
    location: 'Ort',
    azimuth: 'Azimut',
    tags: 'Tags',
    setLocation: 'Ort festlegen',
  },

  uploadModal: {
    title: 'Fotos hochladen',
    uploading: (n) => `Wird hochgeladen (${n})`,
    upload: 'Hochladen',
    rules: `
      <p>Ziehe deine Fotos hierher oder klicke hier, um sie auszuwählen.</p>
      <ul>
        <li>Lade keine zu kleinen Bilder hoch (Thumbnails). Die maximale Auflösung ist nicht begrenzt, die maximale Dateigröße beträgt jedoch 10 MB. Größere Dateien werden abgelehnt.</li>
        <li>Lade nur Landschafts- oder Dokumentationsfotos hoch. Porträts und Makroaufnahmen gelten als unangemessener Inhalt und werden ohne Vorwarnung gelöscht.</li>
        <li>Lade nur eigene Fotos hoch oder solche, für die du eine Freigabe zur Veröffentlichung hast.</li>
        <li>Beschreibungen oder Kommentare, die nicht direkt mit dem Inhalt der hochgeladenen Fotos zusammenhängen oder den allgemein anerkannten Regeln des zivilisierten Zusammenlebens widersprechen, werden entfernt. Verstöße gegen diese Regel führen zu einer Verwarnung, bei wiederholtem Verstoß kann dein Konto gelöscht werden.</li>
        <li>Die Fotos werden unter der Lizenz weitergegeben, die Sie für jedes einzelne wählen (standardmäßig CC BY-SA 4.0).</li>
        <li>Der Betreiber (Freemap.sk) übernimmt keine Verantwortung und haftet nicht für direkte oder indirekte Schäden, die durch die Veröffentlichung eines Fotos in der Galerie entstehen. Die volle Verantwortung trägt die Person, die das Foto auf den Server hochgeladen hat.</li>
        <li>Der Betreiber behält sich das Recht vor, die Beschreibung, den Namen, die Position und die Tags eines Fotos zu ändern oder das Foto zu löschen, wenn dessen Inhalt unangemessen ist (diese Regeln verletzt).</li>
        <li>Der Betreiber behält sich das Recht vor, das Konto eines Nutzers zu löschen, wenn dieser wiederholt gegen die Galerie-Richtlinien durch das Hochladen unangemessener Inhalte verstößt.</li>
      </ul>
    `,
    success: 'Fotos wurden erfolgreich hochgeladen.',
    showPreview:
      'Vorschauen automatisch anzeigen (erhöht CPU- und Speicherbedarf)',
    premium: 'Nur für Nutzer mit Premiumzugang verfügbar machen',
    loadPreview: 'Vorschau laden',
  },
  license: {
    label: 'Lizenz',
    chooseForAll: 'Lizenz aller meiner Fotos festlegen',
    changeNote:
      'Eine Lizenzänderung gilt nur für die künftige Nutzung; früher bezogene Kopien behalten die Lizenz, unter der sie bereitgestellt wurden.',
    since: 'Seit',
    names: {
      'CC0-1.0': 'CC0 1.0 (Gemeinfrei)',
      'CC-BY-4.0': 'CC BY 4.0',
      'CC-BY-SA-4.0': 'CC BY-SA 4.0',
      'CC-BY-NC-4.0': 'CC BY-NC 4.0',
      'CC-BY-NC-SA-4.0': 'CC BY-NC-SA 4.0',
    },
    descriptions: {
      'CC0-1.0':
        'Sie verzichten auf alle Rechte und geben das Foto gemeinfrei frei — jeder darf es für alles ohne Namensnennung nutzen.',
      'CC-BY-4.0':
        'Andere dürfen das Foto teilen und bearbeiten, auch kommerziell, sofern sie den Urheber nennen.',
      'CC-BY-SA-4.0':
        'Andere dürfen das Foto teilen und bearbeiten, auch kommerziell, sofern sie den Urheber nennen und ihr Werk unter derselben Lizenz weitergeben.',
      'CC-BY-NC-4.0':
        'Andere dürfen das Foto zu nicht-kommerziellen Zwecken teilen und bearbeiten, sofern sie den Urheber nennen.',
      'CC-BY-NC-SA-4.0':
        'Andere dürfen das Foto zu nicht-kommerziellen Zwecken teilen und bearbeiten, sofern sie den Urheber nennen und ihr Werk unter derselben Lizenz weitergeben.',
    },
  },
  locationPicking: {
    title: 'Fotoposition wählen',
  },

  filterModal: {
    title: 'Foto-Filter',
    tag: 'Tag',
    createdAt: 'Hochladedatum',
    takenAt: 'Aufnahmedatum',
    author: 'Autor',
    rating: 'Bewertung',
    noTags: 'keine Tags',
    pano: 'Panorama',
    premium: 'Premium',
  },

  allMyPhotos: {
    title: 'Zugriffsänderung',
    premium: 'Alle meine Fotos in Premium-Inhalte aufnehmen',
    free: 'Alle meine Fotos für alle zugänglich machen',
    confirmPremium:
      'Alle Ihre Fotos in Premium-Inhalte aufnehmen? Nur Benutzer mit Premium-Zugang können sie sehen.',
    confirmFree: 'Alle Ihre Fotos für alle zugänglich machen?',
    confirmLicense: (license) =>
      `Die Lizenz aller Ihrer Fotos auf ${license} setzen? Fotos, die bereits eine andere Lizenz verwenden, werden ab jetzt neu lizenziert.`,
  },

  legend: 'Legende',
  recentTags: 'Kürzlich verwendete Tags:',
  filter: 'Filter',
  showPhotosFrom: 'Fotos anzeigen',
  showLayer: 'Ebene anzeigen',
  upload: 'Hochladen',
  colorizeBy: 'Einfärben nach',
  showDirection: 'Aufnahmerichtung anzeigen',

  deletingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Löschen des Fotos', err),

  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Tags', err),

  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden des Fotos', err),

  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Fotos', err),

  savingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern des Fotos', err),

  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Hinzufügen des Kommentars', err),

  ratingError: ({ err }) =>
    addError(getMessages()!, 'Fehler bei der Bewertung des Fotos', err),

  missingPositionError: 'Fehlende Position.',
  invalidPositionError: 'Ungültiges Koordinatenformat.',
  invalidTakenAt: 'Ungültiges Aufnahmedatum und -zeit.',
  noPicturesFound: 'An diesem Ort wurden keine Fotos gefunden.',
  linkToWww: 'Foto auf www.freemap.sk',
  linkToImage: 'Bilddatei des Fotos',
};

export default de;
