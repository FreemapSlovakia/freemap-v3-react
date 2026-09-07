import { setActiveModal } from '@app/store/actions.js';
import { type ActiveModal, encodeActiveModal } from '@app/store/activeModal.js';
import type { MouseEvent, ReactNode } from 'react';
import { Anchor } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

/**
 * Builds the `href`/`onClick` pair that opens a modal in-page. A factory
 * rather than a hook taking the modal, so conditionally rendered items can
 * each get their own props without a conditional hook call.
 */
export function useModalLink() {
  const dispatch = useDispatch();

  return (modal: ActiveModal) => {
    // Null for the two modals that name no id; react-bootstrap then renders
    // them as `href="#"` with role=button.
    const show = encodeActiveModal(modal);

    return {
      href: show === null ? undefined : `#show=${show}`,
      onClick: (e: MouseEvent) => {
        e.preventDefault();

        dispatch(setActiveModal(modal));
      },
    };
  };
}

type Props = {
  modal: ActiveModal;
  children: ReactNode;
};

export function ShowModalLink({ modal, children }: Props) {
  const modalLink = useModalLink();

  return <Anchor {...modalLink(modal)}>{children}</Anchor>;
}
