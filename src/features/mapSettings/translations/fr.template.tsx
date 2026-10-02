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
  overlays: 'Couches de superposition',
  addOverlay: 'Ajouter une couche de superposition…',
  noOverlays: 'Aucune couche de superposition.',
  combinationTooSmall: 'Au moins deux couches sont requises.',
};

export default fr;
