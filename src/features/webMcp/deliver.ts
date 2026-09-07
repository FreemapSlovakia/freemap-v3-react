import { saveBlob } from '@shared/saveBlob.js';
import z from 'zod';

export const DeliverSchema = z
  .enum(['return', 'download'])
  .optional()
  .describe(
    "`download` writes the answer to a JSON file instead of returning it — for a result too big to carry back through the agent's own channel.",
  );

export type Deliver = z.infer<typeof DeliverSchema>;

/**
 * Hands a bulk answer over: as itself, or as a file plus a note of where it
 * went. An agent's call carries no user gesture, so the save picker refuses and
 * `saveBlob` falls back to the download anchor.
 */
export async function deliverResult(
  value: object,
  how: Deliver,
  basename: string,
  summary: Record<string, unknown>,
): Promise<object> {
  if (how !== 'download') {
    return value;
  }

  const blob = new Blob([JSON.stringify(value)], {
    type: 'application/json',
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const savedAs = `${basename}-${stamp}.json`;

  await saveBlob(blob, savedAs, { 'application/json': ['.json'] });

  // The blob's own size: a name like "Jaskyňa" is more bytes than characters.
  return { savedAs, bytes: blob.size, ...summary };
}
