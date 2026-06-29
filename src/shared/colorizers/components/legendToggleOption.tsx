import type { ColorizingMode } from '@shared/colorizers/index.js';
import type { SelectDropdownOption } from '@shared/components/SelectDropdown.js';
import type { ReactNode } from 'react';
import { FaRegCheckSquare, FaRegSquare } from 'react-icons/fa';

/** Sentinel value for the legend-toggle option inside a colorize SelectDropdown. */
export const LEGEND_ITEM = 'colorize-legend';

/**
 * Leading checkbox-style option that toggles the colorization legend, set off by
 * a divider — shown only while a colorize mode is active. The host
 * SelectDropdown's `onSelect` must intercept {@link LEGEND_ITEM} and toggle the
 * legend instead of changing the mode.
 */
export function legendToggleOption(
  activeMode: ColorizingMode | null | undefined,
  legendShown: boolean,
  label: ReactNode,
): SelectDropdownOption[] {
  return activeMode
    ? [
        {
          value: LEGEND_ITEM,
          label,
          icon: legendShown ? <FaRegCheckSquare /> : <FaRegSquare />,
          divider: true,
        },
      ]
    : [];
}
