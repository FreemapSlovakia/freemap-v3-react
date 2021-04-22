import {
  Changeset,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { useMessages } from 'fm3/l10nInjector';
import { CSSProperties, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type Props = { changeset: Changeset };

const linkStyle: CSSProperties = { cursor: 'pointer' };

export function ChangesetDetails({ changeset }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const language = useSelector((state) => state.l10n.language);

  const timeFormat = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div>
      <dl className="dl-horizontal">
        <dt>{m?.changesets.details.author}</dt>
        <dd>
          <a
            role="link"
            tabIndex={0}
            style={linkStyle}
            onClick={() => {
              dispatch(changesetsSetAuthorName(changeset.userName));
            }}
          >
            {changeset.userName}
          </a>
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
      {m?.changesets.details.moreDetailsOn({
        osmLink: (
          <a
            href={`https://www.openstreetmap.org/changeset/${changeset.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            osm.org
          </a>
        ),
        achaviLink: (
          <a
            href={`https://overpass-api.de/achavi/?changeset=${changeset.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Achavi
          </a>
        ),
      })}
    </div>
  );
}
