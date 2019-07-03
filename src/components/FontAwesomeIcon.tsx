import React from 'react';
import 'fm3/font/styles.css';

interface IProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  icon: string;
  className?: string;
}

const FontAwesomeIcon: React.FC<IProps> = ({ icon, ...props }) => {
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
