import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FaDrawPolygon, FaEye } from 'react-icons/fa';
import type { MapAreaMode } from '../useMapAreaSelection.js';

type Props = {
  area: MapAreaMode;
  onSelectVisible: () => void;
  onSelectArea: () => void;
  visibleLabel: ReactNode;
  areaLabel: ReactNode;
  className?: string;
};

/** "Visible area" / "Selected area" toggle shared by the export/cache modals. */
export function MapAreaToggle({
  area,
  onSelectVisible,
  onSelectArea,
  visibleLabel,
  areaLabel,
  className,
}: Props): ReactElement {
  return (
    <ToggleButtonGroup
      type="radio"
      name="mapArea"
      value={area}
      className={clsx('d-flex', className)}
    >
      <ToggleButton
        id="mapArea-visible"
        className="fm-ellipsis"
        variant="outline-primary"
        value="visible"
        onClick={onSelectVisible}
      >
        <FaEye /> {visibleLabel}
      </ToggleButton>

      <ToggleButton
        id="mapArea-area"
        className="fm-ellipsis"
        variant="outline-primary"
        value="area"
        onClick={onSelectArea}
      >
        <FaDrawPolygon /> {areaLabel}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
