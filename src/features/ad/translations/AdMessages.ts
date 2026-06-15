import type { JSX, ReactNode } from 'react';

export type AdMessages = {
  self: (email: ReactNode) => JSX.Element;
};
