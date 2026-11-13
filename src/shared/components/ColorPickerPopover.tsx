import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classes from './ColorPickerPopover.module.css';

const CHECKER: CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
};

type Props = {
  /** What the swatch shows: any CSS background, a colour or a gradient. */
  swatch: string;
  /** A checkerboard behind the swatch, for a colour that may be translucent. */
  checker?: boolean;
  className?: string;
  style?: CSSProperties;
  /** On closing, which unmounts the picker: a drag in it is never released. */
  onHide?: () => void;
  /** The picker. */
  children: ReactNode;
};

/** A swatch, framed like Bootstrap's colour input, opening a picker below it. */
export function ColorPickerPopover({
  swatch,
  checker,
  className,
  style,
  onHide,
  children,
}: Props): ReactElement {
  const [show, setShow] = useState(false);

  const toggle = (next: boolean) => {
    setShow(next);

    if (!next) {
      onHide?.();
    }
  };

  // Escape closes only this, not the modal it opened over nor anything global.
  useEffect(() => {
    if (!show) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();

        e.preventDefault();

        setShow(false);

        onHide?.();
      }
    };

    window.addEventListener('keydown', handler, true);

    return () => {
      window.removeEventListener('keydown', handler, true);
    };
  }, [show, onHide]);

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      rootClose
      // On a press, not a click: a drag released outside clicks outside too.
      rootCloseEvent="mousedown"
      show={show}
      onToggle={toggle}
      // In <body>, so a scrollable modal doesn't clip it and it can flip above.
      container={() => document.body}
      flip
      overlay={
        <Popover style={{ maxWidth: 'none' }}>
          <Popover.Body className={`p-2 ${classes.body}`}>
            {children}
          </Popover.Body>
        </Popover>
      }
    >
      <button
        type="button"
        className={`form-control${className ? ` ${className}` : ''}`}
        style={{
          cursor: 'pointer',
          height: 'calc(1.5em + 0.75rem + 2px)',
          padding: '0.375rem',
          ...style,
        }}
      >
        <div
          className="w-100 h-100 overflow-hidden"
          style={{
            ...(checker && CHECKER),
            borderRadius: 'var(--bs-border-radius-sm)',
          }}
        >
          <div className="w-100 h-100" style={{ background: swatch }} />
        </div>
      </button>
    </OverlayTrigger>
  );
}
