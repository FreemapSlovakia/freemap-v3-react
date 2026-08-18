import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toposcopeSetPickingCenter } from '../model/actions.js';
import { useToposcopeMessages } from '../translations/useToposcopeMessages.js';

/** The only toolbar up while the map is waiting for the centre's position. */
export default function ToposcopeCenterPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const tm = useToposcopeMessages();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="px-1">{tm?.pickCenterPrompt}</div>

        <LongPressTooltip breakpoint="sm" label={m?.general.cancel}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="dark"
              onClick={() => dispatch(toposcopeSetPickingCenter(false))}
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
