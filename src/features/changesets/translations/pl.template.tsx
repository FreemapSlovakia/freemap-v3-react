import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const pl: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Historia',
    error: ({ err }) =>
      addError(getMessages()!, 'Błąd podczas pobierania historii', err),
  },
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania zmian zestawu', err),
  actions: {
    create: 'utworzone',
    modify: 'zmienione',
    delete: 'usunięte',
  },
  element: {
    onlyNodesMoved: 'Przesunięto tylko jej węzły.',
    geometryChanged: 'Geometria zmieniona.',
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
    tooBig:
      'OSMCha nie ma tego zestawu, a jest on zbyt duży, by odtworzyć go z API OSM; jego zmiany są na osm.org.',
    rebuilt:
      'Odtworzone z API OSM, bo OSMCha nie ma tego zestawu: niezmienione węzły dróg są w obecnym położeniu, a brakuje dróg, w których przesunięto tylko węzły.',
  },
  changeset: 'Zestaw zmian',
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
