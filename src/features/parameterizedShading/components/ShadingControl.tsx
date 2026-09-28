import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapSetShading,
  mapSetShadingDraft,
} from '@features/map/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import {
  type CustomLayerDef,
  hasSharedShadingLayer,
  integratedLayerDefMap,
  shadingSourceOf,
} from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { FaCheck, FaUndo } from 'react-icons/fa';
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

export default function ShadingControl() {
  const m = useMessages();

  const sm = useShadingMessages();

  const layers = useAppSelector((state) => state.map.layers);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const sharedShading = useAppSelector((state) => state.map.shading);

  const drafts = useAppSelector((state) => state.map.shadingDrafts);

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

  // The built-in layers the shared shading is drawn on, custom maps' sources included.
  const sharedSources = layers
    .filter((type) => !ownShadingMaps.some((def) => def.type === type))
    .map((type) => shadingSourceOf(type, customLayers));

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

  // The built-in shading layers are all overlays.
  const isBase = targetDef?.layer === 'base';

  const shading = targetDef
    ? effectiveShading(targetDef, drafts, sharedShading)
    : sharedShading;

  // A base map always has one; an overlay's is optional.
  const showsBackground = isBase || hasBackground(shading);

  const colorReliefMax = colorReliefMaxElevation(
    targetDef ? [shadingSourceOf(targetDef.type, customLayers)] : sharedSources,
  );

  const dispatch = useDispatch();

  function setShading(next: Shading) {
    dispatch(
      targetDef
        ? mapSetShadingDraft({ type: targetDef.type, shading: next })
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

  // The built-in layer the shared shading is shown on, for a map saved from it.
  const sharedSource =
    sharedSources.find(
      (type) => integratedLayerDefMap[type]?.technology === 'parametricShading',
    ) ?? 'h';

  const [pickedId, setId] = useState<number>();

  // Only while the shading being edited has it: the target can switch, and a
  // revert can drop it.
  const selectedComponent = shading.components.find(
    (component) => component.id === pickedId,
  );

  const id = selectedComponent?.id;

  const [modalKind, setModalKind] = useState<ParameterizedKind | null>(null);

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
            {targets.length > 1 && (
              <Form.Select
                className="mb-2"
                size="sm"
                value={target}
                onChange={(e) => setPickedTarget(e.currentTarget.value)}
              >
                {shared && <option value="">{sm?.sharedShading}</option>}

                {ownShadingMaps.map((def) => (
                  <option key={def.type} value={def.type}>
                    {def.name ?? def.type}
                  </option>
                ))}
              </Form.Select>
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
                          addShadingMap: {
                            source: sharedSource,
                            shading: sharedShading,
                          },
                        }),
                      )
              }
            />

            {draft && (
              <div className="d-flex gap-1 mt-2">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!canSaveSettings}
                  onClick={handleSave}
                >
                  <FaCheck /> {m?.general.save}
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => dispatch(mapSetShadingDraft({ type: target }))}
                >
                  <FaUndo /> {sm?.revert}
                </Button>
              </div>
            )}

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
