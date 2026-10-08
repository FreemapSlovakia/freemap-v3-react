import clsx from 'clsx';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { LongPressTooltip } from './LongPressTooltip.js';

// One observer for every instance: a list can hold hundreds.
const remeasure = new WeakMap<Element, () => void>();

let observer: ResizeObserver | undefined;

function observe(el: Element, measure: () => void): () => void {
  observer ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      remeasure.get(entry.target)?.();
    }
  });

  remeasure.set(el, measure);

  observer.observe(el);

  return () => {
    observer?.unobserve(el);

    remeasure.delete(el);
  };
}

/** Text cut short with an ellipsis, given in full by a tooltip only while it is. */
export function TruncatedText({
  className,
  tooltip,
  children,
}: {
  className?: string;
  /** The tooltip's text where the shown one is styled for the panel, not for it. */
  tooltip?: ReactNode;
  children: ReactNode;
}): ReactElement {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const [truncated, setTruncated] = useState(false);

  const measure = () => {
    if (el) {
      setTruncated(el.scrollWidth > el.clientWidth);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: subscribed once per element; `measure` reads it alone
  useEffect(() => (el ? observe(el, measure) : undefined), [el]);

  // New text can overflow without a resize; an unchanged answer re-renders nothing.
  useEffect(measure);

  return (
    // Shown at all only while the text is cut: see `hideLabel`.
    <LongPressTooltip label={tooltip ?? children} hideLabel={truncated}>
      {({ props }) => (
        <span {...props} className="d-flex min-w-0">
          <span ref={setEl} className={clsx('text-truncate', className)}>
            {children}
          </span>
        </span>
      )}
    </LongPressTooltip>
  );
}
