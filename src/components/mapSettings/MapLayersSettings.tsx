import { ReactElement, useState } from 'react';
import { Form, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { FaEllipsisH, FaEye, FaRegListAlt } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { is } from 'typia';
import { LayerSettings } from '../../actions/mapActions.js';
import { useMessages } from '../../l10nInjector.js';
import {
  CustomLayerDef,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  integratedLayerDefs,
  IntegratedLayerLetters,
  IsBaseLayerDef,
  IsOverlayLayerDef,
} from '../../mapDefinitions.js';

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

  function getName(type: string) {
    return type.startsWith('.')
      ? m?.mapLayers.customBase + ' ' + type.slice(1)
      : type.startsWith(':')
        ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
        : m?.mapLayers.letters[type as IntegratedLayerLetters];
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
    ...integratedLayerDefs,
    ...customLayers.map((cl) => ({
      ...cl,
      adminOnly: false,
      icon: <MdDashboardCustomize />,
      key: ['Digit' + cl.type.slice(1), false] as const,
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
        {layerDefs.map(({ icon, type, layer }, i) => (
          <tr key={type}>
            <td>{icon}</td>

            <td>{getName(type)}</td>

            <td>
              <Form.Check
                checked={
                  layersSettings[type]?.showInToolbar ??
                  defaultToolbarLayerLetters.includes(type) ??
                  false
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
                  defaultMenuLayerLetters.includes(type) ??
                  false
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
              {layer === 'overlay' && (
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
        ))}
      </tbody>
    </Table>
  );
}
