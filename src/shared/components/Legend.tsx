import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  LongPressTooltip,
  type TooltipTargetProps,
} from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { clamp } from '@shared/mathUtils.js';
import clsx from 'clsx';
import {
  type PointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Button, Overlay, Tooltip } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import classes from './Legend.module.css';

type ShellProps = {
  /** Icons left of the label, saying which layer or tool the legend reads. */
  icon: ReactNode;
  label: ReactNode;
  /** Shown once next to the label (e.g. `%`), not repeated on each tick. */
  unit?: string;
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
  control,
  onClose,
  className,
  children,
}: ShellProps) {
  const m = useMessages();

  return (
    <div className={clsx('mw-100', classes.fitWidth)}>
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
  /** `LegendTick`s; the bar's margins make room for those hanging past its ends. */
  children: ReactNode;
  /** The value at a place on the bar, 0 to 1, shown under the pointer. */
  valueAt?: (t: number) => ReactNode;
  /** A wider bar, for a scale with more labels than the default width holds. */
  wide?: boolean;
};

/** Space between a label hanging past the bar and whatever is beside it. */
const OVERHANG_GAP_PX = 4;

/** How long a tap's reading stays up after the finger lifts. */
const TOUCH_LINGER_MS = 1500;

/** The gradient bar of a legend with a scale, with its labels drawn over it. */
export function LegendGradientBar({
  background,
  children,
  valueAt,
  wide,
}: BarProps) {
  const [at, setAt] = useState<number | null>(null);

  const [marker, setMarker] = useState<HTMLElement | null>(null);

  const lingerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(lingerRef.current), []);

  const barRef = useRef<HTMLDivElement>(null);

  // How far the labels hang past each end, which the margins make room for.
  const [overhang, setOverhang] = useState<[number, number]>([0, 0]);

  const measure = () => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const box = bar.getBoundingClientRect();

    let start = 0;

    let end = 0;

    for (const tick of bar.querySelectorAll(`.${classes.tick}`)) {
      const rect = tick.getBoundingClientRect();

      start = Math.max(start, box.left - rect.left);

      end = Math.max(end, rect.right - box.right);
    }

    // A margin moves the ticks it was measured from, so settle within a pixel.
    setOverhang((prev) =>
      Math.abs(prev[0] - start) < 1 && Math.abs(prev[1] - end) < 1
        ? prev
        : [start, end],
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the ticks are `children`
  useLayoutEffect(measure, [children]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `measure` reads only a ref and a setter
  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const observer = new ResizeObserver(() => measure());

    observer.observe(bar);

    return () => observer.disconnect();
  }, []);

  const read = (e: PointerEvent<HTMLDivElement>) => {
    clearTimeout(lingerRef.current);

    const rect = e.currentTarget.getBoundingClientRect();

    setAt(clamp((e.clientX - rect.left) / rect.width, 0, 1));
  };

  const clear = () => {
    clearTimeout(lingerRef.current);

    setAt(null);
  };

  // A finger leaves on lifting, so its reading lingers rather than vanishing
  // under it. A mouse or pen can hover, so its reading lasts until it leaves.
  const linger = () => {
    clearTimeout(lingerRef.current);

    lingerRef.current = setTimeout(() => setAt(null), TOUCH_LINGER_MS);
  };

  return (
    <div
      // A drag along the bar reads it rather than selecting its labels.
      className={clsx(
        'position-relative user-select-none',
        classes.bar,
        wide && classes.barWide,
      )}
      // Tracked even while there is no readout, so one that appears under a
      // pointer is not left with a stale reading.
      onPointerDown={(e) => {
        // Keeps a drag that strays off the bar reading it.
        e.currentTarget.setPointerCapture(e.pointerId);

        read(e);
      }}
      onPointerMove={read}
      onPointerUp={(e) => {
        if (e.pointerType === 'touch') {
          linger();
        }
      }}
      onPointerCancel={clear}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') {
          clear();
        }
      }}
      // A drag released off the bar gets no pointerleave until it next moves,
      // and `:hover` is stale until then too.
      onLostPointerCapture={(e) => {
        const r = e.currentTarget.getBoundingClientRect();

        if (
          e.pointerType !== 'touch' &&
          (e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom)
        ) {
          clear();
        }
      }}
      ref={barRef}
      style={{
        marginLeft: overhang[0] && overhang[0] + OVERHANG_GAP_PX,
        marginRight: overhang[1] && overhang[1] + OVERHANG_GAP_PX,
        // A drag reads the bar rather than scrolling what is under it.
        touchAction: valueAt ? 'none' : undefined,
      }}
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

      {valueAt && (
        <span
          ref={setMarker}
          className={clsx(
            'position-absolute top-0 bottom-0',
            classes.marker,
            at === null && 'd-none',
          )}
          style={{ left: `${(at ?? 0) * 100}%` }}
        />
      )}

      {valueAt && marker && (
        <Overlay
          target={marker}
          show={at !== null}
          placement="top"
          flip
          // A fade would outlive the reading and the marker it is placed on.
          transition={false}
        >
          {({ popper, ...props }) => (
            <Tooltip {...props}>
              <FollowMarker popper={popper} at={at} />
              {at !== null && valueAt(at)}
            </Tooltip>
          )}
        </Overlay>
      )}
    </div>
  );
}

/** Moves the tooltip with the marker, which popper does not watch. */
function FollowMarker({
  popper,
  at,
}: {
  popper: { scheduleUpdate?: () => void } | undefined;
  at: number | null;
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `at` is what moved the marker
  useEffect(() => {
    popper?.scheduleUpdate?.();
  }, [popper, at]);

  return null;
}

/**
 * A bar label centred on the fraction `t` of the scale. `inside` sets a label
 * at either end within the bar instead, for one wider than the overhang.
 */
export function LegendTick({
  t,
  inside,
  children,
}: {
  t: number;
  inside?: boolean;
  children: ReactNode;
}) {
  if (inside && (t === 0 || t === 1)) {
    return (
      <div
        className={clsx(
          'position-absolute text-nowrap px-1',
          t === 0 ? 'start-0' : 'end-0',
          classes.tickInside,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={clsx('position-absolute text-nowrap', classes.tick)}
      style={{ left: `${t * 100}%` }}
    >
      {children}
    </div>
  );
}
