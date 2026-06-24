import { setActiveModal } from '@app/store/actions.js';
import { ModalId, modalOf } from '@app/store/activeModal.js';
import { MouseEvent, ReactNode, useCallback } from 'react';
import { Anchor } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

type Props = {
  modal: ModalId;
  children: ReactNode;
};

export function ShowModalLink({ modal, children }: Props) {
  const dispatch = useDispatch();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      dispatch(setActiveModal(modalOf(modal)));
    },
    [dispatch, modal],
  );

  return (
    <Anchor href={'#show=' + modal} onClick={handleClick}>
      {children}
    </Anchor>
  );
}
