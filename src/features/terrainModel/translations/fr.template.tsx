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
  build: 'Créer le modèle',
  sizeAndShape: 'Taille et forme',
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
  progressFile: 'Écriture du 3MF',
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
  colourFeatures: 'Éléments de la carte en couleur',
  colourFeaturesHint:
    'Les éléments choisis sont colorés sur le modèle dans leurs couleurs de la carte, et le modèle se télécharge en 3MF pour une impression multicolore : chaque couleur un filament. Une zone est remplie si son remplissage sur la carte est opaque au moins à moitié, sinon seul son contour est tracé.',
  lineWidth: 'Largeur de ligne',
  pointSize: 'Taille des points',
  colours: 'Couleurs des filaments',
  ground: 'Terrain',
  download3mf: 'Télécharger le 3MF',
  premiumRefused: ({ m }) =>
    `Les données d’altitude Premium ont été refusées ; le modèle est donc créé à partir de données tous les ${m} m. Pour plus de détail, reconnectez-vous avec un compte Premium.`,
  partialData: ({ percent }) =>
    `${percent} de la zone n’a pas de données d’altitude ; elle y est aplatie au point le plus bas.`,
  noData: 'Il n’y a pas de données d’altitude dans cette zone.',
  error: ({ err }) => `Erreur lors de la création du modèle : ${err}`,
  shareCredits:
    'Lors de la publication ou du partage du modèle, indiquez ces sources :',
  creditsNone:
    'Les données d’altitude n’ont pas indiqué de quelles sources elles proviennent.',
  unknownSources: 'Sources qui n’ont pas pu être nommées :',
  mentionFreemap:
    'Nous vous serions reconnaissants de mentionner aussi, lors du partage :',
  discardModelTitle: 'Abandonner le modèle',
  discardModelQuestion:
    'Le modèle n’a pas encore été téléchargé. Voulez-vous l’abandonner ?',
};

export default fr;
