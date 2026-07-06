import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import type { TrackViewerMessages } from './TrackViewerMessages.js';

const fr: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Importer',
  trackLabel: 'Trace',
  unnamedTrack: ({ n }) => `Trace ${n}`,
  convertLossWarning:
    'La conversion en dessin remplace la trace et supprime ses données enregistrées (altitude, fréquence cardiaque, vitesse, temps).',
  moreInfo: 'Plus d’infos',
  saveAsMap: 'Enregistrer dans mes cartes',
  loginToSaveMap:
    'Connectez-vous d’abord pour enregistrer la trace dans vos cartes.',
  style: {
    title: 'Style par défaut',
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
};

export default fr;
