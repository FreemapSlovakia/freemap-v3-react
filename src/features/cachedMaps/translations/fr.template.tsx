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
  cachedSuccess: ({ name }) => `Carte « ${name} » mise en cache avec succès.`,
  cacheOfflineMap: 'Mettre la carte en cache pour un usage hors ligne',
  addOfflineMap: 'Ajouter une carte hors ligne',
  emptyMessage:
    'Aucune carte hors ligne enregistrée pour le moment. Ajoutez-en une pour utiliser les cartes sans connexion Internet.',
  zoom: 'Zoom',
  tiles: 'Tuiles',
  size: 'Taille',
  ready: 'Prête',
  pause: 'Suspendre',
  resume: 'Reprendre',
  total: 'Total',
  estSize: 'Taille estimée',
  startCaching: 'Démarrer le téléchargement',
  activate: 'Activer',
  focus: 'Zoomer sur la zone',
  namePrefix: 'Hors ligne',
};

export default fr;
