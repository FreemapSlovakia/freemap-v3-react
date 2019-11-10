import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import { RichMarker } from 'fm3/components/RichMarker';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  changesetsSetAuthorName,
  Changeset,
} from 'fm3/actions/changesetsActions';

import 'fm3/styles/changesets.scss';
import { Point } from 'leaflet';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { getType } from 'typesafe-actions';

const ONE_DAY = 1000 * 60 * 60 * 24;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const ChangesetsResultInt: React.FC<Props> = ({
  changesets,
  onShowChangesetDetail,
  language,
  days,
}) => {
  const opacityOf = useCallback(
    (changeset: Changeset, now: Date) => {
      if (days === null) {
        return 1;
      }

      const changesetAgeInDays =
        (now.getTime() - changeset.closedAt.getTime()) / ONE_DAY;

      const freshness = (days - changesetAgeInDays) / days; // <0.0, 1.0>

      const opacity = freshness * 0.4 + 0.6; // <0.6, 1.0> . markers with opacity below 0.6 are almost invisible

      return opacity;
    },
    [days],
  );

  const now = new Date();

  return (
    <>
      {changesets.map(changeset => {
        const opacity = opacityOf(changeset, now);

        return (
          <RichMarker
            faIcon="pencil"
            opacity={opacity}
            key={changeset.id}
            faIconLeftPadding="2px"
            position={{ lat: changeset.centerLat, lng: changeset.centerLon }}
            onclick={() => onShowChangesetDetail(changeset, language)}
          >
            <Tooltip
              opacity={opacity}
              className="compact"
              offset={new Point(9, -25)}
              direction="right"
              permanent
            >
              <div className="shortened">
                <b>
                  {changeset.userName}
                  {': '}
                </b>
                {changeset.description}
              </div>
            </Tooltip>
          </RichMarker>
        );
      })}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
  changesets: state.changesets.changesets,
  days: state.changesets.days,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onShowChangesetDetail(changeset: Changeset, language: string) {
    const timeFormat = new Intl.DateTimeFormat(language, {
      day: '2-digit',
      month: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    });

    const message = (
      <div>
        <dl className="dl-horizontal">
          <dt>Autor:</dt>
          <dd>
            <a
              role="link"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                dispatch(changesetsSetAuthorName(changeset.userName));
              }}
            >
              {changeset.userName}
            </a>
          </dd>
          <dt>Popis:</dt>
          <dd>{changeset.description || <i>bez popisu</i>}</dd>
          <dt>Čas:</dt>
          <dd>{timeFormat.format(changeset.closedAt)}</dd>
        </dl>
        <p>
          Viac detailov na{' '}
          <a
            href={`https://www.openstreetmap.org/changeset/${changeset.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            osm.org
          </a>
          {', alebo '}
          <a
            href={`https://overpass-api.de/achavi/?changeset=${changeset.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Achavi
          </a>
          .
        </p>
      </div>
    );

    dispatch(
      toastsAdd({
        collapseKey: 'changeset.detail',
        message,
        cancelType: getType(changesetsSetAuthorName),
        style: 'info',
      }),
    );
  },
});

export const ChangesetsResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangesetsResultInt);
