import clsx from 'clsx';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { LongPressTooltip } from './LongPressTooltip.js';

/** Text cut short with an ellipsis, given in full by a tooltip only while it is. */
export function TruncatedText({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const [truncated, setTruncated] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: new text can overflow without a resize
  useEffect(() => {
    if (!el) {
      return;
    }

    const measure = () => setTruncated(el.scrollWidth > el.clientWidth);

    measure();

    const ro = new ResizeObserver(measure);

    ro.observe(el);

    return () => ro.disconnect();
  }, [el, children]);

  return (
    // Shown at all only while the text is cut: see `hideLabel`.
    <LongPressTooltip label={children} hideLabel={truncated}>
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
