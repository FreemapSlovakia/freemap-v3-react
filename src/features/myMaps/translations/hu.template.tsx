import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const hu: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Új térkép hozzáadása',
  noMapFound: 'Nem található térkép',
  save: 'Mentés',
  disconnect: 'Leválasztás',
  disconnectAndClear: 'Lecsatlakozás és törlés',
  deleteConfirm: (name) => (
    <>
      Biztosan törli a(z) <i>{name}</i> térképet?
    </>
  ),
  deleteTitle: 'Térkép törlése',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép betöltéskor', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térképek betöltéskor', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép törlésekor', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép mentésekor', err),
  loadToEmpty: 'Üres térképre',
  loadInclMapAndPosition: 'A mentett alaptérképpel és pozíciójával',
  writers: 'Szerkesztők',
  addWriter: 'Szerkesztő hozzáadása',
  conflictError: 'A térképet időközben módosították.',
};

export default hu;
