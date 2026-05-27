import { useMessages } from '@features/l10n/l10nInjector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import clsx from 'clsx';
import type { CSSProperties, ReactElement } from 'react';
import { AlertLink } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Changeset, changesetsSetParams } from '../model/actions.js';
import classes from './ChangesetDetails.module.css';

type Props = { changeset: Changeset };

const linkStyle: CSSProperties = { cursor: 'pointer' };

export function ChangesetDetails({ changeset }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const timeFormat = useDateTimeFormat({
    day: '2-digit',
    month: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <>
      <dl className={clsx(classes['kvGrid'], 'mb-2')}>
        <dt>{m?.changesets.details.author}</dt>
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
        <dt>{m?.changesets.details.description}</dt>
        <dd>
          {changeset.description || (
            <i>{m?.changesets.details.noDescription}</i>
          )}
        </dd>
        <dt>{m?.changesets.details.closedAt}</dt>
        <dd>{timeFormat.format(changeset.closedAt)}</dd>
      </dl>

      <p className="mb-0">
        {m?.changesets.details.moreDetailsOn({
          osmLink: (
            <AlertLink
              href={`https://www.openstreetmap.org/changeset/${changeset.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              osm.org
            </AlertLink>
          ),
          achaviLink: (
            <AlertLink
              href={`https://overpass-api.de/achavi/?changeset=${changeset.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Achavi
            </AlertLink>
          ),
        })}
      </p>
    </>
  );
}
