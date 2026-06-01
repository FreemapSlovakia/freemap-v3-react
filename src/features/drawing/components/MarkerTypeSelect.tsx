import { useMessages } from '@features/l10n/l10nInjector.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
} from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaCircle, FaMapMarker, FaSquare } from 'react-icons/fa';
import classes from './MarkerTypeSelect.module.css';

const markerTypes: MarkerType[] = ['pin', 'ring', 'square'];

const icons: Record<MarkerType, ReactElement> = {
  pin: <FaMapMarker />,
  ring: <FaCircle />,
  square: <FaSquare />,
};

// toggle styled as a native-like <select> (border + caret) for use in forms.
// `.form-select` draws its own caret, so drop Bootstrap's `dropdown-toggle`
// class to avoid a second caret from its `::after`.
const SelectToggle = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'>
>(({ children, className, ...props }, ref) => {
  const extra = (className ?? '')
    .split(' ')
    .filter((c) => c && c !== 'dropdown-toggle')
    .join(' ');

  return (
    <button
      type="button"
      ref={ref}
      className={`form-select text-start ${classes['toggle']}${extra ? ` ${extra}` : ''}`}
      {...props}
    >
      {children}
    </button>
  );
});

SelectToggle.displayName = 'SelectToggle';

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
  const m = useMessages();

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
        {asSelect ? <> {m?.objects.icon[value]}</> : null}
      </Dropdown.Toggle>

      <Dropdown.Menu popperConfig={fixedPopperConfig}>
        {markerTypes.map((markerType) => (
          <Dropdown.Item
            key={markerType}
            eventKey={markerType}
            active={value === markerType}
          >
            {icons[markerType]} {m?.objects.icon[markerType]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
