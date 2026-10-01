import { useMessages } from '@features/l10n/l10nInjector.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { sameFilter } from '@features/objects/useMatchedCategories.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import clsx from 'clsx';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

type Props = ComponentPropsWithRef<'a'> & {
  /** The filter this chip stands for — an `ObjectCategory`'s `key`. */
  filterKey: string;
  /** The resting background; the tinted details popup needs `bg-body`. */
  inactiveClassName?: string;
  /** What the tooltip says above the hint — the legend shows the tags there. */
  tooltip?: ReactNode;
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
  tooltip,
  ...props
}: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const active = useAppSelector((state) => state.objects.active);

  const index = active.findIndex((item) => sameFilter(item, filterKey));

  const next = index > -1 ? active.toSpliced(index, 1) : [...active, filterKey];

  // Nothing about a chip says it is a control, so the tooltip is where that is
  // said; a caller with something of its own to show takes the line above it.
  return (
    <LongPressTooltip
      label={tooltip ?? m?.general.toggleObjectType}
      hint={tooltip ? m?.general.toggleObjectType : undefined}
    >
      {({ props: tipProps }) => (
        <a
          {...props}
          {...tipProps}
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
      )}
    </LongPressTooltip>
  );
}
