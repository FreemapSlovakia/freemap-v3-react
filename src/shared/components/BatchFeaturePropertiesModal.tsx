import { setActiveModal } from '@app/store/actions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import type { BatchEdit, BatchKind, batchOf } from '@shared/batchProperties.js';
import { type ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  type FeatureProperties,
  FeaturePropertiesModal,
} from './FeaturePropertiesModal.js';

type Props = {
  show: boolean;
  kind: BatchKind | undefined;
  form: ReturnType<typeof batchOf>;
  onSave: (values: FeatureProperties, edit: BatchEdit) => void;
};

/** The properties editor over a batch of features. */
export function BatchFeaturePropertiesModal({
  show,
  kind,
  form,
  onSave,
}: Props): ReactElement | null {
  const dm = useDrawingMessages();

  const dispatch = useDispatch();

  // As opened: which values differ must stay what the form's rows were made from.
  const [opened, setOpened] = useState(form);

  if (!opened && form) {
    setOpened(form);
  }

  // Nothing left to edit, as when the features were removed: no modal to stay open.
  useEffect(() => {
    if (show && !form) {
      dispatch(setActiveModal(null));
    }
  }, [show, form, dispatch]);

  if (!kind || !opened) {
    return null;
  }

  return (
    <FeaturePropertiesModal
      show={show}
      kind={opened.kind}
      initial={opened.initial}
      closable={false}
      batch={opened.batch}
      title={dm?.batch.dialogTitle({
        kind: dm.batch[kind],
        count: opened.batch.count,
      })}
      onSave={(values, edit) => {
        onSave(values, edit);

        return undefined;
      }}
    />
  );
}
