import { DockPanel } from '@shared/components/DockPanel.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { ReactElement } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { Changeset } from '../model/actions.js';
import { changesetsEndInspection } from '../model/inspection.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import {
  ChangesetInspector,
  type InspectorView,
  useInspectorView,
} from './ChangesetInspector.js';

/** An inspection's panel: the changeset, or the element of it selected, under a breadcrumb. */
export default function ChangesetInspectorPanel(): ReactElement {
  const dispatch = useDispatch();

  const cm = useChangesetsMessages();

  const view = useInspectorView();

  return (
    <DockPanel
      // The panel keeps the last one, so it slides out with what it showed.
      item={view.inspected ? view : null}
      // The tool's icon, which inspecting needs no more than this.
      icon={<FaPencilAlt />}
      title={({ inspected }: InspectorView) =>
        inspected ? `${cm?.changeset ?? ''} #${inspected.id}` : cm?.changeset
      }
      summary={({ inspected }: InspectorView) =>
        inspected?.changeset && (
          <ChangesetSummary changeset={inspected.changeset} />
        )
      }
      manual="changesets"
      onClose={() => {
        for (const action of changesetsEndInspection()) {
          dispatch(action);
        }
      }}
    >
      {(view) => <ChangesetInspector view={view} />}
    </DockPanel>
  );
}

/** Who made it, when, and what they said of it. */
function ChangesetSummary({
  changeset,
}: {
  changeset: Changeset;
}): ReactElement {
  const dateFormat = useDateTimeFormat({ dateStyle: 'medium' });

  return (
    <small className="d-block text-truncate">
      {[
        changeset.userName,
        dateFormat.format(changeset.closedAt),
        changeset.description,
      ]
        .filter(Boolean)
        .join(' · ')}
    </small>
  );
}
