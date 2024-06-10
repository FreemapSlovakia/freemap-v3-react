import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { Button } from 'react-bootstrap';

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
