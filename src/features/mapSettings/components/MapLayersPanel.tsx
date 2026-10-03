import { AsyncComponent } from '@app/components/AsyncComponent.js';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapOverlayOrderSet,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import { canSwitchKind } from '@features/map/model/layerKind.js';
import {
  integratedLayerDefMapSelector,
  overlayStackSelector,
  resolvedCustomLayersSelector,
  type WmsLayerDef,
} from '@features/mapLibrary/model/selectors.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { useFillToBottom } from '@shared/hooks/useFillToBottom.js';
import type { LayerDef } from '@shared/mapDefinitions.js';
import clsx from 'clsx';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  useRef,
  useState,
} from 'react';
import { Button, Card } from 'react-bootstrap';
import {
  FaAngleDown,
  FaAngleRight,
  FaEyeSlash,
  FaLayerGroup,
  FaTimes,
} from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMapLayersPanel } from '../mapLayersPanelStore.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { LayerKindSwitch } from './LayerKindSwitch.js';
import { LayerOpacitySlider } from './LayerOpacitySlider.js';
import classes from './MapLayersPanel.module.css';
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

// The row under the pointer, which holds the dragged row by its handle at the
// top: an expanded row's centre would never come near the rows above it.
const underPointer: CollisionDetection = (args) => {
  const hits = pointerWithin(args);

  return hits.length ? hits : closestCenter(args);
};

type Row = {
  def: LayerDef | { type: string; layer: 'base' | 'overlay'; name?: string };
  /** A library map, whose kind may be switched. */
  library: boolean;
};

/**
 * What is on the map, top first — the overlays as they stack, then the base
 * map — each row opening to its own settings.
 */
export default function MapLayersPanel(): ReactElement {
  const m = useMessages();

  const { setOpen, expanded, setExpanded } = useMapLayersPanel();

  const layers = useAppSelector((state) => state.map.layers);

  const libraryDefs = useAppSelector(integratedLayerDefMapSelector);

  const customLayers = useAppSelector(resolvedCustomLayersSelector);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const { stack, movable } = useAppSelector(overlayStackSelector);

  const canSave = useCanSaveSettings();

  const dispatch = useDispatch();

  const rowOf = (type: string): Row | undefined => {
    const def =
      libraryDefs[type] ??
      customLayers.find((def) => def.type === type) ??
      cachedMaps.find((def) => def.type === type);

    return def && { def, library: type in libraryDefs };
  };

  const overlays = stack
    .filter((type) => layers.includes(type))
    .flatMap((type) => rowOf(type) ?? []);

  const base = layers
    .flatMap((type) => rowOf(type) ?? [])
    .find((row) => row.def.layer === 'base');

  const overlaysRef = useRef<HTMLDivElement>(null);

  // Up and down among the overlays only: the base map stays under them.
  const withinOverlays: Modifier = ({ transform, draggingNodeRect }) => {
    const box = overlaysRef.current?.getBoundingClientRect();

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

  const sortableTypes = overlays
    .map((row) => row.def.type)
    .filter((type) => canSave && movable.has(type));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Among every overlay that may move, as Installed maps orders them: those
  // not on the map keep their places.
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const order = stack.filter((type) => movable.has(type));

    dispatch(
      mapOverlayOrderSet(
        arrayMove(
          order,
          order.indexOf(String(active.id)),
          order.indexOf(String(over.id)),
        ),
      ),
    );
  };

  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  useFillToBottom(panel, classes.list);

  return (
    <Card body className={clsx(classes.panel, 'fm-frosted', 'mt-2 ms-2')}>
      <div ref={setPanel} className="d-flex flex-column">
        <div className="d-flex align-items-center gap-2 p-1 ps-2">
          <FaLayerGroup className="flex-shrink-0" />

          <span className="flex-grow-1 text-truncate">
            {m?.mapLayers.layersPanel}
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
          <DndContext
            sensors={sensors}
            collisionDetection={underPointer}
            onDragEnd={handleDragEnd}
            accessibility={NO_SCREEN_READER_TEXT}
            modifiers={[withinOverlays]}
          >
            <SortableContext
              items={sortableTypes}
              strategy={verticalListSortingStrategy}
            >
              <div ref={overlaysRef} className={classes.overlays}>
                {overlays.map((row) =>
                  sortableTypes.includes(row.def.type) ? (
                    <SortableLayerRow
                      key={row.def.type}
                      row={row}
                      open={expanded === row.def.type}
                      onToggle={setExpanded}
                    />
                  ) : (
                    <LayerRow
                      key={row.def.type}
                      row={row}
                      open={expanded === row.def.type}
                      onToggle={setExpanded}
                    />
                  ),
                )}
              </div>
            </SortableContext>
          </DndContext>

          {base && (
            <LayerRow
              row={base}
              open={expanded === base.def.type}
              onToggle={setExpanded}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

type RowProps = {
  row: Row;
  open: boolean;
  onToggle: (type: string | null) => void;
  drag?: {
    setNodeRef: (el: HTMLElement | null) => void;
    style: CSSProperties;
    handle: HTMLAttributes<HTMLElement>;
  };
};

function SortableLayerRow(props: Omit<RowProps, 'drag'>): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.row.def.type });

  return (
    <LayerRow
      {...props}
      drag={{
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
      }}
    />
  );
}

function LayerRow({ row, open, onToggle, drag }: RowProps): ReactElement {
  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const { def, library } = row;

  const technology = 'technology' in def ? def.technology : undefined;

  const switchable = library && canSwitchKind(technology);

  // Opacity for an overlay; what else depends on the kind of map.
  const hasSettings =
    def.layer === 'overlay' ||
    switchable ||
    technology === 'wms' ||
    technology === 'parametricShading';

  return (
    <div
      ref={drag?.setNodeRef}
      style={drag?.style}
      className={clsx(classes.row, open && classes.open)}
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
          <span className={classes.handleSpace} />
        )}

        <button
          type="button"
          className={clsx(
            classes.rowToggle,
            'flex-grow-1 d-flex align-items-center gap-1 text-start',
          )}
          disabled={!hasSettings}
          onClick={() => onToggle(open ? null : def.type)}
        >
          <span className="flex-grow-1 text-truncate">
            <MapLayerItem def={def} />
          </span>
        </button>

        {/* A base map is replaced by picking another, not turned off. */}
        {def.layer === 'overlay' && (
          <LongPressTooltip label={msm?.turnOff}>
            {({ props }) => (
              <Button
                variant="link"
                size="sm"
                className="flex-shrink-0 text-body"
                onClick={() =>
                  dispatch(mapToggleLayer({ type: def.type, enable: false }))
                }
                {...props}
              >
                <FaEyeSlash />
              </Button>
            )}
          </LongPressTooltip>
        )}

        <button
          type="button"
          className={clsx(classes.rowToggle, classes.chevron, 'flex-shrink-0')}
          disabled={!hasSettings}
          onClick={() => onToggle(open ? null : def.type)}
        >
          {hasSettings && (open ? <FaAngleDown /> : <FaAngleRight />)}
        </button>
      </div>

      {open && hasSettings && (
        <div className="pb-2 pt-1">
          {switchable && (
            <LayerKindSwitch type={def.type} className="mb-2 d-flex" />
          )}

          <LayerOpacitySlider type={def.type} className="mb-2" />

          {technology === 'wms' && <WmsSection def={def as WmsLayerDef} />}

          {technology === 'parametricShading' && (
            <AsyncComponent factory={shadingSectionFactory} type={def.type} />
          )}
        </div>
      )}
    </div>
  );
}
