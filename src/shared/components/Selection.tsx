import { selectFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import { type ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function Selection({
  label,
  icon,
  deletable = false,
  noLeftMargin = false,
  children,
}: {
  label?: string;
  icon: ReactElement;
  deletable?: boolean;
  children?: ReactNode;
  noLeftMargin?: boolean;
}): ReactElement {
  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  // A selection and a tool are mutually exclusive, so the selection is the
  // active thing whenever no tool is focused — show the same active outline.
  const isActive = useAppSelector((state) => state.main.activeTool === null);

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar
        className={clsx(
          'mt-2 fm-toolbar-selection',
          isActive && 'fm-toolbar-active',
        )}
      >
        <ButtonToolbar>
          <LongPressTooltip breakpoint="sm" label={label}>
            {({ label, labelClassName, props }) => (
              <span
                className={clsx('align-self-center', noLeftMargin || 'ms-1')}
                {...props}
              >
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
