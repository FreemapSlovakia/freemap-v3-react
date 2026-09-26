import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { saveSettings, setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapApplyCombination,
  mapRefocus,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import {
  combinationShading,
  isWorthSaving,
  type MapCombination,
  withoutCombinations,
} from '@features/map/model/mapCombination.js';
import {
  activeCombinationsSelector,
  captureCombination,
} from '@features/map/model/selectors.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, ListGroup, Modal } from 'react-bootstrap';
import {
  FaCamera,
  FaCheck,
  FaEye,
  FaPencilAlt,
  FaPlus,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { TbStack2 } from 'react-icons/tb';
import { useDispatch, useStore } from 'react-redux';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { CustomMapForm, type CustomMapStart } from './CustomMapForm.js';
import { LayerVisibilityFields } from './LayerVisibilityFields.js';
import { MapCombinationForm } from './MapCombinationForm.js';

type Props = { show: boolean };

type View =
  | { mode: 'list' }
  | { mode: 'add'; draftType: string; start?: CustomMapStart }
  | { mode: 'edit'; type: string }
  | { mode: 'combination' };

type ListItem =
  | { kind: 'layer'; key: string; name: string; def: CustomLayerDef }
  | { kind: 'combination'; key: string; name: string; def: MapCombination };

function makeType() {
  return Math.random().toString(36).slice(-6);
}

export default function CustomMapsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  // A custom map is nothing but an entry in the account's settings, so offline
  // a signed-in user can neither add, change nor remove one.
  const canSaveSettings = useCanSaveSettings();

  const signedIn = useAppSelector((state) => Boolean(state.auth.user));

  const mm = useMyMapsMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const store = useStore<RootState>();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const mapCombinations = useAppSelector((state) => state.map.mapCombinations);

  const activeCombinations = useAppSelector(activeCombinationsSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const activeLayers = useAppSelector((state) => state.map.layers);

  const language = useAppSelector((state) => state.l10n.language);

  const addCombinationRequested = useAppSelector(
    (state) =>
      state.main.activeModal?.type === 'custom-maps' &&
      Boolean(state.main.activeModal.addCombination),
  );

  const byName = makeLabelComparator(language);

  const sortedItems: ListItem[] = [
    ...customLayers.map((def) => ({
      kind: 'layer' as const,
      key: def.type,
      name: def.name || `{${def.type}}`,
      def,
    })),
    ...mapCombinations.map((def) => ({
      kind: 'combination' as const,
      key: def.id,
      name: def.name,
      def,
    })),
  ].sort((a, b) => byName(a.name, b.name));

  const [view, setView] = useState<View>({ mode: 'list' });

  const [draft, setDraft] = useState<CustomLayerDef | undefined>(undefined);

  const [combinationDraft, setCombinationDraft] = useState<MapCombination>();

  const [showInMenu, setShowInMenu] = useState(true);

  const [showInToolbar, setShowInToolbar] = useState(false);

  useDocumentTitle(show ? m?.mapLayers.customMaps : undefined);

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const goToList = useCallback(() => {
    setDraft(undefined);

    setCombinationDraft(undefined);

    setView({ mode: 'list' });
  }, []);

  const captureCurrentMap = useCallback(
    (withBase: boolean) => captureCombination(store.getState(), withBase),
    [store],
  );

  const addCombination = useCallback(
    (start?: CustomMapStart) => {
      const id = makeType();

      setCombinationDraft({
        id,
        name: start?.name ?? '',
        iconSpec: start?.iconSpec,
        ...captureCurrentMap(true),
      });

      setView({ mode: 'combination' });
    },
    [captureCurrentMap],
  );

  // Asked for from outside the modal: straight to a form filled from the map.
  useEffect(() => {
    if (show && addCombinationRequested) {
      addCombination();
    }
  }, [show, addCombinationRequested, addCombination]);

  const handleAddClick = (start?: CustomMapStart) => {
    setDraft(undefined);

    setCombinationDraft(undefined);

    setView({ mode: 'add', draftType: makeType(), start });
  };

  const handleEditClick = (type: string) => {
    setDraft(undefined);

    setView({ mode: 'edit', type });
  };

  const confirmDelete = (name: string) =>
    confirm({
      title: mm?.deleteTitle,
      message: mm?.deleteConfirm(name),
      confirmLabel: m?.general.delete,
      confirmStyle: 'danger',
    });

  const handleDeleteClick = async (def: CustomLayerDef) => {
    if (!(await confirmDelete(def.name || `{${def.type}}`))) {
      return;
    }

    const next = customLayers.filter((d) => d.type !== def.type);

    trackMatomo(['trackEvent', 'MapSettings', 'delete', 'customMap']);

    dispatch(
      saveSettings({ settings: { customLayers: next }, keepOpen: true }),
    );
  };

  const handleSave = () => {
    if (!draft) {
      return;
    }

    const isEdit = customLayers.some((d) => d.type === draft.type);

    const next = [...customLayers.filter((d) => d.type !== draft.type), draft];

    trackMatomo([
      'trackEvent',
      'MapSettings',
      isEdit ? 'update' : 'create',
      'customMap',
    ]);

    dispatch(
      saveSettings({
        settings: {
          customLayers: next,
          layersSettings: {
            ...layersSettings,
            [draft.type]: {
              ...(layersSettings[draft.type] ?? {}),
              showInMenu,
              showInToolbar,
            },
          },
        },
        keepOpen: true,
        activateLayerType: draft.type,
      }),
    );

    goToList();
  };

  const handleEditCombinationClick = (combination: MapCombination) => {
    setCombinationDraft(combination);

    setView({ mode: 'combination' });
  };

  /** Saves it in place of any of the same id; with its menu and toolbar flags from the form. */
  const saveCombination = (
    combination: MapCombination,
    withVisibility: boolean,
  ) => {
    const isEdit = mapCombinations.some((c) => c.id === combination.id);

    trackMatomo([
      'trackEvent',
      'MapSettings',
      isEdit ? 'update' : 'create',
      'combination',
    ]);

    dispatch(
      saveSettings({
        settings: {
          mapCombinations: [
            ...mapCombinations.filter((c) => c.id !== combination.id),
            combination,
          ],
          ...(withVisibility && {
            layersSettings: {
              ...layersSettings,
              [combination.id]: {
                ...(layersSettings[combination.id] ?? {}),
                showInMenu,
                showInToolbar,
              },
            },
          }),
        },
        keepOpen: true,
        activateCombination: combination.id,
      }),
    );
  };

  const handleUpdateFromMapClick = (combination: MapCombination) => {
    const updated = {
      ...combination,
      ...captureCurrentMap(combination.base !== undefined),
    };

    // Too little on the map to save as is: the form says why.
    if (!isWorthSaving(updated, customLayers)) {
      handleEditCombinationClick(updated);

      return;
    }

    saveCombination(updated, false);
  };

  const handleDeleteCombinationClick = async (combination: MapCombination) => {
    if (!(await confirmDelete(combination.name))) {
      return;
    }

    trackMatomo(['trackEvent', 'MapSettings', 'delete', 'combination']);

    const state = store.getState();

    const active = activeCombinationsSelector(state);

    const shown = active.find((c) => c.id === combination.id);

    // Its layers go with it, as unticking it would take them off.
    if (shown) {
      dispatch(
        mapRefocus({
          layers: withoutCombinations(state.map.layers, [shown], active),
        }),
      );
    }

    const restLayersSettings = Object.fromEntries(
      Object.entries(layersSettings).filter(
        ([type]) => type !== combination.id,
      ),
    );

    dispatch(
      saveSettings({
        settings: {
          mapCombinations: mapCombinations.filter(
            (c) => c.id !== combination.id,
          ),
          layersSettings: restLayersSettings,
        },
        keepOpen: true,
      }),
    );
  };

  const canSaveCombination = Boolean(
    combinationDraft?.name.trim() &&
      isWorthSaving(combinationDraft, customLayers),
  );

  const handleSaveCombination = () => {
    if (!combinationDraft || !canSaveCombination) {
      return;
    }

    saveCombination(
      {
        ...combinationDraft,
        name: combinationDraft.name.trim(),
        shading: combinationShading(
          combinationDraft,
          customLayers,
          store.getState().map.shading,
        ),
      },
      true,
    );

    goToList();
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

  const combinationDraftId = combinationDraft?.id;

  useEffect(() => {
    if (view.mode === 'edit' || view.mode === 'combination') {
      const s =
        layersSettings[
          view.mode === 'edit' ? view.type : (combinationDraftId ?? '')
        ];

      setShowInMenu(s?.showInMenu ?? true);

      setShowInToolbar(s?.showInToolbar ?? false);
    } else if (view.mode === 'add') {
      setShowInMenu(true);

      setShowInToolbar(false);
    }
  }, [view, layersSettings, combinationDraftId]);

  const layerName = (type: string) =>
    m?.mapLayers.letters[type] ??
    customLayers.find((d) => d.type === type)?.name ??
    type;

  const renderItem = (item: ListItem) => {
    const combination = item.kind === 'combination' ? item.def : undefined;

    const layer = item.kind === 'layer' ? item.def : undefined;

    return (
      <ListGroup.Item
        key={item.key}
        className="d-flex align-items-center gap-2"
      >
        <IconSpecGlyph
          spec={item.def.iconSpec}
          fallback={combination ? <TbStack2 /> : <MdDashboardCustomize />}
        />

        <div className="flex-grow-1 me-2 min-w-0">
          <div>{item.name}</div>

          <small className="text-muted">
            {combination ? (
              <>
                <span className="text-nowrap">{msm?.combination}</span>
                {' · '}
                <span className="text-nowrap">
                  {combination.base === undefined
                    ? m?.mapLayers.layer.overlay
                    : layerName(combination.base)}
                  {combination.overlays.length > 0 &&
                    ` + ${combination.overlays.length}`}
                </span>
              </>
            ) : (
              layer && (
                <>
                  <span className="text-nowrap">
                    {m?.mapLayers.technologies[layer.technology] ??
                      layer.technology}
                  </span>
                  {' · '}
                  <span className="text-nowrap">
                    {m?.mapLayers.layer[layer.layer]}
                  </span>
                </>
              )
            )}
          </small>
        </div>

        <div className="flex-shrink-0">
          <ResponsiveActions
            size="sm"
            align="end"
            toggleLabel={m?.general.actions}
          >
            <Action
              icon={<FaEye />}
              label={m?.mapLayers.activate}
              variant="outline-primary"
              active={
                combination
                  ? activeCombinations.some((c) => c.id === combination.id)
                  : activeLayers.includes(item.key)
              }
              onClick={() =>
                dispatch(
                  combination
                    ? mapApplyCombination({ id: combination.id, toggle: true })
                    : mapToggleLayer({ type: item.key }),
                )
              }
              showFrom="sm"
            />

            {combination && (
              <Action
                icon={<FaCamera />}
                label={msm?.updateFromCurrentMap}
                requiresOnline={signedIn}
                onClick={() => handleUpdateFromMapClick(combination)}
              />
            )}

            <Action
              icon={<FaPencilAlt />}
              label={m?.general.modify}
              requiresOnline={signedIn}
              onClick={() =>
                combination
                  ? handleEditCombinationClick(combination)
                  : handleEditClick(item.key)
              }
              showFrom="sm"
            />

            <ActionDivider />

            <Action
              icon={<FaTrash />}
              label={m?.general.delete}
              variant="danger"
              requiresOnline={signedIn}
              onClick={() =>
                combination
                  ? handleDeleteCombinationClick(combination)
                  : layer && handleDeleteClick(layer)
              }
              showFrom="sm"
            />
          </ResponsiveActions>
        </div>
      </ListGroup.Item>
    );
  };

  const visibilityFields = (
    <div className="mt-3">
      <LayerVisibilityFields
        disabled={!canSaveSettings}
        showInMenu={showInMenu}
        showInToolbar={showInToolbar}
        onChange={(v) => {
          setShowInMenu(v.showInMenu);
          setShowInToolbar(v.showInToolbar);
        }}
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

      <Button variant="dark" onClick={goToList}>
        <FaTimes /> {m?.general.cancel}
      </Button>
    </Modal.Footer>
  );

  return (
    <Modal
      scrollable
      show={show}
      onHide={close}
      size={view.mode === 'list' ? 'lg' : undefined}
      contentClassName="bg-body-tertiary"
      // The icon picker's popover portals outside the modal; the focus trap
      // would take focus away from its search field.
      enforceFocus={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <MdDashboardCustomize /> {m?.mapLayers.customMaps}
        </Modal.Title>
      </Modal.Header>

      {view.mode === 'list' ? (
        <>
          <Modal.Body>
            {sortedItems.length === 0 ? (
              <p className="text-muted mb-0">
                {m?.mapLayers.customMapsEmptyMessage}
              </p>
            ) : (
              <ListGroup>{sortedItems.map(renderItem)}</ListGroup>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              disabled={!canSaveSettings}
              onClick={() => handleAddClick()}
            >
              <FaPlus /> {m?.mapLayers.addCustomMap}
            </Button>

            <OfflineBadge offline={!canSaveSettings} />

            <Button variant="dark" onClick={close}>
              <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
            </Button>
          </Modal.Footer>
        </>
      ) : view.mode === 'combination' ? (
        <>
          <Modal.Body>
            {combinationDraft && (
              <MapCombinationForm
                value={combinationDraft}
                editing={mapCombinations.some(
                  (c) => c.id === combinationDraft.id,
                )}
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
              key={draftType}
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
      )}
    </Modal>
  );
}
