import { selectFeature } from 'fm3/actions/mainActions';
import { ReactElement, ReactNode } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { DeleteButton } from './DeleteButton';

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

  return (
    <Card className="fm-toolbar">
      <ButtonToolbar>
        <span className="align-self-center ml-1">
          {icon}
          <span className="d-none d-sm-inline"> {title}</span> {children}
          {deletable && <DeleteButton />}{' '}
          <Button
            variant="light"
            // size="sm"
            onClick={() => dispatch(selectFeature(null))}
            title={
              // TODO m?.general.close +
              '[Esc]'
            }
          >
            <FaTimes />
          </Button>
        </span>
      </ButtonToolbar>
    </Card>
  );
}
