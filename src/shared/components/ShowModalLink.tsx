import { setActiveModal } from '@app/store/actions.js';
import { type ActiveModal, encodeActiveModal } from '@app/store/activeModal.js';
import type { ReactNode } from 'react';
import { Anchor } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { inAppLink } from '../inAppLink.js';

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

    return inAppLink(show === null ? undefined : `#show=${show}`, () =>
      dispatch(setActiveModal(modal)),
    );
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
