import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { mapAreaSelectCancel, mapAreaSelectConfirm } from '../model/actions.js';
import { useMapAreaMessages } from '../translations/useMapAreaMessages.js';

export default function MapAreaSelectionMenu(): ReactElement {
  const m = useMessages();

  const ma = useMapAreaMessages();

  const dispatch = useDispatch();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="m-2">{ma?.pickHint}</div>

        <LongPressTooltip breakpoint="sm" label={m?.general.ok}>
          {({ label, labelClassName, props }) => (
            <Button
              className="me-1"
              onClick={() => dispatch(mapAreaSelectConfirm())}
              {...props}
            >
              <FaCheck />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip breakpoint="sm" label={m?.general.cancel} kbd="Esc">
          {({ label, labelClassName, props }) => (
            <Button
              variant="dark"
              onClick={() => dispatch(mapAreaSelectCancel())}
              {...props}
            >
              <FaTimes />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    </div>
  );
}
