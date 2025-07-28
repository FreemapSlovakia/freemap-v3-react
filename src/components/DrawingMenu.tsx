import { ReactElement } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { FaPalette } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { setActiveModal, setTool, Tool } from '../actions/mainActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { toolDefinitions } from '../toolDefinitions.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { ToolMenu } from './ToolMenu.js';

export default DrawingMenu;

export function DrawingMenu(): ReactElement | undefined {
  const activeTool = useAppSelector((state) => state.main.tool);

  const activeToolDef =
    (activeTool ?? undefined) &&
    toolDefinitions.find((td) => td.tool === activeTool);

  const dispatch = useDispatch();

  const m = useMessages();

  return (
    activeToolDef && (
      <ToolMenu>
        <Dropdown
          className="ms-1"
          onSelect={(tool) => dispatch(setTool(assert<Tool>(tool)))}
        >
          <LongPressTooltip
            breakpoint="lg"
            label={m?.selections[activeToolDef.msgKey as 'drawPoints']}
          >
            {({ label, labelClassName, props }) => (
              <Dropdown.Toggle variant="secondary" {...props}>
                {activeToolDef.icon}{' '}
                <span className={labelClassName}> {label}</span>
              </Dropdown.Toggle>
            )}
          </LongPressTooltip>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {toolDefinitions
              .filter((td) => td.draw)
              .map(({ tool, icon, msgKey: key, kbd }) => (
                <Dropdown.Item
                  as="button"
                  eventKey={tool}
                  key={tool}
                  active={tool === activeTool}
                >
                  {icon} {m?.selections[key as 'drawPoints'] ?? '…'}{' '}
                  <kbd>g</kbd> <kbd>{kbd?.slice(3).toLowerCase()}</kbd>
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>

        <LongPressTooltip
          label={m?.drawing.defProps.menuItem}
          breakpoint="md"
          kbd="e d"
        >
          {({ props, label, labelClassName }) => (
            <Button
              variant="secondary"
              type="button"
              className="ms-1"
              onClick={() => dispatch(setActiveModal('drawing-properties'))}
              {...props}
            >
              <FaPalette /> <span className={labelClassName}>{label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </ToolMenu>
    )
  );
}
