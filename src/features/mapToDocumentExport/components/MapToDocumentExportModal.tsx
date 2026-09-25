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
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { useRoutingAttributions } from '@shared/components/Attribution.js';
import {
  useConfirm,
  useConfirmCancel,
} from '@shared/components/ModalProvider.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { SplitButton } from '@shared/components/SplitButton.js';
import { formatSize } from '@shared/formatSize.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import {
  type AttributionDef,
  FIXTHEMAP_ATTR,
  FM_ATTR,
  OSM_DATA_ATTR,
  OSRM_ROUTING_ATTR,
} from '@shared/mapDefinitions.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { saveBlob } from '@shared/saveBlob.js';
import {
  type ChangeEvent,
  Fragment,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
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
import {
  FaCopy,
  FaDownload,
  FaExternalLinkAlt,
  FaPrint,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import type { Messages } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportResult } from '../model/exportMapToDocument.js';
import { exportMapToDocument } from '../model/exportMapToDocument.js';
import {
  type CustomLayerOrder,
  type ExtraLayer,
  type Format,
  FormatSchema,
  type OmittableLayer,
  OPAQUE_FORMATS,
} from '../model/types.js';
import { useExportSettings } from '../model/useExportSettings.js';
import { loadMapToDocumentExportMessages } from '../translations/loadMapToDocumentExportMessages.js';
import { useMapToDocumentExportMessages } from '../translations/useMapToDocumentExportMessages.js';
import { DataLayerStyleFields } from './DataLayerStyleFields.js';
import { ExportLayersField } from './ExportLayersField.js';
import { MapDecorationsField } from './MapDecorationsField.js';

type Props = { show: boolean };

/**
 * An attribution's display name; only `nameKey` ones are translated, and a
 * label that isn't plain text cannot be burnt into an image or copied.
 */
function creditName(def: AttributionDef, m: Messages | undefined): string {
  if (def.name) {
    return def.name;
  }

  const label = def.nameKey ? m?.mapLayers.attr[def.nameKey] : undefined;

  return typeof label === 'string' ? label : '';
}

export default function MapToDocumentExportModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const online = useOnline();

  const mtde = useMapToDocumentExportMessages();

  useDocumentTitle(show ? m?.mainMenu.mapToDocumentExport : undefined);

  const {
    area,
    setArea,
    selecting: selectingArea,
    startSelecting,
  } = useMapAreaSelection();

  const [settings, updateSettings] = useExportSettings();

  // The finished file and the credits the render reported for it. Non-null puts
  // the modal in its result state, which replaces the options form — so nothing
  // that would change the next render is reachable until it is cleared.
  const [result, setResult] = useState<{
    file: MapToDocumentExportResult;
    /**
     * The credits only the app knows, as they stood when this render was made.
     * Snapshotted rather than re-derived: the store can gain or lose a route
     * behind the modal, and what is listed has to stay what was drawn.
     */
    extras: AttributionDef[];
  } | null>(null);

  // Whether this result was opened in a tab of its own, which is a copy of the
  // file the modal no longer owns — and so nothing left to lose by closing.
  const [opened, setOpened] = useState(false);

  // The modal outlives its own hiding by a second, so a reopen inside that
  // window would otherwise land on the last export's result.
  useEffect(() => {
    if (show) {
      setResult(null);

      setOpened(false);
    }
  }, [show]);

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
    webpLossy,
    baseMap,
    layers,
    omit,
  } = settings;

  const wholeMap = baseMap && omit.length === 0;

  const webp = format === 'webp';

  const lossless = webp && !webpLossy;

  // Each lossy format keeps its own quality, as their defaults differ.
  const qualityKey =
    format === 'jpeg'
      ? 'jpegQuality'
      : webp && webpLossy
        ? 'webpQuality'
        : null;

  const quality = qualityKey ? settings[qualityKey] : '';

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

  const invalidQuality =
    qualityKey !== null && isInvalidInt(quality, true, 0, 100);

  const toggleLayer = useCallback(
    (layer: ExtraLayer) => {
      updateSettings({
        layers: layers.includes(layer)
          ? layers.filter((l) => l !== layer)
          : [...layers, layer],
      });
    },
    [updateSettings, layers],
  );

  // Anything short of the whole map is partly transparent, which the renderer
  // refuses to encode as JPEG, so an opaque format gives way to WebP — lossy
  // when it replaces JPEG, to keep the compression the user chose.
  const updateSelection = useCallback(
    (patch: { baseMap?: boolean; omit?: OmittableLayer[] }) => {
      const partial =
        !(patch.baseMap ?? baseMap) || (patch.omit ?? omit).length > 0;

      updateSettings({
        ...patch,
        ...(partial && OPAQUE_FORMATS.includes(format)
          ? {
              format: 'webp',
              ...(format === 'jpeg' ? { webpLossy: true } : {}),
            }
          : {}),
      });
    },
    [updateSettings, baseMap, omit, format],
  );

  const toggleOmit = useCallback(
    (layer: OmittableLayer) => {
      updateSelection({
        omit: omit.includes(layer)
          ? omit.filter((l) => l !== layer)
          : [...omit, layer],
      });
    },
    [updateSelection, omit],
  );

  const handleBaseMapChange = useCallback(
    (value: boolean) => {
      updateSelection({ baseMap: value });
    },
    [updateSelection],
  );

  const handleLosslessClick = useCallback(() => {
    updateSettings({ webpLossy: false });
  }, [updateSettings]);

  const handleLossyClick = useCallback(() => {
    updateSettings({ webpLossy: true });
  }, [updateSettings]);

  const handleQualityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (qualityKey) {
        updateSettings({ [qualityKey]: e.currentTarget.value });
      }
    },
    [updateSettings, qualityKey],
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

  // The routers' credit belongs to the drawn route, so it rides on that
  // exportable rather than on the document merely being made from this map.
  const exportsRoute = exportables.split('|').includes('plannedRoute');

  const routingAttributions = useRoutingAttributions();

  // What the renderer cannot arrive at itself: it is handed the route as plain
  // geometry, so nothing tells it which router drew one.
  const extraDefs = useMemo(
    () =>
      exportsRoute
        ? routingAttributions.filter((def) => def !== OSM_DATA_ATTR)
        : [],
    [exportsRoute, routingAttributions],
  );

  // The renderer holds this map's and OpenStreetMap's credits only in its own
  // words; the app has them in the reader's, and as links. An empty one — the
  // message bundle not in yet — is left out rather than sent, so the renderer
  // falls back to its own wording instead of being told to draw nothing.
  const attributionParts = useMemo(
    () => ({
      extra: extraDefs.map((def) => creditName(def, m)).filter(Boolean),
      titles: Object.fromEntries(
        [
          ['map', creditName(FM_ATTR, m)],
          ['osm', creditName(OSM_DATA_ATTR, m)],
        ].filter(([, title]) => title),
      ),
    }),
    [extraDefs, m],
  );

  const handleExport = useCallback(async () => {
    const ac = new AbortController();

    abortRef.current = ac;

    setExporting(true);

    try {
      const file = await exportMapToDocument({
        getState: store.getState,
        signal: ac.signal,
        area,
        format,
        quality: qualityKey ? parseInt(quality, 10) : null,
        scale: parseInt(scale, 10) / 96,
        baseMap,
        layers: [...layers],
        omit: [...omit],
        exportables: exportables.split('|').filter(Boolean) as Exportable[],
        customLayerOrder,
        decorations: {
          scaleBar,
          northArrow: northArrow ? (mtde?.northArrowLetter ?? 'N') : false,
          attribution: attributionEnabled && attributionParts,
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

      if (!file) {
        return;
      }

      // The modal stays open on the result: the credits the render reported are
      // an obligation the user has to be able to read and copy.
      setResult({ file, extras: extraDefs });

      setOpened(false);
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
    mtde,
    area,
    exportables,
    format,
    qualityKey,
    quality,
    scale,
    baseMap,
    layers,
    omit,
    customLayerOrder,
    scaleBar,
    northArrow,
    attributionEnabled,
    attributionParts,
    extraDefs,
    glow,
    glowColor,
    glowWidth,
    labelColor,
    labelWeight,
    labelSize,
  ]);

  const askingToCancel = useRef(false);

  const handleCancel = useCallback(async () => {
    // The click can be queued behind the render finishing, and then there is
    // nothing to cancel — and no `exporting` transition left to take the
    // question back down.
    if (!abortRef.current) {
      return;
    }

    askingToCancel.current = true;

    try {
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
    } finally {
      askingToCancel.current = false;
    }
  }, [confirm, m, mtde]);

  const confirmCancel = useConfirmCancel();

  // The render can finish while the question is still up, leaving nothing to
  // cancel and a dialog sitting over the result.
  useEffect(() => {
    if (!exporting && askingToCancel.current) {
      confirmCancel();
    }
  }, [exporting, confirmCancel]);

  /**
   * The whole obligation, in the order the renderer draws it: this map, then
   * what the exported features earn, then OpenStreetMap and the datasets the
   * render named. Paired with their names so a def whose label has not loaded
   * yet drops out with it, rather than shifting the rest out of line, and named
   * once however many sources carry the same title.
   */
  const credits = useMemo(() => {
    if (!result) {
      return [];
    }

    const defs = [
      FM_ATTR,
      ...result.extras,
      OSM_DATA_ATTR,
      ...result.file.datasets,
      // FOSSGIS asks for this wherever an OSRM result is shown as a link, which
      // the panel does and the copied text cannot.
      ...(result.extras.includes(OSRM_ROUTING_ATTR) ? [FIXTHEMAP_ATTR] : []),
    ];

    const seen = new Set<string>();

    return defs
      .map((def) => ({ def, name: creditName(def, m) }))
      .filter(({ name }) => {
        if (!name || seen.has(name)) {
          return false;
        }

        seen.add(name);

        return true;
      });
  }, [result, m]);

  const creditsText = credits
    .filter(({ def }) => def !== FIXTHEMAP_ATTR)
    .map(({ name }) => name)
    .join(', ');

  const handleSave = useCallback(async () => {
    if (!result) {
      return;
    }

    try {
      await saveBlob(result.file.blob, result.file.suggestedName);
    } catch (err) {
      // The save picker rejects with `AbortError` when the user backs out of it.
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.operationError',
            messageParams: { err },
          }),
        );
      }

      return;
    }

    // The file is the point of the modal, so saving it ends the task. The
    // credits go with the user instead: the panel they were read on is gone.
    if (creditsText) {
      dispatch(
        toastsAdd({
          style: 'success',
          messageKey: 'savedCredits',
          messageParams: { credits: creditsText },
          messageLoader: loadMapToDocumentExportMessages,
        }),
      );
    }

    close();
  }, [result, creditsText, dispatch, close]);

  const handleOpen = useCallback(() => {
    if (!result) {
      return;
    }

    // Made only once a preview is asked for, and then never revoked: the tab
    // owns it, and a viewer reading a large PDF in ranges is still fetching long
    // after the click. An export nobody previews holds no URL to begin with, so
    // its blob goes when the modal does.
    const url = URL.createObjectURL(result.file.blob);

    // Not `noopener`: it would make the handle `null` whatever happened, and a
    // refused popup must not count as the user having the file. It buys no
    // isolation here anyway — a `blob:` URL inherits this page's origin.
    const preview = window.open(url, '_blank');

    if (!preview) {
      URL.revokeObjectURL(url);

      return;
    }

    preview.opener = null;

    setOpened(true);
  }, [result]);

  /**
   * Asks before throwing away a render the user has nothing else to reach it
   * by. Saving closes the modal itself, so only the preview tab clears this.
   */
  const handleClose = useCallback(async () => {
    if (
      !result ||
      opened ||
      (await confirm({
        title: mtde?.discardExportTitle,
        message: mtde?.discardExportQuestion,
        confirmLabel: m?.general.yes,
        cancelLabel: m?.general.no,
        confirmStyle: 'danger',
      }))
    ) {
      close();
    }
  }, [confirm, close, result, opened, m, mtde]);

  const handleCopyCredits = useCallback(() => {
    void copyToClipboard(dispatch, creditsText);
  }, [dispatch, creditsText]);

  return (
    <Modal
      size="lg"
      show={show}
      onHide={exporting ? handleCancel : handleClose}
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
        {result ? (
          <>
            <p className="fs-5">
              {mtde?.ready} — {result.file.suggestedName} (
              {formatSize(result.file.blob.size)})
            </p>

            <Alert variant="warning">
              <p>{mtde?.readyCredits}</p>

              <p className="user-select-all mb-0">
                {credits.map(({ def, name }, i) => (
                  <Fragment key={name}>
                    {i > 0 && ', '}
                    {def.url ? (
                      <a href={def.url} target="_blank" rel="noopener">
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </Fragment>
                ))}
              </p>

              {!result.file.reported && (
                <p className="mb-0 mt-2 small">{mtde?.readyCreditsNone}</p>
              )}

              {result.file.unresolved.length > 0 && (
                <p className="mb-0 mt-2 small">
                  {mtde?.readyUnknownSources}{' '}
                  {result.file.unresolved.join(', ')}
                </p>
              )}
            </Alert>
          </>
        ) : (
          <>
            <OfflineAlert />

            <fieldset disabled={exporting}>
              <Alert variant="warning">{mtde?.alert()}</Alert>

              <Form.Group>
                <Form.Label className="d-block">{mtde?.area}</Form.Label>

                <MapAreaToggle
                  area={area}
                  onSelectVisible={() => setArea('visible')}
                  onSelectArea={startSelecting}
                />
              </Form.Group>

              <div className="d-flex flex-wrap align-items-end gap-2">
                <Form.Group className="mt-3">
                  <Form.Label className="d-block"> {mtde?.format}</Form.Label>

                  <ToggleButtonGroup
                    type="radio"
                    name="exportFormat"
                    value={format}
                    onChange={(value: Format) =>
                      updateSettings({ format: value })
                    }
                  >
                    {FormatSchema.options.map((fmt) => (
                      <ToggleButton
                        key={fmt}
                        id={`exportFormat-${fmt}`}
                        value={fmt}
                        variant="outline-primary"
                        disabled={!wholeMap && OPAQUE_FORMATS.includes(fmt)}
                      >
                        {fmt.toUpperCase()}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Form.Group>

                {(webp || qualityKey) && (
                  <Form.Group className="w-auto mt-2">
                    <Form.Label>{mtde?.quality}</Form.Label>

                    <InputGroup>
                      {/* Plain buttons rather than a nested `ToggleButtonGroup`:
                          a `btn-check` input would take the input group's
                          `:first-child` seam rules off the button beside it. */}
                      {webp && (
                        <>
                          <Button
                            variant="outline-primary"
                            active={lossless}
                            aria-pressed={lossless}
                            onClick={handleLosslessClick}
                          >
                            {mtde?.lossless}
                          </Button>

                          <Button
                            variant="outline-primary"
                            active={!lossless}
                            aria-pressed={!lossless}
                            onClick={handleLossyClick}
                          >
                            {mtde?.lossy}
                          </Button>
                        </>
                      )}

                      {qualityKey && (
                        <Form.Control
                          type="number"
                          value={quality}
                          min={0}
                          max={100}
                          step={5}
                          // Three digits plus the control's own chrome —
                          // padding, border, spinner. Both overrides are
                          // needed: an input group grows its control, and
                          // `index.css` floors one at 100px.
                          className="flex-grow-0"
                          style={{ width: 'calc(3ch + 3rem)', minWidth: 0 }}
                          isInvalid={invalidQuality}
                          onChange={handleQualityChange}
                        />
                      )}
                    </InputGroup>
                  </Form.Group>
                )}
              </div>

              <Form.Group controlId="mapScale" className="mt-3">
                <Form.Label className="d-block">{mtde?.mapScale}</Form.Label>

                <InputGroup className="d-inline-flex w-auto">
                  <Form.Control
                    type="number"
                    value={scale}
                    min={60}
                    max={960}
                    step={10}
                    className="flex-grow-0"
                    style={{ width: 'calc(3ch + 3rem)', minWidth: 0 }}
                    isInvalid={invalidScale}
                    onChange={handleScaleChange}
                  />

                  <InputGroup.Text>DPI</InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <ExportLayersField
                baseMap={baseMap}
                onBaseMapChange={handleBaseMapChange}
                layers={layers}
                onToggleLayer={toggleLayer}
                omit={omit}
                onToggleOmit={toggleOmit}
              />

              <fieldset className="mt-3 border rounded p-3">
                <legend>{mtde?.mapDataTitle}</legend>

                <ExportablesSelector
                  value={exportables}
                  available={availableExportables}
                  onChange={setExportables}
                />

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
            </fieldset>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {result ? (
          <SplitButton
            variant="primary"
            showLabel
            icon={<FaDownload />}
            label={m?.general.save}
            onClick={handleSave}
            items={[
              {
                icon: <FaExternalLinkAlt />,
                label: mtde?.openInNewTab,
                onSelect: handleOpen,
                // A `blob:` document runs on this page's origin, and SVG is the
                // one export format that can carry script. Saving it is safe;
                // viewing it here would not be.
                disabled: format === 'svg',
              },
              {
                icon: <FaCopy />,
                label: mtde?.copyCredits,
                onSelect: handleCopyCredits,
                disabled: !creditsText,
              },
            ]}
          />
        ) : (
          <Button
            disabled={
              !online ||
              exporting ||
              invalidScale ||
              invalidQuality ||
              (!wholeMap && OPAQUE_FORMATS.includes(format)) ||
              (!baseMap && layers.length === 0 && !exportables) ||
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
        )}

        {exporting ? (
          <Button variant="dark" onClick={handleCancel}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        ) : (
          <Button variant="dark" onClick={handleClose}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
