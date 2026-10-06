import { setActiveModal } from '@app/store/actions.js';
import type { CustomMapRequest } from '@app/store/activeModal.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapCustomLayerSave,
  mapNamedMapCreate,
  mapPresetSave,
} from '@features/map/model/actions.js';
import type { MapPreset } from '@features/map/model/mapPreset.js';
import {
  capturePreset,
  presetByIdSelector,
} from '@features/map/model/selectors.js';
import {
  mapByIdSelector,
  mapEntryOf,
} from '@features/mapLibrary/model/selectors.js';
import {
  CUSTOM_MAP_ICONS,
  type CustomMapKind,
} from '@shared/components/CustomMapGlyph.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import {
  type CustomLayerDef,
  isNamedMapDef,
  type NamedMapDef,
} from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { CustomMapForm } from './CustomMapForm.js';
import {
  type LayerVisibility,
  LayerVisibilityFields,
} from './LayerVisibilityFields.js';
import { PresetForm } from './PresetForm.js';

type Props = { request: CustomMapRequest };

type View =
  | { mode: 'add'; draftType: string }
  | { mode: 'edit'; type: string }
  | { mode: 'preset' }
  | { mode: 'named' };

type NamedDraft = NamedMapDef & { name: string };

function makeType() {
  return Math.random().toString(36).slice(-6);
}

/** The form for a custom map or a preset, in the library's modal. */
export function CustomMapEditor({ request }: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  // Both are nothing but entries in the account's settings, so offline a
  // signed-in user can neither add, change nor remove one.
  const canSaveSettings = useCanSaveSettings();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const presets = useAppSelector((state) => state.map.presets);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  // The form the request names: a map or preset to edit, a new preset of what
  // is on the map, or a new custom map. One gone by now opens as a new one
  // rather than as an empty edit that would save under its id.
  const startFor = (
    request: CustomMapRequest,
  ): {
    view: View;
    presetDraft?: MapPreset;
    namedDraft?: NamedDraft;
    visibility: LayerVisibility;
  } => {
    const visibilityOf = (type: string): LayerVisibility => {
      const settings = layersSettings[type];

      return {
        showInMenu: settings?.showInMenu ?? true,
        showInToolbar: settings?.showInToolbar ?? false,
        // Unset, the map's own shortcut holds, as the keyboard has it.
        shortcut:
          settings?.shortcut === undefined
            ? (customLayers.find((def) => def.type === type)?.shortcut ?? null)
            : settings.shortcut,
      };
    };

    const newVisibility = {
      showInMenu: true,
      showInToolbar: false,
      shortcut: null,
    };

    const preset = presets.find((p) => p.id === request.edit);

    if (preset) {
      return {
        view: { mode: 'preset' },
        presetDraft: preset,
        visibility: visibilityOf(preset.id),
      };
    }

    // A copy of a preset (a link's, or a duplicate) is kept as it is; one made
    // of the map takes all of it.
    const source =
      request.addPresetFrom === undefined
        ? undefined
        : presetByIdSelector(store.getState())[request.addPresetFrom];

    if (source || request.addPreset) {
      return {
        view: { mode: 'preset' },
        presetDraft: source
          ? { ...source, id: makeType() }
          : {
              id: makeType(),
              name: '',
              layers: capturePreset(store.getState()),
            },
        visibility: newVisibility,
      };
    }

    // The kind is the drawing's, which the save takes.
    if (request.addNamedFrom) {
      return {
        view: { mode: 'named' },
        namedDraft: {
          type: makeType(),
          name: '',
          layer: 'overlay',
          source: request.addNamedFrom.type,
        },
        visibility: newVisibility,
      };
    }

    const custom = customLayers.find((def) => def.type === request.edit);

    if (custom && isNamedMapDef(custom)) {
      return {
        view: { mode: 'named' },
        namedDraft: { ...custom, name: custom.name ?? '' },
        visibility: visibilityOf(custom.type),
      };
    }

    if (request.edit !== undefined && custom) {
      return {
        view: { mode: 'edit', type: request.edit },
        visibility: visibilityOf(request.edit),
      };
    }

    return {
      view: { mode: 'add', draftType: makeType() },
      visibility: newVisibility,
    };
  };

  const [initial] = useState(() => startFor(request));

  const [view, setView] = useState<View>(initial.view);

  const [draft, setDraft] = useState<CustomLayerDef | undefined>(undefined);

  const [presetDraft, setPresetDraft] = useState(initial.presetDraft);

  const [namedDraft, setNamedDraft] = useState(initial.namedDraft);

  const namedSourceRef = useAppSelector((state) =>
    namedDraft ? mapByIdSelector(state)[namedDraft.source] : undefined,
  );

  const [visibility, setVisibility] = useState(initial.visibility);

  // Only a new request starts the form over; the fields are the user's after.
  const [shownRequest, setShownRequest] = useState(request);

  // Remounts the map form even when the new request names the same map.
  const [generation, setGeneration] = useState(0);

  if (shownRequest !== request) {
    const start = startFor(request);

    setShownRequest(request);

    setGeneration(generation + 1);

    setDraft(undefined);

    setView(start.view);

    setPresetDraft(start.presetDraft);

    setNamedDraft(start.namedDraft);

    setVisibility(start.visibility);
  }

  const fromMap = Boolean(
    request.addPreset || request.addPresetFrom || request.addNamedFrom,
  );

  // A save shows its map in Installed maps (the panel's new preset goes back to
  // the map); Cancel goes back where the form was opened from.
  const done = (saved?: string) => {
    const back = saved === undefined ? request.returnTo : undefined;

    dispatch(
      setActiveModal(
        fromMap || back === null
          ? null
          : back === 'available-maps'
            ? { type: 'available-maps' }
            : { type: 'installed-maps', highlight: saved },
      ),
    );
  };

  const handleSave = () => {
    if (!draft) {
      return;
    }

    const isEdit = customLayers.some((d) => d.type === draft.type);

    trackMatomo([
      'trackEvent',
      'MapSettings',
      isEdit ? 'update' : 'create',
      'customMap',
    ]);

    dispatch(
      mapCustomLayerSave({
        def: draft,
        settings: visibility,
        offerActivate: true,
      }),
    );

    done(draft.type);
  };

  const canSavePreset = Boolean(presetDraft?.name.trim());

  const handleSavePreset = () => {
    if (!presetDraft || !canSavePreset) {
      return;
    }

    // Its layers as they are now: they may have been edited on the map meanwhile.
    const existing = store
      .getState()
      .map.presets.find((p) => p.id === presetDraft.id);

    const preset = {
      ...(existing ?? presetDraft),
      name: presetDraft.name.trim(),
      iconSpec: presetDraft.iconSpec,
    };

    trackMatomo([
      'trackEvent',
      'MapSettings',
      existing ? 'update' : 'create',
      'preset',
    ]);

    dispatch(
      mapPresetSave({
        preset,
        settings: visibility,
        onMap: request.addPreset,
        replacing: request.addPresetFrom,
      }),
    );

    done(preset.id);
  };

  const canSaveNamed = Boolean(namedDraft?.name.trim());

  const handleSaveNamed = () => {
    if (!namedDraft || !canSaveNamed) {
      return;
    }

    const def = { ...namedDraft, name: namedDraft.name.trim() };

    trackMatomo([
      'trackEvent',
      'MapSettings',
      request.addNamedFrom ? 'create' : 'update',
      'namedMap',
    ]);

    dispatch(
      request.addNamedFrom
        ? mapNamedMapCreate({
            def,
            settings: visibility,
            from: request.addNamedFrom,
          })
        : mapCustomLayerSave({ def, settings: visibility }),
    );

    done(def.type);
  };

  const edited =
    view.mode === 'edit'
      ? customLayers.find((d) => d.type === view.type)
      : undefined;

  const editingValue = edited && !isNamedMapDef(edited) ? edited : undefined;

  const draftType =
    view.mode === 'add'
      ? view.draftType
      : view.mode === 'edit'
        ? view.type
        : '';

  const visibilityFields = (
    <div className="mt-3">
      <LayerVisibilityFields
        disabled={!canSaveSettings}
        value={visibility}
        onChange={setVisibility}
      />
    </div>
  );

  const formFooter = (onSave: () => void, canSave: boolean) => (
    <FmModalFooter>
      <FmFooterButton
        variant="primary"
        onClick={onSave}
        disabled={!canSave || !canSaveSettings}
        icon={<FaCheck />}
        label={m?.general.save}
      />

      <OfflineBadge offline={!canSaveSettings} />

      <FmDismissButton label={m?.general.cancel} onClick={() => done()} />
    </FmModalFooter>
  );

  // Library, catalog or custom; a named map's own resolves to its source's.
  const namedTechnology = mapEntryOf(namedSourceRef)?.technology as
    | CustomMapKind
    | undefined;

  return view.mode === 'named' ? (
    <>
      <Modal.Body>
        {namedDraft && (
          <PresetForm
            value={namedDraft}
            onChange={setNamedDraft}
            hint={msm?.namedMapHint}
            placeholder={namedTechnology && CUSTOM_MAP_ICONS[namedTechnology]}
          />
        )}

        {visibilityFields}
      </Modal.Body>

      {formFooter(handleSaveNamed, canSaveNamed)}
    </>
  ) : view.mode === 'preset' ? (
    <>
      <Modal.Body>
        {presetDraft && (
          <PresetForm value={presetDraft} onChange={setPresetDraft} />
        )}

        {visibilityFields}
      </Modal.Body>

      {formFooter(handleSavePreset, canSavePreset)}
    </>
  ) : (
    <>
      <Modal.Body>
        <CustomMapForm
          key={`${draftType}:${generation}`}
          type={draftType}
          value={editingValue}
          onChange={setDraft}
        />

        {visibilityFields}
      </Modal.Body>

      {formFooter(handleSave, Boolean(draft))}
    </>
  );
}
