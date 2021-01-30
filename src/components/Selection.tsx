import { ReactElement, ReactNode } from 'react';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import { DeleteButton } from './DeleteButton';
import { FontAwesomeIcon } from './FontAwesomeIcon';

export function Selection({
  title,
  icon,
  deletable,
  children,
}: {
  title?: string;
  icon: string;
  deletable?: boolean;
  children?: ReactNode;
}): ReactElement {
  return (
    <Card className="fm-toolbar">
      <ButtonToolbar>
        <span className="align-self-center ml-1 mr-2">
          <FontAwesomeIcon icon="mouse-pointer" />
          {'/ '}
          <FontAwesomeIcon icon={icon} />
          <span className="d-none d-sm-inline"> {title}</span>
          {children}

          {deletable && <DeleteButton />}
        </span>
      </ButtonToolbar>
    </Card>
  );
}
