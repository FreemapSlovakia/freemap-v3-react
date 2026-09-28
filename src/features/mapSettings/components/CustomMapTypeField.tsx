import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import type { ReactElement } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { FaDrawPolygon, FaServer, FaTh } from 'react-icons/fa';
import { GiHills } from 'react-icons/gi';
import { MdFormatColorFill } from 'react-icons/md';
import { TbStack2 } from 'react-icons/tb';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

export type CustomMapTechnology =
  | 'tile'
  | 'maplibre'
  | 'wms'
  | 'parametricShading'
  | 'color';

export type CustomMapKind = CustomMapTechnology | 'combination';

const TECHNOLOGIES: CustomMapTechnology[] = [
  'tile',
  'maplibre',
  'wms',
  'parametricShading',
  'color',
];

const ICONS: Record<CustomMapKind, ReactElement> = {
  tile: <FaTh />,
  maplibre: <FaDrawPolygon />,
  wms: <FaServer />,
  parametricShading: <GiHills />,
  color: <MdFormatColorFill />,
  combination: <TbStack2 />,
};

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
      {ICONS[kind]}{' '}
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
