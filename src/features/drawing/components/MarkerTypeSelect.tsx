import type { MarkerType } from '@features/objects/model/actions.js';
import { useObjectsMessages } from '@features/objects/translations/useObjectsMessages.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { type ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
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
  className?: string;
};

export function MarkerTypeSelect({
  value,
  onChange,
  asSelect,
  className,
}: Props): ReactElement {
  const om = useObjectsMessages();

  return (
    <Dropdown
      className={className}
      onSelect={(eventKey) => onChange(eventKey as MarkerType)}
    >
      <Dropdown.Toggle
        as={asSelect ? SelectToggle : undefined}
        variant={asSelect ? undefined : 'secondary'}
      >
        {icons[value]}
        {asSelect ? <> {om?.icon[value]}</> : null}
      </Dropdown.Toggle>

      <Dropdown.Menu popperConfig={fixedPopperConfig}>
        {markerTypes.map((markerType) => (
          <Dropdown.Item
            key={markerType}
            eventKey={markerType}
            active={value === markerType}
          >
            {icons[markerType]} {om?.icon[markerType]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
