import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapLayerSettingsChange } from '@features/map/model/actions.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { CustomMapGlyph } from '@shared/components/CustomMapGlyph.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { layerLabel } from '@shared/layerName.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { mapLibraryPreviewEnd } from '../model/actions.js';
import { mapByIdSelector } from '../model/selectors.js';

/** The map previewed from the library, with what to do with it. */
export default function MapLibraryPreviewMenu(): ReactElement | null {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const type = useAppSelector((state) => state.mapLibrary.preview?.type);

  // Its parts, not the ref, which every recompute rebuilds.
  const refOf = (state: RootState) =>
    type === undefined ? undefined : mapByIdSelector(state)[type];

  const mapOrigin = useAppSelector((state) => refOf(state)?.origin);

  const entry = useAppSelector((state) => {
    const ref = refOf(state);

    return ref?.origin === 'library' ? ref.entry : undefined;
  });

  // A custom or offline map is previewed from Installed maps.
  const own = useAppSelector((state) => {
    const ref = refOf(state);

    return ref?.origin === 'library' ? undefined : ref?.def;
  });

  // The user's own maps are never uninstalled.
  const installed = useAppSelector(
    (state) =>
      !entry ||
      (type !== undefined && isLayerInstalled(state.map.layersSettings, type)),
  );

  const canSaveSettings = useCanSaveSettings();

  if (!type || (!entry && !own)) {
    return null;
  }

  const icon = entry ? (
    entry.icon
  ) : (
    <CustomMapGlyph
      spec={own?.iconSpec}
      kind={mapOrigin === 'cached' ? 'cached' : own?.technology}
    />
  );

  const name = layerLabel(entry || own || { type }, m);

  // Ending keeps the map on and closes the library.
  const keep = () => {
    dispatch(mapLibraryPreviewEnd({ keep: true }));

    dispatch(setActiveModal(null));
  };

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="px-1 text-nowrap">
          {icon} {name}
        </div>

        {!installed && (
          <LongPressTooltip breakpoint="sm" label={msm?.installMap}>
            {({ label, labelClassName, props }) => (
              <Button
                variant="primary"
                disabled={!canSaveSettings}
                onClick={() => {
                  dispatch(
                    mapLayerSettingsChange({
                      type,
                      settings: { installed: true },
                    }),
                  );

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
