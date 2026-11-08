import { createContext } from 'react';

/** Where a page of the Map layers panel puts actions that must stay in view. */
export const PanelHeaderSlotContext = createContext<HTMLElement | null>(null);

/**
 * Under the header, where a page puts a toolbar too wide for its line, as a
 * list's search and sort: it stays put while the page scrolls.
 */
export const PanelToolbarSlotContext = createContext<HTMLElement | null>(null);
