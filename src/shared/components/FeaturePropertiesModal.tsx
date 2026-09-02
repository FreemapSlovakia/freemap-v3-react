import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { DrawingLineStyleFields } from '@features/drawing/components/DrawingLineStyleFields.js';
import {
  DrawingPropsEditor,
  propsToRows,
  rowsToProps,
} from '@features/drawing/components/DrawingPropsEditor.js';
import type {
  DrawingLineType,
  LineCap,
  LineJoin,
} from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import { COLORS } from '@shared/colors.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { parseIconSpec } from '@shared/drawingIcons.js';
import { isInvalidFloat } from '@shared/numberValidator.js';
import {
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTag, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import classes from './FeaturePropertiesModal.module.css';

/**
 * Everything the modal edits, whatever holds it. The caller resolves each field
 * to what the feature actually shows on the map, so an unstyled one arrives
 * with the defaults it is drawn with rather than blank.
 */
export type FeatureProperties = {
  label: string;
  props: DrawingProps | undefined;
  color: string;
  markerType: MarkerType;
  icon: string;
  type: DrawingLineType;
  fillColor: string | undefined;
  width: number | undefined;
  dashArray: number[];
  lineCap: LineCap;
  lineJoin: LineJoin;
};

/**
 * The hint under the label field and the token a property key writes into it.
 * Absent where a label is plain text, which also hides the rows' tag button.
 */
type Placeholders = {
  hint: (type: DrawingLineType) => ReactNode;
  token: (key: string) => string;
};

type Props = {
  show: boolean;
  kind: 'point' | 'line-poly';
  initial: FeatureProperties;
  /** Whether the geometry can close, which is what the line↔polygon switch needs. */
  closable: boolean;
  placeholders?: Placeholders;
  /** Returning `true` says it handled the submit itself, and keeps it open. */
  onSave: (values: FeatureProperties) => boolean | undefined;
};

export function FeaturePropertiesModal({
  show,
  kind,
  initial,
  closable,
  placeholders,
  onSave,
}: Props): ReactElement {
  const m = useMessages();

  const dm = useDrawingMessages();

  const [editedLabel, setEditedLabel] = useState(initial.label);

  const [editedRows, setEditedRows] = useState(() =>
    propsToRows(initial.props),
  );

  const [editedColor, setEditedColor] = useState(initial.color);

  const [editedMarkerType, setEditedMarkerType] = useState(initial.markerType);

  const [editedIcon, setEditedIcon] = useState(initial.icon);

  const [editedFillColor, setEditedFillColor] = useState(initial.fillColor);

  const [editedWidth, setEditedWidth] = useState(
    initial.width === undefined ? '4' : String(initial.width),
  );

  const [editedType, setEditedType] = useState(initial.type);

  const [editedDash, setEditedDash] = useState(initial.dashArray);

  const [editedLineCap, setEditedLineCap] = useState(initial.lineCap);

  const [editedLineJoin, setEditedLineJoin] = useState(initial.lineJoin);

  const editedIconSpec = parseIconSpec(editedIcon);

  // The label field, so a property can be written in at the cursor.
  const labelRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertKey = (key: string) => {
    const el = labelRef.current;

    const token = placeholders?.token(key) ?? '';

    // A textarea reports a selection of 0..0 whether the caret is genuinely at
    // the start or has never been in the field at all, so being focused is what
    // tells a caret to write at from no caret to append after.
    const caret =
      el && document.activeElement === el
        ? { at: el.selectionStart, end: el.selectionEnd }
        : undefined;

    setEditedLabel((text) => {
      const { at, end } = caret ?? { at: text.length, end: text.length };

      return text.slice(0, at) + token + text.slice(end);
    });

    // The caret follows what was written, so pressing several in a row reads in
    // the order they were pressed.
    if (el) {
      const at = (caret?.at ?? el.value.length) + token.length;

      requestAnimationFrame(() => {
        el.focus();

        el.setSelectionRange(at, at);
      });
    }
  };

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const handled = onSave({
      label: editedLabel,
      props: rowsToProps(editedRows),
      color: editedColor,
      markerType: editedMarkerType,
      icon: editedIcon,
      type: editedType,
      fillColor: editedFillColor,
      width: parseFloat(editedWidth) || undefined,
      dashArray: editedDash,
      lineCap: editedLineCap,
      lineJoin: editedLineJoin,
    });

    if (!handled) {
      close();
    }
  };

  const handleLocalLabelChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEditedLabel(e.currentTarget.value);
  };

  // A point has no width field, so a width it happens to carry cannot be the
  // thing standing between the user and Save.
  const invalidWidth =
    kind === 'line-poly' && isInvalidFloat(editedWidth, false, 1, 99);

  useDocumentTitle(show ? dm?.edit.title : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The color picker's popover is portalled to <body> (outside this
      // modal's DOM), so the modal's focus trap would steal focus from its
      // inputs the moment they're focused. Disable enforceFocus so R/G/B/A/HEX
      // (and the sliders) stay editable.
      enforceFocus={false}
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTag /> {dm?.edit.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="label">
            <Form.Label>{dm?.edit.label}</Form.Label>

            {/* A textarea because a label may run to several lines — which
                also means Enter breaks the line instead of submitting, and the
                Save button is the way out. */}
            <Form.Control
              autoFocus
              ref={labelRef}
              as="textarea"
              rows={2}
              value={editedLabel}
              onChange={handleLocalLabelChange}
            />

            {placeholders && (
              <Form.Text muted>{placeholders.hint(editedType)}</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <DrawingPropsEditor
              rows={editedRows}
              onChange={setEditedRows}
              onInsertKey={placeholders && handleInsertKey}
            />
          </Form.Group>

          {kind === 'line-poly' ? (
            <>
              <DrawingLineStyleFields
                color={editedColor || COLORS.normal}
                onColorChange={setEditedColor}
                fillColor={
                  editedType === 'polygon' ? editedFillColor : undefined
                }
                onFillColorChange={
                  editedType === 'polygon' ? setEditedFillColor : undefined
                }
                width={editedWidth}
                onWidthChange={setEditedWidth}
                invalidWidth={invalidWidth}
                lineCap={editedLineCap}
                onLineCapChange={setEditedLineCap}
                lineJoin={editedLineJoin}
                onLineJoinChange={setEditedLineJoin}
                dashArray={editedDash}
                onDashArrayChange={setEditedDash}
              />

              <Form.Group controlId="type" className="mt-3">
                <Form.Label>{dm?.edit.type}</Form.Label>

                <Form.Select
                  value={editedType}
                  onChange={(e) => {
                    const newType = e.currentTarget.value as DrawingLineType;

                    setEditedType(newType);

                    if (newType === 'polygon' && !editedFillColor) {
                      setEditedFillColor(editedColor);
                    }
                  }}
                  disabled={!closable}
                >
                  <option value="line">{m?.selections.drawLines}</option>
                  <option value="polygon">{m?.selections.drawPolygons}</option>
                </Form.Select>
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Group controlId="color" className="mt-3">
                <Form.Label>{dm?.edit.color}</Form.Label>

                <RgbaColorPicker
                  value={editedColor || COLORS.normal}
                  onChange={setEditedColor}
                />
              </Form.Group>

              <Form.Group controlId="markerType" className="mt-3">
                <Form.Label>{dm?.edit.shape}</Form.Label>

                <MarkerTypeSelect
                  asSelect
                  value={editedMarkerType}
                  onChange={setEditedMarkerType}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <div className={classes.iconTextGrid}>
                  <Form.Label htmlFor="icon" className={classes.iconLabel}>
                    {m?.general.icon}
                  </Form.Label>

                  <div className={classes.icon}>
                    <IconPicker
                      id="icon"
                      selected={
                        editedIconSpec?.kind === 'fa' ||
                        editedIconSpec?.kind === 'poi'
                          ? editedIcon
                          : undefined
                      }
                      onSelect={(spec) => setEditedIcon(spec ?? '')}
                    />
                  </div>

                  <Form.Label htmlFor="text" className={classes.textLabel}>
                    {dm?.edit.text}
                  </Form.Label>

                  <Form.Control
                    id="text"
                    className={classes.text}
                    type="text"
                    maxLength={2}
                    value={
                      editedIconSpec?.kind === 'text' ? editedIconSpec.text : ''
                    }
                    onChange={(e) => setEditedIcon(e.currentTarget.value)}
                  />
                </div>

                <Form.Text muted>{dm?.edit.textHint}</Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" variant="primary" disabled={invalidWidth}>
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
