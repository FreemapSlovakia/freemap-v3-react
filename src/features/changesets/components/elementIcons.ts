import type { IconType } from 'react-icons';
import { FaMapMarkerAlt, FaProjectDiagram } from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import type { ElementType } from '../model/changesetDiff.js';

/** A changed element's glyph where its kind has no POI icon of its own. */
export const ELEMENT_ICONS: Record<ElementType, IconType> = {
  node: FaMapMarkerAlt,
  way: MdPolyline,
  relation: FaProjectDiagram,
};
