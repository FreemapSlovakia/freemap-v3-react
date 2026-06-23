import { setTool, Tool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { isMapClickTool } from '@shared/toolDefinitions.js';
import clsx from 'clsx';
import { type ReactElement, ReactNode } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaPencilRuler,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toolDefinitions } from '../toolDefinitions.js';

type Props = {
  tool: Tool;
  children?: ReactNode;
};

export function ToolMenu({ tool, children }: Props): ReactElement {
  const sc = useScrollClasses('horizontal');

  const dispatch = useDispatch();

  const m = useMessages();

  const toolDef = toolDefinitions.find((td) => td.tool === tool);

  const isActive = useAppSelector((state) => state.main.activeTool === tool);

  // Per-tool collapse. The key includes the tool so several open tools collapse
  // independently.
  const [hidden, setHidden] = usePersistentBoolean(
    `fm.toolMenu.collapsed.${tool}`,
  );

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className={clsx('mt-2', isActive && 'fm-toolbar-active')}>
        <ButtonToolbar>
          {toolDef && (
            <LongPressTooltip
              breakpoint="sm"
              label={
                toolDef.draw ? m?.tools.measurement : m?.tools[toolDef.msgKey]
              }
            >
              {({ label, labelClassName, props }) =>
                // Only map-click tools can be focused: their title is a clickable
                // pill that captures clicks when active. Overlays show a plain,
                // non-focusable title.
                isMapClickTool(tool) ? (
                  <Button
                    variant="outline-primary"
                    active={isActive}
                    onClick={() =>
                      dispatch(
                        setTool({ tool, mode: isActive ? 'open' : 'activate' }),
                      )
                    }
                    {...props}
                  >
                    {toolDef.draw ? <FaPencilRuler /> : toolDef.icon}{' '}
                    <span className={labelClassName}> {label}</span>
                  </Button>
                ) : (
                  <span className="align-self-center ms-1" {...props}>
                    {toolDef.icon}{' '}
                    <span className={labelClassName}> {label}</span>
                  </span>
                )
              }
            </LongPressTooltip>
          )}

          {!hidden && children}

          <ButtonGroup className="ms-1">
            <LongPressTooltip
              label={hidden ? m?.general.expand : m?.general.collapse}
            >
              {({ props }) => (
                <Button
                  variant="dark"
                  onClick={() => setHidden((hidden) => !hidden)}
                  {...props}
                >
                  {hidden ? <FaAngleRight /> : <FaAngleLeft />}
                </Button>
              )}
            </LongPressTooltip>

            {!hidden && (
              <LongPressTooltip label={m?.general.close}>
                {({ props }) => (
                  <Button
                    variant="dark"
                    onClick={() => dispatch(setTool({ tool, mode: 'close' }))}
                    {...props}
                  >
                    <FaTimes />
                  </Button>
                )}
              </LongPressTooltip>
            )}
          </ButtonGroup>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
