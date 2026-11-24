import { Text } from '@features/l10n/Text.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import clsx from 'clsx';
import { type ReactElement, type ReactNode, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTagLabel } from '../hooks/useTagLabel.js';
import { galleryTagsNeeded } from '../model/actions.js';
import { isSameTag, type TagRef, tagKey } from '../tagRefs.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';

interface Props {
  existingTags: TagRef[];
  onAdd: (tag: TagRef) => void;
  className?: string;
  prefix?: ReactNode;
}

export function RecentTags({
  existingTags,
  onAdd,
  className,
  prefix,
}: Props): ReactElement | null {
  const recentTags = useAppSelector(
    (state) => state.gallerySettings.recentTags,
  );

  const gm = useGalleryMessages();

  const { label } = useTagLabel();

  const dispatch = useDispatch();

  // Their labels; the photo viewer has none loaded otherwise.
  useEffect(() => {
    dispatch(galleryTagsNeeded());
  }, [dispatch]);

  const tags = recentTags.filter(
    (tag) => !existingTags.some((existing) => isSameTag(existing, tag)),
  );

  return tags.length === 0 ? null : (
    <div
      className={clsx(
        'd-flex flex-wrap gap-1 align-items-center overflow-auto',
        className,
      )}
    >
      <div>{prefix}</div>

      <div className="flex-shrink-0">
        <Text m={gm} k="recentTags" />
      </div>

      <div className="d-flex gap-1 overflow-auto">
        {tags.map((tag) => (
          <Button
            key={tagKey(tag)}
            onClick={() => onAdd(tag)}
            variant="secondary"
            size="sm"
            className="py-0"
          >
            {label(tag)}
          </Button>
        ))}
      </div>
    </div>
  );
}
