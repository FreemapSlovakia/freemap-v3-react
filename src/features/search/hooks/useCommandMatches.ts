import { hasRole } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  libraryIndexSelector,
  presetKindsSelector,
  resolvedCustomLayersSelector,
} from '@features/mapLibrary/model/selectors.js';
import { type Command, getCommands } from '@shared/commandDefinitions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { matchLabel } from '@shared/labelMatch.js';
import { unavailableToolsSelector } from '@shared/toolDefinitions.js';
import { useMemo } from 'react';

export type CommandMatch = {
  command: Command;
  /** Indexes into the label of the characters the query matched. */
  positions: number[];
  score: number;
};

const maxMatches = 6;

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

  const customLayers = useAppSelector(resolvedCustomLayersSelector);

  const presets = useAppSelector((state) => state.map.presets);

  const presetKinds = useAppSelector(presetKindsSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const libraryIndex = useAppSelector(libraryIndexSelector);

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
            presets,
            presetKinds,
            layersSettings,
            libraryIndex,
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
      presets,
      presetKinds,
      layersSettings,
      libraryIndex,
      embedFeatures,
    ],
  );

  return useMemo(() => {
    const matches: CommandMatch[] = [];

    for (const command of commands) {
      const hit = matchLabel(query, command.label, command.keywords);

      if (hit) {
        matches.push({ command, ...hit });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, maxMatches);
  }, [query, commands]);
}
