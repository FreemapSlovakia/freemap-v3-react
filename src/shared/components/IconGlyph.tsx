import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { poiIcons } from '@osm/poiIcons.js';
import { faIconToSvg, parseIconSpec, useFaIcon } from '@shared/drawingIcons.js';
import { poiIconGlyphRect } from '@shared/poiIconGlyph.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import ownClasses from './IconGlyph.module.css';

// The glyph drawing box, in user units — the same intrinsic-scale RichMarker
// uses (so e.g. `peak` stays small instead of filling the cell, and fa icons
// scale to the box). Some fa paths have ink reaching outside their declared
// viewBox (e.g. person-hiking's head sits at y=-32); the marker doesn't clip it
// because it draws into a much larger canvas, so the svg here is `overflow:
// visible` to match (the surrounding padding leaves room for the spill).
const GLYPH_BOX = 160;

type Props =
  | { poi: string; def?: never }
  | { def: IconDefinition; poi?: never };

/**
 * Renders a single icon the way the marker glyph does, so a preview of it is
 * faithful: the glyph centered in a fixed square viewBox, `1em` on the page.
 *
 * A poi icon's drawing is inlined rather than referenced, so — exactly like a
 * Font Awesome path — its ink takes the surrounding text colour. Only the icons
 * that carry a colour of their own (the spring family, trees, water) keep it.
 */
export function IconGlyph(props: Props): ReactElement {
  const c = GLYPH_BOX / 2;

  const icon = props.poi === undefined ? undefined : poiIcons[props.poi];

  return (
    <svg
      viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`}
      overflow="visible"
      fill="currentColor"
      className={clsx(
        ownClasses.glyph,
        icon && !icon.mono && ownClasses.colored,
      )}
      aria-hidden="true"
    >
      {props.def ? (
        (() => {
          const { width, height, path } = faIconToSvg(props.def);

          const scale = GLYPH_BOX / Math.max(width, height);

          return (
            <path
              d={path}
              transform={`translate(${c - (width * scale) / 2} ${
                c - (height * scale) / 2
              }) scale(${scale})`}
            />
          );
        })()
      ) : icon ? (
        <svg
          {...poiIconGlyphRect(icon, c, c, GLYPH_BOX)}
          viewBox={icon.vb.join(' ')}
          // Build-time markup from the generated icon table, never user input.
          dangerouslySetInnerHTML={{ __html: icon.body }}
        />
      ) : null}
    </svg>
  );
}

/**
 * Renders an icon-spec string (`fa:*`, `poi:*`, short literal text) as a glyph
 * for use among other UI icons: in the text colour, bar the poi icons that
 * carry colours of their own. Falls back to `fallback` when there is no spec,
 * when it names an icon that isn't there, and while a `fa:*` icon is still
 * lazy-loading.
 */
export function IconSpecGlyph({
  spec,
  fallback = null,
}: {
  spec?: string;
  fallback?: ReactNode;
}): ReactNode {
  const parsed = parseIconSpec(spec);

  const faDef = useFaIcon(parsed?.kind === 'fa' ? parsed.name : undefined);

  if (parsed?.kind === 'fa') {
    return faDef ? <IconGlyph def={faDef} /> : fallback;
  }

  if (parsed?.kind === 'poi') {
    return poiIcons[parsed.name] ? <IconGlyph poi={parsed.name} /> : fallback;
  }

  if (parsed?.kind === 'text') {
    return <span className="lh-1">{parsed.text}</span>;
  }

  return fallback;
}
