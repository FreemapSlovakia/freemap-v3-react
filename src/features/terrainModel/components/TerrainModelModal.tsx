import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import type { Bbox } from '@features/mapArea/model/actions.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import { integratedLayerDefsSelector } from '@features/mapLibrary/model/selectors.js';
import {
  type ExportCredits,
  resolveExportCredits,
} from '@features/mapToDocumentExport/model/exportCredits.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium, premiumTileAuth } from '@features/premium/premium.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { Modal } from '@shared/components/Modal.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import parametricShading from '@shared/mapLibrary/defs/parametricShading.js';
import { nearestStep } from '@shared/mathUtils.js';
import { saveBlob } from '@shared/saveBlob.js';
import { loadTerrainLicenses } from '@shared/tileLicenses.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  Component,
  Fragment,
  lazy,
  type ReactElement,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Dropdown, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaCube, FaDownload } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { terrainModelSetSettings } from '../model/actions.js';
import { NoElevationDataError } from '../model/errors.js';
import {
  type GenerateProgress,
  generateTerrainModel,
} from '../model/generate.js';
import { isTextureMap } from '../model/mapTexture.js';
import {
  DEFAULT_SIDE_MM,
  FREE_MAX_SAMPLES,
  fittingWidth,
  groundSize,
  MAX_SIDE_MM,
  MAX_TILES,
  MAX_ZOOM,
  MIN_WIDTH_MM,
  normalizeBbox,
  PREMIUM_MAX_SAMPLES,
  planModel,
  SIMPLIFY_MAX_SAMPLES,
  tilePixelM,
} from '../model/plan.js';
import { LIMITS, MAX_DEVIATION_STOPS } from '../model/settingsReducer.js';
import { tileCount } from '../model/tileGrid.js';
import { useTerrainModelMessages } from '../translations/useTerrainModelMessages.js';
import type { AreaView, ModelView } from './TerrainPreview.js';
import { usePreviewData } from './usePreviewData.js';

// three.js is several hundred kB; only an opened modal with an area pays for it.
const TerrainPreview = lazy(
  () =>
    import(
      /* webpackChunkName: "terrain-model-preview" */
      './TerrainPreview.js'
    ),
);

/** A grid's own proportions at the model's width, so a stale one isn't stretched. */
function previewDims(
  bbox: Bbox,
  widthMm: number,
): { depthMm: number; mmPerM: number } {
  const { width, depth } = groundSize(bbox);

  const mmPerM = widthMm / width;

  return { depthMm: depth * mmPerM, mmPerM };
}

/**
 * Leaves the preview out where WebGL is unavailable or its chunk won't load,
 * keeping the rest of the modal — the STL needs neither.
 */
class PreviewBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string },
  { failed: boolean; resetKey: string }
> {
  state = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  // A new area tries again, without remounting a preview that works.
  static getDerivedStateFromProps(
    props: { resetKey: string },
    state: { failed: boolean; resetKey: string },
  ) {
    return props.resetKey === state.resetKey
      ? null
      : { failed: false, resetKey: props.resetKey };
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function PreviewPlaceholder(): ReactElement {
  return (
    <div
      className="rounded bg-body-secondary d-flex align-items-center justify-content-center mb-3"
      style={{ height: 300 }}
    >
      <Spinner />
    </div>
  );
}

/**
 * Larger models are shown as the area: decoding one stalls the page for
 * seconds. Above a free account's full grid, about 2M triangles.
 */
const MODEL_VIEW_MAX_TRIANGLES = 2_500_000;

/** The finest elevation tile zoom served without premium. */
const FREE_ZOOM = (parametricShading.premiumFromZoom ?? 16) - 1;

type Props = { show: boolean };

/** A built model, kept to show and to save without building it again. */
type Result = {
  /** What it was built from; see `modelKey`. */
  key: string;
  /** Its own, so the view keys on one array per model. */
  bbox: Bbox;
  widthMm: number;
  depthMm: number;
  stl: ArrayBuffer;
  topTriangles: number;
  heightMm: number;
  triangles: number;
  bytes: number;
  /** Share of the grid without elevation data. */
  nodata: number;
  /** Arrives after the model; see `resolveExportCredits`. */
  credits?: ExportCredits;
  /** Data spacing read instead, where premium tiles were refused. */
  refusedAtM?: number;
};

type NumberFieldProps = {
  id: string;
  label?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Shown empty and not editable. */
  disabled?: boolean;
  onChange: (value: number) => void;
};

/**
 * Millimetres, kept as typed until valid. Only a value changed from outside
 * replaces the text; never remount it, or typing loses focus.
 */
function MmField({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: NumberFieldProps): ReactElement {
  const [text, setText] = useState(String(value));

  const [shown, setShown] = useState(value);

  if (value !== shown) {
    setShown(value);

    if (Number(text) !== value) {
      setText(String(value));
    }
  }

  const n = text.trim() ? Number(text) : Number.NaN;

  const invalid = !(n >= min && n <= max);

  return (
    <Form.Group className="mb-3">
      {label && <Form.Label htmlFor={id}>{label}</Form.Label>}

      <InputGroup>
        <Form.Control
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          isInvalid={!disabled && invalid}
          value={disabled ? '' : text}
          onChange={(e) => {
            const t = e.currentTarget.value;

            setText(t);

            const v = Number(t);

            if (t.trim() && v >= min && v <= max) {
              onChange(v);
            }
          }}
        />

        <InputGroup.Text>mm</InputGroup.Text>
      </InputGroup>
    </Form.Group>
  );
}

type SizeField = 'width' | 'depth' | 'scale';

/**
 * Width, depth and scale of the model, any one editable: each sets the model's
 * width, which the other two follow. The one being typed in keeps its text.
 */
function SizeFields({
  dimensionsLabel,
  scaleLabel,
  ground,
  widthMm,
  onChange,
}: {
  dimensionsLabel?: ReactNode;
  scaleLabel?: ReactNode;
  /** The area's ground size, metres; none yet leaves the fields empty. */
  ground: { width: number; depth: number } | undefined;
  widthMm: number;
  onChange: (widthMm: number) => void;
}): ReactElement {
  const [editing, setEditing] = useState<{
    field: SizeField;
    text: string;
  } | null>(null);

  const toWidth = (field: SizeField, v: number) =>
    !ground
      ? Number.NaN
      : field === 'width'
        ? v
        : field === 'depth'
          ? (v * ground.width) / ground.depth
          : (ground.width * 1000) / v;

  const accepts = (w: number) =>
    ground !== undefined &&
    w >= MIN_WIDTH_MM &&
    Math.max(w, (w * ground.depth) / ground.width) <= MAX_SIDE_MM;

  const computed: Record<SizeField, string> = ground
    ? {
        width: String(Math.round(widthMm)),
        depth: String(Math.round((widthMm * ground.depth) / ground.width)),
        scale: String(Number(((ground.width * 1000) / widthMm).toPrecision(3))),
      }
    : { width: '', depth: '', scale: '' };

  const field = (name: SizeField) => {
    const text = editing?.field === name ? editing.text : computed[name];

    const w = text.trim() ? toWidth(name, Number(text)) : Number.NaN;

    return (
      <Form.Control
        id={`fm-terrain-model-${name}`}
        type="number"
        // `accepts` is the check; a native step would flag a scale of 1 : 19.6.
        min={name === 'width' ? MIN_WIDTH_MM : 0}
        step="any"
        disabled={!ground}
        isInvalid={ground !== undefined && !accepts(w)}
        value={text}
        onChange={(e) => {
          const t = e.currentTarget.value;

          setEditing({ field: name, text: t });

          const v = t.trim() ? toWidth(name, Number(t)) : Number.NaN;

          if (accepts(v)) {
            onChange(v);
          }
        }}
        // Leaving the field shows it as the others: rounded, as computed.
        onBlur={() => setEditing(null)}
      />
    );
  };

  return (
    <div className="d-flex flex-wrap column-gap-3">
      <Form.Group className="mb-3 flex-grow-1">
        <Form.Label htmlFor="fm-terrain-model-width">
          {dimensionsLabel}
        </Form.Label>

        <InputGroup>
          {field('width')}

          <InputGroup.Text>×</InputGroup.Text>

          {field('depth')}

          <InputGroup.Text>mm</InputGroup.Text>
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3 flex-grow-1">
        <Form.Label htmlFor="fm-terrain-model-scale">{scaleLabel}</Form.Label>

        <InputGroup>
          <InputGroup.Text>1 :</InputGroup.Text>

          {field('scale')}
        </InputGroup>
      </Form.Group>
    </div>
  );
}

export default function TerrainModelModal({ show }: Props): ReactElement {
  const m = useMessages();

  const tm = useTerrainModelMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const settings = useAppSelector((state) => state.terrainModelSettings);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const {
    area,
    setArea,
    selecting,
    bbox: areaBbox,
    startSelecting,
  } = useMapAreaSelection();

  const [result, setResult] = useState<Result | null>(null);

  // A visible area follows the viewport, which a resize or a turned phone
  // moves; once built for, the area holds until another is chosen.
  const [pinnedBbox, setPinnedBbox] = useState<Bbox | null>(null);

  const liveBbox = areaBbox && normalizeBbox(areaBbox);

  const bbox = pinnedBbox ?? liveBbox;

  const acrossAntimeridian = areaBbox !== undefined && liveBbox === null;

  // Installed base maps drawn from image tiles, which a texture can use.
  const libraryDefs = useAppSelector(integratedLayerDefsSelector);

  const textureMaps = libraryDefs.filter(isTextureMap);

  // Chosen explicitly: the map on screen may be WMS, vector or an overlay,
  // none of which a texture can draw. One uninstalled since leaves it plain.
  const textureMap = textureMaps.find((def) => def.type === settings.texture);

  const preview = usePreviewData(bbox, FREE_ZOOM, textureMap);

  // The previous area's grid stays up while the current one loads.
  const shownGrid = preview.heights ?? preview.last;

  // `null` follows the area: its longer side `DEFAULT_SIDE_MM`.
  const [width, setWidth] = useState<number | null>(null);

  // A new area takes the width back from what was typed.
  const fitKey = bbox?.join() ?? '';

  const [widthFitKey, setWidthFitKey] = useState(fitKey);

  if (fitKey !== widthFitKey) {
    setWidthFitKey(fitKey);

    setWidth(null);
  }

  const [progress, setProgress] = useState<GenerateProgress | null>(null);

  const busy = progress !== null;

  const cancelRef = useRef<(() => void) | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);

  // Closing the modal any other way unmounts it; the worker must not outlive it.
  useEffect(() => () => cancelRef.current?.(), []);

  // Hidden by Back, a chord or another modal, it stays mounted a moment longer.
  useEffect(() => {
    if (!show) {
      cancelRef.current?.();
    }
  }, [show]);

  const [error, setError] = useState<string | null>(null);

  const nf0 = useNumberFormat({ maximumFractionDigits: 0 });

  const nf1 = useNumberFormat({ maximumFractionDigits: 1 });

  // 0.42 m and 12 m alike.
  const nfDetail = useNumberFormat({ maximumSignificantDigits: 2 });

  const nf3 = useNumberFormat({ maximumFractionDigits: 3 });

  const nfPercent = useNumberFormat({
    style: 'percent',
    maximumFractionDigits: 0,
  });

  const { exaggeration, base, maxDeviation } = settings;

  const deviationStop = nearestStep(MAX_DEVIATION_STOPS, maxDeviation);

  const widthMm = width ?? (bbox ? fittingWidth(bbox, DEFAULT_SIDE_MM) : 0);

  // A model to be simplified is held to what the simplification can take.
  const sampleCap = (accountCap: number) =>
    maxDeviation > 0 ? Math.min(accountCap, SIMPLIFY_MAX_SAMPLES) : accountCap;

  const plan =
    bbox && widthMm > 0
      ? planModel(
          bbox,
          widthMm,
          premium ? MAX_ZOOM : FREE_ZOOM,
          sampleCap(premium ? PREMIUM_MAX_SAMPLES : FREE_MAX_SAMPLES),
        )
      : undefined;

  // terrain-tiles has nothing coarser than z8, so a continent would be read
  // from thousands of tiles.
  const areaTooLarge =
    plan !== undefined &&
    bbox !== null &&
    bbox !== undefined &&
    tileCount(bbox, plan.cols, plan.rows, plan.zoom) > MAX_TILES;

  // A strip's default width can still leave it too deep; its fields say so.
  const sideTooLong =
    plan !== undefined && Math.max(plan.widthMm, plan.depthMm) > MAX_SIDE_MM;

  // The same model under premium's limits, for a free account — offered only
  // where it would come out noticeably finer and could still be downloaded.
  const premiumCandidate =
    !premium && plan && bbox && plan.limitedBy !== 'floor' && !areaTooLarge
      ? planModel(bbox, widthMm, MAX_ZOOM, sampleCap(PREMIUM_MAX_SAMPLES))
      : undefined;

  const premiumPlan =
    premiumCandidate &&
    plan &&
    bbox &&
    premiumCandidate.stepMm < plan.stepMm * 0.9 &&
    tileCount(
      bbox,
      premiumCandidate.cols,
      premiumCandidate.rows,
      premiumCandidate.zoom,
    ) <= MAX_TILES
      ? premiumCandidate
      : undefined;

  // What a built model was built from; any change makes it stale.
  const modelKey = JSON.stringify([
    bbox,
    plan && [plan.cols, plan.rows, plan.zoom, plan.widthMm],
    exaggeration,
    base,
    maxDeviation,
  ]);

  // A model no longer matching the settings is dropped, not kept: it can be
  // hundreds of MB.
  if (result && result.key !== modelKey) {
    setResult(null);
  }

  const built = result?.key === modelKey ? result : null;

  // Above the cap the view's vertex arrays alone would take the tab's memory.
  const shownStl =
    built && built.triangles <= MODEL_VIEW_MAX_TRIANGLES
      ? built.stl
      : undefined;

  const modelTop = built?.topTriangles;

  // One object per model and per grid, so the view doesn't rebuild per render.
  const modelView = useMemo<ModelView | undefined>(
    () =>
      shownStl && modelTop !== undefined
        ? { kind: 'model', stl: shownStl, topTriangles: modelTop }
        : undefined,
    [shownStl, modelTop],
  );

  const shownDims =
    shownGrid && plan ? previewDims(shownGrid.bbox, plan.widthMm) : undefined;

  const shownMmPerM = shownDims?.mmPerM ?? 0;

  const areaView = useMemo<AreaView | undefined>(
    () =>
      shownGrid
        ? {
            kind: 'area',
            heights: shownGrid.heights,
            cols: shownGrid.cols,
            rows: shownGrid.rows,
            mmPerM: shownMmPerM,
            exaggeration,
            baseMm: base,
            stale: !preview.heights,
          }
        : undefined,
    [shownGrid, shownMmPerM, exaggeration, base, preview.heights],
  );

  // One preview for both views, so switching keeps its context and camera.
  const shown =
    modelView && built
      ? {
          view: modelView,
          bbox: built.bbox,
          widthMm: built.widthMm,
          depthMm: built.depthMm,
          texture: preview.texture?.canvas ?? null,
        }
      : areaView && shownGrid && plan && shownDims && !preview.problem
        ? {
            view: areaView,
            // The grid's own area, one array per fetch: a stable key.
            bbox: shownGrid.bbox,
            widthMm: plan.widthMm,
            depthMm: shownDims.depthMm,
            texture: preview.heights ? (preview.texture?.canvas ?? null) : null,
          }
        : undefined;

  // A built model stays for as long as `modelKey` matches; the map draped on
  // it doesn't touch the file.
  const set = (values: Parameters<typeof terrainModelSetSettings>[0]) => {
    dispatch(terrainModelSetSettings(values));
  };

  const close = () => {
    cancelRef.current?.();

    dispatch(setActiveModal(null));
  };

  // The file is in hand once built; saving it is instant.
  const handleSave = () => {
    if (!built) {
      return;
    }

    trackMatomo(['trackEvent', 'TerrainModel', 'stl']);

    saveBlob(new Blob([built.stl], { type: 'model/stl' }), 'terrain.stl', {
      'model/stl': ['.stl'],
    }).catch((err: unknown) => {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(tm?.error({ err: String(err) }) ?? String(err));
      }
    });
  };

  const handleBuild = async () => {
    if (!plan || !bbox) {
      return;
    }

    setError(null);

    setResult(null);

    setPinnedBbox(bbox);

    trackMatomo(['trackEvent', 'TerrainModel', 'build']);

    // The model and its details appear at the preview.
    viewRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });

    const key = modelKey;

    const auth = premiumTileAuth(
      parametricShading.url,
      parametricShading.premiumFromZoom,
      store.getState().auth.user,
    );

    // Cancel and Close must also stop what follows the worker.
    let cancelled = false;

    setProgress({ type: 'progress', phase: 'tiles', done: 0, total: 0 });

    try {
      const run = generateTerrainModel(
        {
          bbox,
          zoom: plan.zoom,
          url: parametricShading.url,
          token: auth && plan.zoom >= auth.fromZoom ? auth.token : undefined,
          freeZoom: FREE_ZOOM,
          cols: plan.cols,
          rows: plan.rows,
          widthMm: plan.widthMm,
          depthMm: plan.depthMm,
          mmPerM: plan.mmPerM,
          exaggeration,
          baseMm: base,
          toleranceMm: maxDeviation,
        },
        setProgress,
      );

      cancelRef.current = () => {
        cancelled = true;

        run.cancel();
      };

      const out = await run.promise;

      setProgress(null);

      if (cancelled) {
        return;
      }

      setResult({
        key,
        bbox,
        widthMm: plan.widthMm,
        depthMm: plan.depthMm,
        stl: out.stl,
        topTriangles: out.topTriangles,
        heightMm: out.heightMm,
        triangles: out.triangles,
        bytes: out.stl.byteLength,
        nodata: out.nodata,
        refusedAtM:
          out.zoom < plan.zoom ? tilePixelM(out.zoom, bbox) : undefined,
      });

      // A dictionary that fails to load leaves the codes named as they stand.
      resolveExportCredits(out.attributions.join(','), () =>
        loadTerrainLicenses().catch(() => null),
      ).then((credits) => {
        if (!cancelled) {
          setResult((r) => (r?.key === key ? { ...r, credits } : r));
        }
      });
    } catch (err) {
      if (err instanceof NoElevationDataError) {
        setError(tm?.noData ?? err.message);
      } else if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(tm?.error({ err: String(err) }) ?? String(err));
      }
    } finally {
      cancelRef.current = null;

      setProgress(null);
    }
  };

  useDocumentTitle(show ? m?.mainMenu.terrainModel : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      className={selecting ? 'd-none' : undefined}
      backdropClassName={selecting ? 'd-none' : undefined}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCube /> <Text k="mainMenu.terrainModel" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        <fieldset disabled={busy}>
          <Form.Group className="mb-3">
            <Form.Label className="d-block">
              <Text m={tm} k="area" />
            </Form.Label>

            <MapAreaToggle
              area={area}
              // The area changes, and with it any model built for the old one.
              onSelectVisible={() => {
                setPinnedBbox(null);

                setArea('visible');
              }}
              onSelectArea={() => {
                setPinnedBbox(null);

                startSelecting();
              }}
            />
          </Form.Group>

          {plan && bbox && (
            <>
              <div ref={viewRef} />

              {shown ? (
                <PreviewBoundary
                  resetKey={shown.bbox.join()}
                  fallback={
                    <p className="small text-body-secondary">
                      <Text m={tm} k="previewUnavailable" />
                    </p>
                  }
                >
                  <Suspense fallback={<PreviewPlaceholder />}>
                    <TerrainPreview {...shown} />
                  </Suspense>

                  <Form.Text className="d-block mb-3 mt-n2">
                    <Text
                      m={tm}
                      k={
                        modelView
                          ? 'viewModel'
                          : built
                            ? 'modelTooLargeToShow'
                            : 'viewArea'
                      }
                    />
                  </Form.Text>
                </PreviewBoundary>
              ) : preview.problem === 'noData' ? (
                <p className="small text-body-secondary">
                  <Text m={tm} k="noData" />
                </p>
              ) : preview.problem === 'failed' ||
                // The preview's own grid can need more tiles than the model's.
                (preview.problem === 'tooLarge' && !areaTooLarge) ? (
                <p className="small text-body-secondary">
                  <Text m={tm} k="previewUnavailable" />
                </p>
              ) : (
                // Too large an area says so below.
                preview.problem !== 'tooLarge' && <PreviewPlaceholder />
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              {built && tm && (
                <>
                  <Alert variant="success">
                    {tm.result({
                      height: nf1.format(built.heightMm),
                      triangles: nf0.format(built.triangles),
                      size: formatSize(built.bytes),
                    })}
                  </Alert>

                  {built.refusedAtM !== undefined && (
                    <Alert variant="warning">
                      {tm.premiumRefused({ m: nf1.format(built.refusedAtM) })}
                    </Alert>
                  )}

                  {built.nodata > 0 && (
                    <Alert variant="warning">
                      {tm.partialData({
                        percent: nfPercent.format(Math.max(0.01, built.nodata)),
                      })}
                    </Alert>
                  )}

                  {built.credits &&
                    (built.credits.datasets.length > 0 ||
                      built.credits.unresolved.length > 0) && (
                      <p className="small">
                        {tm.credits}:{' '}
                        {[
                          ...built.credits.datasets.map((credit) =>
                            credit.url ? (
                              <a
                                key={credit.name}
                                href={credit.url}
                                target="_blank"
                                rel="noopener"
                              >
                                {credit.name}
                              </a>
                            ) : (
                              <span key={credit.name}>{credit.name}</span>
                            ),
                          ),
                          // Named as they stand rather than dropped.
                          ...built.credits.unresolved.map((code) => (
                            <span key={code}>{code}</span>
                          )),
                        ].flatMap((node, i) => (i > 0 ? [', ', node] : [node]))}
                      </p>
                    )}
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Label>
                  <Text m={tm} k="texture" />
                </Form.Label>

                <Dropdown
                  onSelect={(value) => {
                    if (value) {
                      // Choosing a map, not switching one off.
                      if (value !== 'none') {
                        trackMatomo([
                          'trackEvent',
                          'TerrainModel',
                          'texture',
                          value,
                        ]);
                      }

                      set({ texture: value });
                    }
                  }}
                >
                  <Dropdown.Toggle as={SelectToggle} className="w-100">
                    {!textureMap ? (
                      <Text m={tm} k="texturePlain" />
                    ) : (
                      <MapLayerItem def={textureMap} />
                    )}
                  </Dropdown.Toggle>

                  <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
                    <Dropdown.Item as="button" type="button" eventKey="none">
                      <Text m={tm} k="texturePlain" />
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    {textureMaps.map((def) => (
                      <Dropdown.Item
                        as="button"
                        type="button"
                        key={def.type}
                        eventKey={def.type}
                      >
                        <MapLayerItem def={def} truncate />
                      </Dropdown.Item>
                    ))}
                  </FmDropdownMenu>
                </Dropdown>

                {textureMap && preview.textureFailed && (
                  <Form.Text className="d-block">
                    <Text m={tm} k="textureFailed" />
                  </Form.Text>
                )}

                {preview.texture && preview.texture.credits.length > 0 && (
                  <Form.Text>
                    {preview.texture.credits
                      .map(
                        (credit) =>
                          credit.name ??
                          (credit.nameKey
                            ? m?.mapLayers.attr[credit.nameKey]
                            : undefined),
                      )
                      .filter(Boolean)
                      .map((credit, i) => (
                        <Fragment key={i}>
                          {i > 0 && ', '}
                          {credit}
                        </Fragment>
                      ))}
                  </Form.Text>
                )}
              </Form.Group>
            </>
          )}

          <SizeFields
            dimensionsLabel={tm?.dimensions}
            scaleLabel={tm?.scale}
            ground={bbox ? groundSize(bbox) : undefined}
            widthMm={widthMm}
            onChange={setWidth}
          />

          {plan && tm && (
            <p className="small">
              {tm.detail({
                detail: nfDetail.format(plan.stepMm / plan.mmPerM),
              })}
              {/* Not mid-run: following the offer would cancel it. Nor where
                  there is no data to read finer. */}
              {premiumPlan && !busy && preview.problem !== 'noData' && (
                <>
                  <br />
                  {tm.premiumFiner(
                    (label) => (
                      <PremiumGem label={label} onBeforeNavigate={close} />
                    ),
                    {
                      detail: nfDetail.format(plan.stepMm / plan.mmPerM),
                      premiumDetail: nfDetail.format(
                        premiumPlan.stepMm / premiumPlan.mmPerM,
                      ),
                    },
                  )}
                </>
              )}
            </p>
          )}

          {areaTooLarge && (
            <Alert variant="warning">
              <Text m={tm} k="areaTooLarge" />
            </Alert>
          )}

          {acrossAntimeridian && (
            <Alert variant="warning">
              <Text m={tm} k="acrossAntimeridian" />
            </Alert>
          )}

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-terrain-model-exaggeration"
              label={tm?.exaggeration}
              hint={tm?.exaggerationHint}
              valueLabel={`${nf1.format(exaggeration)}×`}
              min={LIMITS.exaggeration.min}
              max={LIMITS.exaggeration.max}
              step={0.1}
              value={exaggeration}
              onChange={(v) => set({ exaggeration: v })}
            />
          </Form.Group>

          <MmField
            id="fm-terrain-model-base"
            label={tm?.base}
            value={base}
            min={LIMITS.base.min}
            max={LIMITS.base.max}
            step={0.5}
            onChange={(v) => set({ base: v })}
          />

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-terrain-model-simplification"
              label={tm?.simplification}
              valueLabel={
                maxDeviation === 0
                  ? tm?.simplificationOff
                  : `${nf3.format(maxDeviation)} mm`
              }
              min={0}
              max={MAX_DEVIATION_STOPS.length - 1}
              step={1}
              value={deviationStop}
              onChange={(i) =>
                set({ maxDeviation: MAX_DEVIATION_STOPS[i] ?? 0 })
              }
            />
          </Form.Group>
        </fieldset>
      </Modal.Body>

      <FmModalFooter className="flex-wrap">
        {progress && tm && (
          <div className="w-100 text-end small">
            {progress.phase === 'mesh'
              ? tm.progressMesh
              : tm.progressTiles({
                  done: nf0.format(progress.done),
                  total: nf0.format(progress.total),
                })}
          </div>
        )}

        {built ? (
          <FmFooterButton
            variant="primary"
            onClick={handleSave}
            icon={<FaDownload />}
            label={tm?.download}
          />
        ) : (
          <FmFooterButton
            variant="primary"
            disabled={!plan || areaTooLarge || sideTooLong || busy}
            onClick={handleBuild}
            icon={busy ? <Spinner size="sm" /> : <FaCube />}
            label={tm?.build}
          />
        )}

        {busy ? (
          <FmDismissButton
            label={m?.general.cancel}
            onClick={() => cancelRef.current?.()}
          />
        ) : (
          <FmDismissButton label={m?.general.close} onClick={close} />
        )}
      </FmModalFooter>
    </Modal>
  );
}
