import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { DrawingLineStyleFields } from '@features/drawing/components/DrawingLineStyleFields.js';
import {
  DrawingPropsEditor,
  propsToRows,
  rowsToProps,
} from '@features/drawing/components/DrawingPropsEditor.js';
import {
  type Mixed,
  MixedField,
} from '@features/drawing/components/MixedField.js';
import { PROPERTY_PREFIX } from '@features/drawing/interpolateLabel.js';
import type {
  DrawingLineType,
  LineCap,
  LineJoin,
} from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import type { Batch, BatchEdit, BatchField } from '@shared/batchProperties.js';
import { COLORS } from '@shared/colors.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { PlaceholderHint } from '@shared/components/PlaceholderHint.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { parseIconSpec } from '@shared/drawingIcons.js';
import { useInsertAtCaret } from '@shared/hooks/useInsertAtCaret.js';
import { isInvalidFloat } from '@shared/numberValidator.js';
import {
  Fragment,
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTag } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import classes from './FeaturePropertiesModal.module.css';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from './FmModalFooter.js';

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

type Props = {
  show: boolean;
  /** `all` edits points and lines together, with the style fields of both. */
  kind: 'point' | 'line-poly' | 'all';
  initial: FeatureProperties;
  /** Whether the geometry can close, which is what the line↔polygon switch needs. */
  closable: boolean;
  /** Edits many features at once, `initial` being what they share. */
  batch?: Batch;
  title?: string;
  /**
   * Returning `true` says it handled the submit itself, and keeps it open.
   * `edit` is what a batch edit applies to each feature.
   */
  onSave: (values: FeatureProperties, edit: BatchEdit) => boolean | undefined;
};

function withMember<T>(
  set: ReadonlySet<T>,
  member: T,
  present: boolean,
): ReadonlySet<T> {
  if (set.has(member) === present) {
    return set;
  }

  const next = new Set(set);

  if (present) {
    next.add(member);
  } else {
    next.delete(member);
  }

  return next;
}

export function FeaturePropertiesModal({
  show,
  kind,
  initial,
  closable,
  batch,
  title,
  onSave,
}: Props): ReactElement {
  const m = useMessages();

  const dm = useDrawingMessages();

  const [touched, setTouched] = useState<ReadonlySet<BatchField>>(new Set());

  // Property keys, by the key a row was opened with, set on all.
  const [changedKeys, setChangedKeys] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const setKept = (field: BatchField, kept: boolean) =>
    setTouched((t) => withMember(t, field, !kept));

  /** A setter that also marks its field as changed. */
  const edit =
    <T,>(field: BatchField, set: (value: T) => void) =>
    (value: T) => {
      setKept(field, false);

      set(value);
    };

  // Untouched is kept: each feature's own value stays.
  const mixed: Mixed | undefined = batch && {
    differs: (field) => batch.mixed.has(field),
    kept: (field) => !touched.has(field),
    setKept,
  };

  const mixedKeys: Mixed<string> | undefined = batch && {
    differs: (key) => batch.mixedKeys.has(key),
    kept: (key) => !changedKeys.has(key),
    setKept: (key, kept) => setChangedKeys((c) => withMember(c, key, !kept)),
  };

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

  const setLabel = edit('label', setEditedLabel);

  const insertExpression = useInsertAtCaret(labelRef, setLabel);

  // A kept label is nothing to write into: an insert would replace them all.
  const labelKept = mixed?.differs('label') && mixed.kept('label');

  const handleInsertKey = (key: string) => {
    insertExpression(`{${PROPERTY_PREFIX}${key}}`);
  };

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const handled = onSave(
      {
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
      },
      {
        touched,
        rows: editedRows,
        keptKeys: new Set(
          [...(batch?.mixedKeys ?? [])].filter((key) => !changedKeys.has(key)),
        ),
      },
    );

    if (!handled) {
      close();
    }
  };

  // A point has no width field, so a width it happens to carry cannot be the
  // thing standing between the user and Save.
  // Nor can a batch's untouched width, which is never written.
  const invalidWidth =
    kind !== 'point' &&
    (!batch || touched.has('width')) &&
    isInvalidFloat(editedWidth, false, 1, 99);

  useDocumentTitle(show ? (title ?? dm?.edit.title) : undefined);

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
            <FaTag /> {title ?? dm?.edit.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="label">
            <Form.Label>{dm?.edit.label}</Form.Label>

            {/* A textarea because a label may run to several lines — which
                also means Enter breaks the line instead of submitting, and the
                Save button is the way out. */}
            <MixedField field="label" mixed={mixed}>
              <Form.Control
                autoFocus
                ref={labelRef}
                as="textarea"
                rows={2}
                value={editedLabel}
                onChange={(e) => setLabel(e.currentTarget.value)}
              />
            </MixedField>

            <Form.Text muted>
              {dm?.edit.hint}{' '}
              {(batch
                ? [
                    batch.has.points > 0 && dm?.edit.pointKeys,
                    batch.has.lines > 0 && dm?.edit.lineKeys,
                    batch.has.polygons > 0 && dm?.edit.polygonKeys,
                  ].filter((text) => typeof text === 'string')
                : [
                    kind === 'point'
                      ? dm?.edit.pointKeys
                      : editedType === 'polygon'
                        ? dm?.edit.polygonKeys
                        : dm?.edit.lineKeys,
                  ]
              ).map((text, i) => (
                <Fragment key={i}>
                  <PlaceholderHint
                    text={text}
                    onInsert={labelKept ? undefined : insertExpression}
                  />{' '}
                </Fragment>
              ))}
              <PlaceholderHint
                text={dm?.edit.optionalKeys}
                onInsert={labelKept ? undefined : insertExpression}
              />
            </Form.Text>
          </Form.Group>

          <Form.Group className="mt-3">
            <DrawingPropsEditor
              rows={editedRows}
              onChange={setEditedRows}
              onInsertKey={labelKept ? undefined : handleInsertKey}
              mixed={mixedKeys}
            />
          </Form.Group>

          {kind !== 'point' && (
            <DrawingLineStyleFields
              color={editedColor || COLORS.normal}
              onColorChange={edit('color', setEditedColor)}
              fillColor={editedType === 'polygon' ? editedFillColor : undefined}
              onFillColorChange={
                editedType === 'polygon'
                  ? edit('fillColor', setEditedFillColor)
                  : undefined
              }
              width={editedWidth}
              onWidthChange={edit('width', setEditedWidth)}
              invalidWidth={invalidWidth}
              lineCap={editedLineCap}
              onLineCapChange={edit('lineCap', setEditedLineCap)}
              lineJoin={editedLineJoin}
              onLineJoinChange={edit('lineJoin', setEditedLineJoin)}
              dashArray={editedDash}
              onDashArrayChange={edit('dashArray', setEditedDash)}
              mixed={mixed}
            />
          )}

          {kind === 'line-poly' && !batch && (
            <Form.Group controlId="type" className="mt-3">
              <Form.Label>{dm?.edit.type}</Form.Label>

              <Form.Select
                value={editedType}
                // An unset fill stays so, following the stroke.
                onChange={(e) =>
                  setEditedType(e.currentTarget.value as DrawingLineType)
                }
                disabled={!closable}
              >
                <option value="line">{m?.selections.drawLines}</option>
                <option value="polygon">{m?.selections.drawPolygons}</option>
              </Form.Select>
            </Form.Group>
          )}

          {kind === 'point' && (
            <Form.Group controlId="color" className="mt-3">
              <Form.Label>{dm?.edit.color}</Form.Label>

              <MixedField field="color" mixed={mixed}>
                <RgbaColorPicker
                  value={editedColor || COLORS.normal}
                  onChange={edit('color', setEditedColor)}
                />
              </MixedField>
            </Form.Group>
          )}

          {kind !== 'line-poly' && (
            <>
              <Form.Group controlId="markerType" className="mt-3">
                <Form.Label>{dm?.edit.shape}</Form.Label>

                <MixedField field="markerType" mixed={mixed}>
                  <MarkerTypeSelect
                    asSelect
                    value={editedMarkerType}
                    onChange={edit('markerType', setEditedMarkerType)}
                  />
                </MixedField>
              </Form.Group>

              <Form.Group className="mt-3">
                {/* Kept, the grid with its own labels gives way to the button. */}
                {mixed?.differs('icon') && mixed.kept('icon') && (
                  <Form.Label>{m?.general.icon}</Form.Label>
                )}

                <MixedField field="icon" mixed={mixed}>
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
                        onSelect={(spec) =>
                          edit('icon', setEditedIcon)(spec ?? '')
                        }
                      />
                    </div>

                    <span className={classes.or}>{dm?.edit.or}</span>

                    <Form.Label htmlFor="text" className={classes.textLabel}>
                      {dm?.edit.text}
                    </Form.Label>

                    <Form.Control
                      id="text"
                      className={classes.text}
                      type="text"
                      maxLength={2}
                      value={
                        editedIconSpec?.kind === 'text'
                          ? editedIconSpec.text
                          : ''
                      }
                      onChange={(e) =>
                        edit('icon', setEditedIcon)(e.currentTarget.value)
                      }
                    />
                  </div>

                  <Form.Text muted>{dm?.edit.textHint}</Form.Text>
                </MixedField>
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            variant="primary"
            disabled={invalidWidth}
            icon={<FaCheck />}
            label={m?.general.save}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
