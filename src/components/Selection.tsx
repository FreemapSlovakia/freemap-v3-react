import { selectFeature } from 'fm3/actions/mainActions';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { ReactElement, ReactNode } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { DeleteButton } from './DeleteButton';
import { useMessages } from 'fm3/l10nInjector';

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

      <Card className="fm-toolbar mt-2 mx-2">
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
