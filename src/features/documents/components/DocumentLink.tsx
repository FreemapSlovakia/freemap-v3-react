import { MouseEvent, ReactNode, useCallback } from 'react';
import { Anchor } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { documentShow } from '../model/actions.js';

type Props = {
  doc: string;
  children: ReactNode;
};

export function DocumentLink({ doc, children }: Props) {
  const dispatch = useDispatch();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      dispatch(documentShow(doc));
    },
    [dispatch, doc],
  );

  return (
    <Anchor href={'#document=' + doc} onClick={handleClick}>
      {children}
    </Anchor>
  );
}
