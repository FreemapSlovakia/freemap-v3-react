import type { CachedTileMapDef } from '@features/cachedMaps/cachedTileMaps.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { LayerSettings } from '@features/map/model/actions.js';
import {
  combinationOpacity,
  type MapCombination,
} from '@features/map/model/mapCombination.js';
import { activeCombinationsSelector } from '@features/map/model/selectors.js';
import {
  integratedLayerDefMapSelector,
  libraryIndexByIdSelector,
  libraryIndexSelector,
} from '@features/mapLibrary/model/selectors.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { CustomMapGlyph } from '@shared/components/CustomMapGlyph.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { ShortcutRecorder } from '@shared/components/ShortcutRecorder.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerName } from '@shared/layerName.js';
import {
  type CustomLayerDef,
  flaggedCountries,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { Form, Table } from 'react-bootstrap';
import { FaEye, FaHistory, FaKeyboard, FaRegListAlt } from 'react-icons/fa';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './MapLayersSettings.module.css';
import { OpacityButton } from './OpacityButton.js';
import { ToolbarIcon } from './ToolbarIcon.js';

type Props = {
  layersSettings: Record<string, LayerSettings>;
  setLayersSettings: (s: Record<string, LayerSettings>) => void;
  customLayers: CustomLayerDef[];
  cachedMaps: CachedTileMapDef[];
  mapCombinations: MapCombination[];
};

export function MapLayersSettings({
  layersSettings,
  setLayersSettings,
  customLayers,
  cachedMaps,
  mapCombinations,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const activeCombinations = useAppSelector(activeCombinationsSelector);

  const integratedLayerDefMap = useAppSelector(integratedLayerDefMapSelector);

  const libraryIndex = useAppSelector(libraryIndexSelector);

  const libraryIndexById = useAppSelector(libraryIndexByIdSelector);

  const getName = (def: { type: string; custom: boolean; name?: string }) =>
    layerName(def, m) ??
    (def.custom ? `${m?.mapLayers.customBase} ${def.type}` : '…');

  // Maps are installed and uninstalled in the map library.
  const layerDefs = [
    ...libraryIndex
      .filter(({ type }) => isLayerInstalled(layersSettings, type))
      .map(({ load: _, bundled: __, ...def }) => ({
        ...def,
        custom: false,
      })),
    ...customLayers.map((def) => ({
      ...def,
      countries: [],
      layerPreview: false,
      icon: <CustomMapGlyph spec={def.iconSpec} kind={def.technology} />,
      defaultInToolbar: false,
      defaultInMenu: false,
      superseededBy: undefined,
      custom: true,
    })),
    ...cachedMaps
      .filter((cm) => cm.downloadedCount === cm.tileCount)
      .map((cm) => ({
        ...cm,
        countries: [] as string[],
        icon: <CustomMapGlyph spec={cm.iconSpec} kind="cached" />,
        defaultInToolbar: false,
        defaultInMenu: false,
        superseededBy: undefined,
        custom: true,
      })),
    ...mapCombinations.map((combination) => ({
      type: combination.id,
      layer:
        combination.base === undefined
          ? ('overlay' as const)
          : ('base' as const),
      // It keeps its opacities per layer, so has none of its own.
      combination: true,
      name: combination.name,
      countries: [] as string[],
      icon: <CustomMapGlyph spec={combination.iconSpec} kind="combination" />,
      defaultInToolbar: false,
      // As the layer menu has it.
      defaultInMenu: true,
      superseededBy: undefined,
      custom: true,
    })),
  ];

  return (
    <Table striped borderless size="sm">
      <thead>
        <tr>
          <th />

          <th />

          {/* `ms-n1`: the cell's own padding already puts the glyph over the
              checkbox below, so the mark reaches back over its leading step
              rather than adding a second one and sliding off it. */}
          <th>
            <GlyphMarker
              hint={msm?.showInToolbar}
              color={null}
              className="ms-n1"
            >
              <ToolbarIcon />
            </GlyphMarker>
          </th>

          <th>
            <GlyphMarker hint={msm?.showInMenu} color={null} className="ms-n1">
              <FaRegListAlt />
            </GlyphMarker>
          </th>

          <th className="text-center">
            <GlyphMarker hint={msm?.overlayOpacity} color={null}>
              <FaEye />
            </GlyphMarker>
          </th>

          <th className="text-center fm-should-have-keyboard">
            <GlyphMarker hint={msm?.keyboardShortcut} color={null}>
              <FaKeyboard />
            </GlyphMarker>
          </th>
        </tr>
      </thead>

      <tbody>
        {layerDefs.map((def) => {
          const { type } = def;

          // Not while an active combination sets it instead.
          const opacityEditable =
            def.layer === 'overlay' &&
            !('combination' in def) &&
            combinationOpacity(activeCombinations, type) === undefined;

          return (
            <tr key={type}>
              <td>{def.icon}</td>

              <td>
                {getName(def)}

                {def.superseededBy && (
                  <GlyphMarker hint={m?.mapLayers.legacy}>
                    <FaHistory />
                  </GlyphMarker>
                )}

                {flaggedCountries(def)?.map((country) => (
                  <CountryFlag key={country} country={country} />
                ))}
              </td>

              <td>
                <Form.Check
                  checked={
                    layersSettings[type]?.showInToolbar ??
                    Boolean(def.defaultInToolbar)
                  }
                  onChange={(e) =>
                    setLayersSettings({
                      ...layersSettings,
                      [type]: {
                        ...(layersSettings[type] ?? {}),
                        showInToolbar: e.currentTarget.checked,
                      },
                    })
                  }
                />
              </td>

              <td>
                <Form.Check
                  checked={
                    layersSettings[type]?.showInMenu ??
                    Boolean(def.defaultInMenu)
                  }
                  onChange={(e) =>
                    setLayersSettings({
                      ...layersSettings,
                      [type]: {
                        ...(layersSettings[type] ?? {}),
                        showInMenu: e.currentTarget.checked,
                      },
                    })
                  }
                />
              </td>

              <td>
                {opacityEditable && (
                  <OpacityButton
                    value={resolveLayerOpacity(
                      integratedLayerDefMap[type],
                      layersSettings[type]?.opacity,
                    )}
                    onChange={(opacity) =>
                      setLayersSettings({
                        ...layersSettings,
                        [type]: { ...(layersSettings[type] ?? {}), opacity },
                      })
                    }
                  />
                )}
              </td>

              <td
                className={clsx(
                  'text-center',
                  classes.mapShortcutCfg,
                  'fm-should-have-keyboard',
                )}
              >
                <ShortcutRecorder
                  value={
                    layersSettings[type]?.shortcut === undefined
                      ? libraryIndexById[type]?.shortcut
                      : layersSettings[type]?.shortcut
                  }
                  onChange={(shortcut) =>
                    setLayersSettings({
                      ...layersSettings,
                      [type]: {
                        ...(layersSettings[type] ?? {}),
                        shortcut,
                      },
                    })
                  }
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
