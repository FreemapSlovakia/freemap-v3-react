import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { useAreaCountries } from '@features/map/useAreaCountries.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import type { Bbox } from '@features/mapArea/model/actions.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import {
  ExportablesSelector,
  useAvailableExportables,
} from '@features/mapFeaturesExport/components/ExportablesSelector.js';
import { useMapFeaturesExportMessages } from '@features/mapFeaturesExport/translations/useMapFeaturesExportMessages.js';
import { integratedLayerDefsSelector } from '@features/mapLibrary/model/selectors.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium, premiumTileAuth } from '@features/premium/premium.js';
import {
  CreditNames,
  categorize,
  coversCountries,
  creditName,
  useRoutingAttributions,
} from '@shared/components/Attribution.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { Modal } from '@shared/components/Modal.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { ShareCreditsAlert } from '@shared/components/ShareCreditsAlert.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import {
  type AttributionDef,
  FIXTHEMAP_ATTR,
  OSM_DATA_ATTR,
  OSRM_ROUTING_ATTR,
} from '@shared/mapDefinitions.js';
import parametricShading from '@shared/mapLibrary/defs/parametricShading.js';
import { nearestStep } from '@shared/mathUtils.js';
import { saveBlob } from '@shared/saveBlob.js';
import { currentSite, siteNames, siteUrls } from '@shared/sites.js';
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
import {
  Alert,
  Col,
  Dropdown,
  Form,
  InputGroup,
  Row,
  Spinner,
} from 'react-bootstrap';
import { FaChevronLeft, FaCube, FaDownload } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { terrainModelSetSettings } from '../model/actions.js';
import {
  type DatasetCredits,
  resolveDatasetCredits,
} from '../model/credits.js';
import { NoElevationDataError } from '../model/errors.js';
import {
  type GenerateProgress,
  generateTerrainModel,
  write3mf,
} from '../model/generate.js';
import { isTextureMap } from '../model/mapTexture.js';
import type { Paint } from '../model/paint.js';
import { paintTexture } from '../model/paintTexture.js';
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
import {
  FEATURE_SOURCES,
  type FeatureSource,
  LIMITS,
  MAX_DEVIATION_STOPS,
  type TerrainModelSettingsState,
} from '../model/settingsReducer.js';
import { type Mesh, meshToStl, meshTriangles, stlBytes } from '../model/stl.js';
import { tileCount } from '../model/tileGrid.js';
import { useTerrainModelMessages } from '../translations/useTerrainModelMessages.js';
import type { AreaView, ModelView } from './TerrainPreview.js';
import {
  type ModelFeature,
  type ModelShape,
  useModelFeatures,
} from './useModelFeatures.js';
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

/** The finest elevation tile zoom served without premium. */
const FREE_ZOOM = (parametricShading.premiumFromZoom ?? 16) - 1;

/** Each map colour the features use, in order, with what uses it. */
function colourRows(features: ModelFeature[]) {
  const rows = new Map<
    string,
    { titles: Set<string>; sources: Set<FeatureSource> }
  >();

  for (const { source, title, shapes } of features) {
    for (const { colour } of shapes) {
      let row = rows.get(colour);

      if (!row) {
        row = { titles: new Set(), sources: new Set() };

        rows.set(colour, row);
      }

      row.sources.add(source);

      if (title) {
        row.titles.add(title);
      }
    }
  }

  return [...rows].map(([colour, row]) => ({ colour, ...row }));
}

/** Stored `|a|b|` sources; anything else is none. */
const deserializeSources = (value: string | null) =>
  value?.startsWith('|') && value.endsWith('|') ? value : '|';

/** The features with only the shapes `keep` passes, those left empty dropped. */
function keepShapes(
  features: ModelFeature[],
  keep: (shape: ModelShape) => boolean,
): ModelFeature[] {
  return features.flatMap((feature) => {
    const shapes = feature.shapes.filter(keep);

    return shapes.length ? [{ ...feature, shapes }] : [];
  });
}

/** Whether a shape's extent overlaps the area. */
function touches(shape: ModelShape, [west, south, east, north]: Bbox): boolean {
  const coords =
    shape.kind === 'point'
      ? [shape.coords]
      : shape.kind === 'line'
        ? shape.coords
        : shape.rings.flat();

  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;

  for (const [lon = 0, lat = 0] of coords) {
    w = Math.min(w, lon);
    e = Math.max(e, lon);
    s = Math.min(s, lat);
    n = Math.max(n, lat);
  }

  return w <= east && e >= west && s <= north && n >= south;
}

/** The filament colour of a map colour. */
const filament = (colourMap: Record<string, string>, colour: string) =>
  colourMap[colour] ?? colour;

/** One palette entry per distinct filament colour, the ground's first. */
function makePaint(
  features: ModelFeature[],
  settings: Pick<
    TerrainModelSettingsState,
    'groundColour' | 'colourMap' | 'lineWidth' | 'pointSize'
  >,
): Paint {
  const palette = [settings.groundColour];

  // TODO: past 256 filament colours an index wraps in the Uint8Array grid;
  // no slicer takes that many, so they could be refused here.
  const index = (colour: string) => {
    const c = filament(settings.colourMap, colour);

    const i = palette.indexOf(c);

    return i < 0 ? palette.push(c) - 1 : i;
  };

  const paint: Paint = {
    palette,
    fills: [],
    lines: [],
    points: [],
    lineWidthMm: settings.lineWidth,
    pointSizeMm: settings.pointSize,
  };

  for (const shape of features.flatMap(({ shapes }) => shapes)) {
    const colour = index(shape.colour);

    switch (shape.kind) {
      case 'fill':
        paint.fills.push({ colour, rings: shape.rings });

        break;
      case 'line':
        paint.lines.push({ colour, coords: shape.coords });

        break;
      case 'point':
        paint.points.push({ colour, coords: shape.coords });

        break;
    }
  }

  return paint;
}

type Props = { show: boolean };

/** A built model, kept to show and to save without building it again. */
type Result = {
  /** What it was built from; see `modelKey`. */
  key: string;
  /** Its own, so the view keys on one array per model. */
  bbox: Bbox;
  widthMm: number;
  depthMm: number;
  mesh: Mesh;
  /** Share of the grid without elevation data. */
  nodata: number;
  /** What its coloured features are made of. */
  featureCredits: AttributionDef[];
  /** The elevation datasets read; arrives after the model. */
  credits?: DatasetCredits;
  /** Data spacing read instead, where premium tiles were refused. */
  refusedAtM?: number;
  /** Downloaded: dropping it then asks nothing. */
  saved?: boolean;
  /** A coloured model's palette and its 3MF, written once it is built. */
  coloured?: { palette: string[]; file: Blob };
};

/** A number input as wide as its digits (see `doc/ui-conventions.md`). */
const numberWidth = (digits: number) => ({
  width: `calc(${digits}ch + 3rem)`,
  minWidth: 0,
});

const NUMBER_WIDTH = numberWidth(4);

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
      {label && (
        <Form.Label className="d-block" htmlFor={id}>
          {label}
        </Form.Label>
      )}

      <InputGroup className="d-inline-flex w-auto flex-nowrap">
        <Form.Control
          id={id}
          className="flex-grow-0"
          style={NUMBER_WIDTH}
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
        className="flex-grow-0"
        style={numberWidth(name === 'scale' ? 7 : 4)}
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
      <Form.Group className="mb-3">
        <Form.Label className="d-block" htmlFor="fm-terrain-model-width">
          {dimensionsLabel}
        </Form.Label>

        <InputGroup className="d-inline-flex w-auto flex-nowrap">
          {field('width')}

          <InputGroup.Text>×</InputGroup.Text>

          {field('depth')}

          <InputGroup.Text>mm</InputGroup.Text>
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="d-block" htmlFor="fm-terrain-model-scale">
          {scaleLabel}
        </Form.Label>

        <InputGroup className="d-inline-flex w-auto flex-nowrap">
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

  const em = useMapFeaturesExportMessages();

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

  // One array per area: the feature and paint memos key on it.
  const liveBbox = useMemo(
    () => areaBbox && normalizeBbox(areaBbox),
    [areaBbox],
  );

  const bbox = pinnedBbox ?? liveBbox;

  const acrossAntimeridian = areaBbox !== undefined && liveBbox === null;

  // Installed base maps drawn from image tiles, which a texture can use.
  const libraryDefs = useAppSelector(integratedLayerDefsSelector);

  const textureMaps = libraryDefs.filter(isTextureMap);

  // A country's own sources are credited only where the area lies in it.
  const attributionCountries = useAreaCountries(
    bbox,
    area === 'visible' && !pinnedBbox,
  );

  // Chosen explicitly: the map on screen may be WMS, vector or an overlay,
  // none of which a texture can draw. One uninstalled since leaves it plain.
  const textureMap = textureMaps.find((def) => def.type === settings.texture);

  const preview = usePreviewData(bbox, FREE_ZOOM, textureMap);

  // The feature sources coloured on the model, `|a|b|` as the export modals keep them.
  const [sourcesValue, setSourcesValue] = usePersistentState(
    'fm.terrainModel.sources',
    String,
    deserializeSources,
  );

  const availableSources = useAvailableExportables();

  const sources = FEATURE_SOURCES.filter(
    (source) =>
      sourcesValue.includes(`|${source}|`) &&
      availableSources.includes(`|${source}|`),
  );

  const { features: collected, pending: featuresPending } =
    useModelFeatures(sources);

  const sourcesKey = sources.join();

  // A source just deselected stays in the last collection a moment.
  const chosen = useMemo(
    () =>
      collected?.filter(({ source }) => sourcesKey.split(',').includes(source)),
    [collected, sourcesKey],
  );

  const { lineWidth, pointSize, groundColour, colourMap, omitted } = settings;

  // Those reaching into the area: one elsewhere on the map takes no filament.
  // TODO: by extent, so a line passing the area's corner can still take one.
  const features = useMemo(
    () => chosen && bbox && keepShapes(chosen, (shape) => touches(shape, bbox)),
    [chosen, bbox],
  );

  const rows = useMemo(() => colourRows(features ?? []), [features]);

  const painted = useMemo(
    () =>
      features &&
      keepShapes(features, ({ colour }) => !omitted.includes(colour)),
    [features, omitted],
  );

  const paint = useMemo(
    () =>
      painted?.length
        ? makePaint(painted, { groundColour, colourMap, lineWidth, pointSize })
        : undefined,
    [painted, groundColour, colourMap, lineWidth, pointSize],
  );

  const routingAttributions = useRoutingAttributions();

  // What the painted features are made of: OpenStreetMap, and the route's router.
  const featureCredits = useMemo(() => {
    const from = new Set(painted?.map(({ source }) => source));

    const defs = new Set([
      ...(from.has('plannedRoute') ? routingAttributions : []),
      ...(from.has('search') ? [OSM_DATA_ATTR] : []),
    ]);

    // FOSSGIS asks for it wherever an OSRM result is shown as a link.
    if (defs.has(OSRM_ROUTING_ATTR)) {
      defs.add(FIXTHEMAP_ATTR);
    }

    return [...defs];
  }, [painted, routingAttributions]);

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

  // Switching between the form and a built model starts the body at its top.
  const topRef = useRef<HTMLDivElement>(null);

  const confirm = useConfirm();

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
    // The features themselves are taken when building, as the area is: what
    // the map shows later leaves the model.
    // By the choice, not by `paint`: features changing live must not drop a model.
    sourcesValue !== '|' && [
      sourcesValue,
      groundColour,
      colourMap,
      omitted,
      lineWidth,
      pointSize,
    ],
  ]);

  // A model no longer matching the settings is dropped, not kept: it can be
  // hundreds of MB.
  if (result && result.key !== modelKey) {
    setResult(null);
  }

  const built = result?.key === modelKey ? result : null;

  const builtMesh = built?.mesh;

  const builtPalette = built?.coloured?.palette;

  // One object per model and per grid, so the view doesn't rebuild per render.
  const modelView = useMemo<ModelView | undefined>(
    () =>
      builtMesh
        ? { kind: 'model', mesh: builtMesh, palette: builtPalette }
        : undefined,
    [builtMesh, builtPalette],
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

  const previewTexture = preview.texture?.canvas ?? null;

  // Only the current area's grid is textured.
  const textureBbox = preview.heights?.bbox;

  const textureWidthMm = plan?.widthMm;

  // The area view draws the coloured lines over its texture.
  // Not under a built model, which shows its own colours.
  const areaTexture = useMemo(
    () =>
      paint && textureBbox && textureWidthMm && !built
        ? paintTexture(previewTexture, textureBbox, paint, textureWidthMm)
        : previewTexture,
    [paint, previewTexture, textureBbox, textureWidthMm, built],
  );

  // One preview for both views, so switching keeps its context and camera.
  const shown =
    modelView && built
      ? {
          view: modelView,
          bbox: built.bbox,
          widthMm: built.widthMm,
          depthMm: built.depthMm,
          // A coloured model shows its colours.
          texture: built.coloured ? null : previewTexture,
        }
      : areaView && shownGrid && plan && shownDims && !preview.problem
        ? {
            view: areaView,
            // The grid's own area, one array per fetch: a stable key.
            bbox: shownGrid.bbox,
            widthMm: plan.widthMm,
            depthMm: shownDims.depthMm,
            texture: preview.heights ? areaTexture : null,
          }
        : undefined;

  // Credits for what is drawn: the map only while it is draped, and the grid's
  // datasets (maybe the previous area's) until a built model's alert lists them.
  const previewCredits = [
    ...(shown?.texture && previewTexture
      ? (preview.texture?.credits ?? [])
      : []),
    ...(built ? [] : (preview.lastCredits?.credits ?? [])),
  ].filter((credit) => coversCountries(credit, attributionCountries));

  // A built model stays for as long as `modelKey` matches; the map draped on
  // it doesn't touch the file.
  const set = (values: Parameters<typeof terrainModelSetSettings>[0]) => {
    dispatch(terrainModelSetSettings(values));
  };

  const close = () => {
    cancelRef.current?.();

    dispatch(setActiveModal(null));
  };

  // An STL is written only now, from the mesh the view shows: half its size.
  // Late, after the picker opened, and any failure of it reported below. A
  // coloured model's 3MF was written with it, as it takes a worker.
  const handleSave = () => {
    if (!built) {
      return;
    }

    const { key, mesh, coloured } = built;

    trackMatomo(['trackEvent', 'TerrainModel', coloured ? '3mf' : 'stl']);

    saveBlob(
      coloured
        ? coloured.file
        : () => new Blob([meshToStl(mesh)], { type: 'model/stl' }),
      coloured ? 'freemap-terrain.3mf' : 'freemap-terrain.stl',
      coloured ? { 'model/3mf': ['.3mf'] } : { 'model/stl': ['.stl'] },
    ).then(
      () => setResult((r) => (r?.key === key ? { ...r, saved: true } : r)),
      (err: unknown) => {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError(tm?.error({ err: String(err) }) ?? String(err));
        }
      },
    );
  };

  // Close and Back both lose a model not yet downloaded; rebuilding can be slow.
  const mayDiscard = async () =>
    !built ||
    built.saved ||
    (await confirm({
      title: tm?.discardModelTitle,
      message: tm?.discardModelQuestion,
      confirmLabel: m?.general.yes,
      cancelLabel: m?.general.no,
      confirmStyle: 'danger',
    }));

  const handleClose = async () => {
    if (await mayDiscard()) {
      close();
    }
  };

  // To the settings as they were, for another build.
  const handleBack = async () => {
    if (!(await mayDiscard())) {
      return;
    }

    trackMatomo(['trackEvent', 'TerrainModel', 'back']);

    setResult(null);

    // A visible area follows the viewport again, as its toggle says.
    if (area === 'visible') {
      setPinnedBbox(null);
    }

    topRef.current?.scrollIntoView({ block: 'start' });
  };

  const handleBuild = async () => {
    if (!plan || !bbox) {
      return;
    }

    setError(null);

    setResult(null);

    setPinnedBbox(bbox);

    trackMatomo(['trackEvent', 'TerrainModel', 'build']);

    for (const source of new Set(painted?.map(({ source }) => source))) {
      trackMatomo(['trackEvent', 'TerrainModel', 'colourFeatures', source]);
    }

    // The model and its details appear at the preview.
    viewRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });

    const key = modelKey;

    const extras = featureCredits;

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
          paint,
        },
        setProgress,
      );

      cancelRef.current = () => {
        cancelled = true;

        run.cancel();
      };

      const out = await run.promise;

      if (cancelled) {
        return;
      }

      const creditsPromise = resolveDatasetCredits(out.attributions, 'terrain');

      let coloured: Result['coloured'];

      // Written now rather than on Download: a save started seconds after its
      // click may be refused, and the file names the credits.
      if (out.mesh.colours && paint) {
        setProgress({ type: 'progress', phase: 'file' });

        const names = [
          ...extras
            .filter((def) => def !== FIXTHEMAP_ATTR)
            .map((def) => creditName(def, m)),
          ...(await creditsPromise).credits.flatMap(({ name }) =>
            name ? [name] : [],
          ),
        ].filter(Boolean);

        if (cancelled) {
          return;
        }

        const site = `${siteNames[currentSite]}, ${siteUrls[currentSite]}`;

        // TODO: a failed write loses the built mesh, which could still save as STL.
        const write = write3mf({
          mesh: out.mesh,
          palette: paint.palette,
          metadata: {
            Title: 'Terrain model',
            Description: `Created with ${site}`,
            Application: site,
            ...(names.length && { Copyright: names.join(', ') }),
          },
        });

        cancelRef.current = () => {
          cancelled = true;

          write.cancel();
        };

        coloured = { palette: paint.palette, file: (await write.promise).blob };
      }

      setProgress(null);

      if (cancelled) {
        return;
      }

      setResult({
        key,
        bbox,
        widthMm: plan.widthMm,
        depthMm: plan.depthMm,
        mesh: out.mesh,
        featureCredits: coloured ? extras : [],
        nodata: out.nodata,
        refusedAtM:
          out.zoom < plan.zoom ? tilePixelM(out.zoom, bbox) : undefined,
        coloured,
      });

      // The form above the preview is gone; the built model starts at the top.
      topRef.current?.scrollIntoView({ block: 'start' });

      creditsPromise.then((credits) => {
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
      onHide={handleClose}
      className={selecting ? 'd-none' : undefined}
      backdropClassName={selecting ? 'd-none' : undefined}
      size="lg"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCube /> <Text k="mainMenu.terrainModel" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div ref={topRef} />

        <OfflineAlert />

        <fieldset disabled={busy}>
          {/* A built model hides the settings that made it; Back leads out. */}
          {!built && (
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
          )}

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
                    <TerrainPreview
                      {...shown}
                      unavailable={<Text m={tm} k="previewUnavailable" />}
                    />
                  </Suspense>

                  <Form.Text className="d-block mb-3 mt-n2">
                    <Text m={tm} k={modelView ? 'viewModel' : 'viewArea'} />
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
                  <p>
                    {tm.result({
                      height: nf1.format(built.mesh.heightMm),
                      triangles: nf0.format(meshTriangles(built.mesh)),
                      size: formatSize(
                        built.coloured?.file.size ?? stlBytes(built.mesh),
                      ),
                    })}
                  </p>

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

                  {/* As the map export says it: what the file is made of. */}
                  {built.credits && (
                    <ShareCreditsAlert
                      prompt={<Text m={tm} k="shareCredits" />}
                      credits={[
                        ...built.featureCredits,
                        ...built.credits.credits,
                      ].flatMap((def) => {
                        const name = creditName(def, m);

                        return name ? [{ name, url: def.url }] : [];
                      })}
                      noneReported={
                        !built.credits.reported && (
                          <Text m={tm} k="creditsNone" />
                        )
                      }
                      unknown={{
                        label: <Text m={tm} k="unknownSources" />,
                        codes: built.credits.unresolved,
                      }}
                    />
                  )}

                  {/* A request, apart from the credits the licences require. */}
                  <p className="small">
                    <Text m={tm} k="mentionFreemap" />{' '}
                    <span className="user-select-all">
                      {siteNames[currentSite]} (
                      <a
                        href={siteUrls[currentSite]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {siteUrls[currentSite].replace('https://www.', '')}
                      </a>
                      )
                    </span>
                  </p>
                </>
              )}

              <Form.Group className="mb-3">
                {/* A coloured model shows its colours, never a map. */}
                {!built?.coloured && (
                  <>
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
                        <Dropdown.Item
                          as="button"
                          type="button"
                          eventKey="none"
                        >
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
                  </>
                )}

                {previewCredits.length > 0 && (
                  // As the map's own attribution: by type, deduplicated, linked.
                  <Form.Text>
                    {categorize(previewCredits).map(
                      ({ type, attributions }, i) => (
                        <Fragment key={type}>
                          {i > 0 && ' · '}
                          <Text k={`mapLayers.type.${type}`} />{' '}
                          <CreditNames attributions={attributions} />
                        </Fragment>
                      ),
                    )}
                  </Form.Text>
                )}
              </Form.Group>
            </>
          )}

          {!built && (
            <Row className="gx-3">
              <Col lg={6} className="d-flex">
                <fieldset className="mb-3 border rounded p-3 flex-grow-1">
                  <legend>
                    <Text m={tm} k="sizeAndShape" />
                  </legend>

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
                      {/* Not mid-run: following the offer would cancel it. Nor
                      where there is no data to read finer. */}
                      {premiumPlan && !busy && preview.problem !== 'noData' && (
                        <>
                          <br />
                          {tm.premiumFiner(
                            (label) => (
                              <PremiumGem
                                label={label}
                                onBeforeNavigate={close}
                              />
                            ),
                            {
                              detail: nfDetail.format(
                                plan.stepMm / plan.mmPerM,
                              ),
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
              </Col>

              <Col lg={6} className="d-flex">
                <fieldset className="mb-3 border rounded p-3 flex-grow-1">
                  <legend>
                    <Text m={tm} k="colourFeatures" />
                    <HintMark hint={tm?.colourFeaturesHint} />
                  </legend>

                  <ExportablesSelector
                    types={FEATURE_SOURCES}
                    value={sourcesValue}
                    available={availableSources}
                    onChange={setSourcesValue}
                  />

                  {paint && (
                    <div className="d-flex flex-wrap column-gap-3 mt-3">
                      {paint.lines.length > 0 && (
                        <MmField
                          id="fm-terrain-model-line-width"
                          label={tm?.lineWidth}
                          value={lineWidth}
                          min={LIMITS.lineWidth.min}
                          max={LIMITS.lineWidth.max}
                          step={0.1}
                          onChange={(v) => set({ lineWidth: v })}
                        />
                      )}

                      {paint.points.length > 0 && (
                        <MmField
                          id="fm-terrain-model-point-size"
                          label={tm?.pointSize}
                          value={pointSize}
                          min={LIMITS.pointSize.min}
                          max={LIMITS.pointSize.max}
                          step={0.5}
                          onChange={(v) => set({ pointSize: v })}
                        />
                      )}
                    </div>
                  )}

                  {/* Every colour unticked still lists them, to tick again. */}
                  {rows.length > 0 && (
                    <Form.Group className={paint ? 'mb-3' : 'my-3'}>
                      <Form.Label className="d-block">
                        <Text m={tm} k="colours" />
                      </Form.Label>

                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center gap-2">
                          {/* In line with the rows' checkboxes. */}
                          <span
                            className="flex-shrink-0"
                            style={{ width: '1em' }}
                          />

                          <RgbaColorPicker
                            alpha={false}
                            className="flex-shrink-0"
                            style={{ width: '4rem' }}
                            value={groundColour}
                            onChange={(colour) =>
                              set({ groundColour: colour.toLowerCase() })
                            }
                          />

                          <Text m={tm} k="ground" />
                        </div>

                        {rows.map(({ colour, titles, sources }) => (
                          <div
                            key={colour}
                            className="d-flex align-items-center gap-2"
                          >
                            <Form.Check.Input
                              id={`fm-terrain-model-colour-${colour}`}
                              type="checkbox"
                              className="flex-shrink-0 mt-0"
                              checked={!omitted.includes(colour)}
                              onChange={(e) => {
                                const { checked } = e.currentTarget;

                                if (!checked) {
                                  trackMatomo([
                                    'trackEvent',
                                    'TerrainModel',
                                    'omitColour',
                                  ]);
                                }

                                set({
                                  omitted: checked
                                    ? omitted.filter((c) => c !== colour)
                                    : [...omitted, colour],
                                });
                              }}
                            />

                            <RgbaColorPicker
                              alpha={false}
                              // Hidden, not removed, so the label stays aligned.
                              className={`flex-shrink-0${omitted.includes(colour) ? ' invisible' : ''}`}
                              style={{ width: '4rem' }}
                              value={filament(colourMap, colour)}
                              onChange={(c) => {
                                // The map's own colour needs no entry.
                                const next = { ...colourMap };

                                delete next[colour];

                                if (c.toLowerCase() !== colour) {
                                  next[colour] = c.toLowerCase();
                                }

                                set({ colourMap: next });
                              }}
                            />

                            <label
                              htmlFor={`fm-terrain-model-colour-${colour}`}
                              className={`d-flex align-items-center gap-2${omitted.includes(colour) ? ' text-body-secondary' : ''}`}
                              style={{ minWidth: 0 }}
                            >
                              {/* The map colour this row stands for. */}
                              <span
                                className="flex-shrink-0 rounded-1 border"
                                style={{
                                  width: '1rem',
                                  height: '1rem',
                                  background: colour,
                                }}
                              />

                              <span className="text-truncate">
                                {titles.size > 0
                                  ? [...titles].slice(0, 3).join(', ') +
                                    (titles.size > 3
                                      ? ` +${titles.size - 3}`
                                      : '')
                                  : [...sources].map((source, i) => (
                                      <Fragment key={source}>
                                        {i > 0 && ', '}
                                        <Text m={em} k={`what.${source}`} />
                                      </Fragment>
                                    ))}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  )}
                </fieldset>
              </Col>
            </Row>
          )}
        </fieldset>
      </Modal.Body>

      <FmModalFooter className="flex-wrap">
        {tm && progress && (
          <div className="w-100 text-end small">
            {progress.phase === 'mesh'
              ? tm.progressMesh
              : progress.phase === 'file'
                ? tm.progressFile
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
            label={built.coloured ? tm?.download3mf : tm?.download}
          />
        ) : (
          <FmFooterButton
            variant="primary"
            disabled={
              !plan ||
              areaTooLarge ||
              sideTooLong ||
              busy ||
              (sources.length > 0 && featuresPending)
            }
            onClick={handleBuild}
            icon={busy ? <Spinner size="sm" /> : <FaCube />}
            label={tm?.build}
          />
        )}

        {built && (
          <FmFooterButton
            variant="dark"
            onClick={handleBack}
            icon={<FaChevronLeft />}
            label={m?.general.back}
          />
        )}

        {busy ? (
          <FmDismissButton
            label={m?.general.cancel}
            onClick={() => cancelRef.current?.()}
          />
        ) : (
          <FmDismissButton label={m?.general.close} onClick={handleClose} />
        )}
      </FmModalFooter>
    </Modal>
  );
}
