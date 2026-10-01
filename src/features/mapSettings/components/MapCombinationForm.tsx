import { hasRole } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  isCombinable,
  isWorthSaving,
  type MapCombination,
} from '@features/map/model/mapCombination.js';
import { layerKindsSelector } from '@features/map/model/selectors.js';
import { integratedLayerDefMapSelector } from '@features/mapLibrary/model/selectors.js';
import { CUSTOM_MAP_ICONS } from '@shared/components/CustomMapGlyph.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import {
  MapLayerItem,
  type MapLayerItemDef,
} from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  resolveLayerAlias,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import { isLayerOffered } from '@shared/mapLibrary/installed.js';
import { mapIndex, mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import { type ReactElement, type ReactNode, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  ListGroup,
  ToggleButton,
} from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import type { CustomMapStart } from './CustomMapForm.js';
import { CustomMapTypeField } from './CustomMapTypeField.js';
import { OpacityButton } from './OpacityButton.js';

type Props = {
  value: MapCombination;
  editing: boolean;
  onChange: (value: MapCombination) => void;
  onPickTechnology: (start: CustomMapStart) => void;
};

function LayerPicker({
  defs,
  onSelect,
  children,
}: {
  defs: MapLayerItemDef[];
  onSelect: (type: string) => void;
  children: ReactNode;
}): ReactElement {
  return (
    <Dropdown onSelect={(type) => type && onSelect(type)}>
      <Dropdown.Toggle as={SelectToggle} className="w-100">
        {children}
      </Dropdown.Toggle>

      <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
        {defs.map((def) => (
          <Dropdown.Item
            as="button"
            type="button"
            key={def.type}
            eventKey={def.type}
          >
            <MapLayerItem def={def} />
          </Dropdown.Item>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );
}

export function MapCombinationForm({
  value,
  editing,
  onChange,
  onPickTechnology,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  const integratedLayerDefMap = useAppSelector(integratedLayerDefMapSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const layers = useAppSelector((state) => state.map.layers);

  const defs: MapLayerItemDef[] = [
    ...mapIndex.filter((def) => canPreviewLayers || !def.layerPreview),
    ...customLayers,
    ...cachedMaps.filter((cm) => cm.downloadedCount === cm.tileCount),
  ];

  // a retired layer shown as its successor, which applying it gives
  const defOf = (type: string, layer: 'base' | 'overlay'): MapLayerItemDef =>
    defs.find((def) => def.type === type) ??
    defs.find((def) => def.type === resolveLayerAlias(type)[0]) ?? {
      type,
      layer,
    };

  const mapBase = useAppSelector((state) => {
    const kinds = layerKindsSelector(state);

    return state.map.layers.find((type) => kinds.get(type) === 'base') ?? 'X';
  });

  // Restored when Base is picked again after Overlay.
  const [lastBase, setLastBase] = useState(() => value.base ?? mapBase);

  // The pickers offer an uninstalled library map only as the base already in it.
  const pickable = defs.filter(
    (def) =>
      !(def.type in mapIndexById) ||
      def.type === value.base ||
      isLayerOffered(layersSettings, layers, def.type),
  );

  const addableOverlays = pickable.filter(
    (def) =>
      def.layer === 'overlay' &&
      isCombinable(def.type) &&
      !value.overlays.some((overlay) => overlay.type === def.type),
  );

  return (
    <div>
      <div className="d-flex gap-3 align-items-end">
        <Form.Group controlId="combinationName" className="flex-grow-1 min-w-0">
          <Form.Label className="required">{m?.general.name}</Form.Label>

          <Form.Control
            type="text"
            value={value.name}
            onChange={(e) =>
              onChange({ ...value, name: e.currentTarget.value })
            }
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="d-block" htmlFor="combinationIcon">
            {m?.general.icon}
          </Form.Label>

          <IconPicker
            id="combinationIcon"
            selected={value.iconSpec}
            onSelect={(iconSpec) => onChange({ ...value, iconSpec })}
            placeholder={CUSTOM_MAP_ICONS.combination}
          />
        </Form.Group>
      </div>

      <CustomMapTypeField
        value="combination"
        editing={editing}
        onChange={(kind) => {
          if (kind !== 'combination') {
            onPickTechnology({
              name: value.name,
              iconSpec: value.iconSpec,
              technology: kind,
            });
          }
        }}
      />

      <Form.Group className="mt-3">
        <Form.Label className="d-block">{m?.mapLayers.layer.layer}</Form.Label>

        <ButtonGroup>
          {(['base', 'overlay'] as const).map((layer) => (
            <ToggleButton
              key={layer}
              id={`combination-layer-${layer}`}
              type="radio"
              name="combination-layer"
              variant="outline-primary"
              value={layer}
              checked={(value.base === undefined) === (layer === 'overlay')}
              onChange={() => {
                if (layer === 'overlay') {
                  if (value.base !== undefined) {
                    setLastBase(value.base);
                  }

                  onChange({ ...value, base: undefined });
                } else {
                  onChange({ ...value, base: value.base ?? lastBase });
                }
              }}
            >
              {m?.mapLayers.layer[layer]}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Form.Group>

      {value.base !== undefined && (
        <Form.Group className="mt-3">
          <Form.Label>{msm?.baseMap}</Form.Label>

          <LayerPicker
            defs={pickable.filter((def) => def.layer === 'base')}
            onSelect={(base) => onChange({ ...value, base })}
          >
            <MapLayerItem def={defOf(value.base, 'base')} />
          </LayerPicker>
        </Form.Group>
      )}

      <Form.Group className="mt-3">
        <Form.Label>{msm?.overlays}</Form.Label>

        {value.overlays.length === 0 ? (
          <p className="text-muted">{msm?.noOverlays}</p>
        ) : (
          <ListGroup className="mb-2">
            {value.overlays.map((overlay) => {
              const opacity = resolveLayerOpacity(
                integratedLayerDefMap[overlay.type],
                overlay.opacity,
              );

              return (
                <ListGroup.Item
                  key={overlay.type}
                  className="d-flex flex-wrap align-items-center gap-2 pe-2"
                >
                  <div className="flex-grow-1 min-w-0">
                    <MapLayerItem def={defOf(overlay.type, 'overlay')} />
                  </div>

                  <OpacityButton
                    value={opacity}
                    onChange={(opacity) =>
                      onChange({
                        ...value,
                        overlays: value.overlays.map((o) =>
                          o.type === overlay.type ? { ...o, opacity } : o,
                        ),
                      })
                    }
                  />

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      onChange({
                        ...value,
                        overlays: value.overlays.filter(
                          (o) => o.type !== overlay.type,
                        ),
                      })
                    }
                  >
                    <FaTimes />
                  </Button>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}

        {addableOverlays.length > 0 && (
          <LayerPicker
            defs={addableOverlays}
            onSelect={(type) =>
              type &&
              onChange({
                ...value,
                // Stored, or the user's own setting would show through.
                overlays: [
                  ...value.overlays,
                  {
                    type,
                    opacity: resolveLayerOpacity(
                      integratedLayerDefMap[type],
                      undefined,
                    ),
                  },
                ],
              })
            }
          >
            {msm?.addOverlay}
          </LayerPicker>
        )}

        {!isWorthSaving(value) && (
          <Form.Text className="d-block text-warning">
            {msm?.combinationTooSmall}
          </Form.Text>
        )}
      </Form.Group>
    </div>
  );
}
