import { closeTool, openTool, type Tool } from '@app/store/actions.js';
import { activeMapToolSelector, isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaPencilRuler,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { isMapClickTool, toolDefinitions } from '../toolDefinitions.js';

type Props = {
  tool: Tool;
  /** The tool's controls — dropped while the toolbar is collapsed to a strip. */
  children?: ReactNode;
  /**
   * What the strip keeps: a readout that is worth a glance while the controls
   * are put away. Rendered after `children` in the expanded toolbar.
   */
  stripChildren?: ReactNode;
  /**
   * Offers a collapse button. Only for a toolbar whose strip still says
   * something worth the room — a tool with nothing to leave behind is closed
   * instead.
   */
  collapsible?: boolean;
  /** Decorates the header icon, e.g. to say the tool is doing something. */
  iconClassName?: string;
};

export function ToolMenu({
  tool,
  children,
  stripChildren,
  collapsible,
  iconClassName,
}: Props): ReactElement {
  const sc = useScrollClasses('horizontal');

  const dispatch = useDispatch();

  const m = useMessages();

  const toolDef = toolDefinitions.find((td) => td.tool === tool);

  const [userCollapsed, setUserCollapsed] = useState(false);

  // A toolbar can be up for a reason of its own while its tool is closed (a
  // running GPS recording), and is a strip whatever the user chose: being open
  // is what the full set of controls belongs to.
  const open = useAppSelector((state) => isToolOpen(state, tool));

  // Opening the tool asks for its controls, whichever way it was opened — so a
  // collapse the user made before it was closed doesn't outlive it and leave
  // the menu item looking like it did nothing. Adjusted while rendering rather
  // than in an effect, so there is no frame of the wrong state.
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setUserCollapsed(false);
    }
  }

  const collapsed = !open || (collapsible && userCollapsed);

  // Not merely "is a map-click tool": while a picking mode owns the map the tool
  // goes inert, and the outline would then promise clicks it doesn't take.
  const ownsMapClicks = useAppSelector(
    (state) => activeMapToolSelector(state) === tool,
  );

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar
        className={clsx('mt-2', ownsMapClicks && 'fm-toolbar-map-click')}
      >
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

          {!collapsed && children}

          {stripChildren}

          {collapsed ? (
            <LongPressTooltip label={m?.general.expand}>
              {({ props }) => (
                <Button
                  className="ms-1"
                  variant="dark"
                  onClick={() => {
                    if (!open) {
                      dispatch(openTool(tool));
                    }

                    setUserCollapsed(false);
                  }}
                  {...props}
                >
                  <FaAngleRight />
                </Button>
              )}
            </LongPressTooltip>
          ) : (
            <>
              {collapsible && (
                <LongPressTooltip label={m?.general.collapse}>
                  {({ props }) => (
                    <Button
                      className="ms-1"
                      variant="dark"
                      onClick={() => setUserCollapsed(true)}
                      {...props}
                    >
                      <FaAngleLeft />
                    </Button>
                  )}
                </LongPressTooltip>
              )}

              {/* Escape closes the tool that owns map clicks — it is what leaves
                  a mode — so only there does it name the same gesture as this
                  button. */}
              <LongPressTooltip
                label={m?.general.close}
                kbd={isMapClickTool(tool) ? 'Esc' : undefined}
              >
                {({ props }) => (
                  <Button
                    className="ms-1"
                    variant="dark"
                    onClick={() => dispatch(closeTool(tool))}
                    {...props}
                  >
                    <FaTimes />
                  </Button>
                )}
              </LongPressTooltip>
            </>
          )}
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
