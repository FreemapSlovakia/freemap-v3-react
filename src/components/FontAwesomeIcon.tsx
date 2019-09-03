import React from 'react';
import 'fm3/font/styles.css';

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  icon: string;
  className?: string;
}

const FontAwesomeIcon: React.FC<Props> = ({ icon, ...props }) => {
  return (
    <i
      {...props}
      className={`fa-fw fa ${
        icon.startsWith('!') ? icon.slice(1) : `fa-${icon}`
      } ${props.className || ''}`}
      aria-hidden="true"
    />
  );
};

export default FontAwesomeIcon;
