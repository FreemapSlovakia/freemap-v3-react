/* eslint-disable react/jsx-handler-names */
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useModelChangeHandlers } from '../../hooks/useModelChangeHandlers.js';
import { useMessages } from '../../l10nInjector.js';
import { CustomLayerDef } from '../../mapDefinitions.js';

type Props = {
  type: string;
  value?: CustomLayerDef;
  onChange: (value?: CustomLayerDef) => void;
};

type Model = {
  name: string;
  url: string;
  minZoom: string;
  maxNativeZoom: string;
  layer: 'base' | 'overlay';
  zIndex: string;
  scaleWithDpi: boolean;
  extraScales: string[];
  technology: 'tile' | 'maplibre' | 'wms' | 'parametricShading';
};

export function CustomMapForm({ type, value, onChange }: Props): ReactElement {
  function valueToModel(value?: CustomLayerDef) {
    return {
      url: value?.url ?? '',
      name: value?.name ?? '',
      minZoom: value?.minZoom === undefined ? '' : value.minZoom.toString(),
      maxNativeZoom:
        value?.maxNativeZoom === undefined
          ? ''
          : value.maxNativeZoom.toString(),
      layer: value?.layer ?? 'base',
      zIndex: value?.zIndex === undefined ? '' : value.zIndex.toString(),
      scaleWithDpi: value?.scaleWithDpi ?? false,
      extraScales: (value?.extraScales ?? []).map((a) => a.toString()),
      technology: value?.technology ?? 'tile',
    };
  }

  const [model, setModel] = useState<Model>(() => valueToModel(value));

  const handlers = useModelChangeHandlers(setModel);

  // const prevType = useRef(type);

  useEffect(() => {
    if (!value) {
      return;
    }

    const newModel = valueToModel(value);

    setModel((model) =>
      model.name !== newModel.name ||
      model.url !== newModel.url ||
      model.minZoom !== newModel.minZoom ||
      model.maxNativeZoom !== newModel.maxNativeZoom ||
      model.zIndex !== newModel.zIndex ||
      model.scaleWithDpi !== newModel.scaleWithDpi ||
      model.extraScales.join('|') !== newModel.extraScales.join('|') ||
      model.technology !== newModel.technology ||
      model.layer !== newModel.layer
        ? newModel
        : model,
    );
  }, [type]);

  useEffect(() => {
    const minZoom = model.minZoom ? parseInt(model.minZoom, 10) : undefined;

    if (minZoom !== undefined && isNaN(minZoom)) {
      return;
    }

    const maxNativeZoom = model.maxNativeZoom
      ? parseInt(model.maxNativeZoom, 10)
      : undefined;

    if (maxNativeZoom !== undefined && isNaN(maxNativeZoom)) {
      return;
    }

    const zIndex = model.zIndex ? parseInt(model.zIndex, 10) : undefined;

    if (zIndex !== undefined && isNaN(zIndex)) {
      return;
    }

    if (!model.url) {
      onChange(undefined);

      return;
    }

    onChange(
      !model.url
        ? undefined
        : {
            type,
            technology: model.technology as 'tile',
            name: model.name,
            url: model.url,
            layer: model.layer,
            minZoom,
            maxNativeZoom,
            zIndex,
            scaleWithDpi: model.scaleWithDpi,
            extraScales: model.extraScales
              .map((a) => parseInt(a, 10))
              .filter((a) => !isNaN(a)),
          },
    );
  }, [type, model]);

  const m = useMessages();

  return (
    <div
      className="d-grid"
      style={{
        columnGap: '1rem',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'stretch',
      }}
    >
      {/* Name */}

      <Form.Label
        className="d-flex align-items-end"
        style={{ gridColumn: '1 / -1' }}
      >
        {m?.general.name}
      </Form.Label>

      <Form.Control
        style={{ gridColumn: '1 / -1' }}
        type="text"
        value={model.name}
        onChange={handlers.name}
      />

      {/* Technology */}

      <Form.Label
        className="mt-3 d-flex align-items-end"
        style={{ gridColumn: '1 / -1' }}
      >
        Technology
      </Form.Label>

      <Form.Select
        style={{ gridColumn: '1 / -1' }}
        value={model.technology}
        onChange={handlers.technology}
      >
        <option value="tile">Tile (TMS, XYZ)</option>
        <option value="maplibre">Vector</option>
        <option value="wms">WMS</option>
        <option value="parametricShading">Parametric shading</option>
      </Form.Select>

      {/* URL */}

      <Form.Label
        className="mt-3 d-flex align-items-end"
        style={{ gridColumn: '1 / -1' }}
      >
        {m?.mapLayers.urlTemplate}
      </Form.Label>

      <Form.Control
        style={{ gridColumn: '1 / -1' }}
        type="text"
        value={model.url}
        onChange={handlers.url}
      />

      {/* Min/Max zoom */}

      <Form.Label className="mt-3 d-flex align-items-end">
        {m?.mapLayers.minZoom}
      </Form.Label>

      <Form.Label className="mt-3 d-flex align-items-end">
        {m?.mapLayers.maxNativeZoom}
      </Form.Label>

      <Form.Control
        type="number"
        min={0}
        value={model.minZoom}
        onChange={handlers.minZoom}
      />

      <Form.Control
        type="number"
        min={0}
        value={model.maxNativeZoom}
        onChange={handlers.maxNativeZoom}
      />

      {/* Extra scales + checkbox */}
      <Form.Label className="mt-3 d-flex align-items-end">
        {m?.mapLayers.extraScales}
      </Form.Label>

      <Form.Label className="mt-3 d-flex align-items-end">&nbsp;</Form.Label>

      <div className="d-flex gap-2 flex-wrap">
        {[...model.extraScales, ''].map((a, i) => (
          <Form.Control
            style={{ width: '4rem' }}
            key={i}
            type="number"
            min={1}
            step={1}
            value={a}
            onChange={(e) => {
              const extraScales = [...model.extraScales];
              extraScales[i] = e.currentTarget.value;
              setModel((model) => ({
                ...model,
                extraScales: extraScales.filter(Boolean),
              }));
            }}
          />
        ))}
      </div>

      <div className="d-flex align-items-center">
        <Form.Check
          id="chk-scale-dpi"
          label={m?.mapLayers.scaleWithDpi}
          checked={model.scaleWithDpi}
          onChange={handlers.scaleWithDpi}
        />
      </div>

      {/* Layer */}
      <Form.Label className="mt-3 d-flex align-items-end">
        {m?.mapLayers.layer.layer}
      </Form.Label>

      {/* Z-Index */}
      <Form.Label
        className={
          `mt-3 d-flex align-items-end ` +
          (model.layer === 'overlay' ? 'visible' : 'invisible')
        }
      >
        {m?.mapLayers.zIndex}
      </Form.Label>

      <Form.Select value={model.layer} onChange={handlers.layer}>
        <option value="base">{m?.mapLayers.layer.base}</option>
        <option value="overlay">{m?.mapLayers.layer.overlay}</option>
      </Form.Select>

      <Form.Control
        className={model.layer === 'overlay' ? 'visible' : 'invisible'}
        type="number"
        min={0}
        value={model.zIndex}
        onChange={handlers.zIndex}
      />
    </div>
  );
}
