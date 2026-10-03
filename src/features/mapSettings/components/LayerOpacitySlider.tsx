import { mapLayerSettingsChange } from '@features/map/model/actions.js';
import { combinationOpacity } from '@features/map/model/mapCombination.js';
import { activeCombinationsSelector } from '@features/map/model/selectors.js';
import {
  integratedLayerDefMapSelector,
  resolvedCustomLayersSelector,
} from '@features/mapLibrary/model/selectors.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { resolveLayerOpacity } from '@shared/mapDefinitions.js';
import type { CSSProperties, ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { FaAdjust } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

type Props = {
  type: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * An overlay's opacity, as Installed maps sets it; nothing for a base map, or
 * while an active combination sets it instead.
 */
export function LayerOpacitySlider({
  type,
  className,
  style,
}: Props): ReactElement | null {
  const msm = useMapSettingsMessages();

  const def = useAppSelector(
    (state) =>
      integratedLayerDefMapSelector(state)[type] ??
      resolvedCustomLayersSelector(state).find((def) => def.type === type),
  );

  const fromCombination = useAppSelector(
    (state) =>
      combinationOpacity(activeCombinationsSelector(state), type) !== undefined,
  );

  const own = useAppSelector(
    (state) => state.map.layersSettings[type]?.opacity,
  );

  const dispatch = useDispatch();

  if (def?.layer !== 'overlay' || fromCombination) {
    return null;
  }

  const percent = Math.round(resolveLayerOpacity(def, own) * 100);

  return (
    <div
      className={`d-flex align-items-center gap-2${className ? ` ${className}` : ''}`}
      style={style}
    >
      <LongPressTooltip label={msm?.overlayOpacity}>
        {({ props }) => (
          <span className="d-inline-flex flex-shrink-0" {...props}>
            <FaAdjust />
          </span>
        )}
      </LongPressTooltip>

      <Form.Range
        min={0}
        max={100}
        value={percent}
        onChange={(e) =>
          dispatch(
            mapLayerSettingsChange({
              type,
              settings: { opacity: Number(e.currentTarget.value) / 100 },
            }),
          )
        }
      />

      <span className="flex-shrink-0 text-end" style={{ width: '3em' }}>
        {percent}%
      </span>
    </div>
  );
}
