import type { CachedTileMapDef } from '@features/cachedMaps/cachedTileMaps.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { LayerSettings } from '@features/map/model/actions.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import { ShortcutRecorder } from '@shared/components/ShortcutRecorder.js';
import {
  type CustomLayerDef,
  integratedLayerDefMap,
  integratedLayerDefs,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import clsx from 'clsx';
import { type ReactElement, useState } from 'react';
import { Form, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaEllipsisH,
  FaEye,
  FaHistory,
  FaKeyboard,
  FaRegListAlt,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './MapLayersSettings.module.css';

type Props = {
  layersSettings: Record<string, LayerSettings>;
  setLayersSettings: (s: Record<string, LayerSettings>) => void;
  customLayers: CustomLayerDef[];
  cachedMaps: CachedTileMapDef[];
};

export function MapLayersSettings({
  layersSettings,
  setLayersSettings,
  customLayers,
  cachedMaps,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  function getName(def: { type: string; custom: boolean; name?: string }) {
    const { type } = def;

    return def.custom
      ? def.name || `${m?.mapLayers.customBase} ${type}`
      : (m?.mapLayers.letters[type] ?? '…');
  }

  const [activeType, setActiveType] = useState('');

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">{msm?.overlayOpacity}</Popover.Header>

      <Popover.Body>
        <Form.Range
          min={0}
          max={100}
          value={
            resolveLayerOpacity(
              integratedLayerDefMap[activeType],
              layersSettings[activeType]?.opacity,
            ) * 100
          }
          onChange={(e) =>
            setLayersSettings({
              ...layersSettings,
              [activeType]: {
                ...(layersSettings[activeType] ?? {}),
                opacity: Number(e.currentTarget.value) / 100,
              },
            })
          }
        />
      </Popover.Body>
    </Popover>
  );

  const layerDefs = [
    ...integratedLayerDefs.map((def) => ({
      ...def,
      custom: false,
      name: undefined,
    })),
    ...customLayers.map((def) => ({
      ...def,
      countries: [],
      layerPreview: false,
      icon: (
        <IconSpecGlyph
          spec={def.iconSpec}
          fallback={<MdDashboardCustomize />}
        />
      ),
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
        icon: <IconSpecGlyph spec={cm.iconSpec} fallback={<BiWifiOff />} />,
        defaultInToolbar: false,
        defaultInMenu: false,
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
              <FaEllipsisH />
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

                {type !== 'X' &&
                  def.countries?.map((country) => (
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
                {def.layer === 'overlay' && (
                  <div>
                    <OverlayTrigger
                      trigger="click"
                      placement="left"
                      overlay={popover}
                      rootClose
                    >
                      <div className={classes.opacityButton}>
                        <button
                          type="button"
                          style={{
                            opacity: `${
                              resolveLayerOpacity(
                                integratedLayerDefMap[type],
                                layersSettings[type]?.opacity,
                              ) * 100
                            }%`,
                          }}
                          onClick={() => setActiveType(type)}
                        />
                      </div>
                    </OverlayTrigger>
                  </div>
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
                      ? integratedLayerDefMap[type]?.shortcut
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
