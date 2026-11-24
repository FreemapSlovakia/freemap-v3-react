import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { GalleryTag } from '../model/actions.js';
import { findTag, type TagRef } from '../tagRefs.js';

/**
 * A tag → its label in the UI language, else its name; `tag` finds it in the
 * loaded list.
 */
export function useTagLabel(): {
  label: (ref: TagRef) => string;
  tag: (ref: TagRef) => GalleryTag | undefined;
} {
  const tags = useAppSelector((state) => state.gallery.tags);

  const tag = (ref: TagRef) => findTag(tags, ref);

  return {
    tag,
    label: (ref) => {
      const found = tag(ref);

      return found?.label ?? found?.name ?? ref.name;
    },
  };
}
