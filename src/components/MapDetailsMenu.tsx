import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { ReactElement } from 'react';
import { DeleteButton } from './DeleteButton';
import { ToolMenu } from './ToolMenu';

export function MapDetailsMenu(): ReactElement | null {
  const canDelete = useAppSelector((state) => !!state.trackViewer.trackGeojson);

  return <ToolMenu>{canDelete ? <DeleteButton /> : null}</ToolMenu>;
}
