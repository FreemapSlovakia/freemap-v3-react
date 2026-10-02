import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  CATEGORY_GROUPS,
  type CategoryGroup,
  categoryGroup,
} from '@features/mapLibrary/filters.js';
import { shadingSourceSelector } from '@features/mapLibrary/model/selectors.js';
import {
  type Color,
  colorToHexa,
  hexaToColor,
  type Shading,
} from '@features/parameterizedShading/model/Shading.js';
import { CUSTOM_MAP_ICONS } from '@shared/components/CustomMapGlyph.js';
import { HintMark } from '@shared/components/HintMark.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useModelChangeHandlers } from '@shared/hooks/useModelChangeHandlers.js';
import { type CustomLayerDef, SHADING_SOURCE } from '@shared/mapDefinitions.js';
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
  Col,
  Form,
  ListGroup,
  ListGroupItem,
  Row,
  Spinner,
  ToggleButton,
} from 'react-bootstrap';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './CustomMapForm.module.css';
import {
  type CustomMapTechnology,
  CustomMapTypeField,
} from './CustomMapTypeField.js';

/**
 * A new map's starting point: what carries over when the Type switches between
 * a layer and a combination, or a shading map saved from the shading panel.
 */
export type CustomMapStart = {
  name: string;
  iconSpec?: string;
  technology?: CustomMapTechnology;
  shading?: Shading;
};

type Props = {
  type: string;
  value?: CustomLayerDef;
  /** A new map's starting point; ignored when `value` is given. */
  start?: CustomMapStart;
  onChange: (value?: CustomLayerDef) => void;
  onPickCombination: (start: CustomMapStart) => void;
};

type Model = {
  name: string;
  category: CategoryGroup;
  iconSpec?: string;
  url: string;
  minZoom: string;
  maxNativeZoom: string;
  layer: 'base' | 'overlay';
  /** Kept as stored, not edited: the map's default place in the stack. */
  zIndex?: number;
  scaleWithDpi: boolean;
  extraScales: string[];
  technology: CustomMapTechnology;
  layers: string[];
  tiled: boolean;
  /** Read from the capabilities rather than typed, so it has no field. */
  bbox?: [number, number, number, number];
  /** A shading map's own, edited in the shading panel rather than here. */
  shading?: Shading;
  color: Color;
};

const WHITE: Color = [255, 255, 255, 1];

/** A colour has none, and a shading map takes the shading source's. */
const usesUrl = (model: Model) =>
  model.technology !== 'color' && model.technology !== 'parametricShading';

/** Ground resolution of zoom 0 at the equator, in metres per pixel. */
const ZOOM_0_RESOLUTION = 156543.03392804097;

/** The pixel size a WMS scale denominator is defined against, in metres. */
const WMS_PIXEL_SIZE = 0.00028;

const URL_RE = /^https?:\/\/\w+/;

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

function valueToModel(value?: CustomLayerDef): Model {
  return {
    url: value && 'url' in value ? value.url : '',
    shading:
      value?.technology === 'parametricShading' ? value.shading : undefined,
    color: value?.technology === 'color' ? value.color : WHITE,
    name: value?.name ?? '',
    category: categoryGroup(value?.category),
    iconSpec: value?.iconSpec,
    minZoom: value?.minZoom === undefined ? '' : value.minZoom.toString(),
    maxNativeZoom:
      value && 'maxNativeZoom' in value && value.maxNativeZoom !== undefined
        ? value.maxNativeZoom.toString()
        : '',
    layer: value?.layer ?? 'base',
    zIndex: value && 'zIndex' in value ? value.zIndex : undefined,
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

export function CustomMapForm({
  type,
  value,
  start,
  onChange,
  onPickCombination,
}: Props): ReactElement {
  const sharedShading = useAppSelector((state) => state.map.shading);

  const shadingSource = useAppSelector(shadingSourceSelector);

  const [model, setModel] = useState<Model>(() => {
    const model = valueToModel(value);

    if (value || !start) {
      return model;
    }

    const technology = start.technology ?? model.technology;

    return {
      ...model,
      name: start.name,
      iconSpec: start.iconSpec,
      technology,
      // An overlay, like the shared shading it starts from.
      ...(technology === 'parametricShading' && {
        shading: start.shading ?? sharedShading,
        layer: 'overlay' as const,
        category: 'elevation' as const,
      }),
    };
  });

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

  const handleIconSelect = (iconSpec: string | undefined) => {
    setModelWithVersion((model) => ({ ...model, iconSpec }));
  };

  useEffect(() => {
    if (!value || externalVersion.current < localVersion.current) {
      return;
    }

    const newModel = valueToModel(value);

    setModel((model) => {
      const changed =
        model.name !== newModel.name ||
        model.category !== newModel.category ||
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
        model.layer !== newModel.layer ||
        model.color.join(',') !== newModel.color.join(',');

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

    if (usesUrl(model) && !model.url) {
      onChange(undefined);

      return;
    }

    const common = {
      type,
      name: model.name,
      category: model.category === 'other' ? undefined : model.category,
      iconSpec: model.iconSpec,
      layer: model.layer,
      zIndex: model.zIndex,
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
      case 'parametricShading': {
        onChange({
          ...common,
          technology: 'parametricShading',
          shading: model.shading,
          source: SHADING_SOURCE,
          url: shadingSource && 'url' in shadingSource ? shadingSource.url : '',
        });

        break;
      }
      case 'color':
        onChange({
          ...common,
          technology: 'color',
          color: model.color,
        });

        break;
    }
  }, [type, model, onChange, shadingSource]);

  const m = useMessages();

  const msm = useMapSettingsMessages();

  const [wmsLayersFetchError, setWmsLayersFetchError] = useState<string>();

  const [layersTree, setLayersTree] = useState<Layer[]>();

  const lat = useAppSelector((state) => state.map.lat);

  /** Whether Min Zoom is the user's to keep rather than the form's to fill. */
  const minZoomTouched = useRef(model.minZoom !== '');

  const handleMinZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    minZoomTouched.current = true;

    handlers.minZoom(e);
  };

  const [loadingLayers, setLoadingLayers] = useState(false);

  // Only what has been typed can be wrong; the field opens empty for a new map.
  const invalidUrl = model.url !== '' && !URL_RE.test(model.url);

  const handleLoadLayersClick = () => {
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
  };

  const handleLayerSelect = (name: string | null) => {
    if (name === null) {
      return;
    }

    setModel((model) => {
      let found = false;

      const next = model.layers.filter((n) => {
        if (n === name) {
          found = true;
        }

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
  };

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
                      if (a === id) {
                        found = true;
                      }

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

  const layerField = (
    <div className="d-flex gap-3 mt-3">
      <Form.Group>
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
              onChange={() =>
                setModelWithVersion((model) => ({
                  ...model,
                  layer,
                  // Nothing is beneath a base map to show through its colour.
                  color:
                    layer === 'base'
                      ? [model.color[0], model.color[1], model.color[2], 1]
                      : model.color,
                }))
              }
            >
              {m?.mapLayers.layer[layer]}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Form.Group>
    </div>
  );

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
            placeholder={CUSTOM_MAP_ICONS[model.technology]}
          />
        </Form.Group>
      </div>

      <CustomMapTypeField
        value={model.technology}
        editing={Boolean(value)}
        onChange={(kind) => {
          if (kind === 'combination') {
            onPickCombination({ name: model.name, iconSpec: model.iconSpec });
          } else {
            setModelWithVersion((model) => ({
              ...model,
              technology: kind,
              ...(kind === 'parametricShading' && {
                shading: model.shading ?? sharedShading,
                category:
                  model.category === 'other' ? 'elevation' : model.category,
              }),
            }));
          }
        }}
      />

      {model.technology === 'parametricShading' && (
        <Form.Text className="d-block mt-3">{msm?.shadingMapHint}</Form.Text>
      )}

      <Form.Group controlId="category" className="mt-3">
        <Form.Label>{msm?.filters.category}</Form.Label>

        <Form.Select
          value={model.category}
          onChange={(e) =>
            setModelWithVersion((model) => ({
              ...model,
              category: e.currentTarget.value as CategoryGroup,
            }))
          }
        >
          {CATEGORY_GROUPS.map((category) => (
            <option key={category} value={category}>
              {msm?.filters[category]}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* First for a colour, as it decides whether the colour takes alpha. */}
      {model.technology === 'color' && layerField}

      {model.technology === 'color' && (
        <Form.Group className="mt-3">
          <Form.Label className="d-block">
            {m?.mapLayers.technologies.color}
          </Form.Label>

          <RgbaColorPicker
            alpha={model.layer === 'overlay'}
            value={colorToHexa(model.color)}
            onChange={(color) =>
              setModelWithVersion((model) => ({
                ...model,
                color: hexaToColor(color),
              }))
            }
          />
        </Form.Group>
      )}

      {usesUrl(model) && (
        <Form.Group controlId="url" className="mt-3">
          <Form.Label className="required">{m?.mapLayers.url}</Form.Label>

          <Form.Control
            className={classes.gridSpan}
            type="text"
            value={model.url}
            isInvalid={invalidUrl}
            onChange={handlers.url}
          />

          <Form.Control.Feedback type="invalid">
            {m?.general.invalidUrl}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {model.technology === 'wms' && (
        <>
          <Button
            className={clsx('mt-3', classes.gridSpan)}
            onClick={handleLoadLayersClick}
            disabled={!URL_RE.test(model.url) || loadingLayers}
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
      {usesUrl(model) && (
        <>
          {/* Halves rather than two natural widths: the labels differ in
              length, so natural ones leave a gap after the shorter field.
              End-aligned, since the longer label wraps to two lines. */}
          <Row className="align-items-end gx-3">
            <Col xs={12} sm={6}>
              <Form.Group controlId="minZoom" className="mt-3">
                <Form.Label>{m?.mapLayers.minZoom}</Form.Label>

                <Form.Control
                  type="number"
                  min={0}
                  value={model.minZoom}
                  onChange={handleMinZoomChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group controlId="maxNativeZoom" className="mt-3">
                <Form.Label>{m?.mapLayers.maxNativeZoom}</Form.Label>

                <Form.Control
                  type="number"
                  min={0}
                  value={model.maxNativeZoom}
                  onChange={handlers.maxNativeZoom}
                />
              </Form.Group>
            </Col>
          </Row>

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

          {/* A WMS is always asked for the display's own density, and shading
              always follows it. */}
          {model.technology !== 'wms' &&
            model.technology !== 'parametricShading' && (
              <Form.Check
                className="mt-3"
                id="chk-scale-dpi"
                label={m?.mapLayers.scaleWithDpi}
                checked={model.scaleWithDpi}
                onChange={handlers.scaleWithDpi}
              />
            )}

          {model.technology === 'wms' && (
            <div className="mt-3 d-flex">
              <Form.Check
                id="chk-tiled"
                label={m?.mapLayers.tiled}
                checked={model.tiled}
                onChange={handlers.tiled}
              />

              <HintMark hint={m?.mapLayers.tiledHelp} />
            </div>
          )}
        </>
      )}

      {model.technology !== 'color' && layerField}
    </div>
  );
}
