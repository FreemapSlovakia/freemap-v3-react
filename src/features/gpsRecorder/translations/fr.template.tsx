import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const fr: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Enregistrer',
  pause: 'Mettre en pause',
  stop: 'Terminer',
  connect: 'Connecter',
  install: 'Installer l’enregistreur',
  update: 'Mettre à jour l’enregistreur',
  delete: 'Supprimer l’enregistrement',
  settings: 'Paramètres d’enregistrement',
  details: 'Détails de l’enregistrement',
  recordInBrowser: 'Enregistrer dans ce navigateur',
  browserBadge: 'Dans ce navigateur',
  browserWarning:
    'Enregistrement dans ce navigateur. Il s’arrête lorsque l’écran se ' +
    'verrouille ou que vous quittez cette page ; gardez donc la page ouverte ' +
    'et l’écran allumé pendant tout le parcours.',
  browserNoStorage:
    'Enregistrement dans ce navigateur, mais celui-ci ne conservera pas le ' +
    'parcours — recharger ou fermer cette page le perdra. Terminez ' +
    'l’enregistrement pour le conserver.',
  state: {
    recording: 'Enregistrement',
    stopped: 'Arrêté',
    unknown: 'Non connecté',
  },
  connection: {
    connecting: 'Connexion à l’enregistreur…',
    syncing: 'Récupération de la trace…',
    live: 'En direct',
    reconnecting: 'Reconnexion…',
    offline: 'Pas de vue en direct',
  },
  stats: {
    distance: 'Distance',
    duration: 'Durée',
    elevation: 'Altitude',
    ascent: 'Dénivelé positif',
    speed: 'Vitesse',
    avgSpeed: 'Vitesse moyenne',
    accuracy: 'Précision',
    satellites: 'Satellites',
    points: 'Points',
    segments: 'Segments',
    lastFix: 'Dernier relevé',
  },
  stopModal: {
    title: 'Terminer l’enregistrement ?',
    message: ({ tool }) => (
      <>
        L’enregistrement est toujours en cours. Le terminer l’arrête et déplace
        la trace vers l’outil <b>{tool}</b>. L’enregistreur ne conserve rien, le
        prochain enregistrement commencera donc une nouvelle trace.
      </>
    ),
    confirm: 'Terminer',
  },
  deleteModal: {
    title: 'Supprimer l’enregistrement ?',
    message:
      'L’enregistreur supprime l’intégralité de sa trace. Cette action est ' +
      'irréversible. Terminez plutôt l’enregistrement si vous souhaitez le conserver.',
    confirm: 'Supprimer',
  },
  setup: {
    summary: ({ items }) => (
      <>
        L’enregistreur pourrait ne pas survivre à un long enregistrement :
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'La localisation précise n’est pas autorisée.',
    permissionBackground:
      'La localisation en arrière-plan n’est pas autorisée, l’enregistrement ' +
      's’arrête donc lorsque l’application n’est pas au premier plan.',
    permissionNotifications:
      'Les notifications ne sont pas autorisées, Android peut donc arrêter le service d’enregistrement.',
    battery:
      'L’enregistreur est soumis à l’optimisation de la batterie, Android peut donc l’arrêter.',
    oem: ({ vendor }) =>
      `Les appareils ${vendor} restreignent les applications en arrière-plan ` +
      `au-delà des règles d’Android, et l’étape correspondante de l’enregistreur n’est pas confirmée.`,
    open: 'Ouvrir l’enregistreur',
  },
  errors: {
    unreachable:
      'L’enregistreur n’a pas répondu — il n’est peut-être pas lancé.',
    lnaDenied:
      'Le navigateur a refusé l’accès au réseau local, la vue en direct n’est ' +
      'donc pas disponible. L’enregistrement lui-même n’est pas affecté.',
    setupNeeded:
      'L’enregistreur ne peut pas encore enregistrer — ouvrez-le et ' +
      'accordez-lui ce qu’il demande.',
    recording: 'Arrêtez l’enregistrement avant de supprimer sa trace.',
    incomplete:
      'Une partie de l’enregistrement n’est pas encore parvenue à cette page, ' +
      'rien n’a donc été récupéré ni supprimé. Reconnectez-vous et terminez à nouveau.',
    notStored:
      'L’enregistrement n’a pas pu être stocké dans ce navigateur, il est donc ' +
      'resté sur l’enregistreur. Il figure dans vos traces — exportez-le ou ' +
      'enregistrez-le depuis là.',
    notPersisted:
      'Ce navigateur n’a pas voulu garantir la conservation de son stockage, ' +
      'l’enregistrement est donc resté sur l’enregistreur. Il figure dans vos ' +
      'traces — exportez-le ou enregistrez-le, puis supprimez l’enregistrement.',
    needsForeground:
      'Android n’a pas laissé l’enregistreur démarrer depuis l’arrière-plan. ' +
      'Ouvrez-le et démarrez-y l’enregistrement, ou autorisez-le à fonctionner ' +
      'sans restrictions de batterie afin de pouvoir le lancer d’ici.',
    outdated: 'L’enregistreur est trop ancien pour cette version de la carte.',
    locationDenied:
      'Ce site n’est pas autorisé à utiliser votre position. Autorisez-le ' +
      'dans les paramètres du navigateur pour ce site, puis relancez ' +
      'l’enregistrement.',
    locationUnavailable: 'Ce navigateur ne peut pas déterminer votre position.',
    http: 'L’enregistreur a répondu par une erreur.',
    protocol: 'L’enregistreur a répondu quelque chose d’inattendu.',
    unknown: 'La communication avec l’enregistreur a échoué.',
  },
  settingsModal: {
    title: 'Paramètres d’enregistrement',
    backend: 'Enregistrer avec',
    backendApp: 'L’enregistreur',
    backendBrowser: 'Ce navigateur',
    backendHint:
      'L’application enregistre même écran éteint et mesure l’altitude à ' +
      'chaque relevé. Ce navigateur exige que la page reste ouverte et ' +
      'l’écran allumé, mais ne demande aucune installation.',
    backendLockedHint:
      'Non modifiable pendant un enregistrement en cours. Mettez-le d’abord ' +
      'en pause ou terminez-le.',
    recorderSection: 'Ce qui est enregistré',
    recorderIntro:
      'L’enregistreur les applique au démarrage d’un enregistrement ; les ' +
      'modifier n’affecte donc pas un enregistrement déjà en cours.',
    browserIntro:
      'Appliqués au démarrage d’un enregistrement ; les modifier n’affecte ' +
      'donc pas un enregistrement déjà en cours. C’est le navigateur qui ' +
      'décide à quelle fréquence il communique une position : ce sont donc ' +
      'des limites plutôt que des consignes.',
    intervalMs: 'Temps entre les relevés',
    minDistanceM: 'Distance minimale entre les relevés',
    maxAccuracyM: 'Écarter les relevés moins précis que',
    maxAccuracyOff: 'Conserver tous les relevés',
    source: 'Source de position',
    sourceGps: 'Récepteur GPS',
    sourceFused: 'Fusionnée (GPS, wifi et capteurs)',
    sourceHint:
      'Le récepteur mesure l’altitude à chaque relevé ; la source fusionnée ' +
      'vous situe mieux entre les bâtiments et sous les arbres, mais répète la ' +
      'même altitude pendant plusieurs secondes.',
    priority: 'Précision',
    priorityHigh: 'Maximale (GPS, batterie la plus sollicitée)',
    priorityBalanced: 'Équilibrée',
    priorityLow: 'Faible (batterie la moins sollicitée)',
    priorityFusedOnly: 'Ne s’applique qu’à la source fusionnée.',
    displaySection: 'Affichage',
    splitGapS: 'Commencer un nouveau segment après une pause de',
    splitGapOff: 'Ne jamais scinder',
    splitGapHint:
      'Une pause plus longue que celle-ci est tracée et exportée comme une ' +
      'coupure, et non comme une ligne droite la traversant.',
    feedLocation: 'Utiliser l’enregistrement pour « Me localiser »',
    feedLocationHint:
      'Pendant l’enregistrement, « Me localiser » affiche les relevés ' +
      'enregistrés au lieu que le navigateur suive le GPS séparément.',
    keepScreenAwake: 'Garder l’écran allumé pendant l’enregistrement',
  },
};

export default fr;
