import React from 'react';
import {
  changesetsSetAuthorName,
  Changeset,
} from 'fm3/actions/changesetsActions';
import { connect } from 'react-redux';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { withTranslator, Translator } from 'fm3/l10nInjector';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    changeset: Changeset;
    t: Translator;
  };

const ChangesetDetailsInt: React.FC<Props> = ({
  changeset,
  language,
  onChangesetAuthorSelect,
  t,
}) => {
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
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onChangesetAuthorSelect(changeset.userName);
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
};

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onChangesetAuthorSelect(userName: string) {
    dispatch(changesetsSetAuthorName(userName));
  },
});

export const ChangesetDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ChangesetDetailsInt));
