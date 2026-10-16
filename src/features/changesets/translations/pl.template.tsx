import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const pl: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  diffNotReady:
    'Zmiany tego zestawu nie są jeszcze dostępne. Będą gotowe kilka minut po jego zamknięciu.',
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania zmian zestawu', err),
  actions: {
    create: 'utworzone',
    modify: 'zmienione',
    delete: 'usunięte',
  },
  element: {
    types: {
      node: 'Węzeł',
      way: 'Linia',
      relation: 'Relacja',
    },
    onlyNodesMoved: 'Przesunięto tylko jej węzły.',
    geometryChanged: 'Zmieniła się geometria.',
    tagsUnchanged: 'Tagi bez zmian.',
    key: 'Klucz',
    before: 'Przedtem',
    after: 'Potem',
    value: 'Wartość',
    members: ({ added, removed }) =>
      `Członkowie: ${added} dodanych, ${removed} usuniętych.`,
    history: 'Historia na osm.org',
  },
  details: {
    author: 'Autor:',
    description: 'Opis:',
    noDescription: 'bez opisu',
    closedAt: 'Czas:',
    openOnOsm: 'Otwórz na osm.org',
  },
  allAuthors: 'Wszyscy autorzy',
  refresh: 'Pobierz zestawy zmian dla bieżącego widoku mapy',
  tooBig:
    'Żądanie changesetów może zwrócić zbyt wiele elementów. Spróbuj przybliżyć mapę, wybrać mniej dni lub podać konkretnego autora.',
  olderThan: ({ days }) => `${days} dni`,
  notFound: 'Nie znaleziono żadnych changesetów.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania changesetów', err),
  timeWindow: 'Okno czasowe',
};

export default pl;
