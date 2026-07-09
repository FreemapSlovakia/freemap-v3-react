import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const fr: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Nom',
    email: 'E-mail',
    description: 'À propos de moi',
    delete: 'Supprimer le compte',
    deleteWarning:
      'Voulez-vous vraiment supprimer votre compte ? Cela supprimera toutes vos photos, vos commentaires et évaluations de photos, vos cartes et vos appareils suivis.',
    personalInfo: 'Informations personnelles',
    authProviders: 'Fournisseurs de connexion',
    picture: 'Photo de profil',
    choosePicture: 'Choisir une image',
    pictureTooLarge:
      'L’image est trop volumineuse. La taille maximale est de 5 Mo.',
  },
  logInError: ({ err }) => addError(getMessages()!, 'Erreur de connexion', err),
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Erreur de vérification de la connexion', err),
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Erreur de déconnexion', err),
  connectLabel: 'Connecter',
  connectSuccess: 'Connecté',
  disconnectLabel: 'Déconnecter',
  disconnectSuccess: 'Déconnecté',
  logInWith: 'Choisissez un fournisseur de connexion',
  logInSuccess: 'Vous êtes connecté avec succès.',
  logInError2: 'Erreur de connexion.',
  logOutSuccess: 'Vous êtes déconnecté avec succès.',
};

export default fr;
