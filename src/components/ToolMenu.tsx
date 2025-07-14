import { type ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setTool } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { toolDefinitions } from '../toolDefinitions.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';

type Props = {
  children?: ReactNode;
};

export function ToolMenu({ children }: Props): ReactElement {
  const sc = useScrollClasses('horizontal');

  const dispatch = useDispatch();

  const m = useMessages();

  const tool = useAppSelector((state) => state.main.tool);

  const toolDef = tool && toolDefinitions.find((td) => td.tool === tool);

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          {toolDef && (
            <span className="align-self-center ms-1">
              <LongPressTooltip
                breakpoint="sm"
                label={m?.tools[toolDef.msgKey]}
              >
                {({ label, labelClassName, ...handlers }) => (
                  <span {...handlers}>
                    {toolDef.icon}

                    <span className={labelClassName}> {label}</span>
                  </span>
                )}
              </LongPressTooltip>
            </span>
          )}

          <LongPressTooltip label={m?.general.close} kbd="Esc" breakpoint="xl">
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => dispatch(setTool(null))}
                {...props}
              >
                <FaTimes />

                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>

          {children}
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
