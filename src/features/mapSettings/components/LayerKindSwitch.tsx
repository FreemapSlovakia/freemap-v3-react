import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapLayerSetupChange,
  type SetupTarget,
} from '@features/map/model/actions.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import { LAYER_KIND_ICONS } from '@shared/components/MapLayerItem.js';
import type { CSSProperties, ReactElement } from 'react';
import { ToggleButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTargetDef } from '../layerTarget.js';

type Props = {
  /** A library map that `canSwitchKind`, on its own or in a preset. */
  target: SetupTarget;
  className?: string;
  style?: CSSProperties;
};

/** Switches a library map between base map and overlay. */
export function LayerKindSwitch({
  target,
  className,
  style,
}: Props): ReactElement {
  const m = useMessages();

  const kind = useTargetDef(target)?.layer;

  const dispatch = useDispatch();

  const name = `kind-${target.preset ?? ''}-${target.type}`;

  return (
    <FitToggleButtonGroup
      type="radio"
      name={name}
      className={className}
      style={style}
      value={kind}
      onChange={(kind) =>
        dispatch(mapLayerSetupChange({ ...target, setup: { kind } }))
      }
    >
      {(['base', 'overlay'] as const).map((value) => (
        <ToggleButton
          key={value}
          id={`${name}-${value}`}
          value={value}
          variant="outline-primary"
          className="flex-grow-1 text-nowrap"
        >
          {LAYER_KIND_ICONS[value]} {m?.mapLayers.layer[value]}
        </ToggleButton>
      ))}
    </FitToggleButtonGroup>
  );
}
