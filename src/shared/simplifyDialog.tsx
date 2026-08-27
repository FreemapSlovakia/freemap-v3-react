import { useMessages } from '@features/l10n/l10nInjector.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import {
  type ModalAnswer,
  type ModalBodyProps,
  type ModalOptions,
  openModal,
  useModal,
} from '@shared/components/ModalProvider.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  MAX_TOLERANCE,
  MIN_TOLERANCE,
  suggestSimplifyTolerance,
  vertexCount,
  verticesAt,
} from '@shared/simplifyTolerance.js';
import type { Position } from 'geojson';
import { type ReactNode, useCallback, useDeferredValue, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { FaCompressAlt } from 'react-icons/fa';
import type { Messages } from '@/translations/messagesInterface.js';

export type SimplifyRequest = {
  /** What the suggestion and the vertex counts are measured on. */
  lines: Position[][];
  /**
   * That `lines` are closed rings, to be counted as the edit will thin them.
   * Only a caller that closed them itself knows: a loop track ends where it
   * started too, and is still an open line.
   */
  rings?: boolean;
  /** Shown above the slider; a warning that has to be seen. */
  preamble?: ReactNode;
  /** Ask even when the lines are thin enough to leave alone. */
  always?: boolean;
};

/** Resolves to a tolerance in metres, or `null` when the dialog was cancelled. */
export type SimplifyFn = (request: SimplifyRequest) => Promise<number | null>;

/**
 * One decade of preferred numbers, a quarter apart or so. Every tolerance the
 * slider can be left on is one of these times a power of ten, so the readout
 * only ever shows a number someone would have typed themselves.
 */
const MANTISSAS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8];

const FIRST_DECADE = Math.round(Math.log10(MIN_TOLERANCE));

const LAST_DECADE = Math.round(Math.log10(MAX_TOLERANCE));

/**
 * The ladder the slider climbs: every mantissa in every decade of the range,
 * rounded off the floating-point dust `1.2 * 0.1` leaves behind so the value
 * applied is exactly the one the readout shows.
 */
export const STEPS: number[] = Array.from(
  { length: LAST_DECADE - FIRST_DECADE + 1 },
  (_, i) => FIRST_DECADE + i,
).flatMap((decade) =>
  MANTISSAS.map((mantissa) =>
    Number((mantissa * 10 ** decade).toPrecision(2)),
  ).filter((meters) => meters <= MAX_TOLERANCE),
);

/** Position zero is off the ladder, and means no simplification. */
function positionToMeters(position: number): number {
  return position <= 0 ? 0 : (STEPS[position - 1] ?? MAX_TOLERANCE);
}

/** The first rung at least this coarse — never one that thins less than asked. */
function metersToPosition(meters: number): number {
  if (meters <= 0) {
    return 0;
  }

  const at = STEPS.findIndex((step) => step >= meters);

  return at === -1 ? STEPS.length : at + 1;
}

// The dialog's value is the slider position, not the factor it stands for:
// several positions round to the same factor at the fine end, and driving the
// slider off the factor would snap the thumb back out of them.
function SimplifyBody({
  lines,
  rings,
  preamble,
  value,
  setValue,
}: ModalBodyProps<number> &
  Pick<SimplifyRequest, 'lines' | 'rings' | 'preamble'>) {
  const m = useMessages();

  const nf = useNumberFormat({ maximumFractionDigits: 0 });

  const nfm = useNumberFormat({
    style: 'unit',
    unit: 'meter',
    maximumSignificantDigits: 2,
  });

  // The count trails the slider: it walks every vertex of the lines, and an OSM
  // relation can be tens of thousands. Memoized on the deferred value, or every
  // urgent render would walk them anyway and the thumb would stall.
  const deferred = useDeferredValue(value);

  const after = useMemo(
    () => verticesAt(lines, positionToMeters(deferred), rings),
    [lines, deferred, rings],
  );

  const meters = positionToMeters(value);

  const before = vertexCount(lines, rings);

  return (
    <>
      {preamble !== undefined && <p>{preamble}</p>}

      <Form.Label htmlFor="simplify-deviation">
        {m?.general.simplify.deviation}
      </Form.Label>

      <Form.Range
        id="simplify-deviation"
        min={0}
        max={STEPS.length}
        value={value}
        onChange={(e) => setValue(Number(e.currentTarget.value))}
      />

      <div className="d-flex justify-content-between small">
        <span>
          {meters === 0 ? m?.general.simplify.none : nfm.format(meters)}
        </span>

        <span className="text-body-secondary">
          {m?.general.simplify.vertices({
            from: nf.format(before),
            to: nf.format(after),
          })}
        </span>
      </div>
    </>
  );
}

/**
 * The dialog for this request, or `null` where there is nothing to ask: lines
 * thin enough to leave alone, with no warning to show and no explicit ask.
 */
function simplifyModal(
  request: SimplifyRequest,
  m: Messages | undefined,
): ModalOptions<number> | null {
  const suggested = suggestSimplifyTolerance(request.lines);

  if (!suggested && !request.preamble && !request.always) {
    return null;
  }

  return {
    title: m?.general.simplify.title,
    icon: <FaCompressAlt />,
    confirmLabel: m?.general.simplify.title,
    // A slider with a readout under it needs more room than a question does.
    size: 'md',
    initialValue: metersToPosition(suggested),
    body: (props) => (
      <SimplifyBody
        {...props}
        lines={request.lines}
        rings={request.rings}
        preamble={request.preamble}
      />
    ),
  };
}

/** Nothing to ask means nothing to simplify; anything but confirm is a cancel. */
function toTolerance(answer: ModalAnswer<number> | null): number | null {
  return answer === null
    ? 0
    : answer.result === 'confirm'
      ? positionToMeters(answer.value)
      : null;
}

/**
 * Asks how much to simplify, the slider filled in with a factor derived from
 * the geometry itself. For components prefer {@link useSimplifyPrompt}.
 */
export async function askSimplification(
  request: SimplifyRequest,
): Promise<number | null> {
  const modal = simplifyModal(request, getMessages());

  return toTolerance(modal && (await openModal(modal)));
}

/** {@link askSimplification} as a hook, so the dialog goes with its caller. */
export function useSimplifyPrompt(): SimplifyFn {
  const open = useModal();

  const m = useMessages();

  return useCallback(
    async (request) => {
      const modal = simplifyModal(request, m);

      return toTolerance(modal && (await open(modal)));
    },
    [open, m],
  );
}
