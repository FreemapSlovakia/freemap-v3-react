import { useMessages } from '@features/l10n/l10nInjector.js';
import { useButtonGroupFit } from '@shared/hooks/useButtonGroupFit.js';
import type { ReactElement } from 'react';
import { ButtonGroup, Form, ToggleButton } from 'react-bootstrap';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

export type CustomMapTechnology = 'tile' | 'maplibre' | 'wms';

export type CustomMapKind = CustomMapTechnology | 'combination';

const KINDS: CustomMapKind[] = ['tile', 'maplibre', 'wms', 'combination'];

type Props = {
  /** Any other value, such as a URL-only `parametricShading`, checks nothing. */
  value: string;
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

  // The labels are long enough that their joined group often can't fit the
  // form, and then it stacks rather than wrapping inside the buttons.
  const groupProps = useButtonGroupFit();

  const isCombination = value === 'combination';

  return (
    <Form.Group className="mt-3">
      <Form.Label className="d-block">{m?.mapLayers.technology}</Form.Label>

      <ButtonGroup {...groupProps}>
        {KINDS.map((kind) => (
          <ToggleButton
            key={kind}
            id={`tech-${kind}`}
            type="radio"
            name="technology"
            variant="outline-primary"
            value={kind}
            checked={value === kind}
            disabled={editing && (kind === 'combination') !== isCombination}
            onChange={() => onChange(kind)}
          >
            {kind === 'combination'
              ? msm?.combination
              : m?.mapLayers.technologies[kind]}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </Form.Group>
  );
}
