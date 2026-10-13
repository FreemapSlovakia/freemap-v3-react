import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type CSSProperties, type ReactElement, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import {
  PRINT_FIELDS,
  type PrintField,
  type PrintInput,
  type PrintLimits,
  type PrintResult,
} from '../model/printScale.js';
import { useMapToDocumentExportMessages } from '../translations/useMapToDocumentExportMessages.js';

/** Everything but the DPI, which lives in the persisted settings. */
export type PrintDraft = Omit<PrintInput, 'dpi'>;

type Props = {
  draft: PrintDraft;
  onDraftChange: (draft: PrintDraft) => void;
  dpi: string;
  onDpiChange: (dpi: string) => void;
  /** `null` while there is no area. */
  result: PrintResult | null;
  limits: PrintLimits;
};

export function toNumber(text: string) {
  return text.trim() === '' ? NaN : Number(text);
}

/** Shows what is typed while focused, and the resolved value otherwise. */
function NumberField({
  value,
  onEdit,
  width,
  fill,
  invalid,
  disabled,
  min,
  max,
  step,
}: {
  value: string;
  onEdit: (text: string) => void;
  width: string;
  fill?: boolean;
  invalid: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step: number;
}) {
  const [text, setText] = useState<string | null>(null);

  // With `fill`, a minimum only: the input fills a group made wider by its label.
  const style: CSSProperties = fill
    ? { minWidth: width }
    : { minWidth: 0, width };

  return (
    <Form.Control
      type="number"
      value={text ?? value}
      min={min}
      max={max}
      step={step}
      style={style}
      isInvalid={invalid}
      disabled={disabled}
      onFocus={() => setText(value)}
      onBlur={() => setText(null)}
      onChange={(e) => {
        setText(e.currentTarget.value);

        onEdit(e.currentTarget.value);
      }}
    />
  );
}

function Lock({
  locked,
  label,
  hint,
  disabled,
  onClick,
}: {
  locked: boolean;
  label: string | undefined;
  hint?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <LongPressTooltip label={label} hint={hint}>
      {({ props }) => (
        <Button
          variant="outline-primary"
          active={locked}
          disabled={disabled}
          onClick={onClick}
          {...props}
        >
          {locked ? <FaLock /> : <FaLockOpen />}
        </Button>
      )}
    </LongPressTooltip>
  );
}

export function PrintSizeFields({
  draft,
  onDraftChange,
  dpi,
  onDpiChange,
  result,
  limits,
}: Props): ReactElement {
  const m = useMapToDocumentExportMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const print = result?.ok ? result.print : null;

  // Shown even when invalid, so the failing value is the one on display.
  const shown = result?.print ?? null;

  const invalid = result && !result.ok ? result.invalid : null;

  const { paper, locked } = draft;

  const nf = (digits: number) =>
    new Intl.NumberFormat(language, { maximumFractionDigits: digits });

  // Plain digits, as a number input takes them.
  const plain = (value: number, digits = 0) =>
    String(Number(value.toFixed(digits)));

  const isLocked = (field: PrintField) => locked.includes(field);

  // Fixed by the other two being locked.
  const isFixed = (field: PrintField) =>
    PRINT_FIELDS.every((f) => f === field || isLocked(f));

  // A typed value is never recomputed.
  const edit = (field: PrintField, patch: Partial<PrintDraft>) => {
    onDraftChange({
      ...draft,
      ...patch,
      locked: isLocked(field) ? locked : [...locked, field],
    });
  };

  const toggleLock = (field: PrintField) => {
    if (isLocked(field)) {
      onDraftChange({
        ...draft,
        // An unlocked scale follows the zoom.
        ...(field === 'paper' ? { paper: null } : {}),
        locked: locked.filter((f) => f !== field),
      });

      return;
    }

    if (!print) {
      return;
    }

    // A derived value becomes a typed one, so it stays as shown.
    const patch: Partial<PrintDraft> =
      field === 'paper'
        ? { paper: { by: 'cm', value: print.cm.width } }
        : field === 'px'
          ? { px: print.px.width }
          : {};

    if (field === 'dpi') {
      onDpiChange(String(print.dpi));
    }

    onDraftChange({ ...draft, ...patch, locked: [...locked, field] });
  };

  const lockProps = (field: PrintField) => ({
    locked: isLocked(field),
    label: isLocked(field) ? m?.unlock : m?.lock,
    disabled: !isLocked(field) && (isFixed(field) || !print),
    onClick: () => toggleLock(field),
  });

  const percent = print ? Math.round(print.enlargement * 100) : null;

  return (
    <fieldset className="mt-3 border rounded p-3">
      <legend>{m?.sizeTitle}</legend>

      <div className="d-flex flex-wrap gap-3">
        <Form.Group controlId="mapZoom">
          <Form.Label className="d-block">{m?.zoom}</Form.Label>

          <NumberField
            value={Number.isNaN(draft.zoom) ? '' : String(draft.zoom)}
            min={limits.minZoom}
            max={limits.maxZoom}
            step={1}
            width="calc(2ch + 3rem)"
            fill
            invalid={invalid === 'zoom'}
            onEdit={(text) =>
              // An unlocked scale follows the zoom.
              onDraftChange({
                ...draft,
                zoom: toNumber(text),
                paper: isLocked('paper') ? paper : null,
              })
            }
          />
        </Form.Group>

        <Form.Group controlId="printScale">
          <Form.Label className="d-block">{m?.printScale}</Form.Label>

          <InputGroup className="d-inline-flex w-auto flex-nowrap">
            <InputGroup.Text>1 :</InputGroup.Text>

            <NumberField
              value={
                shown
                  ? String(Number(shown.denominator.toPrecision(3)))
                  : paper?.by === 'scale'
                    ? String(paper.value)
                    : ''
              }
              min={0}
              step={1000}
              width="calc(7ch + 3rem)"
              invalid={invalid === 'paper'}
              disabled={isFixed('paper')}
              onEdit={(text) =>
                edit('paper', {
                  paper: { by: 'scale', value: toNumber(text) },
                })
              }
            />

            <Lock
              {...lockProps('paper')}
              hint={isLocked('paper') ? undefined : m?.scaleFollowsZoom}
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="printSize">
          <Form.Label className="d-block">{m?.printSize}</Form.Label>

          <InputGroup className="d-inline-flex w-auto flex-nowrap">
            <NumberField
              value={
                shown
                  ? plain(shown.cm.width, 1)
                  : paper?.by === 'cm'
                    ? String(paper.value)
                    : ''
              }
              min={0}
              step={1}
              width="calc(5ch + 3rem)"
              invalid={invalid === 'paper'}
              disabled={isFixed('paper')}
              onEdit={(text) =>
                edit('paper', { paper: { by: 'cm', value: toNumber(text) } })
              }
            />

            <InputGroup.Text>
              × {shown ? nf(1).format(shown.cm.height) : '…'} cm
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="mapScale">
          <Form.Label className="d-block">{m?.mapScale}</Form.Label>

          <InputGroup className="d-inline-flex w-auto flex-nowrap">
            <NumberField
              value={shown ? plain(shown.dpi) : dpi}
              min={limits.minDpi}
              max={limits.maxDpi}
              step={10}
              width="calc(3ch + 3rem)"
              invalid={invalid === 'dpi'}
              disabled={isFixed('dpi')}
              onEdit={(text) => {
                onDpiChange(text);

                edit('dpi', {});
              }}
            />

            <InputGroup.Text>DPI</InputGroup.Text>

            <Lock {...lockProps('dpi')} />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="imageSize">
          <Form.Label className="d-block">{m?.imageSize}</Form.Label>

          <InputGroup className="d-inline-flex w-auto flex-nowrap">
            <NumberField
              value={
                shown
                  ? String(shown.px.width)
                  : draft.px !== null
                    ? String(draft.px)
                    : ''
              }
              min={0}
              step={100}
              width="calc(6ch + 3rem)"
              invalid={invalid === 'px'}
              disabled={isFixed('px')}
              onEdit={(text) => edit('px', { px: toNumber(text) })}
            />

            <InputGroup.Text>
              × {shown ? nf(0).format(shown.px.height) : '…'} px
            </InputGroup.Text>

            <Lock {...lockProps('px')} />
          </InputGroup>
        </Form.Group>
      </div>

      {percent !== null && percent !== 100 && (
        <Form.Text
          as="p"
          className={
            percent < 50 || percent > 200
              ? 'text-warning mt-2 mb-0'
              : 'mt-2 mb-0'
          }
        >
          {m?.symbolSize({ percent })}
        </Form.Text>
      )}
    </fieldset>
  );
}
