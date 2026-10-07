import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  LongPressTooltip,
  type TooltipTargetProps,
} from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import classes from './Legend.module.css';

type ShellProps = {
  /** Icons left of the label, saying which layer or tool the legend reads. */
  icon: ReactNode;
  label: ReactNode;
  /** Shown once next to the label (e.g. `%`), not repeated on each tick. */
  unit?: string;
  /** Shrink to the content width instead of filling the legend's own width. */
  fit?: boolean;
  /**
   * A control left of the label — the button reopening the tool the legend
   * belongs to, for legends that outlive that tool's toolbar.
   */
  control?: ReactNode;
  /** Adds a close button; omitted where the legend is toggled from elsewhere. */
  onClose?: () => void;
  /** Extra toolbar classes, for a legend laying its body out in the toolbar. */
  className?: string;
  children: ReactNode;
};

/** Toolbar, icons and label shared by the gallery and colorizer legends. */
export function LegendShell({
  icon,
  label,
  unit,
  fit,
  control,
  onClose,
  className,
  children,
}: ShellProps) {
  const m = useMessages();

  return (
    <div
      className={
        fit ? clsx('mw-100', classes.fitWidth) : clsx('w-100', classes.barWidth)
      }
    >
      <Toolbar className={clsx('mt-2 d-flex', className)}>
        {control}

        <LongPressTooltip label={label} breakpoint="sm">
          {({ props, label, labelClassName }) => (
            <span
              className="align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2"
              {...props}
            >
              {icon}

              <span className={labelClassName}>
                {label}
                {unit ? ` [${unit}]` : ''}
              </span>
            </span>
          )}
        </LongPressTooltip>

        {children}

        {onClose && (
          <LongPressTooltip label={m?.general.close}>
            {({ props }) => (
              <Button variant="dark" onClick={onClose} {...props}>
                <FaTimes />
              </Button>
            )}
          </LongPressTooltip>
        )}
      </Toolbar>
    </div>
  );
}

type SwatchProps = {
  color: string;
  label: ReactNode;
  /** A second line under the label, e.g. the category's share of the track. */
  sub?: ReactNode;
  title?: string;
};

/** One category of a legend with no scale: a colour chip and its label. */
export function LegendSwatch({ color, label, sub, title }: SwatchProps) {
  const body = (props?: TooltipTargetProps) => (
    <span
      {...props}
      className="d-flex flex-column align-items-center small lh-1 gap-1 text-nowrap"
    >
      <span className="d-inline-flex align-items-center gap-1">
        <span
          className={clsx('border rounded', classes.chip)}
          style={{ background: color }}
        />

        {label}
      </span>

      {sub !== undefined && <span className="text-secondary">{sub}</span>}
    </span>
  );

  return title ? (
    <LongPressTooltip label={title}>
      {({ props }) => body(props)}
    </LongPressTooltip>
  ) : (
    body()
  );
}

type BarProps = {
  /** CSS gradient painted across the bar. */
  background: string;
  /**
   * Margins. Wider than the toolbar's own rhythm: the outermost tick is centred
   * on the bar's edge, so it needs empty space to overhang into.
   */
  className?: string;
  /** `LegendTick`s, or a legend's own labelling. */
  children: ReactNode;
};

/** The gradient bar of a legend with a scale, with its labels drawn over it. */
export function LegendGradientBar({
  background,
  className,
  children,
}: BarProps) {
  return (
    <div
      className={clsx('flex-grow-1 position-relative', classes.bar, className)}
    >
      <div
        className="border rounded position-absolute top-0 bottom-0 start-0 end-0"
        style={{ background }}
      />

      <div
        className={clsx(
          'text-body position-absolute top-0 bottom-0 start-0 end-0',
          classes.barLabels,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** A bar label centred on the fraction `t` of the scale. */
export function LegendTick({
  t,
  children,
}: {
  t: number;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        'position-absolute text-center text-nowrap',
        classes.tick,
      )}
      style={{ left: `${t * 100}%` }}
    >
      {children}
    </div>
  );
}
