import { openTool } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { getOsmChangesetUrl } from '@features/openInExternalApp/externalUrlUtils.js';
import { LinkButton } from '@shared/components/LinkButton.js';
import { OsmTagsTable } from '@shared/components/OsmTagsTable.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import clsx from 'clsx';
import { Fragment, type ReactElement } from 'react';
import { AlertLink } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { type Changeset, changesetsSetParams } from '../model/actions.js';
import { DIFF_ACTIONS, DIFF_COLORS } from '../model/changesetDiff.js';
import { changesetElementSelect } from '../model/inspectorToast.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import classes from './ChangesetDetails.module.css';
import { useElementName } from './useElementName.js';

type Props = { changeset: Changeset };

const MAX_RELATIONS = 20;

export function ChangesetDetails({ changeset }: Props): ReactElement {
  const cm = useChangesetsMessages();

  const m = useMessages();

  const dispatch = useDispatch();

  const inspected = useAppSelector((state) =>
    state.changesetInspector.inspected?.id === changeset.id
      ? state.changesetInspector.inspected
      : null,
  );

  const diff = inspected?.diff;

  const toolOpen = useAppSelector((state) => isToolOpen(state, 'changesets'));

  const { name } = useElementName();

  const relations = (diff ?? []).filter(
    (element) => element.type === 'relation',
  );

  const timeFormat = useDateTimeFormat({
    day: '2-digit',
    month: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });

  const tags = Object.entries(changeset.tags).toSorted(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <>
      <dl className={clsx(classes.kvGrid, 'mb-2')}>
        <dt>{cm?.details.author}</dt>
        <dd>
          {/* A button: the author's list is of the area in view, which a URL
              of the filter alone can't reproduce. */}
          <LinkButton
            onClick={() => {
              // Set first, so opening the tool, whose the list is and which an
              // inspection doesn't need, makes the one query for the author.
              dispatch(changesetsSetParams({ authorName: changeset.userName }));

              if (!toolOpen) {
                dispatch(openTool('changesets'));
              }
            }}
          >
            {changeset.userName}
          </LinkButton>
        </dd>
        <dt>{cm?.details.description}</dt>
        <dd>{changeset.description || <i>{cm?.details.noDescription}</i>}</dd>
        <dt>{cm?.details.closedAt}</dt>
        <dd>{timeFormat.format(changeset.closedAt)}</dd>
      </dl>

      {tags.length > 0 && <OsmTagsTable tags={tags} osm />}

      {inspected?.source === 'tooBig' && (
        <p className="mb-2">
          <small>{cm?.details.tooBig}</small>
        </p>
      )}

      {inspected?.source === 'failed' && (
        <p className="mb-2 text-danger">
          <small>{cm?.inspectError({ err: inspected.error })}</small>
        </p>
      )}

      {diff && (
        <>
          <p className="mb-2">
            {DIFF_ACTIONS.map((action) => (
              <span
                key={action}
                className="me-2"
                style={{ color: DIFF_COLORS[action] }}
              >
                {cm?.actions[action]}:{' '}
                {diff.filter((element) => element.action === action).length}
              </span>
            ))}
          </p>

          {inspected?.source === 'osmApi' && (
            <p className="mb-2">
              <small>{cm?.details.rebuilt}</small>
            </p>
          )}

          {/* Relations aren't drawn, so they are reached from here. */}
          {relations.length > 0 && (
            <p className="mb-2">
              {m?.search.osmElementTypes.relation}:{' '}
              {relations.slice(0, MAX_RELATIONS).map((relation, i) => (
                <Fragment key={relation.id}>
                  {i > 0 && ' '}
                  {/* Its comma kept with it: the button is an inline-block,
                      after which the line may break. Its name still wraps. */}
                  <span className="text-nowrap">
                    {/* The URL can't name an element of it. */}
                    <LinkButton
                      style={{
                        color: DIFF_COLORS[relation.action],
                        whiteSpace: 'normal',
                      }}
                      onClick={() => {
                        dispatch(changesetElementSelect(relation));
                      }}
                    >
                      {name(relation) ?? relation.id}
                    </LinkButton>
                    {/* Before the next, or the ellipsis for those left out. */}
                    {i < relations.length - 1 && ','}
                  </span>
                </Fragment>
              ))}
              {relations.length > MAX_RELATIONS && ' …'}
            </p>
          )}
        </>
      )}

      <AlertLink
        href={getOsmChangesetUrl(changeset.id)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {cm?.details.openOnOsm}
      </AlertLink>
    </>
  );
}
