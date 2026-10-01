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
  installed:
    'Installée — une carte désinstallée n’est proposée nulle part, mais un lien l’affiche toujours',
  overlayOpacity: 'Opacité',
  showInMenu: 'Afficher dans le menu',
  showInToolbar: 'Afficher dans la barre d’outils',
  keyboardShortcut: 'Raccourci clavier',
  saveSuccess: 'Les paramètres ont été enregistrés.',
  customMapSaved: 'La carte personnalisée a été enregistrée.',
  shadingMapHint:
    "Les paramètres de l'ombrage se règlent et s'enregistrent dans le panneau qui apparaît une fois cette carte activée.",
};

export default fr;
