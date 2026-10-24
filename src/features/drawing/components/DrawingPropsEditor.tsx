import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { Text } from '@features/l10n/Text.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  type PropType,
  type PropTypes,
  typedValue,
} from '@shared/featureProperties.js';
import { isInputNumber } from '@shared/numberValidator.js';
import { type ReactElement, useState, type WheelEvent } from 'react';
import { Button, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { FaPen, FaTrash, FaUndo } from 'react-icons/fa';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import type { Mixed } from './MixedField.js';

/**
 * Rows rather than a record while editing: a half-typed key is briefly empty or
 * a duplicate of another, and a record would drop or merge the row under the
 * cursor. Folded back into a record on save.
 */
export type PropRow = [
  key: string,
  value: string,
  origin?: string,
  type?: PropType,
];

/** Each row remembers the key it was opened with, which a batch edit maps back by. */
export function propsToRows(
  props: DrawingProps | undefined,
  types?: Readonly<PropTypes>,
): PropRow[] {
  return Object.entries(props ?? {}).map(([key, value]) => [
    key,
    value,
    key,
    types?.[key],
  ]);
}

/** The rows' types, by key as {@link rowsToProps} folds them. */
export function rowsToTypes(rows: PropRow[]): PropTypes {
  return Object.fromEntries(
    rows
      .map(([key, , , type]): [string, PropType] => [
        key.trim(),
        type ?? 'text',
      ])
      .filter(([key]) => key),
  );
}

export const isValidRow = ([, value, , type]: PropRow) =>
  typedValue(value, type ?? 'text') !== undefined;

/**
 * No name and no value, whatever its type: save skips it. A `true`, `false` or
 * `null` row shows no value, so any text it kept from another type is none.
 */
export const isBlankRow = ([key, value, , type]: PropRow) =>
  !key.trim() &&
  (value === '' || type === 'true' || type === 'false' || type === 'null');

export type KeyProblem = 'missing' | 'duplicate';

/** Whether a batch row keeps each feature's own value. */
export const keptOf = (mixed: Mixed<string>) => (origin: string) =>
  mixed.differs(origin) && mixed.kept(origin);

/**
 * Each row's name problem, if any; a blank row is none, as save skips it.
 * `kept` says a batch row keeps each feature's value: its emptied name is
 * still the one it was opened with.
 */
export function keyProblems(
  rows: readonly PropRow[],
  kept?: (origin: string) => boolean,
): (KeyProblem | undefined)[] {
  const names = rows.map(
    ([key, , origin]) =>
      key.trim() || (origin !== undefined && kept?.(origin) ? origin : ''),
  );

  const counts = new Map<string, number>();

  for (const name of names) {
    if (name) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  return rows.map((row, i) => {
    const name = names[i]!;

    if (!name) {
      return isBlankRow(row) ? undefined : 'missing';
    }

    return counts.get(name)! > 1 ? 'duplicate' : undefined;
  });
}

/** What the type button shows; the three without a field say their value. */
const TYPE_SYMBOLS: Record<PropType, string> = {
  text: 'Aa',
  multiline: '¶',
  number: '#',
  true: 'true',
  false: 'false',
  null: 'null',
  json: 'JSON',
};

const INLINE_VALUE: ReadonlySet<PropType> = new Set(['text', 'number']);

const BOXED_VALUE: ReadonlySet<PropType> = new Set(['multiline', 'json']);

/**
 * Unnamed rows are dropped; a repeated key keeps the last one written. Keys are
 * trimmed, because that is the form a label's `{p:key}` names them by — stored
 * raw, a key typed with a stray space would never match its own `{name}`.
 */
export function rowsToProps(rows: PropRow[]): DrawingProps {
  return Object.fromEntries(
    rows
      .map(([key, value]): PropRow => [key.trim(), value])
      .filter(([key]) => key),
  );
}

type Props = {
  rows: PropRow[];
  /** Offers each row's type; without, every value is text. */
  typed?: boolean;
  onChange: (rows: PropRow[]) => void;
  /** Keys, by the key a row was opened with, that features edited together differ in. */
  mixed?: Mixed<string>;
};

/**
 * The feature's own data — the OSM tags a converted object arrived with, or
 * whatever the user adds.
 */
export function DrawingPropsEditor({
  rows,
  typed,
  onChange,
  mixed,
}: Props): ReactElement {
  const m = useDrawingMessages();

  // The row whose type menu is open.
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // An empty row at the end is where a property is added; typing into it makes
  // it a row of its own, and another empty one appears.
  const lastRow = rows.at(-1);

  const shownRows: PropRow[] =
    lastRow && isBlankRow(lastRow) ? rows : [...rows, ['', '']];

  const replace = (i: number, row: PropRow) =>
    onChange(i < rows.length ? rows.with(i, row) : [...rows, row]);

  const problems = keyProblems(shownRows, mixed && keptOf(mixed));

  return (
    <>
      <Form.Label>
        <Text m={m} k="edit.properties" />
      </Form.Label>

      {shownRows.map(([key, value, origin, type = 'text'], i) => {
        // By the key the row was opened with, which renaming leaves alone.
        const differing =
          origin !== undefined && mixed?.differs(origin)
            ? { mixed, origin }
            : undefined;

        // Untyped (a batch edit), every value is text.
        const shown = typed ? type : 'text';

        const invalid =
          typed &&
          !isBlankRow([key, value, origin, type]) &&
          !isValidRow([key, value, origin, type]);

        const kept = differing?.mixed.kept(differing.origin);

        // A multi-line or JSON value gets a box below, joined to the row.
        const boxed = !kept && BOXED_VALUE.has(shown);

        const errors = [
          problems[i] === 'missing' && m?.edit.propertyKeyMissing,
          problems[i] === 'duplicate' && m?.edit.propertyKeyDuplicate,
          invalid &&
            (shown === 'json'
              ? m?.edit.propertyJsonInvalid
              : m?.edit.propertyNumberInvalid),
        ].filter((error) => typeof error === 'string');

        // The rows join into one table; an error line is a strip within it.
        const first = i === 0;

        const last = i === shownRows.length - 1;

        // For the row's outer corners, where Bootstrap rounds its ends.
        const corners = [
          !first && 'rounded-top-0',
          (boxed || !last) && 'rounded-bottom-0',
        ]
          .filter(Boolean)
          .join(' ');

        const trailing = i === rows.length;

        const onValue = (text: string) => replace(i, [key, text, origin, type]);

        return (
          // Rows are identified by position: the key is what's being typed, so it
          // is neither stable nor unique while the user is in it.
          <div
            key={i}
            // Up by the border's width, so neighbouring rows share one.
            style={first ? undefined : { marginTop: -1 }}
            className={last ? 'mb-2' : undefined}
          >
            <InputGroup>
              <Form.Control
                className={corners}
                // A set width, so the columns line up whatever the value is.
                style={{ flex: '0 0 40%' }}
                isInvalid={problems[i] !== undefined}
                value={key}
                placeholder={m?.edit.propertyKey}
                onChange={(e) =>
                  replace(i, [e.currentTarget.value, value, origin, type])
                }
              />

              {typed && (
                <Dropdown
                  show={openMenu === i}
                  onToggle={(show) => setOpenMenu(show ? i : null)}
                  onSelect={(t) =>
                    t && replace(i, [key, value, origin, t as PropType])
                  }
                >
                  {/* Drawn as a select, caret at its end. One width where a
                      value follows, so the values line up; else up to the
                      trash, the name keeping its width. */}
                  <Dropdown.Toggle
                    as="button"
                    type="button"
                    bsPrefix="form-select"
                    className={
                      INLINE_VALUE.has(shown)
                        ? 'text-start'
                        : 'text-start flex-grow-1'
                    }
                    style={
                      INLINE_VALUE.has(shown)
                        ? { flex: '0 0 4.25rem' }
                        : { width: 'auto' }
                    }
                  >
                    {TYPE_SYMBOLS[type]}
                  </Dropdown.Toggle>

                  {/* Mounted while open only: inside an input group the menu
                      is otherwise rendered, popper and all, for every row. */}
                  {openMenu === i && (
                    <Dropdown.Menu>
                      {(Object.keys(TYPE_SYMBOLS) as PropType[]).map((t) => (
                        <Dropdown.Item key={t} eventKey={t} active={t === type}>
                          <code>{TYPE_SYMBOLS[t]}</code>
                          {t === 'text'
                            ? ` ${m?.edit.propertyTypeText ?? ''}`
                            : t === 'multiline'
                              ? ` ${m?.edit.propertyTypeMultiline ?? ''}`
                              : t === 'number'
                                ? ` ${m?.edit.propertyTypeNumber ?? ''}`
                                : ''}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  )}
                </Dropdown>
              )}

              {kept ? (
                <>
                  <InputGroup.Text className="flex-grow-1 text-body-secondary">
                    <Text m={m} k="edit.different" />
                  </InputGroup.Text>

                  <LongPressTooltip label={m?.edit.change}>
                    {({ props }) => (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          differing!.mixed.setKept(differing!.origin, false)
                        }
                        {...props}
                      >
                        <FaPen />
                      </Button>
                    )}
                  </LongPressTooltip>
                </>
              ) : (
                <>
                  {INLINE_VALUE.has(shown) && (
                    <Form.Control
                      // A number input blanks what it can't show, so other
                      // text stays a text input, to be seen and fixed. Wheeling
                      // a focused one steps it, so the wheel scrolls instead.
                      {...(shown === 'number' &&
                        (value === '' || isInputNumber(value)) && {
                          type: 'number',
                          step: 'any',
                          onWheel: (e: WheelEvent<HTMLInputElement>) =>
                            e.currentTarget.blur(),
                        })}
                      isInvalid={invalid}
                      value={value}
                      placeholder={m?.edit.propertyValue}
                      onChange={(e) => onValue(e.currentTarget.value)}
                    />
                  )}

                  {differing && (
                    <LongPressTooltip label={m?.edit.keep}>
                      {({ props }) => (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            differing.mixed.setKept(differing.origin, true)
                          }
                          {...props}
                        >
                          <FaUndo />
                        </Button>
                      )}
                    </LongPressTooltip>
                  )}
                </>
              )}

              {/* Disabled on the empty row at the end, which has nothing to
                  delete but keeps the columns. */}
              <LongPressTooltip label={m?.edit.removeProperty}>
                {({ props }) => (
                  <Button
                    variant="danger"
                    className={corners}
                    disabled={trailing}
                    onClick={() => onChange(rows.toSpliced(i, 1))}
                    {...props}
                  >
                    <FaTrash />
                  </Button>
                )}
              </LongPressTooltip>
            </InputGroup>

            {boxed && (
              <Form.Control
                as="textarea"
                // Up by the border's width, so the box and the row share one.
                style={{ marginTop: -1 }}
                // Grows with the lines written; JSON starts roomier.
                rows={Math.max(
                  shown === 'json' ? 3 : 2,
                  value.split('\n').length,
                )}
                className={[
                  'rounded-top-0',
                  !last && 'rounded-bottom-0',
                  shown === 'json' && 'font-monospace',
                ]
                  .filter(Boolean)
                  .join(' ')}
                isInvalid={invalid}
                value={value}
                placeholder={m?.edit.propertyValue}
                onChange={(e) => onValue(e.currentTarget.value)}
              />
            )}

            {errors.length > 0 && (
              <div className="invalid-feedback d-block mt-0 border-start border-end px-2 py-1">
                {errors.map((error) => (
                  <div key={error}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
