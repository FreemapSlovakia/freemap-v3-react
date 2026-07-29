import { detectOverflow, type Modifier, type Obj } from '@popperjs/core';
import type { UseDropdownMenuOptions } from '@restart/ui/DropdownMenu';

/**
 * Publishes the room between the menu's top edge and the viewport edge it opens
 * toward as `--fm-menu-available-height`. A menu with an in-menu scroller
 * (`.fm-menu-scroller`, i.e. every `FmDropdownMenu`) caps that scroller with
 * it; one without caps itself — see `.dropdown-menu` in `bootstrap-override.css`, which
 * `--fm-menu-scroll` gates so menus this modifier never positions keep growing
 * freely. Otherwise the height is a guessed constant, and a menu hanging off a
 * toolbar that sits low — a second or third stacked toolbar, a selection
 * toolbar — runs past the bottom of the screen.
 */
export const availableHeightModifier: Modifier<'availableHeight', Obj> = {
  name: 'availableHeight',
  enabled: true,
  phase: 'beforeWrite',
  requiresIfExists: ['offset', 'preventOverflow', 'flip'],
  fn({ state }) {
    // Keep a gap to the viewport edge that also covers the menu's own padding,
    // which sits outside the scroller the height lands on.
    const overflow = detectOverflow(state, { padding: 8 });

    const edge = state.placement.startsWith('top') ? 'top' : 'bottom';

    // The overflow is measured from the placed popper, so this cancels its
    // height out and leaves the free space at that spot — one pass, no
    // feedback loop with the height it goes on to constrain.
    const available = Math.max(48, state.rects.popper.height - overflow[edge]);

    state.elements.popper.style.setProperty(
      '--fm-menu-available-height',
      `${Math.round(available)}px`,
    );

    state.elements.popper.style.setProperty('--fm-menu-scroll', 'auto');
  },
};

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
  modifiers: [positionFixerModifier, availableHeightModifier],
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

/** `fixedPopperConfig` for a menu that must not be narrower than its toggle. */
export const sameMinWidthPopperConfig: UseDropdownMenuOptions['popperConfig'] =
  {
    ...fixedPopperConfig,
    modifiers: [
      positionFixerModifier,
      availableHeightModifier,
      sameMinWidthModifier,
    ],
  };
