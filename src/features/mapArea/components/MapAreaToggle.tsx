import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
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
    <ButtonGroup className={clsx('d-flex', className)}>
      <Button
        className="fm-ellipsis"
        variant="outline-primary"
        active={area === 'visible'}
        onClick={onSelectVisible}
      >
        <FaEye /> {visibleLabel}
      </Button>

      <Button
        className="fm-ellipsis"
        variant="outline-primary"
        active={area === 'area'}
        onClick={onSelectArea}
      >
        <FaDrawPolygon /> {areaLabel}
      </Button>
    </ButtonGroup>
  );
}
