import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { toolDefinitions } from 'fm3/toolDefinitions';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';

export function ToolLabel(): ReactElement | null {
  const m = useMessages();

  const tool = useSelector((state: RootState) => state.main.tool);

  const toolDef =
    tool &&
    toolDefinitions.find(
      (t) =>
        t.tool ===
        (tool === 'draw-polygons' || tool === 'draw-points'
          ? 'draw-lines'
          : tool),
    );

  return (
    <span className="align-self-center ml-1 mr-2">
      <FontAwesomeIcon icon={toolDef ? toolDef.icon : 'briefcase'} />
      <span className="d-none d-sm-inline">
        {' '}
        {m?.tools[tool && toolDef ? toolDef.msgKey : 'tools']}
      </span>
    </span>
  );
}
