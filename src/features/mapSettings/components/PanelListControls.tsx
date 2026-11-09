import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { Fragment, type ReactElement, type ReactNode, useContext } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { PanelToolbarSlotContext } from '../panelHeaderSlot.js';

/** In the panel's toolbar, staying put while the list scrolls; in place outside the panel. */
export function PanelToolbar({ children }: { children: ReactNode }): ReactNode {
  const slot = useContext(PanelToolbarSlotContext);

  return slot ? createPortal(children, slot) : children;
}

export function ListSearch({
  value,
  onChange,
  placeholder,
  onSearchStart,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string | undefined;
  /** Called once per search, not per keystroke. */
  onSearchStart?: () => void;
}): ReactElement {
  return (
    <Form.Control
      type="search"
      size="sm"
      className="mb-2"
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        const next = e.currentTarget.value;

        if (!value.trim() && next.trim()) {
          onSearchStart?.();
        }

        onChange(next);
      }}
    />
  );
}

export type ListSortOption<S extends string = string> = {
  id: S;
  label: ReactNode;
  icon: ReactElement;
  disabled?: boolean;
  /** A divider above it, opening a group of its own. */
  divided?: boolean;
};

export function ListSortDropdown<S extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly ListSortOption<S>[];
  value: S;
  /** Not called for the current one, as a select's change isn't. */
  onChange: (id: S) => void;
}): ReactElement {
  const current = options.find((option) => option.id === value);

  return (
    <Dropdown
      className="flex-grow-1 min-w-0"
      onSelect={(key) => {
        const next = options.find((option) => option.id === key);

        if (next && next.id !== value) {
          onChange(next.id);
        }
      }}
    >
      <Dropdown.Toggle
        as={SelectToggle}
        className="form-select-sm w-100 d-flex align-items-center gap-2"
      >
        {current?.icon}
        <MenuLabel>{current?.label}</MenuLabel>
      </Dropdown.Toggle>

      <FmDropdownMenu>
        {options.map((option) => (
          <Fragment key={option.id}>
            {option.divided && <Dropdown.Divider />}

            <Dropdown.Item
              as="button"
              type="button"
              eventKey={option.id}
              active={option.id === value}
              disabled={option.disabled}
            >
              {option.icon}
              <MenuLabel>{option.label}</MenuLabel>
            </Dropdown.Item>
          </Fragment>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );
}
