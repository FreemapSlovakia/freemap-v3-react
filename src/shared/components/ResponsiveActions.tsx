import { type Breakpoint, useBreakpointMatches } from '@shared/breakpoints.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import clsx from 'clsx';
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { Button, type ButtonProps, Dropdown } from 'react-bootstrap';
import { FaEllipsisV } from 'react-icons/fa';
import { useOnline } from '../hooks/useOnline.js';
import { LongPressTooltip } from './LongPressTooltip.js';
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
} & Pick<
  ButtonProps,
  // `variant="danger"` also turns the packed dropdown item red.
  | 'variant'
  | 'onClick'
  | 'href'
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
  toggleLabel?: string;
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
  className,
}: Props): ReactElement {
  const matches = useBreakpointMatches();

  const online = useOnline();

  const isOff = (props: Pick<ActionProps, 'disabled' | 'requiresOnline'>) =>
    props.disabled || (props.requiresOnline && !online);

  const isInline = (showFrom: NonNullable<ActionProps['showFrom']> = 'xs') => {
    return showFrom !== 'never' && (showFrom === 'xs' || matches[showFrom]);
  };

  type Entry =
    | { divider: true }
    | { divider: false; props: ActionProps; index: number; inline: boolean };

  const entries: Entry[] = [];

  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) {
      return;
    }

    if (child.type === ActionDivider) {
      entries.push({ divider: true });
    } else if (child.type === Action) {
      const props = child.props as ActionProps;

      entries.push({
        divider: false,
        props,
        index,
        inline: isInline(props.showFrom),
      });
    }
  });

  // Collapsing a single action into a dropdown costs more chrome than it saves,
  // so promote a lone packed action back to an inline button — unless it asked
  // for the menu with `never`, which is a decision, not a lack of room.
  const packedActions = entries.filter(
    (e): e is Extract<Entry, { divider: false }> => !e.divider && !e.inline,
  );

  if (
    packedActions.length === 1 &&
    packedActions[0].props.showFrom !== 'never'
  ) {
    packedActions[0].inline = true;
  }

  const lastPackedPos = entries.reduce(
    (pos, entry, i) => (!entry.divider && !entry.inline ? i : pos),
    -1,
  );

  // Drop leading, trailing, and consecutive dividers left dangling by packing:
  // keep a divider only when a packed action immediately precedes it and another
  // packed action still follows.
  const packed = entries.filter((entry, i) => {
    if (!entry.divider) {
      return !entry.inline;
    }

    const prev = entries[i - 1];

    return prev?.divider === false && !prev.inline && i < lastPackedPos;
  });

  const renderButton = (
    {
      label,
      icon,
      showFrom,
      showLabelFrom,
      variant: ownVariant,
      requiresOnline,
      disabled,
      ...rest
    }: ActionProps,
    key: number,
  ) => {
    const off = isOff({ disabled, requiresOnline });

    // An inline action is icon-only unless `showLabelFrom` prints the label
    // beside the icon; where the label is hidden it shows in the tooltip.
    return icon ? (
      <LongPressTooltip key={key} label={label} breakpoint={showLabelFrom}>
        {({ label: tipLabel, labelClassName, props: tipProps }) => (
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
        )}
      </LongPressTooltip>
    ) : (
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
  };

  const inline = entries
    .filter(
      (e): e is Extract<Entry, { divider: false }> => !e.divider && e.inline,
    )
    .map((e) => renderButton(e.props, e.index));

  const hasPacked = packed.some((entry) => !entry.divider);

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
        <Dropdown align={align}>
          <Dropdown.Toggle
            ref={toggleRef}
            variant={variant}
            size={size}
            aria-label={toggleLabel}
          >
            {toggle}
          </Dropdown.Toggle>

          <FmDropdownMenu>
            {packed.map((entry, i) =>
              entry.divider ? (
                <Dropdown.Divider key={`divider-${i}`} />
              ) : (
                <Dropdown.Item
                  key={entry.index}
                  {...(entry.props.href
                    ? { href: entry.props.href }
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
              ),
            )}
          </FmDropdownMenu>
        </Dropdown>
      )}
    </div>
  );
}
