import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MyMapsMessages } from './MyMapsMessages.js';

const cs: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Přidat novou mapu',
  noMapFound: 'Žádná mapa nenalezena',
  save: 'Uložit',
  disconnect: 'Odpojit',
  disconnectAndClear: 'Odpojit a vyčistit',
  deleteConfirm: (name) => (
    <>
      Opravdu si přejete smazat mapu <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Smazání mapy',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání map', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při mazání mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při ukládání mapy', err),
  loadToEmpty: 'Do čisté mapy',
  loadInclMapAndPosition: 'Včetně uložené podkladové mapy a pozice',
  writers: 'Editori',
  addWriter: 'Přidat editora',
  conflictError: 'Mapa byla mezitím modifikována.',
};

export default cs;
