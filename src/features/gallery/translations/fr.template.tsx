import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const fr: DeepPartialWithRequiredObjects<GalleryMessages> = {
  stats: {
    leaderboard: 'Classement',
    country: 'Pays',
    perUserPerCountry: 'Photos par auteur et par pays',
    perUser: 'Photos par auteur',
    more: 'Plus',
    less: 'Moins',
    user: 'Auteur',
    photos: 'Photos',
    numberOfPhotos: 'Nombre de photos',
    timePeriod: 'Période',
    allTime: 'Depuis le début',
    last3months: '3 derniers mois',
    last30days: '30 derniers jours',
  },
  f: {
    '-createdAt': 'de la dernière importée',
    '-takenAt': 'de la plus récente',
    '-rating': 'de la mieux notée',
    '-lastCommentedAt': 'du dernier commentaire',
  },
  c: {
    disable: 'Ne pas colorer',
    mine: 'Distinguer les miennes',
    userId: 'Auteur',
    rating: 'Note',
    takenAt: 'Date de prise de vue',
    createdAt: 'Date d’import',
    season: 'Saison',
    premium: 'Premium',
  },
  viewer: {
    uploaded: ({ username, createdAt }) => (
      <>
        Importée par {username} le {createdAt}
      </>
    ),
    captured: (takenAt) => <>Prise le {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Voulez-vous vraiment supprimer la photo <i>{title}</i> ?
        </>
      ) : (
        <>Voulez-vous vraiment supprimer cette photo ?</>
      ),
    title: 'Photo',
    comments: 'Commentaires',
    newComment: 'Nouveau commentaire',
    addComment: 'Ajouter',
    yourRating: 'Votre note :',
    showOnTheMap: 'Afficher sur la carte',
    openInNewWindow: 'Ouvrir dans…',
    deleteTitle: 'Suppression de la photo',
    modify: 'Modifier',
    premiumOnly:
      'Cette photo n’a été rendue disponible par son auteur qu’aux utilisateurs disposant d’un accès premium.',
    noComments: 'Aucun commentaire',
  },
  editForm: {
    takenAt: {
      datetime: 'Date et heure de prise de vue',
      date: 'Date de prise de vue',
      time: 'Heure de prise de vue',
    },
    name: 'Nom',
    description: 'Description',
    location: 'Emplacement',
    azimuth: 'Azimut',
    tags: 'Étiquettes',
    setLocation: 'Définir l’emplacement',
  },
  uploadModal: {
    uploading: (n) => `Import en cours (${n})`,
    rules: `
      <p>Déposez vos photos ici ou cliquez ici pour les sélectionner.</p>
      <ul>
        <li>N’importez pas de photos trop petites (miniatures). Les dimensions maximales ne sont pas limitées. La taille maximale du fichier est limitée à 10 Mo. Les fichiers plus volumineux seront refusés.</li>
        <li>N’importez que des photos de paysages ou des photos documentaires. Les portraits et les photos macro sont indésirables et seront supprimés sans avertissement.</li>
        <li>Veuillez n’importer que vos propres photos.</li>
        <li>Les légendes ou commentaires qui ne se rapportent pas directement au contenu des photos importées, ou qui contreviennent aux principes généralement admis d’une coexistence civilisée, seront supprimés. Les contrevenants à cette règle seront avertis et, en cas de récidive, leur compte dans l’application pourra être supprimé.</li>
        <li>En important les photos, vous acceptez qu’elles soient diffusées selon les termes de la licence CC BY-SA 4.0.</li>
        <li>L’exploitant (Freemap.sk) décline par la présente toute responsabilité et n’est pas responsable des dommages directs ou indirects résultant de la publication d’une photo dans la galerie. La personne qui a importé la photo sur le serveur est entièrement responsable de celle-ci.</li>
        <li>L’exploitant se réserve le droit de modifier la description, le nom, la position et les étiquettes d’une photo, ou de supprimer la photo si son contenu est inapproprié (en violation de ces règles).</li>
        <li>L’exploitant se réserve le droit de supprimer le compte au cas où l’utilisateur enfreindrait de manière répétée le règlement de la galerie en publiant du contenu inapproprié.</li>
      </ul>
    `,
    title: 'Importer des photos',
    upload: 'Importer',
    success: 'Les photos ont été importées avec succès.',
    showPreview:
      'Afficher automatiquement les aperçus (consomme davantage de processeur et de mémoire)',
    loadPreview: 'Charger l’aperçu',
    premium: 'Rendre disponible uniquement aux utilisateurs avec accès premium',
  },
  locationPicking: {
    title: 'Sélectionnez l’emplacement de la photo',
  },
  deletingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de la suppression de la photo', err),
  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement des étiquettes', err),
  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement de la photo', err),
  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement des photos', err),
  savingError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de l’enregistrement de la photo',
      err,
    ),
  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de l’ajout du commentaire', err),
  ratingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de la notation de la photo', err),
  filterModal: {
    title: 'Filtrage des photos',
    tag: 'Étiquette',
    createdAt: 'Date d’import',
    takenAt: 'Date de prise de vue',
    author: 'Auteur',
    rating: 'Note',
    noTags: 'sans étiquette',
    pano: 'Panorama',
    premium: 'Premium',
  },
  allMyPhotos: {
    title: 'Modification d’accès',
    premium: 'Inclure toutes mes photos dans le contenu premium',
    free: 'Rendre toutes mes photos accessibles à tous',
    confirmPremium:
      'Inclure toutes vos photos dans le contenu premium ? Seuls les utilisateurs disposant d’un accès premium pourront les voir.',
    confirmFree: 'Rendre toutes vos photos accessibles à tous ?',
  },
  sendGalleryEmails: 'Notifier les commentaires sur les photos par e-mail',
  legend: 'Légende',
  recentTags: 'Étiquettes récentes à attribuer :',
  filter: 'Filtre',
  showPhotosFrom: 'Voir les photos',
  showLayer: 'Afficher la couche',
  upload: 'Importer',
  colorizeBy: 'Colorer selon',
  showDirection: 'Afficher la direction de prise de vue',
  missingPositionError: 'Emplacement manquant.',
  invalidPositionError: 'Format de coordonnées de l’emplacement invalide.',
  invalidTakenAt: 'Date et heure de prise de vue invalides.',
  noPicturesFound: 'Aucune photo n’a été trouvée à cet endroit.',
  linkToWww: 'photo sur www.freemap.sk',
  linkToImage: 'fichier image de la photo',
};

export default fr;
