import {
  Changeset,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { RichMarker } from 'fm3/components/RichMarker';
import { colors } from 'fm3/constants';
import 'fm3/styles/changesets.scss';
import { Point } from 'leaflet';
import { ReactElement, useCallback } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { getType } from 'typesafe-actions';

const ONE_DAY = 1000 * 60 * 60 * 24;

export function ChangesetsResult(): ReactElement {
  const changesets = useSelector((state) => state.changesets.changesets);

  const days = useSelector((state) => state.changesets.days);

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
  }

  return (
    <>
      {changesets.map((changeset) => {
        const opacity = opacityOf(changeset, now);

        return (
          <RichMarker
            faIcon={<FaPencilAlt color={colors.normal} />}
            opacity={opacity}
            key={changeset.id}
            position={{ lat: changeset.centerLat, lng: changeset.centerLon }}
            eventHandlers={{
              click() {
                showChangesetDetail(changeset);
              },
            }}
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
