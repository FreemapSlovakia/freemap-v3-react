import {
  mapLayerSetupChange,
  mapSetShadingDraft,
  mapSetShadingOnServer,
  type SetupTarget,
} from '@features/map/model/actions.js';
import { DEFAULT_SHADING, setupKey } from '@features/map/model/layerSetup.js';
import { useTargetSetup } from '@features/mapSettings/layerTarget.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { SHADING_SOURCE } from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { produce } from 'immer';
import { type ReactElement, useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FaCheck, FaUndo } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { colorReliefMaxElevation } from '../model/colorReliefMaxElevation.js';
import { createDefaultShadingComponent } from '../model/createShadingComponent.js';
import {
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
  /** The shading map whose setup this edits: its own, or a preset's copy. */
  target: SetupTarget;
};

/** The shading editor, for a shading map's setup. */
export default function ShadingSection({ target }: Props): ReactElement {
  const sm = useShadingMessages();

  const applied = useTargetSetup(target)?.shading ?? DEFAULT_SHADING;

  const draft = useAppSelector(
    (state) => state.map.shadingDrafts[setupKey(target)],
  );

  // Unique among the panel's controls.
  const type = setupKey(target);

  const onServer = useAppSelector((state) => state.map.shadingOnServer);

  const shading = draft ?? applied;

  const showsBackground = hasBackground(shading);

  // Every shading map draws the terrain of the one built-in source.
  const colorReliefMax = colorReliefMaxElevation([SHADING_SOURCE]);

  const dispatch = useDispatch();

  const apply = (next: Shading) =>
    dispatch(mapLayerSetupChange({ ...target, setup: { shading: next } }));

  // Rendered on the server, edits wait for Apply; in the browser they show as made.
  function setShading(next: Shading) {
    if (onServer) {
      dispatch(mapSetShadingDraft({ ...target, shading: next }));
    } else {
      apply(next);
    }
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
    apply(next);

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

      {/* Stays, disabled while there is nothing to apply, so editing never
          shifts the layout. */}
      {onServer && (
        <div className={`d-flex flex-wrap gap-1 pt-2 mt-2 ${classes.footer}`}>
          <Button
            variant="primary"
            disabled={!draft}
            onClick={() => draft && apply(draft)}
          >
            <FaCheck /> {sm?.apply}
          </Button>

          <LongPressTooltip label={sm?.revert}>
            {({ props }) => (
              <Button
                variant="secondary"
                disabled={!draft}
                onClick={() => dispatch(mapSetShadingDraft(target))}
                {...props}
              >
                <FaUndo />
              </Button>
            )}
          </LongPressTooltip>
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
