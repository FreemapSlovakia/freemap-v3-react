import { createContext, useContext } from 'react';

// Shared dispatcher for menus driven by useMenuHandler. Provided by the menu
// owner (e.g. MainMenuButton) at the top of the Mantine Menu tree, consumed by
// nested submenu components so they can route eventKey-based actions back to
// the parent's handleSelect without prop-drilling.
export const MenuSelectContext = createContext<(eventKey: string) => void>(
  () => {},
);

export function useMenuSelect(): (eventKey: string) => void {
  return useContext(MenuSelectContext);
}
