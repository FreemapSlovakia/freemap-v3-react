import { Text } from '@features/l10n/Text.js';
import { useLeafletContext } from '@react-leaflet/core';
import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import { DomEvent } from 'leaflet';
import { type ReactElement, useEffect, useState } from 'react';
import { Tooltip } from 'react-leaflet';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

/** Metres and seconds so far, and since the previous waypoint (`…Diff`). */
export type RouteFigures = {
  distance: number;
  duration: number;
  distanceDiff?: number;
  durationDiff?: number;
};

/**
 * A route's figures as its labels and the itinerary show them; each line only
 * where its value is given (`tolled` where above zero).
 */
export function RouteSummary({
  distance,
  duration,
  distanceDiff,
  durationDiff,
  tolled,
  withStops,
  arrival,
}: RouteFigures & {
  tolled?: number;
  /** Seconds, stops included. */
  withStops?: number;
  /** Epoch ms. */
  arrival?: number;
}): ReactElement {
  const rpm = useRoutePlannerMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const format = useDateTimeFormat(WEEKDAY_TIME);

  return (
    <div>
      <div className="text-nowrap">
        <Text m={rpm}>
          {(rpm) =>
            rpm.distance({
              value: formatDistance(distance, language),
              diff:
                distanceDiff === undefined
                  ? undefined
                  : formatDistance(distanceDiff, language),
            })
          }
        </Text>
      </div>

      {!Number.isNaN(duration) && (
        <div className="text-nowrap">
          <Text m={rpm}>
            {(rpm) =>
              rpm.duration({
                value: formatDuration(duration, language, 'short', true),
                diff:
                  durationDiff === undefined || Number.isNaN(durationDiff)
                    ? undefined
                    : formatDuration(durationDiff, language, 'short', true),
              })
            }
          </Text>
        </div>
      )}

      {tolled !== undefined && tolled > 0 && (
        <div className="text-nowrap">
          <Text m={rpm}>
            {(rpm) => rpm.tolled({ value: formatDistance(tolled, language) })}
          </Text>
        </div>
      )}

      {withStops !== undefined && (
        <div className="text-nowrap">
          <Text m={rpm}>
            {(rpm) =>
              rpm.withStops({
                duration: formatDuration(withStops, language, 'short', true),
              })
            }
          </Text>
        </div>
      )}

      {arrival !== undefined && (
        <div className="text-nowrap">
          <Text m={rpm}>
            {(rpm) => rpm.arrival({ time: format.format(arrival) })}
          </Text>
        </div>
      )}
    </div>
  );
}

/** The finish's permanent label: the trip in a line, and its arrival. */
export function RouteLabel({
  distance,
  duration,
  arrival,
}: {
  distance: number;
  /** Seconds, stops included. */
  duration: number;
  /** Epoch ms; only from a set departure. */
  arrival?: number;
}): ReactElement {
  const rpm = useRoutePlannerMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const format = useDateTimeFormat(WEEKDAY_TIME);

  return (
    <div>
      <div className="fw-bold text-nowrap">
        {formatDistance(distance, language)} ·{' '}
        {formatDuration(duration, language, 'short', true)}
      </div>

      {arrival !== undefined && (
        <div className="text-nowrap">
          <Text m={rpm}>
            {(rpm) => rpm.arrival({ time: format.format(arrival) })}
          </Text>
        </div>
      )}
    </div>
  );
}

/** The route's permanent label: short, or as a waypoint's while pointed at. */
export function RouteLabelTooltip({
  figures,
  withStops,
  arrival,
  onOpen,
}: {
  figures: RouteFigures;
  withStops?: number;
  arrival?: number;
  onOpen?: () => void;
}): ReactElement {
  const marker = useLeafletContext().overlayContainer;

  const [hovered, setHovered] = useState(false);

  const [dragged, setDragged] = useState(false);

  // An interactive label passes its own pointer events to the marker; a drag
  // crosses the marker's edge, which mustn't flip the label to and fro.
  useEffect(() => {
    if (!marker) {
      return;
    }

    const handlers = {
      mouseover: () => setHovered(true),
      mouseout: () => setHovered(false),
      dragstart: () => setDragged(true),
      dragend: () => setDragged(false),
    };

    marker.on(handlers);

    return () => {
      marker.off(handlers);
    };
  }, [marker]);

  return (
    <Tooltip
      key={String(Boolean(onOpen))}
      direction="top"
      permanent
      interactive={Boolean(onOpen)}
      eventHandlers={
        onOpen
          ? {
              click(e) {
                // Or the map takes it for a new finish; the marker, as its
                // event parent, still gets it and selects its point.
                DomEvent.stopPropagation(e);

                onOpen();
              },
            }
          : {}
      }
    >
      {hovered && !dragged ? (
        <RouteSummary {...figures} withStops={withStops} arrival={arrival} />
      ) : (
        <RouteLabel
          distance={figures.distance}
          duration={withStops ?? figures.duration}
          arrival={arrival}
        />
      )}
    </Tooltip>
  );
}
