import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const fr: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>Choisissez d’où regarder avec le bouton {icon} ci-dessous.</>
  ),
  rendering: 'Rendu du panorama…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'En attente du moteur de rendu…'
      : ahead === 1
        ? 'En attente — un panorama passe avant.'
        : `En attente — ${ahead} panoramas passent avant.`,
  cancel: 'Annuler',
  update: 'Actualiser',
  outdated: 'L’image montre le point de vue précédent.',
  locate: 'Vue depuis ma position',
  pickViewpoint: 'Choisir sur la carte',
  pickViewpointPrompt: 'Cliquez sur la carte à l’endroit d’où regarder',
  lookAt: 'Regarder un lieu sur la carte',
  pickTargetPrompt: 'Cliquez sur la carte le lieu que vous voulez regarder',
  createToposcope: 'Créer une table d’orientation depuis cette vue',
  toposcopeMergeModal: {
    title: 'La carte n’est pas vide',
    message:
      'Des points sont déjà dessinés sur la carte. Faut-il y ajouter les sommets de cette vue ou les remplacer ? Dans les deux cas, le centre de la table se déplace sur ce point de vue.',
    append: 'Ajouter',
    replace: 'Remplacer',
  },
  settings: {
    title: 'Paramètres du panorama',
    tiltHint:
      'La quantité de ciel et de sol que contient l’image — les angles au-dessus et au-dessous de l’horizon.',
    custom: 'Angles exacts',
    depthLift: 'Déplier la distance',
    depthLiftOff: 'Vue fidèle',
    depthLiftHint:
      'Relève le relief lointain, de sorte que les chaînes éloignées se détachent des crêtes qui les précèdent, comme sur un panorama dessiné à la main. Cela fait aussi entrer dans l’image des sommets que vous ne verriez pas réellement d’ici ; leurs noms sont signalés.',
    rangeHint:
      'Le relief au-delà de 300 km relève du premium. Chaque kilomètre supplémentaire est parcouru le long de chaque rayon de l’image : une vue plus lointaine coûte donc proportionnellement plus au moteur de rendu.',
    look: 'Style',
    looks: {
      natural: 'Naturel',
      relief: 'Relief ombré',
      drawn: 'Dessiné',
      engraved: 'Gravé',
      custom: 'Personnalisé',
    },
    ridgeStrength: 'Intensité des lignes de crête',
    ridgeWidth: 'Épaisseur des lignes de crête',
    ridgeColor: 'Couleur des crêtes',
    ground: 'Relief',
    groundHint:
      'Une seule couleur, que la brume intégrée délave vers celle du ciel avec la distance — ou un dégradé, qui colore le relief selon son éloignement et remplace la brume entièrement.',
    groundSolid: 'Couleur',
    groundGradient: 'Dégradé',
    gradientFar: 'Le dégradé va jusqu’à',
    gradientFarAuto: 'Automatique',
    gradientFarHint:
      'La distance à laquelle la dernière couleur est atteinte ; le milieu de la barre se situe au tiers de celle-ci. En automatique, elle est mesurée sur le relief réellement dans le champ, de sorte que toute la palette se dépense sur ce que l’image montre.',
    gradientSky: 'Fondre dans le ciel',
    gradientSkyHint:
      'La dernière couleur devient le ciel lui-même : les chaînes lointaines se dissolvent dans l’horizon au lieu de s’y découper. Désactivé, on obtient la ligne de crête franche que veut une affiche.',
    gradientClip: 'Masquer le relief au-delà',
    gradientClipHint:
      'Le relief au-delà de cette distance est omis plutôt que peint à plat dans la dernière couleur, de sorte que tout le dégradé se dépense sur ce que l’image montre. Les sommets qui s’y trouvent ne sont pas nommés.',
  },
  preview: 'Aperçu',
  quality: {
    label: 'Qualité / vitesse',
    superfast: 'Minimale / la plus rapide',
    fast: 'Basse / rapide',
    standard: 'Standard',
    detailed: 'Détaillée / lente',
    finest: 'Maximale / la plus lente',
    premiumHint:
      'Un panorama plus fin est rendu jusqu’à six fois la résolution et neuf fois l’échantillonnage, ce qui montre les crêtes telles qu’elles sont et non en marches d’escalier. Sur un serveur qui rend un panorama à la fois, chaque niveau coûte proportionnellement plus, c’est pourquoi les plus fins relèvent du premium.',
  },
  tilt: {
    label: 'Étendue verticale',
    standard: 'Standard',
    wide: 'Haute',
    flat: 'Basse',
  },
  labels: {
    title: 'Noms des sommets',
    density: 'Nombre de noms',
    none: 'Aucun',
    few: 'Moins',
    normal: 'Normal',
    many: 'Plus',
    weight: 'Classer les sommets par',
    weightHint:
      'Par la taille, ce sont les grandes montagnes qui sont nommées, aussi loin soient-elles ; au milieu, ce qui remplit la vue ; par la proximité, ce qui est proche, quelle que soit son allure.',
    weights: [
      'Taille',
      'Plutôt la taille',
      'Taille et proximité',
      'Plutôt la proximité',
      'Proximité',
    ],
    prominence: 'Privilégier les vraies montagnes',
    prominenceOff: 'Désactivé',
    prominenceHint:
      'Un sommet est nommé parce qu’il est une montagne en soi, et pas seulement parce qu’il se détache de l’endroit où vous vous trouvez — ainsi un sommet célèbre coincé entre des voisins plus hauts mérite quand même son nom. Elle est inconnue pour beaucoup de sommets, qui sont alors jugés comme avant.',
    haze: 'Jusqu’où portent les noms',
    hazeOff: 'Air limpide',
    hazeHint:
      'À quelle distance un sommet doit se trouver pour que la brume compte plus que le sommet lui-même. Au-delà du triple de cette distance, plus rien n’est nommé.',
    showEle: 'Afficher les altitudes',
    showEleHint:
      'Écrit l’altitude sous le nom de chaque sommet. L’étiquette fait alors deux lignes, si bien qu’il en tient moins dans l’image.',
    showRevealed: 'Nommer les sommets révélés',
    showRevealedHint:
      'Sommets que le dépliement de la distance a fait sortir de derrière une crête plus proche : ils sont dessinés, mais on ne les voit pas réellement d’ici. Leurs noms sont plus pâles et, quand la place manque pour les deux, la priorité va au sommet que l’on voit.',
  },
  dominance: {
    label: 'Dominance minimale',
    all: 'Quelconque',
  },
  autoPan: 'Tourner avec l’appareil ou de soi-même',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
  },
  errors: {
    offline: 'Un panorama est rendu par le serveur, et vous êtes hors ligne.',
    unreachable:
      'Le service de rendu n’a pas pu être joint. Il est peut-être hors service, ou quelque chose entre vous et lui bloque la requête.',
    busy: 'Le service de rendu est indisponible pour le moment. Réessayez dans un instant.',
    tooMany:
      'Trop de panoramas ont été rendus récemment. Réessayez plus tard ou passez au premium.',
    noData:
      'Il n’y a pas de données de relief pour ce point de vue. Essayez de cliquer ailleurs.',
    failed: 'Le panorama n’a pas pu être rendu.',
  },
  caveats: {
    title: 'Ce que l’image montre et ce qu’elle ne montre pas',
    bareEarth:
      'Le modèle de terrain est le sol nu : les forêts et les bâtiments n’y figurent pas, si bien qu’une vue qu’une forêt masquerait est dessinée comme dégagée. C’est de loin la principale source d’erreur.',
    coverage:
      'Le détail varie selon les pays. Là où existe un modèle national issu d’un relevé laser, le premier plan est net ; ailleurs, c’est un modèle mondial à 30 m qui répond.',
    viewpoint:
      'L’œil est placé sur le point le plus haut à quelques mètres de votre clic, pour qu’un rocher voisin ne gâche pas la vue depuis le sommet.',
    depthLift:
      'La distance est dépliée : cette image est donc un dessin et non une photographie. Les sommets au nom plus pâle sont en réalité masqués par une crête devant eux, et une distance lue sur l’image ne signifie plus une ligne de vue dégagée.',
  },
  terrainSource: 'Relief',
  peakSource: 'Noms des sommets',
};

export default fr;
