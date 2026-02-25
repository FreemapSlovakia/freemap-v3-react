import { selectFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { type ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function Selection({
  label,
  icon,
  deletable,
  children,
}: {
  label?: string;
  icon: ReactElement;
  deletable?: boolean;
  children?: ReactNode;
}): ReactElement {
  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2 fm-selection">
        <ButtonToolbar>
          <LongPressTooltip breakpoint="sm" label={label}>
            {({ label, labelClassName, props }) => (
              <span className="align-self-center ms-1" {...props}>
                {icon}
                <span className={labelClassName}> {label}</span>
              </span>
            )}
          </LongPressTooltip>

          {children}

          {!window.fmEmbedded && deletable && <DeleteButton />}

          <LongPressTooltip label={m?.general.close} kbd="Esc">
            {({ props }) => (
              <Button
                className="ms-1"
                variant="dark"
                onClick={() => dispatch(selectFeature(null))}
                {...props}
              >
                <FaTimes />
              </Button>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
