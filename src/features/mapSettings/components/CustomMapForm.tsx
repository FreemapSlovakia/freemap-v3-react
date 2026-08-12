/* eslint-disable react/jsx-handler-names */
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useBreakpointMatches } from '@shared/breakpoints.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useModelChangeHandlers } from '@shared/hooks/useModelChangeHandlers.js';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { type Layer, wms } from '@shared/wms.js';
import clsx from 'clsx';
import {
  type ChangeEvent,
  Fragment,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  ListGroup,
  ListGroupItem,
  Spinner,
  ToggleButton,
} from 'react-bootstrap';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import classes from './CustomMapForm.module.css';

type Props = {
  type: string;
  value?: CustomLayerDef;
  onChange: (value?: CustomLayerDef) => void;
};

type Model = {
  name: string;
  iconSpec?: string;
  url: string;
  minZoom: string;
  maxNativeZoom: string;
  layer: 'base' | 'overlay';
  zIndex: string;
  scaleWithDpi: boolean;
  extraScales: string[];
  technology: 'tile' | 'maplibre' | 'wms' | 'parametricShading';
  layers: string[];
  tiled: boolean;
  /** Read from the capabilities rather than typed, so it has no field. */
  bbox?: [number, number, number, number];
};

/** Ground resolution of zoom 0 at the equator, in metres per pixel. */
const ZOOM_0_RESOLUTION = 156543.03392804097;

/** The pixel size a WMS scale denominator is defined against, in metres. */
const WMS_PIXEL_SIZE = 0.00028;

function flatten(layers: Layer[]): Layer[] {
  return layers.flatMap((layer) => [layer, ...flatten(layer.children)]);
}

/**
 * The smallest zoom at which a layer is still drawn: a WMS declares the widest
 * scale it renders at as `MaxScaleDenominator`, and asking for anything wider
 * returns an empty image, which is indistinguishable from a broken layer. The
 * scale a zoom level works out to depends on the latitude it is read at, so the
 * answer holds for where the map currently is rather than for the equator.
 */
function minZoomForSelection(
  layers: Layer[],
  selected: string[],
  lat: number,
): number {
  const flat = flatten(layers);

  const resolution = ZOOM_0_RESOLUTION * Math.cos((lat * Math.PI) / 180);

  const zooms = flat
    .filter((layer) => layer.name && selected.includes(layer.name))
    .map((layer) =>
      layer.maxScale
        ? Math.max(
            0,
            Math.ceil(
              Math.log2(resolution / (WMS_PIXEL_SIZE * layer.maxScale)),
            ),
          )
        : 0,
    );

  // The map is only blank while every one of the chosen layers is.
  return zooms.length ? Math.min(...zooms) : 0;
}

/** The area the chosen layers cover between them, as [west, south, east, north]. */
function bboxForSelection(
  layers: Layer[],
  selected: string[],
): [number, number, number, number] | undefined {
  const matched = flatten(layers).filter(
    (layer) => layer.name && selected.includes(layer.name) && layer.bbox,
  );

  const boxes = matched.flatMap((layer) => (layer.bbox ? [layer.bbox] : []));

  // Only when every one of them declares an area: a layer that doesn't may
  // cover ground the others leave out, and a box short of the coverage would
  // have the map offer to fly away from a layer that is drawing. Counted by
  // name, since one may appear at more than one place in the tree.
  const covered = new Set(matched.map((layer) => layer.name));

  return boxes.length && covered.size === selected.length
    ? [
        Math.min(...boxes.map((b) => b[0])),
        Math.min(...boxes.map((b) => b[1])),
        Math.max(...boxes.map((b) => b[2])),
        Math.max(...boxes.map((b) => b[3])),
      ]
    : undefined;
}

function valueToModel(value?: CustomLayerDef) {
  return {
    url: value?.url ?? '',
    name: value?.name ?? '',
    iconSpec: value?.iconSpec,
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
    tiled: value && 'tiled' in value && value.tiled ? value.tiled : false,
    bbox: value?.bbox,
    technology: value?.technology ?? 'tile',
  };
}

export function CustomMapForm({ type, value, onChange }: Props): ReactElement {
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

  const handleIconSelect = useCallback(
    (iconSpec: string | undefined) => {
      setModelWithVersion((model) => ({ ...model, iconSpec }));
    },
    [setModelWithVersion],
  );

  useEffect(() => {
    if (!value || externalVersion.current < localVersion.current) {
      return;
    }

    const newModel = valueToModel(value);

    setModel((model) => {
      const changed =
        model.name !== newModel.name ||
        model.iconSpec !== newModel.iconSpec ||
        model.url !== newModel.url ||
        model.minZoom !== newModel.minZoom ||
        model.maxNativeZoom !== newModel.maxNativeZoom ||
        model.zIndex !== newModel.zIndex ||
        model.scaleWithDpi !== newModel.scaleWithDpi ||
        model.extraScales.join('|') !== newModel.extraScales.join('|') ||
        model.technology !== newModel.technology ||
        model.tiled !== newModel.tiled ||
        model.bbox?.join(',') !== newModel.bbox?.join(',') ||
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

    if (minZoom !== undefined && Number.isNaN(minZoom)) {
      return;
    }

    const maxNativeZoom = model.maxNativeZoom
      ? parseInt(model.maxNativeZoom, 10)
      : undefined;

    if (maxNativeZoom !== undefined && Number.isNaN(maxNativeZoom)) {
      return;
    }

    const zIndex = model.zIndex ? parseInt(model.zIndex, 10) : undefined;

    if (zIndex !== undefined && Number.isNaN(zIndex)) {
      return;
    }

    if (!model.url) {
      onChange(undefined);

      return;
    }

    const common = {
      type,
      name: model.name,
      iconSpec: model.iconSpec,
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
            .filter((a) => !Number.isNaN(a)),
        });

        break;
      case 'wms':
        onChange({
          ...common,
          technology: 'wms',
          url: model.url,
          minZoom,
          maxNativeZoom,
          layers: model.layers,
          tiled: model.tiled,
          // Read from the capabilities, so it goes no further than the
          // technology that has any: switching to another must not leave a
          // WMS's coverage describing a worldwide tile layer.
          bbox: model.bbox,
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

  // The technology labels are long enough that their joined group can't fit a
  // phone, so below `sm` it stacks instead of widening the form.
  const { sm } = useBreakpointMatches();

  const [wmsLayersFetchError, setWmsLayersFetchError] = useState<string>();

  useEffect(() => {
    setWmsLayersFetchError(undefined);
  }, []);

  const [layersTree, setLayersTree] = useState<Layer[]>();

  const lat = useAppSelector((state) => state.map.lat);

  /** Whether Min Zoom is the user's to keep rather than the form's to fill. */
  const minZoomTouched = useRef(model.minZoom !== '');

  const handleMinZoomChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      minZoomTouched.current = true;

      handlers.minZoom(e);
    },
    [handlers],
  );

  const [loadingLayers, setLoadingLayers] = useState(false);

  const handleLoadLayersClick = useCallback(() => {
    setLoadingLayers(true);

    wms(model.url)
      .then(
        ({ layersTree, title }) => {
          setLayersTree(layersTree);

          // What the capabilities decide — the coverage, and the zoom below
          // which nothing is drawn — is taken for the layers already chosen
          // too. A map saved before the server was ever asked would otherwise
          // keep neither until its layers were picked over again.
          const zoom = minZoomForSelection(layersTree, model.layers, lat);

          setModel({
            ...model,
            name: model.name || title,
            bbox: bboxForSelection(layersTree, model.layers),
            minZoom: minZoomTouched.current
              ? model.minZoom
              : zoom
                ? String(zoom)
                : '',
          });
        },
        (err) => setWmsLayersFetchError(String(err)),
      )
      .finally(() => {
        setLoadingLayers(false);
      });
  }, [model, lat]);

  useEffect(() => {
    setLayersTree(undefined);
  }, []);

  const handleLayerSelect = useCallback(
    (name: string | null) => {
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

        const zoom = minZoomForSelection(layersTree ?? [], next, lat);

        const bbox = bboxForSelection(layersTree ?? [], next);

        // Offered rather than imposed: the suggestion follows the selection —
        // dropping the layer that produced it must not leave the next one
        // hidden below a limit it never had — but a field the user has been at,
        // including one they cleared on purpose, is theirs from then on.
        return {
          ...model,
          layers: next,
          bbox,
          minZoom: minZoomTouched.current
            ? model.minZoom
            : zoom
              ? String(zoom)
              : '',
        };
      });
    },
    [layersTree, lat],
  );

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

            <span className={clsx(layer.children.length === 0 && 'ms-4')}>
              {layer.title}
            </span>
          </ListGroupItem>

          {layer.children.length > 0 ? (
            <div
              className={clsx(
                classes.listGroupNested,
                expanded.includes(id) || 'd-none',
              )}
            >
              {renderLayers(layer.children, [...path, i])}
            </div>
          ) : null}
        </Fragment>
      );
    });
  }

  return (
    <div>
      <div className="d-flex gap-3 align-items-end">
        <Form.Group controlId="name" className="flex-grow-1 min-w-0">
          <Form.Label
            className={clsx('d-flex', 'align-items-end', classes.gridSpan)}
          >
            {m?.general.name}
          </Form.Label>

          <Form.Control
            className={classes.gridSpan}
            type="text"
            value={model.name}
            onChange={handlers.name}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="d-block" htmlFor="customMapIcon">
            {m?.general.icon}
          </Form.Label>

          <IconPicker
            id="customMapIcon"
            selected={model.iconSpec}
            onSelect={handleIconSelect}
            placeholder={<MdDashboardCustomize />}
          />
        </Form.Group>
      </div>

      <Form.Group className="mt-3">
        <Form.Label className="d-block">{m?.mapLayers.technology}</Form.Label>

        <ButtonGroup vertical={!sm}>
          {(['tile', 'maplibre', 'wms'] as const).map((technology) => (
            <ToggleButton
              key={technology}
              id={`tech-${technology}`}
              type="radio"
              name="technology"
              variant="outline-primary"
              value={technology}
              checked={model.technology === technology}
              onChange={handlers.technology}
            >
              {m?.mapLayers.technologies[technology]}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Form.Group>

      {/* URL */}
      {model.technology !== 'parametricShading' && (
        <Form.Group controlId="url" className="mt-3">
          <Form.Label>{m?.mapLayers.url}</Form.Label>

          <Form.Control
            className={classes.gridSpan}
            type="text"
            value={model.url}
            onChange={handlers.url}
          />
        </Form.Group>
      )}

      {model.technology === 'wms' && (
        <>
          <Button
            className={clsx('mt-3', classes.gridSpan)}
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
            <Alert className={clsx('mt-3', classes.gridSpan)} variant="danger">
              {wmsLayersFetchError}
            </Alert>
          )}

          <ListGroup
            className={clsx('mt-3', classes.gridSpan, 'overflow-auto')}
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
          <Form.Group controlId="minZoom" className="mt-3">
            <Form.Label>{m?.mapLayers.minZoom}</Form.Label>

            <Form.Control
              type="number"
              min={0}
              value={model.minZoom}
              onChange={handleMinZoomChange}
            />
          </Form.Group>

          <Form.Group controlId="maxNativeZoom" className="mt-3">
            <Form.Label>{m?.mapLayers.maxNativeZoom}</Form.Label>

            <Form.Control
              type="number"
              min={0}
              value={model.maxNativeZoom}
              onChange={handlers.maxNativeZoom}
            />
          </Form.Group>

          {/* Extra scales + checkbox */}
          {model.technology === 'tile' && (
            <div className="mt-3">
              <Form.Label>{m?.mapLayers.extraScales}</Form.Label>

              <div className="d-flex gap-2 flex-wrap">
                {model.technology === 'tile' &&
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
                  ))}
              </div>
            </div>
          )}

          {/* A WMS is always asked for the display's own density. */}
          {model.technology !== 'wms' && (
            <Form.Check
              className="mt-3"
              id="chk-scale-dpi"
              label={m?.mapLayers.scaleWithDpi}
              checked={model.scaleWithDpi}
              onChange={handlers.scaleWithDpi}
            />
          )}

          {model.technology === 'wms' && (
            <div className="mt-3">
              <Form.Check
                id="chk-tiled"
                label={m?.mapLayers.tiled}
                checked={model.tiled}
                onChange={handlers.tiled}
              />

              <Form.Text>{m?.mapLayers.tiledHelp}</Form.Text>
            </div>
          )}
        </>
      )}

      <Form.Group className="mt-3">
        <Form.Label className="d-block">{m?.mapLayers.layer.layer}</Form.Label>

        <ButtonGroup>
          {(['base', 'overlay'] as const).map((layer) => (
            <ToggleButton
              key={layer}
              id={`layer-${layer}`}
              type="radio"
              name="layer"
              variant="outline-primary"
              value={layer}
              checked={model.layer === layer}
              onChange={handlers.layer}
            >
              {m?.mapLayers.layer[layer]}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Form.Group>

      {model.layer === 'overlay' && (
        <Form.Group controlId="zIndex" className="mt-3">
          <Form.Label>{m?.mapLayers.zIndex}</Form.Label>

          <Form.Control
            className={model.layer === 'overlay' ? 'visible' : 'invisible'}
            type="number"
            min={0}
            value={model.zIndex}
            onChange={handlers.zIndex}
          />
        </Form.Group>
      )}
    </div>
  );
}
