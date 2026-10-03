import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapSetLayerKind } from '@features/map/model/actions.js';
import { libraryIndexByIdSelector } from '@features/mapLibrary/model/selectors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { CSSProperties, ReactElement } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

type Props = {
  /** A library map that `canSwitchKind`. */
  type: string;
  className?: string;
  style?: CSSProperties;
};

/** Switches a library map between base map and overlay. */
export function LayerKindSwitch({
  type,
  className,
  style,
}: Props): ReactElement {
  const m = useMessages();

  const kind = useAppSelector(
    (state) => libraryIndexByIdSelector(state)[type]?.layer,
  );

  const dispatch = useDispatch();

  return (
    <ToggleButtonGroup
      type="radio"
      name={`kind-${type}`}
      size="sm"
      className={className}
      style={style}
      value={kind}
      onChange={(kind) => dispatch(mapSetLayerKind({ type, kind }))}
    >
      {(['base', 'overlay'] as const).map((value) => (
        <ToggleButton
          key={value}
          id={`kind-${type}-${value}`}
          value={value}
          variant="outline-primary"
          className="flex-grow-1 text-nowrap"
        >
          {m?.mapLayers.layer[value]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
