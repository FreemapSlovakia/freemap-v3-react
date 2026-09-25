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
import { Button, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import classes from './FmModalFooter.module.css';
import { LongPressTooltip } from './LongPressTooltip.js';

const FooterTight = createContext(false);

/** Whether the footer this is in has run out of room for one row of buttons. */
export function useFooterTight(): boolean {
  return useContext(FooterTight);
}

type Props = {
  className?: string;
  children: ReactNode;
};

/**
 * A `Modal.Footer` that knows when its buttons no longer fit on one line, so
 * the dismiss button can drop to its glyph instead of the row wrapping. What it
 * measures is the row with every label shown, so the reading never depends on
 * what it decides.
 */
export function FmModalFooter({ className, children }: Props): ReactElement {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const [tight, setTight] = useState(false);

  const measure = useCallback(() => {
    if (!el?.isConnected) {
      return;
    }

    const available = el.getBoundingClientRect().width;

    if (!available) {
      return; // laid out nowhere, so there is nothing to compare against
    }

    el.classList.add(classes.measure);

    const required = el.getBoundingClientRect().width;

    el.classList.remove(classes.measure);

    setTight(required > available);
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
    <FooterTight value={tight}>
      <Modal.Footer ref={setEl} className={className}>
        {children}
      </Modal.Footer>
    </FooterTight>
  );
}

type DismissProps = {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * The footer's dismiss button. In a tight `FmModalFooter` it keeps only the ✕,
 * which the variant and the last position already name; the tooltip carries the
 * word for a pointer that can hover.
 */
export function FmDismissButton({
  label,
  onClick,
  disabled,
}: DismissProps): ReactElement {
  const tight = useFooterTight();

  return (
    <LongPressTooltip label={label} kbd="Esc" hideLabel={tight}>
      {({ props, label: content, labelClassName }) => (
        <Button variant="dark" onClick={onClick} disabled={disabled} {...props}>
          <FaTimes />

          <span className={clsx(labelClassName, classes.label)}>
            {' '}
            {content}
          </span>
        </Button>
      )}
    </LongPressTooltip>
  );
}
