import { selectFeature } from '@app/store/actions.js';
import { encodePanel } from '@app/url/panelParam.js';
import { Text } from '@features/l10n/Text.js';
import { HorizontalScroller } from '@shared/components/HorizontalScroller.js';
import { LinkButton } from '@shared/components/LinkButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { inAppLink } from '@shared/inAppLink.js';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaHistory } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsInspect, changesetsShowHistory } from '../model/actions.js';
import type { DiffElement } from '../model/changesetDiff.js';
import type { ChangesetInspectorState } from '../model/inspectorReducer.js';
import { selectedDiffElementSelector } from '../model/selectors.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import { ChangesetDetails } from './ChangesetDetails.js';
import { ChangesetElementDetails } from './ChangesetElementDetails.js';
import { ChangesetLabel } from './ChangesetLabel.js';
import { ElementHistory } from './ElementHistory.js';
import { useElementName } from './useElementName.js';

/**
 * `leave` takes this level away, back to the one before it, which the root has
 * none of; `href` opens the level in a page of its own, where the URL can say it.
 */
type Crumb = {
  key: string;
  label: ReactNode;
  href?: string;
  leave?: () => void;
};

/** What the inspector shows, as the store has it now; see `useInspectorView`. */
export type InspectorView = {
  history: ChangesetInspectorState['history'];
  inspected: ChangesetInspectorState['inspected'];
  element: DiffElement | undefined;
  /**
   * Selected before its diff is in, as from a history: its level is shown
   * already, so the changeset doesn't flash up in between.
   */
  pending: boolean;
};

/** The inspector's state, one identity while none of it changes. */
export function useInspectorView(): InspectorView {
  const history = useAppSelector((state) => state.changesetInspector.history);

  const inspected = useAppSelector(
    (state) => state.changesetInspector.inspected,
  );

  const element = useAppSelector(selectedDiffElementSelector);

  const pending = useAppSelector(
    (state) =>
      state.main.selection?.type === 'changeset-element' &&
      state.changesetInspector.inspected?.source === null,
  );

  return useMemo(
    () => ({ history, inspected, element, pending }),
    [history, inspected, element, pending],
  );
}

type Props = {
  /** The history's element as its details head it, in place of its name. */
  root?: ReactNode;
  /** What to show, if not the store's now: a panel sliding out keeps its own. */
  view?: InspectorView;
};

/**
 * The deepest of an element's history, the inspected changeset and the
 * selected element of it, under a breadcrumb back up through the others.
 */
export function ChangesetInspector({ root, view }: Props): ReactElement {
  const cm = useChangesetsMessages();

  const dispatch = useDispatch();

  const live = useInspectorView();

  const { history, inspected, element, pending } = view ?? live;

  const { label } = useElementName();

  const crumbs: Crumb[] = [];

  if (history) {
    crumbs.push(
      {
        key: 'root',
        label: root ?? history.name,
        href: `#osm-${history.id.elementType}=${history.id.id}`,
      },
      {
        key: 'history',
        label: (
          <>
            <FaHistory /> <Text m={cm} k="history.title" />
          </>
        ),
        // Back through the history, so its element's details are what remain.
        leave: () => {
          dispatch(changesetsInspect(null));

          dispatch(changesetsShowHistory(null));
        },
      },
    );
  }

  if (inspected) {
    crumbs.push({
      key: 'changeset',
      // Named where it is the root, the one crumb saying what this is.
      label: history ? (
        `#${inspected.id}`
      ) : (
        <ChangesetLabel id={inspected.id} />
      ),
      href: `#panel=${encodePanel({ type: 'changeset', id: inspected.id })}`,
      leave: () => dispatch(changesetsInspect(null)),
    });
  }

  if (element || pending) {
    crumbs.push({
      key: 'element',
      // Loading, it can only be the history's own.
      label: element ? label(element) : history?.name,
      leave: () => dispatch(selectFeature(null)),
    });
  }

  return (
    <>
      {/* One line, scrolled to the current level: wrapped, it reads as two. */}
      <HorizontalScroller toEnd className="mb-2">
        {/* Only as wide as its crumbs, so its end padding follows the last. */}
        <ol className="breadcrumb d-inline-flex flex-nowrap text-nowrap align-top m-0 px-3 py-1">
          {crumbs.map((crumb, i) =>
            i === crumbs.length - 1 ? (
              <li
                key={crumb.key}
                className="breadcrumb-item active fw-bold flex-shrink-0"
              >
                <span>{crumb.label}</span>
              </li>
            ) : (
              <li key={crumb.key} className="breadcrumb-item flex-shrink-0">
                {crumb.href ? (
                  <a {...inAppLink(crumb.href, () => crumbs[i + 1].leave?.())}>
                    {crumb.label}
                  </a>
                ) : (
                  <LinkButton onClick={() => crumbs[i + 1].leave?.()}>
                    {crumb.label}
                  </LinkButton>
                )}
              </li>
            ),
          )}
        </ol>
      </HorizontalScroller>

      {element ? (
        <ChangesetElementDetails element={element} />
      ) : inspected?.changeset && !pending ? (
        <ChangesetDetails changeset={inspected.changeset} />
      ) : inspected ? (
        <Spinner animation="border" size="sm" />
      ) : history ? (
        <ElementHistory
          id={history.id}
          versions={history.versions}
          error={history.error}
        />
      ) : null}
    </>
  );
}

export default ChangesetInspector;
