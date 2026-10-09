import type { BatchField } from '@shared/batchProperties.js';
import type { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaPen, FaUndo } from 'react-icons/fa';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

/** A batch edit's hold on the fields (or property keys) its features differ in. */
export type Mixed<K = BatchField> = {
  differs: (field: K) => boolean;
  kept: (field: K) => boolean;
  setKept: (field: K, kept: boolean) => void;
};

/**
 * A field the features edited together differ in: kept, each feature's own,
 * until Change brings up the control; Keep takes it back.
 */
export function MixedField({
  field,
  mixed,
  children,
}: {
  field: BatchField;
  mixed: Mixed | undefined;
  children: ReactNode;
}): ReactElement {
  const dm = useDrawingMessages();

  if (!mixed?.differs(field)) {
    return <>{children}</>;
  }

  return mixed.kept(field) ? (
    <div className="d-flex align-items-center gap-2">
      <span className="text-body-secondary">{dm?.edit.different}</span>

      <Button variant="secondary" onClick={() => mixed.setKept(field, false)}>
        <FaPen /> {dm?.edit.change}
      </Button>
    </div>
  ) : (
    <div className="d-flex align-items-start gap-1">
      <div className="flex-grow-1">{children}</div>

      <Button variant="secondary" onClick={() => mixed.setKept(field, true)}>
        <FaUndo /> {dm?.edit.keep}
      </Button>
    </div>
  );
}
