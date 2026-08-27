import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const fr: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  info: () => <DataViewerDetails />,
  upload: 'Importer',
  unnamedTrack: ({ n }) => `Trace ${n}`,
  convertLossWarning:
    'La conversion en dessin remplace la trace et supprime ses données enregistrées (altitude, fréquence cardiaque, vitesse, temps).',
  convertAllToDrawing: 'Tout convertir en dessin',
  moreInfo: 'Plus d’infos',
  saveAsMap: 'Enregistrer dans mes cartes',
  loginToSaveMap:
    'Connectez-vous d’abord pour enregistrer la trace dans vos cartes.',
  style: {
    title: 'Style par défaut',
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
    append: 'Ajouter',
    replace: 'Remplacer',
  },
  elevationFill: {
    title: 'Données d’altitude',
    introNone: 'Cette trace ne comporte pas de données d’altitude.',
    introPartial: 'L’altitude de certains points de cette trace est manquante.',
    introFull:
      'Cette trace comporte déjà une altitude, mais un modèle de terrain est souvent plus ' +
      'précis.',
    premiumHiRes: (premiumLink) => (
      <>
        Avec {premiumLink('l’accès premium')}, l’altitude dans les pays pris en
        charge est échantillonnée à partir d’un modèle national haute résolution
        — actuellement la Slovaquie (DMR 5.0 : ÚGKK SR), d’autres à venir.
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
    updateConfirm:
      'Remplacer l’altitude de la trace par le modèle de terrain ?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'L’altitude manquante a été complétée.'
        : 'L’altitude a été remplacée.',
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
  unsaved: 'Non enregistrée',
  unsavedTooltip:
    'Cette trace ne figure dans aucune carte enregistrée et ne fait pas partie du lien : elle reste uniquement dans ce navigateur, partager le lien ne la partagera donc pas. Enregistrez-la dans vos cartes pour la conserver.',
};

export default fr;
