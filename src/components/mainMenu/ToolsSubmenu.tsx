import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaPencilRuler, FaToolbox } from 'react-icons/fa';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useMessages } from '../../l10nInjector.js';
import { toolDefinitions } from '../../toolDefinitions.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function ToolsSubmenu(): JSX.Element {
  const m = useMessages();

  const tool = useAppSelector((state) => state.main.tool);

  const toolDef = toolDefinitions.find((t) => t.tool === tool);

  return (
    <>
      <SubmenuHeader icon={<FaToolbox />} title={m?.tools.tools} />

      <Dropdown.Item as="button" eventKey="drawing">
        <FaPencilRuler /> {m?.tools.measurement}
      </Dropdown.Item>

      {toolDefinitions
        .filter(({ draw }) => !draw)
        .map(
          ({ tool: newTool, icon, msgKey, kbd }) =>
            newTool && (
              <Dropdown.Item
                href={`?tool=${tool}`}
                key={newTool}
                eventKey={'tool-' + newTool}
                active={toolDef?.tool === newTool}
              >
                {icon} {m?.tools[msgKey]}{' '}
                {kbd && (
                  <>
                    <kbd>g</kbd>{' '}
                    <kbd>{kbd.replace(/Key/, '').toLowerCase()}</kbd>
                  </>
                )}
              </Dropdown.Item>
            ),
        )}
    </>
  );
}
