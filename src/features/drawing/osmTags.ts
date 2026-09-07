import { CENTER_PROP } from '@features/toposcope/centerPoint.js';
import type { DrawingProps } from './model/actions/drawingPointActions.js';
import { isTemplate, renderTemplate } from './renderTemplate.js';

/**
 * What a drawn feature says it is, as OSM tags — for the editors that take
 * them. Its properties, plus a label written plainly as the `name`: a template
 * label reads as whatever the place it is drawn makes of it, so it is not one.
 */
export function drawingOsmTags(feature: {
  label?: string;
  props?: DrawingProps;
}): Record<string, string> {
  const tags: Record<string, string> = {};

  if (feature.label && !isTemplate(feature.label)) {
    // Through the renderer even so: a plain label can still carry `\{`, and the
    // name is what the map shows, not how it is written.
    tags['name'] = renderTemplate(feature.label, () => undefined);
  }

  for (const [key, value] of Object.entries(feature.props ?? {})) {
    // The dial's own marker is not a tag.
    if (key !== CENTER_PROP) {
      tags[key] = value;
    }
  }

  return tags;
}
