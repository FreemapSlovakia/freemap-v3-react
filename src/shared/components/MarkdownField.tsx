import { useMessages } from '@features/l10n/l10nInjector.js';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Markdown } from './Markdown.js';

type Props = {
  /** Unique within the page: names the toggle buttons. */
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  /** Said after the Markdown hint. */
  hint?: ReactNode;
};

/** A Markdown textarea with a Write/Preview switch; wrap it in a `Form.Group`. */
export function MarkdownField({
  id,
  label,
  value,
  onChange,
  rows = 5,
  hint,
}: Props): ReactElement {
  const m = useMessages();

  const [previewing, setPreviewing] = useState(false);

  return (
    <>
      <div className="d-flex align-items-end">
        <Form.Label className="me-auto">{label}</Form.Label>

        <ToggleButtonGroup
          type="radio"
          name={`${id}-mode`}
          size="sm"
          className="mb-2"
          value={previewing ? 'preview' : 'write'}
          onChange={(mode: string) => setPreviewing(mode === 'preview')}
        >
          <ToggleButton
            id={`${id}-write`}
            value="write"
            variant="outline-primary"
          >
            {m?.general.markdown.write}
          </ToggleButton>

          <ToggleButton
            id={`${id}-preview`}
            value="preview"
            variant="outline-primary"
          >
            {m?.general.markdown.preview}
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {previewing ? (
        // Framed as the field is, but not looking editable.
        <div
          className="border rounded px-3 py-2"
          style={{ overflowWrap: 'anywhere' }}
        >
          <Markdown text={value} />
        </div>
      ) : (
        <Form.Control
          as="textarea"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      )}

      {!previewing && (
        <Form.Text>
          {m?.general.markdown.hint} {hint}
        </Form.Text>
      )}
    </>
  );
}
