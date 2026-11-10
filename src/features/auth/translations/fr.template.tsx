import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const fr: DeepPartialWithRequiredObjects<AuthMessages> = {
  account: {
    name: 'Nom',
    email: 'E-mail',
    description: 'À propos de moi',
    publicFields: ({ profile }) => (
      <>Afficher sur {profile('mon profil public')}</>
    ),
    delete: 'Supprimer le compte',
    deleteWarning:
      'Voulez-vous vraiment supprimer votre compte ? Cela supprimera toutes vos photos, vos commentaires et évaluations de photos, vos cartes et vos appareils suivis.',
    personalInfo: 'Informations personnelles',
    authProviders: 'Fournisseurs de connexion',
    picture: 'Photo de profil',
    choosePicture: 'Choisir une image',
    pictureTooLarge:
      'L’image est trop volumineuse. La taille maximale est de 5 Mo.',
    homeLocation: 'Position du domicile',
    homeLocationUnset: 'Non définie',
    setHomeLocation: 'Définir sur la carte',
    roles: 'Mes rôles',
    emailUnconfirmed:
      'Cette adresse n’est pas encore confirmée. Tant qu’elle ne l’est pas, Freemap n’y envoie aucun e-mail et elle ne permet pas de se connecter.',
    emailChangeHint:
      'L’adresse sera modifiée dès que vous aurez saisi le code que nous y enverrons.',
    emailConfirmed: 'Votre adresse e-mail a été confirmée.',
    mergeConflict:
      'Un autre compte avec cette adresse confirmée est lié à un autre compte du même fournisseur de connexion ; les deux ne peuvent donc pas être fusionnés.',
    emailMissing:
      'Sans adresse e-mail, Freemap ne peut vous envoyer aucun e-mail.',
    emailOnlyLogin:
      'L’e-mail est le seul moyen de vous connecter à votre compte ; il ne peut donc pas être supprimé.',
    emailUnconfirmedBar: 'Votre adresse e-mail n’est pas encore confirmée.',
    emailUnconfirmedBarLink: 'La confirmer dans votre compte',
    emailMissingBar:
      'Votre compte n’a pas d’adresse e-mail : Freemap ne peut vous envoyer aucun e-mail.',
    emailMissingBarLink: 'L’ajouter dans votre compte',
    dontRemind: 'Ne plus me le rappeler',
  },
  emailCode: {
    or: 'ou avec un code par e-mail',
    email: 'Adresse e-mail',
    send: 'Envoyer le code',
    sent: ({ email }) => (
      <>
        Nous avons envoyé un code à 6 chiffres à <b>{email}</b>. S’il n’arrive
        pas, vérifiez votre dossier de spam.
      </>
    ),
    code: 'Code',
    logIn: 'Se connecter',
    confirm: 'Confirmer',
    resend: 'Renvoyer',
    resendIn: ({ seconds }) => `Renvoyer (${seconds} s)`,
    otherAddress: 'Utiliser une autre adresse',
    confirmError: ({ err }) =>
      addError(getMessages()!, 'Erreur lors de la confirmation du code', err),
    wrongCode: 'Le code est erroné ou a expiré.',
    tooMany: 'Trop de tentatives. Réessayez plus tard.',
    error: ({ err }) =>
      addError(getMessages()!, 'Erreur lors de l’envoi du code', err),
  },
  logInError: ({ err }) => addError(getMessages()!, 'Erreur de connexion', err),
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Erreur de vérification de la connexion', err),
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Erreur de déconnexion', err),
  roleNames: {
    userManager: 'Gestionnaire des utilisateurs',
    galleryModerator: 'Modérateur des photos',
    mapModerator: 'Modérateur des cartes',
    eventManager: 'Gestionnaire des événements',
    trackingManager: 'Gestionnaire du suivi',
    layerPreview: 'Testeur des futures couches de carte',
  },
  appTokens: {
    scopeNames: {
      'gallery:read':
        'Voir les photos, y compris les photos premium si vous avez l’accès premium',
      'gallery:write': 'Envoyer, modifier, évaluer et commenter des photos',
      'maps:read': 'Voir mes cartes',
      'maps:write': 'Créer, modifier et supprimer mes cartes',
      'events:read': 'Voir les événements, et mon intérêt ou ma participation',
      'events:write':
        'Créer, modifier et supprimer mes événements, et indiquer mon intérêt ou ma participation',
      'tracking:read': 'Voir mes appareils suivis',
      'tracking:write': 'Gérer mes appareils suivis et leur partage',
      'tiles:outdoor':
        'Zooms premium (19+) de la carte Outdoor dans des applications comme Locus, si vous avez l’accès premium',
      'tiles:shading':
        'Zooms premium (16+) des ombrages du terrain dans des applications comme Locus, si vous avez l’accès premium',
      'tiles:aerial':
        'Zoom premium (20) des images aériennes slovaques et tchèques dans des applications comme Locus, si vous avez l’accès premium',
      'users:read':
        'Rechercher et consulter les comptes utilisateurs (gestionnaire des utilisateurs)',
      'users:write':
        'Modifier et fusionner les comptes utilisateurs (gestionnaire des utilisateurs)',
    },
    title: 'Jetons d’application',
    about: 'Que sont les jetons d’application ?',
    intro:
      'Un jeton d’application permet à une autre application ou à un script d’utiliser Freemap en votre nom, par exemple pour afficher des photos premium. Il ne peut faire que ce que ses autorisations permettent, et rien sur le compte lui-même, sauf si vous êtes gestionnaire des utilisateurs et lui donnez les autorisations sur les comptes utilisateurs.',
    usage: (
      <>
        Envoyez le jeton dans l’en-tête HTTP <code>Authorization</code> de
        chaque requête à l’API Freemap :
      </>
    ),
    tiles: (
      <>
        Une application comme Locus charge la carte Outdoor avec le jeton dans
        l’URL des tuiles (JOSM n’en a pas besoin) :
      </>
    ),
    keepSecret:
      'Gardez le jeton secret, comme un mot de passe. Si quelqu’un d’autre a pu l’obtenir, supprimez-le et créez-en un nouveau.',
    none: 'Aucun jeton d’application.',
    create: 'Nouveau jeton',
    note: 'Note',
    scopes: 'Autorisations',
    expiration: 'Expire',
    never: 'Jamais',
    days: ({ count }) => `Dans ${count} jours`,
    customDate: 'À une date',
    roleScopeExpiry:
      'Un jeton avec des autorisations sur les comptes utilisateurs doit expirer dans les 7 jours suivant sa création.',
    pastDate: 'La date d’expiration doit être dans le futur.',
    lastUsed: 'Dernière utilisation',
    neverUsed: 'Pas encore utilisé',
    created:
      'Enregistrez le jeton maintenant. Il ne sera plus lisible ici par la suite.',
    revoke: 'Supprimer',
    revokeConfirm: ({ name }) =>
      `Supprimer le jeton « ${name} » ? Les applications qui l’utilisent cesseront de fonctionner.`,
    noNote: 'Sans titre',
    edit: 'Modifier le jeton',
  },
  connectLabel: 'Connecter',
  connectSuccess: ({ provider }) =>
    `Votre compte ${provider} a été associé à votre compte Freemap. Vous pouvez désormais aussi vous connecter avec.`,
  disconnectLabel: 'Déconnecter',
  disconnectSuccess: 'Déconnecté',
  logInWith: 'Choisissez un fournisseur de connexion',
  logInSuccess: 'Vous êtes connecté avec succès.',
  logInError2: 'Erreur de connexion.',
  logOutSuccess: 'Vous êtes déconnecté avec succès.',
  differentAccount: ({ provider }) =>
    `Vous avez autorisé un autre compte ${provider} que celui associé à votre compte Freemap. Déconnectez-vous de ${provider}, connectez-vous avec le compte associé et réessayez.`,
  lastProvider:
    'C’est le dernier moyen de connexion à votre compte, il ne peut donc pas être déconnecté. Rechargez la page pour voir l’état actuel.',
};

export default fr;
