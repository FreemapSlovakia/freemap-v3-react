import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { mapLayersSettingsReset } from '@features/map/model/actions.js';
import { CustomMapEditor } from '@features/mapSettings/components/CustomMapEditor.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { layerLabel } from '@shared/layerName.js';
import { type ReactElement, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaLayerGroup, FaPlus } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { initialManagerFilters, type ManagerFilters } from '../filters.js';
import { useLibraryEntries } from './LibraryList.js';
import { MapManager } from './MapManager.js';

type Props = { show: boolean };

export default function MapLibraryModal({ show }: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  // The library steps aside while a map is previewed, keeping its search.
  const previewing = useAppSelector(
    (state) => state.mapLibrary.preview !== null,
  );

  const activeModal = useAppSelector((state) => state.main.activeModal);

  const managerModal =
    activeModal?.type === 'map-manager' ? activeModal : undefined;

  // A custom map's form takes the list's place; the filters live here so they
  // outlast it.
  const customMapRequest = managerModal?.customMap;

  const highlight = managerModal?.highlight;

  const canSaveSettings = useCanSaveSettings();

  // A query handed over by the map menu starts the search; `AsyncModal` mounts
  // the modal afresh for each opening.
  const [filters, setFilters] = useState<ManagerFilters>(() => ({
    ...initialManagerFilters,
    query: managerModal?.query ?? '',
  }));

  const [filtersOpen, setFiltersOpen] = useState(false);

  const { catalog, entries, failed } = useLibraryEntries();

  // Nothing to reset while no map has a setup and every map has only its
  // install state.
  const isDefault = useAppSelector(
    (state) =>
      Object.keys(state.map.layerSetups).length === 0 &&
      Object.values(state.map.layersSettings).every((s) =>
        Object.keys(s).every((key) => key === 'installed'),
      ),
  );

  const searchRef = useRef<HTMLInputElement>(null);

  // The form is headed by the map it edits, or as a new one.
  const editedType = customMapRequest?.edit;

  const editedCustomName = useAppSelector((state) => {
    const def = state.map.customLayers.find((d) => d.type === editedType);

    return def && layerLabel(def, m);
  });

  const editedPresetName = useAppSelector(
    (state) => state.map.presets.find((p) => p.id === editedType)?.name,
  );

  const newTitle = customMapRequest?.addNamedFrom
    ? msm?.newNamedMap
    : customMapRequest?.addPreset || customMapRequest?.addPresetFrom
      ? msm?.newPreset
      : m?.mapLayers.newCustomMap;

  const formTitle =
    editedPresetName !== undefined
      ? msm?.modifyPresetTitle(editedPresetName)
      : editedCustomName !== undefined
        ? msm?.modifyCustomMapTitle(editedCustomName)
        : newTitle;

  useDocumentTitle(
    show
      ? customMapRequest
        ? (editedPresetName ?? editedCustomName ?? newTitle)
        : m?.mapLayers.mapManager
      : undefined,
  );

  const close = () => {
    dispatch(setActiveModal(null));
  };

  return (
    <Modal
      show={show}
      onHide={close}
      scrollable
      size="lg"
      className={previewing ? 'd-none' : undefined}
      backdropClassName={previewing ? 'd-none' : undefined}
      // Hidden, it must neither close on Escape nor hold the focus; the custom
      // map form's icon picker portals outside the modal, so it can't either.
      keyboard={!previewing}
      enforceFocus={!previewing && !customMapRequest}
      // The dialog takes the focus once shown, so `autoFocus` alone loses it.
      // Without scrolling, which would undo the scroll to a highlighted row.
      onEntered={() => searchRef.current?.focus({ preventScroll: true })}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaLayerGroup /> <Text k="mapLayers.mapManager" />
        </Modal.Title>
        <ManualHeaderButton
          chapter={customMapRequest ? 'custom-maps' : 'maps'}
        />
      </Modal.Header>

      {customMapRequest ? (
        <>
          {/* What the form edits, under the modal's own title. */}
          <div className="h5 px-3 pt-3 mb-0">
            <MdDashboardCustomize /> {formTitle}
          </div>

          <CustomMapEditor request={customMapRequest} />
        </>
      ) : (
        <>
          <Modal.Body>
            <MapManager
              catalog={catalog}
              catalogFailed={failed}
              entries={entries}
              filters={filters}
              onChange={setFilters}
              filtersOpen={filtersOpen}
              onFiltersOpenChange={setFiltersOpen}
              canSave={canSaveSettings}
              highlight={highlight}
              searchRef={searchRef}
            />
          </Modal.Body>

          <FmModalFooter>
            <FmFooterButton
              variant="secondary"
              priority={1}
              disabled={!canSaveSettings}
              onClick={() =>
                dispatch(setActiveModal({ type: 'map-manager', customMap: {} }))
              }
              icon={<FaPlus />}
              label={m?.mapLayers.newCustomMap}
            />

            <OfflineBadge offline={!canSaveSettings} />

            <ResetToDefaultsButton
              onClick={async () => {
                if (
                  await confirm({
                    title: m?.general.resetToDefaults,
                    message: msm?.resetConfirm,
                    confirmLabel: m?.general.resetToDefaults,
                    confirmStyle: 'danger',
                  })
                ) {
                  dispatch(mapLayersSettingsReset());
                }
              }}
              disabled={isDefault || !canSaveSettings}
            />

            <FmDismissButton label={m?.general.close} onClick={close} />
          </FmModalFooter>
        </>
      )}
    </Modal>
  );
}
