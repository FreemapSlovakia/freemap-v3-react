import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { DeleteButton } from './DeleteButton';

export function MapDetailsMenu(): ReactElement | null {
  const canDelete = useSelector((state) => !!state.trackViewer.trackGeojson);

  return canDelete ? <DeleteButton /> : null;
}
