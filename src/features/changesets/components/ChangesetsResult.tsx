import { selectingModeSelector } from '@app/store/selectors.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import { COLORS } from '@shared/colors.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { Point } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { Rectangle, Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  type Changeset,
  changesetsHover,
  changesetsInspect,
} from '../model/actions.js';
import { changesetCenter } from '../model/changesetDiff.js';
import classes from './ChangesetsResult.module.css';

const ONE_DAY = 1000 * 60 * 60 * 24;

export function ChangesetsResult(): ReactElement | null {
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

  const inspecting = useAppSelector(
    (state) => state.changesetInspector.inspected !== null,
  );

  // Not while a map-click tool takes the clicks.
  const interactive = useAppSelector(selectingModeSelector);

  // Its marker or its row in the Map layers panel.
  const hovered = useAppSelector((state) => state.changesets.hovered);

  const now = new Date();

  const dispatch = useDispatch();

  // A marker gone without a mouseout (tool closed, list refreshed) takes its
  // outline along.
  const outlined =
    (interactive && changesets.find((changeset) => changeset.id === hovered)) ||
    null;

  if (inspecting) {
    return null;
  }

  return (
    <>
      {outlined && (
        <Rectangle
          bounds={[
            [outlined.bbox[1], outlined.bbox[0]],
            [outlined.bbox[3], outlined.bbox[2]],
          ]}
          interactive={false}
          pathOptions={{ color: COLORS.normal, weight: 2, fillOpacity: 0.1 }}
        />
      )}

      {changesets.map((changeset) => {
        const opacity = opacityOf(changeset, now);

        return (
          <RichMarker
            faIcon={<FaPencilAlt color={COLORS.normal} />}
            opacity={opacity}
            key={changeset.id}
            interactive={interactive}
            position={{
              lat: changesetCenter(changeset).lat,
              lng: changesetCenter(changeset).lon,
            }}
            eventHandlers={{
              click() {
                // Clears the hover too: the markers go, so no mouseout follows.
                dispatch(changesetsInspect(changeset.id));

                trackMatomo(['trackEvent', 'Changesets', 'inspect']);

                fitMapToBbox(dispatch, changeset.bbox, {
                  padding: 40,
                  maxZoom: 17,
                });
              },
              mouseover() {
                dispatch(changesetsHover(changeset.id));
              },
              mouseout() {
                dispatch(changesetsHover(null));
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
              <div className={classes.shortened}>
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
