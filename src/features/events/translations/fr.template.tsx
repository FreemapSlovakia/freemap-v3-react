import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const fr: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement des événements', err),
  saveError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de l’enregistrement de l’événement',
      err,
    ),
  deleteError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la suppression de l’événement',
      err,
    ),
  difficulty: {
    easy: 'Facile',
    moderate: 'Moyenne',
    demanding: 'Difficile',
    expert: 'Expert',
  },
  form: {
    newEvent: 'Nouvel événement',
    editEvent: 'Modifier l’événement',
    organizer: 'Organisateur',
    organizerPlaceholder: 'Vous — ou saisissez le nom d’un utilisateur',
    organizerHint:
      'L’événement est saisi au nom de son organisateur : un compte existant, ou un nouveau nom, qui devient un organisateur sans connexion.',
    onlyOrganizer: 'Seul l’organisateur de l’événement peut le modifier.',
    unavailable:
      'Impossible de charger cet événement — il a peut-être été supprimé.',
    title: 'Titre',
    description: 'Description',
    contactHint:
      'Indiquez comment vous joindre — un numéro de téléphone, un e-mail ou un groupe de discussion : les événements n’ont pas encore de discussion.',
    cover: 'Image de couverture',
    coverTooLarge: 'L’image dépasse 20 Mo.',
    start: 'Début',
    end: 'Fin',
    linkedMap: 'Carte associée',
    noMap: 'Aucune',
    newMapFromContent: 'Nouvelle carte à partir du contenu actuel',
    noTripStats:
      'La carte ne contient ni itinéraire ni lignes dont tirer les données de la sortie.',
    unsavedTitle: 'Modifications non enregistrées',
    unsavedMessage: ({ name }) =>
      `La carte ouverte « ${name} » contient des modifications non enregistrées. Les enregistrer et associer cette carte, ou enregistrer le contenu comme nouvelle carte ?`,
    saveOpenMap: ({ name }) => `Enregistrer « ${name} »`,
    newMap: 'Nouvelle carte',
    startPoint: 'Lieu de départ',
    setLocation: 'Définir la position',
    transport: 'Mode de déplacement',
    difficulty: 'Difficulté',
    dogs: 'Chiens',
    dogsWelcome: 'Bienvenus',
    dogsNotAllowed: 'Non admis',
    children: 'Enfants',
    childrenSuitable: 'Adapté',
    childrenNotSuitable: 'Non adapté',
    length: 'Longueur',
    duration: 'Durée',
    ascent: 'Dénivelé positif',
    descent: 'Dénivelé négatif',
    visibility: 'Visibilité',
    public: 'Public',
    unlisted: 'Non répertorié (accessible uniquement par son lien)',
  },
  filter: {
    title: 'Filtre des événements',
    date: 'Date',
    dateHint:
      'Sans date de début, seuls les événements qui ne sont pas encore terminés sont affichés.',
    near: 'À proximité de',
    anywhere: 'Partout',
    within: 'dans un rayon de',
    myLocation: 'Ma position',
    homePosition: 'Position du domicile',
    dogsWelcome: 'Chiens bienvenus',
    childrenSuitable: 'Adapté aux enfants',
    from: 'de',
    to: 'à',
    unsaid: 'Inclure les événements qui ne le précisent pas',
    unsaidHint:
      'Mode de déplacement, difficulté, longueur, durée et dénivelé positif : les événements qui ne les précisent pas sont aussi affichés.',
  },
  card: {
    unlisted: 'Non répertorié',
    dogsWelcome: 'Chiens bienvenus',
    noDogs: 'Sans chiens',
    children: 'Adapté aux enfants',
    noChildren: 'Non adapté aux enfants',
  },
  selection: {
    backToEvents: 'Retour aux événements',
    details: 'Détails',
    interested: 'Ça m’intéresse',
    going: 'J’y participe',
    openInNewTab: 'Ouvrir dans un nouvel onglet',
    loadHere: 'Charger ici',
    deleteTitle: 'Supprimer l’événement',
    deleteMessage: ({ title }) =>
      `Supprimer l’événement « ${title} » ? La carte associée est conservée.`,
  },
  picking: {
    startPoint: 'Sélectionnez le lieu de départ',
    place: 'Sélectionnez un lieu',
  },
  menu: {
    filter: 'Filtre',
    newEvent: 'Nouvel événement',
  },
  colorize: {
    modes: {
      when: 'Date',
      mine: 'Les miens et les autres',
      transport: 'Mode de déplacement',
      distance: 'Longueur',
      duration: 'Durée',
      ascent: 'Dénivelé positif',
      difficulty: 'Difficulté',
      dogs: 'Chiens',
      children: 'Enfants',
    },
    mine: {
      mine: 'Les miens',
      going: 'J’y participe',
      interested: 'Ça m’intéresse',
      others: 'Autres',
    },
    by: 'Colorer selon',
    none: 'Aucun',
    legend: 'Légende',
    ended: 'Terminé',
    happening: 'En cours',
    several: 'Plusieurs',
    days: 'jours',
    yes: 'Oui',
    no: 'Non',
  },
  noEvents: 'Aucun événement trouvé',
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'L’événement est enregistré, mais pas son image de couverture',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de l’enregistrement de la nouvelle carte, l’événement n’est donc pas enregistré non plus',
      err,
    ),
  participationError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de l’enregistrement de votre participation',
      err,
    ),
  loginToParticipate:
    'Connectez-vous pour indiquer votre intérêt ou votre participation.',
  notSaid: 'Non précisé',
  any: 'Indifférent',
};

export default fr;
