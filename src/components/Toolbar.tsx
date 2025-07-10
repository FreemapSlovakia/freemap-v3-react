import { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { useLeftMarginAdjuster } from '../hooks/useLeftMarginAdjuster.js';

type Props = { children: ReactNode; className?: string };

export function Toolbar({ children, className }: Props) {
  const ref = useLeftMarginAdjuster();

  return (
    <Card ref={ref} className={`fm-toolbar ${className}`}>
      {children}
    </Card>
  );
}
