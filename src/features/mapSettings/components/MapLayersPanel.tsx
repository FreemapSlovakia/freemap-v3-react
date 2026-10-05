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
  type SetupTarget,
} from '@features/map/model/actions.js';
import { canSwitchKind } from '@features/map/model/layerKind.js';
import { isEmptySetup, setupKey } from '@features/map/model/layerSetup.js';
import {
  isLinkPreset,
  isPresettable,
  memberKind,
  presetIdOf,
  presetItem,
} from '@features/map/model/mapPreset.js';
import { layerKindsSelector } from '@features/map/model/selectors.js';
import {
  installedLibraryIndexSelector,
  mapByIdSelector,
  nativeKindsSelector,
  overlayStackSelector,
  presetByIdSelector,
  presetKindsSelector,
  resolvedCustomLayersSelector,
  type WmsLayerDef,
} from '@features/mapLibrary/model/selectors.js';
import {
  colorToHexa,
  hexaToColor,
  type Color as ShadingColor,
} from '@features/parameterizedShading/model/Shading.js';
import { CustomMapGlyph } from '@shared/components/CustomMapGlyph.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  LayerKindMark,
  MapLayerItem,
} from '@shared/components/MapLayerItem.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { useFillToBottom } from '@shared/hooks/useFillToBottom.js';
import { resolveLayerOpacity } from '@shared/mapDefinitions.js';
import clsx from 'clsx';
import {
  type CSSProperties,
  Fragment,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';
import {
  FaAngleRight,
  FaArrowLeft,
  FaCopy,
  FaLayerGroup,
  FaPencilAlt,
  FaPlus,
  FaTimes,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import { MdDashboardCustomize, MdDragIndicator } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useTargetDef, useTargetSetup } from '../layerTarget.js';
import { type PanelPlace, useMapLayersPanel } from '../mapLayersPanelStore.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { LayerKindSwitch } from './LayerKindSwitch.js';
import { LayerOpacitySlider } from './LayerOpacitySlider.js';
import classes from './MapLayersPanel.module.css';
import { OpacityButton } from './OpacityButton.js';
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

  // Where the panel was left, if that is still on the map; else the stack.
  const at: PanelPlace =
    place.type === undefined
      ? preset
        ? place
        : {}
      : place.preset === undefined
        ? layers.includes(place.type)
          ? place
          : {}
        : preset?.layers.some((layer) => layer.type === place.type)
          ? place
          : {};

  const target = at.type === undefined ? undefined : { ...at, type: at.type };

  const up: PanelPlace = at.type === undefined ? {} : { preset: at.preset };

  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  useFillToBottom(panel, classes.list);

  const top = at.type === undefined && at.preset === undefined;

  return (
    <Card body className={clsx(classes.panel, 'fm-frosted', 'mt-2 ms-2')}>
      <div ref={setPanel} className="d-flex flex-column">
        <div className="d-flex align-items-center gap-2 p-1 ps-2">
          {top ? (
            <FaLayerGroup className="flex-shrink-0" />
          ) : (
            <LongPressTooltip label={m?.general.back}>
              {({ props }) => (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setPlace(up)}
                  {...props}
                >
                  <FaArrowLeft />
                </Button>
              )}
            </LongPressTooltip>
          )}

          <span className="flex-grow-1 min-w-0 d-flex">
            {target ? (
              <TargetName target={target} />
            ) : at.preset !== undefined && preset ? (
              <PresetName id={at.preset} />
            ) : (
              <span className="text-truncate">{m?.mapLayers.layersPanel}</span>
            )}
          </span>

          <LongPressTooltip label={m?.general.close}>
            {({ props }) => (
              <Button
                variant="dark"
                className="flex-shrink-0"
                onClick={() => setOpen(false)}
                {...props}
              >
                <FaTimes />
              </Button>
            )}
          </LongPressTooltip>
        </div>

        <div className={clsx(classes.list, 'px-2 pb-2')}>
          {target ? (
            <LayerSettings key={setupKey(target)} target={target} />
          ) : at.preset !== undefined ? (
            <PresetLayers id={at.preset} onOpen={setPlace} />
          ) : (
            <Stack onOpen={setPlace} />
          )}
        </div>
      </div>
    </Card>
  );
}

/** A preset's name with its marks, laid out as `MapLayerItem` lays out a map's. */
function PresetName({ id }: { id: string }): ReactElement | null {
  const preset = useAppSelector((state) => presetByIdSelector(state)[id]);

  const kind = useAppSelector((state) => presetKindsSelector(state)[id]);

  if (!preset) {
    return null;
  }

  return (
    <span className="d-inline-flex align-items-center gap-1 mw-100">
      {kind && <LayerKindMark kind={kind} />}

      <span className="d-inline-flex flex-shrink-0">
        <CustomMapGlyph spec={preset.iconSpec} kind="preset" />
      </span>

      {/* The full name of one cut short. */}
      <LongPressTooltip label={preset.name}>
        {({ props }) => (
          <span className="text-truncate" {...props}>
            {preset.name}
          </span>
        )}
      </LongPressTooltip>
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
 * `bottom` stays under them.
 */
function SortableRows({
  items,
  movable,
  bottom,
  onMove,
  render,
}: {
  items: string[];
  movable: ReadonlySet<string>;
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
    <>
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
          <div ref={ref} className={classes.overlays}>
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
    </>
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

/** One row: what it is, its opacity, taking it off, and opening it. */
function Row({
  drag,
  label,
  onOpen,
  opacity,
  onOpacity,
  onRemove,
}: {
  drag?: Drag;
  label: ReactNode;
  onOpen?: () => void;
  opacity?: number;
  onOpacity?: (opacity: number) => void;
  onRemove?: () => void;
}): ReactElement {
  const m = useMessages();

  return (
    <div ref={drag?.setNodeRef} style={drag?.style} className={classes.row}>
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
          <span className={classes.handleSpace} />
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
                className="flex-shrink-0 text-body"
                onClick={onRemove}
                {...props}
              >
                <FaTrash />
              </Button>
            )}
          </LongPressTooltip>
        )}

        <button
          type="button"
          className={clsx(classes.rowToggle, classes.chevron, 'flex-shrink-0')}
          disabled={!onOpen}
          onClick={onOpen}
        >
          {onOpen && <FaAngleRight />}
        </button>
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
  const dispatch = useDispatch();

  const def = useTargetDef(target);

  const setup = useTargetSetup(target);

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

  return (
    <Row
      drag={drag}
      label={<MapLayerItem def={def} truncate />}
      onOpen={() => onOpen(target)}
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

  if (!preset) {
    return null;
  }

  return (
    <Row
      drag={drag}
      label={<PresetName id={id} />}
      onOpen={() => onOpen({ preset: id })}
      opacity={preset.opacity ?? 1}
      onOpacity={(opacity) =>
        dispatch(mapPresetChange({ id, change: { opacity } }))
      }
      onRemove={() => dispatch(mapLayerRemove({ item: presetItem(id) }))}
    />
  );
}

/** The stack: the overlays and overlay presets as they stack, then the base. */
function Stack({
  onOpen,
}: {
  onOpen: (place: PanelPlace) => void;
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

  const isMap = (item: string) =>
    presetIdOf(item) !== undefined || isPresettable(item);

  const maps = layers.filter(isMap);

  // Two maps or presets, or one map set up its own way, and no data layer on,
  // which a preset can't hold. `i` only hides the tools' features.
  const makesNew =
    (maps.length > 1 ||
      (maps.length === 1 &&
        presetIdOf(maps[0]!) === undefined &&
        !isEmptySetup(layerSetups[maps[0]!]))) &&
    layers.every((item) => item === 'i' || isMap(item));

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
        bottom={base && render(base)}
        onMove={(type, to) => dispatch(mapOverlayMove({ type, to }))}
        render={render}
      />

      {/* Only where it combines something: one map alone already keeps its
          setup, and a lone preset would come out a copy, which Duplicate is for. */}
      {!window.fmEmbedded && makesNew && (
        <div className="d-flex mt-2">
          <LongPressTooltip label={msm?.saveLayersAsPresetHint}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                className="ms-auto text-truncate"
                disabled={!canSave}
                onClick={() =>
                  dispatch(
                    setActiveModal({
                      type: 'installed-maps',
                      customMap: { addPreset: true, returnTo: null },
                    }),
                  )
                }
                {...props}
              >
                <MdDashboardCustomize /> {msm?.saveLayersAsPreset}
              </Button>
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
            size="sm"
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
        size="sm"
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

      <div className="d-flex gap-2 mt-2 justify-content-end flex-wrap">
        {/* Its server, zooms and default kind are the map's own, in its form. */}
        {mapOrigin === 'custom' && !window.fmEmbedded && (
          <Button
            variant="secondary"
            size="sm"
            disabled={!canSave}
            onClick={() =>
              dispatch(
                setActiveModal({
                  type: 'installed-maps',
                  customMap: { edit: target.type, returnTo: null },
                }),
              )
            }
          >
            <FaPencilAlt /> {m?.general.modify}
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={isEmptySetup(setup)}
          onClick={() => dispatch(mapLayerSetupReset(target))}
        >
          <FaUndo /> {m?.general.resetToDefaults}
        </Button>
      </div>
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
