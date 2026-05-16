import { setTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon } from '@mantine/core';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { type ReactElement, ReactNode } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { FaPencilRuler, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toolDefinitions } from '../toolDefinitions.js';

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

      <Toolbar className="mt-2 fm-toolmenu">
        <ButtonToolbar>
          {toolDef && (
            <span className="align-self-center ms-1">
              <LongPressTooltip
                breakpoint="sm"
                label={
                  toolDef.draw ? m?.tools.measurement : m?.tools[toolDef.msgKey]
                }
              >
                {({ label, labelClassName, props }) => (
                  <span {...props}>
                    {toolDef.draw ? <FaPencilRuler /> : toolDef.icon}{' '}
                    <span className={labelClassName}> {label}</span>
                  </span>
                )}
              </LongPressTooltip>
            </span>
          )}

          {children}

          <MantineLongPressTooltip label={m?.general.close} kbd="Esc">
            {({ props }) => (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="dark"
                size="input-sm"
                onClick={() => dispatch(setTool(null))}
                {...props}
              >
                <FaTimes />
              </ActionIcon>
            )}
          </MantineLongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
