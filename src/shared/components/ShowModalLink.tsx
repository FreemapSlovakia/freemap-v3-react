import { setActiveModal } from '@app/store/actions.js';
import { type ActiveModal, encodeActiveModal } from '@app/store/activeModal.js';
import type { MouseEvent, ReactNode } from 'react';
import { Anchor } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

type Props = {
  modal: ActiveModal;
  children: ReactNode;
};

export function ShowModalLink({ modal, children }: Props) {
  const dispatch = useDispatch();

  // Null for the two modals that name no id, which then render href-less.
  const show = encodeActiveModal(modal);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();

    dispatch(setActiveModal(modal));
  };

  return (
    <Anchor
      href={show === null ? undefined : `#show=${show}`}
      onClick={handleClick}
    >
      {children}
    </Anchor>
  );
}
