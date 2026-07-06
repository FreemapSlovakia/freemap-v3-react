import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import clsx from 'clsx';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import { FaGem } from 'react-icons/fa';

type PremiumGemProps = {
  className?: string;
  /**
   * Bind the purchase link to `onClickCapture` instead of `onClick` — needed
   * inside a clickable container (e.g. a dropdown item) so clicking the gem
   * opens the purchase flow before the container's own handler runs.
   */
  capture?: boolean;
  /**
   * Render as an inert `<span>` instead of an `<a>` — required when the gem sits
   * inside an already-interactive element (button / dropdown item), where a
   * nested `<a>` would be invalid HTML. It stays clickable via its own handler.
   */
  nested?: boolean;
  /**
   * When set, renders this label (the localized "premium access" phrase) before
   * the gem as part of the same link — for inline use in running text. Pass it
   * from the surrounding sentence so it carries the right grammatical case; the
   * tooltip then states status rather than repeating "with premium access".
   */
  label?: ReactNode;
  /**
   * Custom lead sentence for the tooltip describing what premium unlocks here;
   * defaults to the generic "Only available with premium access."
   */
  hint?: ReactNode;
  /**
   * Runs just before navigating to the purchase flow (non-premium only) — e.g.
   * to close a host modal that would otherwise sit above the purchase modal.
   */
  onBeforeNavigate?: () => void;
};

/**
 * Premium marker gem with a tooltip (hover or touch long-press). For non-premium
 * users the gem is warning-colored and links to the purchase flow
 * (`#show=premium`); for premium users it's a success-colored, inert marker.
 *
 * `pointerEvents: 'initial'` keeps it hoverable/clickable inside containers that
 * disable pointer events (e.g. a disabled dropdown item).
 */
export function PremiumGem({
  className,
  capture,
  nested,
  label,
  hint,
  onBeforeNavigate,
}: PremiumGemProps): ReactElement {
  const becomePremium = useBecomePremium();

  const prm = usePremiumMessages();

  const expand = label != null;

  // Tooltip: an optional lead sentence (what premium unlocks) then the user's
  // status — "Click to activate." for non-premium, "…already have…" for premium.
  const lead = becomePremium
    ? (hint ?? (expand ? prm?.noPremium : prm?.premiumOnly))
    : hint;

  const status = becomePremium ? prm?.clickToActivate : prm?.alreadyPremium;

  const tooltip = lead ? (
    <>
      {lead} {status}
    </>
  ) : (
    status
  );

  const onActivate = becomePremium
    ? (e: MouseEvent) => {
        onBeforeNavigate?.();

        becomePremium(e);
      }
    : undefined;

  // A real link where it's safe; an inert span inside interactive containers
  // (nested) or for premium users (no navigation).
  const asLink = Boolean(onActivate) && !nested;

  // The label keeps normal link styling; only the gem carries the premium color.
  const content = (
    <>
      {expand && (
        <>
          {asLink ? (
            <span className="text-decoration-underline">{label}</span>
          ) : (
            label
          )}{' '}
        </>
      )}

      <FaGem className={becomePremium ? 'text-warning' : 'text-success'} />
    </>
  );

  return (
    <LongPressTooltip label={tooltip}>
      {({ props }) => {
        const shared = {
          ...props,
          className: clsx(asLink && 'text-decoration-none', className),
          style: {
            pointerEvents: 'initial' as const,
            cursor: onActivate ? 'pointer' : 'default',
          },
          onClick: capture ? undefined : onActivate,
          onClickCapture: (e: MouseEvent) => {
            // Let the tooltip swallow the click that ends a long-press; only
            // navigate on a genuine click it didn't prevent.
            props.onClickCapture(e);

            if (capture && !e.defaultPrevented) {
              onActivate?.(e);
            }
          },
        };

        return asLink ? (
          <a {...shared} href="#show=premium">
            {content}
          </a>
        ) : (
          <span {...shared}>{content}</span>
        );
      }}
    </LongPressTooltip>
  );
}
