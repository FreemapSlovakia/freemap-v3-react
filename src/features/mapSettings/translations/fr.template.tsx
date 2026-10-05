import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const fr: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  useAsBaseMap: 'Utiliser comme carte de base',
  useAsOverlay: 'Utiliser comme surcouche',
  wmsLayers: {
    search: 'Rechercher des couches',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
  },
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
    presets: 'Préréglages',
    shownIn: 'Affichées',
    toolbar: 'Dans la barre',
    menu: 'Dans le menu',
    shortcut: 'Avec raccourci',
    hidden: 'Masquées',
    technology: 'Technologie',
    dataLayers: 'Couches de données',
    category: 'Catégorie',
    country: 'Pays',
    anyCountry: 'Tous les pays',
    includeWorldwide: 'Inclure les cartes mondiales',
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
  modifyPresetTitle: (name) => (
    <>
      Modifier le préréglage de carte <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Rétablir les réglages par défaut de barre d’outils, de menu et de raccourcis de toutes les cartes, ainsi que leur configuration (opacité, couches, ombrage…) ? Les cartes installées restent installées.',
  downloadOffline: 'Télécharger pour une utilisation hors ligne',
  keepOnMap: 'Garder sur la carte',
  backToLibrary: 'Retour à la bibliothèque',
  overlayOpacity: 'Opacité',
  showInMenu: 'Afficher dans le menu',
  showInToolbar: 'Afficher dans la barre d’outils',
  keyboardShortcut: 'Raccourci clavier',
  saveSuccess: 'Les paramètres ont été enregistrés.',
  customMapSaved: 'La carte personnalisée a été enregistrée.',
  preset: 'Préréglage de carte',
  presetSaved: 'Le préréglage de carte a été enregistré.',
  newPreset: 'Nouveau préréglage de carte',
  saveAsPreset: 'Enregistrer comme préréglage',
  saveLayersAsPreset: 'Enregistrer les couches comme préréglage',
  saveLayersAsPresetHint:
    'Un nouveau préréglage fait de copies des cartes affichées, les préréglages décomposés.',
  duplicatePreset: 'Dupliquer',
  openPreset: 'Afficher sur la carte',
  addMap: 'Ajouter une carte',
  presetEmpty: 'Aucune couche.',
  presetHint:
    'Ses couches se modifient sur la carte : ouvrez le préréglage dans le panneau Couches de la carte. Chaque changement est enregistré aussitôt.',
  baseMaps: 'Cartes de base',
  overlays: 'Couches de superposition',
};

export default fr;
