import { Button } from 'react-bootstrap';
import { useAppSelector } from '../../../hooks/useAppSelector.js';

type Props = {
  onColor: (color: string) => void;
};

export function DrawingRecentColors({ onColor }: Props) {
  const recentColors = useAppSelector(
    (state) => state.main.drawingRecentColors,
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
