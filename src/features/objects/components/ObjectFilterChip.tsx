import { objectsSetFilter } from '@features/objects/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import clsx from 'clsx';
import type { ComponentPropsWithRef, ReactElement } from 'react';
import { useDispatch } from 'react-redux';

type Props = ComponentPropsWithRef<'a'> & {
  /** The filter this chip stands for — an `ObjectCategory`'s `key`. */
  filterKey: string;
  /** The resting background; the tinted details popup needs `bg-body`. */
  inactiveClassName?: string;
};

/**
 * Switches one objects category on or off. Also a link, whose `href` names the
 * filter it would leave behind and nothing else — not the view it sits in.
 */
export function ObjectFilterChip({
  filterKey,
  inactiveClassName = 'bg-body-secondary',
  className,
  children,
  ...props
}: Props): ReactElement {
  const dispatch = useDispatch();

  const active = useAppSelector((state) => state.objects.active);

  const own = filterKey.split(',');

  // The tags of a filter are a set, and nothing fixes the order they were
  // stored in, so the match is set equality rather than string equality.
  const index = active.findIndex((item) => {
    const parts = item.split(',');

    return parts.length === own.length && parts.every((t) => own.includes(t));
  });

  const next = index > -1 ? active.toSpliced(index, 1) : [...active, filterKey];

  return (
    <a
      {...props}
      className={clsx(
        'px-2 rounded',
        index > -1 ? 'bg-primary text-light' : inactiveClassName,
        className,
      )}
      href={`/#objects=${encodeURIComponent(next.join(';'))}`}
      onClick={(e) => {
        e.preventDefault();

        dispatch(objectsSetFilter(next));
      }}
    >
      {children}
    </a>
  );
}
