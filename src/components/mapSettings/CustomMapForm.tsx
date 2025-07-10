import { CustomLayerDef, CustomLayerLetters } from 'mapDefinitions.js';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useMessages } from '../../l10nInjector.js';

type Props = {
  type: CustomLayerLetters;
  value?: CustomLayerDef;
  onChange: (value?: CustomLayerDef) => void;
};

type Model = {
  url: string;
  minZoom: string;
  maxNativeZoom: string;
  zIndex: string;
  scaleWithDpi: boolean;
  extraScales: string[];
};

export function CustomMapForm({ type, value, onChange }: Props): ReactElement {
  function valueToModel(value?: CustomLayerDef) {
    return {
      url: value?.url ?? '',
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
    <Stack gap={3}>
      <Form.Group controlId="url">
        <Form.Label>{m?.mapLayers.urlTemplate}</Form.Label>

        <Form.Control type="text" value={model.url} onChange={setUrl} />
      </Form.Group>

      <Stack direction="horizontal" gap={2}>
        <Form.Group controlId="minZoom">
          <Form.Label>{m?.mapLayers.minZoom}</Form.Label>

          <Form.Control
            type="number"
            min={0}
            value={model.minZoom}
            onChange={setMinZoom}
          />
        </Form.Group>

        <Form.Group controlId="maxNativeZoom" className="w-50">
          <Form.Label>{m?.mapLayers.maxNativeZoom}</Form.Label>

          <Form.Control
            type="number"
            min={0}
            value={model.maxNativeZoom}
            onChange={setMaxNativeZoom}
          />
        </Form.Group>
      </Stack>

      <Stack direction="horizontal" gap={2}>
        <Form.Group controlId="extraScales">
          <Form.Label>{m?.mapLayers.extraScales}</Form.Label>

          <div className="d-flex gap-2 flex-wrap">
            {[...model.extraScales, ''].map((a, i) => (
              <Form.Control
                key={i}
                style={{ width: '4rem' }}
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
        </Form.Group>

        <Form.Group className="w-50">
          <Form.Label>&nbsp;</Form.Label>

          <Form.Check
            id="chk-scale-dpi"
            label={m?.mapLayers.scaleWithDpi}
            checked={model.scaleWithDpi}
            onChange={setScaleWithDpi}
          />
        </Form.Group>
      </Stack>

      {type.startsWith(':') ? (
        <Form.Group controlId="zIndex">
          <Form.Label>{m?.mapLayers.zIndex}</Form.Label>

          <Form.Control
            type="number"
            min={0}
            value={model.zIndex}
            onChange={setZIndex}
          />
        </Form.Group>
      ) : undefined}
    </Stack>
  );
}
