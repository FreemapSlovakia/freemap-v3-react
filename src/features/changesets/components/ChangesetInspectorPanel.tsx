import { hasPanel } from '@app/store/actions.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsEndInspection, historyHosted } from '../model/inspection.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import { ChangesetInspector, useInspectorView } from './ChangesetInspector.js';

/**
 * An inspection's panel: the changeset, or the element of it selected, under a
 * breadcrumb. Not while a history's element's own panel holds the drill.
 */
export default function ChangesetInspectorPanel(): ReactElement {
  const dispatch = useDispatch();

  const cm = useChangesetsMessages();

  const view = useInspectorView();

  const hosted = useAppSelector(historyHosted);

  // Another panel's selection only covers it, from the very render it is made:
  // the level it showed stays, rather than the changeset's flashing up.
  const own = useAppSelector((state) => !hasPanel(state.main.selection?.type));

  return (
    <DockPanel
      // The panel keeps the last one, so it slides out with what it showed.
      item={view.inspected && own ? view : null}
      show={view.inspected !== null && !hosted}
      // The tool's icon, which inspecting needs no more than this.
      icon={<FaPencilAlt />}
      title={() => cm?.changeset}
      manual="changesets"
      // An element opened or clicked on the map shows its own, then this again.
      yields
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
