import { hasRole } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  combinationLayers,
  isCombinable,
  isWorthSaving,
  type MapCombination,
} from '@features/map/model/mapCombination.js';
import { useShadingMessages } from '@features/parameterizedShading/translations/useShadingMessages.js';
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
  hasShadingLayer,
  integratedLayerDefMap,
  integratedLayerDefs,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import type { ReactElement, ReactNode } from 'react';
import { Button, Dropdown, Form, ListGroup } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { TbStack2 } from 'react-icons/tb';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import type { CustomMapStart } from './CustomMapForm.js';
import { CustomMapTypeField } from './CustomMapTypeField.js';

type Props = {
  value: MapCombination;
  editing: boolean;
  onChange: (value: MapCombination) => void;
  onPickTechnology: (start: CustomMapStart) => void;
};

/** The event key of the picker's "no layer" item. */
const NONE = '-';

function LayerPicker({
  defs,
  noneLabel,
  onSelect,
  children,
}: {
  defs: MapLayerItemDef[];
  /** Offers "no layer" first, which selects `undefined`. */
  noneLabel?: ReactNode;
  onSelect: (type: string | undefined) => void;
  children: ReactNode;
}): ReactElement {
  return (
    <Dropdown
      onSelect={(type) => type && onSelect(type === NONE ? undefined : type)}
    >
      <Dropdown.Toggle as={SelectToggle} className="w-100">
        {children}
      </Dropdown.Toggle>

      <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
        {noneLabel && (
          <Dropdown.Item as="button" type="button" eventKey={NONE}>
            {noneLabel}
          </Dropdown.Item>
        )}

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

  const sm = useShadingMessages();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  const defs: MapLayerItemDef[] = [
    ...integratedLayerDefs.filter(
      (def) => canPreviewLayers || !def.layerPreview,
    ),
    ...customLayers,
    ...cachedMaps.filter((cm) => cm.downloadedCount === cm.tileCount),
  ];

  const defOf = (type: string, layer: 'base' | 'overlay'): MapLayerItemDef =>
    defs.find((def) => def.type === type) ?? { type, layer };

  const addableOverlays = defs.filter(
    (def) =>
      def.layer === 'overlay' &&
      isCombinable(def.type) &&
      !value.overlays.some((overlay) => overlay.type === def.type),
  );

  const showsShading = hasShadingLayer(combinationLayers(value), customLayers);

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
            placeholder={<TbStack2 />}
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

      <p className="form-text">{msm?.combinationHint}</p>

      <Form.Group className="mt-3">
        <Form.Label>{msm?.baseMap}</Form.Label>

        <LayerPicker
          defs={defs.filter((def) => def.layer === 'base')}
          noneLabel={msm?.noBaseMap}
          onSelect={(base) => onChange({ ...value, base })}
        >
          {value.base === undefined ? (
            msm?.noBaseMap
          ) : (
            <MapLayerItem def={defOf(value.base, 'base')} />
          )}
        </LayerPicker>
      </Form.Group>

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
                  className="d-flex flex-wrap align-items-center gap-2"
                >
                  <div className="flex-grow-1 min-w-0">
                    <MapLayerItem def={defOf(overlay.type, 'overlay')} />
                  </div>

                  <Form.Range
                    className="w-auto flex-grow-1"
                    style={{ maxWidth: '10rem' }}
                    min={0}
                    max={100}
                    value={Math.round(opacity * 100)}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        overlays: value.overlays.map((o) =>
                          o.type === overlay.type
                            ? {
                                ...o,
                                opacity: Number(e.currentTarget.value) / 100,
                              }
                            : o,
                        ),
                      })
                    }
                  />

                  <span className="text-nowrap" style={{ minWidth: '3em' }}>
                    {Math.round(opacity * 100)}&nbsp;%
                  </span>

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

        {!isWorthSaving(value, customLayers) && (
          <Form.Text className="d-block text-warning">
            {msm?.combinationTooSmall}
          </Form.Text>
        )}
      </Form.Group>

      {showsShading && (
        <Form.Group className="mt-3">
          <Form.Label className="d-block">{msm?.shading}</Form.Label>

          {value.shading && (
            <div className="mb-1">
              {value.shading.components
                .map((c) => sm?.types[c.type] ?? c.type)
                .join(', ') || '—'}
            </div>
          )}

          <Form.Text>{msm?.shadingHint}</Form.Text>
        </Form.Group>
      )}
    </div>
  );
}
