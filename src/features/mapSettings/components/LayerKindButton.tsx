import { useMessages } from '@features/l10n/l10nInjector.js';
import type { LayerKind } from '@features/map/model/layerKind.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  LAYER_KIND_ICONS,
  LayerKindMark,
} from '@shared/components/MapLayerItem.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';

type Props = {
  value: LayerKind;
  /** Unset, the kind is only shown: the map can't switch. */
  onChange?: (kind: LayerKind) => void;
};

/** A map's kind, beside its opacity; a menu switching it where it may switch. */
export function LayerKindButton({ value, onChange }: Props): ReactElement {
  const m = useMessages();

  if (!onChange) {
    return <LayerKindMark kind={value} />;
  }

  return (
    <Dropdown onSelect={(kind) => onChange(kind as LayerKind)}>
      <LongPressTooltip
        label={m && `${m.mapLayers.layer.layer}: ${m.mapLayers.layer[value]}`}
      >
        {({ props }) => (
          // A square as big as the opacity swatch beside it, which is 1.5em of
          // the row's font, i.e. spacer 4; `sm`'s smaller font would shrink an em.
          <Dropdown.Toggle
            bsPrefix="fm-dropdown-toggle-nocaret"
            variant="secondary"
            size="sm"
            className="p-0 d-inline-flex align-items-center justify-content-center"
            style={{ width: 'var(--fm-space-4)', height: 'var(--fm-space-4)' }}
            {...props}
          >
            {LAYER_KIND_ICONS[value]}
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        {(['base', 'overlay'] as const).map((kind) => (
          <Dropdown.Item
            key={kind}
            as="button"
            eventKey={kind}
            active={kind === value}
          >
            {LAYER_KIND_ICONS[kind]} {m?.mapLayers.layer[kind]}
          </Dropdown.Item>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );
}
