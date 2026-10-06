import clsx from 'clsx';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Button, type ButtonProps, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import classes from './FmModalFooter.module.css';
import { LongPressTooltip } from './LongPressTooltip.js';

const DISMISS_PRIORITY = -1;

/** Labels of this priority and below are collapsed. */
const FooterCollapse = createContext(Number.NEGATIVE_INFINITY);

type Props = {
  className?: string;
  children: ReactNode;
};

/**
 * A `Modal.Footer` that keeps its buttons on one line: when they don't fit,
 * labels drop to their tooltips one priority at a time — the dismiss button's
 * first, then each {@link FmFooterButton}'s by its `priority` — only as far as
 * the row needs. It measures with every label shown, so the reading never
 * depends on what it decides.
 */
export function FmModalFooter({ className, children }: Props): ReactElement {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const [threshold, setThreshold] = useState(Number.NEGATIVE_INFINITY);

  const measure = useCallback(() => {
    if (!el?.isConnected) {
      return;
    }

    const available = el.getBoundingClientRect().width;

    if (!available) {
      return; // laid out nowhere, so there is nothing to compare against
    }

    el.classList.add(classes.measure);

    let required = el.getBoundingClientRect().width;

    const widths = new Map<number, number>();

    for (const label of el.querySelectorAll<HTMLElement>(`.${classes.label}`)) {
      const priority = Number(label.dataset['priority']);

      widths.set(
        priority,
        (widths.get(priority) ?? 0) + label.getBoundingClientRect().width,
      );
    }

    el.classList.remove(classes.measure);

    let next = Number.NEGATIVE_INFINITY;

    for (const [priority, width] of [...widths].sort(([a], [b]) => a - b)) {
      if (required <= available) {
        break;
      }

      required -= width;

      next = priority;
    }

    setThreshold(next);
  }, [el]);

  // Every render: labels change with the language, and buttons come and go.
  useLayoutEffect(measure);

  useEffect(() => {
    if (!el || !window.ResizeObserver) {
      return;
    }

    const ro = new ResizeObserver(measure);

    ro.observe(el);

    return () => ro.disconnect();
  }, [el, measure]);

  return (
    <FooterCollapse value={threshold}>
      <Modal.Footer ref={setEl} className={className}>
        {children}
      </Modal.Footer>
    </FooterCollapse>
  );
}

type LabelProps = {
  priority: number;
  className: string;
  children: ReactNode;
};

/** A label the footer measures, grouped by its priority. */
function CollapsibleLabel({ priority, className, children }: LabelProps) {
  return (
    <span className={clsx(className, classes.label)} data-priority={priority}>
      {' '}
      {children}
    </span>
  );
}

type FooterButtonProps = {
  icon: ReactNode;
  label: ReactNode;
  kbd?: string;
  /**
   * The higher, the longer the label stays when room runs out. Defaults to 1
   * for a `primary` button, 0 otherwise; the dismiss button is below both.
   */
  priority?: number;
} & Omit<ButtonProps, 'children'>;

/**
 * A footer button whose label gives way to its tooltip once the footer has no
 * room left for it. Outside an `FmModalFooter` it is a plain icon-and-label
 * button.
 */
export function FmFooterButton({
  priority,
  ...rest
}: FooterButtonProps): ReactElement {
  // `Button` itself renders `primary` when no variant is given.
  return (
    <CollapsibleButton
      {...rest}
      priority={priority ?? ((rest.variant ?? 'primary') === 'primary' ? 1 : 0)}
    />
  );
}

function CollapsibleButton({
  icon,
  label,
  kbd,
  priority,
  ...rest
}: FooterButtonProps & { priority: number }): ReactElement {
  const threshold = useContext(FooterCollapse);

  return (
    <LongPressTooltip label={label} kbd={kbd} hideLabel={priority <= threshold}>
      {({ props, label: content, labelClassName }) => {
        const button = (tipProps?: typeof props) => (
          <Button {...rest} {...tipProps}>
            {icon}

            <CollapsibleLabel priority={priority} className={labelClassName}>
              {content}
            </CollapsibleLabel>
          </Button>
        );

        // A disabled button takes no pointer events, so a collapsed one would
        // be a bare icon with no way to name it; the wrapper takes them instead.
        return rest.disabled ? (
          <span className="d-inline-block" {...props}>
            {button()}
          </span>
        ) : (
          button(props)
        );
      }}
    </LongPressTooltip>
  );
}

type DismissProps = {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * The footer's dismiss button, the first to drop to its glyph: the ✕, the
 * variant and the last position already name it.
 */
export function FmDismissButton({
  label,
  onClick,
  disabled,
}: DismissProps): ReactElement {
  return (
    <CollapsibleButton
      variant="dark"
      icon={<FaTimes />}
      label={label}
      kbd="Esc"
      priority={DISMISS_PRIORITY}
      onClick={onClick}
      disabled={disabled}
    />
  );
}
