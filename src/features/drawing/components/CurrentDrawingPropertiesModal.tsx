import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { DrawingLineStyleFields } from '@features/drawing/components/DrawingLineStyleFields.js';
import {
  type DrawingLineType,
  drawingLineChangeProperties,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '@features/drawing/model/actions/drawingPointActions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { COLORS } from '@shared/colors.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { parseIconSpec } from '@shared/drawingIcons.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidFloat } from '@shared/numberValidator.js';
import { polygon } from '@turf/helpers';
import {
  type ChangeEvent,
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTag, FaTimes } from 'react-icons/fa';
import { shallowEqual, useDispatch } from 'react-redux';
import { setActiveModal } from '../../../app/store/actions.js';
import { PROPERTY_PREFIX } from '../interpolateLabel.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import classes from './CurrentDrawingPropertiesModal.module.css';
import {
  DrawingPropsEditor,
  propsToRows,
  rowsToProps,
} from './DrawingPropsEditor.js';

type Props = { show: boolean };

// Stable reference so the dashArray selector doesn't return a fresh array each
// call (which react-redux warns about and causes needless rerenders).
const EMPTY_DASH: number[] = [];

export default function CurrentDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const dm = useDrawingMessages();

  const label = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? (state.drawingPoints.points[selection.id]?.label ?? '')
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? (state.drawingLines.lines[selection.id]?.label ?? '')
        : '???';
  });

  const props = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? state.drawingPoints.points[selection.id]?.props
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? state.drawingLines.lines[selection.id]?.props
        : undefined;
  }, shallowEqual);

  const color = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? state.drawingPoints.points[selection.id]?.color
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? state.drawingLines.lines[selection.id]?.color
        : COLORS.normal;
  });

  const markerType = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? (state.drawingPoints.points[selection.id]?.markerType ?? 'pin')
      : 'pin';
  });

  const icon = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? (state.drawingPoints.points[selection.id]?.icon ?? '')
      : '';
  });

  const fillColor = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? state.drawingLines.lines[selection.id]?.fillColor
      : undefined;
  });

  const width = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? String(state.drawingLines.lines[selection.id]?.width)
      : '';
  });

  const dashArray = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? (state.drawingLines.lines[selection.id]?.dashArray ?? EMPTY_DASH)
      : EMPTY_DASH;
  });

  const lineCap = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? (state.drawingLines.lines[selection.id]?.lineCap ?? 'round')
      : 'round';
  });

  const lineJoin = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? (state.drawingLines.lines[selection.id]?.lineJoin ?? 'round')
      : 'round';
  });

  const type = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[selection.id]?.type
      : undefined;
  });

  const polyPoints = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[selection.id]?.points
      : undefined;
  });

  const drawType = useAppSelector((state) => state.main.selection?.type);

  const selection = useAppSelector((state) => state.main.selection);

  const [editedLabel, setEditedLabel] = useState(label);

  const [editedRows, setEditedRows] = useState(() => propsToRows(props));

  // The label field, so a property can be written in at the cursor.
  const labelRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertKey = useCallback((key: string) => {
    const el = labelRef.current;

    const token = `{${PROPERTY_PREFIX}${key}}`;

    // A textarea reports a selection of 0..0 whether the caret is genuinely at
    // the start or has never been in the field at all, so being focused is what
    // tells a caret to write at from no caret to append after.
    const caret =
      el && document.activeElement === el
        ? { at: el.selectionStart, end: el.selectionEnd }
        : undefined;

    setEditedLabel((label) => {
      const text = label ?? '';

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
  }, []);

  const [editedColor, setEditedColor] = useState(color);

  const [editedMarkerType, setEditedMarkerType] = useState(markerType);

  const [editedIcon, setEditedIcon] = useState(icon);

  const editedIconSpec = parseIconSpec(editedIcon);

  const [editedFillColor, setEditedFillColor] = useState(
    fillColor ?? (type === 'polygon' ? color : undefined),
  );

  const [editedWidth, setEditedWidth] = useState(width || '4');

  const [editedType, setEditedType] = useState<DrawingLineType>(type ?? 'line');

  const [editedDash, setEditedDash] = useState(dashArray);

  const [editedLineCap, setEditedLineCap] = useState(lineCap);

  const [editedLineJoin, setEditedLineJoin] = useState(lineJoin);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (e: SubmitEvent<HTMLFormElement>) => {
      if (
        selection?.type !== 'draw-line-poly' &&
        selection?.type !== 'draw-points'
      ) {
        return;
      }

      e.preventDefault();

      if (
        polyPoints &&
        polyPoints.length >= 3 &&
        editedLabel === 'cry me a river'
      ) {
        const pixelSize = window.prompt('Pixel size?');

        if (pixelSize == null) {
          return;
        }

        const threshold = window.prompt('Stream threshold?', '20000');

        if (!threshold) {
          return;
        }

        const minLen = window.prompt('Minimum stream length?', '50');

        if (!minLen) {
          return;
        }

        const simplifyTolerance = window.prompt('Simplify tolerance?', '1.5');

        if (!simplifyTolerance) {
          return;
        }

        const inJosm = window.confirm('Open in JSOM?');

        const toOsm =
          inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

        const q = new URLSearchParams({
          threshold,
          'min-len': minLen,
          'simplify-tolerance': simplifyTolerance,
          mask: JSON.stringify(
            polygon([
              [...polyPoints, polyPoints[0]].map((p) => [p.lon, p.lat]),
            ]),
          ),
        });

        if (pixelSize) {
          q.append('pixel-size', pixelSize);
        }

        if (toOsm) {
          q.append('to-osm', '1');
        }

        if (inJosm) {
          fetch(
            'http://localhost:8111/import?new_layer=true&url=' +
              encodeURIComponent(
                `https://streamfinder.freemap.sk?${q.toString()}`,
              ),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  `Error response from localhost:8111: ${res.status}`,
                );
              }
            })
            .catch((err) => {
              dispatch?.(
                toastsAdd({
                  messageKey: 'general.operationError',
                  messageParams: { err },
                  style: 'danger',
                }),
              );
            });
        } else {
          const aElem = document.createElement('a');

          aElem.href = `https://streamfinder.freemap.sk?${q.toString()}`;

          aElem.target = '_blank';

          aElem.click();
        }

        return;
      }

      if (polyPoints && editedLabel === 'run forest run') {
        const classifications = window.prompt('Classifications?', '4,5');

        if (!classifications) {
          return;
        }

        const inJosm = window.confirm('Open in JSOM?');

        const toOsm =
          inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

        const q = new URLSearchParams({
          classifications,
          mask: JSON.stringify(
            polygon([
              [...polyPoints, polyPoints[0]].map((p) => [p.lon, p.lat]),
            ]),
          ),
          'to-osm': toOsm ? '1' : '',
        });

        if (inJosm) {
          fetch(
            'http://localhost:8111/import?new_layer=true&url=' +
              encodeURIComponent(`https://forester.freemap.sk?${q.toString()}`),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  `Error response from localhost:8111: ${res.status}`,
                );
              }
            })
            .catch((err) => {
              dispatch?.(
                toastsAdd({
                  messageKey: 'general.operationError',
                  messageParams: { err },
                  style: 'danger',
                }),
              );
            });
        } else {
          const aElem = document.createElement('a');

          aElem.href = `https://forester.freemap.sk?${q.toString()}`;

          aElem.target = '_blank';

          aElem.click();
        }

        return;
      }

      dispatch(
        selection.type === 'draw-line-poly'
          ? drawingLineChangeProperties({
              index: selection.id,
              properties: {
                label: editedLabel || undefined,
                color: editedColor,
                fillColor: editedFillColor,
                width: parseFloat(editedWidth) || undefined,
                type: editedType,
                dashArray: editedDash,
                lineCap: editedLineCap,
                lineJoin: editedLineJoin,
                props: rowsToProps(editedRows),
              },
            })
          : drawingPointChangeProperties({
              index: selection.id,
              properties: {
                label: editedLabel || undefined,
                color: editedColor,
                markerType: editedMarkerType,
                icon: editedIcon || undefined,
                props: rowsToProps(editedRows),
              },
            }),
      );

      close();
    },
    [
      polyPoints,
      editedLabel,
      dispatch,
      editedColor,
      editedMarkerType,
      editedIcon,
      editedFillColor,
      editedWidth,
      editedType,
      editedDash,
      editedLineCap,
      editedLineJoin,
      close,
      selection,
      editedRows,
    ],
  );

  const handleLocalLabelChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedLabel(e.currentTarget.value);
    },
    [],
  );

  const invalidWidth = isInvalidFloat(editedWidth, false, 1, 99);

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
              value={editedLabel ?? ''}
              onChange={handleLocalLabelChange}
            />

            <Form.Text muted>
              {dm?.edit.hint}{' '}
              {drawType === 'draw-points'
                ? dm?.edit.pointKeys
                : editedType === 'polygon'
                  ? dm?.edit.polygonKeys
                  : dm?.edit.lineKeys}{' '}
              {dm?.edit.optionalKeys}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mt-3">
            <DrawingPropsEditor
              rows={editedRows}
              onChange={setEditedRows}
              onInsertKey={handleInsertKey}
            />
          </Form.Group>

          {drawType === 'draw-line-poly' ? (
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
                  disabled={!polyPoints || polyPoints.length < 3}
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
