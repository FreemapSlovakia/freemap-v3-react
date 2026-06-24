import type { MarkerType } from '@features/objects/model/actions.js';
import { useObjectsMessages } from '@features/objects/translations/useObjectsMessages.js';
import type { Breakpoint } from '@shared/breakpoints.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { type ReactElement } from 'react';
import { FaCircle, FaMapMarker, FaSquare } from 'react-icons/fa';

const markerTypes: MarkerType[] = ['pin', 'ring', 'square'];

const icons: Record<MarkerType, ReactElement> = {
  pin: <FaMapMarker />,
  ring: <FaCircle />,
  square: <FaSquare />,
};

type Props = {
  value: MarkerType;
  onChange: (markerType: MarkerType) => void;
  /** Render as a native-like select with a visible label (e.g. in forms). */
  asSelect?: boolean;
  /** Below this breakpoint the shape name collapses into the tooltip. */
  breakpoint?: Breakpoint;
  className?: string;
};

export function MarkerTypeSelect({
  value,
  onChange,
  asSelect,
  breakpoint,
  className,
}: Props): ReactElement {
  const om = useObjectsMessages();

  return (
    <SelectDropdown
      className={className}
      asSelect={asSelect}
      breakpoint={breakpoint}
      name={om?.markerShape}
      value={value}
      onSelect={(markerType) => onChange(markerType as MarkerType)}
      options={markerTypes.map((markerType) => ({
        value: markerType,
        label: om?.icon[markerType],
        icon: icons[markerType],
      }))}
    />
  );
}
