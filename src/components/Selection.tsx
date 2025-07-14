import { type ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { selectFeature } from '../actions/mainActions.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { DeleteButton } from './DeleteButton.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';

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

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip breakpoint="sm" label={label}>
            {({ label, labelClassName, props }) => (
              <span className="align-self-center ms-1" {...props}>
                {icon}
                <span className={labelClassName}> {label}</span>
              </span>
            )}
          </LongPressTooltip>

          <LongPressTooltip label={m?.general.close} kbd="Esc" breakpoint="xl">
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => dispatch(selectFeature(null))}
                {...props}
              >
                <FaTimes />

                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>

          {deletable && <DeleteButton />}

          {children}
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
