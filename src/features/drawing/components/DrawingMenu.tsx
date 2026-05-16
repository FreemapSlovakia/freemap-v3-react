import { setActiveModal, setTool, Tool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button, Kbd, Menu } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import type { ReactElement } from 'react';
import { FaCaretDown, FaPalette } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

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
        <Menu>
          <Menu.Target>
            <MantineLongPressTooltip
              breakpoint="lg"
              label={m?.selections[activeToolDef.msgKey as 'drawPoints']}
            >
              {({ label, labelHidden, props }) =>
                labelHidden ? (
                  <ActionIcon
                    className="ms-1"
                    variant="filled"
                    color="gray"
                    size="input-sm"
                    {...props}
                  >
                    {activeToolDef.icon}
                  </ActionIcon>
                ) : (
                  <Button
                    className="ms-1"
                    color="gray"
                    size="sm"
                    leftSection={activeToolDef.icon}
                    rightSection={<FaCaretDown />}
                    {...props}
                  >
                    {label}
                  </Button>
                )
              }
            </MantineLongPressTooltip>
          </Menu.Target>

          <Menu.Dropdown>
            {toolDefinitions
              .filter((td) => td.draw)
              .map(({ tool, icon, msgKey: key, kbd }) => (
                <Menu.Item
                  key={tool}
                  leftSection={icon}
                  color={tool === activeTool ? 'blue' : undefined}
                  rightSection={
                    kbd ? (
                      <>
                        <Kbd>g</Kbd> <Kbd>{kbd.slice(3).toLowerCase()}</Kbd>
                      </>
                    ) : null
                  }
                  onClick={() => dispatch(setTool(tool as Tool))}
                >
                  {m?.selections[key as 'drawPoints'] ?? '…'}
                </Menu.Item>
              ))}
          </Menu.Dropdown>
        </Menu>

        <MantineLongPressTooltip
          label={m?.drawing.defProps.menuItem}
          breakpoint="md"
          kbd="e d"
        >
          {({ props, label, labelHidden, kbdEl }) =>
            labelHidden ? (
              <ActionIcon
                variant="filled"
                color="gray"
                size="input-sm"
                type="button"
                className="ms-1"
                onClick={() => dispatch(setActiveModal('drawing-properties'))}
                {...props}
              >
                <FaPalette />
              </ActionIcon>
            ) : (
              <Button
                color="gray"
                size="sm"
                type="button"
                className="ms-1"
                leftSection={<FaPalette />}
                rightSection={kbdEl}
                onClick={() => dispatch(setActiveModal('drawing-properties'))}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      </ToolMenu>
    )
  );
}
