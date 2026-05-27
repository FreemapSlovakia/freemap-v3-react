import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import type { Node } from '@osm/types.js';
import { useEffect, useState } from 'react';

// `iconName` -> definition cache, filled the first time the solid set loads.
const iconCache = new Map<string, IconDefinition>();

let allIconsPromise: Promise<IconDefinition[]> | undefined;

/**
 * Lazily loads the entire Font Awesome solid set as a single on-demand chunk,
 * deduplicated by `iconName` and sorted. Used by the icon picker and to resolve
 * icons for display.
 */
export function loadAllIcons(): Promise<IconDefinition[]> {
  return (allIconsPromise ??= import('@fortawesome/free-solid-svg-icons').then(
    ({ fas }) => {
      const byName = new Map<string, IconDefinition>();

      for (const def of Object.values(fas)) {
        byName.set(def.iconName, def);

        iconCache.set(def.iconName, def);
      }

      return [...byName.values()].sort((a, b) =>
        a.iconName.localeCompare(b.iconName),
      );
    },
  ));
}

/**
 * Resolves a Font Awesome solid icon by `iconName`. Returns a cached definition
 * synchronously when available, otherwise triggers the lazy load and resolves
 * on the next render. Returns `undefined` until ready / if the name is unknown.
 */
export function useFaIcon(
  name: string | undefined,
): IconDefinition | undefined {
  const [, force] = useState(0);

  const cached = name ? iconCache.get(name) : undefined;

  useEffect(() => {
    if (name && !cached) {
      let cancelled = false;

      loadAllIcons().then(() => {
        if (!cancelled) {
          force((n) => n + 1);
        }
      });

      return () => {
        cancelled = true;
      };
    }
  }, [name, cached]);

  return cached;
}

// Bundled OSM poi icons, mapped name <-> built asset URL. The URLs are taken
// straight from `osmTagToIconMapping` (the same strings used to display the OSM
// objects), so converting an object to a drawing point can round-trip its icon
// as `poi:<name>` without a second enumeration mechanism that could drift.
export const poiIconNameToUrl: Record<string, string> = {};

export const poiIconUrlToName: Record<string, string> = {};

// Derives the stable icon name from an asset URL by taking the filename stem
// (poi filenames have no dots in them, only an extension and optional hash).
function urlToPoiName(url: string): string {
  const file = url.split(/[?#]/)[0].split('/').pop() ?? url;

  return file.split('.')[0];
}

(function collectPoiIcons(node: Node) {
  for (const value of Object.values(node)) {
    if (typeof value === 'string') {
      const name = urlToPoiName(value);

      poiIconNameToUrl[name] = value;

      poiIconUrlToName[value] = name;
    } else {
      collectPoiIcons(value);
    }
  }
})(osmTagToIconMapping);

/**
 * Renders a Font Awesome icon definition as a standalone `<svg>` (used for the
 * picker grid and previews). For the map marker the path is embedded directly
 * into the marker SVG instead — see `RichMarker`.
 */
export function FaIconSvg({
  def,
  size = '1em',
}: {
  def: IconDefinition;
  size?: number | string;
}) {
  const [width, height, , , path] = def.icon;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={Array.isArray(path) ? path.join(' ') : path} />
    </svg>
  );
}
