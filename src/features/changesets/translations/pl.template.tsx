import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const pl: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  details: {
    author: 'Autor:',
    description: 'Opis:',
    noDescription: 'bez opisu',
    closedAt: 'Czas:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Więcej szczegółów na {osmLink} lub {achaviLink}.
      </>
    ),
  },
  allAuthors: 'Wszyscy autorzy',
  refresh: 'Pobierz zestawy zmian dla bieżącego widoku mapy',
  tooBig:
    'Żądanie changesetów może zwrócić zbyt wiele elementów. Spróbuj przybliżyć mapę, wybrać mniej dni lub podać konkretnego autora.',
  olderThan: ({ days }) => `${days} dni`,
  olderThanFull: ({ days }) => `Changesety z ostatnich ${days} dni`,
  notFound: 'Nie znaleziono żadnych changesetów.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania changesetów', err),
};

export default pl;
