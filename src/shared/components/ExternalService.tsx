import { useMessages } from '@features/l10n/l10nInjector.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import type { HTMLAttributes, ReactElement } from 'react';
import { FaHistory } from 'react-icons/fa';

/**
 * Marks what runs on somebody else's service under their usage terms — a rate cap,
 * non-commercial use only, no guarantees.
 *
 * Goes **beside** a `<Button>`, never inside one, as `ExperimentalFunction` does.
 */
export function ExternalService(
  props: HTMLAttributes<HTMLElement>,
): ReactElement {
  const m = useMessages();

  return (
    <GlyphMarker hint={m?.general.externalService} {...props}>
      <FaHistory />
    </GlyphMarker>
  );
}
