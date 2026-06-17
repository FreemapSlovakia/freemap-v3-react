import type { ReactElement, ReactNode } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

type Props = {
  children: ReactNode;
};

export function RovasLink({ children }: Props): ReactElement {
  return (
    <a href="https://rovas.app" target="_blank" rel="noopener noreferrer">
      {children} <FaExternalLinkAlt />
    </a>
  );
}
