import { useMessages } from '@features/l10n/l10nInjector.js';
import { PlaceSearch } from '@features/search/components/PlaceSearch.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';

type Props = {
  /** What the map is being asked for. */
  prompt: ReactNode;
  onCancel: () => void;
  /** Adds a confirm button; without one the map click is the whole answer. */
  onConfirm?: () => void;
  /** Names the confirm button; OK when unset. */
  confirmLabel?: ReactNode;
  confirmDisabled?: boolean;
  /** Only where Escape really cancels the mode — see `keyboardHandler`. */
  cancelKbd?: string;
  /** The mode's own controls, between the prompt and the buttons. */
  children?: ReactNode;
  /** Adds an address search; the found place only stages the pick to confirm. */
  onPlace?: (position: LatLon) => void;
};

/**
 * The only toolbar up while the map waits for a click that says where — the
 * rest of the chrome is hidden; see `inPickingModeSelector`.
 */
export function PickingMenu({
  prompt,
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  cancelKbd,
  children,
  onPlace,
}: Props): ReactElement {
  const m = useMessages();

  const sc = useScrollClasses('horizontal');

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <div className="px-1 align-self-center">{prompt}</div>

          {onPlace && <PlaceSearch onPlace={onPlace} />}

          {children}

          {onConfirm && (
            <LongPressTooltip
              breakpoint="sm"
              label={confirmLabel ?? m?.general.ok}
            >
              {({ label, labelClassName, props }) => (
                <Button
                  variant="primary"
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  {...props}
                >
                  <FaCheck />
                  <span className={labelClassName}> {label}</span>
                </Button>
              )}
            </LongPressTooltip>
          )}

          <LongPressTooltip
            breakpoint="sm"
            label={m?.general.cancel}
            kbd={cancelKbd}
          >
            {({ label, labelClassName, props }) => (
              <Button variant="dark" onClick={onCancel} {...props}>
                <FaTimes />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
