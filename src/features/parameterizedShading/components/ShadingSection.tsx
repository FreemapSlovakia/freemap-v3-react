import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapCustomLayerSave,
  mapSetShading,
  mapSetShadingDraft,
  mapSetShadingOnServer,
  mapSetSharedShadingDraft,
} from '@features/map/model/actions.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { type CustomLayerDef, SHADING_SOURCE } from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { produce } from 'immer';
import { type ReactElement, useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FaCheck, FaUndo } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { colorReliefMaxElevation } from '../model/colorReliefMaxElevation.js';
import { createDefaultShadingComponent } from '../model/createShadingComponent.js';
import {
  effectiveShading,
  hasBackground,
  type Shading,
  type ShadingComponent,
  type ShadingComponentType,
  serializeShading,
} from '../model/Shading.js';
import {
  SHADING_PRESETS,
  type ShadingPreset,
  shadingPreset,
} from '../model/shadingPresets.js';
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

const hasWebGpu = 'gpu' in navigator;

type Props = {
  /** A shading layer on the map: a custom map with shading of its own, else the shared shading's. */
  type: string;
};

/** The shading editor, for one shading layer on the map. */
export default function ShadingSection({ type }: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  const sharedShading = useAppSelector((state) => state.map.shading);

  const drafts = useAppSelector((state) => state.map.shadingDrafts);

  const sharedDraft = useAppSelector((state) => state.map.sharedShadingDraft);

  const onServer = useAppSelector((state) => state.map.shadingOnServer);

  const canSaveSettings = useCanSaveSettings();

  // A custom map with shading of its own; any other shading layer shares
  // `map.shading`.
  const targetDef = useAppSelector((state) =>
    state.map.customLayers.find(
      (def): def is CustomLayerDef & { technology: 'parametricShading' } =>
        def.type === type &&
        def.technology === 'parametricShading' &&
        Boolean(def.shading),
    ),
  );

  const draft = targetDef && drafts[targetDef.type];

  const shading = targetDef
    ? effectiveShading(targetDef, drafts, sharedShading)
    : (sharedDraft ?? sharedShading);

  const showsBackground = hasBackground(shading);

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

    dispatch(mapCustomLayerSave({ def: { ...targetDef, shading: draft } }));
  }

  const [pickedId, setId] = useState<number>();

  // Only while the shading being edited has it: a revert can drop it.
  const selectedComponent = shading.components.find(
    (component) => component.id === pickedId,
  );

  const id = selectedComponent?.id;

  const [modalKind, setModalKind] = useState<ParameterizedKind | null>(null);

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

  const confirm = useConfirm();

  async function handlePreset(preset: ShadingPreset) {
    trackMatomo(['trackEvent', 'MapShading', 'preset', preset]);

    // Ids are not serialized.
    const current = serializeShading(shading);

    // Only a hand-made shading is worth asking about; a preset is one click back.
    const isPreset = SHADING_PRESETS.some(
      (p) => serializeShading(shadingPreset(p, () => 0)) === current,
    );

    if (
      shading.components.length > 0 &&
      !isPreset &&
      !(await confirm({
        title: sm?.presetReplaceTitle,
        message: sm?.presetReplaceConfirm,
      }))
    ) {
      return;
    }

    const next = shadingPreset(preset, newComponentId);

    // Applied at once, even where edits otherwise wait for Apply.
    if (targetDef) {
      setShading(next);
    } else {
      dispatch(mapSetShading(next));
    }

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

  // The shared shading's edits wait for Apply while the server renders them.
  const applies = !targetDef && onServer;

  // Shading whose edits wait for a commit. Its buttons stay, disabled while
  // there is nothing to commit, so editing never shifts the layout.
  const committable = applies || Boolean(targetDef);

  const canSaveAsMap = !window.fmEmbedded && !targetDef;

  const saveAsMap = () =>
    dispatch(
      setActiveModal({
        type: 'installed-maps',
        // What is being edited, unapplied changes included.
        customMap: { addShadingMap: { shading } },
      }),
    );

  return (
    <>
      <ToggleButtonGroup
        type="radio"
        name={`shading-renderer-${type}`}
        className="d-flex"
        value={onServer ? 'server' : 'browser'}
        onChange={(value) =>
          dispatch(mapSetShadingOnServer(value === 'server'))
        }
      >
        <ToggleButton
          id={`shading-renderer-server-${type}`}
          value="server"
          variant="outline-primary"
          className="flex-grow-1 text-nowrap"
        >
          {sm?.onServer}
        </ToggleButton>

        <ToggleButton
          id={`shading-renderer-browser-${type}`}
          value="browser"
          variant="outline-primary"
          className="flex-grow-1 text-nowrap"
          disabled={!hasWebGpu}
        >
          {sm?.inBrowser} <ExperimentalFunction />
        </ToggleButton>
      </ToggleButtonGroup>

      <hr />

      <ShadingComponentList
        shading={shading}
        showBackground={showsBackground}
        selectedId={id}
        onSelect={setId}
      />

      <ShadingToolbar
        canRemove={id !== undefined || showsBackground}
        canAddBackground={!showsBackground}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onPreset={handlePreset}
      />

      <hr />

      {shading.components.some(
        (component) => MANAGEABLE_TYPES[component.type],
      ) && (
        <ShadingComponentControl
          components={shading.components}
          background={showsBackground ? shading.backgroundColor : undefined}
          onChange={(components) => setShading({ ...shading, components })}
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
          onChange={setShading}
        />
      )}

      {(committable || canSaveAsMap) && (
        <div className={`d-flex flex-wrap gap-1 pt-2 mt-2 ${classes.footer}`}>
          {applies && (
            <>
              <Button
                variant="primary"
                disabled={!sharedDraft}
                onClick={() =>
                  sharedDraft && dispatch(mapSetShading(sharedDraft))
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
                    onClick={() => dispatch(mapSetShadingDraft({ type }))}
                    {...props}
                  >
                    <FaUndo />
                  </Button>
                )}
              </LongPressTooltip>
            </>
          )}

          {/* Named in full when it is the only button. */}
          {canSaveAsMap &&
            (committable ? (
              <LongPressTooltip label={m?.mapLayers.saveAsShadingMap}>
                {({ props }) => (
                  <Button
                    variant="secondary"
                    className="ms-auto"
                    onClick={saveAsMap}
                    {...props}
                  >
                    <MdDashboardCustomize />
                  </Button>
                )}
              </LongPressTooltip>
            ) : (
              <Button variant="secondary" onClick={saveAsMap}>
                <MdDashboardCustomize /> {m?.mapLayers.saveAsShadingMap}
              </Button>
            ))}
        </div>
      )}

      <ParameterizedShadingModal
        kind={modalKind}
        colorReliefMax={colorReliefMax}
        onClose={() => setModalKind(null)}
        onAdd={handleAddParameterized}
      />
    </>
  );
}
