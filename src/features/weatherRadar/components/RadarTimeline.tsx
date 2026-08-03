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
import { radarFramesSelector, radarIndexSelector } from '../model/selectors.js';
import { useWeatherRadarMessages } from '../translations/useWeatherRadarMessages.js';
import classes from './RadarTimeline.module.css';

/**
 * The frame slider and its clock. The track is tinted from the point "now"
 * falls on it, so the extrapolated tail is visible as such while scrubbing.
 */
export function RadarTimeline() {
  const wm = useWeatherRadarMessages();

  const dispatch = useDispatch();

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  const timeFormat = useDateTimeFormat({ timeStyle: 'short' });

  const language = useAppSelector((state) => state.l10n.language);

  const frame = frames[index];

  if (!frame) {
    return <span className="align-self-center ms-2">{wm?.loading}</span>;
  }

  const observed = frames.filter((f) => !f.forecast).length;

  // Where the tint starts. The thumb sits at `index / (count - 1)` of the
  // track, so the boundary between measured and extrapolated lies midway
  // between the last observed frame and the first forecast one — not at the
  // observed share of the count, which is half a step off.
  const split =
    frames.length < 2
      ? 100
      : Math.min(
          100,
          Math.max(0, ((observed - 0.5) / (frames.length - 1)) * 100),
        );

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

  return (
    <>
      <Form.Range
        className={clsx('align-self-center', 'ms-2', classes.timeline)}
        style={{ '--fm-radar-split': `${split}%` } as CSSProperties}
        min={0}
        max={frames.length - 1}
        step={1}
        value={index}
        aria-label={wm?.timeline}
        onChange={(e) => {
          const picked = frames[Number(e.currentTarget.value)];

          if (picked) {
            // Scrubbing is the user taking the timeline over; an animation that
            // kept stepping would fight them for the slider.
            dispatch(weatherRadarSetPlaying(false));

            dispatch(weatherRadarSetTime(picked.time));
          }
        }}
      />

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
