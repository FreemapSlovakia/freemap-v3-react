import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import classes from './ModalProvider.module.css';

/** Which button the user pressed (or `'cancel'` for Escape/backdrop/dismiss). */
export type ModalResult = 'confirm' | 'extra' | 'cancel';

export interface ModalBodyProps<T> {
  value: T;
  setValue: (value: T) => void;
  /** Answers as the confirm button does — what a field submitting on Enter calls. */
  submit: () => void;
}

export type ModalOptions<T = void> = {
  /** Dialog title; defaults to the localized "Confirmation". */
  title?: ReactNode;
  /** Optional body shown below the title. */
  message?: ReactNode;
  /**
   * The part that asks for a value, shown below `message`. Rendered as a
   * component of its own, so it may hold hooks and state.
   */
  body?: ComponentType<ModalBodyProps<T>>;
  /** What `body` starts with, and what the dialog answers with without one. */
  initialValue?: T;
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
  /** Modal width; a plain question gets `sm`, and `md` is Bootstrap's default. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export interface ModalAnswer<T> {
  result: ModalResult;
  /** What `body` last set, or `initialValue` where there is no body. */
  value: T;
}

export type ModalFn = <T>(options: ModalOptions<T>) => Promise<ModalAnswer<T>>;

export type ConfirmFn = (options?: ModalOptions) => Promise<boolean>;

/** Like {@link ConfirmFn} but resolves to which button was pressed. */
export type ConfirmChoiceFn = (options?: ModalOptions) => Promise<ModalResult>;

type Handle = {
  open: (options: ModalOptions<unknown>) => Promise<ModalAnswer<unknown>>;
  cancel: () => void;
};

// A module-level handle rather than a context: the dialog is also opened from
// processors, which have no React tree to read one from.
let handle: Handle | null = null;

/**
 * Opens the dialog and resolves to the button pressed and the value its body
 * ended on. For components prefer {@link useModal}, which also closes the
 * dialog if the caller goes away while it is open.
 */
export function openModal<T>(
  options: ModalOptions<T>,
): Promise<ModalAnswer<T>> {
  return (handle?.open(options as ModalOptions<unknown>) ??
    Promise.resolve({
      result: 'cancel',
      value: options.initialValue,
    })) as Promise<ModalAnswer<T>>;
}

/**
 * Returns an imperative dialog opener. Because the dialog blocks interaction
 * while open, no global (redux) state is needed.
 *
 * If the calling component unmounts while its dialog is still open, the dialog
 * is closed and the pending promise resolves to `'cancel'`.
 */
export function useModal(): ModalFn {
  // true while this component's own dialog is still awaiting an answer
  const pendingRef = useRef(false);

  useEffect(
    () => () => {
      if (pendingRef.current) {
        handle?.cancel();
      }
    },
    [],
  );

  return useCallback(<T,>(options: ModalOptions<T>) => {
    pendingRef.current = true;

    return openModal(options).finally(() => {
      pendingRef.current = false;
    });
  }, []);
}

/**
 * Returns an imperative opener for a plain question that resolves to which
 * button was pressed (`'confirm'`, `'extra'`, or `'cancel'`). Set the
 * `extraLabel` option to show the third button.
 */
export function useConfirmChoice(): ConfirmChoiceFn {
  const open = useModal();

  return useCallback(
    (options = {}) => open(options).then((answer) => answer.result),
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

/**
 * Returns a function that cancels the currently open dialog (resolving its
 * pending promise to `'cancel'`, which {@link useConfirm} reports as `false`).
 * Useful when an in-dialog control needs to dismiss the dialog itself — e.g. a
 * link that opens another modal which would otherwise sit beneath it.
 */
export function useConfirmCancel(): () => void {
  return useCallback(() => {
    handle?.cancel();
  }, []);
}

export function ModalProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const m = useMessages();

  // current options drive the rendering; kept across the fade-out animation
  const [options, setOptions] = useState<ModalOptions<unknown>>({});

  const [value, setValue] = useState<unknown>(undefined);

  const [show, setShow] = useState(false);

  // resolver of the in-flight promise, outside render so updaters stay pure
  const resolveRef = useRef<((answer: ModalAnswer<unknown>) => void) | null>(
    null,
  );

  // The body sets the value between renders, and `close` has to read the last
  // one it set, not the one this render closed over.
  const valueRef = useRef<unknown>(undefined);

  const updateValue = useCallback((next: unknown) => {
    valueRef.current = next;

    setValue(next);
  }, []);

  const close = useCallback((result: ModalResult) => {
    resolveRef.current?.({ result, value: valueRef.current });

    resolveRef.current = null;

    setShow(false);
  }, []);

  const open = useCallback(
    (options: ModalOptions<unknown>) =>
      new Promise<ModalAnswer<unknown>>((resolve) => {
        // One dialog at a time: opening a second cancels whatever was waiting,
        // so a caller that leaves one open loses it to the next.
        resolveRef.current?.({ result: 'cancel', value: valueRef.current });

        resolveRef.current = resolve;

        valueRef.current = options.initialValue;

        setOptions(options);

        setValue(options.initialValue);

        setShow(true);
      }),
    [],
  );

  const cancel = useCallback(() => close('cancel'), [close]);

  // Published during render, not only from the effect: a child's own mount
  // effect runs before the provider's would, and would find nothing to open.
  handle = { open, cancel };

  // Published again on setup, not just cleared on teardown: StrictMode runs
  // cleanup and setup back to back without re-rendering, so publishing in only
  // one of the two would leave every dialog resolving to `cancel`.
  useEffect(() => {
    handle = { open, cancel };

    return () => {
      // Only if a later provider hasn't taken over, or this would unpublish it.
      if (handle?.open === open) {
        handle = null;
      }
    };
  }, [open, cancel]);

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

  const Body = options.body;

  const size = options.size ?? 'sm';

  return (
    <>
      {children}

      <Modal
        show={show}
        onHide={() => close('cancel')}
        className={classes.modal}
        backdropClassName={classes.backdrop}
        size={size === 'md' ? undefined : size}
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

        {(options.message !== undefined || Body) && (
          <Modal.Body>
            {options.message}

            {Body && (
              <Body
                value={value}
                setValue={updateValue}
                submit={() => close('confirm')}
              />
            )}
          </Modal.Body>
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
    </>
  );
}
