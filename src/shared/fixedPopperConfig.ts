import type { Modifier, Obj } from '@popperjs/core';
import type { UseDropdownMenuOptions } from '@restart/ui/DropdownMenu';

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

// makes the dropdown menu at least as wide as its toggle
const sameMinWidthModifier: Modifier<'sameMinWidth', Obj> = {
  name: 'sameMinWidth',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn({ state }) {
    state.styles['popper']!.minWidth = `${state.rects.reference.width}px`;
  },
  effect({ state }) {
    state.elements['popper'].style.minWidth = `${
      (state.elements['reference'] as HTMLElement).offsetWidth
    }px`;
  },
};

export const sameMinWidthPopperConfig: UseDropdownMenuOptions['popperConfig'] =
  {
    modifiers: [sameMinWidthModifier],
  };
