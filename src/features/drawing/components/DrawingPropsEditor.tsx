import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaTag, FaTrash } from 'react-icons/fa';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

/**
 * Rows rather than a record while editing: a half-typed key is briefly empty or
 * a duplicate of another, and a record would drop or merge the row under the
 * cursor. Folded back into a record on save.
 */
export type PropRow = [key: string, value: string];

export function propsToRows(props: DrawingProps | undefined): PropRow[] {
  return Object.entries(props ?? {});
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
  /** Puts `{key}` into the label being edited, at the cursor. */
  onInsertKey: (key: string) => void;
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
}: Props): ReactElement {
  const m = useDrawingMessages();

  const replace = (i: number, row: PropRow) =>
    onChange(rows.map((old, j) => (i === j ? row : old)));

  return (
    <>
      {/* A block, so the button below starts its own line whether or not there
          are rows between them. */}
      <Form.Label className="d-block mb-1">{m?.edit.properties}</Form.Label>

      {rows.map(([key, value], i) => (
        // Rows are identified by position: the key is what's being typed, so it
        // is neither stable nor unique while the user is in it.
        <InputGroup key={i} className="mb-1">
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

          <Form.Control
            value={key}
            placeholder={m?.edit.propertyKey}
            onChange={(e) => replace(i, [e.currentTarget.value, value])}
          />

          <Form.Control
            value={value}
            placeholder={m?.edit.propertyValue}
            onChange={(e) => replace(i, [key, e.currentTarget.value])}
          />

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
      ))}

      <Button
        variant="secondary"
        size="sm"
        className="mt-1"
        onClick={() => onChange([...rows, ['', '']])}
      >
        <FaPlus /> {m?.edit.addProperty}
      </Button>
    </>
  );
}
