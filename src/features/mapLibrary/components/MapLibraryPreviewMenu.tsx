import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { layerName } from '@shared/layerName.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { mapLibraryInstall, mapLibraryPreviewEnd } from '../model/actions.js';
import { libraryIndexByIdSelector } from '../model/selectors.js';

/** The map previewed from the library, with what to do with it. */
export default function MapLibraryPreviewMenu(): ReactElement | null {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const type = useAppSelector((state) => state.mapLibrary.preview?.type);

  const entry = useAppSelector(
    (state) => type && libraryIndexByIdSelector(state)[type],
  );

  const installed = useAppSelector(
    (state) =>
      type !== undefined && isLayerInstalled(state.map.layersSettings, type),
  );

  const canSaveSettings = useCanSaveSettings();

  if (!type || !entry) {
    return null;
  }

  // Ending keeps the map on and closes the library.
  const keep = () => {
    dispatch(mapLibraryPreviewEnd({ keep: true }));

    dispatch(setActiveModal(null));
  };

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="px-1 text-nowrap">
          {entry.icon} {layerName(entry, m)}
        </div>

        {!installed && (
          <LongPressTooltip breakpoint="sm" label={msm?.installMap}>
            {({ label, labelClassName, props }) => (
              <Button
                variant="primary"
                disabled={!canSaveSettings}
                onClick={() => {
                  dispatch(mapLibraryInstall({ type, installed: true }));

                  keep();
                }}
                {...props}
              >
                <FaPlus />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        <LongPressTooltip breakpoint="sm" label={msm?.keepOnMap}>
          {({ label, labelClassName, props }) => (
            <Button variant="secondary" onClick={keep} {...props}>
              <FaCheck />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip breakpoint="sm" label={msm?.backToLibrary} kbd="Esc">
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() => dispatch(mapLibraryPreviewEnd({ keep: false }))}
              {...props}
            >
              <FaArrowLeft />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.general.close}>
          {({ props }) => (
            <Button
              variant="dark"
              onClick={() => {
                dispatch(mapLibraryPreviewEnd({ keep: false }));

                dispatch(setActiveModal(null));
              }}
              {...props}
            >
              <FaTimes />
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    </div>
  );
}
