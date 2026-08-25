import type { SelectCallback } from '@restart/ui/types';
import {
  type Breakpoint,
  getMinWidthForBreakpoint,
  useBreakpointMatches,
} from '@shared/breakpoints.js';
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
  useEffect,
  useLayoutEffect,
  useRef,
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
  /**
   * Pack by what fits rather than by the breakpoints: the row's own scroller is
   * measured, and actions fold into the menu only while it overflows. Then
   * `showFrom` is read as an order — the largest breakpoint folds first — and
   * `xs` (or none) stays inline whatever happens. For a row sharing its width
   * with controls this component knows nothing about, where a breakpoint packs
   * while the row still has room to spare.
   */
  fit?: boolean;
};

/** What an unmeasured action is assumed to take: an icon button and its gap. */
const ESTIMATED_ACTION_PX = 44;

/** Room a folded action must find over its own width before it comes back. */
const UNFOLD_SLACK_PX = 8;

/** The gaps and padding the measurement has to add back, in pixels. */
function readSpacing(root: HTMLElement, row: HTMLElement) {
  const rowStyle = getComputedStyle(row);

  return {
    ownGap: Number.parseFloat(getComputedStyle(root).columnGap) || 0,
    rowGap: Number.parseFloat(rowStyle.columnGap) || 0,
    rowPadding:
      Number.parseFloat(rowStyle.paddingLeft) +
      Number.parseFloat(rowStyle.paddingRight),
  };
}

/**
 * Where an action stands in the folding order, which is the width it asks for:
 * the one wanting most room goes first, and `0` never folds. The breakpoints'
 * own widths rather than an order of this component's own, so a new breakpoint
 * is one edit rather than two.
 */
const foldOrder = (showFrom: ActionProps['showFrom']): number =>
  showFrom === undefined || showFrom === 'never' || showFrom === 'xs'
    ? 0
    : getMinWidthForBreakpoint(showFrom);

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
  fit,
}: Props): ReactElement {
  const matches = useBreakpointMatches();

  const online = useOnline();

  const [show, setShow] = useState(false);

  // Which submenu the packed menu is showing, by the index of its entry.
  const [submenu, setSubmenu] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);

  /** How many of the folding order are packed, while `fit` measures. */
  const [folded, setFolded] = useState(0);

  /** Bumped by the row's own resize, which re-runs the measurement below. */
  const [, setResized] = useState(0);

  /** What each action took when it was last inline, by its child index. */
  const widths = useRef(new Map<number, number>());

  const spacingRef = useRef<ReturnType<typeof readSpacing> | null>(null);

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

  // The order they fold in: the largest breakpoint first, as it is the one
  // asking for most room. `never` is already packed and `xs` never folds, so
  // neither is in it.
  const folding = entries
    .filter(
      (e): e is Extract<Entry, { kind: 'action' }> =>
        e.kind === 'action' && foldOrder(e.props.showFrom) > 0,
    )
    .sort((a, b) => foldOrder(b.props.showFrom) - foldOrder(a.props.showFrom));

  if (fit) {
    const packedByFit = new Set(folding.slice(0, folded).map((e) => e.index));

    for (const entry of entries) {
      if (entry.kind === 'action' && entry.props.showFrom !== 'never') {
        entry.inline = !packedByFit.has(entry.index);
      }
    }
  }

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
    !fit &&
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

  const inlineEntries = entries.filter(
    (e): e is Extract<Entry, { kind: 'action' }> =>
      e.kind === 'action' && e.inline,
  );

  const inline = inlineEntries.map((e) => renderButton(e.props, e.index));

  const hasPacked = packed.some((entry) => entry.kind !== 'divider');

  // What fits, measured on the row this sits in rather than guessed from the
  // window: the rest of the row is nobody's business here, so only its own
  // scroller can say whether there is room. Each inline action's width is kept
  // as it is rendered, which is what lets a folded one be counted back in — it
  // is not in the DOM to measure. One pass settles it: the natural width is the
  // same however many are folded, so the count cannot oscillate.
  useLayoutEffect(() => {
    // First, and before the walk up the tree: every row of every list that
    // carries one of these renders this component, and none of them measures.
    if (!fit) {
      return;
    }

    const root = rootRef.current;

    const row = root?.parentElement;

    const scroller = root?.closest('.fm-ib-scroller');

    if (!root || !row || !(scroller instanceof HTMLElement)) {
      return;
    }

    // Read once and kept between resizes: this runs on every render, and the
    // gaps and padding move only with the box — full screen drops the room a
    // floating panel keeps clear for its resize grip, which is a padding
    // change and a resize at once.
    spacingRef.current ??= readSpacing(root, row);

    const spacing = spacingRef.current;

    const kids = [...root.children];

    inlineEntries.forEach((entry, i) => {
      const el = kids[i];

      if (el instanceof HTMLElement && el.offsetWidth > 0) {
        widths.current.set(entry.index, el.offsetWidth + spacing.ownGap);
      }
    });

    const width = (entry: Extract<Entry, { kind: 'action' }>) =>
      widths.current.get(entry.index) ?? ESTIMATED_ACTION_PX;

    // Added up rather than read off the row's `scrollWidth`: an `ms-auto` on
    // this element eats the slack into a margin, so an overflowing row and a
    // half-empty one measure exactly the same there.
    let rowWidth =
      spacing.rowPadding +
      folding.slice(0, folded).reduce((sum, e) => sum + width(e), 0);

    for (const kid of row.children) {
      if (kid instanceof HTMLElement && kid.offsetWidth > 0) {
        rowWidth += kid.offsetWidth + spacing.rowGap;
      }
    }

    let need = 0;

    while (rowWidth > scroller.clientWidth + 1 && need < folding.length) {
      rowWidth -= width(folding[need]!);

      need++;
    }

    // Unfolding only where the row has room to spare, not merely enough:
    // widths move by a pixel with a label or a scrollbar, and a button that
    // came back only to be folded again on the next pass would flicker.
    if (need < folded && rowWidth + UNFOLD_SLACK_PX > scroller.clientWidth) {
      return;
    }

    if (need !== folded) {
      setFolded(need);
    }
  });

  // A panel resized by its grip doesn't re-render this on its own.
  useEffect(() => {
    const scroller = rootRef.current?.closest('.fm-ib-scroller');

    if (!fit || !scroller) {
      return;
    }

    const observer = new ResizeObserver(() => {
      // The spacing goes with it: a panel going full screen drops the room it
      // keeps clear for its grip, and that arrives as a resize.
      spacingRef.current = null;

      setResized((n) => n + 1);
    });

    observer.observe(scroller);

    return () => observer.disconnect();
  }, [fit]);

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
      ref={rootRef}
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
