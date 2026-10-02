import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapLayersSettingsReset } from '@features/map/model/actions.js';
import { CustomMapEditor } from '@features/mapSettings/components/CustomMapEditor.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { type ReactElement, useRef, useState } from 'react';
import { Button, ButtonGroup, Modal, ToggleButton } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { MdDashboardCustomize, MdLibraryAdd } from 'react-icons/md';
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

  // A custom map's form takes the list's place; the tabs' filters live here so
  // they outlast it.
  const customMapRequest = useAppSelector((state) =>
    state.main.activeModal?.type === 'map-library'
      ? state.main.activeModal.customMap
      : undefined,
  );

  const canSaveSettings = useCanSaveSettings();

  const [tab, setTab] = useState<'yours' | 'library'>('yours');

  const [yourFilters, setYourFilters] = useState<YourMapsFilters>(
    initialYourMapsFilters,
  );

  const [libraryFilters, setLibraryFilters] = useState<LibraryFilters>(
    initialLibraryFilters,
  );

  const { catalog, entries } = useLibraryEntries();

  const yourMapsCount = useAppSelector(yourMapsCountSelector);

  // Nothing to reset while every map has only its install state.
  const isDefault = useAppSelector((state) =>
    Object.values(state.map.layersSettings).every((s) =>
      Object.keys(s).every((key) => key === 'installed'),
    ),
  );

  const searchRef = useRef<HTMLInputElement>(null);

  useDocumentTitle(
    show
      ? customMapRequest
        ? m?.mapLayers.customMaps
        : m?.mapLayers.mapLibrary
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
      onEntered={() => searchRef.current?.focus()}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {customMapRequest ? (
            <>
              <MdDashboardCustomize /> {m?.mapLayers.customMaps}
            </>
          ) : (
            <>
              <MdLibraryAdd /> {m?.mapLayers.mapLibrary}
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      {customMapRequest ? (
        <CustomMapEditor request={customMapRequest} />
      ) : (
        <>
          <Modal.Body>
            <ButtonGroup className="mb-3">
              <ToggleButton
                id="map-library-tab-yours"
                type="radio"
                name="map-library-tab"
                variant="outline-primary"
                value="yours"
                checked={tab === 'yours'}
                onChange={() => setTab('yours')}
              >
                {msm?.yourMaps} ({yourMapsCount})
              </ToggleButton>

              <ToggleButton
                id="map-library-tab-library"
                type="radio"
                name="map-library-tab"
                variant="outline-primary"
                value="library"
                checked={tab === 'library'}
                onChange={() => setTab('library')}
              >
                {msm?.filters.library}
                {catalog && ` (${entries.length})`}
              </ToggleButton>
            </ButtonGroup>

            {tab === 'yours' ? (
              <YourMapsTab
                filters={yourFilters}
                onChange={setYourFilters}
                canSave={canSaveSettings}
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
            <Button
              variant="secondary"
              disabled={!canSaveSettings}
              onClick={() =>
                dispatch(setActiveModal({ type: 'map-library', customMap: {} }))
              }
            >
              <FaPlus /> {m?.mapLayers.addCustomMap}
            </Button>

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
