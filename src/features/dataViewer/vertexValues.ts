import { isoInstant, toDatetimeLocal, toEpochMs } from '@shared/dateUtils.js';
import { parseDecimal } from '@shared/numberValidator.js';
import type { Feature, Position } from 'geojson';
import { readChannels, TIMES } from './trackChannels.js';
import { isTrackLine } from './trackSelection.js';
import { editableParts } from './vertexEditing.js';

export type VertexField = {
  /** `lat`, `lon`, `ele`, or the channel's key. */
  key: string;
  kind: 'number' | 'time' | 'text';
  /** As stored, so an untouched field writes back exactly what was there. */
  original: unknown;
  /** As the field shows it. */
  text: string;
  unit?: string;
  /** Shown value per stored unit. */
  scale?: number;
  min?: number;
  max?: number;
};

export type VertexFieldError = 'notANumber' | 'outOfRange' | 'timeOrder';

const CHANNEL_UNITS: Record<string, { unit: string; scale?: number }> = {
  heart: { unit: 'bpm' },
  cads: { unit: 'rpm' },
  atemps: { unit: '°C' },
  wtemps: { unit: '°C' },
  depths: { unit: 'm' },
  speeds: { unit: 'km/h', scale: 3.6 },
  courses: { unit: '°' },
  bearings: { unit: '°' },
  powers: { unit: 'W' },
  accuracies: { unit: 'm' },
  battery: { unit: '%' },
  gsmSignal: { unit: '%' },
};

/** An ISO time as a `datetime-local` value, in the viewer's own time zone. */
export function toLocalInput(iso: unknown): string {
  const ms = toEpochMs(iso);

  return ms === undefined ? '' : toDatetimeLocal(new Date(ms), true);
}

function numberText(value: unknown, scale = 1): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(Number((value * scale).toFixed(6)))
    : '';
}

/** The channels a line can be given by hand, in the order they are offered. */
export const KNOWN_CHANNELS = [TIMES, ...Object.keys(CHANNEL_UNITS)];

/**
 * The editable values of one vertex: its position, elevation and every
 * per-point channel that holds plain numbers or text in its segment.
 */
export function vertexFields(
  feature: Feature,
  part: number,
  vertex: number,
): { fields: VertexField[]; timeBounds: { min?: number; max?: number } } {
  const position = editableParts(feature.geometry)?.[part]?.[vertex];

  const timeBounds: { min?: number; max?: number } = {};

  if (!position) {
    return { fields: [], timeBounds };
  }

  const [lon, lat, ele] = position;

  const fields: VertexField[] = [
    {
      key: 'lat',
      kind: 'number',
      original: lat,
      text: numberText(lat),
      unit: '°',
      min: -90,
      max: 90,
    },
    {
      key: 'lon',
      kind: 'number',
      original: lon,
      text: numberText(lon),
      unit: '°',
      min: -180,
      max: 180,
    },
    {
      key: 'ele',
      kind: 'number',
      original: ele,
      text: numberText(ele),
      unit: 'm',
    },
  ];

  if (!isTrackLine(feature)) {
    return { fields, timeBounds };
  }

  for (const { key, segments } of readChannels(feature)) {
    const segment = segments[part] ?? [];

    const value = segment[vertex] ?? null;

    if (key === TIMES) {
      timeBounds.min = segment
        .slice(0, vertex)
        .map(toEpochMs)
        .findLast(Number.isFinite);

      timeBounds.max = segment
        .slice(vertex + 1)
        .map(toEpochMs)
        .find(Number.isFinite);

      fields.push({
        key,
        kind: 'time',
        original: value,
        text: toLocalInput(value),
      });
    } else if (segment.every((v) => v === null || typeof v === 'number')) {
      const { unit, scale } = CHANNEL_UNITS[key] ?? {};

      fields.push({
        key,
        kind: 'number',
        original: value,
        text: numberText(value, scale),
        unit,
        scale,
      });
    } else if (segment.every((v) => v === null || typeof v === 'string')) {
      fields.push({
        key,
        kind: 'text',
        original: value,
        text: typeof value === 'string' ? value : '',
      });
    }
  }

  return { fields, timeBounds };
}

/** What a field's text stands for, or why it can't be written. */
export function parseVertexField(
  field: VertexField,
  text: string,
  timeBounds: { min?: number; max?: number },
): { value: unknown } | { error: VertexFieldError } {
  if (text === field.text) {
    return { value: field.original };
  }

  const trimmed = text.trim();

  // Latitude and longitude can't be absent; anything else can.
  if (trimmed === '') {
    return field.key === 'lat' || field.key === 'lon'
      ? { error: 'notANumber' }
      : { value: null };
  }

  switch (field.kind) {
    case 'text':
      return { value: text };

    case 'time': {
      // A `datetime-local` value carries no offset, so it parses as local time.
      const ms = Date.parse(trimmed);

      if (Number.isNaN(ms)) {
        return { error: 'notANumber' };
      }

      if (
        (timeBounds.min !== undefined && ms < timeBounds.min) ||
        (timeBounds.max !== undefined && ms > timeBounds.max)
      ) {
        return { error: 'timeOrder' };
      }

      // Spelled as the link reads it back, or the line could not go in the link.
      return { value: isoInstant(ms) };
    }

    case 'number': {
      // A comma is the decimal point a phone's decimal keypad types in many
      // languages; a text field takes it as one.
      const shown = parseDecimal(trimmed.replace(',', '.'));

      if (shown === undefined) {
        return { error: 'notANumber' };
      }

      if (
        (field.min !== undefined && shown < field.min) ||
        (field.max !== undefined && shown > field.max)
      ) {
        return { error: 'outOfRange' };
      }

      return { value: shown / (field.scale ?? 1) };
    }
  }
}

/**
 * The position and the changed channels the parsed values make, ready for
 * `dataViewerSetVertexValues`. A cleared elevation leaves the position 2D.
 */
export function vertexEdit(values: ReadonlyMap<string, unknown>): {
  position: Position;
  values: Record<string, unknown>;
} {
  const { lat, lon, ele, ...channels } = Object.fromEntries(values);

  return {
    position:
      typeof ele === 'number'
        ? [lon as number, lat as number, ele]
        : [lon as number, lat as number],
    values: channels,
  };
}
