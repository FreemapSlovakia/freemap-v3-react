import { AsyncComponent } from '@app/components/AsyncComponent.js';
import { setActiveModal } from '@app/store/actions.js';
import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapLayerRemove,
  mapLayerSetupChange,
  mapLayerSetupReset,
  mapOverlayMove,
  mapPresetChange,
  mapPresetLayerAdd,
  mapPresetLayerRemove,
  mapSetFeaturesHidden,
  type SetupTarget,
} from '@features/map/model/actions.js';
import { canSwitchKind } from '@features/map/model/layerKind.js';
import {
  hasOwnConfig,
  isEmptySetup,
  setupKey,
  usageOf,
} from '@features/map/model/layerSetup.js';
import {
  canJoinPreset,
  isLinkPreset,
  isPresettable,
  memberKind,
  presetIdOf,
  presetItem,
} from '@features/map/model/mapPreset.js';
import { layerKindsSelector } from '@features/map/model/selectors.js';
import {
  installedLibraryIndexSelector,
  type MapRef,
  mapByIdSelector,
  nativeKindsSelector,
  overlayStackSelector,
  presetByIdSelector,
  presetKindsSelector,
  resolvedCustomLayersSelector,
  type WmsLayerDef,
} from '@features/mapLibrary/model/selectors.js';
import { PanelHeaderSlotContext } from '@features/mapSettings/panelHeaderSlot.js';
import {
  colorToHexa,
  hexaToColor,
  type Color as ShadingColor,
} from '@features/parameterizedShading/model/Shading.js';
import { CustomMapGlyph } from '@shared/components/CustomMapGlyph.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  LayerKindMark,
  MapLayerItem,
} from '@shared/components/MapLayerItem.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { formatShortcut } from '@shared/components/ShortcutRecorder.js';
import { TruncatedText } from '@shared/components/TruncatedText.js';
import { UnsavedWarningIcon } from '@shared/components/UnsavedWarningIcon.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { useFillToBottom } from '@shared/hooks/useFillToBottom.js';
import { layerLabel } from '@shared/layerName.js';
import { resolveLayerOpacity } from '@shared/mapDefinitions.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import { FEATURES_LAYER, mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import clsx from 'clsx';
import {
  type CSSProperties,
  createContext,
  Fragment,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Badge, Button, Card, CloseButton, Dropdown } from 'react-bootstrap';
import {
  FaArrowLeft,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaLayerGroup,
  FaPencilAlt,
  FaPlus,
  FaSave,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import { MdDashboardCustomize, MdDragIndicator } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useTargetDef, useTargetSetup } from '../layerTarget.js';
import { type PanelPlace, useMapLayersPanel } from '../mapLayersPanelStore.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { LayerKindButton } from './LayerKindButton.js';
import { LayerKindSwitch } from './LayerKindSwitch.js';
import { LayerOpacitySlider } from './LayerOpacitySlider.js';
import { MapFeatureItems } from './MapFeatureItems.js';
import classes from './MapLayersPanel.module.css';
import { OpacityButton } from './OpacityButton.js';
import { type MapFeatureRow, useMapFeatureRows } from './useMapFeatureRows.js';
import { WmsSection } from './WmsSection.js';

const shadingSectionFactory = () =>
  import(
    /* webpackChunkName: "shading-section" */
    '@features/parameterizedShading/components/ShadingSection.js'
  );

// The project adds no screen-reader-only text; dnd-kit would.
const NO_SCREEN_READER_TEXT = {
  screenReaderInstructions: { draggable: '' },
  announcements: {
    onDragStart: () => undefined,
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
  },
};

// The row under the pointer: the dragged row is held by its handle.
const underPointer: CollisionDetection = (args) => {
  const hits = pointerWithin(args);

  return hits.length ? hits : closestCenter(args);
};

/**
 * What is on the map, top first. A preset is one row, opened to its own
 * layers; a map's settings open on a page of their own.
 */
export default function MapLayersPanel(): ReactElement {
  const m = useMessages();

  const { setOpen, place, setPlace } = useMapLayersPanel();

  const layers = useAppSelector((state) => state.map.layers);

  const presetById = useAppSelector(presetByIdSelector);

  const preset =
    place.preset !== undefined && layers.includes(presetItem(place.preset))
      ? presetById[place.preset]
      : undefined;

  const listedRows = useMapFeatureRows();

  // Not in an embed: a visitor neither opens the tools nor clears the host's data.
  const featureRows = window.fmEmbedded ? [] : listedRows;

  const featureRow =
    place.feature === undefined
      ? undefined
      : featureRows.find((row) => row.id === place.feature);

  // Where the panel was left, if that is still on the map; else the stack.
  const stillThere =
    place.feature !== undefined
      ? featureRow !== undefined
      : place.type === undefined
        ? preset !== undefined
        : place.preset === undefined
          ? layers.includes(place.type)
          : Boolean(preset?.layers.some((layer) => layer.type === place.type));

  const at: PanelPlace = stillThere ? place : {};

  const feature = at.feature === undefined ? undefined : featureRow;

  const target = at.type === undefined ? undefined : { ...at, type: at.type };

  const up: PanelPlace = at.type === undefined ? {} : { preset: at.preset };

  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  useFillToBottom(panel, classes.list);

  const top =
    at.type === undefined &&
    at.preset === undefined &&
    at.feature === undefined;

  // The map's only item, if it is a map with settings.
  const onlyWithPage = useAppSelector((state) => {
    const [only, ...rest] = state.map.layers;

    return only !== undefined &&
      rest.length === 0 &&
      presetIdOf(only) === undefined &&
      mapHasPage(mapByIdSelector(state)[only])
      ? only
      : undefined;
  });

  const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null);

  const opened = useRef(false);

  const featuresListed = featureRows.length > 0;

  // Opened on the stack of that one map and nothing else: its settings
  // instead, before the stack paints.
  useLayoutEffect(() => {
    if (opened.current) {
      return;
    }

    opened.current = true;

    if (top && onlyWithPage !== undefined && !featuresListed) {
      setPlace({ type: onlyWithPage });
    }
  }, [top, onlyWithPage, featuresListed, setPlace]);

  return (
    <Card body className={clsx(classes.panel, 'fm-frosted', 'mt-2 ms-2')}>
      <div ref={setPanel} className="d-flex flex-column">
        {/* The bare icon at the top lines up with the rows' icons. */}
        <div
          className={clsx(
            classes.header,
            'd-flex align-items-center gap-1 py-1 pe-1',
            top ? 'ps-3' : 'ps-2',
          )}
        >
          {top ? (
            <FaLayerGroup className="flex-shrink-0" />
          ) : (
            <LongPressTooltip label={m?.general.back}>
              {({ props }) => (
                <Button
                  variant="secondary"
                  className="flex-shrink-0"
                  onClick={() => setPlace(up)}
                  {...props}
                >
                  <FaArrowLeft />
                </Button>
              )}
            </LongPressTooltip>
          )}

          {/* A feature's icon opens its tool, as a selection's toolbar does. */}
          {feature &&
            (feature.control ?? (
              <span className="d-inline-flex flex-shrink-0">
                {feature.icon}
              </span>
            ))}

          <span className="flex-grow-1 min-w-0 d-flex">
            {feature ? (
              <TruncatedText>{feature.label}</TruncatedText>
            ) : target ? (
              <TargetName target={target} />
            ) : at.preset !== undefined && preset ? (
              <PresetName id={at.preset} />
            ) : (
              <span className="text-truncate">{m?.mapLayers.layersPanel}</span>
            )}
          </span>

          <div ref={setHeaderSlot} className="d-contents" />

          {top && featuresListed && <FeaturesHiddenToggle />}

          <LongPressTooltip label={m?.general.close}>
            {({ props }) => (
              <CloseButton
                // In the corner, as a toast's is.
                className="flex-shrink-0 align-self-start"
                onClick={() => setOpen(false)}
                {...props}
              />
            )}
          </LongPressTooltip>
        </div>

        <div className={clsx(classes.list, 'px-2 pb-2')}>
          {feature ? (
            <MapFeatureItems feature={feature.id} />
          ) : target ? (
            <PanelHeaderSlotContext value={headerSlot}>
              <LayerSettings key={setupKey(target)} target={target} />
            </PanelHeaderSlotContext>
          ) : at.preset !== undefined ? (
            <PresetLayers id={at.preset} onOpen={setPlace} />
          ) : (
            <Stack onOpen={setPlace} featureRows={featureRows} />
          )}
        </div>
      </div>
    </Card>
  );
}

/** A preset's name with its marks, laid out as `MapLayerItem` lays out a map's. */
function PresetName({
  id,
  noKindMark,
}: {
  id: string;
  /** Where the row shows the kind beside the opacity. */
  noKindMark?: boolean;
}): ReactElement | null {
  const preset = useAppSelector((state) => presetByIdSelector(state)[id]);

  const kind = useAppSelector((state) => presetKindsSelector(state)[id]);

  if (!preset) {
    return null;
  }

  return (
    <span className="d-inline-flex align-items-center gap-1 mw-100">
      {kind && !noKindMark && <LayerKindMark kind={kind} />}

      <span className="d-inline-flex flex-shrink-0">
        <CustomMapGlyph spec={preset.iconSpec} kind="preset" />
      </span>

      <TruncatedText>{preset.name}</TruncatedText>
    </span>
  );
}

function FeaturesHiddenToggle(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const hidden = useAppSelector((state) => state.map.featuresHidden);

  // As the keyboard answers it: a cleared one (`null`) is none, and an
  // uninstalled layer has none.
  const shortcut = useAppSelector((state) => {
    const { layersSettings } = state.map;

    if (!isLayerInstalled(layersSettings, FEATURES_LAYER)) {
      return undefined;
    }

    const own = layersSettings[FEATURES_LAYER]?.shortcut;

    return own === undefined ? mapIndexById[FEATURES_LAYER]?.shortcut : own;
  });

  return (
    <LongPressTooltip
      label={layerLabel({ type: FEATURES_LAYER }, m)}
      kbd={shortcut ? formatShortcut(shortcut) : undefined}
    >
      {({ props }) => (
        <Button
          variant={hidden ? 'primary' : 'outline-primary'}
          className="flex-shrink-0"
          onClick={() => dispatch(mapSetFeaturesHidden(!hidden))}
          {...props}
        >
          {hidden ? <FaEyeSlash /> : <FaEye />}
        </Button>
      )}
    </LongPressTooltip>
  );
}

function FeatureRowLabel({ row }: { row: MapFeatureRow }): ReactElement {
  const hidden = useAppSelector((state) => state.map.featuresHidden);

  return (
    <span
      className={clsx(
        'd-inline-flex align-items-center gap-1 mw-100',
        hidden && 'text-muted',
      )}
    >
      <span className="d-inline-flex flex-shrink-0">{row.icon}</span>

      <TruncatedText>{row.label}</TruncatedText>

      {row.count !== undefined && (
        <Badge pill bg="secondary" className="flex-shrink-0">
          {row.count}
        </Badge>
      )}
    </span>
  );
}

function TargetName({ target }: { target: SetupTarget }): ReactElement {
  const def = useTargetDef(target);

  return def ? (
    <MapLayerItem def={def} truncate />
  ) : (
    <span className="text-truncate">{target.type}</span>
  );
}

type Drag = {
  setNodeRef: (el: HTMLElement | null) => void;
  style: CSSProperties;
  handle: HTMLAttributes<HTMLElement>;
};

/**
 * Rows top first, the movable ones by a handle and only among each other;
 * `top` stays above them and `bottom` under them.
 */
function SortableRows({
  items,
  movable,
  top,
  bottom,
  onMove,
  render,
}: {
  items: string[];
  movable: ReadonlySet<string>;
  top?: ReactNode;
  bottom?: ReactNode;
  onMove: (item: string, to: string) => void;
  render: (item: string, drag?: Drag) => ReactNode;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  // Up and down within the movable rows' box only.
  const within: Modifier = ({ transform, draggingNodeRect }) => {
    const box = ref.current?.getBoundingClientRect();

    return {
      ...transform,
      x: 0,
      y:
        box && draggingNodeRect
          ? Math.min(
              Math.max(transform.y, box.top - draggingNodeRect.top),
              box.bottom - draggingNodeRect.bottom,
            )
          : transform.y,
    };
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // A lone movable row has nowhere to go, so it gets no handle.
  const movables = items.filter((item) => movable.has(item));

  const sortable = movables.length > 1 ? movables : [];

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      onMove(String(active.id), String(over.id));
    }
  };

  return (
    <HandleColumnContext.Provider value={sortable.length > 0}>
      {top}

      <DndContext
        sensors={sensors}
        collisionDetection={underPointer}
        onDragEnd={handleDragEnd}
        accessibility={NO_SCREEN_READER_TEXT}
        modifiers={[within]}
      >
        <SortableContext
          items={sortable}
          strategy={verticalListSortingStrategy}
        >
          <div ref={ref}>
            {items.map((item) =>
              sortable.includes(item) ? (
                <SortableItem key={item} id={item} render={render} />
              ) : (
                <Fragment key={item}>{render(item)}</Fragment>
              ),
            )}
          </div>
        </SortableContext>
      </DndContext>

      {bottom}
    </HandleColumnContext.Provider>
  );
}

function SortableItem({
  id,
  render,
}: {
  id: string;
  render: (item: string, drag?: Drag) => ReactNode;
}): ReactNode {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return render(id, {
    setNodeRef,
    style: {
      transform: CSS.Translate.toString(transform),
      transition,
      // Above its neighbours while carried.
      position: isDragging ? 'relative' : undefined,
      zIndex: isDragging ? 1 : undefined,
    },
    // Focusable for the keyboard sensor; no screen-reader attributes.
    handle: { tabIndex: attributes.tabIndex, ...listeners },
  });
}

/**
 * Whether the list keeps a column for drag handles: where any row has one, so
 * the names beside it line up.
 */
const HandleColumnContext = createContext(true);

/** One row: what it is, its opacity, taking it off, and opening it. */
function Row({
  drag,
  label,
  onOpen,
  kind,
  opacity,
  onOpacity,
  onRemove,
}: {
  drag?: Drag;
  label: ReactNode;
  /** Unset, the row has no page to open. */
  onOpen?: () => void;
  /** Its base/overlay mark or switch, beside the opacity. */
  kind?: ReactNode;
  opacity?: number;
  onOpacity?: (opacity: number) => void;
  onRemove?: () => void;
}): ReactElement {
  const m = useMessages();

  const handleColumn = useContext(HandleColumnContext);

  return (
    // Across the list's padding to the panel's edges and padded as a menu
    // item is; the trash button reaches into that by its own padding, so its
    // icon keeps the same distance from the edge as the row's first one.
    <div
      ref={drag?.setNodeRef}
      style={drag?.style}
      className={clsx(classes.row, 'mx-n2 px-3')}
    >
      <div className="d-flex align-items-center gap-1">
        {drag ? (
          <span
            className="d-inline-flex text-muted flex-shrink-0"
            // The handle alone starts a drag; on touch it mustn't scroll.
            style={{ cursor: 'grab', touchAction: 'none' }}
            {...drag.handle}
          >
            <MdDragIndicator />
          </span>
        ) : (
          handleColumn && <span className={classes.handleSpace} />
        )}

        <button
          type="button"
          className={clsx(
            classes.rowToggle,
            'flex-grow-1 d-flex align-items-center text-start overflow-hidden',
          )}
          disabled={!onOpen}
          onClick={onOpen}
        >
          {label}
        </button>

        {kind && <span className="flex-shrink-0 d-inline-flex">{kind}</span>}

        {opacity !== undefined && onOpacity && (
          <span className="flex-shrink-0 d-inline-flex">
            <OpacityButton value={opacity} onChange={onOpacity} />
          </span>
        )}

        {onRemove && (
          <LongPressTooltip label={m?.general.remove}>
            {({ props }) => (
              <Button
                variant="link"
                size="sm"
                className="flex-shrink-0 text-body px-1 me-n1"
                onClick={onRemove}
                {...props}
              >
                <FaTrash />
              </Button>
            )}
          </LongPressTooltip>
        )}
      </div>
    </div>
  );
}

/** A map's row, on its own on the map or as a preset's layer. */
function MapRow({
  target,
  drag,
  onOpen,
}: {
  target: SetupTarget;
  drag?: Drag;
  onOpen: (place: PanelPlace) => void;
}): ReactElement | null {
  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const def = useTargetDef(target);

  // Shading edits waiting for Apply, kept while the page is left.
  const unapplied = useAppSelector((state) =>
    Boolean(state.map.shadingDrafts[target.type]),
  );

  const setup = useTargetSetup(target);

  const ref = useAppSelector((state) => mapByIdSelector(state)[target.type]);

  // A base map too: the map is then left without one, its background showing.
  const remove = () =>
    dispatch(
      target.preset !== undefined
        ? mapPresetLayerRemove({ id: target.preset, type: target.type })
        : mapLayerRemove({ item: target.type }),
    );

  // A preset's map not known here (still loading, or another device's
  // offline map): shown by its id, so it can at least be taken out.
  if (!def) {
    return target.preset === undefined ? null : (
      <Row
        drag={drag}
        label={<span className="text-truncate text-muted">{target.type}</span>}
        onRemove={remove}
      />
    );
  }

  // An offline map keeps the kind it was saved with.
  const switchable = ref?.origin !== 'cached' && canSwitchKind(def.technology);

  return (
    <Row
      drag={drag}
      label={
        // The name gives way so the triangle stays in view.
        <span className="d-inline-flex align-items-center gap-1 mw-100">
          <span className="d-inline-flex min-w-0">
            <MapLayerItem def={def} truncate noKindMark />
          </span>

          {unapplied && (
            <UnsavedWarningIcon
              className="flex-shrink-0"
              tooltip={msm?.unappliedShading}
            />
          )}
        </span>
      }
      onOpen={mapHasPage(ref) ? () => onOpen(target) : undefined}
      kind={
        <LayerKindButton
          value={def.layer}
          onChange={
            switchable
              ? (kind) =>
                  dispatch(mapLayerSetupChange({ ...target, setup: { kind } }))
              : undefined
          }
        />
      }
      opacity={resolveLayerOpacity(def, setup?.opacity)}
      onOpacity={(opacity) =>
        dispatch(mapLayerSetupChange({ ...target, setup: { opacity } }))
      }
      onRemove={remove}
    />
  );
}

function PresetRow({
  id,
  drag,
  onOpen,
}: {
  id: string;
  drag?: Drag;
  onOpen: (place: PanelPlace) => void;
}): ReactElement | null {
  const dispatch = useDispatch();

  const preset = useAppSelector((state) => presetByIdSelector(state)[id]);

  const kind = useAppSelector((state) => presetKindsSelector(state)[id]);

  if (!preset) {
    return null;
  }

  return (
    <Row
      drag={drag}
      label={<PresetName id={id} noKindMark />}
      onOpen={() => onOpen({ preset: id })}
      // By whether it holds a base map; switched on its layers' pages.
      kind={kind && <LayerKindButton value={kind} />}
      opacity={preset.opacity ?? 1}
      onOpacity={(opacity) =>
        dispatch(mapPresetChange({ id, change: { opacity } }))
      }
      onRemove={() => dispatch(mapLayerRemove({ item: presetItem(id) }))}
    />
  );
}

/** Whether a map has a page: more to set than the row's kind and opacity. */
function mapHasPage(ref: MapRef | undefined): boolean {
  if (ref?.origin === 'custom') {
    return true; // Modify, at least
  }

  return (
    ref?.origin === 'library' &&
    hasOwnConfig(ref.def?.technology ?? ref.entry.technology)
  );
}

/** The stack: the overlays and overlay presets as they stack, then the base. */
function Stack({
  onOpen,
  featureRows,
}: {
  onOpen: (place: PanelPlace) => void;
  featureRows: MapFeatureRow[];
}): ReactElement {
  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const canSave = useCanSaveSettings();

  const layers = useAppSelector((state) => state.map.layers);

  const { stack, movable } = useAppSelector(overlayStackSelector);

  const presetKinds = useAppSelector(presetKindsSelector);

  const layerKinds = useAppSelector(layerKindsSelector);

  const kindOf = (item: string) => {
    const id = presetIdOf(item);

    return id !== undefined ? presetKinds[id] : layerKinds.get(item);
  };

  const overlays = stack.filter((item) => layers.includes(item));

  const base = layers.find((item) => kindOf(item) === 'base');

  const layerSetups = useAppSelector((state) => state.map.layerSetups);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  // What a preset can hold: not offline maps, which are this device's alone.
  const maps = layers.filter(
    (item) => presetIdOf(item) !== undefined || canJoinPreset(item, cachedMaps),
  );

  // Two maps or presets, or one map at its own opacity or kind (its shading
  // and layers stay the map's).
  const makesNew =
    maps.length > 1 ||
    (maps.length === 1 &&
      presetIdOf(maps[0]!) === undefined &&
      !isEmptySetup(usageOf(layerSetups[maps[0]!])));

  const render = (item: string, drag?: Drag) => {
    const id = presetIdOf(item);

    return id === undefined ? (
      <MapRow target={{ type: item }} drag={drag} onOpen={onOpen} />
    ) : (
      <PresetRow id={id} drag={drag} onOpen={onOpen} />
    );
  };

  return (
    <>
      <SortableRows
        items={overlays}
        movable={movable}
        top={featureRows.map((row) => (
          <Row
            key={row.id}
            label={<FeatureRowLabel row={row} />}
            onOpen={() => onOpen({ feature: row.id })}
            onRemove={row.onRemove}
          />
        ))}
        bottom={base && render(base)}
        onMove={(type, to) => dispatch(mapOverlayMove({ type, to }))}
        render={render}
      />

      {/* Only where it combines something: one map alone already keeps its
          setup, and a lone preset would come out a copy, which Duplicate is for. */}
      {!window.fmEmbedded && makesNew && (
        <div className="d-flex mt-2">
          {/* What a preset can't hold is named in the form it opens. */}
          <LongPressTooltip label={msm?.saveLayersAsPresetHint}>
            {/* The span takes the tooltip, which a disabled button can't. */}
            {({ props }) => (
              <span className="ms-auto d-flex min-w-0" {...props}>
                <Button
                  variant="secondary"
                  className="text-truncate"
                  disabled={!canSave}
                  onClick={() =>
                    dispatch(
                      setActiveModal({
                        type: 'installed-maps',
                        customMap: { addPreset: true, returnTo: null },
                      }),
                    )
                  }
                >
                  <MdDashboardCustomize /> {msm?.saveLayersAsPreset}
                </Button>
              </span>
            )}
          </LongPressTooltip>
        </div>
      )}
    </>
  );
}

/** A preset's own layers, top first, its base map at the bottom. */
function PresetLayers({
  id,
  onOpen,
}: {
  id: string;
  onOpen: (place: PanelPlace) => void;
}): ReactElement | null {
  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const canSave = useCanSaveSettings();

  const preset = useAppSelector((state) => presetByIdSelector(state)[id]);

  const nativeKinds = useAppSelector(nativeKindsSelector);

  if (!preset) {
    return null;
  }

  const base = preset.layers.find(
    (layer) => memberKind(layer, nativeKinds) === 'base',
  );

  const overlays = preset.layers
    .filter((layer) => layer !== base)
    .map((layer) => layer.type)
    .reverse();

  const render = (type: string, drag?: Drag) => (
    <MapRow target={{ type, preset: id }} drag={drag} onOpen={onOpen} />
  );

  return (
    <>
      {/* A copy as the account's own, in its place: a link's to keep it, one's
          own to change without touching the original. */}
      {!window.fmEmbedded && (
        <div className="d-flex mb-2">
          <Button
            variant="secondary"
            className="ms-auto text-truncate"
            disabled={!canSave}
            onClick={() =>
              dispatch(
                setActiveModal({
                  type: 'installed-maps',
                  customMap: { addPresetFrom: id, returnTo: null },
                }),
              )
            }
          >
            {isLinkPreset(id) ? (
              <>
                <MdDashboardCustomize /> {msm?.saveAsPreset}
              </>
            ) : (
              <>
                <FaCopy /> {msm?.duplicatePreset}
              </>
            )}
          </Button>
        </div>
      )}

      <LayerOpacitySlider
        className="mb-2"
        value={preset.opacity ?? 1}
        onChange={(opacity) =>
          dispatch(mapPresetChange({ id, change: { opacity } }))
        }
      />

      {preset.layers.length === 0 ? (
        <p className="text-muted">{msm?.presetEmpty}</p>
      ) : (
        <SortableRows
          items={overlays}
          movable={new Set(overlays)}
          bottom={base && render(base.type)}
          onMove={(type, to) =>
            dispatch(mapOverlayMove({ type, to, preset: id }))
          }
          render={render}
        />
      )}

      <AddMap id={id} />
    </>
  );
}

/** Picks an installed map to add to a preset. */
function AddMap({ id }: { id: string }): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const preset = useAppSelector((state) => presetByIdSelector(state)[id]);

  const installed = useAppSelector(installedLibraryIndexSelector);

  const customLayers = useAppSelector(resolvedCustomLayersSelector);

  // Not offline maps: they are this device's alone, a preset the account's.
  const candidates = [...installed, ...customLayers].filter(
    (def) =>
      isPresettable(def.type) &&
      !preset?.layers.some((layer) => layer.type === def.type),
  );

  return (
    <Dropdown className="d-flex mt-2">
      <Dropdown.Toggle
        variant="secondary"
        className="ms-auto"
        disabled={candidates.length === 0}
      >
        <FaPlus /> {msm?.addMap}
      </Dropdown.Toggle>

      <FmDropdownMenu>
        {(['base', 'overlay'] as const).map((kind) =>
          candidates
            .filter((def) => def.layer === kind)
            .map((def) => (
              <Dropdown.Item
                key={def.type}
                as="button"
                onClick={() =>
                  dispatch(mapPresetLayerAdd({ id, type: def.type }))
                }
              >
                <MapLayerItem def={def} />
              </Dropdown.Item>
            )),
        )}

        {candidates.length === 0 && (
          <Dropdown.ItemText>{m?.mapLayers.noMapsFound}</Dropdown.ItemText>
        )}
      </FmDropdownMenu>
    </Dropdown>
  );
}

/** A map's settings, on a page of their own. */
function LayerSettings({
  target,
}: {
  target: SetupTarget;
}): ReactElement | null {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const def = useTargetDef(target);

  const setup = useTargetSetup(target);

  const mapOrigin = useAppSelector(
    (state) => mapByIdSelector(state)[target.type]?.origin,
  );

  const canSave = useCanSaveSettings();

  if (!def) {
    return null;
  }

  const { technology } = def;

  return (
    <div className="pt-1">
      {/* An offline map keeps the kind it was saved with. */}
      {mapOrigin !== 'cached' && canSwitchKind(technology) && (
        <LayerKindSwitch target={target} className="mb-2 d-flex" />
      )}

      <LayerOpacitySlider
        className="mb-2"
        value={resolveLayerOpacity(def, setup?.opacity)}
        onChange={(opacity) =>
          dispatch(mapLayerSetupChange({ ...target, setup: { opacity } }))
        }
      />

      {technology === 'wms' && mapOrigin !== 'cached' && (
        <WmsSection def={def as WmsLayerDef} target={target} />
      )}

      {technology === 'color' && 'color' in def && (
        <ColorSection
          target={target}
          fallback={def.color}
          alpha={def.layer === 'overlay'}
        />
      )}

      {technology === 'parametricShading' && (
        <AsyncComponent factory={shadingSectionFactory} target={target} />
      )}

      {/* The map's own actions, set off from what its sections edit. */}
      <hr />

      {/* Labels give way to icons, least important first, when room runs out. */}
      <FmModalFooter
        as="div"
        className="d-flex flex-nowrap justify-content-end gap-1 text-nowrap"
      >
        {/* As set up here, under a name of its own. */}
        {mapOrigin !== 'cached' &&
          hasOwnConfig(technology) &&
          !window.fmEmbedded && (
            <FmFooterButton
              variant="secondary"
              priority={2}
              icon={<FaSave />}
              label={msm?.saveAsMap}
              disabled={!canSave}
              onClick={() =>
                dispatch(
                  setActiveModal({
                    type: 'installed-maps',
                    customMap: { addNamedFrom: target, returnTo: null },
                  }),
                )
              }
            />
          )}

        {/* Its server, zooms and default kind are the map's own, in its form. */}
        {mapOrigin === 'custom' && !window.fmEmbedded && (
          <FmFooterButton
            variant="secondary"
            priority={1}
            icon={<FaPencilAlt />}
            label={m?.general.modify}
            disabled={!canSave}
            onClick={() =>
              dispatch(
                setActiveModal({
                  type: 'installed-maps',
                  customMap: { edit: target.type, returnTo: null },
                }),
              )
            }
          />
        )}

        <FmFooterButton
          variant="secondary"
          priority={0}
          icon={<FaUndo />}
          label={m?.general.resetToDefaults}
          disabled={isEmptySetup(setup)}
          onClick={() => dispatch(mapLayerSetupReset(target))}
        />
      </FmModalFooter>
    </div>
  );
}

/** The solid colour map's colour; with alpha only as an overlay. */
function ColorSection({
  target,
  fallback,
  alpha,
}: {
  target: SetupTarget;
  fallback: ShadingColor;
  alpha: boolean;
}): ReactElement {
  const color = useTargetSetup(target)?.color;

  const dispatch = useDispatch();

  return (
    <RgbaColorPicker
      alpha={alpha}
      value={colorToHexa(color ?? fallback)}
      onChange={(hexa) =>
        dispatch(
          mapLayerSetupChange({
            ...target,
            setup: { color: hexaToColor(hexa) },
          }),
        )
      }
    />
  );
}
