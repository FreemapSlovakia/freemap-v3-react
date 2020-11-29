import React, { useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { getType } from 'typesafe-actions';
import { selectFeature } from 'fm3/actions/mainActions';

const ONE_DAY = 1000 * 60 * 60 * 24;

export function ChangesetsResult(): ReactElement {
  const changesets = useSelector(
    (state: RootState) => state.changesets.changesets,
  );

  const days = useSelector((state: RootState) => state.changesets.days);

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

  const dispatch = useDispatch();

  function showChangesetDetail(changeset: Changeset) {
    dispatch(
      toastsAdd({
        id: 'changeset.detail',
        messageKey: 'changesets.detail',
        messageParams: {
          changeset,
        },
        cancelType: getType(changesetsSetAuthorName),
        style: 'info',
      }),
    );

    dispatch(selectFeature({ type: 'changesets' }));
  }

  return (
    <>
      {changesets.map((changeset) => {
        const opacity = opacityOf(changeset, now);

        return (
          <RichMarker
            faIcon="pencil"
            opacity={opacity}
            key={changeset.id}
            faIconLeftPadding="2px"
            position={{ lat: changeset.centerLat, lng: changeset.centerLon }}
            onclick={() => showChangesetDetail(changeset)}
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
}
