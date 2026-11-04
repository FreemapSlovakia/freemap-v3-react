import { selectFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toolbarMounted } from '@features/map/panToUncovered.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useEscapeKbd } from '@shared/hooks/useEscapeKbd.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
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
  useEffect(toolbarMounted, []);

  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const escapeKbd = useEscapeKbd(selectFeature(null));

  const [labelEl, setLabelEl] = useState<HTMLSpanElement | null>(null);

  // Measured, so only a label actually cut off gets the full one in a tooltip.
  const [truncated, setTruncated] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a longer label at the capped width resizes nothing, so the observer alone would miss it
  useEffect(() => {
    if (!labelEl) {
      return;
    }

    const measure = () =>
      setTruncated(labelEl.scrollWidth > labelEl.clientWidth);

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(labelEl);

    return () => observer.disconnect();
  }, [labelEl, label]);

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2 fm-toolbar-selection">
        <ButtonToolbar>
          {control}

          {/* A cut-off label is named in full by the tooltip too. */}
          <LongPressTooltip
            breakpoint="sm"
            label={label}
            name={truncated ? label : undefined}
          >
            {({ label, labelClassName, props }) => (
              <span
                className="align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2"
                {...props}
              >
                {icon}
                <span
                  ref={setLabelEl}
                  className={
                    labelClassName === 'd-none'
                      ? 'd-none'
                      : 'd-inline-block text-truncate'
                  }
                  style={{ maxWidth: '20rem' }}
                >
                  {label}
                </span>
              </span>
            )}
          </LongPressTooltip>

          {children}

          {!window.fmEmbedded && deletable && <DeleteButton />}

          <LongPressTooltip label={m?.general.close} kbd={escapeKbd}>
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
