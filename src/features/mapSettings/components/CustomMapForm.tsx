/* eslint-disable react/jsx-handler-names */
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Form,
  ListGroup,
  ListGroupItem,
  Spinner,
} from 'react-bootstrap';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { useModelChangeHandlers } from '../../../hooks/useModelChangeHandlers.js';
import { type CustomLayerDef } from '../../../shared/mapDefinitions.js';
import { type Layer, wms } from '../../../wms.js';

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
  layers: string[];
};

export function CustomMapForm({ type, value, onChange }: Props): ReactElement {
  function valueToModel(value?: CustomLayerDef) {
    return {
      url: value?.url ?? '',
      name: value?.name ?? '',
      minZoom: value?.minZoom === undefined ? '' : value.minZoom.toString(),
      maxNativeZoom:
        value && 'maxNativeZoom' in value && value.maxNativeZoom !== undefined
          ? value.maxNativeZoom.toString()
          : '',
      layer: value?.layer ?? 'base',
      zIndex:
        value && 'zIndex' in value && value.zIndex !== undefined
          ? value.zIndex.toString()
          : '',
      scaleWithDpi:
        value && 'scaleWithDpi' in value && value.scaleWithDpi
          ? value.scaleWithDpi
          : false,
      extraScales:
        value && 'extraScales' in value && value.extraScales
          ? value.extraScales.map((a) => a.toString())
          : [],
      layers: value && 'layers' in value && value.layers ? value.layers : [],
      technology: value?.technology ?? 'tile',
    };
  }

  const [model, setModel] = useState<Model>(() => valueToModel(value));

  const localVersion = useRef(0);

  const externalVersion = useRef(0);

  const incrementVersion = useRef(() => {
    localVersion.current++;
  });

  const setModelWithVersion = useCallback((updater: (prev: Model) => Model) => {
    incrementVersion.current();

    setModel(updater);
  }, []);

  const handlers = useModelChangeHandlers(setModelWithVersion);

  useEffect(() => {
    if (!value || externalVersion.current < localVersion.current) {
      return;
    }

    const newModel = valueToModel(value);

    setModel((model) => {
      const changed =
        model.name !== newModel.name ||
        model.url !== newModel.url ||
        model.minZoom !== newModel.minZoom ||
        model.maxNativeZoom !== newModel.maxNativeZoom ||
        model.zIndex !== newModel.zIndex ||
        model.scaleWithDpi !== newModel.scaleWithDpi ||
        model.extraScales.join('|') !== newModel.extraScales.join('|') ||
        model.technology !== newModel.technology ||
        model.layer !== newModel.layer;

      if (changed) {
        externalVersion.current++;

        return newModel;
      }

      return model;
    });
  }, [value]);

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

    const common = {
      type,
      name: model.name,
      layer: model.layer,
      zIndex,
    };

    switch (model.technology) {
      case 'tile':
        onChange({
          ...common,
          technology: 'tile',
          url: model.url,
          minZoom,
          maxNativeZoom,
          scaleWithDpi: model.scaleWithDpi,
          extraScales: model.extraScales
            .map((a) => parseInt(a, 10))
            .filter((a) => !isNaN(a)),
        });

        break;
      case 'wms':
        onChange({
          ...common,
          technology: 'wms',
          url: model.url,
          minZoom,
          maxNativeZoom,
          scaleWithDpi: model.scaleWithDpi,
          layers: model.layers,
        });

        break;
      case 'maplibre':
        onChange({
          ...common,
          technology: 'maplibre',
          url: model.url,
          minZoom,
        });

        break;
      case 'parametricShading':
        onChange({
          ...common,
          technology: 'parametricShading',
          url: model.url,
          minZoom,
          maxNativeZoom,
          scaleWithDpi: model.scaleWithDpi,
        });

        break;
    }
  }, [type, model, onChange]);

  const m = useMessages();

  const [wmsLayersFetchError, setWmsLayersFetchError] = useState<string>();

  useEffect(() => {
    setWmsLayersFetchError(undefined);
  }, [model]);

  const [layersTree, setLayersTree] = useState<Layer[]>();

  const [loadingLayers, setLoadingLayers] = useState(false);

  const handleLoadLayersClick = useCallback(() => {
    setLoadingLayers(true);

    wms(model.url)
      .then(
        ({ layersTree, title }) => {
          setLayersTree(layersTree);

          setModel({ ...model, name: model.name || title });
        },
        (err) => setWmsLayersFetchError(String(err)),
      )
      .finally(() => {
        setLoadingLayers(false);
      });
  }, [model]);

  useEffect(() => {
    setLayersTree(undefined);
  }, [model.url]);

  const handleLayerSelect = useCallback((name: string | null) => {
    if (name === null) {
      return;
    }

    setModel((model) => {
      let found = false;

      const next = model.layers.filter((n) => {
        found ||= n === name;

        return n !== name;
      });

      if (!found) {
        next.push(name);
      }

      return { ...model, layers: next };
    });
  }, []);

  const [expanded, setExpanded] = useState<string[]>([]);

  function renderLayers(layers: Layer[] | undefined, path: number[] = []) {
    return layers?.map((layer, i) => {
      const id = [...path, i].join(',');

      return (
        <Fragment key={id}>
          <ListGroupItem
            eventKey={layer.name ?? undefined}
            active={layer.name ? model.layers.includes(layer.name) : undefined}
            action={layer.name !== null}
            as={
              layer.children.length > 0
                ? ('div' as unknown as 'button') // to add type
                : 'button'
            }
            type="button"
          >
            {path.map((_, i) => (
              <span key={i} className="ps-4" />
            ))}

            {layer.children.length > 0 && (
              <button
                className="border-0 bg-transparent ms-n2 mx-0"
                style={{ width: '2rem' }}
                type="button"
                data-name={id}
                onClick={(e) => {
                  e.stopPropagation();

                  setExpanded((prev) => {
                    let found = false;

                    const next = prev.filter((a) => {
                      found ||= a === id;

                      return a !== id;
                    });

                    if (!found) {
                      next.push(id);
                    }

                    return next;
                  });
                }}
              >
                {expanded.includes(id) ? <FaAngleDown /> : <FaAngleRight />}
              </button>
            )}

            <span className={layer.children.length === 0 ? 'ms-4' : ''}>
              {layer.title}
            </span>
          </ListGroupItem>

          {layer.children.length > 0 ? (
            <div
              className={`fm-list-group-nested ${expanded.includes(id) ? '' : 'd-none'}`}
            >
              {renderLayers(layer.children, [...path, i])}
            </div>
          ) : null}
        </Fragment>
      );
    });
  }

  return (
    <div
      className="d-grid align-items-stretch column-gap-3"
      style={{
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      {/* Name */}

      <Form.Label className="d-flex align-items-end fm-grid-span">
        {m?.general.name}
      </Form.Label>

      <Form.Control
        className="fm-grid-span"
        type="text"
        value={model.name}
        onChange={handlers.name}
      />

      {/* Technology */}

      <Form.Label className="mt-3 d-flex align-items-end fm-grid-span">
        {m?.mapLayers.technology}
      </Form.Label>

      <Form.Select
        className="fm-grid-span"
        value={model.technology}
        onChange={handlers.technology}
      >
        <option value="tile">{m?.mapLayers.technologies.tile}</option>
        <option value="maplibre">{m?.mapLayers.technologies.maplibre}</option>
        <option value="wms">{m?.mapLayers.technologies.wms}</option>
        {/* <option value="parametricShading">{m?.mapLayers.technologies.parametricShading}</option> */}
      </Form.Select>

      {/* URL */}
      {model.technology !== 'parametricShading' && (
        <>
          <Form.Label className="mt-3 d-flex align-items-end fm-grid-span">
            {m?.mapLayers.url}
          </Form.Label>

          <Form.Control
            className="fm-grid-span"
            type="text"
            value={model.url}
            onChange={handlers.url}
          />
        </>
      )}

      {model.technology === 'wms' && (
        <>
          <Button
            className="mt-3 fm-grid-span"
            type="button"
            onClick={handleLoadLayersClick}
            disabled={!model.url.match(/^https?:\/\/\w+/) || loadingLayers}
          >
            <Spinner className="invisible" size="sm" />

            <span className="mx-2">{m?.mapLayers.loadWmsLayers}</span>

            <Spinner
              className={loadingLayers ? 'visible' : 'invisible'}
              size="sm"
            />
          </Button>

          {wmsLayersFetchError && (
            <Alert className="mt-3 fm-grid-span" variant="danger">
              {wmsLayersFetchError}
            </Alert>
          )}

          <ListGroup
            className="mt-3 fm-grid-span overflow-auto"
            style={{ maxHeight: '400px' }}
            onSelect={handleLayerSelect}
          >
            {renderLayers(layersTree)}
          </ListGroup>
        </>
      )}

      {/* Min/Max zoom */}
      {model.technology !== 'parametricShading' && (
        <>
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
          {model.technology === 'tile' ? (
            <>
              <Form.Label className="mt-3 d-flex align-items-end">
                {m?.mapLayers.extraScales}
              </Form.Label>

              <Form.Label className="mt-3 d-flex align-items-end">
                &nbsp;
              </Form.Label>
            </>
          ) : (
            <div className="mt-3 fm-grid-span" />
          )}

          <div className="d-flex gap-2 flex-wrap">
            {model.technology === 'tile' ? (
              [...model.extraScales, ''].map((a, i) => (
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
              ))
            ) : (
              <>&nbsp;</>
            )}
          </div>

          <div className="d-flex align-items-center">
            <Form.Check
              id="chk-scale-dpi"
              label={m?.mapLayers.scaleWithDpi}
              checked={model.scaleWithDpi}
              onChange={handlers.scaleWithDpi}
            />
          </div>
        </>
      )}

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
