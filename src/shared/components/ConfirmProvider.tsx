import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import classes from './ConfirmProvider.module.css';

/** Which button the user pressed (or `'cancel'` for Escape/backdrop/dismiss). */
export type ConfirmResult = 'confirm' | 'extra' | 'cancel';

export type ConfirmOptions = {
  /** Dialog title; defaults to the localized "Confirmation". */
  title?: ReactNode;
  /** Optional body shown below the title. */
  message?: ReactNode;
  /** Confirm button label; defaults to the localized "OK". */
  confirmLabel?: ReactNode;
  /** Cancel button label; defaults to the localized "Cancel". */
  cancelLabel?: ReactNode;
  /** Bootstrap variant for the confirm button; defaults to `primary`. */
  confirmStyle?: string;
  /**
   * Optional third button shown between confirm and cancel. When set, the
   * dialog can resolve to `'extra'` (see {@link useConfirmChoice}); plain
   * {@link useConfirm} treats it the same as cancel.
   */
  extraLabel?: ReactNode;
  /** Bootstrap variant for the extra button; defaults to `secondary`. */
  extraStyle?: string;
  /**
   * Icon shown before the title. Defaults to a warning triangle when
   * `confirmStyle` is `danger`, and to nothing otherwise.
   */
  icon?: ReactNode;
};

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

/** Like {@link ConfirmFn} but resolves to which button was pressed. */
export type ConfirmChoiceFn = (
  options?: ConfirmOptions,
) => Promise<ConfirmResult>;

type ConfirmContextValue = {
  /** Opens the dialog and resolves to the user's choice. */
  open: ConfirmChoiceFn;
  /** Resolves the in-flight call to `'cancel'` and hides the dialog. */
  cancel: () => void;
};

const ConfirmContext = createContext<ConfirmContextValue>({
  open: () => Promise.resolve('cancel'),
  cancel: () => {},
});

/**
 * Returns an imperative dialog opener that resolves to which button was pressed
 * (`'confirm'`, `'extra'`, or `'cancel'`). Set the `extraLabel` option to show
 * the third button. Because the dialog blocks interaction while open, no global
 * (redux) state is needed.
 *
 * If the calling component unmounts while its dialog is still open, the dialog
 * is closed and the pending promise resolves to `'cancel'`.
 */
export function useConfirmChoice(): ConfirmChoiceFn {
  const { open, cancel } = useContext(ConfirmContext);

  // true while this component's own dialog is still awaiting an answer
  const pendingRef = useRef(false);

  useEffect(
    () => () => {
      if (pendingRef.current) {
        cancel();
      }
    },
    [cancel],
  );

  return useCallback<ConfirmChoiceFn>(
    (options) => {
      pendingRef.current = true;

      return open(options).finally(() => {
        pendingRef.current = false;
      });
    },
    [open],
  );
}

/**
 * Returns an imperative `confirm()` that opens a styled, i18n-aware
 * confirmation modal and resolves to `true`/`false` (anything but the confirm
 * button is `false`).
 */
export function useConfirm(): ConfirmFn {
  const choose = useConfirmChoice();

  return useCallback<ConfirmFn>(
    (options) => choose(options).then((result) => result === 'confirm'),
    [choose],
  );
}

export function ConfirmProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const m = useMessages();

  // current options drive the rendering; kept across the fade-out animation
  const [options, setOptions] = useState<ConfirmOptions>({});

  const [show, setShow] = useState(false);

  // resolver of the in-flight promise, outside render so updaters stay pure
  const resolveRef = useRef<((result: ConfirmResult) => void) | null>(null);

  const close = useCallback((result: ConfirmResult) => {
    resolveRef.current?.(result);

    resolveRef.current = null;

    setShow(false);
  }, []);

  const open = useCallback<ConfirmChoiceFn>(
    (options = {}) =>
      new Promise<ConfirmResult>((resolve) => {
        resolveRef.current?.('cancel'); // resolve any previous (defensive)

        resolveRef.current = resolve;

        setOptions(options);

        setShow(true);
      }),
    [],
  );

  const cancel = useCallback(() => close('cancel'), [close]);

  const value = useMemo<ConfirmContextValue>(
    () => ({ open, cancel }),
    [open, cancel],
  );

  // Behave like a real modal: while open, keep every key except Tab/Enter
  // (focus navigation and activating the focused button) from reaching the
  // app's global keyboard shortcuts. These are registered on `document`/
  // `window` in the bubble phase, so a capture-phase listener intercepts them
  // first. Escape is handled here too (instead of letting react-bootstrap's
  // own document listener close the modal) so it ONLY dismisses the dialog and
  // doesn't also trigger the global Escape handler (which would clear a
  // background selection/tool).
  useEffect(() => {
    if (!show) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        return;
      }

      e.stopPropagation();

      if (e.key === 'Escape') {
        e.preventDefault();

        close('cancel');
      }
    };

    document.addEventListener('keydown', handler, true);

    return () => {
      document.removeEventListener('keydown', handler, true);
    };
  }, [show, close]);

  const icon =
    options.icon ??
    (options.confirmStyle === 'danger' ? (
      <FaExclamationTriangle className="text-warning" />
    ) : null);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Modal
        show={show}
        onHide={() => close('cancel')}
        className={classes.modal}
        backdropClassName={classes.backdrop}
        size="sm"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {icon}
            {icon && ' '}
            {options.title ?? m?.general.confirmation}
          </Modal.Title>
        </Modal.Header>

        {options.message !== undefined && (
          <Modal.Body>{options.message}</Modal.Body>
        )}

        <Modal.Footer>
          <Button
            variant={options.confirmStyle ?? 'primary'}
            onClick={() => close('confirm')}
          >
            <FaCheck /> {options.confirmLabel ?? m?.general.ok}
          </Button>

          {options.extraLabel !== undefined && (
            <Button
              variant={options.extraStyle ?? 'secondary'}
              onClick={() => close('extra')}
            >
              {options.extraLabel}
            </Button>
          )}

          <Button variant="dark" onClick={() => close('cancel')}>
            <FaTimes /> {options.cancelLabel ?? m?.general.cancel}{' '}
            <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Modal>
    </ConfirmContext.Provider>
  );
}
