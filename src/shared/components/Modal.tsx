import { askBeforeClosing } from '@shared/modalCloseGuard.js';
import type { ComponentProps, ReactElement } from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';

type Props = ComponentProps<typeof BootstrapModal>;

function GuardedModal({ onHide, ...props }: Props): ReactElement {
  return (
    <BootstrapModal
      {...props}
      onHide={onHide && (() => askBeforeClosing(() => onHide()))}
    />
  );
}

/**
 * react-bootstrap's `Modal` whose ×, Escape and backdrop ask before losing a
 * form being edited (`useDirtyForm`). Not for the question itself.
 */
export const Modal = Object.assign(GuardedModal, {
  Header: BootstrapModal.Header,
  Title: BootstrapModal.Title,
  Body: BootstrapModal.Body,
  Footer: BootstrapModal.Footer,
  Dialog: BootstrapModal.Dialog,
});
