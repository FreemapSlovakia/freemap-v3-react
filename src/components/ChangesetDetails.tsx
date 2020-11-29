import React, { CSSProperties, ReactElement } from 'react';
import {
  changesetsSetAuthorName,
  Changeset,
} from 'fm3/actions/changesetsActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'fm3/storeCreator';
import { useTranslator } from 'fm3/l10nInjector';

type Props = { changeset: Changeset };

const linkStyle: CSSProperties = { cursor: 'pointer' };

export function ChangesetDetails({ changeset }: Props): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.l10n.language);

  const timeFormat = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div>
      <dl className="dl-horizontal">
        <dt>{t('changesets.details.author')}</dt>
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
        <dt>{t('changesets.details.description')}</dt>
        <dd>
          {changeset.description || (
            <i>{t('changesets.details.noDescription')}</i>
          )}
        </dd>
        <dt>{t('changesets.details.closedAt')}</dt>
        <dd>{timeFormat.format(changeset.closedAt)}</dd>
      </dl>
      {t('changesets.details.moreDetailsOn', {
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
