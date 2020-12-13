import 'fm3/font/styles.css';
import { DetailedHTMLProps, HTMLAttributes, ReactElement } from 'react';

interface Props
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  icon: string;
  className?: string;
}

export function FontAwesomeIcon({ icon, ...props }: Props): ReactElement {
  return (
    <i
      {...props}
      className={`fa-fw fa ${
        icon.startsWith('!') ? icon.slice(1) : `fa-${icon}`
      } ${props.className ?? ''}`}
      aria-hidden="true"
    />
  );
}
