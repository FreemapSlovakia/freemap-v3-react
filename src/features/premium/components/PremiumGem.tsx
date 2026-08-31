import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
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
  /**
   * For a gem repeated down a menu, where owning the feature is reassurance
   * rather than news: that form steps down and dims so the column reads as one
   * mark. Leave it off where the gem is the only one on screen — there it says
   * something about the thing it marks, and a premium user needs to read it.
   */
  quiet?: boolean;
};

/**
 * Premium marker gem with a tooltip (hover or touch long-press). For non-premium
 * users the gem is warning-colored and links to the purchase flow
 * (`#show=premium`); for premium users it's a success-colored, inert marker.
 */
export function PremiumGem({
  className,
  capture,
  nested,
  label,
  hint,
  onBeforeNavigate,
  quiet,
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

  // Only the owned gem is ever quieted; an offer stays at full weight, and so
  // does a gem set in running text.
  const subdued = quiet && !becomePremium && !expand;

  return (
    <GlyphMarker
      hint={tooltip}
      color={becomePremium ? 'warning' : 'success'}
      size={subdued ? 'sm' : 'md'}
      // The label keeps normal link styling; only the gem carries the premium
      // color, which `GlyphMarker` applies to the glyph alone.
      label={
        expand && asLink ? (
          <span className="text-decoration-underline">{label}</span>
        ) : (
          label
        )
      }
      href={asLink ? '#show=premium' : undefined}
      className={clsx(
        asLink && 'text-decoration-none',
        subdued && 'opacity-50',
        className,
      )}
      onClick={capture ? undefined : onActivate}
      onClickCapture={
        capture && onActivate
          ? (e) => {
              // The tooltip swallows the click that ends a long-press; only a
              // genuine click it didn't prevent navigates.
              if (!e.defaultPrevented) {
                onActivate(e);
              }
            }
          : undefined
      }
    >
      <FaGem />
    </GlyphMarker>
  );
}
