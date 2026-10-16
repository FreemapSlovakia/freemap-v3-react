import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const de: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Verlauf',
    error: ({ err }) =>
      addError(getMessages()!, 'Fehler beim Abrufen des Verlaufs', err),
  },
  inspectError: ({ err }) =>
    addError(
      getMessages()!,
      'Fehler beim Abrufen der Änderungen des Changesets',
      err,
    ),
  actions: {
    create: 'erstellt',
    modify: 'geändert',
    delete: 'gelöscht',
  },
  element: {
    onlyNodesMoved: 'Nur seine Knoten wurden verschoben.',
    geometryChanged: 'Geometrie geändert.',
    tagsUnchanged: 'Tags unverändert.',
    key: 'Schlüssel',
    before: 'Vorher',
    after: 'Nachher',
    value: 'Wert',
    members: ({ added, removed }) =>
      `Mitglieder: ${added} hinzugefügt, ${removed} entfernt.`,
    history: 'Verlauf auf osm.org',
  },
  details: {
    author: 'Autor:',
    description: 'Beschreibung:',
    noDescription: 'keine Beschreibung',
    closedAt: 'Zeit:',
    openOnOsm: 'Auf osm.org öffnen',
    tooBig:
      'OSMCha hat dieses Changeset nicht, und es ist zu groß, um es aus der OSM-API zu rekonstruieren; seine Änderungen gibt es auf osm.org.',
    rebuilt:
      'Aus der OSM-API rekonstruiert, da OSMCha dieses Changeset nicht hat: unveränderte Knoten von Wegen stehen an ihrer heutigen Position, und Wege, an denen sich nur Knoten verschoben haben, fehlen.',
  },
  changeset: 'Changeset',
  allAuthors: 'Alle Autoren',
  refresh: 'Changesets für aktuellen Kartenausschnitt herunterladen',
  tooBig:
    'Die Anfrage nach Changesets kann zu viele Einträge zurückgeben. Bitte zoomen Sie näher heran, wählen Sie weniger Tage oder geben Sie einen bestimmten Autor ein.',
  olderThan: ({ days }) => `${days} Tage`,
  notFound: 'Keine Changesets gefunden.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Changesets', err),
  timeWindow: 'Zeitfenster',
};

export default de;
