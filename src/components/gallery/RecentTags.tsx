import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, ReactNode } from 'react';
import Button from 'react-bootstrap/Button';

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

  const m = useMessages();

  const tags = recentTags.filter((tag) => !existingTags.includes(tag));

  return tags.length === 0 ? null : (
    <div
      className={`d-flex flex-wrap f-gap-1 align-items-center overflow-auto ${className}`}
    >
      <div>{prefix}</div>

      <div className="flex-shrink-0">{m?.gallery.recentTags}</div>

      <div className="d-flex overflow-auto">
        {tags.map((tag) => (
          <Button
            key={tag}
            type="button"
            onClick={() => onAdd(tag)}
            variant="secondary"
            size="sm"
            className="py-0 ml-1"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
}
