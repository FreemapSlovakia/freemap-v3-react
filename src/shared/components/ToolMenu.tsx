import { setTool, type Tool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
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
  /**
   * Renders the header as a strip of a tool that is not the open one: the button
   * opens it again instead of closing it, and the flask goes with the controls it
   * warns about. The caller decides what, if anything, of `children` it keeps.
   */
  collapsed?: boolean;
  /**
   * Says that closing this tool leaves a strip behind rather than taking it off
   * the screen, so the button reads as a collapse and not as a dismissal.
   */
  collapsible?: boolean;
  /** Decorates the header icon, e.g. to say the tool is doing something. */
  iconClassName?: string;
};

export function ToolMenu({
  tool,
  children,
  collapsed,
  collapsible,
  iconClassName,
}: Props): ReactElement {
  const sc = useScrollClasses('horizontal');

  const dispatch = useDispatch();

  const m = useMessages();

  const toolDef = toolDefinitions.find((td) => td.tool === tool);

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          {toolDef && (
            <>
              <LongPressTooltip
                breakpoint="sm"
                label={
                  toolDef.draw ? m?.tools.measurement : m?.tools[toolDef.msgKey]
                }
              >
                {({ label, labelClassName, props }) => (
                  <span className="align-self-center mx-1" {...props}>
                    <span className={iconClassName}>
                      {toolDef.draw ? <FaPencilRuler /> : toolDef.icon}
                    </span>{' '}
                    <span className={labelClassName}> {label}</span>
                  </span>
                )}
              </LongPressTooltip>

              {toolDef.experimental && !collapsed && (
                <span className="align-self-center mx-1">
                  <ExperimentalFunction />
                </span>
              )}
            </>
          )}

          {children}

          {/* Escape closes the open tool, which for a collapsible one is the same
              gesture as this button — so it stays named on both. */}
          <LongPressTooltip
            label={
              collapsed
                ? m?.general.expand
                : collapsible
                  ? m?.general.collapse
                  : m?.general.close
            }
            kbd={collapsed ? undefined : 'Esc'}
          >
            {({ props }) => (
              <Button
                className="ms-1"
                variant="dark"
                onClick={() => dispatch(setTool(collapsed ? tool : null))}
                {...props}
              >
                {collapsed ? (
                  <FaAngleRight />
                ) : collapsible ? (
                  <FaAngleLeft />
                ) : (
                  <FaTimes />
                )}
              </Button>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
