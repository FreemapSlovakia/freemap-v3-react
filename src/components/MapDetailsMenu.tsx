import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { DeleteButton } from './DeleteButton';
import { ToolMenu } from './ToolMenu';

export function MapDetailsMenu(): ReactElement | null {
  const canDelete = useSelector((state) => !!state.trackViewer.trackGeojson);

  return <ToolMenu>{canDelete ? <DeleteButton /> : null}</ToolMenu>;
}
