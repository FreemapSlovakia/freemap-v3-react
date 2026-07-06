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
  saveSuccess: 'Les paramètres ont été enregistrés.',
  customMapSaved: 'La carte personnalisée a été enregistrée.',
};

export default fr;
