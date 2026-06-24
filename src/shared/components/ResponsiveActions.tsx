import { type Breakpoint, useBreakpointMatches } from '@shared/breakpoints.js';
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
import { fixedPopperConfig } from '@/shared/fixedPopperConfig.js';
import { LongPressTooltip } from './LongPressTooltip.js';

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
  size = 'sm',
  variant = 'secondary',
  toggle = <FaEllipsisV />,
  toggleLabel,
  toggleRef,
  className,
}: Props): ReactElement {
  const matches = useBreakpointMatches();

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
  // so promote a lone packed action back to an inline button.
  const packedActions = entries.filter(
    (e): e is Extract<Entry, { divider: false }> => !e.divider && !e.inline,
  );

  if (packedActions.length === 1) {
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
    { label, icon, showFrom, variant: ownVariant, ...rest }: ActionProps,
    key: number,
  ) => {
    // Inline actions are icon-only; the label moves into the tooltip.
    return icon ? (
      <LongPressTooltip key={key} label={label}>
        {({ props: tipProps }) => (
          <Button
            variant={ownVariant ?? variant}
            size={size}
            {...rest}
            {...tipProps}
            aria-label={
              rest['aria-label'] ??
              (typeof label === 'string' ? label : undefined)
            }
          >
            {icon}
          </Button>
        )}
      </LongPressTooltip>
    ) : (
      <Button key={key} variant={ownVariant ?? variant} size={size} {...rest}>
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
        'd-inline-flex flex-wrap align-items-center gap-2',
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

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {packed.map((entry, i) =>
              entry.divider ? (
                <Dropdown.Divider key={`divider-${i}`} />
              ) : (
                <Dropdown.Item
                  key={entry.index}
                  onClick={entry.props.onClick}
                  href={entry.props.href}
                  disabled={entry.props.disabled}
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
                </Dropdown.Item>
              ),
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}
