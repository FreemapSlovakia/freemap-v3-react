import {
  ColorSchema,
  type Shading,
  ShadingSchema,
} from '@features/parameterizedShading/model/Shading.js';
import z from 'zod';

/**
 * How a map is drawn: one per map, remembered for the account whether the map
 * is on or off. A preset or a link loads into it; nothing is resolved from
 * anywhere else. An absent field is the map's own default.
 */
export const LayerSetupSchema = z.object({
  /** Where the map lets it be switched; see `canSwitchKind`. */
  kind: z.enum(['base', 'overlay']).optional(),
  /** A base map's lets the map background show through. */
  opacity: z.number().optional(),
  /** A WMS map's layers, in request order (the first drawn lowest). */
  wmsLayers: z.array(z.string()).optional(),
  /** The parametric shading map's. */
  shading: ShadingSchema.optional(),
  /** The solid colour map's. */
  color: ColorSchema.optional(),
});

export type LayerSetup = z.infer<typeof LayerSetupSchema>;

/** Drops invalid entries rather than failing the whole settings object. */
export const LayerSetupsCompatSchema = z
  .record(z.string(), z.unknown())
  .transform((entries) =>
    Object.fromEntries(
      Object.entries(entries).flatMap(([type, setup]) => {
        const ok = LayerSetupSchema.safeParse(setup);

        return ok.success ? [[type, ok.data]] : [];
      }),
    ),
  );

/** A map's own setup by its id; a preset's copy by the preset's item and the id. */
export const setupKey = ({
  type,
  preset,
}: {
  type: string;
  preset?: string;
}) => (preset === undefined ? type : `@${preset}/${type}`);

/** As `gdaldem hillshade` draws it: 315°, 45°, z 1, grey over black. */
export const DEFAULT_SHADING: Shading = {
  backgroundColor: [0x00, 0x00, 0x00, 1],
  components: [
    {
      id: 1,
      type: 'hillshade-classic',
      elevation: 45 * (Math.PI / 180),
      azimuth: 315 * (Math.PI / 180),
      brightness: 0,
      contrast: 1,
      colorStops: [{ value: 0, color: [0xff, 0xff, 0xff, 1] }],
      exaggeration: 1,
    },
  ],
};

/** A WMS map with the layers its setup ticks, as it is drawn. */
export const withTickedLayers = <T extends { type: string; layers: string[] }>(
  def: T,
  layerSetups: Readonly<Record<string, LayerSetup>>,
): T => {
  const ticked = layerSetups[def.type]?.wmsLayers;

  return ticked ? { ...def, layers: ticked } : def;
};

/** Whether maps of this technology have WMS layers, shading or a colour to set. */
export const hasOwnConfig = (technology: string | undefined): boolean =>
  technology === 'wms' ||
  technology === 'parametricShading' ||
  technology === 'color';

/**
 * What is the map's own wherever it is drawn: in every preset holding it as
 * on its own. Each key is present, an unset one undefined, so it overrides.
 */
export const configOf = (setup: LayerSetup | undefined): LayerSetup => ({
  wmsLayers: setup?.wmsLayers,
  shading: setup?.shading,
  color: setup?.color,
});

/** What each drawing of a map has of its own: a preset's copy, or the map on its own. */
export const usageOf = (setup: LayerSetup | undefined): LayerSetup => ({
  kind: setup?.kind,
  opacity: setup?.opacity,
});

/** A preset copy as drawn: the map's own shading and layers, the copy's opacity and kind. */
export const copySetup = (
  own: LayerSetup | undefined,
  copy: LayerSetup,
): LayerSetup => ({ ...configOf(own), ...copy });

/** Without the fields left undefined. */
export const compactSetup = (setup: LayerSetup): LayerSetup =>
  Object.fromEntries(
    Object.entries(setup).filter(([, v]) => v !== undefined),
  ) as LayerSetup;

/** A map's own setup taking a loaded config, keeping its own opacity and kind. */
export const withLoadedConfig = (
  own: LayerSetup | undefined,
  loaded: LayerSetup | undefined,
): LayerSetup => compactSetup({ ...usageOf(own), ...configOf(loaded) });

/**
 * The configs of maps held only by presets, as a link or document carries
 * them: their copies hold the rest.
 */
export const presetOnlyConfigs = (
  presets: readonly { layers: readonly { type: string }[] }[],
  drawn: readonly string[],
  layerSetups: Readonly<Record<string, LayerSetup>>,
): [string, LayerSetup][] =>
  [...new Set(presets.flatMap((preset) => preset.layers.map((l) => l.type)))]
    .filter((type) => !drawn.includes(type))
    .flatMap((type) => {
      const config = compactSetup(configOf(layerSetups[type]));

      return isEmptySetup(config) ? [] : [[type, config]];
    });

/** Whether it says anything at all; an empty one is left out of links and saves. */
export const isEmptySetup = (setup: LayerSetup | undefined): boolean =>
  !setup || Object.values(setup).every((value) => value === undefined);
