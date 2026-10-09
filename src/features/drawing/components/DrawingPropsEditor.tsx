import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaPen, FaPlus, FaTag, FaTrash, FaUndo } from 'react-icons/fa';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import type { Mixed } from './MixedField.js';

/**
 * Rows rather than a record while editing: a half-typed key is briefly empty or
 * a duplicate of another, and a record would drop or merge the row under the
 * cursor. Folded back into a record on save.
 */
export type PropRow = [key: string, value: string, origin?: string];

/** Each row remembers the key it was opened with, which a batch edit maps back by. */
export function propsToRows(props: DrawingProps | undefined): PropRow[] {
  return Object.entries(props ?? {}).map(([key, value]) => [key, value, key]);
}

/**
 * Unnamed rows are dropped; a repeated key keeps the last one written. Keys are
 * trimmed, because that is the form the tag button writes into a label — stored
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
  onChange: (rows: PropRow[]) => void;
  /**
   * Puts `{key}` into the label being edited, at the cursor. Absent where the
   * label is plain text and has nothing to write into it.
   */
  onInsertKey?: (key: string) => void;
  /** Keys, by the key a row was opened with, that features edited together differ in. */
  mixed?: Mixed<string>;
};

/**
 * The feature's own data — the OSM tags a converted object arrived with, or
 * whatever the user adds. Each key doubles as a button that writes `{key}` into
 * the label, which is how the placeholders are discovered: the user picks from
 * data they can see rather than recalling a syntax.
 */
export function DrawingPropsEditor({
  rows,
  onChange,
  onInsertKey,
  mixed,
}: Props): ReactElement {
  const m = useDrawingMessages();

  const replace = (i: number, row: PropRow) =>
    onChange(rows.map((old, j) => (i === j ? row : old)));

  return (
    <>
      {/* A block, so the button below starts its own line whether or not there
          are rows between them. */}
      <Form.Label className="d-block mb-1">{m?.edit.properties}</Form.Label>

      {rows.map(([key, value, origin], i) => {
        // By the key the row was opened with, which renaming leaves alone.
        const differing =
          origin !== undefined && mixed?.differs(origin)
            ? { mixed, origin }
            : undefined;

        return (
          // Rows are identified by position: the key is what's being typed, so it
          // is neither stable nor unique while the user is in it.
          <InputGroup key={i} className="mb-1">
            {onInsertKey && (
              <LongPressTooltip label={m?.edit.insertIntoLabel}>
                {({ props }) => (
                  <Button
                    variant="secondary"
                    disabled={!key.trim()}
                    onClick={() => onInsertKey(key.trim())}
                    {...props}
                  >
                    <FaTag />
                  </Button>
                )}
              </LongPressTooltip>
            )}

            <Form.Control
              // A set width, so the columns line up whatever buttons a row has.
              style={{ flex: '0 0 40%' }}
              value={key}
              placeholder={m?.edit.propertyKey}
              onChange={(e) =>
                replace(i, [e.currentTarget.value, value, origin])
              }
            />

            {differing?.mixed.kept(differing.origin) ? (
              <>
                <InputGroup.Text className="flex-grow-1 text-body-secondary">
                  {m?.edit.different}
                </InputGroup.Text>

                <LongPressTooltip label={m?.edit.change}>
                  {({ props }) => (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        differing.mixed.setKept(differing.origin, false)
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
                <Form.Control
                  value={value}
                  placeholder={m?.edit.propertyValue}
                  onChange={(e) =>
                    replace(i, [key, e.currentTarget.value, origin])
                  }
                />

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

            <LongPressTooltip label={m?.edit.removeProperty}>
              {({ props }) => (
                <Button
                  variant="danger"
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  {...props}
                >
                  <FaTrash />
                </Button>
              )}
            </LongPressTooltip>
          </InputGroup>
        );
      })}

      <Button variant="secondary" onClick={() => onChange([...rows, ['', '']])}>
        <FaPlus /> {m?.edit.addProperty}
      </Button>
    </>
  );
}
