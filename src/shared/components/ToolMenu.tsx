import { closeTool, openTool, type Tool } from '@app/store/actions.js';
import { activeMapToolSelector, isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
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
   * Offers a collapse button, leaving a strip of the tool's icon and the button
   * that brings the controls back. Only for a toolbar that has a reason to stay
   * up with nothing on it — a running recording, say; anything else is closed
   * instead.
   */
  collapsible?: boolean;
  /** Decorates the header icon, e.g. to say the tool is doing something. */
  iconClassName?: string;
  /**
   * Turns the collapsed strip's icon into a button, for a tool that can still
   * answer for itself with its controls put away. Given the icon the strip would
   * otherwise show, so the wrapper only has to say what pressing it does; the
   * tool's name stays beside it either way.
   */
  wrapCollapsedIcon?: (icon: ReactNode) => ReactNode;
};

export function ToolMenu({
  tool,
  children,
  collapsible,
  iconClassName,
  wrapCollapsedIcon,
}: Props): ReactElement {
  const sc = useScrollClasses('horizontal');

  const dispatch = useDispatch();

  const m = useMessages();

  const toolDef = toolDefinitions.find((td) => td.tool === tool);

  // A standing preference, not a per-session one: it outlives both a reload and
  // the tool being closed, and only the expand button clears it. Nothing here
  // may reset it on open — the tool is closed by a store update that unmounts
  // this component in the same commit, so a toolbar can never tell being opened
  // from a page that loaded with it already open.
  const [userCollapsed, setUserCollapsed] = usePersistentBoolean(
    `fm.toolMenu.collapsed.${tool}`,
  );

  // A toolbar can be up for a reason of its own while its tool is closed (a
  // running GPS recording), and is a strip whatever the user chose: being open
  // is what the full set of controls belongs to.
  const open = useAppSelector((state) => isToolOpen(state, tool));

  const collapsed = !open || (collapsible && userCollapsed);

  // Not merely "is a map-click tool": while a picking mode owns the map the tool
  // goes inert, and the outline would then promise clicks it doesn't take.
  const ownsMapClicks = useAppSelector(
    (state) => activeMapToolSelector(state) === tool,
  );

  const buttonIcon = collapsed && wrapCollapsedIcon !== undefined;

  const icon = toolDef && (
    <span className={iconClassName}>
      {toolDef.draw ? <FaPencilRuler /> : toolDef.icon}
    </span>
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
                  <span
                    className={clsx(
                      'align-self-center d-inline-flex align-items-center gap-2',
                      // Wrapped, the icon is a button, which sits where a button
                      // sits and brings its own hit area; bare, the glyph needs
                      // both the air and something to aim at.
                      !buttonIcon && 'px-1 py-2 my-n2',
                    )}
                    {...props}
                  >
                    {buttonIcon ? wrapCollapsedIcon(icon) : icon}
                    <span className={labelClassName}>{label}</span>
                  </span>
                )}
              </LongPressTooltip>

              {toolDef.experimental && !collapsed && <ExperimentalFunction />}

              {toolDef.requiresOnline && !collapsed && (
                <OfflineBadge hint={m?.general.offlineToolUnavailable} />
              )}
            </>
          )}

          {!collapsed && children}

          {collapsed ? (
            <LongPressTooltip label={m?.general.expand}>
              {({ props }) => (
                <Button
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
