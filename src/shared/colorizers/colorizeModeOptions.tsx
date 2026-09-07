import type { SelectDropdownOption } from '@shared/components/SelectDropdown.js';
import type { ReactNode } from 'react';
import { SteepnessScaleSlider } from './components/SteepnessScaleSlider.js';
import { type ColorizingMode, colorizingModeGroup } from './index.js';
import type { ColorizerMessages } from './translations/ColorizerMessages.js';

/**
 * The "Colorize by" options: the off row, then the given modes with a divider
 * wherever the group changes. The dividers are placed after filtering, so a
 * caller that leaves modes out gets no stray or doubled ones.
 */
export function colorizeModeOptions({
  modes,
  labels,
  activeMode,
  premiumColorize,
  isAvailable,
}: {
  modes: readonly ColorizingMode[];
  labels: ColorizerMessages['mode'] | undefined;
  activeMode: ColorizingMode | null | undefined;
  premiumColorize: (mode: ColorizingMode | undefined) => {
    locked: boolean;
    gem: ReactNode;
  };
  isAvailable?: (mode: ColorizingMode) => boolean;
}): SelectDropdownOption[] {
  return [undefined, ...modes].map((mode, i) => {
    const { locked, gem } = premiumColorize(mode);

    return {
      value: mode ?? 'none',
      label: labels?.[mode ?? 'none'],
      disabled: locked || (mode !== undefined && isAvailable?.(mode) === false),
      extra: gem,
      // The steepness scale belongs to its mode, so it sits under that row.
      after: mode === 'steepness' && <SteepnessScaleSlider mode={activeMode} />,
      divider:
        mode === undefined ||
        (i < modes.length &&
          colorizingModeGroup(modes[i]) !== colorizingModeGroup(mode)),
    };
  });
}
