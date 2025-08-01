import { ReactElement, useState } from 'react';
import { Form, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { FaEllipsisH, FaEye, FaHistory, FaRegListAlt } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { LayerSettings } from '../../actions/mapActions.js';
import { useMessages } from '../../l10nInjector.js';
import { CustomLayerDef, integratedLayerDefs } from '../../mapDefinitions.js';
import { countryCodeToFlag, Emoji } from '../Emoji.js';

type Props = {
  layersSettings: Record<string, LayerSettings>;
  setLayersSettings: (s: Record<string, LayerSettings>) => void;
  customLayers: CustomLayerDef[];
};

export function MapLayersSettings({
  layersSettings,
  setLayersSettings,
  customLayers,
}: Props): ReactElement {
  const m = useMessages();

  function getName(def: { type: string; custom: boolean; name?: string }) {
    const { type } = def;

    return def.custom
      ? def.name || m?.mapLayers.customBase + ' ' + type
      : (m?.mapLayers.letters[type] ?? '…');
  }

  const [activeType, setActiveType] = useState('');

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">{m?.settings.overlayOpacity}</Popover.Header>

      <Popover.Body>
        <Form.Range
          min={0}
          max={100}
          value={(layersSettings[activeType]?.opacity ?? 1) * 100}
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
      adminOnly: false,
      icon: <MdDashboardCustomize />,
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
          <th>
            <FaEllipsisH title={m?.settings.showInToolbar} />
          </th>
          <th>
            <FaRegListAlt title={m?.settings.showInMenu} />
          </th>
          <th>
            <FaEye title={m?.settings.overlayOpacity} />
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
                  <FaHistory
                    className="text-warning ms-1"
                    title={m?.maps.legacy}
                  />
                )}

                {type !== 'X' &&
                  def.countries?.map((country) => (
                    <Emoji className="ms-1" key={country}>
                      {countryCodeToFlag(country)}
                    </Emoji>
                  ))}
              </td>

              <td>
                <Form.Check
                  checked={
                    layersSettings[type]?.showInToolbar ??
                    !!def.defaultInToolbar
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
                    layersSettings[type]?.showInMenu ?? !!def.defaultInMenu
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
                      <div className="fm-opacity-button">
                        <button
                          type="button"
                          style={{
                            opacity:
                              (layersSettings[type]?.opacity ?? 1) * 100 + '%',
                          }}
                          onClick={() => setActiveType(type)}
                        />
                      </div>
                    </OverlayTrigger>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
