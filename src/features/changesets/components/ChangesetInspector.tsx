import { selectFeature } from '@app/store/actions.js';
import { LinkButton } from '@shared/components/LinkButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { inAppLink } from '@shared/inAppLink.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { AlertLink, Spinner } from 'react-bootstrap';
import { FaHistory } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsInspect, changesetsShowHistory } from '../model/actions.js';
import { selectedDiffElementSelector } from '../model/selectors.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import { ChangesetDetails } from './ChangesetDetails.js';
import { ChangesetElementDetails } from './ChangesetElementDetails.js';
import classes from './ChangesetInspector.module.css';
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

type Props = {
  /** The history's element as its details head it, in place of its name. */
  root?: ReactNode;
};

/**
 * The deepest of an element's history, the inspected changeset and the
 * selected element of it, under a breadcrumb back up through the others.
 */
export function ChangesetInspector({ root }: Props): ReactElement {
  const cm = useChangesetsMessages();

  const dispatch = useDispatch();

  const history = useAppSelector((state) => state.changesetInspector.history);

  const inspected = useAppSelector(
    (state) => state.changesetInspector.inspected,
  );

  const element = useAppSelector(selectedDiffElementSelector);

  // Selected before its diff is in, as from a history: its level is shown
  // already, so the changeset doesn't flash up in between.
  const pending = useAppSelector(
    (state) =>
      state.main.selection?.type === 'changeset-element' &&
      state.changesetInspector.inspected?.source === null,
  );

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
            <FaHistory /> {cm?.history.title}
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
      href: `#changeset=${inspected.id}`,
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
      <ol className={clsx('breadcrumb mb-2', classes.crumbs)}>
        {crumbs.map((crumb, i) =>
          i === crumbs.length - 1 ? (
            <li key={crumb.key} className="breadcrumb-item active fw-bold">
              {crumb.label}
            </li>
          ) : (
            <li key={crumb.key} className="breadcrumb-item">
              {crumb.href ? (
                <AlertLink
                  {...inAppLink(crumb.href, () => crumbs[i + 1].leave?.())}
                >
                  {crumb.label}
                </AlertLink>
              ) : (
                <LinkButton onClick={() => crumbs[i + 1].leave?.()}>
                  {crumb.label}
                </LinkButton>
              )}
            </li>
          ),
        )}
      </ol>

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
