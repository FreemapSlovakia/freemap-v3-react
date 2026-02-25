import { toastsAdd } from '@features/toasts/model/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { colors } from '@shared/constants.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Point } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { Changeset, changesetsSetParams } from '../model/actions.js';
import './ChangesetsResult.scss';

const ONE_DAY = 1000 * 60 * 60 * 24;

export function ChangesetsResult(): ReactElement {
  const changesets = useAppSelector((state) => state.changesets.changesets);

  const days = useAppSelector((state) => state.changesets.days);

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
        cancelType: changesetsSetParams.type,
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
              offset={new Point(10, 10)}
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
