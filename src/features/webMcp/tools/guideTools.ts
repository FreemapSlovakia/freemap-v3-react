import z from 'zod';
import { defineTool } from '../tool.js';

/** Longest section text one answer carries. */
const MAX_CHARS = 20_000;

type GuideSection = {
  heading: string;
  level: number;
  body: string;
};

let guidePromise: Promise<string> | undefined;

/**
 * `static/llms.txt`, the hand-maintained description of what the app can do.
 * Deliberately fetched without the caller's abort signal: the promise is shared
 * by everyone waiting on it, and one agent giving up would fail the rest.
 */
function loadGuide(): Promise<string> {
  guidePromise ??= fetch(new URL('/llms.txt', window.location.href))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Fetching the guide failed with ${response.status}.`);
      }

      return response.text();
    })
    // An aborted or failed fetch must not become the cached answer.
    .catch((err) => {
      guidePromise = undefined;

      throw err;
    });

  return guidePromise;
}

function parseSections(text: string): GuideSection[] {
  const sections: GuideSection[] = [];

  let current: GuideSection | undefined;

  for (const line of text.split('\n')) {
    const match = /^(#{2,4})\s+(.*)$/.exec(line);

    if (match) {
      current = { heading: match[2].trim(), level: match[1].length, body: '' };

      sections.push(current);
    } else if (current) {
      current.body += `${line}\n`;
    }
  }

  return sections;
}

export const guideTools = [
  defineTool({
    name: 'get-app-guide',
    description:
      "Reads the app's own reference guide: what each tool, dialog and map layer does, and how to build a link that opens the map in a given state (viewport, layers, markers, drawn geometry, a planned route). Call it without a section for the summary and the list of sections, then again with the one you need.",
    input: z.object({
      section: z
        .string()
        .optional()
        .describe('Heading of the section to read, as listed without one.'),
    }),
    async execute({ section }) {
      const text = await loadGuide();

      const sections = parseSections(text);

      if (!section) {
        const firstHeading = text.indexOf('\n## ');

        return {
          summary: firstHeading === -1 ? '' : text.slice(0, firstHeading),
          sections: sections.map((s) => s.heading),
        };
      }

      const wanted = section
        .replace(/^#+\s*/, '')
        .trim()
        .toLowerCase();

      const found =
        sections.find((s) => s.heading.toLowerCase() === wanted) ??
        sections.find((s) => s.heading.toLowerCase().includes(wanted));

      if (!found) {
        throw new Error(
          `No such section. There is: ${sections.map((s) => s.heading).join(', ')}.`,
        );
      }

      // A `##` section carries its `###` subsections; they are separate rows in
      // the listing, so what is returned would otherwise stop at the first one.
      const index = sections.indexOf(found);

      const rest = sections
        .slice(index + 1)
        .findIndex((s) => s.level <= found.level);

      const body = sections
        .slice(index, rest === -1 ? undefined : index + 1 + rest)
        .map((s) => `${'#'.repeat(s.level)} ${s.heading}\n${s.body}`)
        .join('\n');

      return body.length > MAX_CHARS
        ? `${body.slice(0, MAX_CHARS)}\n\n[…truncated; ask for a subsection]`
        : body;
    },
  }),
];
