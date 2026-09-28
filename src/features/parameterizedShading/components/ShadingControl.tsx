import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapSetShading,
  mapSetShadingDraft,
  mapSetShadingOnServer,
  mapSetSharedShadingDraft,
} from '@features/map/model/actions.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import {
  type CustomLayerDef,
  hasSharedShadingLayer,
  integratedLayerDefMap,
  SHADING_SOURCE,
} from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Dropdown,
  Form,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaAngleDown, FaAngleUp, FaCheck, FaUndo } from 'react-icons/fa';
import { GiHills } from 'react-icons/gi';
import { useDispatch } from 'react-redux';
import { colorReliefMaxElevation } from '../model/colorReliefMaxElevation.js';
import { createDefaultShadingComponent } from '../model/createShadingComponent.js';
import {
  effectiveShading,
  hasBackground,
  type Shading,
  type ShadingComponent,
  type ShadingComponentType,
} from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';
import {
  type ParameterizedKind,
  ParameterizedShadingModal,
} from './ParameterizedShadingModal.js';
import { ShadingColorPicker } from './ShadingColorPicker.js';
import {
  MANAGEABLE_TYPES,
  ShadingComponentControl,
} from './ShadingComponentControl.js';
import { ShadingComponentList } from './ShadingComponentList.js';
import { ShadingComponentParams } from './ShadingComponentParams.js';
import classes from './ShadingControl.module.css';
import { ShadingToolbar } from './ShadingToolbar.js';

// Out of the component, where the compiler takes it for a call during render.
const newComponentId = () => Math.random();

/** The shared shading's key in the picker, whose own target is ''. */
const SHARED = '#shared';

const hasWebGpu = 'gpu' in navigator;

export default function ShadingControl() {
  const m = useMessages();

  const sm = useShadingMessages();

  const layers = useAppSelector((state) => state.map.layers);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const sharedShading = useAppSelector((state) => state.map.shading);

  const drafts = useAppSelector((state) => state.map.shadingDrafts);

  const sharedDraft = useAppSelector((state) => state.map.sharedShadingDraft);

  const onServer = useAppSelector((state) => state.map.shadingOnServer);

  const canSaveSettings = useCanSaveSettings();

  // Custom shading maps on the map that have shading of their own; the rest
  // share `map.shading`.
  const ownShadingMaps = customLayers.filter(
    (def): def is CustomLayerDef & { technology: 'parametricShading' } =>
      layers.includes(def.type) &&
      def.technology === 'parametricShading' &&
      Boolean(def.shading),
  );

  const shared = hasSharedShadingLayer(layers, customLayers);

  // '' stands for the shared shading.
  const [pickedTarget, setPickedTarget] = useState('');

  const targets = [
    ...(shared ? [''] : []),
    ...ownShadingMaps.map((def) => def.type),
  ];

  const target = targets.includes(pickedTarget)
    ? pickedTarget
    : (targets[0] ?? '');

  const targetDef = ownShadingMaps.find((def) => def.type === target);

  const draft = targetDef && drafts[targetDef.type];

  const isBase = targetDef?.layer === 'base';

  const shading = targetDef
    ? effectiveShading(targetDef, drafts, sharedShading)
    : (sharedDraft ?? sharedShading);

  // A base map always has one; an overlay's is optional.
  const showsBackground = isBase || hasBackground(shading);

  // Every shading layer draws the terrain of the one built-in source.
  const colorReliefMax = colorReliefMaxElevation([SHADING_SOURCE]);

  const dispatch = useDispatch();

  function setShading(next: Shading) {
    dispatch(
      targetDef
        ? mapSetShadingDraft({ type: targetDef.type, shading: next })
        : onServer
          ? mapSetSharedShadingDraft(next)
          : mapSetShading(next),
    );
  }

  function handleSave() {
    if (!targetDef || !draft) {
      return;
    }

    dispatch(
      saveSettings({
        settings: {
          customLayers: customLayers.map((def) =>
            def.type === targetDef.type ? { ...def, shading: draft } : def,
          ),
        },
        keepOpen: true,
      }),
    );
  }

  const [pickedId, setId] = useState<number>();

  // Only while the shading being edited has it: the target can switch, and a
  // revert can drop it.
  const selectedComponent = shading.components.find(
    (component) => component.id === pickedId,
  );

  const id = selectedComponent?.id;

  const [modalKind, setModalKind] = useState<ParameterizedKind | null>(null);

  const [collapsed, setCollapsed] = usePersistentBoolean(
    'fm.shadingControl.collapsed',
  );

  const sc = useScrollClasses('vertical');

  const [card, setCard] = useState<HTMLDivElement | null>(null);

  const rf = useCallback(() => {
    if (!card) {
      return;
    }

    const { top } = card.getBoundingClientRect();

    window.requestAnimationFrame(() => {
      card.style.maxHeight = `${Math.max(window.innerHeight - top - 57, 100)}px`;
    });
  }, [card]);

  useEffect(() => {
    window.addEventListener('resize', rf);

    return () => {
      window.removeEventListener('resize', rf);
    };
  }, [rf]);

  useEffect(() => {
    sc(card);

    if (!card) {
      return;
    }

    const ro = new ResizeObserver(() => {
      rf();
    });

    ro.observe(card);

    return () => {
      ro.disconnect();
    };
  }, [card, sc, rf]);

  function handleAdd(type0: string | null) {
    trackMatomo(['trackEvent', 'MapShading', 'add', type0 ?? undefined]);

    if (type0 === 'contour' || type0 === 'fog') {
      setModalKind(type0);

      return;
    }

    if (type0 === 'background') {
      setShading({ ...shading, backgroundColor: [255, 255, 255, 1] });

      setId(undefined);

      return;
    }

    const newId = newComponentId();

    setShading(
      produce(shading, (draft) => {
        draft.components.push(
          createDefaultShadingComponent(
            type0 as ShadingComponentType,
            newId,
            colorReliefMax,
          ),
        );
      }),
    );

    setId(newId);
  }

  function handleRemove() {
    const [r, g, b] = shading.backgroundColor;

    // With no component picked it is the background that is selected; a
    // transparent one stands for none.
    setShading(
      id === undefined
        ? { ...shading, backgroundColor: [r, g, b, 0] }
        : produce(shading, (draft) => {
            draft.components = draft.components.filter(
              (component) => component.id !== id,
            );
          }),
    );

    setId(undefined);
  }

  function handleAddParameterized(component: ShadingComponent) {
    setShading(
      produce(shading, (draft) => {
        draft.components.push(component);
      }),
    );

    setId(component.id);

    setModalKind(null);
  }

  // What the panel is, and its collapse toggle; all that shows when collapsed.
  const header = (
    <div className="d-flex align-items-center gap-2">
      <GiHills />

      <span className="flex-grow-1 text-nowrap">
        {m?.mapLayers.letters[SHADING_SOURCE]}
      </span>

      <LongPressTooltip
        label={collapsed ? m?.general.expand : m?.general.collapse}
      >
        {({ props }) => (
          <Button
            variant="dark"
            onClick={() => setCollapsed((collapsed) => !collapsed)}
            {...props}
          >
            {collapsed ? <FaAngleDown /> : <FaAngleUp />}
          </Button>
        )}
      </LongPressTooltip>
    </div>
  );

  const targetDefOf = (t: string) =>
    t === ''
      ? integratedLayerDefMap[SHADING_SOURCE]
      : ownShadingMaps.find((def) => def.type === t);

  /** A target in the open menu, as its layer: icon, name and marks. */
  function targetItem(t: string) {
    const def = targetDefOf(t);

    return def ? <MapLayerItem def={def} /> : null;
  }

  /** A target's bare name, which the closed picker can cut short. */
  function targetName(t: string) {
    const def = targetDefOf(t);

    return def && 'name' in def && def.name
      ? def.name
      : m?.mapLayers.letters[def?.type ?? ''];
  }

  // The shared shading's edits wait for Apply while the server renders them.
  const applies = !targetDef && onServer;

  // Shading whose edits wait for a commit. Its buttons stay, disabled while
  // there is nothing to commit, so editing never shifts the layout.
  const committable = applies || Boolean(targetDef);

  return (
    <>
      <Card body className={`${classes.shadingControl} mt-2 ms-2`}>
        <div className="fm-menu-scroller" ref={setCard}>
          <div />

          <Form
            noValidate
            className="p-2 overflow-hidden"
            onSubmit={(e) => e.preventDefault()}
            style={{ width: 'fit-content' }}
          >
            {header}

            {!collapsed && (
              <>
                {/* As wide as the rest of the panel, never wider. */}
                <ToggleButtonGroup
                  type="radio"
                  name="shading-renderer"
                  className="mt-2 d-flex"
                  style={{ width: 0, minWidth: '100%' }}
                  value={onServer ? 'server' : 'browser'}
                  onChange={(value) =>
                    dispatch(mapSetShadingOnServer(value === 'server'))
                  }
                >
                  <ToggleButton
                    id="shading-renderer-browser"
                    value="browser"
                    variant="outline-primary"
                    className="flex-grow-1 text-nowrap"
                    disabled={!hasWebGpu}
                  >
                    {sm?.inBrowser}
                  </ToggleButton>

                  <ToggleButton
                    id="shading-renderer-server"
                    value="server"
                    variant="outline-primary"
                    className="flex-grow-1 text-nowrap"
                  >
                    {sm?.onServer}
                  </ToggleButton>
                </ToggleButtonGroup>

                {targets.length > 1 && (
                  // As wide as the rest of the panel, never wider; a long
                  // name ends in an ellipsis instead.
                  <Dropdown
                    className="mt-2"
                    style={{ width: 0, minWidth: '100%' }}
                    onSelect={(key) =>
                      key !== null && setPickedTarget(key === SHARED ? '' : key)
                    }
                  >
                    <Dropdown.Toggle as={SelectToggle} className="w-100">
                      <span className="d-block text-truncate">
                        {targetName(target)}
                      </span>
                    </Dropdown.Toggle>

                    {/* As wide as the longest name: the narrow panel would
                        otherwise wrap it. */}
                    <FmDropdownMenu
                      popperConfig={sameMinWidthPopperConfig}
                      style={{ width: 'max-content' }}
                    >
                      {targets.map((t) => (
                        <Dropdown.Item
                          className="text-nowrap"
                          as="button"
                          type="button"
                          key={t || SHARED}
                          eventKey={t || SHARED}
                          active={t === target}
                        >
                          {targetItem(t)}
                        </Dropdown.Item>
                      ))}
                    </FmDropdownMenu>
                  </Dropdown>
                )}

                {committable && (
                  <>
                    {/* As wide as the rest of the panel, never wider: the
                        buttons wrap instead of stretching it. */}
                    <div
                      className="d-flex flex-wrap gap-1 mt-2"
                      style={{ width: 0, minWidth: '100%' }}
                    >
                      {applies && (
                        <>
                          <Button
                            variant="primary"
                            disabled={!sharedDraft}
                            onClick={() =>
                              sharedDraft &&
                              dispatch(mapSetShading(sharedDraft))
                            }
                          >
                            <FaCheck /> {sm?.apply}
                          </Button>

                          <LongPressTooltip label={sm?.revert}>
                            {({ props }) => (
                              <Button
                                variant="secondary"
                                disabled={!sharedDraft}
                                onClick={() =>
                                  dispatch(mapSetSharedShadingDraft(undefined))
                                }
                                {...props}
                              >
                                <FaUndo />
                              </Button>
                            )}
                          </LongPressTooltip>
                        </>
                      )}

                      {targetDef && (
                        <>
                          <Button
                            variant="primary"
                            disabled={!draft || !canSaveSettings}
                            onClick={handleSave}
                          >
                            <FaCheck /> {m?.general.save}
                          </Button>

                          <LongPressTooltip label={sm?.revert}>
                            {({ props }) => (
                              <Button
                                variant="secondary"
                                disabled={!draft}
                                onClick={() =>
                                  dispatch(mapSetShadingDraft({ type: target }))
                                }
                                {...props}
                              >
                                <FaUndo />
                              </Button>
                            )}
                          </LongPressTooltip>
                        </>
                      )}
                    </div>

                    <hr />
                  </>
                )}

                <ShadingToolbar
                  canRemove={id !== undefined || (!isBase && showsBackground)}
                  canAddBackground={!showsBackground}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  onSaveAsMap={
                    window.fmEmbedded || targetDef
                      ? undefined
                      : () =>
                          dispatch(
                            setActiveModal({
                              type: 'custom-maps',
                              // What is being edited, unapplied changes included.
                              addShadingMap: { shading },
                            }),
                          )
                  }
                />

                <ShadingComponentList
                  shading={shading}
                  showBackground={showsBackground}
                  selectedId={id}
                  onSelect={setId}
                />

                <hr />

                {shading.components.some(
                  (component) => MANAGEABLE_TYPES[component.type],
                ) && (
                  <ShadingComponentControl
                    components={shading.components}
                    onChange={(components) =>
                      setShading({ ...shading, components })
                    }
                    selectedId={id}
                    onSelect={setId}
                  />
                )}

                {selectedComponent && (
                  <ShadingComponentParams
                    shading={shading}
                    component={selectedComponent}
                    onChange={setShading}
                  />
                )}

                {(selectedComponent || showsBackground) && (
                  <ShadingColorPicker
                    shading={shading}
                    selectedId={id}
                    component={selectedComponent}
                    colorReliefMax={colorReliefMax}
                    opaqueBackground={isBase}
                    onChange={setShading}
                  />
                )}
              </>
            )}
          </Form>
        </div>
      </Card>

      <ParameterizedShadingModal
        kind={modalKind}
        colorReliefMax={colorReliefMax}
        onClose={() => setModalKind(null)}
        onAdd={handleAddParameterized}
      />
    </>
  );
}
