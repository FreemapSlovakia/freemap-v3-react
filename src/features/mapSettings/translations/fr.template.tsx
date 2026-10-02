import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const fr: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  savingError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de l’enregistrement des paramètres',
      err,
    ),
  install: 'Installer — proposer cette carte dans les menus des cartes',
  noInstalledMaps:
    'Aucune carte installée. Ajoutez-en depuis les cartes disponibles.',
  searchLibrary: ({ count }) => `Rechercher parmi ${count} cartes`,
  catalogCredit: 'La liste des cartes de la bibliothèque s’appuie sur',
  filters: {
    filterYourMaps: 'Filtrer les cartes installées',
    kind: 'Type',
    builtIn: 'Intégrées',
    fromLibrary: 'De la bibliothèque',
    custom: 'Personnalisées',
    offline: 'Hors ligne',
    combinations: 'Combinaisons',
    shownIn: 'Affichées',
    toolbar: 'Dans la barre',
    menu: 'Dans le menu',
    shortcut: 'Avec raccourci',
    hidden: 'Masquées',
    technology: 'Technologie',
    dataLayers: 'Couches de données',
    category: 'Catégorie',
    photo: 'Orthophotos',
    historicphoto: 'Images historiques',
    historicmap: 'Cartes historiques',
    map: 'Cartes',
    elevation: 'Altimétrie',
    other: 'Autres',
    coversView: 'Couvrent cette vue',
  },
  preview: 'Aperçu sur la carte',
  installMap: 'Installer',
  uninstallMap: 'Désinstaller',
  suggestMap: (
    <>
      Vous connaissez une carte que nous n’avons pas ? Écrivez-nous à{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Modifier la carte personnalisée <i>{name}</i>
    </>
  ),
  modifyCombinationTitle: (name) => (
    <>
      Modifier la combinaison de cartes <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Rétablir les réglages par défaut de barre d’outils, de menu, d’opacité et de raccourcis de toutes les cartes ? Les cartes installées restent installées.',
  downloadOffline: 'Télécharger pour une utilisation hors ligne',
  keepOnMap: 'Garder sur la carte',
  backToLibrary: 'Retour à la bibliothèque',
  overlayOpacity: 'Opacité',
  showInMenu: 'Afficher dans le menu',
  showInToolbar: 'Afficher dans la barre d’outils',
  keyboardShortcut: 'Raccourci clavier',
  saveSuccess: 'Les paramètres ont été enregistrés.',
  customMapSaved: 'La carte personnalisée a été enregistrée.',
  shadingMapHint:
    "Les paramètres de l'ombrage se règlent et s'enregistrent dans le panneau qui apparaît une fois cette carte activée.",
  combination: 'Combinaison de cartes',
  combinationSaved: 'La combinaison de cartes a été enregistrée.',
  updateFromCurrentMap: 'Mettre à jour depuis la carte actuelle',
  baseMap: 'Carte de base',
  baseMaps: 'Cartes de base',
  overlays: 'Couches de superposition',
  addOverlay: 'Ajouter une couche de superposition…',
  noOverlays: 'Aucune couche de superposition.',
  combinationTooSmall: 'Au moins deux couches sont requises.',
};

export default fr;
