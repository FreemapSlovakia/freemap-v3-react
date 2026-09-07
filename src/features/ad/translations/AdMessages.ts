import type { JSX } from 'react';

export type AdMessages = {
  self: {
    head: string;
    sub: string;
    /** Label of the button opening the "advertise with us" document. */
    cta: string;
  };
  rovas: () => JSX.Element;
  zdilaAuthorship: () => JSX.Element;
  zdilaMapNative: () => JSX.Element;
};
