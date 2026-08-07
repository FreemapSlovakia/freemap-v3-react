import { setActiveModal } from '@app/store/actions.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import clsx from 'clsx';
import type { CSSProperties } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  weatherRadarSetPlaying,
  weatherRadarSetTime,
} from '../model/actions.js';
import {
  radarAllowedSelector,
  radarFramesSelector,
  radarIndexSelector,
} from '../model/selectors.js';
import { useWeatherRadarMessages } from '../translations/useWeatherRadarMessages.js';
import classes from './RadarTimeline.module.css';

/**
 * The frame slider and its clock.
 *
 * The track is painted in three bands: the stretch this user may open, the
 * forecast tail, and — for anyone without premium — the frames held back at
 * either end. Those are left *on* the track deliberately; a timeline that
 * simply stopped early would say nothing about what premium buys. Dragging
 * into one makes the offer instead of moving the map.
 */
export function RadarTimeline() {
  const wm = useWeatherRadarMessages();

  const dispatch = useDispatch();

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  const { from, to } = useAppSelector(radarAllowedSelector);

  const timeFormat = useDateTimeFormat({ timeStyle: 'short' });

  const language = useAppSelector((state) => state.l10n.language);

  const frame = frames[index];

  if (!frame) {
    return <span className="align-self-center ms-2">{wm?.loading}</span>;
  }

  // Boundaries as a share of the track. The thumb sits at
  // `index / (count - 1)`, so a band edge belongs midway between two frames.
  const at = (i: number) =>
    Math.min(100, Math.max(0, ((i - 0.5) / (frames.length - 1)) * 100));

  const firstForecast = frames.findIndex((f) => f.forecast);

  const minutes = Math.round((frame.time * 1000 - Date.now()) / 60_000);

  const relative =
    minutes === 0
      ? wm?.now
      : minutes < 0
        ? wm?.ago({
            duration: formatDuration(-minutes * 60, language, 'narrow'),
          })
        : wm?.ahead({
            duration: formatDuration(minutes * 60, language, 'narrow'),
          });

  const openFrom = frames.length < 2 ? 0 : at(from);

  const openTo = frames.length < 2 ? 100 : at(to + 1);

  const tailLocked = to < frames.length - 1;

  return (
    <>
      {/* The bands live on the wrapper, and the slider covers only the stretch
          this user may open — so the thumb cannot enter a locked band at all,
          rather than being dragged in and corrected afterwards. A click on a
          locked band lands here, not on the input.

          A plain div, not a button: a button may not contain interactive
          content, and ARIA gives its children presentational roles — which
          would prune the slider, its value and its label out of the
          accessibility tree, and can stop the thumb receiving drags at all. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the slider inside is the
          keyboard-reachable control; this only carries the pointer shortcut to
          the offer, which the main menu reaches by keyboard anyway. */}
      <div
        className={clsx('align-self-center', 'ms-2', classes.track)}
        style={
          {
            '--fm-radar-locked-until': `${frames.length < 2 ? 0 : at(from)}%`,
            '--fm-radar-warning-from': `${
              firstForecast < 0 || frames.length < 2 ? 100 : at(firstForecast)
            }%`,
            // What the tail means decides its colour: an offer while it is
            // locked, otherwise simply the forecast.
            '--fm-radar-tail':
              to < frames.length - 1
                ? 'rgba(var(--bs-warning-rgb), 0.5)'
                : 'rgba(var(--bs-info-rgb), 0.5)',
            '--fm-radar-open-from': `${openFrom}%`,
            '--fm-radar-open-to': `${openTo}%`,
          } as CSSProperties
        }
        // Names the lock the user is actually looking at: with a feed shorter
        // than the free window the measured frames all fit, and only the
        // forecast is held back.
        title={
          from > 0
            ? wm?.lockedHistory
            : tailLocked
              ? wm?.lockedForecast
              : undefined
        }
        // Covers both ways of asking: a click on a locked band, and a drag that
        // ends over one — pointer down and up share this element, so the click
        // lands here either way. Only when something is actually locked, or a
        // premium user clicking the track's edge would be sold what they have.
        onClick={
          from > 0 || tailLocked
            ? () => dispatch(setActiveModal({ type: 'premium' }))
            : undefined
        }
      >
        {to >= from && (
          <Form.Range
            className={classes.timeline}
            min={from}
            max={to}
            step={1}
            value={index}
            aria-label={wm?.timeline}
            // An explicit empty title stops the wrapper's from being inherited:
            // the offer belongs to the locked bands, not to the stretch the
            // user is free to scrub.
            title=""
            // The wrapper's click is the premium offer; a drag on the slider
            // itself is not.
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const target = frames[Number(e.currentTarget.value)];

              if (target) {
                // Scrubbing is the user taking the timeline over; an animation
                // that kept stepping would fight them for the slider.
                dispatch(weatherRadarSetPlaying(false));

                dispatch(weatherRadarSetTime(target.time));
              }
            }}
          />
        )}
      </div>

      <span
        className={clsx(
          'align-self-center',
          'ms-2',
          'small',
          classes.label,
          frame.forecast && 'text-warning-emphasis',
        )}
        title={frame.forecast ? wm?.forecast : undefined}
      >
        {timeFormat.format(frame.time * 1000)}
        <br />
        <span className={frame.forecast ? undefined : 'text-body-secondary'}>
          {relative}
        </span>
      </span>
    </>
  );
}
