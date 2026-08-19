import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const fr: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  incomplete: ({ pct }) => <>Incomplète ({pct} %)</>,
  largeDownload: ({ tiles, size }) => (
    <>
      Téléchargement volumineux : {tiles} tuiles (~{size}). Cela peut prendre un
      moment.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Espace insuffisant : le téléchargement nécessite environ {size}, mais
      seuls {free} sont disponibles dans ce navigateur. Il s’arrêterait en cours
      de route.
    </>
  ),
  cachedSuccess: ({ name }) => `Carte « ${name} » mise en cache avec succès.`,
  cacheOfflineMap: 'Mettre la carte en cache pour un usage hors ligne',
  modifyOfflineMap: 'Modifier la carte hors ligne',
  toDownload: 'À télécharger',
  addOfflineMap: 'Ajouter une carte hors ligne',
  emptyMessage:
    'Aucune carte hors ligne enregistrée pour le moment. Ajoutez-en une pour utiliser les cartes sans connexion Internet.',
  zoom: 'Zoom',
  tiles: 'Tuiles',
  size: 'Taille',
  ready: 'Prête',
  resume: 'Reprendre',
  stop: 'Arrêter',
  total: 'Total',
  estSize: 'Taille estimée',
  startCaching: 'Démarrer le téléchargement',
  activate: 'Activer',
  focus: 'Zoomer sur la zone',
  namePrefix: 'Hors ligne',
  offlineWiden:
    'Sans connexion, cette carte peut être réduite mais pas agrandie — l’agrandir nécessiterait de télécharger des tuiles qu’elle ne contient pas.',
  premiumZoomHint:
    'Les niveaux de zoom les plus détaillés de cette couche sont premium. Une carte hors ligne conserve ses tuiles définitivement et les affiche sans connexion : les télécharger demande donc un accès premium.',
  premiumWiden:
    "Cette carte atteint des niveaux de zoom premium. Sans accès premium, elle peut être réduite mais pas agrandie — l'agrandir téléchargerait de nouveau des tuiles premium.",
  premiumSkipped:
    "Les niveaux de zoom les plus détaillés de cette carte sont premium et n'ont pas été téléchargés : elle reste donc marquée comme incomplète.",
  networkFallback: 'Télécharger depuis internet les tuiles manquantes',
  networkFallbackHint:
    "Activé : en se déplaçant hors de la zone téléchargée ou en zoomant davantage, les tuiles en direct s'affichent tant qu'il y a une connexion internet. Désactivé : la carte n'affiche que ce qui a été téléchargé.",
  deleteTitle: 'Supprimer la carte hors ligne',
  deleteConfirm: ({ name }) => (
    <>
      Vraiment supprimer la carte hors ligne <b>{name}</b> et toutes ses tuiles
      ?
    </>
  ),
  browse: {
    intro:
      'Les tuiles rencontrées sur la carte peuvent être conservées pour plus tard, afin que les zones revisitées se chargent sans connexion internet. Cela concerne toutes les couches tuilées et reste indépendant des cartes hors ligne téléchargées.',
    mode: 'Source des tuiles',
    modes: {
      networkOnly: 'Internet uniquement',
      networkFirst: 'Internet, puis cache',
      cacheFirst: 'Cache, puis internet',
      cacheOnly: 'Cache uniquement',
    },
    store: 'Enregistrer les tuiles téléchargées depuis internet',
    maxAge: 'Conserver les tuiles',
    maxSize: 'Limite de taille',
    days: ({ days }) => <>{days} jours</>,
    keepForever: "Tant qu'il y a de la place",
    noSizeLimit: 'Sans limite',
    retentionHint:
      'Les tuiles expirées sont supprimées, et au-delà de la limite de taille les moins récemment affichées partent en premier.',
    cached: ({ tiles, size }) => (
      <>
        En cache : <strong>{tiles}</strong> tuiles ({size})
      </>
    ),
    clear: 'Vider le cache',
    clearConfirm:
      'Vraiment supprimer toutes les tuiles conservées pendant la navigation ? Les réglages sont conservés.',
  },
};

export default fr;
