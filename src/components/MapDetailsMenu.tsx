import { ReactElement } from 'react';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { DeleteButton } from './DeleteButton.js';
import { ToolMenu } from './ToolMenu.js';

export function MapDetailsMenu(): ReactElement | null {
  const canDelete = useAppSelector((state) => !!state.trackViewer.trackGeojson);

  return <ToolMenu>{canDelete ? <DeleteButton /> : null}</ToolMenu>;
}
