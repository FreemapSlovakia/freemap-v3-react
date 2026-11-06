import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const fr: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  info: () => <DataViewerDetails />,
  upload: 'Importer',
  unnamedTrack: ({ n }) => `Trace ${n}`,
  simplifyAll: 'Tout simplifier',
  moreInfo: 'Plus d’infos',
  breakApart: 'Séparer en parties',
  saveAsMap: 'Enregistrer dans mes cartes',
  loginToSaveMap:
    'Connectez-vous d’abord pour enregistrer la trace dans vos cartes.',
  vertex: {
    channels: {
      heart: 'Fréquence cardiaque',
      cads: 'Cadence',
      atemps: 'Température de l’air',
      wtemps: 'Température de l’eau',
      depths: 'Profondeur',
      speeds: 'Vitesse',
      courses: 'Direction du déplacement',
      bearings: 'Azimut',
      powers: 'Puissance',
      accuracies: 'Précision',
      battery: 'Batterie',
      gsmSignal: 'Signal GSM',
    },
    menuItem: 'Données du point',
    latitude: 'Latitude',
    longitude: 'Longitude',
    elevation: 'Altitude',
    time: 'Heure',
    filled: ({ filled, total }) => `${filled} points sur ${total}`,
    emptyHint:
      'Un champ vide laisse le point sans cette valeur. Les valeurs que porte la ligne se définissent dans ses Propriétés.',
    notANumber: 'Saisissez un nombre.',
    outOfRange: 'Hors limites.',
    timeOrder:
      'L’heure doit se situer entre celles du point précédent et du point suivant.',
  },
  split: {
    action: 'Diviser',
    pick: 'Cliquez sur la trace à l’endroit de la coupure',
    here: 'Diviser ici',
  },
  join: {
    action: 'Fusionner',
    asLine: 'Fusionner en une seule ligne',
    asSegments: 'Fusionner en gardant les segments',
    pick: 'Cliquez sur la trace à fusionner',
    pickEnd: 'Sélectionnez un point pour joindre les lignes',
  },
  osmUpload: {
    visibilities: {
      identifiable: 'Identifiable',
      public: 'Publique',
      trackable: 'Traçable',
      private: 'Privée',
    },
    visibilityHints: {
      identifiable:
        'Affichée dans la liste des traces avec votre nom, sous forme de points ordonnés et horodatés.',
      public:
        'Affichée dans la liste des traces avec votre nom, sous forme de points anonymes non ordonnés.',
      trackable:
        'Partagée uniquement sous forme de points anonymes ordonnés et horodatés.',
      private:
        'Partagée uniquement sous forme de points anonymes non ordonnés.',
    },
    menuItem: 'Envoyer la trace GPS vers OpenStreetMap',
    title: 'Envoyer la trace GPS vers OpenStreetMap',
    help: 'Envoie les traces chargées sur votre compte OpenStreetMap en tant que trace GPS, à partir de laquelle les contributeurs peuvent cartographier des chemins. Seules les traces avec des heures enregistrées sont envoyées, car OpenStreetMap ne conserve rien d’autre. N’envoyez que des traces que vous avez enregistrées vous-même.',
    description: 'Description',
    tags: 'Étiquettes',
    tagsHint: 'Séparées par des virgules.',
    tagsInvalid:
      'OpenStreetMap n’accepte pas . ; / ? % ni # dans une étiquette, ni une étiquette de plus de 255 caractères.',
    visibility: 'Visibilité',
    upload: 'Envoyer',
    loginPrompt:
      'Pour l’envoi, il faut se connecter avec OpenStreetMap et autoriser Freemap à envoyer des traces GPS. Continuer ?',
    connectPrompt:
      'Pour l’envoi, votre compte OpenStreetMap doit être associé à votre compte Freemap et autoriser Freemap à y envoyer des traces GPS. Si vous avez déjà un autre compte Freemap auquel vous vous connectez avec ce compte OpenStreetMap, les deux comptes seront fusionnés en un seul. Continuer ?',
    authorizePrompt:
      'Pour l’envoi, vous devez autoriser Freemap à envoyer des traces GPS sur votre compte OpenStreetMap. Continuer ?',
    reauthorize:
      'L’autorisation donnée à Freemap d’envoyer des traces GPS sur votre compte OpenStreetMap vient d’être retirée. Cliquez à nouveau sur Envoyer pour l’accorder.',
    success: ({ url }) => (
      <>
        La trace a été envoyée. OpenStreetMap la traitera dans quelques minutes.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Afficher la trace sur OpenStreetMap
        </a>
      </>
    ),
  },
  match: {
    menuItem: 'Caler sur les chemins',
    title: 'Caler sur les chemins',
    help: 'Cale la trace sur le réseau de voies cartographiées, ce qui supprime la dispersion du GPS et — c’est l’essentiel — détermine sur quoi passe la trace, permettant de la colorer par revêtement, type de voie, qualité du chemin et difficulté.',
    transport: 'Mode de déplacement',
    dataLoss:
      'La ligne calée a ses propres points : les horodatages et les données enregistrées par les capteurs (fréquence cardiaque, cadence, vitesse) seront perdus.',
    run: 'Caler',
    tooLong: 'Cette trace a trop de points pour être calée.',
    tooShort: 'La trace est trop courte pour être calée.',
    brokenSequence:
      'La trace quitte quelque part le réseau cartographié, elle ne peut donc pas être calée. Essayez un autre mode de déplacement, ou laissez la trace telle quelle.',
    offNetwork:
      'L’itinéraire calé est ressorti bien plus long que la trace, ce qui signifie que la trace ne suivait pas de voies cartographiées — à travers un pré, par exemple. Le calage ne peut répondre qu’avec des voies existantes : le résultat ne serait donc pas votre passage. La trace est laissée telle quelle.',
    partial:
      'Certaines parties de la trace n’ont pas pu être calées — elles restent telles qu’enregistrées. Une trace qui change de mode en cours de route (une marche, puis le retour en voiture) doit d’abord être découpée.',
  },
  details: {
    startTime: 'Heure de départ',
    finishTime: 'Heure d’arrivée',
    duration: 'Durée',
    distance: 'Distance',
    avgSpeed: 'Vitesse moyenne',
    minEle: 'Altitude min.',
    maxEle: 'Altitude max.',
    uphill: 'Dénivelé positif total',
    downhill: 'Dénivelé négatif total',
    durationValue: ({ h, m }) => `${h} heures ${m} minutes`,
    source: 'Source de l’altitude',
    sourceOriginal: 'enregistrée',
    sourcePartial: 'enregistrée, incomplète',
    sourceFilledGaps: 'enregistrée, lacunes comblées (modèle de terrain)',
    sourceFilled: 'modèle de terrain',
  },
  uploadModal: {
    title: 'Importer un fichier',
    drop: 'Déposez ici un fichier GPX, KML, KMZ, TCX ou GeoJSON, ou cliquez pour le sélectionner. Vous pouvez en choisir plusieurs à la fois.',
    mergeTitle: 'Données déjà chargées',
    mergeMessage:
      'Certaines géodonnées sont déjà affichées. Ajouter les données importées ou les remplacer ?',
    existingData: 'Données existantes',
    append: 'Ajouter',
    replace: 'Remplacer',
  },
  trace: {
    streams: 'Tracé des cours d’eau',
    forests: 'Tracé des forêts',
    streamsHelp:
      'Sert à déduire les lignes des cours d’eau du modèle de terrain haute résolution dans le polygone sélectionné. Utile pour cartographier dans OpenStreetMap.',
    forestsHelp:
      'Sert à tracer les surfaces couvertes par les classes de points LiDAR choisies dans le polygone sélectionné. Utile surtout pour cartographier l’occupation du sol dans OpenStreetMap.',
    pixelSize: 'Taille de pixel',
    pixelSizeHint: 'Vide pour la résolution propre du modèle de terrain.',
    threshold: 'Surface minimale du bassin versant',
    minLength: 'Longueur minimale du cours d’eau',
    simplify: 'Tolérance de simplification',
    classes: 'Classes de points',
    classNames: {
      lowVegetation: 'Végétation basse',
      mediumVegetation: 'Végétation moyenne',
      highVegetation: 'Végétation haute',
      building: 'Bâtiments',
      water: 'Eau',
    },
    output: 'Résultat',
    outputJosm: 'Ouvrir dans JOSM',
    outputOsm: 'Télécharger en OSM XML',
    outputGeojson: 'Télécharger en GeoJSON',
    tooBig: ({ max }) =>
      `Le polygone est trop grand ; la limite est de ${max}.`,
    run: 'Tracer',
    legacy: ({ phrase, item }) => (
      <>
        Au lieu de l’<i>easter egg</i> <code>{phrase}</code>, utilisez l’élément{' '}
        <i>{item}</i> du menu ⋮ du polygone sélectionné.
      </>
    ),
  },
  elevationFill: {
    title: 'Données d’altitude',
    introNone: 'Il n’y a pas encore de données d’altitude.',
    introPartial: 'L’altitude de certains points est manquante.',
    introFull:
      'Les données d’altitude sont déjà présentes, mais un modèle de terrain ' +
      'est souvent plus précis.',
    premiumHiRes: (premiumLink, countries) => (
      <>
        Avec {premiumLink('l’accès premium')}, l’altitude dans{' '}
        {countries('de nombreux pays européens')} est échantillonnée à partir de
        modèles nationaux de terrain haute résolution.
      </>
    ),
    question: 'Que souhaitez-vous faire ?',
    overrideAll: 'Tout remplacer',
    overrideAllDesc:
      'remplacer chaque point à partir du modèle de terrain — un profil lisse et cohérent',
    fillMissing: 'Compléter les manquants',
    fillMissingDesc:
      'conserver les valeurs enregistrées et ne combler que les lacunes (une marche peut apparaître à ' +
      'la jonction des deux sources)',
    keep: 'Ne rien changer',
    keepDesc: 'utiliser l’altitude enregistrée dans la trace',
    add: 'Ajouter l’altitude',
    update: 'Mettre à jour l’altitude',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'L’altitude manquante a été complétée.'
        : mode === 'clear'
          ? 'L’altitude a été supprimée.'
          : 'L’altitude a été remplacée.',
    clear: 'Effacer l’altitude',
    clearDesc:
      'supprimer l’altitude enregistrée ; les profils la lisent alors dans le modèle de terrain',
  },
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la récupération des données de la trace',
      err,
    ),
  loadingError: 'Erreur lors du chargement du fichier.',
  onlyOne: 'Un seul fichier est attendu.',
  invalidFormat:
    'Le fichier n’est pas dans un format pris en charge ou est invalide.',
  someFilesFailed: ({ names }) =>
    `Certains fichiers n’ont pas pu être chargés : ${names}.`,
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du calage de la trace', err),
  snapshotGone:
    'Les données affichées à cette étape ne sont plus conservées dans ce navigateur.',
  snapshotFailed:
    'Ce navigateur n’a pas pu conserver les données : elles seront perdues au rechargement de la page. Enregistrez-les dans vos cartes pour les conserver.',
  osmUploadError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de l’envoi vers OpenStreetMap', err),
};

export default fr;
