import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { poiIconBBoxes } from '@osm/poiIconBBoxes.js';
import {
  faIconToSvg,
  parseIconSpec,
  poiIconNameToUrl,
  useFaIcon,
} from '@shared/drawingIcons.js';
import { poiIconGlyphRect } from '@shared/poiIconGlyph.js';
import clsx from 'clsx';
import { type ReactElement, type ReactNode, useId } from 'react';
import ownClasses from './IconGlyph.module.css';

// The glyph drawing box, in user units — the same intrinsic-scale RichMarker
// uses (so e.g. `peak` stays small instead of filling the cell, and fa icons
// scale to the box). Some fa paths have ink reaching outside their declared
// viewBox (e.g. person-hiking's head sits at y=-32); the marker doesn't clip it
// because it draws into a much larger canvas, so the svg here is `overflow:
// visible` to match (the surrounding padding leaves room for the spill).
const GLYPH_BOX = 160;

type Props = (
  | { url: string; def?: never }
  | { def: IconDefinition; url?: never }
) & {
  /**
   * Draws the glyph as a silhouette in the text colour. Wanted wherever it
   * stands among other UI icons; a bundled poi image otherwise comes in its own
   * artwork colours, which are black bar a few, and black is unreadable on the
   * dark theme and on a filled button.
   */
  mono?: boolean;
};

/**
 * Renders a single icon the way the marker glyph does, so a preview of it is
 * faithful: the glyph centered in a fixed square viewBox, `1em` on the page.
 */
export function IconGlyph({ mono, ...props }: Props): ReactElement {
  const c = GLYPH_BOX / 2;

  // An id is only legal in the `mask="url(#…)"` reference without React's
  // punctuation around it.
  const maskId = useId().replaceAll(/[^\w-]/g, '');

  return (
    <svg
      viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`}
      overflow="visible"
      className={clsx(
        ownClasses.glyph,
        props.url !== undefined && !mono && ownClasses.poiGlyph,
      )}
      aria-hidden="true"
    >
      {props.def
        ? (() => {
            const { width, height, path } = faIconToSvg(props.def);

            const scale = GLYPH_BOX / Math.max(width, height);

            return (
              <path
                d={path}
                fill="currentColor"
                transform={`translate(${c - (width * scale) / 2} ${
                  c - (height * scale) / 2
                }) scale(${scale})`}
              />
            );
          })()
        : (() => {
            const bbox = poiIconBBoxes[props.url];

            const rect = bbox
              ? poiIconGlyphRect(bbox, c, c, GLYPH_BOX)
              : { x: 0, y: 0, width: GLYPH_BOX, height: GLYPH_BOX };

            const image = <image {...rect} href={props.url} />;

            // The image is an external document, so its own paths can't be told
            // to use the text colour; masking by its alpha paints the shape it
            // covers instead.
            return mono ? (
              <>
                <mask id={maskId} style={{ maskType: 'alpha' }}>
                  {image}
                </mask>

                <rect
                  width={GLYPH_BOX}
                  height={GLYPH_BOX}
                  fill="currentColor"
                  mask={`url(#${maskId})`}
                />
              </>
            ) : (
              image
            );
          })()}
    </svg>
  );
}

/**
 * Renders an icon-spec string (`fa:*`, `poi:*`, short literal text) as a glyph
 * in the text colour, for use among other UI icons. Falls back to `fallback`
 * when there is no spec, when it names an icon that isn't there, and while a
 * `fa:*` icon is still lazy-loading.
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
    const url = poiIconNameToUrl[parsed.name];

    return url ? <IconGlyph mono url={url} /> : fallback;
  }

  if (parsed?.kind === 'text') {
    return <span className="lh-1">{parsed.text}</span>;
  }

  return fallback;
}
