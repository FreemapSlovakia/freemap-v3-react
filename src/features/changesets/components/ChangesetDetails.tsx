import { OsmTagsTable } from '@shared/components/OsmTagsTable.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import clsx from 'clsx';
import { type CSSProperties, Fragment, type ReactElement } from 'react';
import { AlertLink } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { type Changeset, changesetsSetParams } from '../model/actions.js';
import { changesetElementSelect } from '../model/changesetDetail.js';
import { DIFF_ACTIONS, DIFF_COLORS } from '../model/changesetDiff.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import classes from './ChangesetDetails.module.css';
import { useElementName } from './useElementName.js';

type Props = { changeset: Changeset };

const linkStyle: CSSProperties = { cursor: 'pointer' };

const MAX_RELATIONS = 20;

export function ChangesetDetails({ changeset }: Props): ReactElement {
  const cm = useChangesetsMessages();

  const dispatch = useDispatch();

  const diff = useAppSelector((state) =>
    state.changesets.inspected?.id === changeset.id
      ? state.changesets.inspected.diff
      : null,
  );

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
          <AlertLink
            role="link"
            tabIndex={0}
            style={linkStyle}
            onClick={() => {
              dispatch(changesetsSetParams({ authorName: changeset.userName }));
            }}
          >
            {changeset.userName}
          </AlertLink>
        </dd>
        <dt>{cm?.details.description}</dt>
        <dd>{changeset.description || <i>{cm?.details.noDescription}</i>}</dd>
        <dt>{cm?.details.closedAt}</dt>
        <dd>{timeFormat.format(changeset.closedAt)}</dd>
      </dl>

      {tags.length > 0 && <OsmTagsTable tags={tags} osm />}

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

          {/* Relations aren't drawn, so they are reached from here. */}
          {relations.length > 0 && (
            <p className="mb-2">
              {cm?.element.types.relation}:{' '}
              {relations.slice(0, MAX_RELATIONS).map((relation, i) => (
                <Fragment key={relation.id}>
                  {i > 0 && ', '}
                  <AlertLink
                    role="link"
                    tabIndex={0}
                    style={{
                      ...linkStyle,
                      color: DIFF_COLORS[relation.action],
                    }}
                    onClick={() => {
                      dispatch(changesetElementSelect(relation));
                    }}
                  >
                    {name(relation) ?? relation.id}
                  </AlertLink>
                </Fragment>
              ))}
              {relations.length > MAX_RELATIONS && ', …'}
            </p>
          )}
        </>
      )}

      <AlertLink
        href={`https://www.openstreetmap.org/changeset/${changeset.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {cm?.details.openOnOsm}
      </AlertLink>
    </>
  );
}
