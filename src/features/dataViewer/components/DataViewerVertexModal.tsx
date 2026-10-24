import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaTable } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { channelLabel } from '../channelLabel.js';
import { dataViewerSetVertexValues } from '../model/actions.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';
import { parseVertexField, vertexEdit, vertexFields } from '../vertexValues.js';

type Props = { show: boolean };

export default function DataViewerVertexModal({
  show,
}: Props): ReactElement | null {
  const dispatch = useDispatch();

  const selection = useAppSelector((state) => state.main.selection);

  const address = selection?.type === 'vertex' ? selection : undefined;

  const feature = useAppSelector((state) =>
    address ? state.trackViewer.trackGeojson?.features[address.id] : undefined,
  );

  const vertex = useMemo(
    () =>
      feature && address
        ? vertexFields(feature, address.part, address.vertex)
        : undefined,
    [feature, address],
  );

  const gone = !vertex?.fields.length;

  // Its vertex gone or deselected: nothing left to edit.
  useEffect(() => {
    if (show && gone) {
      dispatch(setActiveModal(null));
    }
  }, [show, gone, dispatch]);

  if (gone || !address) {
    return null;
  }

  const close = () => dispatch(setActiveModal(null));

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      {/* Inside the modal, which unmounts it on hide: reopening starts afresh. */}
      <VertexForm
        key={`${address.id}/${address.part}/${address.vertex}`}
        {...vertex}
        onSave={(values) => {
          dispatch(
            dataViewerSetVertexValues({
              index: address.id,
              part: address.part,
              vertex: address.vertex,
              ...vertexEdit(values),
            }),
          );

          close();
        }}
        onClose={close}
      />
    </Modal>
  );
}

function VertexForm({
  fields,
  timeBounds,
  onSave,
  onClose,
}: ReturnType<typeof vertexFields> & {
  onSave: (values: Map<string, unknown>) => void;
  onClose: () => void;
}): ReactElement {
  const m = useMessages();

  const vm = useDataViewerMessages();

  const [texts, setTexts] = useState<Record<string, string>>({});

  const parsed = fields.map(
    (field) =>
      [
        field,
        texts[field.key] ?? field.text,
        parseVertexField(field, texts[field.key] ?? field.text, timeBounds),
      ] as const,
  );

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const values = new Map<string, unknown>();

    for (const [field, , result] of parsed) {
      if (!('value' in result)) {
        return;
      }

      values.set(field.key, result.value);
    }

    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className="d-contents">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaTable /> {vm?.vertex.menuItem}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {parsed.map(([field, text, result], i) => {
          const error = 'error' in result ? result.error : undefined;

          return (
            <Form.Group
              key={field.key}
              controlId={`vertex-${field.key}`}
              // The last one's hint is the dialog's, right under it.
              className={i < parsed.length - 1 ? 'mb-3' : undefined}
            >
              <Form.Label>{channelLabel(field.key, vm)}</Form.Label>

              <InputGroup hasValidation>
                <Form.Control
                  type={field.kind === 'time' ? 'datetime-local' : 'text'}
                  inputMode={field.kind === 'number' ? 'decimal' : undefined}
                  step={field.kind === 'time' ? 0.001 : undefined}
                  value={text}
                  onChange={(e) =>
                    setTexts({ ...texts, [field.key]: e.currentTarget.value })
                  }
                  isInvalid={error !== undefined}
                />

                {field.unit && <InputGroup.Text>{field.unit}</InputGroup.Text>}

                <Form.Control.Feedback type="invalid">
                  {error && vm?.vertex[error]}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          );
        })}

        <Form.Text as="div" muted>
          {vm?.vertex.emptyHint}
        </Form.Text>
      </Modal.Body>

      <FmModalFooter>
        <Button
          type="submit"
          disabled={parsed.some(([, , result]) => 'error' in result)}
        >
          {m?.general.save}
        </Button>

        <FmDismissButton label={m?.general.cancel} onClick={onClose} />
      </FmModalFooter>
    </form>
  );
}
