import type { SelectCallback } from '@restart/ui/types';
import { type Breakpoint, useBreakpointMatches } from '@shared/breakpoints.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { SubmenuHeader } from '@shared/components/SubmenuHeader.js';
import clsx from 'clsx';
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useState,
} from 'react';
import {
  Button,
  ButtonGroup,
  type ButtonProps,
  Dropdown,
} from 'react-bootstrap';
import { FaChevronRight, FaEllipsisV } from 'react-icons/fa';
import { useOnline } from '../hooks/useOnline.js';
import { afterPrefix } from '../types/typeUtils.js';
import {
  LongPressTooltip,
  type TooltipTargetProps,
} from './LongPressTooltip.js';
import { OfflineBadge } from './OfflineBadge.js';

export type ActionProps = {
  label: ReactNode;
  icon?: ReactNode;
  /**
   * Render this action as an inline button from this breakpoint up; below it the
   * action collapses into the dropdown. Omit (or `xs`) to keep it always inline,
   * `never` to keep it always in the dropdown. A larger breakpoint means lower
   * priority — the action collapses sooner.
   */
  showFrom?: Breakpoint | 'never';
  /**
   * Also print the label next to the icon of the inline button from this
   * breakpoint up. Omit to keep the inline button icon-only.
   */
  showLabelFrom?: Breakpoint;
  /**
   * The action goes to the server: offline it is disabled, and in the packed
   * menu — where it has a label to sit beside — it is badged with the reason.
   * A condition rather than a flag, for an action that needs the network only
   * in some states (a map with no offline copy, say); it must be false wherever
   * something else is what stands in the way, or the badge stops meaning
   * "the connection".
   */
  requiresOnline?: boolean;
  /**
   * `Dropdown.Item`s offering variants of the action. Inline they hang off a
   * split toggle beside the button; packed they follow it in the menu. Pass
   * them bare or as an array — a fragment hides them from packed disabling.
   */
  menu?: ReactNode;
} & Pick<
  ButtonProps,
  // `variant="danger"` also turns the packed dropdown item red.
  | 'variant'
  | 'onClick'
  | 'href'
  | 'target'
  | 'rel'
  | 'disabled'
  | 'active'
  | 'className'
  | 'title'
  | 'aria-label'
>;

/** Descriptor for {@link ResponsiveActions}; interpreted by the parent, renders nothing on its own. */
export function Action(_props: ActionProps): null {
  return null;
}

/** Separator that renders as a divider when its surrounding actions are packed. */
export function ActionDivider(): null {
  return null;
}

/** Event key of a submenu opener; bare, it is the way back out. */
const SUBMENU_PREFIX = 'fm-submenu-';

/**
 * A group that opens as a submenu of the packed menu instead of running on into
 * it — for a list long enough to bury what is above it.
 */
export function ActionSubmenu(_props: {
  label: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}): null {
  return null;
}

/**
 * Raw `Dropdown.Item`s for the packed menu — a set that only reads as a list,
 * such as the external-app targets. They never go inline, and their `eventKey`s
 * reach the `onSelect` given to {@link ResponsiveActions}.
 */
export function ActionItems(_props: { children: ReactNode }): null {
  return null;
}

type Props = {
  children: ReactNode;
  /** Dropdown alignment for the packed menu. */
  align?: 'start' | 'end';
  size?: ButtonProps['size'];
  /** Bootstrap spacing step between the inline buttons and the toggle. */
  gap?: 0 | 1 | 2 | 3;
  /** Variant for inline buttons that don't set their own, and for the toggle. */
  variant?: ButtonProps['variant'];
  toggle?: ReactNode;
  /** What the packed menu's toggle is, said in its tooltip. */
  toggleLabel?: string;
  /** Handles the `eventKey`s of whatever {@link ActionItems} puts in the menu. */
  onSelect?: SelectCallback;
  toggleRef?: Ref<HTMLButtonElement>;
  className?: string;
};

export function ResponsiveActions({
  children,
  align = 'end',
  size,
  gap = 2,
  variant = 'secondary',
  toggle = <FaEllipsisV />,
  toggleLabel,
  toggleRef,
  onSelect,
  className,
}: Props): ReactElement {
  const matches = useBreakpointMatches();

  const online = useOnline();

  const [show, setShow] = useState(false);

  // Which submenu the packed menu is showing, by the index of its entry.
  const [submenu, setSubmenu] = useState<number | null>(null);

  const isOff = (props: Pick<ActionProps, 'disabled' | 'requiresOnline'>) =>
    props.disabled || (props.requiresOnline && !online);

  const isInline = (showFrom: NonNullable<ActionProps['showFrom']> = 'xs') => {
    return showFrom !== 'never' && (showFrom === 'xs' || matches[showFrom]);
  };

  type Entry =
    | { kind: 'divider' }
    | { kind: 'items'; items: ReactNode; index: number }
    | {
        kind: 'submenu';
        label: ReactNode;
        icon?: ReactNode;
        items: ReactNode;
        index: number;
      }
    | { kind: 'action'; props: ActionProps; index: number; inline: boolean };

  const entries: Entry[] = [];

  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) {
      return;
    }

    if (child.type === ActionDivider) {
      entries.push({ kind: 'divider' });
    } else if (child.type === ActionSubmenu) {
      const props = child.props as {
        label: ReactNode;
        icon?: ReactNode;
        children: ReactNode;
      };

      entries.push({
        kind: 'submenu',
        label: props.label,
        icon: props.icon,
        items: props.children,
        index,
      });
    } else if (child.type === ActionItems) {
      entries.push({
        kind: 'items',
        items: (child.props as { children: ReactNode }).children,
        index,
      });
    } else if (child.type === Action) {
      const props = child.props as ActionProps;

      entries.push({
        kind: 'action',
        props,
        index,
        inline: isInline(props.showFrom),
      });
    }
  });

  const isPacked = (entry: Entry) =>
    entry.kind === 'items' ||
    entry.kind === 'submenu' ||
    (entry.kind === 'action' && !entry.inline);

  // Collapsing a single action into a dropdown costs more chrome than it saves,
  // so promote a lone packed action back to an inline button — unless it asked
  // for the menu with `never`, which is a decision, not a lack of room, or raw
  // items are holding the menu open anyway.
  const packedActions = entries.filter(
    (e): e is Extract<Entry, { kind: 'action' }> =>
      e.kind === 'action' && !e.inline,
  );

  if (
    packedActions.length === 1 &&
    packedActions[0].props.showFrom !== 'never' &&
    !entries.some((e) => e.kind === 'items' || e.kind === 'submenu')
  ) {
    packedActions[0].inline = true;
  }

  const lastPackedPos = entries.reduce(
    (pos, entry, i) => (isPacked(entry) ? i : pos),
    -1,
  );

  // Drop leading, trailing, and consecutive dividers left dangling by packing:
  // keep a divider only when packed content immediately precedes it and more
  // packed content still follows.
  const packed = entries.filter((entry, i) => {
    if (entry.kind !== 'divider') {
      return isPacked(entry);
    }

    const prev = entries[i - 1];

    return prev !== undefined && isPacked(prev) && i < lastPackedPos;
  });

  // Packed, an action's variants are plain items in the shared menu, so a
  // disabled action has to hand its state down to them itself.
  const renderPackedMenu = (menu: ReactNode, off: boolean | undefined) =>
    off
      ? Children.map(menu, (child) =>
          isValidElement<{ disabled?: boolean }>(child)
            ? cloneElement(child, { disabled: true })
            : child,
        )
      : menu;

  const renderButton = (
    {
      label,
      icon,
      showFrom,
      showLabelFrom,
      variant: ownVariant,
      requiresOnline,
      disabled,
      menu,
      ...rest
    }: ActionProps,
    key: number,
  ) => {
    const off = isOff({ disabled, requiresOnline });

    const split = (button: ReactNode) => (
      <Dropdown key={key} as={ButtonGroup} align={align} onSelect={onSelect}>
        {button}

        <Dropdown.Toggle
          split
          variant={ownVariant ?? variant}
          size={size}
          disabled={off}
        />

        <FmDropdownMenu>{menu}</FmDropdownMenu>
      </Dropdown>
    );

    const renderPlain = () => {
      const button = (
        <Button
          key={key}
          variant={ownVariant ?? variant}
          size={size}
          disabled={off}
          {...rest}
        >
          {label}
        </Button>
      );

      return menu ? split(button) : button;
    };

    // An inline action is icon-only unless `showLabelFrom` prints the label
    // beside the icon; where the label is hidden it shows in the tooltip.
    return icon ? (
      <LongPressTooltip key={key} label={label} breakpoint={showLabelFrom}>
        {({ label: tipLabel, labelClassName, props: tipProps }) => {
          const button = (
            <Button
              variant={ownVariant ?? variant}
              size={size}
              disabled={off}
              {...rest}
              {...tipProps}
              aria-label={
                rest['aria-label'] ??
                (typeof label === 'string' ? label : undefined)
              }
            >
              {icon}
              {showLabelFrom && (
                <span className={labelClassName}> {tipLabel}</span>
              )}
            </Button>
          );

          return menu ? split(button) : button;
        }}
      </LongPressTooltip>
    ) : (
      renderPlain()
    );
  };

  const inline = entries
    .filter(
      (e): e is Extract<Entry, { kind: 'action' }> =>
        e.kind === 'action' && e.inline,
    )
    .map((e) => renderButton(e.props, e.index));

  const hasPacked = packed.some((entry) => entry.kind !== 'divider');

  const openSubmenu = entries.find(
    (entry): entry is Extract<Entry, { kind: 'submenu' }> =>
      entry.kind === 'submenu' && entry.index === submenu,
  );

  const openMenu = (next: boolean) => {
    setShow(next);

    if (!next) {
      setSubmenu(null);
    }
  };

  const renderToggle = () => {
    const button = (tipProps?: TooltipTargetProps) => (
      <Dropdown.Toggle
        variant={variant}
        size={size}
        {...tipProps}
        ref={(el: HTMLButtonElement | null) => {
          tipProps?.ref(el);

          if (typeof toggleRef === 'function') {
            toggleRef(el);
          } else if (toggleRef) {
            toggleRef.current = el;
          }
        }}
      >
        {toggle}
      </Dropdown.Toggle>
    );

    // Named only in the tooltip: the toggle is a glyph wherever it appears, and
    // the label would crowd a toolbar that packed its actions for want of room.
    return toggleLabel ? (
      <LongPressTooltip label={toggleLabel}>
        {({ props }) => button(props)}
      </LongPressTooltip>
    ) : (
      button()
    );
  };

  return (
    <div
      className={clsx(
        'd-inline-flex flex-nowrap align-items-center',
        `gap-${gap}`,
        className,
      )}
    >
      {inline}

      {hasPacked && (
        <Dropdown
          align={align}
          show={show}
          onToggle={openMenu}
          // Selecting closes the menu below, so that opening a submenu — the one
          // selection that must leave it up — can decline to.
          autoClose="outside"
          onSelect={(eventKey, e) => {
            const level = afterPrefix(String(eventKey), SUBMENU_PREFIX);

            if (level !== undefined) {
              setSubmenu(level === '' ? null : Number(level));

              return;
            }

            onSelect?.(eventKey, e);

            openMenu(false);
          }}
        >
          {renderToggle()}

          <FmDropdownMenu level={submenu}>
            {openSubmenu && (
              <>
                <SubmenuHeader
                  icon={openSubmenu.icon}
                  title={openSubmenu.label}
                  backEventKey={SUBMENU_PREFIX}
                  kbd={false}
                />

                {openSubmenu.items}
              </>
            )}

            {!openSubmenu &&
              packed.map((entry, i) =>
                entry.kind === 'divider' ? (
                  <Dropdown.Divider key={`divider-${i}`} />
                ) : entry.kind === 'items' ? (
                  <Fragment key={entry.index}>{entry.items}</Fragment>
                ) : entry.kind === 'submenu' ? (
                  <Dropdown.Item
                    key={entry.index}
                    as="button"
                    eventKey={`${SUBMENU_PREFIX}${entry.index}`}
                  >
                    {entry.icon} {entry.label} <FaChevronRight />
                  </Dropdown.Item>
                ) : (
                  <Fragment key={entry.index}>
                    <Dropdown.Item
                      {...(entry.props.href
                        ? {
                            href: entry.props.href,
                            target: entry.props.target,
                            rel: entry.props.rel,
                          }
                        : ({ as: 'button', type: 'button' } as const))}
                      onClick={entry.props.onClick}
                      disabled={isOff(entry.props)}
                      active={entry.props.active}
                      className={clsx(
                        entry.props.variant === 'danger' && 'text-danger',
                        entry.props.className,
                      )}
                      title={entry.props.title}
                      aria-label={entry.props['aria-label']}
                    >
                      {entry.props.icon ? (
                        <>
                          {entry.props.icon} {entry.props.label}
                        </>
                      ) : (
                        entry.props.label
                      )}

                      {entry.props.requiresOnline && <OfflineBadge />}
                    </Dropdown.Item>

                    {renderPackedMenu(entry.props.menu, isOff(entry.props))}
                  </Fragment>
                ),
              )}
          </FmDropdownMenu>
        </Dropdown>
      )}
    </div>
  );
}
