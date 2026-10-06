import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapLayersSettingsReset } from '@features/map/model/actions.js';
import { CustomMapEditor } from '@features/mapSettings/components/CustomMapEditor.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { FitButtonGroup } from '@shared/components/FitButtonGroup.js';
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
import { Modal, ToggleButton } from 'react-bootstrap';
import { FaBookOpen, FaLayerGroup, FaPlus } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { yourMapsCountSelector } from '../model/selectors.js';
import {
  initialLibraryFilters,
  type LibraryFilters,
  LibraryTab,
  useLibraryEntries,
} from './LibraryTab.js';
import {
  initialYourMapsFilters,
  type YourMapsFilters,
  YourMapsTab,
} from './YourMapsList.js';

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

  // The tab is the modal's id, so each has its own menu item, chord and link.
  const activeModal = useAppSelector((state) => state.main.activeModal);

  const tab =
    activeModal?.type === 'available-maps' ? 'available' : 'installed';

  // A custom map's form takes the list's place; the tabs' filters live here so
  // they outlast it.
  const customMapRequest =
    activeModal?.type === 'installed-maps' ? activeModal.customMap : undefined;

  const highlight =
    activeModal?.type === 'installed-maps' ? activeModal.highlight : undefined;

  const canSaveSettings = useCanSaveSettings();

  const [yourFilters, setYourFilters] = useState<YourMapsFilters>(
    initialYourMapsFilters,
  );

  const [libraryFilters, setLibraryFilters] = useState<LibraryFilters>(
    initialLibraryFilters,
  );

  const { catalog, entries } = useLibraryEntries();

  const yourMapsCount = useAppSelector(yourMapsCountSelector);

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
          <FaLayerGroup /> {m?.mapLayers.mapManager}
        </Modal.Title>
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
            <FitButtonGroup className="mb-3">
              <ToggleButton
                id="map-library-tab-installed"
                type="radio"
                name="map-library-tab"
                variant="outline-primary"
                value="installed"
                checked={tab === 'installed'}
                onChange={() =>
                  dispatch(setActiveModal({ type: 'installed-maps' }))
                }
              >
                <FaLayerGroup /> {m?.mapLayers.installedMaps} ({yourMapsCount})
              </ToggleButton>

              <ToggleButton
                id="map-library-tab-available"
                type="radio"
                name="map-library-tab"
                variant="outline-primary"
                value="available"
                checked={tab === 'available'}
                onChange={() =>
                  dispatch(setActiveModal({ type: 'available-maps' }))
                }
              >
                <FaBookOpen /> {m?.mapLayers.availableMaps}
                {catalog && ` (${entries.length})`}
              </ToggleButton>
            </FitButtonGroup>

            {tab === 'installed' ? (
              <YourMapsTab
                filters={yourFilters}
                onChange={setYourFilters}
                canSave={canSaveSettings}
                highlight={highlight}
                searchRef={searchRef}
              />
            ) : (
              <LibraryTab
                catalog={catalog}
                entries={entries}
                filters={libraryFilters}
                onChange={setLibraryFilters}
                canSave={canSaveSettings}
                searchRef={searchRef}
              />
            )}
          </Modal.Body>

          <FmModalFooter>
            <FmFooterButton
              variant="secondary"
              priority={1}
              disabled={!canSaveSettings}
              onClick={() =>
                dispatch(
                  setActiveModal({
                    type: 'installed-maps',
                    customMap: {
                      returnTo:
                        tab === 'available' ? 'available-maps' : undefined,
                    },
                  }),
                )
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
