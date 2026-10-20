import { useMessages } from '@features/l10n/l10nInjector.js';
import { CUSTOM_MAP_ICONS } from '@shared/components/CustomMapGlyph.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import type { IsCustomLayerTechnologiesDef } from '@shared/mapDefinitions.js';
import type { ReactElement } from 'react';
import { Dropdown, Form } from 'react-bootstrap';

export type CustomMapTechnology = IsCustomLayerTechnologiesDef['technology'];

const TECHNOLOGIES: CustomMapTechnology[] = ['tile', 'maplibre', 'wms'];

type Props = {
  value: CustomMapTechnology;
  onChange: (technology: CustomMapTechnology) => void;
};

/** What kind of server a custom map is. */
export function CustomMapTypeField({ value, onChange }: Props): ReactElement {
  const m = useMessages();

  return (
    <Form.Group className="mt-3">
      <Form.Label>{m?.mapLayers.technology}</Form.Label>

      <Dropdown
        onSelect={(technology) =>
          technology && onChange(technology as CustomMapTechnology)
        }
      >
        <Dropdown.Toggle as={SelectToggle} className="w-100">
          {CUSTOM_MAP_ICONS[value]} {m?.mapLayers.technologies[value]}
        </Dropdown.Toggle>

        <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
          {TECHNOLOGIES.map((technology) => (
            <Dropdown.Item
              as="button"
              type="button"
              key={technology}
              eventKey={technology}
              active={value === technology}
            >
              {CUSTOM_MAP_ICONS[technology]}
              <MenuLabel>{m?.mapLayers.technologies[technology]}</MenuLabel>
            </Dropdown.Item>
          ))}
        </FmDropdownMenu>
      </Dropdown>
    </Form.Group>
  );
}
