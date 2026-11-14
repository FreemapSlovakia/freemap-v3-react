import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const fr: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Zone',
  texture: 'Carte sur l’aperçu',
  texturePlain: 'Sans carte',
  textureFailed: 'La carte n’a pas pu être chargée pour cette zone.',
  previewUnavailable: 'L’aperçu 3D n’est pas disponible ici.',
  viewArea:
    'Un aperçu lissé de la zone. Une fois créé, le modèle s’affiche tel que le fichier le contient, simplification comprise.',
  viewModel: 'Aperçu fidèle du modèle créé.',
  modelTooLargeToShow:
    'Le modèle créé est trop volumineux pour être affiché ; l’aperçu montre donc la zone. Il reste téléchargeable.',
  build: 'Créer le modèle',
  dimensions: 'Dimensions du modèle',
  scale: 'Échelle',
  detail: ({ detail }) => `Résolution horizontale : ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      Avec {premiumLink('l’accès Premium')}, la résolution horizontale descend
      jusqu’à {premiumDetail} m là où les modèles nationaux du terrain sont
      aussi fins, au lieu de {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Téléchargement des données d’altitude (${done} / ${total})`,
  progressMesh: 'Création du modèle',
  exaggeration: 'Exagération',
  exaggerationHint:
    'Les altitudes sont multipliées par cette valeur : au-dessus de 1, le relief est plus raide qu’en réalité.',
  base: 'Épaisseur du socle',
  simplification: 'Simplification du modèle – écart vertical maximal',
  simplificationOff: 'Désactivée',
  areaTooLarge:
    'La zone est trop grande pour un modèle. Zoomez ou sélectionnez une zone plus petite.',
  acrossAntimeridian:
    'La zone traverse le 180e méridien. Sélectionnez une zone d’un seul côté.',
  download: 'Télécharger le STL',
  result: ({ height, triangles, size }) =>
    `Hauteur du modèle ${height} mm, ${triangles} triangles, ${size}.`,
  premiumRefused: ({ m }) =>
    `Les données d’altitude Premium ont été refusées ; le modèle est donc créé à partir de données tous les ${m} m. Pour plus de détail, reconnectez-vous avec un compte Premium.`,
  partialData: ({ percent }) =>
    `${percent} de la zone n’a pas de données d’altitude ; elle y est aplatie au point le plus bas.`,
  noData: 'Il n’y a pas de données d’altitude dans cette zone.',
  error: ({ err }) => `Erreur lors de la création du modèle : ${err}`,
  credits: 'Données d’altitude',
};

export default fr;
