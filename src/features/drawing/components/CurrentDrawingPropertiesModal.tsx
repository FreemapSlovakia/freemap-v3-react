import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { DrawingLineStyleFields } from '@features/drawing/components/DrawingLineStyleFields.js';
import { IconPicker } from '@features/drawing/components/IconPicker.js';
import { MarkerTypeSelect } from '@features/drawing/components/MarkerTypeSelect.js';
import { RgbaColorPicker } from '@features/drawing/components/RgbaColorPicker.js';
import {
  type DrawingLineType,
  drawingLineChangeProperties,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '@features/drawing/model/actions/drawingPointActions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { COLORS } from '@shared/colors.js';
import { parseIconSpec } from '@shared/drawingIcons.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidFloat } from '@shared/numberValidator.js';
import { polygon } from '@turf/helpers';
import {
  ChangeEvent,
  ReactElement,
  SubmitEvent,
  useCallback,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../../app/store/actions.js';
import classes from './CurrentDrawingPropertiesModal.module.css';

type Props = { show: boolean };

// Stable reference so the dashArray selector doesn't return a fresh array each
// call (which react-redux warns about and causes needless rerenders).
const EMPTY_DASH: number[] = [];

export default function CurrentDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const label = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? (state.drawingPoints.points[selection.id]?.label ?? '')
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? (state.drawingLines.lines[selection.id]?.label ?? '')
        : '???';
  });

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
              encodeURIComponent('http://fm3.freemap.sk:8080?' + q.toString()),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  'Error response from localhost:8111: ' + res.status,
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

          aElem.href = 'http://fm3.freemap.sk:8080?' + q.toString();

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
              encodeURIComponent('http://fm3.freemap.sk:8085?' + q.toString()),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  'Error response from localhost:8111: ' + res.status,
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

          aElem.href = 'http://fm3.freemap.sk:8085?' + q.toString();

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
              },
            })
          : drawingPointChangeProperties({
              index: selection.id,
              properties: {
                label: editedLabel || undefined,
                color: editedColor,
                markerType: editedMarkerType,
                icon: editedIcon || undefined,
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
    ],
  );

  const handleLocalLabelChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedLabel(e.currentTarget.value);
    },
    [],
  );

  const invalidWidth = isInvalidFloat(editedWidth, false, 1, 99);

  useDocumentTitle(show ? m?.drawing.edit.title : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      as="form"
      onSubmit={handleSubmit}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>{m?.drawing.edit.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group controlId="label">
          <Form.Label>{m?.drawing.edit.label}</Form.Label>

          <Form.Control
            autoFocus
            type="text"
            value={editedLabel ?? ''}
            onChange={handleLocalLabelChange}
          />

          <Form.Text muted>{m?.drawing.edit.hint}</Form.Text>
        </Form.Group>

        {drawType !== 'draw-line-poly' && (
          <>
            <Form.Group controlId="color" className="mt-3">
              <Form.Label>{m?.drawing.edit.color}</Form.Label>

              <RgbaColorPicker
                value={editedColor || COLORS.normal}
                onChange={setEditedColor}
              />
            </Form.Group>

            <Form.Group controlId="markerType" className="mt-3">
              <Form.Label>{m?.drawing.edit.shape}</Form.Label>

              <MarkerTypeSelect
                asSelect
                value={editedMarkerType}
                onChange={setEditedMarkerType}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <div className={classes.iconTextGrid}>
                <Form.Label htmlFor="icon" className={classes.iconLabel}>
                  {m?.drawing.edit.icon}
                </Form.Label>

                <div className={classes.icon}>
                  <IconPicker
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
                  {m?.drawing.edit.text}
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

              <Form.Text muted>{m?.drawing.edit.textHint}</Form.Text>
            </Form.Group>
          </>
        )}

        {drawType === 'draw-line-poly' && (
          <>
            <DrawingLineStyleFields
              color={editedColor || COLORS.normal}
              onColorChange={setEditedColor}
              fillColor={editedType === 'polygon' ? editedFillColor : undefined}
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
              <Form.Label>{m?.drawing.edit.type}</Form.Label>

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
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button type="submit" variant="info" disabled={invalidWidth}>
          <FaCheck /> {m?.general.save}
        </Button>

        <Button variant="dark" type="button" onClick={close}>
          <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
