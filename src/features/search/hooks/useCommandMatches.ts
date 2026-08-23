import { hasRole } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { type Command, getCommands } from '@shared/commandDefinitions.js';
import { fuzzyMatch } from '@shared/fuzzyMatch.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { unavailableToolsSelector } from '@shared/toolDefinitions.js';
import { useMemo } from 'react';

export type CommandMatch = {
  command: Command;
  /** Indexes into the label of the characters the query matched. */
  positions: number[];
  score: number;
};

/** Below this the query is left to the geocoder alone. */
const minQueryLength = 2;

/**
 * Longer than any label or synonym, so past it nothing can match — and matching
 * costs the query's length against every candidate, which a pasted paragraph
 * would spend on each keystroke.
 */
const maxQueryLength = 64;

const maxMatches = 6;

/** Per query character; loose matches score less than this. */
const minScorePerChar = 12;

/** A synonym hit is a weaker one than the label saying the same. */
const keywordPenalty = 20;

/** The app's own functions and maps the query finds, best first. */
export function useCommandMatches(query: string): CommandMatch[] {
  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const unavailableTools = useAppSelector(unavailableToolsSelector);

  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  const canSaveSettings = useCanSaveSettings();

  const layers = useAppSelector((state) => state.map.layers);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const commands = useMemo(
    () =>
      m
        ? getCommands({
            m,
            language,
            loggedIn,
            unavailableTools,
            canPreviewLayers,
            canSaveSettings,
            layers,
            customLayers,
            layersSettings,
            embedFeatures,
          })
        : [],
    [
      m,
      language,
      loggedIn,
      unavailableTools,
      canPreviewLayers,
      canSaveSettings,
      layers,
      customLayers,
      layersSettings,
      embedFeatures,
    ],
  );

  return useMemo(() => {
    const trimmed = query.trim();

    if (trimmed.length < minQueryLength || trimmed.length > maxQueryLength) {
      return [];
    }

    const floor = trimmed.replace(/\s/g, '').length * minScorePerChar;

    const matches: CommandMatch[] = [];

    for (const command of commands) {
      const hit = fuzzyMatch(trimmed, command.label);

      let score = hit?.score ?? Number.NEGATIVE_INFINITY;

      // Each synonym is matched on its own, so a query can't be answered by
      // characters gathered from across the whole list.
      for (const keyword of command.keywords?.split(',') ?? []) {
        const kw = fuzzyMatch(trimmed, keyword.trim());

        if (kw) {
          score = Math.max(score, kw.score - keywordPenalty);
        }
      }

      if (score >= floor) {
        matches.push({ command, score, positions: hit?.positions ?? [] });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, maxMatches);
  }, [query, commands]);
}
