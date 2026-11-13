import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const fr: DeepPartialWithRequiredObjects<TerrainModelMessages> = {
  area: 'Zone',
  width: 'Largeur du modèle',
  size: ({ scale, width, depth }) =>
    `Échelle 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) =>
    `Grille ${step} mm (${cols} × ${rows} points)`,
  elevation: ({ m }) => `Données d’altitude lues tous les ${m} m`,
  limitedBySamples: 'Le niveau de détail est limité par la taille du modèle.',
  premiumFiner: (premiumLink, { step, data, premiumStep, premiumData }) => (
    <>
      Avec {premiumLink('l’accès Premium')}, la grille descend jusqu’à{' '}
      {premiumStep} mm, à partir de données tous les {premiumData} m là où les
      modèles nationaux du terrain sont aussi fins, au lieu de {step} mm à
      partir de données tous les {data} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Téléchargement des données d’altitude (${done} / ${total})`,
  progressMesh: 'Création du modèle',
  limitedByData: 'Les données d’altitude ne sont pas plus fines.',
  exaggeration: 'Exagération verticale',
  base: 'Épaisseur du socle',
  simplification: 'Simplification du maillage : écart maximal',
  simplificationOff: 'Désactivée',
  simplificationTooLarge:
    'Ce modèle a trop de points pour être simplifié dans le navigateur ; il est créé en entier.',
  simplificationHint:
    'Fusionne les triangles tant que la surface reste à cette hauteur des données, pour un fichier plus petit. Sur une pente douce, les contours imprimés se décalent latéralement de plusieurs fois plus — 0,02 mm font environ 0,1 mm sur une pente de 10° — et les triangles fusionnés apparaissent comme des facettes planes.',
  printer: 'Imprimante',
  bed: 'Volume d’impression',
  layerHeight: 'Hauteur de couche',
  tooLarge: 'Le modèle dépasse le volume d’impression.',
  areaTooLarge:
    'La zone est trop grande pour un modèle. Zoomez ou sélectionnez une zone plus petite.',
  acrossAntimeridian:
    'La zone traverse le 180e méridien. Sélectionnez une zone d’un seul côté.',
  download: 'Télécharger le STL',
  result: ({ height, layers, triangles, size }) =>
    `Hauteur du modèle ${height} mm (${layers} couches), ${triangles} triangles, ${size}.`,
  tooTall: 'Le modèle est plus haut que le volume d’impression.',
  premiumRefused: ({ m }) =>
    `Les données d’altitude Premium ont été refusées ; le modèle est donc créé à partir de données tous les ${m} m. Pour plus de détail, reconnectez-vous avec un compte Premium.`,
  partialData: ({ percent }) =>
    `${percent} de la zone n’a pas de données d’altitude ; elle y est aplatie au point le plus bas.`,
  noData: 'Il n’y a pas de données d’altitude dans cette zone.',
  error: ({ err }) => `Erreur lors de la création du modèle : ${err}`,
  credits: 'Données d’altitude',
};

export default fr;
