import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import shared from './fr-shared.js';
import { addError, type Messages } from './messagesInterface.js';

const masl = 'm';

const getErrorMarkup = (ticketId?: string) => `
<h1>Erreur de l’application !</h1>
<p>
  ${
    ticketId
      ? `L’erreur a été automatiquement signalée sous l’ID de ticket <b>${ticketId}</b>.`
      : ''
  }
  Vous pouvez signaler le problème sur <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  ou éventuellement nous envoyer les détails par courriel à <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Merci.
</p>`;

const outdoorMap = 'Randonnée, Vélo, Ski, Équitation';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    masl: masl,
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) =>
      addError(messages, 'Erreur de l’application', err),
    savingError: ({ err }) =>
      addError(messages, 'Erreur d’enregistrement', err),
    loadError: ({ err }) => addError(messages, 'Erreur de chargement', err),
    deleteError: ({ err }) => addError(messages, 'Erreur de suppression', err),
    operationError: ({ err }) => addError(messages, 'Erreur d’opération', err),
    noCookies: () => (
      <>
        Cette fonctionnalité nécessite d’accepter le{' '}
        <CookiesConsentText>consentement aux cookies</CookiesConsentText>.
      </>
    ),
    attribution: () => (
      <Attribution unknown="La licence de la carte n’est pas spécifiée" />
    ),
    iso: 'fr_FR',
    elevationProfile: 'Profil altimétrique',
    save: 'Enregistrer',
    cancel: 'Annuler',
    modify: 'Modifier',
    delete: 'Supprimer',
    remove: 'Retirer',
    close: 'Fermer',
    collapse: 'Réduire',
    expand: 'Développer',
    apply: 'Appliquer',
    exitFullscreen: 'Quitter le mode plein écran',
    fullscreen: 'Plein écran',
    yes: 'Oui',
    no: 'Non',
    copyCode: 'Copier le code',
    loading: 'Chargement…',
    ok: 'OK',
    preventShowingAgain: 'Ne plus afficher',
    closeWithoutSaving:
      'Fermer la fenêtre sans enregistrer les modifications ?',
    resetToDefaults: 'Réinitialiser par défaut',
    back: 'Retour',
    seconds: 'secondes',
    minutes: 'minutes',
    meters: 'mètres',
    createdAt: 'Créé le',
    modifiedAt: 'Modifié le',
    actions: 'Actions',
    add: 'Ajouter',
    clear: 'Effacer',
    convertToDrawing: 'Convertir en dessin',
    simplifyPrompt:
      'Veuillez saisir le facteur de simplification. Saisissez zéro pour ne pas simplifier.',
    copyUrl: 'Copier l’URL',
    copyPageUrl: 'Copier l’URL de la page',
    deleted: 'Supprimé.',
    saved: 'Enregistré.',
    visual: 'Affichage',
    drawingTool: 'Outil de dessin',
    copyOk: 'Copié dans le presse-papiers.',
    name: 'Nom',
    load: 'Charger',
    unnamed: 'Sans nom',
    enablePopup:
      'Veuillez autoriser les fenêtres pop-up pour ce site dans votre navigateur.',
    broadcastChannelUnsupported:
      'Cette action n’est pas prise en charge par votre navigateur (BroadcastChannel n’est pas disponible, par ex. en mode privé ou dans un navigateur intégré à une application). Veuillez utiliser une fenêtre standard dans un navigateur moderne.',
    componentLoadingError:
      'Erreur de chargement du composant. Veuillez vérifier votre connexion Internet.',
    offline: 'Vous n’êtes pas connecté à Internet.',
    connectionError: 'Erreur de connexion au serveur.',
    experimentalFunction: 'Fonction expérimentale',
    unauthenticatedError:
      'Veuillez vous connecter pour accéder à cette fonctionnalité.',
    confirmation: 'Confirmation',
    export: 'Exporter',
    success: 'Terminé !',
    expiration: 'Expiration',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d’utilisation',
    refundPolicy: 'Politique de remboursement',
    infoAndLegal: 'Informations sur la carte et mentions légales',
    newOptionText: 'Ajouter %value%',
    deleteButtonText: 'Retirer %value% de la liste',
    accept: 'Accepter',
  },
  generic: {
    color: 'Couleur',
    size: 'Taille',
    weight: 'Épaisseur',
    width: 'Largeur',
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
    auto: 'Mode automatique',
  },
  selections: {
    objects: 'Objet (POI)',
    drawPoints: 'Point',
    drawLines: 'Ligne',
    drawPolygons: 'Polygone',
    tracking: 'Suivi',
    linePoint: 'Point de la ligne',
    polygonPoint: 'Point du polygone',
  },
  tools: {
    none: 'Fermer l’outil',
    routePlanner: 'Planificateur d’itinéraire',
    objects: 'Objets (POI)',
    photos: 'Photos',
    measurement: 'Dessin et mesure',
    drawPoints: 'Dessin de points',
    drawLines: 'Dessin de lignes',
    drawPolygons: 'Dessin de polygones',
    trackViewer: 'Import de fichier',
    changesets: 'Modifications de la carte',
    mapDetails: 'Détails de la carte',
    tracking: 'Suivi en direct',
    myMaps: 'Mes cartes',
    myMap: 'Ma carte',
  },
  mainMenu: {
    title: 'Menu principal',
    logOut: 'Se déconnecter',
    logIn: 'Se connecter',
    account: 'Compte',
    mapFeaturesExport: 'Export des données de la carte',
    gpsDevicesMapExports: 'Cartes pour appareils GPS',
    embedMap: 'Intégrer la carte',
    offlineMapExport: 'Export de cartes hors ligne',
    supportUs: 'Soutenir Freemap',
    help: 'Infos et aide',
    back: 'Retour',
    mapLegend: 'Légende de la carte',
    contacts: 'Contacts',
    facebook: 'Freemap sur Facebook',
    twitter: 'Freemap sur Twitter',
    youtube: 'Freemap sur YouTube',
    github: 'Freemap sur GitHub',
    mastodon: 'Freemap sur Mastodon',
    googlePlay: 'Freemap sur Google Play',
    appStore: 'Freemap sur l’App Store',
    automaticLanguage: 'Automatique',
    mapToDocumentExport: 'Export de la carte en image/document',
    osmWiki: 'Documentation OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/FR:Page_principale',
    status: 'État des services',
    language: 'Langue',
  },
  main: {
    title: shared.title,
    description: shared.description,
    devInfo: () => (
      <div>
        Ceci est une version de test de Freemap Slovakia. Pour la version de
        production, rendez-vous sur{' '}
        <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    cookieConsent: () => (
      <CookieConsent
        prompt="Certaines fonctionnalités peuvent nécessiter des cookies."
        local="Cookies des paramètres locaux et de la connexion via les réseaux sociaux"
        analytics="Cookies d’analyse"
      />
    ),
    infoBars: {},
    clearMap: 'Effacer les éléments de la carte',
    close: 'Fermer',
    closeTool: 'Fermer l’outil',
    locateMe: 'Me localiser',
    locationError: 'Erreur lors de l’obtention de la position.',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    copyright: 'Droits d’auteur',
  },
  search: {
    fetchingError: ({ err }) => addError(messages, 'Erreur de recherche', err),
    sources: {
      bbox: 'Cadre de délimitation',
      geojson: 'GeoJSON',
      tile: 'Tuile',
      coords: 'Coordonnées',
      'overpass-nearby': 'À proximité',
      'overpass-surrounding': 'Objets englobants',
      'nominatim-forward': 'Géocodage',
      'nominatim-reverse': 'Géocodage inverse',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
    inProgress: 'Recherche…',
    noResults: 'Aucun résultat trouvé',
    prompt: 'Saisissez le lieu',
    routeFrom: 'Itinéraire depuis ici',
    routeTo: 'Itinéraire jusqu’ici',
    buttonTitle: 'Rechercher',
    placeholder: 'Rechercher sur la carte',
    result: 'Résultat',
  },
  mapLayers: {
    minZoomWarning: (minZoom) => `Accessible à partir du zoom ${minZoom}`,
    letters: {
      X: outdoorMap,
      S: 'Aérienne',
      Z: 'Aérienne',
      J1: 'Aérienne (2017-2019)',
      J2: 'Aérienne (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Transports publics (ÖPNV)',
      i: 'Couche de données',
      I: 'Photos',
      l1: 'Chemins forestiers NLC (2017)',
      l2: 'Chemins forestiers NLC',
      w: 'Wikipedia',
      M: 'Photos de Wikimedia Commons',
      '5': 'Ombrage du terrain',
      '6': 'Ombrage de la surface',
      '7': 'Ombrage détaillé du terrain',
      '8': 'Ombrage détaillé du terrain',
      VO: 'OpenStreetMap vectorielle',
      VS: 'Streets vectorielle',
      VD: 'Dataviz vectorielle',
      VT: 'Outdoor vectorielle',
      h: 'Ombrage paramétrique',
      z: 'Ombrage paramétrique',
      y: 'Ombrage paramétrique',
      WDZ: 'Composition des essences',
      WLT: 'Types de forêts',
      WGE: 'Géologique',
      WKA: 'Cadastre',
      wka: 'Cadastre',
      WHC: 'Hydrochimique',
    },
    type: {
      map: 'carte',
      data: 'données',
      photos: 'photos',
    },
    attr: {
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Tuiles vectorielles de"
          hostedBy="hébergées par"
        />
      ),
      osmData: '©\xa0contributeurs d’OpenStreetMap',
    },
    technologies: {
      tile: 'Tuiles d’images (TMS, XYZ)',
      maplibre: 'Vectoriel (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Ombrage paramétrique',
    },
    layer: {
      layer: 'Couche',
      base: 'Base',
      overlay: 'Superposition',
    },
    legacyMapWarning: ({ from, to }) => (
      <>
        La carte affichée <b>{messages.mapLayers.letters[from]}</b> est
        obsolète. Passer à la version moderne{' '}
        <b>{messages.mapLayers.letters[to]}</b> ?
      </>
    ),
    showMore: 'Afficher plus de cartes',
    showAll: 'Afficher toutes les cartes',
    filterMaps: 'Filtrer les cartes',
    noMapsFound: 'Aucune carte trouvée',
    settings: 'Paramètres des cartes',
    layers: 'Cartes',
    switch: 'Cartes',
    photoFilterWarning: 'Le filtrage des photos est actif',
    interactiveLayerWarning: 'La couche des éléments de la carte est masquée',
    outsideViewWarning: 'La vue actuelle est en dehors de cette carte',
    customBase: 'Carte personnalisée',
    configureLayers: 'Configurer les couches de la carte',
    customMaps: 'Cartes personnalisées',
    addCustomMap: 'Ajouter une carte personnalisée',
    activate: 'Activer',
    customMapsEmptyMessage:
      'Aucune carte personnalisée définie pour le moment. Ajoutez-en une pour afficher votre propre source de carte.',
    base: 'Couches de base',
    overlay: 'Couches de superposition',
    technology: 'Type',
    url: 'URL',
    minZoom: 'Zoom min.',
    maxNativeZoom: 'Zoom natif max.',
    extraScales: 'Résolutions supplémentaires',
    scaleWithDpi: 'Mettre à l’échelle avec le DPI',
    zIndex: 'Z-Index',
    preferences: 'Préférences',
    maxZoom: 'Zoom max.',
    forcedScale: 'Résolution forcée',
    resolutionScale: 'Échelle de résolution',
    resolutionScaleAuto: 'Auto (valeur par défaut de l’appareil)',
    resolutionScaleHelp:
      'Simule la densité de pixels de l’écran. Détermine quelle variante de tuiles est chargée. Si une couche n’offre pas la variante demandée, la plus élevée disponible est utilisée à la place.',
    featureScale: 'Taille des éléments',
    featureScaleHelp:
      'Agrandit les étiquettes et les lignes affichées. N’a aucun effet sur les couches satellite, d’ombrage, WMS ou vectorielles (MapLibre).',
    searchResultStyle: 'Style du résultat de recherche',
    resetApp: 'Réinitialiser l’application',
    resetAppConfirm:
      'Réinitialiser tous les paramètres de l’application à leurs valeurs par défaut et recharger la page ? Vous serez déconnecté.',
    loadWmsLayers: 'Charger les couches',
    offlineMaps: 'Cartes hors ligne',
    legacy: 'obsolète',
  },
  elevationChart: {
    ele: `Altitude [${masl}]`,
    fetchError: ({ err }) =>
      addError(
        messages,
        'Erreur lors de la récupération des données du profil altimétrique',
        err,
      ),
    distance: 'Distance [km]',
  },
  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Vous pouvez essayer :
      </p>
      <ul>
        <li><a href="">recharger la dernière page</a></li>
        <li><a href="/">charger la page initiale</a></li>
        <li><a href="/#reset-local-storage">effacer les données locales et charger la page initiale</a></li>
      </ul>
    `,
  },
  mapCtxMenu: {
    centerMap: 'Centrer la carte ici',
    measurePosition: 'Trouver les coordonnées et l’altitude',
    addPoint: 'Ajouter un point ici',
    startLine: 'Commencer ici à dessiner une ligne ou une mesure',
    queryFeatures: 'Interroger les objets à proximité',
    startRoute: 'Planifier un itinéraire depuis ici',
    finishRoute: 'Planifier un itinéraire jusqu’ici',
    showPhotos: 'Afficher les photos à proximité',
  },
  errorStatus: {},
  gpu: {
    lost: 'Le périphérique GPU a été perdu\xa0: ',
    noAdapter: 'L’adaptateur WebGPU n’est pas disponible dans ce navigateur.',
    notSupported: 'WebGPU n’est pas pris en charge dans ce navigateur.',
    errorRequestingDevice: 'Échec de la création du périphérique GPU\xa0: ',
    other: 'Erreur lors du rendu\xa0: ',
  },
};

export default messages;
