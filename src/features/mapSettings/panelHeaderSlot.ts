import { createContext } from 'react';

/** Where a page of the Map layers panel puts actions that must stay in view. */
export const PanelHeaderSlotContext = createContext<HTMLElement | null>(null);
