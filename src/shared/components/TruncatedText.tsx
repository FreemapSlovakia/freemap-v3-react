import clsx from 'clsx';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { LongPressTooltip } from './LongPressTooltip.js';

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

  useEffect(() => {
    if (!el) {
      return;
    }

    const ro = new ResizeObserver(() =>
      setTruncated(el.scrollWidth > el.clientWidth),
    );

    ro.observe(el);

    return () => ro.disconnect();
  }, [el]);

  // New text can overflow without a resize; an unchanged answer re-renders nothing.
  useEffect(() => {
    if (el) {
      setTruncated(el.scrollWidth > el.clientWidth);
    }
  });

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
