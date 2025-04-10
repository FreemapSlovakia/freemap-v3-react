import { Modifier, Obj } from '@popperjs/core';
import { UseDropdownMenuOptions } from '@restart/ui/DropdownMenu';

const positionFixerModifier: Modifier<'positionFixer', Obj> = {
  name: 'positionFixer',
  enabled: true,
  phase: 'main',
  fn({ state }) {
    if (state.rects.reference.x === 0 && state.rects.reference.x === 0) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scroll'));
      });
    }
  },
};

export const fixedPopperConfig: UseDropdownMenuOptions['popperConfig'] = {
  strategy: 'fixed',
  onFirstUpdate: () => {
    window.dispatchEvent(new CustomEvent('scroll'));
  },
  modifiers: [positionFixerModifier],
};
