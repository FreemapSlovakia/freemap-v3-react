import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import type { ReactElement, ReactNode } from 'react';
import { FaBan, FaChild, FaDog } from 'react-icons/fa';
import type { EventSummary } from '../model/actions.js';
import { iconOfKind } from '../model/transports.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICONS } from './difficultyIcons.js';

/** A glyph under a red prohibition sign, as "no dogs". */
function Not({ children }: { children: ReactNode }): ReactElement {
  return (
    <span className="position-relative d-inline-block">
      {children}
      <FaBan className="position-absolute top-0 start-0 text-danger" />
    </span>
  );
}

/**
 * What an event says of itself, as a row of glyphs: transports, difficulty,
 * dogs and children (under a ban sign for "no"), then its length.
 */
export function EventTraits({
  event,
}: {
  event: Pick<
    EventSummary,
    'transports' | 'difficulty' | 'dogs' | 'children' | 'distance'
  >;
}): ReactElement | null {
  const em = useEventsMessages();

  const rpm = useRoutePlannerMessages();

  const kmFormat = useNumberFormat({ maximumFractionDigits: 1 });

  const marks: { key: string; hint?: ReactNode; glyph: ReactNode }[] = [
    // A kind this client doesn't know has no glyph to show.
    ...event.transports.flatMap((kind) => {
      const glyph = iconOfKind(kind);

      return glyph
        ? [
            {
              key: `t-${kind}`,
              hint: rpm?.transportType[kind as TransportTypeMsgKey],
              glyph,
            },
          ]
        : [];
    }),
    ...(event.difficulty
      ? [
          {
            key: 'difficulty',
            hint: em?.difficulty[event.difficulty],
            glyph: DIFFICULTY_ICONS[event.difficulty],
          },
        ]
      : []),
    ...(event.dogs === null
      ? []
      : [
          {
            key: 'dogs',
            hint: event.dogs ? em?.card.dogsWelcome : em?.card.noDogs,
            glyph: event.dogs ? (
              <FaDog />
            ) : (
              <Not>
                <FaDog />
              </Not>
            ),
          },
        ]),
    ...(event.children === null
      ? []
      : [
          {
            key: 'children',
            hint: event.children ? em?.card.children : em?.card.noChildren,
            glyph: event.children ? (
              <FaChild />
            ) : (
              <Not>
                <FaChild />
              </Not>
            ),
          },
        ]),
  ];

  if (marks.length === 0 && event.distance === null) {
    return null;
  }

  return (
    <span className="d-inline-flex align-items-center gap-2 flex-shrink-0">
      {marks.map(({ key, hint, glyph }) => (
        // The row opens the event on a tap; a long press names the mark.
        <GlyphMarker
          key={key}
          hint={hint}
          color={null}
          size="inherit"
          cursor="pointer"
        >
          {glyph}
        </GlyphMarker>
      ))}

      {event.distance !== null && (
        <span className="text-nowrap">
          {kmFormat.format(event.distance / 1000)} km
        </span>
      )}
    </span>
  );
}
