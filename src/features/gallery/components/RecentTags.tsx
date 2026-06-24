import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import clsx from 'clsx';
import { type ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';

export interface PictureModel {
  title: string;
  description: string;
  tags: string[];
  takenAt: string;
  dirtyPosition: string;
}

interface Props {
  existingTags: string[];
  onAdd: (tag: string) => void;
  className?: string;
  prefix?: ReactNode;
}

export function RecentTags({
  existingTags,
  onAdd,
  className,
  prefix,
}: Props): ReactElement | null {
  const recentTags = useAppSelector((state) => state.gallery.recentTags);

  const gm = useGalleryMessages();

  const tags = recentTags.filter((tag) => !existingTags.includes(tag));

  return tags.length === 0 ? null : (
    <div
      className={clsx(
        'd-flex',
        'flex-wrap',
        'f-gap-1',
        'align-items-center',
        'overflow-auto',
        className,
      )}
    >
      <div>{prefix}</div>

      <div className="flex-shrink-0">{gm?.recentTags}</div>

      <div className="d-flex overflow-auto">
        {tags.map((tag) => (
          <Button
            key={tag}
            onClick={() => onAdd(tag)}
            variant="secondary"
            size="sm"
            className="py-0 ms-1"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
}
