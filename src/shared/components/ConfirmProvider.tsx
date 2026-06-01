import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import classes from './ConfirmProvider.module.css';

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
   * Icon shown before the title. Defaults to a warning triangle when
   * `confirmStyle` is `danger`, and to nothing otherwise.
   */
  icon?: ReactNode;
};

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));

/**
 * Returns an imperative `confirm()` that opens a styled, i18n-aware
 * confirmation modal and resolves to `true`/`false`. Because the dialog blocks
 * interaction while open, no global (redux) state is needed.
 */
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
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
  const resolveRef = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options = {}) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current?.(false); // resolve any previous (defensive)

        resolveRef.current = resolve;

        setOptions(options);

        setShow(true);
      }),
    [],
  );

  const close = useCallback((result: boolean) => {
    resolveRef.current?.(result);

    resolveRef.current = null;

    setShow(false);
  }, []);

  const icon =
    options.icon ??
    (options.confirmStyle === 'danger' ? (
      <FaExclamationTriangle className="text-warning" />
    ) : null);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Modal
        show={show}
        onHide={() => close(false)}
        className={classes['modal']}
        backdropClassName={classes['backdrop']}
        size="sm"
        centered
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
            onClick={() => close(true)}
          >
            <FaCheck /> {options.confirmLabel ?? m?.general.ok}
          </Button>

          <Button variant="secondary" onClick={() => close(false)}>
            <FaTimes /> {options.cancelLabel ?? m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Modal>
    </ConfirmContext.Provider>
  );
}
