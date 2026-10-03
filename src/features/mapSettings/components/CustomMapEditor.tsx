import { setActiveModal } from '@app/store/actions.js';
import type { CustomMapRequest } from '@app/store/activeModal.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapCombinationSave,
  mapCustomLayerSave,
} from '@features/map/model/actions.js';
import {
  isWorthSaving,
  type MapCombination,
} from '@features/map/model/mapCombination.js';
import { captureCombination } from '@features/map/model/selectors.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { CustomMapForm, type CustomMapStart } from './CustomMapForm.js';
import {
  type LayerVisibility,
  LayerVisibilityFields,
} from './LayerVisibilityFields.js';
import { MapCombinationForm } from './MapCombinationForm.js';

type Props = { request: CustomMapRequest };

type View =
  | { mode: 'add'; draftType: string; start?: CustomMapStart }
  | { mode: 'edit'; type: string }
  | { mode: 'combination' };

function makeType() {
  return Math.random().toString(36).slice(-6);
}

/** The form for a custom map or a combination, in the library's modal. */
export function CustomMapEditor({ request }: Props): ReactElement {
  const m = useMessages();

  // A custom map is nothing but an entry in the account's settings, so offline
  // a signed-in user can neither add, change nor remove one.
  const canSaveSettings = useCanSaveSettings();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const mapCombinations = useAppSelector((state) => state.map.mapCombinations);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  // The form the request names: a map or combination to edit, a new shading
  // map from the shading panel, or a new custom map.
  // A map that is gone by now opens as a new one rather than as an empty edit
  // that would save under its id.
  const startFor = (
    request: CustomMapRequest,
  ): {
    view: View;
    combinationDraft?: MapCombination;
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

    const combination =
      request.draft ?? mapCombinations.find((c) => c.id === request.edit);

    if (combination) {
      return {
        view: { mode: 'combination' },
        combinationDraft: combination,
        visibility: visibilityOf(combination.id),
      };
    }

    if (
      request.edit !== undefined &&
      customLayers.some((def) => def.type === request.edit)
    ) {
      return {
        view: { mode: 'edit', type: request.edit },
        visibility: visibilityOf(request.edit),
      };
    }

    return {
      view: {
        mode: 'add',
        draftType: makeType(),
        start: request.addShadingMap
          ? {
              name: '',
              technology: 'parametricShading',
              ...request.addShadingMap,
            }
          : request.addCopyOf && {
              name: request.addCopyOf.name ?? '',
              copyOf: request.addCopyOf,
            },
      },
      visibility: { showInMenu: true, showInToolbar: false, shortcut: null },
    };
  };

  const [initial] = useState(() => startFor(request));

  const [view, setView] = useState<View>(initial.view);

  const [draft, setDraft] = useState<CustomLayerDef | undefined>(undefined);

  const [combinationDraft, setCombinationDraft] = useState(
    initial.combinationDraft,
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

    setCombinationDraft(start.combinationDraft);

    setVisibility(start.visibility);
  }

  // A save shows its map in Installed maps (a panel's goes back to the map);
  // Cancel goes back where the form was opened from.
  const done = (saved?: string) => {
    const back = saved === undefined ? request.returnTo : undefined;

    dispatch(
      setActiveModal(
        request.addShadingMap || request.addCopyOf || back === null
          ? null
          : back === 'available-maps'
            ? { type: 'available-maps' }
            : { type: 'installed-maps', highlight: saved },
      ),
    );
  };

  const captureCurrentMap = (withBase: boolean) =>
    captureCombination(store.getState(), withBase);

  const addCombination = (start?: CustomMapStart) => {
    setCombinationDraft({
      id: makeType(),
      name: start?.name ?? '',
      iconSpec: start?.iconSpec,
      ...captureCurrentMap(true),
    });

    setView({ mode: 'combination' });
  };

  const handleAddClick = (start?: CustomMapStart) => {
    setDraft(undefined);

    setCombinationDraft(undefined);

    setView({ mode: 'add', draftType: makeType(), start });
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

  const canSaveCombination = Boolean(
    combinationDraft?.name.trim() && isWorthSaving(combinationDraft),
  );

  const handleSaveCombination = () => {
    if (!combinationDraft || !canSaveCombination) {
      return;
    }

    const combination = {
      ...combinationDraft,
      name: combinationDraft.name.trim(),
    };

    const isEdit = mapCombinations.some((c) => c.id === combination.id);

    trackMatomo([
      'trackEvent',
      'MapSettings',
      isEdit ? 'update' : 'create',
      'combination',
    ]);

    dispatch(
      mapCombinationSave({
        combination,
        settings: visibility,
      }),
    );

    done(combination.id);
  };

  const editingValue =
    view.mode === 'edit'
      ? customLayers.find((d) => d.type === view.type)
      : undefined;

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
    <Modal.Footer>
      <Button
        variant="primary"
        onClick={onSave}
        disabled={!canSave || !canSaveSettings}
      >
        <FaCheck /> {m?.general.save}
      </Button>

      <OfflineBadge offline={!canSaveSettings} />

      <Button variant="dark" onClick={() => done()}>
        <FaTimes /> {m?.general.cancel}
      </Button>
    </Modal.Footer>
  );

  return view.mode === 'combination' ? (
    <>
      <Modal.Body>
        {combinationDraft && (
          <MapCombinationForm
            value={combinationDraft}
            editing={mapCombinations.some((c) => c.id === combinationDraft.id)}
            onChange={setCombinationDraft}
            onPickTechnology={handleAddClick}
          />
        )}

        {visibilityFields}
      </Modal.Body>

      {formFooter(handleSaveCombination, canSaveCombination)}
    </>
  ) : (
    <>
      <Modal.Body>
        <CustomMapForm
          key={`${draftType}:${generation}`}
          type={draftType}
          value={editingValue}
          start={view.mode === 'add' ? view.start : undefined}
          onChange={setDraft}
          onPickCombination={addCombination}
        />

        {visibilityFields}
      </Modal.Body>

      {formFooter(handleSave, Boolean(draft))}
    </>
  );
}
