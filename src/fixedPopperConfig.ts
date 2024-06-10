import { UseDropdownMenuOptions } from 'react-overlays/cjs/DropdownMenu';

export const fixedPopperConfig: UseDropdownMenuOptions['popperConfig'] = {
  strategy: 'fixed',
  onFirstUpdate: () => window.dispatchEvent(new CustomEvent('scroll')),
};
