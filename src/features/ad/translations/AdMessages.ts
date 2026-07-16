import type { JSX, ReactNode } from 'react';

export type AdMessages = {
  self: (email: ReactNode) => JSX.Element;
  rovas: () => JSX.Element;
  zdilaAuthorship: () => JSX.Element;
  zdilaMapNative: () => JSX.Element;
};
