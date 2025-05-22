import { type ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar, Card } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { selectFeature } from '../actions/mainActions.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { DeleteButton } from './DeleteButton.js';

export function Selection({
  title,
  icon,
  deletable,
  children,
}: {
  title?: string;
  icon: ReactElement;
  deletable?: boolean;
  children?: ReactNode;
}): ReactElement {
  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Card className="fm-toolbar mx-2 mt-2">
        <ButtonToolbar>
          <span className="align-self-center ms-1">
            {icon}

            <span className="d-none d-sm-inline"> {title}</span>
          </span>

          {children}

          {deletable && <DeleteButton />}

          <Button
            variant="secondary"
            className="ms-1"
            onClick={() => dispatch(selectFeature(null))}
            title={m?.general.close + ' [Esc]'}
          >
            <FaTimes />
          </Button>
        </ButtonToolbar>
      </Card>
    </div>
  );
}
