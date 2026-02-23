import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Button } from 'react-bootstrap';

type Props = {
  onColor: (color: string) => void;
};

export function DrawingRecentColors({ onColor }: Props) {
  const recentColors = useAppSelector(
    (state) => state.drawingSettings.drawingRecentColors,
  );

  return (
    <>
      {recentColors.map((color) => (
        <Button
          key={color}
          className="me-2"
          style={{ backgroundColor: color }}
          onClick={() => onColor(color)}
        />
      ))}
    </>
  );
}
