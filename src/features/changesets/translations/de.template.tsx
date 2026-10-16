import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const de: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  diffNotReady:
    'Die Änderungen dieses Changesets sind noch nicht verfügbar. Sie stehen einige Minuten nach dem Schließen des Changesets bereit.',
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
    types: {
      node: 'Knoten',
      way: 'Weg',
      relation: 'Relation',
    },
    onlyNodesMoved: 'Nur seine Knoten wurden verschoben.',
    geometryChanged: 'Die Geometrie wurde geändert.',
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
  },
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
