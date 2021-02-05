import { is } from 'typescript-is';

export function resolveTrackSurface(tags: Record<string, string>): string {
  if (tags['surface']) {
    return tags['surface'];
  }

  if (
    [
      'motorway',
      'trunk',
      'primary',
      'secondary',
      'tertiary',
      'service',
      'unclassified',
      'residential',
    ].indexOf(tags['highway']) >= 0
  ) {
    return 'asphalt';
  }

  return 'unknown';
}

export function resolveTrackClass(tags: Record<string, string>): string {
  if (tags['highway']) {
    if (tags['highway'] === 'track') {
      return tags['tracktype'] || 'unknown';
    }

    return tags['highway'];
  }

  return 'unknown';
}

const trackGradeToBike = {
  grade1: 'road-bike',
  grade2: 'trekking-bike',
  grade3: 'trekking-bike',
  grade4: 'mtb-bike',
  grade5: 'no-bike',
} as const;

type Grades = keyof typeof trackGradeToBike;

export function resolveBicycleTypeSuitableForTrack(
  tags: Record<string, string>,
): typeof trackGradeToBike[Grades] | 'unknown' {
  if (['motorway', 'trunk'].includes(tags['highway'])) {
    return 'no-bike';
  }

  if (resolveTrackSurface(tags) === 'asphalt') {
    return 'road-bike';
  }

  return is<Grades>(tags['tracktype'])
    ? trackGradeToBike[tags['tracktype']]
    : 'unknown';
}
