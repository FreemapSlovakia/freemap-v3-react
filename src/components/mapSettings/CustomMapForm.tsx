import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Form } from 'react-bootstrap';
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
};

export function CustomMapForm({ type, value, onChange }: Props): ReactElement {
  function valueToModel(value?: CustomLayerDef) {
    return {
      url: value?.url ?? '',
      name: value?.name ?? '',
      minZoom: !value
        ? ''
        : value.minZoom === undefined
          ? ''
          : value.minZoom.toString(),
      maxNativeZoom: !value
        ? ''
        : value.maxNativeZoom === undefined
          ? ''
          : value.maxNativeZoom.toString(),
      layer: value?.layer ?? 'base',
      zIndex: !value
        ? ''
        : value.zIndex === undefined
          ? ''
          : value.zIndex.toString(),
      scaleWithDpi: value?.scaleWithDpi ?? false,
      extraScales: (value?.extraScales ?? []).map((a) => a.toString()),
    };
  }

  const [model, setModel] = useState<Model>(valueToModel(value));

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
      model.extraScales.join('|') !== newModel.extraScales.join('|')
        ? newModel
        : model,
    );
  }, [value]);

  const update = useCallback(
    (model: Model) => {
      setModel(model);

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
              layer: type.startsWith('.') ? 'base' : 'overlay',
              technology: 'tile',
              name: model.name,
              url: model.url,
              minZoom,
              maxNativeZoom,
              zIndex,
              scaleWithDpi: model.scaleWithDpi,
              extraScales: model.extraScales
                .map((a) => parseInt(a, 10))
                .filter((a) => !isNaN(a)),
            },
      );
    },
    [type, onChange],
  );

  const setUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const url = e.currentTarget.value;

      update({ ...model, url });
    },
    [update, model],
  );

  const setName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const name = e.currentTarget.value;

      update({ ...model, name });
    },
    [update, model],
  );

  const setMinZoom = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const minZoom = e.currentTarget.value;

      update({ ...model, minZoom });
    },
    [update, model],
  );

  const setMaxNativeZoom = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const maxNativeZoom = e.currentTarget.value;

      update({ ...model, maxNativeZoom });
    },
    [update, model],
  );

  const setLayer = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const layer = e.currentTarget.value as 'base';

      update({ ...model, layer });
    },
    [update, model],
  );

  const setZIndex = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const zIndex = e.currentTarget.value;

      update({ ...model, zIndex });
    },
    [update, model],
  );

  const setScaleWithDpi = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const scaleWithDpi = e.currentTarget.checked;

      update({ ...model, scaleWithDpi });
    },
    [update, model],
  );

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
        className="mt-3 d-flex align-items-end"
        style={{ gridColumn: '1 / -1' }}
      >
        {m?.general.name}
      </Form.Label>

      <Form.Control
        style={{ gridColumn: '1 / -1' }}
        type="text"
        value={model.name}
        onChange={setName}
      />

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
        onChange={setUrl}
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
        onChange={setMinZoom}
      />

      <Form.Control
        type="number"
        min={0}
        value={model.maxNativeZoom}
        onChange={setMaxNativeZoom}
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
              update({
                ...model,
                extraScales: extraScales.filter(Boolean),
              });
            }}
          />
        ))}
      </div>

      <div className="d-flex align-items-center">
        <Form.Check
          id="chk-scale-dpi"
          label={m?.mapLayers.scaleWithDpi}
          checked={model.scaleWithDpi}
          onChange={setScaleWithDpi}
        />
      </div>

      {/* Layer */}
      <Form.Label className="mt-3 d-flex align-items-end">
        {m?.mapLayers.layer}
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

      <Form.Select value={model.layer} onChange={setLayer}>
        <option value="base">Base</option>
        <option value="overlay">Overlay</option>
      </Form.Select>

      <Form.Control
        className={model.layer === 'overlay' ? 'visible' : 'invisible'}
        type="number"
        min={0}
        value={model.zIndex}
        onChange={setZIndex}
      />
    </div>
  );
}
