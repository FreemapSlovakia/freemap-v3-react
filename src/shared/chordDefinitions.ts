import type { ExternalTarget, Tool } from '@app/store/actions.js';
import type { ModalId } from '@app/store/activeModal.js';
import { toolDefinitions } from './toolDefinitions.js';

/**
 * What a two-key chord reaches. A tool is named by its own `kbd` in
 * `toolDefinitions`, so it is not listed here — `chordFor` finds it there.
 */
export type ChordTarget =
  | { modal: ModalId }
  | { external: ExternalTarget }
  | { command: 'clear-map-features' | 'gallery-list' };

export type ChordDefinition = ChordTarget & {
  /** `KeyboardEvent.code`s: the key that starts the chord, then the one that completes it. */
  codes: [string, string];
};

/**
 * Every two-key chord the app answers, in one place: `keyboardHandler` acts on
 * it, and the menus and the search box print their keys from it. A `KeyG` entry
 * must not take a key some tool's `kbd` already has — the handler answers the
 * tool first, and the entry would be dead while the menus advertised it.
 */
export const chordDefinitions: ChordDefinition[] = [
  { codes: ['KeyG', 'KeyC'], command: 'clear-map-features' },
  { codes: ['KeyG', 'KeyM'], modal: 'my-maps' },
  { codes: ['KeyG', 'KeyW'], modal: 'tracking-watched' },
  { codes: ['KeyG', 'KeyD'], modal: 'tracking-my' },

  { codes: ['KeyE', 'KeyA'], modal: 'account' },
  { codes: ['KeyE', 'KeyG'], modal: 'map-features-export' },
  { codes: ['KeyE', 'KeyP'], modal: 'map-to-document-export' },
  { codes: ['KeyE', 'KeyE'], modal: 'embed' },
  { codes: ['KeyE', 'KeyD'], modal: 'drawing-properties' },
  { codes: ['KeyE', 'KeyM'], modal: 'offline-map-export' },

  { codes: ['KeyM', 'KeyP'], modal: 'map-preferences' },
  { codes: ['KeyM', 'KeyO'], modal: 'offline-maps' },
  { codes: ['KeyM', 'KeyB'], modal: 'browse-cache' },
  { codes: ['KeyM', 'KeyY'], modal: 'map-layers-config' },
  { codes: ['KeyM', 'KeyC'], modal: 'custom-maps' },
  { codes: ['KeyM', 'KeyL'], modal: 'legend' },
  { codes: ['KeyM', 'KeyE'], modal: 'elevation-settings' },

  { codes: ['KeyP', 'KeyL'], command: 'gallery-list' },
  { codes: ['KeyP', 'KeyU'], modal: 'gallery-upload' },
  { codes: ['KeyP', 'KeyF'], modal: 'gallery-filter' },
  { codes: ['KeyP', 'KeyB'], modal: 'gallery-leaderboard' },

  { codes: ['KeyJ', 'KeyC'], external: 'copy' },
  { codes: ['KeyJ', 'KeyG'], external: 'google' },
  { codes: ['KeyJ', 'KeyJ'], external: 'josm' },
  { codes: ['KeyJ', 'KeyO'], external: 'osm.org' },
  { codes: ['KeyJ', 'KeyI'], external: 'osm.org/id' },
  { codes: ['KeyJ', 'KeyM'], external: 'mapy.com' },
  { codes: ['KeyJ', 'KeyH'], external: 'hiking.sk' },
  { codes: ['KeyJ', 'KeyZ'], external: 'zbgis' },
  { codes: ['KeyJ', 'KeyP'], external: 'peakfinder' },
  { codes: ['KeyJ', 'KeyL'], external: 'mapillary' },
  { codes: ['KeyJ', 'Digit4'], external: 'f4map' },
];

/** The keys that start a chord — a tool's `g` among them. */
export const chordPrefixCodes = new Set([
  'KeyG',
  ...chordDefinitions.map(({ codes }) => codes[0]),
]);

/** A key code as a menu prints it: `KeyG` → `g`, `Digit4` → `4`. */
export function chordKey(code: string): string {
  return code.replace(/^(Key|Digit)/, '').toLowerCase();
}

/** The chord that reaches `target`, or nothing when it has none. */
export function chordFor(target: ChordTarget | { tool: Tool }): string[] {
  if ('tool' in target) {
    const kbd = toolDefinitions.find((td) => td.tool === target.tool)?.kbd;

    return kbd ? ['g', chordKey(kbd)] : [];
  }

  const found = chordDefinitions.find((chord) =>
    'modal' in target
      ? 'modal' in chord && chord.modal === target.modal
      : 'external' in target
        ? 'external' in chord && chord.external === target.external
        : 'command' in chord && chord.command === target.command,
  );

  return found ? found.codes.map(chordKey) : [];
}

/** What the second key of a chord reaches, once the first has been pressed. */
export function chordTarget(
  prefixCode: string,
  code: string,
): ChordTarget | undefined {
  return chordDefinitions.find(
    (chord) => chord.codes[0] === prefixCode && chord.codes[1] === code,
  );
}
