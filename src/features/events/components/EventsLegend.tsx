import type { RoutePlannerMessages } from '@features/routePlanner/translations/RoutePlannerMessages.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { formatScaleNumber } from '@shared/colorizers/colorize.js';
import {
  LegendGradientBar,
  LegendShell,
  LegendSwatch,
  LegendTick,
} from '@shared/components/Legend.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement, ReactNode } from 'react';
import { FaCalendarDay, FaPalette } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  DIFFICULTIES,
  type EventItem,
  eventsToggleLegend,
} from '../model/actions.js';
import {
  DIFFICULTY_COLORS,
  EVENT_SCALES,
  type EventScale,
  type EventsColorizeBy,
  HAPPENING_COLOR,
  MINE_COLORS,
  MUTED_COLOR,
  SEVERAL_TRANSPORTS_COLOR,
  TRANSPORT_COLORS,
  tOf,
  valueAt,
  YES_NO_COLORS,
} from '../model/colorize.js';
import { TRANSPORT_KINDS } from '../model/transports.js';
import type { EventsMessages } from '../translations/EventsMessages.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

const ICON = (
  <>
    <FaCalendarDay />
    <FaPalette />
  </>
);

type Swatch = { color: string; label: ReactNode };

/**
 * The categories of a mode with no scale, or those beside its scale; for
 * transport, only the kinds `events` name.
 */
function swatchesOf(
  by: EventsColorizeBy,
  em: EventsMessages | undefined,
  rpm: RoutePlannerMessages | undefined,
  events: EventItem[],
): Swatch[] {
  const c = em?.colorize;

  switch (by) {
    case 'transport': {
      const named = new Set(events.flatMap((e) => e.transports));

      return [
        ...TRANSPORT_KINDS.filter(({ kind }) => named.has(kind)).map(
          ({ kind, icon }) => ({
            color: TRANSPORT_COLORS[kind] ?? MUTED_COLOR,
            label: (
              <>
                {icon} {rpm?.transportType[kind]}
              </>
            ),
          }),
        ),
        ...(events.some((e) => e.transports.length > 1)
          ? [{ color: SEVERAL_TRANSPORTS_COLOR, label: c?.several ?? '' }]
          : []),
        { color: MUTED_COLOR, label: em?.notSaid ?? '' },
      ];
    }

    case 'when':
      return [
        { color: MUTED_COLOR, label: c?.ended ?? '' },
        { color: HAPPENING_COLOR, label: c?.happening ?? '' },
      ];

    case 'mine':
      return Object.entries(MINE_COLORS).map(([category, color]) => ({
        color,
        label: c?.mine[category as keyof typeof MINE_COLORS] ?? '',
      }));

    case 'difficulty':
      return [
        ...DIFFICULTIES.map((d) => ({
          color: DIFFICULTY_COLORS[d],
          label: em?.difficulty[d] ?? d,
        })),
        { color: MUTED_COLOR, label: em?.notSaid ?? '' },
      ];

    case 'dogs':
    case 'children':
      return [
        { color: YES_NO_COLORS.yes, label: c?.yes ?? '' },
        { color: YES_NO_COLORS.no, label: c?.no ?? '' },
        { color: YES_NO_COLORS.unsaid, label: em?.notSaid ?? '' },
      ];

    default:
      return [{ color: MUTED_COLOR, label: em?.notSaid ?? '' }];
  }
}

const UNITS: Partial<Record<EventsColorizeBy, string>> = {
  distance: 'km',
  duration: 'h',
  ascent: 'm',
};

function gradient(scale: EventScale) {
  const stops = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16;

    return `${scale.colorAt(t)} ${t * 100}%`;
  });

  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export function EventsLegend(): ReactElement | null {
  const dispatch = useDispatch();

  const by = useAppSelector((state) => state.eventsSettings.colorizeBy);

  const language = useAppSelector((state) => state.l10n.language);

  const em = useEventsMessages();

  const rpm = useRoutePlannerMessages();

  const events = useAppSelector((state) => state.events.list);

  if (!by) {
    return null;
  }

  const scale: EventScale | undefined =
    by in EVENT_SCALES
      ? EVENT_SCALES[by as keyof typeof EVENT_SCALES]
      : undefined;

  return (
    <LegendShell
      icon={ICON}
      label={em?.colorize.modes[by]}
      unit={by === 'when' ? em?.colorize.days : UNITS[by]}
      onClose={() => dispatch(eventsToggleLegend(false))}
      className="flex-wrap align-items-center gap-2"
    >
      {swatchesOf(by, em, rpm, events).map(({ color, label }, i) => (
        // Not by label: all are empty until the messages load.
        <LegendSwatch key={i} color={color} label={label} />
      ))}

      {scale && (
        <LegendGradientBar
          background={gradient(scale)}
          wide
          valueAt={(t) =>
            formatScaleNumber(
              valueAt(scale, t) / scale.factor,
              by === 'ascent' ? 0 : 1,
              language,
            )
          }
        >
          {scale.ticks.map((v) => (
            <LegendTick key={v} t={tOf(scale, v * scale.factor)}>
              {v}
            </LegendTick>
          ))}
        </LegendGradientBar>
      )}
    </LegendShell>
  );
}
