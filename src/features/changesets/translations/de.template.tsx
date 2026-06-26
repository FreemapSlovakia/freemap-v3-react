import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const de: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  details: {
    author: 'Autor:',
    description: 'Beschreibung:',
    noDescription: 'keine Beschreibung',
    closedAt: 'Zeit:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Mehr Details auf {osmLink} oder {achaviLink}.
      </>
    ),
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
