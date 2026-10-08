import { selectFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { selectionToolbarMounted } from '@features/map/panToUncovered.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { type ReactElement, type ReactNode, useEffect } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function Selection({
  label,
  icon,
  control,
  deletable = false,
  children,
}: {
  label?: string;
  /** The selection's own glyph — no control, see `control`. */
  icon: ReactElement;
  /**
   * The button that reopens the tool the selection belongs to. Kept out of the
   * head: the head carries its own long-press tooltip, and a control inside it
   * would open two at once, as well as taking the head's hit area past the
   * toolbar's height.
   */
  control?: ReactNode;
  deletable?: boolean;
  children?: ReactNode;
}): ReactElement {
  const dispatch = useDispatch();

  // A pick that brought this toolbar up may now be under it.
  useEffect(selectionToolbarMounted, []);

  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2 fm-toolbar-selection">
        <ButtonToolbar>
          {control}

          <LongPressTooltip breakpoint="sm" label={label}>
            {({ label, labelClassName, props }) => (
              <span
                className="align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2"
                {...props}
              >
                {icon}
                <span className={labelClassName}>{label}</span>
              </span>
            )}
          </LongPressTooltip>

          {children}

          {!window.fmEmbedded && deletable && <DeleteButton />}

          <LongPressTooltip label={m?.general.close} kbd="Esc">
            {({ props }) => (
              <Button
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
