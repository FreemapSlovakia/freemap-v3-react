import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import 'fm3/styles/react-tag-autocomplete.css';
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
    <div className={`d-flex f-gap-1 align-items-center ${className}`}>
      {prefix}

      <div>{m?.gallery.recentTags}</div>

      {tags.map((tag) => (
        <Button
          key={tag}
          type="button"
          onClick={() => onAdd(tag)}
          variant="secondary"
          size="sm"
          className="py-0"
        >
          {tag}
        </Button>
      ))}
    </div>
  );
}
