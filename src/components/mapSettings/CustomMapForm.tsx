import { CustomLayerDef, CustomLayerLetters } from 'mapDefinitions.js';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Form, Stack } from 'react-bootstrap';

type Props = {
  type: CustomLayerLetters;
  value?: CustomLayerDef;
  onChange: (value?: CustomLayerDef) => void;
};

type Model = { url: string; minZoom: string; maxNativeZoom: string };

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
      model.maxNativeZoom !== newModel.maxNativeZoom
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

  // const bases = [
  //   ...baseLayers,
  //   ...localCustomLayers
  //     .filter((cl) => cl.type.startsWith('.'))
  //     .map((cl) => ({
  //       ...cl,
  //       adminOnly: false,
  //       icon: <MdDashboardCustomize />,
  //       key: ['Digit' + cl.type.slice(1), false] as const,
  //     })),
  // ];

  // const ovls = [
  //   ...overlayLayers,
  //   ...localCustomLayers
  //     .filter((cl) => cl.type.startsWith(':'))
  //     .map((cl) => ({
  //       ...cl,
  //       adminOnly: false,
  //       icon: <MdDashboardCustomize />,
  //       key: ['Digit' + cl.type.slice(1), true] as const,
  //     })),
  // ];

  return (
    <Stack gap={3}>
      <Form.Group>
        <Form.Label>Template</Form.Label>
        <Form.Control type="text" value={model.url} onChange={setUrl} />
      </Form.Group>

      <Stack direction="horizontal" gap={2}>
        <Form.Group>
          <Form.Label>Min Zoom</Form.Label>
          <Form.Control
            type="number"
            min={0}
            value={model.minZoom}
            onChange={setMinZoom}
          />
        </Form.Group>

        <Form.Group className="w-50">
          <Form.Label>Max Native Zoom</Form.Label>
          <Form.Control
            type="number"
            min={0}
            value={model.maxNativeZoom}
            onChange={setMaxNativeZoom}
          />
        </Form.Group>
      </Stack>

      <Stack direction="horizontal" gap={2}>
        <Form.Group>
          <Form.Label>Extra scales</Form.Label>
          <Form.Control type="text" />
        </Form.Group>

        <Form.Group className="w-50">
          <Form.Label>&nbsp;</Form.Label>
          <Form.Check id="chk-scale-dpi" label="Scale with DPI" />
        </Form.Group>
      </Stack>

      {type.startsWith(':') ? (
        <Form.Group>
          <Form.Label>Z-Index</Form.Label>
          <Form.Control type="number" min={0} />
        </Form.Group>
      ) : undefined}
    </Stack>
  );
}
