import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  CUSTOM_MAP_ICONS,
  type CustomMapKind,
} from '@shared/components/CustomMapGlyph.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import type { IsCustomLayerTechnologiesDef } from '@shared/mapDefinitions.js';
import type { ReactElement } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

export type CustomMapTechnology = IsCustomLayerTechnologiesDef['technology'];

const TECHNOLOGIES: CustomMapTechnology[] = [
  'tile',
  'maplibre',
  'wms',
  'parametricShading',
  'color',
];

type Props = {
  value: CustomMapKind;
  onChange: (kind: CustomMapKind) => void;
  /** An existing map can't turn into a combination or back: they're stored apart. */
  editing: boolean;
};

export function CustomMapTypeField({
  value,
  onChange,
  editing,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const isCombination = value === 'combination';

  const label = (kind: CustomMapKind) => (
    <>
      {CUSTOM_MAP_ICONS[kind]}{' '}
      {kind === 'combination'
        ? msm?.combination
        : m?.mapLayers.technologies[kind]}
    </>
  );

  return (
    <Form.Group className="mt-3">
      <Form.Label>{m?.mapLayers.technology}</Form.Label>

      <Dropdown onSelect={(kind) => kind && onChange(kind as CustomMapKind)}>
        <Dropdown.Toggle as={SelectToggle} className="w-100">
          {label(value)}
        </Dropdown.Toggle>

        <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
          {TECHNOLOGIES.map((kind) => (
            <Dropdown.Item
              as="button"
              type="button"
              key={kind}
              eventKey={kind}
              active={value === kind}
              disabled={editing && isCombination}
            >
              {label(kind)}
            </Dropdown.Item>
          ))}

          <Dropdown.Divider />

          <Dropdown.Item
            as="button"
            type="button"
            eventKey="combination"
            active={isCombination}
            disabled={editing && !isCombination}
          >
            {label('combination')}
          </Dropdown.Item>
        </FmDropdownMenu>
      </Dropdown>
    </Form.Group>
  );
}
