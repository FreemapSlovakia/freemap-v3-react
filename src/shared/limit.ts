export type Limit = <T>(
  job: () => Promise<T>,
  /** Checked once its turn comes: queued past its cancelling, it would start anyway. */
  cancelled?: () => boolean,
) => Promise<T>;

/**
 * Runs at most `max` jobs at once, the rest waiting their turn. A finished job
 * hands its slot to the next waiting one, which a job arriving meanwhile can't
 * take first.
 */
export function createLimit(max: number): Limit {
  let active = 0;

  const waiting: (() => void)[] = [];

  return async (job, cancelled) => {
    if (active < max) {
      active++;
    } else {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }

    try {
      if (cancelled?.()) {
        throw new DOMException('Cancelled while queued', 'AbortError');
      }

      return await job();
    } finally {
      const next = waiting.shift();

      if (next) {
        next();
      } else {
        active--;
      }
    }
  };
}
