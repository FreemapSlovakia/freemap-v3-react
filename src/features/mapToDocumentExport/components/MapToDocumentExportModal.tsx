import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import {
  ExportablesSelector,
  useAvailableExportables,
} from '@features/mapFeaturesExport/components/ExportablesSelector.js';
import type { Exportable } from '@features/mapFeaturesExport/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  toAttributionCountries,
  useResolvedAttribution,
  useResolvedAttributionText,
} from '@shared/components/Attribution.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  type ChangeEvent,
  Fragment,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Form,
  InputGroup,
  Modal,
  Spinner,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaDownload, FaPrint, FaTimes } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { exportMapToDocument } from '../model/exportMapToDocument.js';
import {
  type CustomLayerOrder,
  type ExportableLayer,
  type Format,
  FormatSchema,
} from '../model/types.js';
import { useAreaCountries } from '../model/useAreaCountries.js';
import { useExportSettings } from '../model/useExportSettings.js';
import { loadMapToDocumentExportMessages } from '../translations/loadMapToDocumentExportMessages.js';
import { useMapToDocumentExportMessages } from '../translations/useMapToDocumentExportMessages.js';
import { DataLayerStyleFields } from './DataLayerStyleFields.js';
import { ExportLayersField } from './ExportLayersField.js';
import { MapDecorationsField } from './MapDecorationsField.js';

type Props = { show: boolean };

const MAP_LAYERS = ['X'];

export default function MapToDocumentExportModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const mtde = useMapToDocumentExportMessages();

  useDocumentTitle(show ? m?.mainMenu.mapToDocumentExport : undefined);

  const {
    area,
    setArea,
    areaBbox,
    selecting: selectingArea,
    startSelecting,
  } = useMapAreaSelection();

  const [settings, updateSettings] = useExportSettings();

  const {
    scale,
    customLayerOrder,
    format,
    scaleBar,
    northArrow,
    attribution: attributionEnabled,
    glow,
    glowColor,
    glowWidth,
    labelColor,
    labelWeight,
    labelSize,
    layers,
  } = settings;

  // Vector feature sources (drawing, route, objects, …) selected via the shared
  // exportables vocabulary; default to whatever currently has data, like the
  // data-export modal.
  const availableExportables = useAvailableExportables();

  const [exportables, setExportables] = useState(availableExportables);

  useEffect(() => {
    setExportables(availableExportables);
  }, [availableExportables]);

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const confirm = useConfirm();

  const [exporting, setExporting] = useState(false);

  // Aborts the in-flight export requests when the user confirms cancellation.
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const invalidScale = isInvalidInt(scale, true, 60, 960);

  const invalidGlowWidth = glow && isInvalidInt(glowWidth, true, 1, 50);

  const invalidLabelWeight = isInvalidInt(labelWeight, true, 100, 900);

  const invalidLabelSize = isInvalidInt(labelSize, true, 1, 100);

  const toggleLayer = useCallback(
    (layer: ExportableLayer) => {
      updateSettings({
        layers: layers.includes(layer)
          ? layers.filter((l) => l !== layer)
          : [...layers, layer],
      });
    },
    [updateSettings, layers],
  );

  const handleScaleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateSettings({ scale: e.currentTarget.value });
    },
    [updateSettings],
  );

  const handleGlowWidthChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateSettings({ glowWidth: e.currentTarget.value });
    },
    [updateSettings],
  );

  const handleLabelWeightChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateSettings({ labelWeight: e.currentTarget.value });
    },
    [updateSettings],
  );

  const handleLabelSizeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateSettings({ labelSize: e.currentTarget.value });
    },
    [updateSettings],
  );

  const handleCustomLayerOrderChange = useCallback(
    (value: CustomLayerOrder) => {
      updateSettings({ customLayerOrder: value });
    },
    [updateSettings],
  );

  const handleDecorationsChange = useCallback(
    (values: ('scaleBar' | 'northArrow' | 'attribution')[]) => {
      updateSettings({
        scaleBar: values.includes('scaleBar'),
        northArrow: values.includes('northArrow'),
        attribution: values.includes('attribution'),
      });
    },
    [updateSettings],
  );

  const countries = useAppSelector((state) => state.map.countries);

  const areaCountries = useAreaCountries(
    area === 'area' && areaBbox
      ? { type: 'selected', bbox: areaBbox }
      : { type: 'visible' },
  );

  const attributionCountries =
    area === 'area' ? areaCountries : toAttributionCountries(countries);

  const attribution = useResolvedAttribution(MAP_LAYERS, attributionCountries);

  const attributionText = useResolvedAttributionText(
    MAP_LAYERS,
    attributionCountries,
  );

  const handleExport = useCallback(async () => {
    const ac = new AbortController();

    abortRef.current = ac;

    setExporting(true);

    try {
      const result = await exportMapToDocument({
        getState: store.getState,
        signal: ac.signal,
        area,
        format,
        scale: parseInt(scale, 10) / 96,
        layers: [...layers],
        exportables: exportables.split('|').filter(Boolean) as Exportable[],
        customLayerOrder,
        decorations: {
          scaleBar,
          northArrow: northArrow ? (mtde?.northArrowLetter ?? 'N') : false,
          attribution:
            attributionEnabled && attributionText ? attributionText : false,
        },
        glow: glow
          ? { color: glowColor, width: parseInt(glowWidth, 10) }
          : null,
        label: {
          color: labelColor,
          weight: parseInt(labelWeight, 10),
          size: parseInt(labelSize, 10),
        },
      });

      if (!result) {
        return;
      }

      const objectUrl = URL.createObjectURL(result.blob);

      const a = document.createElement('a');

      a.href = objectUrl;

      a.download = result.suggestedName;

      a.click();

      URL.revokeObjectURL(objectUrl);

      close();
    } catch (err) {
      if (!ac.signal.aborted) {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'exportError',
            messageParams: { err },
            messageLoader: loadMapToDocumentExportMessages,
          }),
        );
      }
    } finally {
      abortRef.current = null;

      setExporting(false);
    }
  }, [
    store,
    dispatch,
    close,
    mtde,
    area,
    exportables,
    format,
    scale,
    layers,
    customLayerOrder,
    scaleBar,
    northArrow,
    attributionEnabled,
    attributionText,
    glow,
    glowColor,
    glowWidth,
    labelColor,
    labelWeight,
    labelSize,
  ]);

  const handleCancel = useCallback(async () => {
    if (
      await confirm({
        title: mtde?.cancelExportTitle,
        message: mtde?.cancelExportQuestion,
        confirmLabel: m?.general.yes,
        cancelLabel: m?.general.no,
        confirmStyle: 'danger',
      })
    ) {
      // Abort the in-flight export but keep this modal open so the user can
      // tweak the options and try again.
      abortRef.current?.abort();
    }
  }, [confirm, m, mtde]);

  return (
    <Modal
      show={show}
      onHide={exporting ? handleCancel : close}
      backdrop={exporting ? 'static' : undefined}
      keyboard={!exporting}
      className={selectingArea ? 'd-none' : undefined}
      backdropClassName={selectingArea ? 'd-none' : undefined}
      scrollable
      // The color picker's popover is portalled to <body> (outside this
      // modal's DOM), so the modal's focus trap would steal focus from its
      // inputs the moment they're focused. Disable enforceFocus so R/G/B/A/HEX
      // (and the sliders) stay editable.
      enforceFocus={false}
      // enforceFocus={!selectingArea}
    >
      <Modal.Header closeButton={!exporting}>
        <Modal.Title>
          <FaPrint /> {m?.mainMenu.mapToDocumentExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <fieldset disabled={exporting}>
          <Alert variant="warning">
            {mtde?.alert(
              attribution?.map(([type, elem]) => (
                <Fragment key={type}>{elem}, </Fragment>
              )),
            )}
          </Alert>

          <Form.Group>
            <Form.Label className="d-block">{mtde?.area}</Form.Label>

            <MapAreaToggle
              area={area}
              onSelectVisible={() => setArea('visible')}
              onSelectArea={startSelecting}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label className="d-block"> {mtde?.format}</Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="exportFormat"
              value={format}
              onChange={(value: Format) => updateSettings({ format: value })}
            >
              {FormatSchema.options.map((fmt) => (
                <ToggleButton
                  key={fmt}
                  id={`exportFormat-${fmt}`}
                  value={fmt}
                  variant="outline-primary"
                >
                  {fmt.toUpperCase()}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Form.Group>

          <ExportLayersField value={layers} onToggle={toggleLayer} />

          <fieldset className="mt-3 border rounded p-3">
            <Form.Group>
              <Form.Label className="d-block">{mtde?.mapDataTitle}</Form.Label>

              <ExportablesSelector
                value={exportables}
                available={availableExportables}
                onChange={setExportables}
              />
            </Form.Group>

            <DataLayerStyleFields
              disabled={exportables.length < 2}
              glow={glow}
              onGlowChange={(value) => updateSettings({ glow: value })}
              glowColor={glowColor}
              onGlowColorChange={(value) =>
                updateSettings({ glowColor: value })
              }
              glowWidth={glowWidth}
              onGlowWidthChange={handleGlowWidthChange}
              invalidGlowWidth={invalidGlowWidth}
              labelColor={labelColor}
              onLabelColorChange={(value) =>
                updateSettings({ labelColor: value })
              }
              labelSize={labelSize}
              onLabelSizeChange={handleLabelSizeChange}
              invalidLabelSize={invalidLabelSize}
              labelWeight={labelWeight}
              onLabelWeightChange={handleLabelWeightChange}
              invalidLabelWeight={invalidLabelWeight}
              customLayerOrder={customLayerOrder}
              onCustomLayerOrderChange={handleCustomLayerOrderChange}
            />
          </fieldset>

          <MapDecorationsField
            scaleBar={scaleBar}
            northArrow={northArrow}
            attribution={attributionEnabled}
            onChange={handleDecorationsChange}
          />

          <Form.Group controlId="mapScale" className="mt-3">
            <Form.Label>{mtde?.mapScale}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                value={scale}
                min={60}
                max={960}
                step={10}
                isInvalid={invalidScale}
                onChange={handleScaleChange}
              />

              <InputGroup.Text>DPI</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </fieldset>
      </Modal.Body>

      <Modal.Footer>
        <Button
          disabled={
            exporting ||
            invalidScale ||
            invalidGlowWidth ||
            invalidLabelWeight ||
            invalidLabelSize
          }
          onClick={handleExport}
        >
          {exporting ? (
            <Spinner as="span" size="sm" role="status" />
          ) : (
            <FaDownload />
          )}{' '}
          {m?.general.export}
        </Button>

        {exporting ? (
          <Button variant="dark" onClick={handleCancel}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        ) : (
          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
