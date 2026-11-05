import { DockPanel } from '@shared/components/DockPanel.js';
import type { ReactElement } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsEndInspection } from '../model/inspection.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import { ChangesetInspector, useInspectorView } from './ChangesetInspector.js';

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
      title={() => cm?.changeset}
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
